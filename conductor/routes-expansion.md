# Kuroi Route Expansion Plan

## Objective
Implement the missing routes referenced in the navigation menu: `/schedule`, `/browse`, `/reports`, `/seasonal`, `/community`, `/anime`, and `/ongoing`. The implementation will follow the Neo-Pop aesthetic, use Phosphor icons, and integrate with the existing `CachedScraperManager` or D1 where applicable.

## Phased Approach

### Phase 1: Core Content Routes (Data-Driven)
These routes can be built immediately using existing APIs.

1.  **`/ongoing` (Ongoing Semester)**
    *   **Purpose:** Display currently airing anime with pagination.
    *   **API Layer:** `scraperManager.getOngoing(page)`
    *   **UI Strategy:** Grid layout of anime cards (reusing the card component from the homepage). Add pagination controls at the bottom.

2.  **`/browse` (Search & Discovery)**
    *   **Purpose:** Dedicated search page with query parameters.
    *   **API Layer:** `scraperManager.search(query, page)`
    *   **UI Strategy:** Large, prominent search bar. Display results in a grid. Read `?q=` from the URL for server-side rendering of search results.

3.  **`/anime` (Unified Directory)**
    *   **Purpose:** A complete list of all seeded anime.
    *   **API Layer:** Requires a new D1 query (e.g., `D1Cache.getAllAnime(page, limit)`).
    *   **UI Strategy:** Alphabetical or date-sorted list. For the initial skeleton, we can display a "Connecting to DB..." state or a mock grid.

### Phase 2: Structural / Thematic Routes (Static or AniList-Driven)
These routes require new data sources or are purely thematic.

4.  **`/schedule`**
    *   **Purpose:** Weekly release schedule.
    *   **Strategy:** Create a visually striking Neo-Pop skeleton page. Future implementation will require querying AniList for `nextAiringEpisode` data.

5.  **`/seasonal`**
    *   **Purpose:** Anime grouped by season (e.g., "Spring 2026").
    *   **Strategy:** Create a skeleton page. Future implementation will filter the D1 database by `season` and `season_year`.

6.  **`/reports`**
    *   **Purpose:** Site statistics or user watch history.
    *   **Strategy:** A thematic "Access Restricted" or "Under Construction" Neo-Pop error/info state, keeping the DB/Archive aesthetic.

7.  **`/community`**
    *   **Purpose:** Links to Discord, GitHub, or internal forums.
    *   **Strategy:** A static page with large, chunky links to social platforms.

## UI / Neo-Pop Design Guidelines for New Pages
*   **Containers:** Use `bg-pop-paper`, `shadow-hard-xl`, `border-4 border-white`, and `rounded-[2rem]`.
*   **Typography:** Uppercase headers, `font-display` for titles, `font-black`.
*   **Icons:** Use `phosphor-svelte` with `weight="bold"`.
*   **Decorations:** Background dots (`bg-dots`), notebook lines (`bg-notebook`), and tape strips (`tape-strip`).

## Action Items
1.  [x] Create this plan.
2.  [ ] Build the data-driven `/ongoing` route (`+page.svelte` and `+page.server.ts`).
3.  [ ] Build the data-driven `/browse` route (`+page.svelte` and `+page.server.ts`).
4.  [ ] Build aesthetically pleasing skeleton pages for `/schedule`, `/seasonal`, `/reports`, `/community`, and `/anime`.
