# Kuroi (Anime Archiver)

Kuroi is a modern, high-performance anime scraper and streaming application built with **Svelte 5** and **Tailwind CSS 4**. It is designed to be deployed on **Cloudflare Pages** and utilizes **Cloudflare D1** for high-efficiency metadata caching.

## Project Overview

- **Purpose:** A unified interface for scraping, searching, and streaming anime from multiple Indonesian sources (Samehadaku, Otakudesu, Nimegami, NontonAnimeID).
- **Architecture:**
  - **Frontend:** Svelte 5 (using Runes) with a "retro/pop" aesthetic.
  - **Backend:** SvelteKit server-side logic running on Cloudflare Workers.
  - **Scraper Engine:** A modular, adapter-based scraping system located in `src/lib/server/scraper`.
  - **Data Layer:** Cloudflare D1 (SQLite-compatible) for caching anime details, episode lists, search results, and AniList metadata mappings.
  - **Enhancement:** Integrated with the AniList API v2 for high-quality metadata, banners, and standardized titles.

## Tech Stack

- **Framework:** [Svelte 5](https://svelte.dev/) (Runes, Snippets)
- **Meta-Framework:** [SvelteKit](https://kit.svelte.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (Vite Plugin)
- **Runtime/Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) / [Workers](https://workers.cloudflare.com/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Parsing:** [Cheerio](https://cheerio.js.org/)
- **Validation:** [Zod](https://zod.dev/)

## Building and Running

### Prerequisites
- Node.js (v20+)
- pnpm (recommended)
- Wrangler CLI (for Cloudflare integration)

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm run dev
```

### Type Checking
```bash
pnpm run check
```

### Production Build
```bash
pnpm run build
```

### Preview (Cloudflare Environment)
```bash
pnpm run preview
```

### Database Management (D1)
To initialize or migrate the database:
```bash
npx wrangler d1 execute kuroi-db --local --file=src/lib/server/scraper/schema.sql
```

## Project Structure

- `src/lib/server/scraper/`: The core scraping engine.
  - `sites/`: Site-specific scraper implementations (adapters).
  - `manager.ts`: Orchestrates multiple scrapers.
  - `cached-manager.ts`: Adds D1 caching layer to the manager.
  - `anilist.ts`: Client for AniList API v2.
  - `schema.sql`: D1 database schema definitions.
- `src/routes/`: SvelteKit pages and API endpoints.
  - `[slug]/`: Dynamic route for anime details and streaming.
- `preprocessor.ts`: A Bun-based utility to minify and clean up HTML (removing scripts, styles, and shrinking repeated nodes) to optimize it for scraping analysis or LLM context.
- `anime-multi-scraper/`: A standalone, Bun-based CLI scraper (experimental/utility).

## Development Conventions

- **Svelte 5 Runes:** Use `$state`, `$derived`, and `$props` exclusively. Avoid legacy Svelte 4 syntax.
- **Surgical Scraping:** Scrapers should be resilient and use the `BaseScraper` core to handle retries and delays.
- **Type Safety:** All scraping results and API responses must be typed or validated with Zod.
- **Caching Strategy:** Prefer serving from D1 cache when available; background-refresh metadata if it's stale (TTL-based).
- **Styling:** Adhere to the "pop" aesthetic defined in `tailwind.config.ts` (or the CSS-based Tailwind 4 config). Use `shadow-hard-md`, `border-4`, and high-contrast color palettes.
