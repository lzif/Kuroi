import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode, VideoSource, SourceType } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeDoroni(url: string): Promise<AdapterResult> {
    const provider = 'Doroni';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.Content__title').text().trim();
        const episodeNumber = parseEpisodeNumber(title);
        const sources: VideoSource[] = [];

        $('.Download__group').each((_, group) => {
            const resolution = $(group).find('.Download__group-title').text().trim();
            $(group).find('.Download__link span a').each((_, a) => {
                const server = $(a).find('.d-none.d-md-block').text().trim() || $(a).text().trim();
                const linkUrl = $(a).attr('href') || '';
                if (linkUrl) {
                    sources.push({ server, resolution, url: linkUrl, type: 'download_page' });
                }
            });
        });

        return { 
            success: true,
            animeTitle: title.replace(/Episode\s*\d+/i, '').replace(/Subtitle Indonesia/i, '').trim(), 
            episodes: [{
                provider,
                episodeNumber,
                title,
                sources
            }]
        };
    } catch (error: any) {
        return {
            success: false,
            animeTitle: '',
            episodes: [],
            error: error.message
        };
    }
}

// Target URL
const targetUrl = 'https://doroni.me/anime/perjalanan-tiada-akhir-frieren-2/episode-8';
scrapeDoroni(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
