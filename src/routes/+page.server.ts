import { SamehadakuV2Adapter } from '$lib/server/SamehadakuV2Adapter';
import type { PageServerLoad } from './$types';
import type { AnimeInfo } from '$lib/server/ProviderAdapter';

export const load: PageServerLoad = async () => {
  const adapter = new SamehadakuV2Adapter();

  try {
    const ongoing = await adapter.scrapeOngoing(1);
    const completed: AnimeInfo[] = [];
    return {
      ongoing,
      completed
    };
  } catch (error) {
    console.error('Failed to load home data:', error);
    return {
      ongoing: [] as AnimeInfo[],
      completed: [] as AnimeInfo[]
    };
  }
};
