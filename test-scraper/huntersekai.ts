import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode, VideoSource, SourceType } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeHunterSekai(url: string): Promise<AdapterResult> {
    const provider = 'HunterSekai';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeTitle = $('h1.font-outfit').text().trim();
        const episodes: ScrapedEpisode[] = [];

        $('#download ul').each((_, ul) => {
            const epFullTitle = $(ul).find('h3').text().trim();
            const episodeNumber = parseEpisodeNumber(epFullTitle);
            const sources: VideoSource[] = [];

            $(ul).find('li').each((_, li) => {
                const resolution = $(li).find('b').text().replace(':', '').trim();
                const size = $(li).find('#size').text().trim();
                const linkUrl = $(li).find('a').attr('href') || '';

                if (linkUrl) {
                    const server = $(li).find('a').text().trim();
                    // Classification logic
                    let type: SourceType = 'shortlink';
                    if (linkUrl.includes('drive.google.com')) type = 'mp4';
                    
                    sources.push({ 
                        server,
                        resolution, 
                        url: linkUrl,
                        type,
                        size
                    });
                }
            });

            if (episodeNumber > 0) {
                episodes.push({ 
                    provider,
                    episodeNumber,
                    title: epFullTitle, 
                    sources 
                });
            }
        });

        return { 
            success: true,
            animeTitle, 
            episodes 
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
const targetUrl = 'https://huntersekai.fansub.my.id/2026/01/omae-gotoki-ga-maou-ni-kateru-to-omouna.html?m=1';
scrapeHunterSekai(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
