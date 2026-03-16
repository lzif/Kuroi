import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode, VideoSource, SourceType } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeOploverzEpisode(url: string): Promise<AdapterResult> {
    const provider = 'Oploverz';
    try {
        const response = await fetch(url, {
            tls: { rejectUnauthorized: false }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('div[role="heading"][aria-level="3"]').first().text().trim();
        const episodeNumber = parseEpisodeNumber(title);
        const sources: VideoSource[] = [];

        $('div[data-accordion-item]').each((_, accordion) => {
            const format = $(accordion).find('button[data-accordion-trigger]').text().trim();

            $(accordion).find('.flex.flex-row.items-start.gap-5').each((_, row) => {
                const resolution = $(row).find('p').first().text().trim();
                $(row).find('a').each((_, a) => {
                    const server = $(a).text().trim();
                    const linkUrl = $(a).attr('href') || '';
                    if (linkUrl) {
                        // Classification logic
                        let type: SourceType = 'download_page';
                        if (linkUrl.includes('.mp4') || linkUrl.includes('.mkv')) type = 'mp4';

                        sources.push({ 
                            server: `${server} (${format})`,
                            resolution, 
                            url: linkUrl,
                            type
                        });
                    }
                });
            });
        });

        return { 
            success: true,
            animeTitle: title.replace(/Episode\s*\d+/i, '').trim(), 
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
const targetUrl = 'https://anime.oploverz.ac/series/oshi-no-ko-s3/episode/9';
scrapeOploverzEpisode(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
