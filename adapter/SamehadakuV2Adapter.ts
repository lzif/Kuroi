import { load } from "cheerio";
import type { ProviderAdapter, AnimeInfo, AnimeDetail, EpisodeInfo } from "./ProviderAdapter";

export class SamehadakuV2Adapter implements ProviderAdapter {
  name = "SamehadakuV2";
  baseUrl = "https://v2.samehadaku.how";

  private async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url);
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
          title: epTitle,
          url: link,
          date
        });
      }
    });

    return {
      title,
      url,
      image,
      score,
      synopsis,
      genres,
      japanese,
      synonyms,
      episodes: episodes.sort((a, b) => b.number - a.number),
    };
  }
}
