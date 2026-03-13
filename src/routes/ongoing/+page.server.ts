import { createCachedScraperManager } from '$lib/server/scraper';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = platform?.env?.DB;
  const scraperManager = createCachedScraperManager(db);
  
  const page = parseInt(url.searchParams.get('page') || '1') || 1;

  try {
    const results = await scraperManager.getOngoing(page);

    return {
      page,
      results: results.results,
      hasNextPage: results.hasNextPage
    };
  } catch (error) {
    console.error('Failed to load ongoing data:', error);
    return {
      page,
      results: [],
      hasNextPage: false
    };
  }
};
