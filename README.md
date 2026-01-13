# Anime Scraper

Simple anime streaming aggregator yang scrape dari 3 sources: NontonAnimeId, AlqAnime, dan Samehadaku.

## Features

- ✅ Browse latest anime from multiple sources
- ✅ View anime details & episode lists
- ✅ Watch episodes with embedded player
- ✅ Download links (multiple qualities)
- ✅ Server-side rendering (fast initial load)
- ✅ Simple caching (reduce load on source sites)

## Tech Stack

- **Runtime**: Bun
- **Framework**: SvelteKit (SSR)
- **Scraping**: Cheerio
- **Styling**: Tailwind CSS
- **Deploy**: Cloudflare Pages

## Prerequisites

- Bun v1.0+
- Node.js v20+ (for compatibility)

## Installation

```bash
# Clone repo
git clone <repo-url>
cd anime-scraper

# Install dependencies
bun install

# Run dev server
bun --bun run dev
```

## Development

```bash
# Dev server with hot reload
bun --bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Project Structure

```
src/
├── routes/                 # SvelteKit pages
│   ├── +page.server.ts    # Homepage (latest anime)
│   └── anime/[slug]/      # Anime detail & episodes
├── lib/
│   ├── scrapers/          # Site-specific scrapers
│   └── utils/             # Cache & helpers
```

## How It Works

1. User visits page
2. Server checks cache
3. If miss, scrape source site with cheerio
4. Parse HTML → extract data
5. Cache result for 10 minutes
6. Return SSR HTML to browser

## Scraped Data

- **Homepage**: Latest 20-30 anime from each source
- **Detail**: Title, synopsis, genres, episode list
- **Episode**: Video embed URL, download links

## Caching

- **Type**: In-memory (simple Map)
- **TTL**: 10 minutes
- **Max size**: 100 entries
- **Eviction**: LRU (least recently used)

## Deployment

### Cloudflare Pages

```bash
# Build
bun run build

# Deploy (via CF dashboard or Wrangler)
npx wrangler pages deploy .svelte-kit/cloudflare
```

### Environment Variables

No environment variables needed (all public scraping).

## Performance

- Initial load: ~2-3s (SSR + scraping)
- Cached load: ~100-300ms
- Mobile-friendly responsive design

## Limitations

- No user accounts
- No favorites/bookmarks
- No database (stateless)
- Cache clears on restart
- No search (yet)

## Ethical Considerations

- Respect robots.txt
- Reasonable request delays
- Cache to minimize load
- No video re-hosting (just embed)
- Educational purpose only

## Troubleshooting

**Page won't load / scraping fails:**
- Source site might be down
- HTML structure changed → update selectors
- Check console for errors

**Video won't play:**
- Source embed might be broken
- Try different episode
- Check browser console

**Cache not working:**
- Server restarted (in-memory cache cleared)
- TTL expired (normal behavior)

## Future Improvements

- [ ] Search functionality
- [ ] Genre filtering
- [ ] Persistent cache (Redis/KV)
- [ ] Better error pages
- [ ] Pagination for homepage

## Contributing

1. Fork repo
2. Create feature branch
3. Make changes
4. Test locally
5. Submit PR

## License

MIT

## Disclaimer

This project is for educational purposes only. Respect source sites' terms of service. Don't abuse scraping. No copyright infringement intended.

## Credits

- Source sites: NontonAnimeId, AlqAnime, Samehadaku
- Built with SvelteKit & Cheerio
- Deployed on Cloudflare Pages
