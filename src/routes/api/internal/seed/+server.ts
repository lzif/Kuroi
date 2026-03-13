import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { D1Cache } from '$lib/server/scraper/d1';
import type { AnimeData, AnimeMetadata } from '$lib/server/scraper/types';

export const POST: RequestHandler = async ({ request, platform }) => {
    // 1. Security Check
    const env = platform?.env as Record<string, string> | undefined;
    const INGEST_SECRET = env?.INGEST_SECRET;
    if (!INGEST_SECRET) {
        return json({ error: 'Server configuration error: INGEST_SECRET not set.' }, { status: 500 });
    }

    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${INGEST_SECRET}`) {
        return json({ error: 'Unauthorized. Invalid API Key.' }, { status: 401 });
    }

    const db = platform?.env?.DB;
    if (!db) {
        return json({ error: 'Database binding not found. Are you running in Cloudflare?' }, { status: 500 });
    }

    try {
        const data = await request.json() as { 
            anilistMetadata?: AnimeMetadata; 
            animeData?: AnimeData; 
        };
        const cache = new D1Cache(db);

        // 2. Insert/Update Clean AniList Metadata (if we matched it)
        if (data.anilistMetadata && data.anilistMetadata.id) {
            await cache.saveAniListMetadata(data.anilistMetadata);
        }

        // 3. Insert/Update the Dirty Scraper Mapping
        if (data.animeData && data.animeData.id) {
            await cache.saveAnime(data.animeData);
        } else {
             return json({ error: 'Missing animeData payload.' }, { status: 400 });
        }

        return json({ success: true, id: data.animeData.id });
    } catch (err: any) {
        console.error("Ingestion API Error:", err);
        return json({ error: err.message }, { status: 500 });
    }
};