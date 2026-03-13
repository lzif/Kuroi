import type { AnimeData, EpisodeData, AnimeListItem, SearchResult, AnimeMetadata } from './types';

const CACHE_TTL_HOURS = 24; // Cache expires after 24 hours

export class D1Cache {
  constructor(private db: D1Database) {}

  // === Anime Operations ===

  async getAnime(slug: string, source: string): Promise<AnimeData | null> {
    const result = await this.db
      .prepare('SELECT * FROM anime WHERE slug = ? AND source = ?')
      .bind(slug, source)
      .first();

    if (!result) return null;

    return this.rowToAnime(result);
  }

  async getAnimeById(id: string): Promise<AnimeData | null> {
    const result = await this.db
      .prepare('SELECT * FROM anime WHERE id = ?')
      .bind(id)
      .first();

    if (!result) return null;

    return this.rowToAnime(result);
  }

  async getSourcesByAniListId(anilistId: number): Promise<AnimeData[]> {
    const results = await this.db
      .prepare('SELECT * FROM anime WHERE anilist_id = ?')
      .bind(anilistId)
      .all();

    return results.results.map((row) => this.rowToAnime(row));
  }

  async saveAnime(anime: AnimeData): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO anime (id, slug, title, anilist_id, japanese_title, synonyms, alternative_titles, synopsis, cover_image, genres, status, type, total_episodes, score, release_year, posted_by, released_on, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          anilist_id = excluded.anilist_id,
          japanese_title = excluded.japanese_title,
          synonyms = excluded.synonyms,
          alternative_titles = excluded.alternative_titles,
          synopsis = excluded.synopsis,
          cover_image = excluded.cover_image,
          genres = excluded.genres,
          status = excluded.status,
          type = excluded.type,
          total_episodes = excluded.total_episodes,
          score = excluded.score,
          release_year = excluded.release_year,
          posted_by = excluded.posted_by,
          released_on = excluded.released_on,
          updated_at = datetime('now')
      `)
      .bind(
        anime.id,
        anime.slug,
        anime.title,
        anime.anilistId ?? null,
        anime.japaneseTitle ?? null,
        anime.synonyms ?? null,
        JSON.stringify(anime.alternativeTitles),
        anime.synopsis,
        anime.coverImage,
        JSON.stringify(anime.genres),
        anime.status,
        anime.type,
        anime.totalEpisodes ?? null,
        anime.score ?? null,
        anime.releaseYear ?? null,
        anime.postedBy ?? null,
        anime.releasedOn ?? null,
        anime.source
      )
      .run();
  }

  // === Episode Operations ===

  async getEpisode(animeId: string, episodeNumber: number): Promise<EpisodeData | null> {
    const result = await this.db
      .prepare('SELECT * FROM episodes WHERE anime_id = ? AND episode_number = ?')
      .bind(animeId, episodeNumber)
      .first();

    if (!result) return null;

    return this.rowToEpisode(result);
  }

  async getEpisodesByAnime(animeId: string): Promise<EpisodeData[]> {
    const results = await this.db
      .prepare('SELECT * FROM episodes WHERE anime_id = ? ORDER BY episode_number ASC')
      .bind(animeId)
      .all();

    return results.results.map(this.rowToEpisode);
  }

  async saveEpisode(episode: EpisodeData): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO episodes (id, anime_id, episode_number, title, stream_links, download_links, release_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(anime_id, episode_number) DO UPDATE SET
          title = excluded.title,
          stream_links = excluded.stream_links,
          download_links = excluded.download_links,
          release_date = excluded.release_date,
          updated_at = datetime('now')
      `)
      .bind(
        episode.id,
        episode.animeId,
        episode.episodeNumber,
        episode.title,
        JSON.stringify(episode.streamLinks),
        JSON.stringify(episode.downloadLinks),
        episode.releaseDate ?? null
      )
      .run();
  }

  async saveEpisodes(episodes: EpisodeData[]): Promise<void> {
    const statements = episodes.map(ep => 
      this.db
        .prepare(`
          INSERT INTO episodes (id, anime_id, episode_number, title, stream_links, download_links, release_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(anime_id, episode_number) DO UPDATE SET
            title = excluded.title,
            stream_links = excluded.stream_links,
            download_links = excluded.download_links,
            release_date = excluded.release_date,
            updated_at = datetime('now')
        `)
        .bind(
          ep.id,
          ep.animeId,
          ep.episodeNumber,
          ep.title,
          JSON.stringify(ep.streamLinks),
          JSON.stringify(ep.downloadLinks),
          ep.releaseDate ?? null
        )
    );

    await this.db.batch(statements);
  }

  // === Search Cache Operations ===

  async getSearchCache(query: string, source: string): Promise<SearchResult | null> {
    const result = await this.db
      .prepare(`
        SELECT results FROM search_cache 
        WHERE query = ? AND source = ? AND expires_at > datetime('now')
      `)
      .bind(query, source)
      .first();

    if (!result) return null;

    try {
      return JSON.parse(result.results as string);
    } catch {
      return null;
    }
  }

  async saveSearchCache(query: string, source: string, results: SearchResult): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO search_cache (query, source, results, expires_at)
        VALUES (?, ?, ?, datetime('now', '+${CACHE_TTL_HOURS} hours'))
        ON CONFLICT(query, source) DO UPDATE SET
          results = excluded.results,
          expires_at = excluded.expires_at
      `)
      .bind(query, source, JSON.stringify(results))
      .run();
  }

  // === AniList Title Cache Operations ===

  async getAniListIdByTitle(sanitizedTitle: string): Promise<number | null> {
    const result = await this.db
      .prepare('SELECT anilist_id FROM anilist_title_cache WHERE sanitized_title = ?')
      .bind(sanitizedTitle.toLowerCase().trim())
      .first();

    return result ? (result.anilist_id as number) : null;
  }

  async saveAniListTitleMapping(sanitizedTitle: string, anilistId: number): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO anilist_title_cache (sanitized_title, anilist_id)
        VALUES (?, ?)
        ON CONFLICT(sanitized_title) DO UPDATE SET
          anilist_id = excluded.anilist_id,
          updated_at = datetime('now')
      `)
      .bind(sanitizedTitle.toLowerCase().trim(), anilistId)
      .run();
  }

  // === AniList Metadata Operations ===

  async getAniListMetadata(anilistId: number): Promise<AnimeMetadata | null> {
    const result = await this.db
      .prepare('SELECT * FROM anilist_metadata WHERE anilist_id = ?')
      .bind(anilistId)
      .first();

    if (!result) return null;

    return this.rowToAniListMetadata(result);
  }

  async saveAniListMetadata(metadata: AnimeMetadata): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO anilist_metadata (
          anilist_id, title_romaji, title_english, title_native,
          cover_large, cover_medium, banner_image, description,
          genres, status, episodes, average_score, season, season_year, studios
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(anilist_id) DO UPDATE SET
          title_romaji = excluded.title_romaji,
          title_english = excluded.title_english,
          title_native = excluded.title_native,
          cover_large = excluded.cover_large,
          cover_medium = excluded.cover_medium,
          banner_image = excluded.banner_image,
          description = excluded.description,
          genres = excluded.genres,
          status = excluded.status,
          episodes = excluded.episodes,
          average_score = excluded.average_score,
          season = excluded.season,
          season_year = excluded.season_year,
          studios = excluded.studios,
          updated_at = datetime('now')
      `)
      .bind(
        metadata.id,
        metadata.title.romaji,
        metadata.title.english,
        metadata.title.native,
        metadata.coverImage.large,
        metadata.coverImage.medium,
        metadata.bannerImage ?? null,
        metadata.description ?? null,
        JSON.stringify(metadata.genres),
        metadata.status,
        metadata.episodes ?? null,
        metadata.averageScore ?? null,
        metadata.season ?? null,
        metadata.seasonYear ?? null,
        JSON.stringify(metadata.studios ?? [])
      )
      .run();
  }

  // === Cleanup ===

  async cleanExpiredCache(): Promise<void> {
    await this.db
      .prepare("DELETE FROM search_cache WHERE expires_at < datetime('now')")
      .run();
  }

  // === Row Mappers ===

  private rowToAnime(row: any): AnimeData {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      anilistId: row.anilist_id ?? undefined,
      japaneseTitle: row.japanese_title ?? undefined,
      synonyms: row.synonyms ?? undefined,
      alternativeTitles: JSON.parse(row.alternative_titles || '[]'),
      synopsis: row.synopsis || '',
      coverImage: row.cover_image || '',
      genres: JSON.parse(row.genres || '[]'),
      status: row.status || 'unknown',
      type: row.type || 'unknown',
      totalEpisodes: row.total_episodes ?? undefined,
      score: row.score ?? undefined,
      releaseYear: row.release_year ?? undefined,
      postedBy: row.posted_by ?? undefined,
      releasedOn: row.released_on ?? undefined,
      source: row.source,
    };
  }

  private rowToEpisode(row: any): EpisodeData {
    return {
      id: row.id,
      animeId: row.anime_id,
      episodeNumber: row.episode_number,
      title: row.title || '',
      streamLinks: JSON.parse(row.stream_links || '[]'),
      downloadLinks: JSON.parse(row.download_links || '[]'),
      releaseDate: row.release_date ?? undefined,
    };
  }

  private rowToAniListMetadata(row: any): AnimeMetadata {
    return {
      id: row.anilist_id,
      title: {
        romaji: row.title_romaji || '',
        english: row.title_english || '',
        native: row.title_native || '',
      },
      coverImage: {
        large: row.cover_large || '',
        medium: row.cover_medium || '',
      },
      bannerImage: row.banner_image ?? undefined,
      description: row.description ?? undefined,
      genres: JSON.parse(row.genres || '[]'),
      status: row.status || '',
      episodes: row.episodes ?? undefined,
      averageScore: row.average_score ?? undefined,
      season: row.season ?? undefined,
      seasonYear: row.season_year ?? undefined,
      studios: JSON.parse(row.studios || '[]'),
    };
  }
}
