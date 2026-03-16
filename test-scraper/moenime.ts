import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode, VideoSource, SourceType } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeMoenime(url: string): Promise<AdapterResult> {
    const provider = 'Moenime';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeTitle = $('h1.entry-title').text().trim();
        const episodes: ScrapedEpisode[] = [];

        $('.moe-dl-link').each((_, el) => {
            const rawResolution = $(el).find('.tombol b').text().trim();
            const resolutionMatch = rawResolution.match(/\d+p/);
            const resolution = resolutionMatch ? resolutionMatch[0] : 'unknown';
            
            $(el).find('.isi-dl tr').each((_, tr) => {
                const epLabel = $(tr).find('td center').first().text().trim();
                if (!epLabel || epLabel.includes('|')) return;

                const epFullTitle = epLabel.split('—')[0].trim();
                const episodeNumber = parseEpisodeNumber(epFullTitle);
                if (episodeNumber === 0) return;

                const sources: VideoSource[] = [];
                const nextTr = $(tr).next();
                
                nextTr.find('a').each((_, a) => {
                    const linkUrl = $(a).attr('href') || '';
                    if (linkUrl) {
                        sources.push({
                            server: $(a).text().trim(),
                            resolution,
                            size: epLabel.match(/\(([^)]+)\)/)?.[1] || '',
                            url: linkUrl,
                            type: 'shortlink' // Moenime mostly uses ouo.io
                        });
                    }
                });

                if (sources.length > 0) {
                    const existingEp = episodes.find(e => e.episodeNumber === episodeNumber);
                    if (existingEp) {
                        existingEp.sources.push(...sources);
                    } else {
                        episodes.push({ 
                            provider,
                            episodeNumber,
                            title: epFullTitle, 
                            sources 
                        });
                    }
                }
            });
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

const targetUrl = 'https://moenime.com/liar-liar-sub-indo/';
scrapeMoenime(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
