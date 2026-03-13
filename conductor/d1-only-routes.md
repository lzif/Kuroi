# Plan: Migrate to D1-Only Routes (Repository Pattern)

## Background & Motivation
The application currently uses a `CachedScraperManager` which attempts to fetch data from the D1 cache first but falls back to on-the-fly web scraping if the cache misses. This can lead to slow page loads, rate limiting, and instability. The goal is to completely remove on-the-fly scraping from user-facing routes, serving all content exclusively from the D1 database. Scraping will be relegated entirely to background tasks (seeders/cron jobs).

## Scope & Impact
- **Affected Files:**
  - `src/routes/+page.server.ts` (Home)
  - `src/routes/ongoing/+page.server.ts` (Ongoing)
  - `src/routes/browse/+page.server.ts` (Search/Browse)
  - `src/routes/[slug]/+page.server.ts` (Anime Detail & Watch)
  - `src/lib/server/scraper/d1.ts` (Extension) or a new `src/lib/server/db/repository.ts`
- **Impact:** User routes will be instantly responsive. Cache misses will result in 404s or empty lists rather than triggering slow external scraping. Background seeding must be maintained separately to keep the D1 database populated.

## Proposed Solution
1. **Create an `AnimeRepository` (or extend `D1Cache`):**
   - Implement SQL-backed methods to replace the scraper's functionality:
     - `getHome()`: Queries the `anime` table for the latest `Ongoing` and `Completed` items.
     - `getOngoing(page, limit)`: Paginates `Ongoing` anime sorted by `updated_at` or `released_on`.
     - `search(query, page, limit)`: Performs a `LIKE` query on the `title` and `alternative_titles` columns.
     - `getAnimeBySlug(slug)`: Fetches a single anime record directly.
     - `getEpisodes(animeId)` & `getEpisode(animeId, episodeNumber)`: Fetches episodes directly.
2. **Refactor Route Loaders:**
   - Remove `createCachedScraperManager` from all `+page.server.ts` files.
   - Inject the new `AnimeRepository` using `platform.env.DB`.
   - Map the D1 database row structures to the expected interface types (`AnimeListItem`, `SearchResult`, `AnimeData`, `EpisodeData`).
3. **Isolate Scraping Logic:**
   - Ensure the scraper engine remains available *only* for internal API routes (`api/internal/seed`) and CLI scripts (`scripts/seed.ts`), acting as the single source of truth for D1 ingestion.

## Alternatives Considered
- **Strict Cached Manager:** Modifying `CachedScraperManager` to throw errors on cache misses instead of scraping. This was rejected because it maintains the complex scraper dependency chain in the request lifecycle. Direct SQL queries (Repository Pattern) are much faster and simpler.

## Implementation Plan
### Phase 1: Repository Implementation
- Create `src/lib/server/db/repository.ts`.
- Implement data access methods using D1 prepared statements to mimic the expected output structures.

### Phase 2: Route Updates
- Update `src/routes/+page.server.ts` to use `Repository.getHome()`.
- Update `src/routes/ongoing/+page.server.ts` to use `Repository.getOngoing(page)`.
- Update `src/routes/browse/+page.server.ts` to use `Repository.search(query, page)`.
- Update `src/routes/[slug]/+page.server.ts` to use `Repository.getAnime(slug)` and `Repository.getEpisode(...)`.

### Phase 3: Validation
- Verify all routes load successfully without instantiating any `Scraper` instances.
- Ensure 404s are correctly handled when data is missing from D1.

## Verification & Testing
- Load the homepage, search, and a specific anime detail page locally.
- Confirm network logs show zero outgoing requests to external anime sites (e.g., Samehadaku) during page loads.
- Ensure TypeScript compilation passes (`pnpm run check`).
- Ensure the types returned by the Repository match the UI components' expectations.