import type { APIRoute } from "astro";
import SpotifyAPI from "../../utils/spotify";

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
        const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;

         if (!clientId || !clientSecret) {
            return new Response(JSON.stringify({ error: 'Spotify credentials not configured'}), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const spotify = new SpotifyAPI(clientId, clientSecret);
        const tracks = await spotify.getPopularTracks();

        return new Response(JSON.stringify({ tracks }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'max-age=600'
            }
        });
    } catch (error) {
        console.error('Popular API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to get popular tracks' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};