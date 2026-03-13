import { NimegamiScraper } from './sites/nimegami';
import { SamehadakuScraper } from './sites/samehadaku';
import { OtakudesuScraper } from './sites/otakudesu';
import { NontonAnimeIDScraper } from './sites/nontonanimeid';
import { ScraperManager } from './manager';
import { CachedScraperManager } from './cached-manager';
import { D1Cache } from './d1';
import { AniListClient, createAniListClient, sanitizeTitleForAniList } from './anilist';

export { D1Cache, CachedScraperManager, AniListClient, createAniListClient, sanitizeTitleForAniList };

const nimegami = new NimegamiScraper();
const samehadaku = new SamehadakuScraper();
const otakudesu = new OtakudesuScraper();
const nontonanimeid = new NontonAnimeIDScraper();

const scrapers = [nimegami, samehadaku, otakudesu, nontonanimeid];

// Priority: Nimegami -> Samehadaku -> Otakudesu -> NontonAnimeID
export const scraperManager = new ScraperManager(scrapers);

// Factory for creating cached manager with D1
export function createCachedScraperManager(db?: D1Database): CachedScraperManager {
  return new CachedScraperManager(scrapers, db);
}

