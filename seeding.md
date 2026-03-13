Architecture: Kuroi Unified Metadata & Seeding Engine
🎯 Objective
To safely migrate, hydrate, and synchronize thousands of legacy anime entries from target scraper sites into Cloudflare D1 without triggering Web Application Firewalls (WAF), rate limits (Cloudflare/AniList), or Worker timeouts.
🏗️ Core Strategy
 * Separation of Concerns: Use Cloudflare D1 for blazing-fast edge reads, and a standalone Pterodactyl VPS (Bun) for heavy, stateful scraping.
 * Evasion Tactics: Utilize randomized traversal (ORDER BY RANDOM()), cryptographically secure delays (crypto.randomInt), and UA rotation. No bloated NPM proxy libraries.
 * State Management: Strictly use bun:sqlite for ACID-compliant local state tracking. JSON files are prohibited to prevent corruption during unexpected process terminations.
 * Single Source of Truth (SSOT): Map all dirty scraper slugs to clean AniList IDs for unified frontend rendering.
Phase 1: Cloudflare D1 Schema (The SSOT)
Separate the clean metadata (AniList) from the dirty source mapping (Scrapers).
-- Clean AniList Metadata
CREATE TABLE IF NOT EXISTS anilist_metadata (
    id INTEGER PRIMARY KEY,
    romaji_title TEXT NOT NULL,
    cover_image TEXT,
    description TEXT,
    genres TEXT, -- Stored as JSON string
    last_updated INTEGER
);

-- Dirty Scraper Mapping
CREATE TABLE IF NOT EXISTS scraper_sources (
    slug TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    anilist_id INTEGER,
    latest_episode TEXT,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (anilist_id) REFERENCES anilist_metadata(id)
);

Phase 2: SvelteKit Ingestion API (The Backdoor)
A secure endpoint in the Kuroi SvelteKit app (src/routes/api/internal/seed/+server.ts) to receive hydrated data from the VPS seeder.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const INGEST_SECRET = process.env.SEEDER_SECRET_KEY; 

export const POST: RequestHandler = async ({ request, platform }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${INGEST_SECRET}`) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const db = platform?.env.D1;

    try {
        // 1. Insert/Update Clean Metadata
        await db.prepare(`
            INSERT OR IGNORE INTO anilist_metadata (id, romaji_title, cover_image, description, genres, last_updated)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(data.anilistId, data.title, data.cover, data.desc, JSON.stringify(data.genres), Date.now()).run();

        // 2. Insert/Update Source Mapping
        await db.prepare(`
            INSERT OR REPLACE INTO scraper_sources (slug, source_name, raw_title, anilist_id, is_synced)
            VALUES (?, ?, ?, ?, 1)
        `).bind(data.slug, data.source, data.rawTitle, data.anilistId).run();

        return json({ success: true, slug: data.slug });
    } catch (err: any) {
        return json({ error: err.message }, { status: 500 });
    }
};

Phase 3: The Stealth Seeder (Pterodactyl VPS)
This script runs 24/7 on the VPS. It randomly selects a pending anime, scrapes it, hydrates it via AniList, pushes it to D1, and sleeps.
import { Database } from "bun:sqlite";
import { randomInt } from "crypto";

// 1. Initialize Local State Tracking (bun:sqlite)
const db = new Database("kuroi_seeder.sqlite", { create: true });
db.run(`
  CREATE TABLE IF NOT EXISTS queue (
    slug TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' -- PENDING, DONE, ERROR
  )
`);

const getRandomPending = db.query("SELECT * FROM queue WHERE status = 'PENDING' ORDER BY RANDOM() LIMIT 1");
const updateStatus = db.query("UPDATE queue SET status = $status WHERE slug = $slug");

// 2. Evasion Protocol: User-Agents & Crypto Sleep
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
];

async function cryptoSleep() {
    const delay = randomInt(2 * 60 * 1000, 10 * 60 * 1000); // Random: 2 to 10 minutes
    console.log(`[Evasion] Sleeping for ${(delay / 60000).toFixed(2)} minutes...`);
    await Bun.sleep(delay);
}

// 3. Execution Engine
async function runRandomSeeder() {
    console.log("[System] Booting Stealth Seeder...");

    while (true) {
        const target = getRandomPending.get() as { slug: string, url: string } | null;

        if (!target) {
            console.log("[System] Queue empty. Seeding complete.");
            break;
        }

        console.log(`\n[Action] Targeting: ${target.slug}`);

        try {
            // STEP A: Fetch Target Source (with random UA)
            // STEP B: Extract DOM via Cheerio
            // STEP C: Hydrate via AniList API
            // STEP D: Push to Kuroi API (fetch POST to /api/internal/seed)
            
            // Mark as DONE in local SQLite to prevent double-scraping
            updateStatus.run({ $status: 'DONE', $slug: target.slug });
            console.log(`[Success] Pushed to D1: ${target.slug}`);

        } catch (err) {
            console.error(`[Error] Failed to process ${target.slug}:`, err);
            updateStatus.run({ $status: 'ERROR', $slug: target.slug });
        }

        await cryptoSleep();
    }
}

runRandomSeeder();

Phase 4: Post-Seeding Maintenance (Cloudflare Micro-Cron)
Once the massive local SQLite queue is cleared (DONE), the VPS script is retired. Day-to-day operations shift back to Cloudflare.
 * Trigger: A Cloudflare Worker Cron runs every 15 minutes.
 * Action: Scrapes only the homepage/latest updates of the target sites.
 * Logic: Compares incoming slugs with the D1 database. If a new episode is detected, it triggers the AniList hydration pipeline strictly for that specific entry.
