import { execSync } from "child_process";
import fs from "fs";
import { SamehadakuV2Adapter } from "../adapter/SamehadakuV2Adapter";
import { createAniListClient } from "../src/lib/server/scraper/anilist";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to escape SQL strings
const escapeSql = (str: string | null | undefined) => {
  if (str === null || str === undefined) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
};

async function runSeed() {
  console.log("🌱 Starting External Seeder Script...");

  const adapter = new SamehadakuV2Adapter();
  // Pass undefined to bypass D1 cache and hit the API directly
  const anilistClient = createAniListClient();

  const sqlStatements: string[] = [];

  try {
    // 1. Scrape Homepage Ongoing List (or loop through pages for a deeper seed)
    console.log(`\nScraping ongoing anime from ${adapter.name}...`);
    // For a bigger seed, you could loop: for (let page = 1; page <= 5; page++)
    const ongoingList = await adapter.scrapeOngoing(1);
    console.log(`Found ${ongoingList.length} items to process.`);

    for (let i = 0; i < ongoingList.length; i++) {
      const item = ongoingList[i];
      console.log(`\n[${i + 1}/${ongoingList.length}] Processing: ${item.title}`);

      // Respect AniList Rate Limits
      await sleep(800);

      const anilistId = await anilistClient.getAnimeIdByTitle(item.title);
      if (anilistId) {
        console.log(`✅ AniList Match: ${anilistId}`);
      } else {
        console.log(`⚠️ No AniList Match`);
      }

      // Generate ID and Slug based on URL
      let slug = item.url.replace(adapter.baseUrl, '').replace(/^\/anime\//, '').replace(/^\//, '').replace(/\/$/, '');
      const epMatch = slug.match(/(.*?)-episode-\d+/);
      if (epMatch) slug = epMatch[1];
      const id = `${adapter.name.toLowerCase()}:${slug}`;

      // Convert score to number or NULL
      const score = item.score ? parseFloat(item.score) : "NULL";

      // Create the SQL statement
      const sql = `
        INSERT INTO anime (id, slug, title, anilist_id, cover_image, status, source)
        VALUES (
          ${escapeSql(id)},
          ${escapeSql(slug)},
          ${escapeSql(item.title)},
          ${anilistId || "NULL"},
          ${escapeSql(item.image)},
          ${escapeSql(item.status)},
          ${escapeSql(adapter.name)}
        )
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          cover_image = excluded.cover_image,
          status = excluded.status,
          updated_at = datetime('now');
      `;
      sqlStatements.push(sql);
    }

    // 2. Write SQL to file
    const sqlFile = "seed.sql";
    console.log(`\nWriting ${sqlStatements.length} statements to ${sqlFile}...`);
    fs.writeFileSync(sqlFile, sqlStatements.join("\n"));

    // 3. Execute via Wrangler
    console.log(`\nExecuting SQL against D1 (Local)...`);
    console.log(`(If you want to seed production, run: npx wrangler d1 execute kuroi-db --file=seed.sql --remote)`);
    
    try {
      execSync(`npx wrangler d1 execute kuroi-db --local --file=${sqlFile}`, { stdio: "inherit" });
      console.log("\n✅ Seeding complete!");
    } catch (e) {
      console.error("\n❌ Wrangler failed to execute. Is the D1 emulator running, or is Wrangler installed?");
    }

  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
  }
}

runSeed();