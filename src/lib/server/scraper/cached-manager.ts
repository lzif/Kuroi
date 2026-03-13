import type { Scraper, AnimeListItem, SearchResult, AnimeData, EpisodeData } from './types';
import { D1Cache } from './d1';
import { AniListClient } from './anilist';

export class CachedScraperManager {
  private scrapers: Scraper[];
  private cache: D1Cache | null = null;
  private anilistClient: AniListClient | null = null;

  constructor(scrapers: Scraper[], db?: D1Database) {
    this.scrapers = scrapers;
    if (db) {
      this.cache = new D1Cache(db);
      this.anilistClient = new AniListClient(db);
    }
  }

  private async executeWithFallback<T>(
    action: (scraper: Scraper) => Promise<T>,
    methodName: string
  ): Promise<T> {
    const errors: Error[] = [];

    for (const scraper of this.scrapers) {
      try {
        console.log(`[Manager] Trying ${scraper.name} for ${methodName}`);
        return await action(scraper);
      } catch (err: any) {
        console.warn(`[Manager] ${scraper.name} failed for ${methodName}: ${err.message}`);
        errors.push(err);
      }
    }

    throw new Error(`All scrapers failed for ${methodName}. Errors: ${errors.map(e => e.message).join(', ')}`);
  }

  async getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }> {
    const result = await this.executeWithFallback(s => s.getHome(), 'getHome');
    
    // Asynchronously resolve AniList IDs without blocking
    if (this.anilistClient) {
      const resolveIds = async (list: AnimeListItem[]) => {
        for (const item of list) {
          if (!item.anilistId) {
            item.anilistId = await this.anilistClient!.getAnimeIdByTitle(item.title) ?? undefined;
          }
        }
      };
      
      // We don't await this to keep the homepage fast, it'll warm the cache for later
      Promise.all([
        resolveIds(result.ongoing),
        resolveIds(result.completed)
      ]).catch(e => console.error("Background AniList resolution failed", e));
    }
    
    return result;
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.getSearchCache(query, 'all');
      if (cached) {
        console.log(`[Cache] Hit for search: ${query}`);
        return cached;
      }
    }

    const result = await this.executeWithFallback(s => s.search(query, page), 'search');

    if (this.anilistClient) {
      for (const item of result.results) {
         item.anilistId = await this.anilistClient.getAnimeIdByTitle(item.title) ?? undefined;
      }
    }

    // Save to cache
    if (this.cache && page === 1) {
      await this.cache.saveSearchCache(query, 'all', result);
    }

    return result;
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    return this.executeWithFallback(s => s.getOngoing(page), 'getOngoing');
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
    return this.executeWithFallback(s => s.getCompleted(page), 'getCompleted');
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    // Parse source-prefixed slug
    const parts = slug.split(':');
    let source: string | undefined;
    let realSlug = slug;

    if (parts.length > 1) {
      source = parts[0].toLowerCase();
      realSlug = parts.slice(1).join(':');
    }

    // Try cache first
    if (this.cache && source) {
      const cached = await this.cache.getAnime(realSlug, source);
      if (cached) {
        console.log(`[Cache] Hit for anime: ${slug}`);
        // If cached but missing anilistId, try to resolve and update it
        if (!cached.anilistId && this.anilistClient) {
          cached.anilistId = await this.anilistClient.getAnimeIdByTitle(cached.title) ?? undefined;
          if (cached.anilistId) {
             await this.cache.saveAnime(cached);
          }
        }
        return cached;
      }
    }

    // Find appropriate scraper
    let scraper: Scraper | undefined;
    if (source) {
      scraper = this.scrapers.find(s => s.name.toLowerCase() === source);
    }

    let result: AnimeData;
    if (scraper) {
      result = await scraper.getAnimeDetail(realSlug);
    } else {
      result = await this.executeWithFallback(s => s.getAnimeDetail(slug), `getAnimeDetail(${slug})`);
    }

    // Resolve AniList ID
    if (this.anilistClient && !result.anilistId) {
      result.anilistId = await this.anilistClient.getAnimeIdByTitle(result.title) ?? undefined;
    }

    // Save to cache
    if (this.cache) {
      await this.cache.saveAnime(result);
    }

    return result;
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    // Parse source-prefixed slug
    const parts = slug.split(':');
    let source: string | undefined;
    let realSlug = slug;

    if (parts.length > 1) {
      source = parts[0].toLowerCase();
      realSlug = parts.slice(1).join(':');
    }

    // Build anime ID from slug
    const animeId = source ? `${source}:${realSlug}` : slug;

    // Try cache first
    if (this.cache) {
      const cached = await this.cache.getEpisode(animeId, episodeNumber);
      if (cached && cached.streamLinks.length > 0) {
        console.log(`[Cache] Hit for episode: ${slug} ep ${episodeNumber}`);
        return cached;
      }
    }

    // Find appropriate scraper
    let scraper: Scraper | undefined;
    if (source) {
      scraper = this.scrapers.find(s => s.name.toLowerCase() === source);
    }

    let result: EpisodeData;
    if (scraper) {
      result = await scraper.getWatch(realSlug, episodeNumber);
    } else {
      result = await this.executeWithFallback(s => s.getWatch(slug, episodeNumber), `getWatch(${slug}, ${episodeNumber})`);
    }

    // Ensure correct animeId
    result.animeId = animeId;

    // Save to cache
    if (this.cache) {
      await this.cache.saveEpisode(result);
    }

    return result;
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    // Parse source-prefixed slug
    const parts = slug.split(':');
    let source: string | undefined;
    let realSlug = slug;

    if (parts.length > 1) {
      source = parts[0].toLowerCase();
      realSlug = parts.slice(1).join(':');
    }

    // Build anime ID from slug
    const animeId = source ? `${source}:${realSlug}` : slug;

    // Try cache first - get all episodes
    if (this.cache) {
      const cached = await this.cache.getEpisodesByAnime(animeId);
      if (cached.length > 0) {
        console.log(`[Cache] Hit for episode list: ${slug}`);
        return cached;
      }
    }

    // Find appropriate scraper
    let scraper: Scraper | undefined;
    if (source) {
      scraper = this.scrapers.find(s => s.name.toLowerCase() === source);
    }

    let results: EpisodeData[];
    if (scraper) {
      results = await scraper.getEpisodeList(realSlug);
    } else {
      results = await this.executeWithFallback(s => s.getEpisodeList(slug), `getEpisodeList(${slug})`);
    }

    // Ensure correct animeId and save to cache
    results = results.map(ep => ({ ...ep, animeId }));
    if (this.cache) {
      await this.cache.saveEpisodes(results);
    }

    return results;
  }
}
