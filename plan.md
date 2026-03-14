Act as a Senior Software Engineer. We are finalizing the migration to the "Kuroi Unified Metadata & Seeding Engine" architecture.
- The SvelteKit app (`src/`) must act ONLY as a fast web server/UI.
- ALL scraping logic must be removed from `src/` entirely.
- The database schema relies on a Single Source of Truth (SSOT) mapping dirty scraper slugs to clean AniList IDs.

Execute the following 4 phases sequentially. Do not proceed to the next phase until the current one is complete.

## PHASE 1: Purge Legacy Scrapers
1. Move `src/lib/server/scraper/anilist.ts` and `src/lib/server/scraper/types.ts` to the root `adapter/` directory.
2. Update any imports in `adapter/vps_seeder.ts`, `scripts/seed.ts`, and adapter files to point to the new paths.
3. DELETE the entire `src/lib/server/scraper` directory. The web app must have zero scraping dependencies.

## PHASE 2: Define the D1 Schema (The SSOT)
Create/overwrite `src/lib/server/db/schema.sql` (or wherever your D1 schema is stored) exactly like this to support the SSOT architecture:

```sql
-- Clean AniList Metadata
CREATE TABLE IF NOT EXISTS anilist_metadata (
    id INTEGER PRIMARY KEY,
    romaji_title TEXT NOT NULL,
    cover_image TEXT,
    description TEXT,
    genres TEXT, -- Stored as JSON string array
    last_updated INTEGER
);

-- Dirty Scraper Mapping
CREATE TABLE IF NOT EXISTS scraper_sources (
    slug TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    anilist_id INTEGER,
    latest_episode TEXT,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (anilist_id) REFERENCES anilist_metadata(id) ON DELETE SET NULL
);

-- Episodes Table (Linked to scraper_sources)
CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY, -- format: sourceName:slug-episode-X
    source_slug TEXT NOT NULL,
    episode_number REAL NOT NULL,
    title TEXT,
    stream_links TEXT, -- JSON string array
    download_links TEXT, -- JSON string array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_slug) REFERENCES scraper_sources(slug) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_episodes_source ON episodes(source_slug, episode_number DESC);

```

## PHASE 3: Build the Secure Ingestion API (The Backdoor)

Overhaul `src/routes/api/internal/seed/+server.ts`. Reconcile the payload from `vps_seeder.ts` (`{ animeData, anilistMetadata }`) with the D1 batch insertion.

Requirements for the POST handler:

1. **Security**: Validate `Authorization` header against `env.SEEDER_SECRET_KEY` (or `INGEST_SECRET`). Return 401 if it fails.
2. **Payload Parse**: Accept `{ animeData, anilistMetadata }` for catalogs, OR `{ type: 'episode', data: [...] }` for episodes.
3. **D1 Batching**: Use `platform.env.DB.batch()` for efficient upserts.
* If `anilistMetadata` exists, upsert into `anilist_metadata`.
* Always upsert `animeData` into `scraper_sources`.
* If `type === 'episode'`, upsert into `episodes`.



## PHASE 4: Implement Repository Pattern

Create `src/lib/server/db/repository.ts` to handle UI data fetching.
Implement `getHome()`, `getOngoing()`, and `getAnimeDetail(slug)` using SQL `JOIN` statements.
Example for detail:
`SELECT a.*, s.* FROM scraper_sources s LEFT JOIN anilist_metadata a ON s.anilist_id = a.id WHERE s.slug = ?`

Show me the proposed code for Phase 3 and Phase 4 before writing to the file system.
