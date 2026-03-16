import { load } from "cheerio";
import { Database } from "bun:sqlite";
import { randomInt } from "crypto";

export interface FansubLink {
  provider: string;
  url: string;
}

export interface ScrapedAnime {
  title: string;
  anilistId: number | null;
  synopsis: string;
  genres: string[];
  airingDate: string;
  status: string;
  season: string;
  type: string;
  totalEpisodes: string;
  fansubLinks: FansubLink[];
}

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

export class SilveryashaIndexer {
  baseUrl = "https://db.silveryasha.id";
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: { "User-Agent": this.userAgent }
    });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.text();
  }

  private async cryptoSleep() {
    const delay = randomInt(3000, 7000);
    console.log(`[Stealth] Sleeping for ${delay}ms...`);
    await Bun.sleep(delay);
  }

  /**
   * Scrapes an anime detail page.
   */
  async scrapeDetail(url: string): Promise<ScrapedAnime | null> {
    try {
      const html = await this.fetchHtml(url);
      const $ = load(html);

      const title = $("h1.text-body-primary").text().trim();

      // AniList ID extraction: extract numeric ID from https://anilist.co/anime/6020
      const anilistHref = $('a[data-source="anilist"]').attr("href");
      const anilistId = anilistHref ? parseInt(anilistHref.match(/\/anime\/(\d+)/)?.[1] || "") : null;

      const synopsis = $("p.text-body-secondary").first().text().trim();

      const genres: string[] = [];
      $("span.filter-chip.active").each((_, el) => {
        genres.push($(el).text().trim());
      });

      const airingDate = $("div.airing-period span:nth-child(2)").text().trim();

      // Extract from metadata grid
      const episodes = $('p:contains("Episode")').next("p").text().trim();
      const season = $('p:contains("Musim")').next("p").text().trim();
      const type = $("span.badge.badge-primary").first().text().trim();

      // Fansub Links
      const fansubLinks: FansubLink[] = [];
      $(".project-card").each((_, el) => {
        const $card = $(el);
        const providerName = $card.find("a.line-clamp-1").text().trim().replace(/^✔\s*/, "");
        const directUrl = $card.find("a.btn-outline").attr("href");

        if (providerName && directUrl) {
          fansubLinks.push({ provider: providerName, url: directUrl });
        }
      });

      return {
        title,
        anilistId,
        synopsis,
        genres,
        airingDate,
        status: "Ongoing",
        season,
        type,
        totalEpisodes: episodes,
        fansubLinks
      };
    } catch (error) {
      console.error(`[Error] Failed to parse detail page ${url}:`, error);
      return null;
    }
  }

  /**
   * Manual season decrement logic
   */
  getPreviousSeason(year: number, season: string): { year: number, season: string } {
    const s = season.toLowerCase();
    if (s === 'winter') return { year: year - 1, season: 'fall' };
    if (s === 'fall') return { year, season: 'summer' };
    if (s === 'summer') return { year, season: 'spring' };
    if (s === 'spring') return { year, season: 'winter' };
    return { year: year - 1, season: 'winter' }; // Fallback
  }

  /**
   * Main indexer loop.
   * Starts from a given season and traverses backwards.
   */
  async runIndexer(startYear: number, startSeason: string, dbPath: string) {
    const db = new Database(dbPath, { create: true });

    // Ensure queue table exists
    db.run(`
  CREATE TABLE IF NOT EXISTS queue (
    url TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    anilist_id INTEGER,
    status TEXT DEFAULT 'PENDING'
  )
`);

    const insertStmt = db.prepare("INSERT OR IGNORE INTO queue (url, title, provider, anilist_id, status) VALUES ($url, $title, $provider, $anilist_id, 'PENDING')");

    let currentYear = startYear;
    let currentSeason = startSeason;

    while (currentYear >= 1990) { // Safety boundary
      const currentUrl = `${this.baseUrl}/anime/season/${currentYear}/${currentSeason}`;
      console.log(`\n[Traversal] Processing season: ${currentYear} ${currentSeason} (${currentUrl})`);

      let html: string;
      try {
        html = await this.fetchHtml(currentUrl);
      } catch (e) {
        console.warn(`[Warning] Could not fetch season ${currentYear} ${currentSeason}. Breaking.`);
        break;
      }

      const $ = load(html);

      // 1. Extract all anime detail links
      const animeLinks: string[] = [];
      $('a[href^="https://db.silveryasha.id/anime/"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href && /\/anime\/\d+$/.test(href)) {
          if (!animeLinks.includes(href)) animeLinks.push(href);
        }
      });

      console.log(`[Indexer] Found ${animeLinks.length} anime in this season.`);

      // 2. Process each anime
      const results: { anilistId: number | null, links: FansubLink[] }[] = [];

      for (const link of animeLinks) {
        console.log(`[Indexer] Scraping: ${link}`);
        const data = await this.scrapeDetail(link);

        if (data) {
          console.log(`[Success] Extracted: ${data.title} (${data.fansubLinks.length} links) AnilistID ${data.anilistId}`);

          results.push({
            anilistId: data.anilistId,
            links: data.fansubLinks
          });

          // 3. Inject into database queue
          db.transaction(() => {
            for (const fansub of data.fansubLinks) {
              insertStmt.run({
                $url: fansub.url,
                $title: data.title,
                $provider: fansub.provider,
                $anilist_id: data.anilistId // <-- INI YANG PALING PENTING
              });
            }
          })();
        }

        await this.cryptoSleep();
      }

      // Transition to previous season
      const next = this.getPreviousSeason(currentYear, currentSeason);
      currentYear = next.year;
      currentSeason = next.season;

      console.log(`[Traversal] Moving to next season: ${currentYear} ${currentSeason}`);
    }
  }
}

