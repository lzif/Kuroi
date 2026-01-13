import { BaseScraper } from '../core';
import type { AnimeListItem, SearchResult, AnimeData, EpisodeData, DownloadLink, StreamingLink } from '../types';

export class SamehadakuScraper extends BaseScraper {
  name = 'Samehadaku';
  baseUrl = 'https://samehadaku.li';

  async getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }> {
    const $ = await this.fetchDOM(this.baseUrl);
    const ongoing: AnimeListItem[] = [];
    const completed: AnimeListItem[] = [];

    // Attempt 1: .post-show ul li
    $('.post-show ul li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.entry-title a').text().trim();
      const link = $el.find('.entry-title a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const epText = $el.find('span:contains("Ep")').text();
      const episode = parseInt(epText.replace(/\D/g, '')) || 0;

      if (title && slug) {
        ongoing.push({
          id: slug,
          slug,
          title,
          coverImage: image,
          status: 'ongoing',
          episode,
          source: this.name
        });
      }
    });

    // Attempt 2: Generic list if first failed (based on text dump structure, looks like a list)
    if (ongoing.length === 0) {
      // Based on dump, there is "Latest Release" followed by items.
      // It seems they might be using a different structure or the dump is text representation.
      // Let's try searching for "Latest Release" header and then the list.
      // Or just `ul li` inside a main container.
      // Try looking for items with 'Ep' in them.
      $('li').each((_, el) => {
        const text = $(el).text();
        if (text.includes('Ep') && text.includes('Sub')) {
          const $el = $(el);
          const title = $el.find('a').first().text().trim();
          const link = $el.find('a').first().attr('href') || '';
          if (link && title) {
            const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
            const image = $el.find('img').attr('src') || '';
            const epText = text.match(/Ep\s+(\d+)/)?.[1] || '0';

            if (!ongoing.find(o => o.slug === slug)) {
              ongoing.push({
                id: slug,
                slug,
                title,
                coverImage: image,
                status: 'ongoing',
                episode: parseInt(epText),
                source: this.name
              });
            }
          }
        }
      });
    }

    return { ongoing: ongoing.slice(0, 15), completed };
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('main .animpost').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.title').text().trim();
      const link = $el.find('a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || '';

      if (title) {
        results.push({
          id: slug,
          slug,
          title,
          coverImage: image,
          source: this.name
        });
      }
    });

    if (results.length === 0) {
      $('article').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.entry-title, h2').text().trim();
        const link = $el.find('a').attr('href') || '';
        const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
        const image = $el.find('img').attr('src') || '';
        if (title && slug) {
          results.push({
            id: slug,
            slug,
            title,
            coverImage: image,
            source: this.name
          });
        }
      });
    }

    const hasNextPage = $('.pagination .next').length > 0;
    return { results, hasNextPage, currentPage: page };
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/anime-terbaru/page/${page}/`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];
    $('.post-show ul li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.entry-title a').text().trim();
      const link = $el.find('.entry-title a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || '';

      results.push({
        id: slug,
        slug,
        title,
        coverImage: image,
        status: 'ongoing',
        source: this.name
      });
    });

    const hasNextPage = $('.pagination .next').length > 0;
    return { results, hasNextPage, currentPage: page };
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/daftar-anime/page/${page}/?status=completed&order=update`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];
    return { results, hasNextPage: false, currentPage: page };
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);

    const title = $('.info-anime .entry-title, h1.entry-title').first().text().trim();
    const coverImage = $('.info-anime img, .thumb img').attr('src') || '';
    const synopsis = $('.desc-anime, .entry-content').first().text().trim();

    const genres: string[] = [];
    $('.genre-info a, .genre a').each((_, el) => {
      genres.push($(el).text());
    });

    return {
      id: slug,
      slug,
      title,
      alternativeTitles: [],
      synopsis,
      coverImage,
      genres,
      status: 'unknown',
      type: 'tv',
      source: this.name
    };
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const episodes: EpisodeData[] = [];

    $('.lsteps ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const epSlug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const epNum = parseInt($el.find('.eps a').text().replace(/\D/g, '')) || 0;
      const title = $el.find('.lchx a').text();

      episodes.push({
        id: epSlug,
        animeId: slug,
        episodeNumber: epNum,
        title,
        downloadLinks: [],
        streamLinks: [],
      });
    });

    return episodes;
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const title = $('h1.entry-title').text();

    const streamLinks: StreamingLink[] = [];
    const downloadLinks: DownloadLink[] = [];
    $('#server ul li div').each((_, el) => {
      const serverName = $(el).text();
      const serverUrl = $(el).attr('data-post') || '';
      streamLinks.push({ server: serverName, url: serverUrl });
    });

    return {
      id: slug,
      animeId: slug.split('-episode')[0],
      episodeNumber,
      title,
      downloadLinks,
      streamLinks
    };
  }
}

