import { SamehadakuV2Adapter } from "./src/lib/server/SamehadakuV2Adapter.js";

const adapter = new SamehadakuV2Adapter();
adapter.scrapeOngoing(1).then(console.log).catch(console.error);
