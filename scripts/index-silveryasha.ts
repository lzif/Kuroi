import { SilveryashaIndexer } from "../adapter/SilveryashaIndexer";

const START_YEAR = 2026;
const START_SEASON = "winter";
const DB_PATH = "kuroi_seeder.sqlite";

async function main() {
  console.log("🚀 Starting Master Indexer: Silveryasha");
  console.log(`📍 Initial Target: ${START_YEAR} ${START_SEASON}`);
  console.log(`🗄️ Database: ${DB_PATH}`);

  const indexer = new SilveryashaIndexer();
  
  try {
    await indexer.runIndexer(START_YEAR, START_SEASON, DB_PATH);
    console.log("\n✅ Master Indexing Complete!");
  } catch (error) {
    console.error("\n❌ Master Indexing Failed:", error);
    process.exit(1);
  }
}

main();
