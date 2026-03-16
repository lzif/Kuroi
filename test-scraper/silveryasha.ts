import * as cheerio from 'cheerio';
import type { AdapterResult, ScrapedAnime } from './types';

async function scrapeSilveryashaSeason(url: string): Promise<AdapterResult> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeList: ScrapedAnime[] = [];

        $('div.surface-plain.border-card').each((_, el) => {
            const titleElement = $(el).find('a.text-body-primary').first();
            const title = titleElement.text().trim();
            const animeUrl = titleElement.attr('href') || '';
            
            const episodes = $(el).find('span.shrink-0').first().text().trim();
            const studio = $(el).find('span.truncate').first().text().trim();

            const genres: string[] = [];
            $(el).find('p').each((_, p) => {
                if ($(p).text().trim().toLowerCase() === 'genre') {
                    $(p).next().find('span').each((_, span) => {
                        genres.push($(span).text().trim());
                    });
                }
            });

            if (title) {
                animeList.push({ title, url: animeUrl, episodes, studio, genres });
            }
        });

        return { 
            success: true,
            animeTitle: 'Season List',
            episodes: [],
            animeList
        };
    } catch (error: any) {
        return { success: false, animeTitle: 'Error', episodes: [], error: error.message };
    }
}

async function scrapeSilveryashaDetail(url: string): Promise<AdapterResult> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        const animeTitle = $('h1.text-body-primary').text().trim();
        const synopsis = $('p.text-body-secondary').text().trim();
        
        // Detailed info can be stored in metadata for now
        const metadata: any = { synopsis, projects: [] };

        $('.project-card').each((_, el) => {
            const groupName = $(el).find('a[href*="/group/"]').text().replace('✔', '').trim();
            const link = $(el).find('a.btn.btn-outline').attr('href') || '';
            const status = $(el).find('span.bg-emerald-500\\/10').text().trim() || 
                           $(el).find('span.bg-blue-500\\/10').text().trim() || 'Unknown';
            
            const tags: string[] = [];
            $(el).find('span.badge').each((_, span) => {
                tags.push($(span).text().trim());
            });

            if (groupName) {
                metadata.projects.push({ groupName, link, status, tags });
            }
        });

        return { 
            success: true,
            animeTitle, 
            episodes: [], // Silveryasha is an indexer, no direct episodes/sources
            metadata
        };
    } catch (error: any) {
        return { success: false, animeTitle: 'Error', episodes: [], error: error.message };
    }
}

// Test
const seasonUrl = 'https://db.silveryasha.id/anime/season/2026/Winter';
const detailUrl = 'https://db.silveryasha.id/anime/6020';

(async () => {
    console.log("--- Testing Season Page ---");
    const seasonData = await scrapeSilveryashaSeason(seasonUrl);
    console.log(JSON.stringify({ ...seasonData, animeList: seasonData.animeList?.slice(0, 2) }, null, 2));

    console.log("\n--- Testing Detail Page ---");
    const detailData = await scrapeSilveryashaDetail(detailUrl);
    console.log(JSON.stringify(detailData, null, 2));
})();
