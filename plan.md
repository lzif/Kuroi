# Anime Scraper Project Plan

## Goals
- Scrape 3 anime sites: nontonanimeid, alqanime, samehadaku
- SSR pages dengan SvelteKit
- Simple caching untuk reduce requests
- No API routes, langsung server-side rendering

## Tech Stack
- Bun + TypeScript
- SvelteKit (SSR only)
- Cheerio (HTML parsing)
- Built-in fetch

## MVP Features
1. Homepage: latest anime dari ketiga site
2. Detail page: info anime + episode list
3. Watch page: video player + download links
4. Simple search (optional, phase 2)

## Pages Structure
```
/                           → Latest anime (all sources)
/anime/[slug]              → Anime detail + episode list
/anime/[slug]/[episode]    → Watch + download
```

## Implementation Phases

### Phase 1: Setup & Single Source (Week 1)
- [ ] Setup SvelteKit project
- [ ] Install cheerio
- [ ] Inspect nontonanimeid.boats structure
- [ ] Build simple scraper for 1 site
- [ ] Create homepage dengan anime list
- [ ] Test SSR + caching

### Phase 2: Detail & Episode Pages (Week 1-2)
- [ ] Scrape anime detail page
- [ ] Parse episode list
- [ ] Extract video embed URLs
- [ ] Parse download links
- [ ] Build watch page UI

### Phase 3: Multi-Source Support (Week 2)
- [ ] Inspect alqanime structure
- [ ] Inspect samehadaku structure
- [ ] Build scrapers for site 2 & 3
- [ ] Simple merge logic (no dedup yet)
- [ ] Test all 3 sources

### Phase 4: Polish (Week 2-3)
- [ ] Add basic caching (in-memory)
- [ ] Error handling & fallbacks
- [ ] Loading states
- [ ] Basic styling with Tailwind
- [ ] Deploy to Cloudflare Pages

## Architecture (Simplified)

### Folder Structure
```
src/
├── routes/
│   ├── +page.server.ts                    # Homepage
│   └── anime/[slug]/
│       ├── +page.server.ts                # Detail
│       └── [episode]/+page.server.ts      # Watch
├── lib/
│   ├── scrapers/
│   │   ├── nontonanimeid.ts               # Site 1
│   │   ├── alqanime.ts                    # Site 2  
│   │   ├── samehadaku.ts                  # Site 3
│   │   └── types.ts                       # Interfaces
│   └── utils/
│       ├── cache.ts                       # Simple Map cache
│       └── fetcher.ts                     # Fetch with retry
```

### Data Flow (Simple)
```
User Request
    ↓
+page.server.ts load()
    ↓
Check cache → Hit? Return
    ↓ Miss
Scraper.fetch(url)
    ↓
Parse with cheerio
    ↓
Save to cache
    ↓
Return data
```

### Error Handling (Simple)
- Retry 2x on network error
- If scrape fails: return empty array (homepage) or cached data
- No fallback between sources (too complex for MVP)
- Log errors to console only

## Scraper Logic Per Site

### Common Pattern
```
1. Fetch HTML with built-in fetch
2. Load with cheerio
3. Select elements with CSS selectors
4. Extract text/attributes
5. Normalize URLs (relative → absolute)
6. Return typed object
```

### What to Extract

**Homepage/List:**
- Anime title
- Thumbnail URL
- Detail page URL (slug)
- Latest episode number (optional)

**Detail Page:**
- Title + alt titles
- Synopsis
- Genres, status, year
- Episode list (number + link)

**Episode Page:**
- Video iframe src
- Download links (quality + URL)
- Previous/next episode links

## Non-Goals (Don't Build)
- User accounts / favorites
- Database (MySQL/Postgres)
- API endpoints
- Admin panel
- Complex deduplication across sources
- Background jobs / queues
- File system caching
- Rate limiting per user
- CDN for images
- Video hosting

## Risks & Mitigations

**Risk 1: Sites change HTML structure**
- Mitigation: Keep selectors in config, easy to update

**Risk 2: Sites block scraping**
- Mitigation: Random user-agent, reasonable delays

**Risk 3: Video embeds don't work**
- Mitigation: Just pass through iframe src, let browser handle

**Risk 4: Too many requests crash server**
- Mitigation: Simple cache + no auto-refresh

## Success Metrics (Realistic)
- Can view latest anime from all 3 sites
- Can watch episodes without errors
- Page loads in < 3 seconds
- Works on mobile
- No crashes for 1 week

## Timeline
- Week 1: Phase 1 + 2 (single source working)
- Week 2: Phase 3 (all sources)
- Week 3: Phase 4 (polish + deploy)

Total: ~3 weeks part-time work

## Post-MVP (Maybe Later)
- Search functionality
- Filter by genre/status
- Pagination for homepage
- Better error pages
- Simple analytics (view counts)
```

