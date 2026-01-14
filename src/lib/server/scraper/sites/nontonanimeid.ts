import { BaseScraper } from '../core';
import type { AnimeListItem, SearchResult, AnimeData, EpisodeData, DownloadLink, StreamingLink } from '../types';

export class NontonAnimeIDScraper extends BaseScraper {
  name = 'NontonAnimeID';
  baseUrl = 'https://s7.nontonanimeid.boats';

  async getHome(): Promise<{ ongoing: AnimeListItem[]; completed: AnimeListItem[] }> {
    // Generic AnimeStream/WordPress theme structure
    const $ = await this.fetchDOM(this.baseUrl);
    const ongoing: AnimeListItem[] = [];
    const completed: AnimeListItem[] = [];

    // Ongoing Section
    // Usually .listupd with a header or just the first list
    $('.listupd .bsx, article').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.tt, .title, h2').first().text().trim();
      if (!title) return;

      const link = $el.find('a').first().attr('href') || '';
      const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      
      const epText = $el.find('.epx, .limit').text();
      const episode = parseInt(epText.replace(/\D/g, '')) || 0;
      
      const statusText = $el.find('.status').text().toLowerCase();
      const status = statusText.includes('ongoing') ? 'ongoing' : 
                     statusText.includes('completed') ? 'completed' : 'ongoing'; // Default to ongoing for home list

      const item: AnimeListItem = {
        id: slug,
        slug,
        title,
        coverImage: image,
        status,
        episode,
        source: this.name,
      };
      
      if (status === 'completed') completed.push(item);
      else ongoing.push(item);
    });

    return { ongoing: ongoing.slice(0, 20), completed: completed.slice(0, 20) };
  }

  async search(query: string, page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/page/${page}/?s=${encodeURIComponent(query)}`;
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];

    $('.listupd .bsx, article').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.tt, .title, h2').text().trim();
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

    const hasNextPage = $('.next, .pagination .next').length > 0;

    return {
      results,
      hasNextPage,
      currentPage: page,
    };
  }

  async getOngoing(page: number = 1): Promise<SearchResult> {
    const url = `${this.baseUrl}/ongoing-anime/page/${page}/`; // Guessing URL
    const $ = await this.fetchDOM(url);
    const results: AnimeListItem[] = [];
    
    $('.listupd .bsx, article').each((_, el) => {
       // ... similar parsing
       const $el = $(el);
       const title = $el.find('.tt, .title').text().trim();
       const link = $el.find('a').attr('href') || '';
       const slug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
       const image = $el.find('img').attr('src') || '';
       
       if (title) {
           results.push({
               id: slug,
               slug,
               title,
               coverImage: image,
               status: 'ongoing',
               source: this.name
           });
       }
    });
    
    const hasNextPage = $('.next').length > 0;
    return { results, hasNextPage, currentPage: page };
  }

  async getCompleted(page: number = 1): Promise<SearchResult> {
     // Assuming similar structure or just search with status
     return { results: [], hasNextPage: false, currentPage: page };
  }

  async getAnimeDetail(slug: string): Promise<AnimeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);

    const title = $('.entry-title, .infox h1').first().text().trim();
    const coverImage = $('.thumb img').first().attr('src') || '';
    const synopsis = $('.entry-content, .desc').first().text().trim();
    
    const genres: string[] = [];
    $('.genre a, .genxed a').each((_, el) => genres.push($(el).text()));

    let score = 0;
    const ratingText = $('.rating, .score').text();
    if (ratingText) score = parseFloat(ratingText) || 0;

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
      totalEpisodes: 0,
      score,
      releaseYear: 0,
      source: this.name,
    };
  }

  async getEpisodeList(slug: string): Promise<EpisodeData[]> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const episodes: EpisodeData[] = [];

    // Standard listupd or eplister
    $('#lsteps ul li, .eplister ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const epSlug = link.replace(this.baseUrl, '').replace(/^\//, '').replace(/\/$/, '');
      const epNumStr = $el.find('.nume, .epnum').text();
      const epNum = parseInt(epNumStr.replace(/\D/g, '')) || 0;
      const title = $el.find('.lchx').text();

      if (link) {
          episodes.push({
            id: epSlug,
            animeId: slug,
            episodeNumber: epNum,
            title: title || `Episode ${epNum}`,
            downloadLinks: [],
            streamLinks: []
          });
      }
    });

    return episodes.reverse(); // Usually listed new to old
  }

  async getWatch(slug: string, episodeNumber: number): Promise<EpisodeData> {
    const url = this.resolveUrl(slug);
    const $ = await this.fetchDOM(url);
    const title = $('.entry-title').text().trim();
    
    const streamLinks: StreamingLink[] = [];
    
    // Check iframes
    $('iframe').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) {
            streamLinks.push({ server: 'Stream', url: src });
        }
    });
    
    // Check select options for mirrors
    $('.mirror option').each((_, el) => {
         const val = $(el).val() as string;
         if (val) {
             // value might be base64 or url
             streamLinks.push({ server: $(el).text(), url: val });
         }
    });

    return {
        id: slug,
        animeId: slug.split('-episode')[0],
        episodeNumber,
        title,
        downloadLinks: [],
        streamLinks
    };
  }
}
