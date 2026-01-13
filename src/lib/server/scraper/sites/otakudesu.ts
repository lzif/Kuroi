import { BaseScraper } from '../core';
import type { AnimeListItem, SearchResult, AnimeData, EpisodeData, DownloadLink, StreamingLink } from '../types';

export class OtakudesuScraper extends BaseScraper {
  name = 'Otakudesu';
  baseUrl = 'https://otakudesu.best';

  async getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }> {
    const $ = await this.fetchDOM(this.baseUrl);
    const ongoing: AnimeListItem[] = [];
    const completed: AnimeListItem[] = [];

    // Ongoing
    // Structure: .venz ul li 
    // The first .venz is usually ongoing
    const ongoingContainer = $('.venz').first();
    ongoingContainer.find('ul li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.jdlflm').text().trim();
      const link = $el.find('.jdlflm a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('.thumbz img').attr('src') || '';
      const epText = $el.find('.epz').text();
      const episode = parseInt(epText.replace(/\D/g, '')) || 0;
      const day = $el.find('.epztipe').text().trim();

      if (title) {
        ongoing.push({
          id: slug,
          slug,
          title,
          coverImage: image,
          status: 'ongoing',
          episode,
          source: this.name,
          releaseDate: day
        });
      }
    });

    // Completed
    // The last .venz or one with ID/class suggesting completed
    const completedContainer = $('.venz').last(); // Fallback to last if specific one not found
    // Or check header text
    $('.venz').each((_, el) => {
      const header = $(el).prev().text() || $(el).find('h3').text(); // Check previous element for header "Complete Anime"
      if (header.includes('Complete') || $(el).text().includes('Complete Anime')) {
        $(el).find('ul li').each((_, li) => {
          const $el = $(li);
          const title = $el.find('.jdlflm').text().trim();
          const link = $el.find('.jdlflm a').attr('href') || '';
          const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
          const image = $el.find('.thumbz img').attr('src') || '';
          const score = parseFloat($el.find('.epz').text().replace(/[^0-9.]/g, '')) || 0;

          if (title) {
            completed.push({
              id: slug,
              slug,
              title,
              coverImage: image,
              status: 'completed',
              score,
              source: this.name
            });
          }
        });
      }
    });

    // If completed list empty, try the strategy of last .venz
    if (completed.length === 0) {
      completedContainer.find('ul li').each((_, el) => {
        const $el = $(el);
        const title = $el.find('.jdlflm').text().trim();
        const link = $el.find('.jdlflm a').attr('href') || '';
        const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
        const image = $el.find('.thumbz img').attr('src') || '';
        const score = parseFloat($el.find('.epz').text().replace(/[^0-9.]/g, '')) || 0;

        if (title && !ongoing.find(o => o.slug === slug)) { // Avoid duplicates if scraping same list
          completed.push({
            id: slug,
            slug,
            title,
            coverImage: image,
            status: 'completed',
            score,
            source: this.name
          });
        }
      });
    }

    return { ongoing, completed };
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('.chivsrc li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2 a').text().trim();
      const link = $el.find('h2 a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || '';
      const status = $el.find('.set').first().text().includes('Ongoing') ? 'ongoing' : 'completed';

      results.push({
        id: slug,
        slug,
        title,
        coverImage: image,
        status: status as any,
        source: this.name
      });
    });

    return { results, hasNextPage: false, currentPage: 1 };
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/ongoing-anime/page/${page}/`;
    return this.parseList(url, page);
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/complete-anime/page/${page}/`;
    return this.parseList(url, page);
  }

  private async parseList(url: string, page: number): Promise<SearchResult> {
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('.venz li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.jdlflm').text().trim();
      const link = $el.find('.jdlflm a').attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('.thumbz img').attr('src') || '';

      results.push({
        id: slug,
        slug,
        title,
        coverImage: image,
        source: this.name
      });
    });

    const hasNextPage = $('.pagination .next').length > 0;
    return { results, hasNextPage, currentPage: page };
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);

    const title = $('.jdlrx h1, .infozray h1').text().trim();
    const coverImage = $('.fotoanime img').attr('src') || '';
    const synopsis = $('.sinopc').text().trim();

    const info: any = {};
    $('.infozray p').each((_, el) => {
      const text = $(el).text();
      const parts = text.split(':');
      if (parts.length > 1) {
        const key = parts[0].trim().toLowerCase();
        const value = parts.slice(1).join(':').trim();
        info[key] = value;
      }
    });

    return {
      id: slug,
      slug,
      title,
      alternativeTitles: [],
      synopsis,
      coverImage,
      genres: info.genre ? info.genre.split(',').map((s: string) => s.trim()) : [],
      status: info.status?.toLowerCase().includes('ongoing') ? 'ongoing' : 'completed',
      type: 'tv', // Default
      score: parseFloat(info.skor) || 0,
      source: this.name
    };
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const episodes: EpisodeData[] = [];

    $('#dpl ul li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('a').text();
      const link = $el.find('a').attr('href') || '';
      const epSlug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const date = $el.find('.tgl').text();
      const match = title.match(/Episode\s+(\d+)/i);
      const episodeNumber = match ? parseInt(match[1]) : 0;

      episodes.push({
        id: epSlug,
        animeId: slug,
        episodeNumber,
        title,
        downloadLinks: [],
        streamLinks: [],
        releaseDate: date
      });
    });

    return episodes;
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);

    const title = $('.posttl').text();
    const streamLinks: StreamingLink[] = [];
    const downloadLinks: DownloadLink[] = [];

    // Stream links
    $('.mirrorstream ul li').each((_, el) => {
      const serverName = $(el).find('a').text();
      const content = $(el).find('a').attr('data-content');
      if (content) {
        try {
          const decoded = JSON.parse(atob(content));
          streamLinks.push({ server: serverName, url: decoded.url || '' });
        } catch (e) {
          // ignore
        }
      }
    });

    // Download links
    $('.download ul li').each((_, el) => {
      const quality = $(el).find('strong').text();
      $(el).find('a').each((_, link) => {
        downloadLinks.push({
          quality,
          host: $(link).text(),
          url: $(link).attr('href') || ''
        });
      });
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

