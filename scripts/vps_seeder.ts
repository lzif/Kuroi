import { Database } from "bun:sqlite";
import { randomInt } from "crypto";
import { providers, getProviderByName } from "../adapter";
import { createAniListClient } from "../src/lib/server/scraper/anilist";
import type { AnimeData } from "../src/lib/server/scraper/types";

// ⚠️ Ensure this matches your Cloudflare / Local instance URL
const INGESTION_API_URL = process.env.INGESTION_API_URL || "https://kuroi.pages.dev/api/internal/seed"; 
const INGEST_SECRET = process.env.INGEST_SECRET;

if (!INGEST_SECRET) {
    console.error("❌ ERROR: INGEST_SECRET environment variable is required.");
    console.error("Run the script like this:");
    console.error("INGEST_SECRET=your_secret_key bun run scripts/vps_seeder.ts");
    process.exit(1);
}

// 1. Initialize Local State Tracking (bun:sqlite)
const db = new Database("kuroi_seeder.sqlite", { create: true });
db.run(`
  CREATE TABLE IF NOT EXISTS queue (
    url TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' -- PENDING, DONE, ERROR
  )
`);

const insertQueue = db.prepare("INSERT OR IGNORE INTO queue (url, title, provider) VALUES ($url, $title, $provider)");
const getRandomPending = db.prepare("SELECT * FROM queue WHERE status = 'PENDING' ORDER BY RANDOM() LIMIT 1");
const updateStatus = db.prepare("UPDATE queue SET status = $status WHERE url = $url");

const anilistClient = createAniListClient(); // Direct API hitting, no D1

async function populateQueue() {
    console.log("[System] Fetching Full Lists from all providers to populate queue...");
    
    for (const provider of providers) {
        try {
            console.log(`[System] Fetching from ${provider.name}...`);
            const fullList = await provider.scrapeFullList();
            console.log(`[System] Found ${fullList.length} items from ${provider.name}. Injecting into local SQLite queue...`);
            
            db.transaction(() => {
                for (const item of fullList) {
                    insertQueue.run({ $url: item.url, $title: item.title, $provider: provider.name });
                }
            })();
        } catch (e) {
            console.error(`[System] Failed to populate queue for ${provider.name}. Retrying later.`, e);
        }
    }
    
    const count = db.query("SELECT COUNT(*) as count FROM queue WHERE status = 'PENDING'").get() as { count: number };
    console.log(`[System] Queue populated. ${count.count} pending items remaining.`);
}

async function cryptoSleep() {
    // 🛡️ EVASION PROTOCOL
    // For this local test script, we use a 5-10 second sleep.
    // WARNING: FOR A REAL VPS SEEDING 600+ ITEMS, CHANGE THIS TO 2-5 MINUTES!
    // const delay = randomInt(2 * 60 * 1000, 5 * 60 * 1000); 
    const delay = randomInt(5 * 1000, 10 * 1000); 
    console.log(`[Evasion] Sleeping for ${(delay / 1000).toFixed(1)} seconds...`);
    await Bun.sleep(delay);
}

async function processQueue() {
    console.log("[System] Booting Stealth Seeder Engine...");

    while (true) {
        const target = getRandomPending.get() as { url: string, title: string, provider: string } | null;

        if (!target) {
            console.log("[System] Queue empty! All items processed. Re-fetching list...");
            await populateQueue();
            const checkAgain = getRandomPending.get();
            if (!checkAgain) {
                 console.log("[System] Queue still empty. Exiting.");
                 break;
            } else {
                 continue;
            }
        }

        console.log(`\n[Action] Targeting: [${target.provider}] ${target.title}`);
        
        const adapter = getProviderByName(target.provider);
        if (!adapter) {
            console.error(`[Error] Provider ${target.provider} not found in registry.`);
            updateStatus.run({ $status: 'ERROR', $url: target.url });
            continue;
        }

        try {
            // STEP A & B: Scrape Detail Page
            console.log("  -> Scraping detail page...");
            const detail = await adapter.scrapeAnimeDetail(target.url);

            // STEP C: Hydrate via AniList API
            console.log("  -> Resolving AniList metadata...");
            const anilistId = await anilistClient.getAnimeIdByTitle(detail.title) ?? undefined;
            let anilistMetadata = undefined;

            if (anilistId) {
                console.log(`  -> ✅ Match found: ID ${anilistId}`);
                anilistMetadata = await anilistClient.getMetadata(anilistId) ?? undefined;
            } else {
                console.log("  -> ⚠️ No AniList match found.");
            }

            // Clean Slug & Generate ID
            let slug = detail.url.replace(adapter.baseUrl, '').replace(/^\/anime\//, '').replace(/^\//, '').replace(/\/$/, '');
            const epMatch = slug.match(/(.*?)-episode-\d+/);
            if (epMatch) slug = epMatch[1];
            const id = `${adapter.name.toLowerCase()}:${slug}`;

            const animeData: AnimeData = {
                id,
                slug,
                title: detail.title,
                anilistId,
                japaneseTitle: detail.japanese,
                synonyms: detail.synonyms,
                alternativeTitles: [],
                synopsis: detail.synopsis,
                coverImage: detail.image || '',
                genres: detail.genres,
                status: detail.status || 'unknown',
                type: detail.type || 'unknown',
                totalEpisodes: detail.episodes.length,
                score: detail.score ? parseFloat(detail.score) : undefined,
                postedBy: detail.postedBy,
                releasedOn: detail.releasedOn,
                source: adapter.name
            };

            // STEP D: Push to Kuroi SvelteKit Ingestion API
            console.log("  -> Pushing payload to D1 Edge...");
            const response = await fetch(INGESTION_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${INGEST_SECRET}`
                },
                body: JSON.stringify({ animeData, anilistMetadata })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ingestion API returned ${response.status}: ${errText}`);
            }

            // Mark as DONE in local state
            updateStatus.run({ $status: 'DONE', $url: target.url });
            console.log(`[Success] Edge sync complete! Marked as DONE.`);

        } catch (err: any) {
            console.error(`[Error] Failed to process ${target.title}:`, err.message);
            // Mark as ERROR so we can retry or ignore later
            updateStatus.run({ $status: 'ERROR', $url: target.url });
        }

        await cryptoSleep();
    }
}

async function run() {
    await populateQueue();
    await processQueue();
}

run();