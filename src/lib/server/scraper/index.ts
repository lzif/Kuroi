import { NimegamiScraper } from './sites/nimegami';
import { SamehadakuScraper } from './sites/samehadaku';
import { OtakudesuScraper } from './sites/otakudesu';
import { NontonAnimeIDScraper } from './sites/nontonanimeid';
import { ScraperManager } from './manager';

const nimegami = new NimegamiScraper();
const samehadaku = new SamehadakuScraper();
const otakudesu = new OtakudesuScraper();
const nontonanimeid = new NontonAnimeIDScraper();

// Priority: Nimegami -> Samehadaku -> Otakudesu -> NontonAnimeID
export const scraperManager = new ScraperManager([nimegami, samehadaku, otakudesu, nontonanimeid]);

