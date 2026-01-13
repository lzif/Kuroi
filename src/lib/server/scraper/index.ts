import { NimegamiScraper } from './sites/nimegami';
import { SamehadakuScraper } from './sites/samehadaku';
import { OtakudesuScraper } from './sites/otakudesu';
import { ScraperManager } from './manager';

const nimegami = new NimegamiScraper();
const samehadaku = new SamehadakuScraper();
const otakudesu = new OtakudesuScraper();

// Priority: Nimegami -> Samehadaku -> Otakudesu
export const scraperManager = new ScraperManager([nimegami, samehadaku, otakudesu]);

