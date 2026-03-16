export interface AnimeInfo {
  title: string;
  url: string;
  image?: string;
  coverImage?: string; // Svelte expects coverImage
  slug?: string;       // Svelte expects slug
  source?: string;     // Svelte expects source
  status?: string;
  episode?: string;    // Svelte expects episode instead of status sometimes
  type?: string;
  score?: string;
  postedBy?: string;
  releasedOn?: string;
  releaseYear?: string; // For detail page
  totalEpisodes?: number; // For detail page
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
  episodeNumber: number; // Svelte expects episodeNumber
  title: string;
  url: string;
  date?: string;
}

export interface SearchResult {
  results: AnimeInfo[];
  hasNextPage: boolean;
  currentPage: number;
}

export interface WatchData {
  streamLinks: { server: string; url: string }[];
  downloadLinks?: { server: string; url: string; resolution?: string }[]; // Svelte support
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

  /**
   * Searches for anime based on a query.
   */
  search?(query: string, page?: number): Promise<SearchResult>;

  /**
   * Extracts streaming links from an episode URL.
   */
  extractStreamLinks?(episodeUrl: string): Promise<WatchData>;
}