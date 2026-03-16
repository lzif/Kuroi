import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode, VideoSource, SourceType } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeIsekaisubs(url: string): Promise<AdapterResult> {
    const provider = 'Isekaisubs';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('h1.entry-title').text().trim();
        const episodeNumber = parseEpisodeNumber(title);
        const sources: VideoSource[] = [];

        $('.soraurlx').each((_, el) => {
            const resolution = $(el).find('strong').text().trim();
            $(el).find('a').each((_, a) => {
                const server = $(a).text().trim();
                const linkUrl = $(a).attr('href') || '';
                if (linkUrl) {
                    let type: SourceType = 'download_page';
                    if (linkUrl.includes('drive.google.com')) type = 'mp4';

                    sources.push({ server, resolution, url: linkUrl, type });
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

// Target URL (Episode Page)
const targetUrl = 'https://isekaisubs.web.id/dark-moon-tsuki-no-saidan-episode-10-subtitle-indonesia/';
scrapeIsekaisubs(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
