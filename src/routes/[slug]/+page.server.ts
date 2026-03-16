import { SamehadakuV2Adapter } from '$lib/server/SamehadakuV2Adapter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
  const adapter = new SamehadakuV2Adapter();

  const { slug } = params;
  const epParam = url.searchParams.get('ep');
  const episodeNumber = epParam ? Number(epParam) : null;

  try {
    const animeUrl = `${adapter.baseUrl}/anime/${slug}/`;
    // We get both details and episodes from the same scrape
    const anime = await adapter.scrapeAnimeDetail(animeUrl);
    const episodes = anime.episodes;

    let watchData = null;
    if (episodeNumber !== null) {
      try {
        const currentEp = episodes.find(e => e.number === episodeNumber);
        if (currentEp && currentEp.url) {
            watchData = await adapter.extractStreamLinks(currentEp.url);
        }
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
