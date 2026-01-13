import { BaseScraper } from '../core';
import type { AnimeListItem, SearchResult, AnimeData, EpisodeData, DownloadLink, StreamingLink } from '../types';
import * as cheerio from 'cheerio';

export class NimegamiScraper extends BaseScraper {
  name = 'Nimegami';
  baseUrl = 'https://nimegami.id';

  async getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }> {
    const $ = await this.fetchDOM(this.baseUrl);
    const ongoing: AnimeListItem[] = [];
    const completed: AnimeListItem[] = [];

    const articles = $('article');

    articles.each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title, h2, h3').first().text().trim();
      if (!title) return;

      const link = $el.find('a').first().attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';

      const statusText = $el.text().toLowerCase();
      const status = statusText.includes('ongoing') ? 'ongoing' :
        statusText.includes('complete') ? 'completed' : 'unknown';

      const item: AnimeListItem = {
        id: slug,
        slug: slug,
        title,
        coverImage: image,
        status,
        source: this.name,
      };

      if (status === 'ongoing') {
        ongoing.push(item);
      } else if (status === 'completed') {
        completed.push(item);
      } else {
        ongoing.push(item);
      }
    });

    return { ongoing: ongoing.slice(0, 10), completed: completed.slice(0, 10) };
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('article').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title, h2, h3').first().text().trim();
      const link = $el.find('a').first().attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || '';

      if (title && slug) {
        results.push({
          id: slug,
          slug,
          title,
          coverImage: image,
          source: this.name,
        });
      }
    });

    const hasNextPage = $('.next, .nav-links .next').length > 0;

    return {
      results,
      hasNextPage,
      currentPage: page,
    };
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/tag/on-going/page/${page}/`;
    return this.parseList(url, page);
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/tag/complete/page/${page}/`;
    return this.parseList(url, page);
  }

  private async parseList(url: string, page: number): Promise<SearchResult> {
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('article').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title, h2, h3').first().text().trim();
      const link = $el.find('a').first().attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || '';

      if (title && slug) {
        results.push({
          id: slug,
          slug,
          title,
          coverImage: image,
          source: this.name,
        });
      }
    });

    const hasNextPage = $('.next, .nav-links .next').length > 0;
    return { results, hasNextPage, currentPage: page };
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);

    const title = $('.entry-title, h1').text().trim();
    const coverImage = $('.thumb img, .entry-content img').first().attr('src') || '';
    const synopsis = $('.entry-content p').first().text().trim();

    let totalEpisodes = 0;
    let score = 0;
    let releaseYear = 0;
    let type: any = 'unknown';
    let status: any = 'unknown';

    const contentText = $('.entry-content').text();
    if (contentText.includes('Type: TV')) type = 'tv';
    if (contentText.includes('Status: Ongoing')) status = 'ongoing';
    if (contentText.includes('Status: Complete')) status = 'completed';

    return {
      id: slug,
      slug,
      title,
      alternativeTitles: [],
      synopsis,
      coverImage,
      genres: [],
      status,
      type,
      totalEpisodes,
      score,
      releaseYear,
      source: this.name,
    };
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const episodes: EpisodeData[] = [];

    // Try to find episode links in content
    // Nimegami often uses a list of links for episodes in "Batch" or single posts
    // Structure varies widely. Looking for common patterns.

    // Pattern 1: List of links with text "Episode X"
    $('a').each((_, el) => {
      const text = $(el).text();
      const href = $(el).attr('href');
      if (text.match(/Episode\s+\d+/i) && href && href.includes(this.baseUrl)) {
        const epSlug = href.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
        const epNumMatch = text.match(/Episode\s+(\d+)/i);
        const epNum = epNumMatch ? parseInt(epNumMatch[1]) : 0;

        if (epNum > 0) {
          episodes.push({
            id: epSlug,
            animeId: slug,
            episodeNumber: epNum,
            title: text,
            downloadLinks: [],
            streamLinks: []
          });
        }
      }
    });

    return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const title = $('.entry-title, h1').text().trim();

    const downloadLinks: DownloadLink[] = [];
    const streamLinks: StreamingLink[] = [];

    // Extract download links (often in .download-box or tables)
    // Nimegami uses various structures. 
    // Generic approach: Find links that look like file hosts (Google Drive, etc)
    // and group them.

    $('.download-box, .box-download, table.download').find('a').each((_, el) => {
      const $el = $(el);
      const host = $el.text().trim();
      const href = $el.attr('href') || '';
      const quality = $el.closest('tr').find('td').first().text().trim() || 'Unknown';

      if (href) {
        downloadLinks.push({
          quality,
          host,
          url: href
        });
      }
    });

    // Stream links often embedded in iframes
    $('iframe').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) {
        streamLinks.push({
          server: 'Stream',
          url: src
        });
      }
    });

    return {
      id: slug,
      animeId: slug,
      episodeNumber,
      title,
      downloadLinks,
      streamLinks,
    };
  }
}

