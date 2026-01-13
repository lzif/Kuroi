import { z } from 'zod';

export const AnimeStatusSchema = z.enum(['ongoing', 'completed', 'unknown']);
export const AnimeTypeSchema = z.enum(['tv', 'movie', 'ova', 'ona', 'special', 'unknown']);

export const AnimeDataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  alternativeTitles: z.array(z.string()).default([]),
  synopsis: z.string().default(''),
  coverImage: z.string().url().or(z.string()),
  genres: z.array(z.string()).default([]),
  status: AnimeStatusSchema.default('unknown'),
  type: AnimeTypeSchema.default('unknown'),
  totalEpisodes: z.number().optional(),
  score: z.number().optional(),
  releaseYear: z.number().optional(),
  source: z.string(),
});

export const DownloadLinkSchema = z.object({
  quality: z.string(),
  url: z.string().url(),
  host: z.string().optional(),
  size: z.string().optional(),
});

export const StreamingLinkSchema = z.object({
  server: z.string(),
  url: z.string().url().or(z.string()), // Some might be iframe src
  quality: z.string().optional(),
});

export const EpisodeDataSchema = z.object({
  id: z.string(),
  animeId: z.string(),
  episodeNumber: z.number(),
  title: z.string(),
  downloadLinks: z.array(DownloadLinkSchema).default([]),
  streamLinks: z.array(StreamingLinkSchema).default([]),
  releaseDate: z.string().optional(),
});

// List items for home/search/lists
export const AnimeListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  coverImage: z.string(),
  status: AnimeStatusSchema.optional(),
  episode: z.number().optional(), // For ongoing
  score: z.number().optional(), // For completed/search
  type: AnimeTypeSchema.optional(),
  releaseDate: z.string().optional(),
  source: z.string(),
});

export const SearchResultSchema = z.object({
  results: z.array(AnimeListItemSchema),
  hasNextPage: z.boolean().default(false),
  currentPage: z.number().default(1),
});

export type AnimeData = z.infer<typeof AnimeDataSchema>;
export type EpisodeData = z.infer<typeof EpisodeDataSchema>;
export type DownloadLink = z.infer<typeof DownloadLinkSchema>;
export type StreamingLink = z.infer<typeof StreamingLinkSchema>;
export type AnimeListItem = z.infer<typeof AnimeListItemSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

export interface Scraper {
  name: string;
  baseUrl: string;
  getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }>;
  search(query: string, page?: number): Promise<SearchResult>;
  getOngoing(page?: number): Promise<SearchResult>;
  getCompleted(page?: number): Promise<SearchResult>;
  getAnimeDetail(slug: string): Promise<AnimeData>;
  getEpisodeList(slug: string): Promise<EpisodeData[]>; // Or a simplified version
  getWatch(slug: string, episodeNumber: number): Promise<EpisodeData>;
}

