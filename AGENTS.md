# Agent Context

## Project Overview

**Kuroi** is an anime streaming aggregator built with SvelteKit 5 and deployed on Cloudflare Pages. It scrapes multiple anime sites and presents content through a Neo-Pop inspired UI design.

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5 (runes: `$state`, `$derived`, `$props`)
- **Styling**: Tailwind CSS 4 with custom Neo-Pop design system (hard shadows, sticker effects, bold colors)
- **Runtime**: Cloudflare Workers/Pages with D1 database
- **Scraping**: Cheerio for HTML parsing (no headless browsers)
- **Validation**: Zod 4 for schema validation

## Architecture

### Scraper System

The scraper system uses an **Adapter Pattern** with automatic fallback:

```
src/lib/server/scraper/
├── core.ts           # BaseScraper class with rate limiting, retry logic, Cloudflare bypass
├── types.ts          # Zod schemas and TypeScript interfaces
├── manager.ts        # ScraperManager - fallback orchestration
├── cached-manager.ts # CachedScraperManager - wraps manager with D1 caching
├── d1.ts             # D1Cache - database operations
└── sites/
    ├── nimegami.ts
    ├── samehadaku.ts
    ├── otakudesu.ts
    └── nontonanimeid.ts
```

**Key concepts**:
- All scrapers implement the `Scraper` interface from `types.ts`
- `BaseScraper` provides: rate limiting, retry with exponential backoff, rotating user agents, session cookies, caching
- `ScraperManager` tries scrapers in order until one succeeds (fallback pattern)
- `CachedScraperManager` wraps the manager with D1 database caching
- Slug format: `{source}:{slug}` (e.g., `nimegami:boruto-episode-100`)

### Frontend Routes

- `/` - Homepage with ongoing/completed anime grids
- `/[slug]` - Anime detail + watch page (episode via `?ep=N` query param)

### Caching Strategy

- D1 database caches: anime metadata, episode data, search results
- Default TTL: 24 hours
- Cache invalidation: automatic on update

## Development Commands

```bash
# Development server
pnpm dev

# Type checking
pnpm check

# Build for production
pnpm build

# Preview production build (requires Cloudflare)
pnpm preview

# Generate Cloudflare types
pnpm types
```

## Design System

The UI follows a **Neo-Pop / Sticker** aesthetic:
- Hard shadows (`shadow-hard-sm`, `shadow-hard-md`, `shadow-hard-lg`)
- Bold 4px white borders
- Slight rotations for playful feel
- Vibrant color palette (see `src/routes/layout.css`)
- Material Symbols icons

## Key Files to Understand

| File | Purpose |
|------|---------|
| `src/lib/server/scraper/core.ts` | Base scraper with all anti-detection logic |
| `src/lib/server/scraper/types.ts` | All data schemas and interfaces |
| `src/lib/server/scraper/index.ts` | Scraper exports and initialization |
| `src/routes/+page.server.ts` | Homepage data loading |
| `src/routes/[slug]/+page.server.ts` | Anime detail/watch page loading |
| `wrangler.jsonc` | Cloudflare configuration (D1 bindings) |

## Current Issues

- **NontonAnimeID**: Returns 403 due to Cloudflare protection (adapter implemented but unverified)
- Some scrapers may have title extraction issues due to HTML structure variability

## Development Guidelines

1. Always use `$state`, `$derived`, `$props` for Svelte 5 reactivity
2. Scrapers should extend `BaseScraper` and implement all `Scraper` interface methods
3. Use source-prefixed slugs (`source:slug`) for routing
4. Frontend work requires frontend-tester agent validation
5. Run `pnpm check` before committing TypeScript changes

## AI Scraper Agent Workflow (Bun + Cheerio)

**Goal:** Generate reliable, anti-bloat scraping scripts with strict TypeScript typing and minimal token consumption.

### Execution Pipeline

1. **Fetch & Load:** Use Bun's built-in `fetch` (HTTP/2 support, memory efficient). Load raw HTML into Cheerio.
2. **Purge (Sanitization):** Remove noise. Execute: `$('script, style, svg, noscript, iframe, .ads, [class*="banner"]').remove();`
3. **Shrink Repeated Nodes (Token Optimization):** Detect child elements sharing the same parent and tag name. If count > 2, remove the rest (keep only 2 items as pattern samples).
4. **Minify:** Strip redundant whitespaces, tabs, and newlines from the final HTML string.
5. **Analyze & Extract:** LLM reads the ultra-compact DOM sample and maps specific CSS selectors based on the requested JSON schema.
6. **Code Generation:** Output a rigorously typed Bun script using only `cheerio`. No `axios`, `request`, or bloated dependencies.
7. **Execute & Self-Heal:** Run the script automatically. Validate output. If result is empty `[]` or fails extraction, analyze failure, adjust selector strategy, and retry.

### Scraper Development Constraints

