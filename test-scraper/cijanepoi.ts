import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedEpisode } from './types';

function parseEpisodeNumber(title: string): number {
    const match = title.match(/Episode\s*(\d+)/i);
    return match ? parseInt(match[1]) : 0;
}

async function scrapeCijanepoi(url: string): Promise<AdapterResult> {
    const provider = 'Cijanepoi';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeTitle = $('h1.entry-title').text().trim();
        const episodes: ScrapedEpisode[] = [];

        $('.epslist tbody tr').each((_, tr) => {
            const tds = $(tr).find('td');
            if (tds.length >= 4) {
                const epFullTitle = $(tds[1]).text().trim();
                const episodeNumber = parseEpisodeNumber(epFullTitle) || parseInt($(tds[0]).text().trim()) || 0;
                const linkUrl = $(tds[3]).find('a').attr('href') || '';

                if (episodeNumber > 0 && linkUrl) {
                    episodes.push({
                        provider,
                        episodeNumber,
                        title: epFullTitle,
                        sources: [{
                            server: 'Blogspot',
                            resolution: 'unknown',
                            url: linkUrl,
                            type: 'download_page'
                        }]
                    });
                }
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
const targetUrl = 'https://cijanepoi.blogspot.com/p/darwin-jihen.html';
scrapeCijanepoi(targetUrl).then(data => {
    console.log(JSON.stringify(data, null, 2));
});
