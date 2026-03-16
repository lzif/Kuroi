import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
    return json({ error: 'Seed API is currently disabled as the caching manager was removed.' }, { status: 501 });
};