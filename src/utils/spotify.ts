export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{
        id: string;
        name: string;
    }>;
    album: {
        id: string;
        name: string;
        images: Array<{
            url: string;
            height: number;
            width: number;
        }>;
    };
    preview_url: string | null;
    external_urls: {
        spotify: string;
    };
}

export interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
        total: number;
        limit: number;
        offset: number;
    };
}

export interface SpotifyAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

class SpotifyAPI {
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(clientId: string, clientSecret: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const authString = btoa(`${this.clientId}:${this.clientSecret}`);

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials',
            });

            if (!response.ok) {
                throw new Error(`Failed to get access token: ${response.status}`);
            }

            const data: SpotifyAuthResponse = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

            return this.accessToken;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            throw new Error('Failed to authenticate with Spotify');
        }
    }

    async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
        try {
            const accessToken = await this.getAccessToken();

            const searchParams = new URLSearchParams({
                q: query,
                type: 'track',
                limit: limit.toString(),
                market: 'BR'
            });

            const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data: SpotifySearchResponse = await response.json();
            return data.tracks.items;
        } catch (error) {
            console.error('Error searching tracks:', error);
            throw new Error('Failed to search tracks');
        }
    }

    async getPopularTracks(): Promise<SpotifyTrack[]> {
        try {
            const popularQueries = [
                'top hits 2024',
                'pop hits',
                'rock classics',
                'hip hop',
                'brazilian music',
                'electronic',
                'indie',
                'latin pop'
            ];

            const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
            return await this.searchTracks(randomQuery, 50);
        } catch (error) {
            console.error('Error getting popular tracks:', error);
            return [];
        }
    }

    async getTracksByGenre(genre: string): Promise<SpotifyTrack[]> {
        try {
            return await this.searchTracks(`genre:${genre}`, 30);
        } catch (error) {
            console.error(`Error getting ${genre} tracks:`, error);
            return [];
        }
    }
}

export default SpotifyAPI;