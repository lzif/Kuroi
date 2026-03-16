import { load } from "cheerio";
import type { ProviderAdapter, AnimeInfo, AnimeDetail, EpisodeInfo, SearchResult, WatchData } from "./ProviderAdapter";

export class SamehadakuV2Adapter implements ProviderAdapter {
  name = "SamehadakuV2";
  baseUrl = "https://v2.samehadaku.how";

  private async fetchHtml(url: string, extraHeaders?: Record<string, string>): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...extraHeaders
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.text();
  }

  /**
   * Scrapes the full anime list from the text-mode page.
   */
  async scrapeFullList(): Promise<AnimeInfo[]> {
    const html = await this.fetchHtml(`${this.baseUrl}/daftar-anime-2/?list`);
    const $ = load(html);
    const animeList: AnimeInfo[] = [];

    $(".listbar .listttl ul li a").each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const url = $el.attr("href") || "";

      if (title && url) {
        animeList.push({ title, url });
      }
    });

    return animeList;
  }

  /**
   * Scrapes the ongoing anime list from the "Anime Terbaru" page.
   */
  async scrapeOngoing(page: number = 1): Promise<AnimeInfo[]> {
    const url = `${this.baseUrl}/anime-terbaru/page/${page}/`;
    const html = await this.fetchHtml(url);
    const $ = load(html);
    const results: AnimeInfo[] = [];

    $(".post-show ul li").each((_, el) => {
      const $el = $(el);
      const title = $el.find(".dtla .entry-title a").text().trim();
      const link = $el.find(".dtla .entry-title a").attr("href") || "";
      const image = $el.find(".thumb img").attr("src") || "";
      const epText = $el.find(".dtla span author").first().text().trim();
      const postedBy = $el.find(".dtla .author author").text().trim();
      const releasedOn = $el.find(".dtla span:contains('Released on')").text().replace("Released on:", "").trim();

      if (title && link) {
        results.push({
          title,
          url: link,
          image,
          status: epText ? `Episode ${epText}` : "Ongoing",
          postedBy,
          releasedOn
        });
      }
    });

    return results;
  }

  /**
   * Scrapes detailed information for a specific anime.
   */
  async scrapeAnimeDetail(url: string): Promise<AnimeDetail> {
    const html = await this.fetchHtml(url);
    const $ = load(html);

    const title = $(".infoanime .entry-title")
      .text()
      .trim()
      .replace("Nonton Anime ", "");
    const image = $(".infoanime .thumb img").attr("src");
    const score = $(".infoanime .rating-area span[itemprop='ratingValue']")
      .text()
      .trim();
    const synopsis = $(".infoanime .desc .entry-content").text().trim();
    const genres = $(".infoanime .genre-info a")
      .map((_, el) => $(el).text().trim())
      .get();

    // Extra metadata from "spe" class
    const japanese = $(".spe span:contains('Japanese')").text().replace("Japanese", "").trim();
    const synonyms = $(".spe span:contains('Synonyms')").text().replace("Synonyms", "").trim();
    const type = $(".spe span:contains('Type')").text().replace("Type", "").trim();
    const releaseYear = $(".spe span:contains('Aired')").text().replace("Aired", "").trim().match(/\d{4}/)?.[0] || "";
    const totalEpisodesStr = $(".spe span:contains('Episodes')").text().replace("Episodes", "").trim();
    const totalEpisodes = parseInt(totalEpisodesStr) || 0;

    const episodes: EpisodeInfo[] = [];
    $(".lsteps ul li").each((_, el) => {
      const $el = $(el);
      const link = $el.find(".eps a").attr("href") || "";
      const epText = $el.find(".eps a").text().trim();
      const epNum = parseInt(epText.replace(/\D/g, "")) || 0;
      const epTitle = $el.find(".lchx a").text().trim();
      const date = $el.find(".date").text().trim();

      if (link) {
        episodes.push({
          number: epNum,
          episodeNumber: epNum, // Svelte support
          title: epTitle,
          url: link,
          date
        });
      }
    });

    const urlParts = url.split('/').filter(Boolean);
    const slug = urlParts[urlParts.length - 1];

    return {
      title,
      url,
      image,
      coverImage: image, // Svelte support
      slug,              // Svelte support
      source: 'samehadaku', // Svelte support
      type,
      score,
      synopsis,
      genres,
      japanese,
      synonyms,
      releaseYear,       // Svelte support
      totalEpisodes,     // Svelte support
      episodes: episodes.sort((a, b) => b.number - a.number),
    };
  }

  /**
   * Searches for anime based on a query.
   */
  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`;
    try {
      const html = await this.fetchHtml(url);
      const $ = load(html);
      const results: AnimeInfo[] = [];

      $("main#main .animpost").each((_, el) => {
        const title = $(el).find(".animepost .tt h2").text().trim() || $(el).find(".title h2").text().trim();
        const link = $(el).find(".animepost .mner a").attr("href") || $(el).find("a").attr("href") || "";
        const image = $(el).find("img").attr("src") || "";
        const score = $(el).find(".score").text().trim();
        const type = $(el).find(".type").text().trim();

        if (title && link) {
          const urlParts = link.split('/').filter(Boolean);
          const slug = urlParts[urlParts.length - 1];

          results.push({ 
            title, 
            url: link, 
            image, 
            coverImage: image, 
            slug, 
            source: 'samehadaku', 
            score, 
            type 
          });
        }
      });

      return {
        results,
        hasNextPage: results.length > 0, // Simplified pagination check
        currentPage: page
      };
    } catch (e) {
      // Return empty if 404 or page doesn't exist
      return { results: [], hasNextPage: false, currentPage: page };
    }
  }

  /**
   * Extracts streaming links from an episode URL using WordPress AJAX.
   */
  async extractStreamLinks(episodeUrl: string): Promise<WatchData> {
    console.log(`[Adapter] Extracting iframes from: ${episodeUrl}`);
    
    // 1. Fetch main page to get Cookies
    const res = await fetch(episodeUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
    });

    if (!res.ok) throw new Error(`[Adapter] Failed to fetch episode page: ${res.status}`);

    const html = await res.text();
    const cookies = res.headers.get('set-cookie') || "";
    const $ = load(html);

    const streamLinks: { server: string, url: string }[] = [];
    const ajaxTasks: Promise<void>[] = [];

    // 2. Loop through all server buttons
    $('div#server > ul > li').each((_, li) => {
      const div = $(li).find('div');
      const post = div.attr('data-post');
      const nume = div.attr('data-nume');
      const type = div.attr('data-type');
      const serverName = $(li).find('span').text().trim();

      if (!post) return;

      // 3. Trigger WordPress AJAX
      const body = new URLSearchParams({ 
        action: 'player_ajax', 
        post: post as string, 
        nume: nume || '', 
        type: type || '' 
      });

      const task = fetch(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
        method: 'POST',
        body: body.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies,
          'Referer': episodeUrl, // Important for bypassing hotlink protection
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      }).then(async (ajaxRes) => {
        const ajaxHtml = await ajaxRes.text();
        const $$ = load(ajaxHtml);
        const iframeUrl = $$('iframe').attr('src');

        if (iframeUrl) {
          streamLinks.push({ server: serverName, url: iframeUrl });
        }
      }).catch(err => console.error(`[Adapter] Failed to extract server ${serverName}:`, err.message));

      ajaxTasks.push(task);
    });

    await Promise.all(ajaxTasks);

    return { streamLinks, downloadLinks: [] };
  }
}
