import { SamehadakuV2Adapter } from '$lib/server/SamehadakuV2Adapter';
import type { PageServerLoad } from './$types';
import type { SearchResult } from '$lib/server/ProviderAdapter';

export const load: PageServerLoad = async ({ url }) => {
  const adapter = new SamehadakuV2Adapter();
  
  // Basic query parsing. Our API defaults page to 1.
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1') || 1;

  try {
    let results: SearchResult = { results: [], hasNextPage: false, currentPage: page };
    
    if (query) {
        results = await adapter.search(query, page);
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
