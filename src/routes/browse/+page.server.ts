import { createCachedScraperManager } from '$lib/server/scraper';
import type { PageServerLoad } from './$types';
import type { SearchResult } from '$lib/server/scraper/types';

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = platform?.env?.DB;
  const scraperManager = createCachedScraperManager(db);
  
  // Basic query parsing. Our API defaults page to 1.
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1') || 1;

  try {
    let results: SearchResult = { results: [], hasNextPage: false, currentPage: page };
    
    if (query) {
        results = await scraperManager.search(query, page);
    }

    return {
      query,
      page,
      results: results.results,
      hasNextPage: results.hasNextPage
    };
  } catch (error) {
    console.error('Failed to search data:', error);
    return {
      query,
      page,
      results: [],
      hasNextPage: false
    };
  }
};
