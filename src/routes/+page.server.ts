import { createCachedScraperManager } from '$lib/server/scraper';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform?.env?.DB;
  const scraperManager = createCachedScraperManager(db);

  try {
    const homeData = await scraperManager.getHome();
    return {
      ongoing: homeData.ongoing,
      completed: homeData.completed
    };
  } catch (error) {
    console.error('Failed to load home data:', error);
    return {
      ongoing: [],
      completed: []
    };
  }
};
