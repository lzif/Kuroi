import { scraperManager } from '$lib/server/scraper';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const { slug } = params;
  const epParam = url.searchParams.get('ep');
  const episodeNumber = epParam ? Number(epParam) : null;

  try {
    // Parallelize requests where possible to speed up loading
    // We always want the anime details (for metadata/cover) and the episode list
    const [anime, episodes] = await Promise.all([
      scraperManager.getAnimeDetail(slug),
      scraperManager.getEpisodeList(slug)
    ]);

    let watchData = null;
    if (episodeNumber !== null) {
      try {
        watchData = await scraperManager.getWatch(slug, episodeNumber);
      } catch (e) {
        console.error(`Failed to load watch data for ${slug} ep ${episodeNumber}:`, e);
      }
    }

    return {
      anime,
      episodes,
      watchData,
      currentEpisode: episodeNumber
    };

  } catch (error) {
    console.error('Failed to load anime details:', error);
    // In a real app, you might want to throw error(404) here
    throw error;
  }
};
