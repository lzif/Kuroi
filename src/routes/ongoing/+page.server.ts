import { SamehadakuV2Adapter } from '$lib/server/SamehadakuV2Adapter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const adapter = new SamehadakuV2Adapter();
  
  const page = parseInt(url.searchParams.get('page') || '1') || 1;

  try {
    const results = await adapter.scrapeOngoing(page);

    return {
      page,
      results,
      hasNextPage: results.length > 0
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
