import type { AnimeMetadata } from './types';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
query ($search: String) {
  Media (search: $search, type: ANIME, sort: SEARCH_MATCH) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      medium
    }
    bannerImage
    description
    genres
    status
    episodes
    averageScore
    season
    seasonYear
    studios {
      nodes {
        name
      }
    }
  }
}
`;

const METADATA_QUERY = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      large
      medium
    }
    bannerImage
    description
    genres
    status
    episodes
    averageScore
    season
    seasonYear
    studios {
      nodes {
        name
      }
    }
  }
}
`;

/**
 * Sanitizes anime titles for AniList search.
 * Removes common noise patterns from scraping site titles.
 */
export function sanitizeTitleForAniList(rawTitle: string): string {
  let title = rawTitle
    // Remove common site-specific noise patterns
    .replace(/(?:\b(Sub Indo|Sub|Indo|Batch|Uncensored|Uncen|BD|Ongoing|Completed)\b)/gi, '')
    // Remove episode indicators with parentheses: Episode (08), Eps (08), (08), etc.
    .replace(/(?:Eps?|Episode)?\s*\(\d+\)/gi, '')
    // Remove episode indicators without parentheses: Episode 08, Eps 08, etc.
    .replace(/(?:Eps?|Episode)\s*\d+/gi, '')
    // Remove standalone numbers in parentheses at the end (e.g., "(2026)")
    .replace(/\s*\(\d{4}\)\s*$/g, '')
    // Remove brackets and remaining parentheses
    .replace(/[\[\]\(\)]/g, '')
    // Remove special quotes and regular quotes
    .replace(/[""''„\"\']/g, '')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  // Remove duplicate consecutive words/phrases
  const words = title.split(' ');
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    const lower = word.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      deduped.push(word);
    }
  }

  return deduped.join(' ').trim();
}

export class AniListClient {
  constructor() {}

  private async fetchAniList(query: string, variables: any): Promise<any> {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const text = await response.text();
      throw new Error(`AniList API Error: ${response.statusText} - ${text}`);
    }

    return await response.json();
  }

  private formatMetadata(media: any): AnimeMetadata {
    return {
      id: media.id,
      title: media.title,
      coverImage: media.coverImage,
      bannerImage: media.bannerImage,
      description: media.description,
      genres: media.genres,
      status: media.status,
      episodes: media.episodes,
      averageScore: media.averageScore,
      season: media.season,
      seasonYear: media.seasonYear,
      studios: media.studios?.nodes?.map((s: any) => s.name) || [],
    };
  }

  async getAnimeIdByTitle(rawTitle: string): Promise<number | null> {
    const sanitizedTitle = sanitizeTitleForAniList(rawTitle);
    if (!sanitizedTitle) return null;

    // Fetch from AniList API
    const data = await this.fetchAniList(SEARCH_QUERY, { search: sanitizedTitle });
    if (!data) return null;

    const media = data?.data?.Media;
    if (media) {
      return media.id;
    }

    return null;
  }

  async getMetadata(id: number): Promise<AnimeMetadata | null> {
    // Fetch from AniList API
    const data = await this.fetchAniList(METADATA_QUERY, { id });
    if (!data) return null;

    const media = data?.data?.Media;
    if (media) {
      return this.formatMetadata(media);
    }

    return null;
  }
}

// Factory function for creating client
export function createAniListClient(): AniListClient {
  return new AniListClient();
}
