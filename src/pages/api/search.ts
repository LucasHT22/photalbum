import type { APIRoute } from "astro";
import SpotifyAPI from "../../utils/spotify";

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
    try {
        const query = url.searchParams.get('q');
        const limit = parseInt(url.searchParams.get('limit') || '20');

        if (!query) {
            return new Response(JSON.stringify({ error: 'Query param is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
        const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'Spotify credentials not configured'}), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const spotify = new SpotifyAPI(clientId, clientSecret);
        const tracks = await spotify.searchTracks(query, limit);

        return new Response(JSON.stringify({ tracks }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=300'
            }
        });
    } catch (error) {
        console.error('Search API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to search tracks' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};