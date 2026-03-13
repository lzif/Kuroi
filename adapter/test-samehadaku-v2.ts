import { SamehadakuV2Adapter } from "./SamehadakuV2Adapter";

async function runTest() {
  const adapter = new SamehadakuV2Adapter();
  
  console.log("--- Testing Full List (Text Mode) ---");
  try {
    const list = await adapter.scrapeFullList();
    console.log(`✅ Found ${list.length} anime in full list.`);
    console.log("Sample (first 1):", JSON.stringify(list.slice(0, 1), null, 2));

    console.log("\n--- Testing Ongoing (Homepage) ---");
    const ongoing = await adapter.scrapeOngoing();
    console.log(`✅ Found ${ongoing.length} ongoing anime.`);
    console.log("Sample (first 1):", JSON.stringify(ongoing.slice(0, 1), null, 2));

    if (ongoing.length > 0) {
      const testAnime = ongoing[0];
      console.log(`\n--- Testing Anime Detail for: ${testAnime.title} ---`);
      console.log(`URL: ${testAnime.url}`);
      
      const detail = await adapter.scrapeAnimeDetail(testAnime.url);
      
      console.log("✅ Detail Scraped Successfully:");
      console.log(`Title: ${detail.title}`);
      console.log(`Japanese: ${detail.japanese}`);
      console.log(`Synonyms: ${detail.synonyms}`);
      console.log(`Score: ${detail.score}`);
      console.log(`Genres: ${detail.genres.join(", ")}`);
      console.log(`Synopsis: ${detail.synopsis.substring(0, 150)}...`);
      console.log(`Total Episodes Found: ${detail.episodes.length}`);
      
      if (detail.episodes.length > 0) {
        console.log("Latest Episode Sample:", JSON.stringify(detail.episodes[0], null, 2));
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTest();
