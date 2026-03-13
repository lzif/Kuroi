export interface AnimeInfo {
  title: string;
  url: string;
  image?: string;
  status?: string;
  type?: string;
  score?: string;
  postedBy?: string;
  releasedOn?: string;
}

export interface AnimeDetail extends AnimeInfo {
  japanese?: string;
  synonyms?: string;
  synopsis: string;
  genres: string[];
  episodes: EpisodeInfo[];
}

export interface EpisodeInfo {
  number: number;
  title: string;
  url: string;
  date?: string;
}

export interface ProviderAdapter {
  name: string;
  baseUrl: string;
  
  /**
   * Scrapes the full directory/list of anime available on the site.
   * This is used by the seeder to populate the SQLite queue.
   */
  scrapeFullList(): Promise<AnimeInfo[]>;
  
  /**
   * Scrapes the latest ongoing/updated anime from the homepage.
   * Useful for delta updates.
   */
  scrapeOngoing(page?: number): Promise<AnimeInfo[]>;
  
  /**
   * Scrapes the detail page for a specific anime to extract full metadata.
   */
  scrapeAnimeDetail(url: string): Promise<AnimeDetail>;
}