import type { Scraper, AnimeListItem, SearchResult, AnimeData, EpisodeData } from './types';

export class ScraperManager {
  private scrapers: Scraper[];

  constructor(scrapers: Scraper[]) {
    this.scrapers = scrapers;
  }

  // Generic fallback executor
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
    return this.executeWithFallback(s => s.getHome(), 'getHome');
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    return this.executeWithFallback(s => s.search(query, page), 'search');
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    return this.executeWithFallback(s => s.getOngoing(page), 'getOngoing');
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
    return this.executeWithFallback(s => s.getCompleted(page), 'getCompleted');
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    // Check if slug has prefix like "source:slug"
    const parts = slug.split(':');
    if (parts.length > 1) {
      const sourceName = parts[0];
      const realSlug = parts.slice(1).join(':');
      const scraper = this.scrapers.find(s => s.name.toLowerCase() === sourceName.toLowerCase());
      if (scraper) {
        return scraper.getAnimeDetail(realSlug);
      }
    }

    // Fallback if no prefix (legacy behavior or direct access)
    return this.executeWithFallback(s => s.getAnimeDetail(slug), `getAnimeDetail(${slug})`);
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const parts = slug.split(':');
    if (parts.length > 1) {
      const sourceName = parts[0];
      const realSlug = parts.slice(1).join(':');
      const scraper = this.scrapers.find(s => s.name.toLowerCase() === sourceName.toLowerCase());
      if (scraper) {
        return scraper.getWatch(realSlug, episodeNumber);
      }
    }

    return this.executeWithFallback(s => s.getWatch(slug, episodeNumber), `getWatch(${slug}, ${episodeNumber})`);
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    const parts = slug.split(':');
    if (parts.length > 1) {
      const sourceName = parts[0];
      const realSlug = parts.slice(1).join(':');
      const scraper = this.scrapers.find(s => s.name.toLowerCase() === sourceName.toLowerCase());
      if (scraper) {
        return scraper.getEpisodeList(realSlug);
      }
    }

    return this.executeWithFallback(s => s.getEpisodeList(slug), `getEpisodeList(${slug})`);
  }
}