1. **STACK:** Use only Bun's native `fetch` and `cheerio`. DO NOT use `axios`, `node-fetch`, `puppeteer`, or `playwright`.
2. **STRICT TYPING:** MUST define clear TypeScript `interface` for extracted data.
3. **ERROR HANDLING:** Implement `try-catch` blocks. Network requests can fail.
4. **SELECTOR STRATEGY:**
   - Analyze structure carefully. Look for specific classes (e.g., `.imgseries`, `.leftseries`, `article.bs`).
   - Use `.trim()` on text extraction.
   - Use absolute URLs if `href` or `src` is relative.
5. **OUTPUT:** Return ONLY production-ready TypeScript code. No explanations, no markdown wrapping.
6. **NO MAGIC:** If HTML does not contain the data, throw an error. Do not hallucinate data.

### Preprocessor Script (`preprocessor.ts`)

The preprocessor handles **Steps 1-4** of the Execution Pipeline automatically:

| Step | Function | Description |
|------|----------|-------------|
| 1 | Fetch & Load | Bun built-in fetch, load into Cheerio |
| 2 | Purge | Remove `script, style, svg, noscript, iframe, meta, link, .ads, [class*="banner"]` |
| 3 | Shrink | Smart fingerprinting (tag + first class), keeps 2 items per group, threshold = 4 |
| 4 | Minify | Extract body, collapse whitespace to single line |

**Usage:**

```bash
bun run preprocessor.ts https://example.com
```

**Output:** `agent-context.html` — token-optimized HTML ready for LLM analysis (Steps 5-7).

## AniList Integration

AniList API is used to enrich anime metadata with standardized data (cover images, genres, scores, etc.).

### Files

```
src/lib/server/scraper/
├── anilist.ts        # AniListClient with D1 caching
├── d1.ts             # D1Cache with anilist_title_cache & anilist_metadata tables
└── schema.sql        # D1 schema including AniList cache tables
```

### Title Sanitization

Before searching AniList, titles must be sanitized to remove noise from scraping sites:

```typescript
import { sanitizeTitleForAniList } from '$lib/server/scraper';

const raw = 'Boruto Episode (100) Sub Indo Uncensored';
const clean = sanitizeTitleForAniList(raw); // 'Boruto'
```

**Sanitization removes:**
- Noise patterns: `Sub Indo`, `Sub`, `Indo`, `Batch`, `Uncensored`, `Uncen`, `BD`, `Ongoing`, `Completed`
- Episode indicators: `Episode (XX)`, `Eps (XX)`, `Episode XX`
- Brackets and special quotes
- Duplicate consecutive words

### D1 Cache Tables

```sql
-- Maps sanitized title -> AniList ID
anilist_title_cache (sanitized_title, anilist_id)

-- Stores full AniList metadata
anilist_metadata (anilist_id, title_*, cover_*, genres, status, episodes, ...)
```

### Usage

```typescript
import { createAniListClient } from '$lib/server/scraper';

const client = createAniListClient(platform?.env?.DB);
const anilistId = await client.getAnimeIdByTitle('Sousou no Frieren 2nd Season');
const metadata = await client.getMetadata(anilistId);
```

### Known Issues: Romaji Normalization

AniList and Indonesian anime sites may use different romaji styles:

| Source | Title |
|--------|-------|
| Indonesian site | `Yarikomizuki no Gamer wa Hai Settei` |
| AniList | `Yarikomi Suki no Gamer wa Haisettei` |

Differences:
- Combined vs separated: `Yarikomizuki` vs `Yarikomi Suki`
- Separated vs combined: `Hai Settei` vs `Haisettei`

### Fallback Strategy (for Cronjob)

When full title search fails, progressively shorten the title:

```typescript
async function getAniListIdWithFallback(title: string): Promise<number | null> {
  const sanitized = sanitizeTitleForAniList(title);
  
  // 1. Try full sanitized title
  let id = await client.getAnimeIdByTitle(sanitized);
  if (id) return id;
  
  // 2. Try progressively shorter prefixes (min 3 words)
  const words = sanitized.split(' ');
  for (let len = Math.min(6, words.length); len >= 3; len--) {
    const shortened = words.slice(0, len).join(' ');
    id = await client.getAnimeIdByTitle(shortened);
    if (id) return id;
    await sleep(1200); // Rate limit: 1.2s between requests
  }
  
  return null;
}
```

**Example fallback:**
1. `"Hell Mode: Yarikomizuki no Gamer wa Hai Settei Isekai de Musou suru"` → null
2. `"Hell Mode: Yarikomizuki no Gamer wa Hai Settei"` → null
3. `"Hell Mode: Yarikomizuki no Gamer"` → null
4. `"Hell Mode: Yarikomizuki"` → null
5. `"Hell Mode"` → **Found! ID: 185262**

### Cronjob & Seeding (TODO)

- Cronjob will periodically sync anime data from scrapers to D1
- AniList enrichment runs after initial scrape
- Failed matches logged for manual review
