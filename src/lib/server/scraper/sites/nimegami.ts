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
    
    // Synopsis
    const synopsis = $('#Sinopsis p').first().text().trim() || $('.entry-content p').first().text().trim();

    // Cover Image
    let coverImage = '';
    const scriptContent = $('script').filter((_, el) => ($(el).html() || '').includes('const poster')).html();
    const match = scriptContent?.match(/const poster = "(.*?)";/);
    if (match) {
      try {
        coverImage = atob(match[1]);
      } catch (e) {
        console.warn('Failed to decode poster', e);
      }
    }
    if (!coverImage) {
        coverImage = $('.thumb img, .entry-content img, .video-streaming img').first().attr('src') || '';
    }

    // Metadata
    let totalEpisodes = 0;
    let score = 0;
    let releaseYear = 0;
    let type: any = 'unknown';
    let status: any = 'unknown';
    const genres: string[] = [];

    $('.info2 table tr').each((_, el) => {
        const $el = $(el);
        const key = $el.find('td').first().text().toLowerCase();
        const value = $el.find('td').last();
        const valueText = value.text().trim();

        if (key.includes('type')) {
            if (valueText.toLowerCase().includes('tv')) type = 'tv';
            else if (valueText.toLowerCase().includes('movie')) type = 'movie';
        }
        if (key.includes('status')) {
            if (valueText.toLowerCase().includes('ongoing')) status = 'ongoing';
            else if (valueText.toLowerCase().includes('complete')) status = 'completed';
        }
        if (key.includes('rating')) {
            score = parseFloat(valueText) || 0;
        }
        if (key.includes('musim') || key.includes('rilis')) {
             const yearMatch = valueText.match(/(\d{4})/);
             if (yearMatch) releaseYear = parseInt(yearMatch[1]);
        }
        if (key.includes('kategori')) {
            value.find('a').each((_, a) => genres.push($(a).text()));
        }
    });
    
    // Fallback parsing if table not found
    if (status === 'unknown') {
        const contentText = $('.entry-content').text();
        if (contentText.includes('Status: Ongoing')) status = 'ongoing';
        if (contentText.includes('Status: Complete')) status = 'completed';
    }

    return {
      id: slug,
      slug,
      title,
      alternativeTitles: [],
      synopsis,
      coverImage,
      genres,
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

    // Pattern: Batch/Single page with headers for episodes
    $('h4').each((_, el) => {
      const text = $(el).text();
      const epMatch = text.match(/Episode\s+(\d+)/i);
      
      if (epMatch) {
        const epNum = parseInt(epMatch[1]);
        // Avoid duplicates if multiple headers exist or duplicate logic
        if (!episodes.find(e => e.episodeNumber === epNum)) {
             episodes.push({
                id: `${slug}-episode-${epNum}`,
                animeId: slug,
                episodeNumber: epNum,
                title: text,
                downloadLinks: [], // Populated in getWatch to save bandwidth/parsing time or could populate here
                streamLinks: []
             });
        }
      }
    });
    
    // Pattern 2: List of links (old style) if no h4 matches found
    if (episodes.length === 0) {
        $('a').each((_, el) => {
            const text = $(el).text();
            const href = $(el).attr('href');
            if (text.match(/Episode\s+\d+/i) && href && href.includes(this.baseUrl)) {
                const epSlug = href.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
                const epNumMatch = text.match(/Episode\s+(\d+)/i);
                const epNum = epNumMatch ? parseInt(epNumMatch[1]) : 0;

                if (epNum > 0 && !episodes.find(e => e.episodeNumber === epNum)) {
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
    }

    return episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const title = $('.entry-title, h1').text().trim();

    const downloadLinks: DownloadLink[] = [];
    const streamLinks: StreamingLink[] = [];

    // Try to find the specific episode section
    let $epHeader = $('h4').filter((_, el) => {
        const text = $(el).text();
        // Strict match for episode number to avoid matching "Episode 14" when searching for "1"
        return text.match(new RegExp(`Episode\\s+${episodeNumber}(?![0-9])`, 'i')) !== null;
    }).first();

    if ($epHeader.length) {
        // Find the following list(s)
        const $ul = $epHeader.next('ul');
        $ul.find('li').each((_, el) => {
            const $el = $(el);
            const qualityWithHost = $el.text(); // e.g. "360p MiteDrive (360p)Krakenfiles (360p)"
            const qualityMatch = $el.find('strong').text(); // "360p"
            const quality = qualityMatch || 'Unknown';
            
            $el.find('a').each((_, a) => {
                const $a = $(a);
                const host = $a.text().trim();
                const href = $a.attr('href') || '';
                if (href) {
                     downloadLinks.push({
                         quality,
                         host,
                         url: href
                     });
                }
            });
        });
    } else {
        // Fallback for single episode pages (old style)
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
        
        $('iframe').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) {
                streamLinks.push({
                server: 'Stream',
                url: src
                });
            }
        });
    }

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
