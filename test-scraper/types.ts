// types.ts

// 1. Klasifikasi Link Mutlak
export type SourceType = 'mp4' | 'iframe' | 'download_page' | 'shortlink';

export interface VideoSource {
    server: string;       // cth: "GDrive", "Wibufile"
    resolution: string;   // cth: "720p", "1080p", "unknown"
    url: string;          // URL aslinya
    type: SourceType;     // INI CRITICAL! Biar Seeder tau mau diapain link ini
    size?: string;        // Boleh opsional karena gak semua web ngasih info size
}

// 2. Standar Episode (Wajib Strict)
export interface ScrapedEpisode {
    provider: string;        // cth: "Doronime", "Samehadaku"
    episodeNumber: number;   // WAJIB ANGKA (Parse string "Episode 01" jadi angka 1)
    title: string;           // Judul spesifik episodenya
    sources: VideoSource[];  // Gabungan link stream & download
}

// 3. Payload Final (Siap di-inject AnilistId oleh Seeder)
export interface ScrapedAnime {
    title: string;
    url: string;
    episodes?: string;
    studio?: string;
    genres?: string[];
    image?: string;
}

export interface AdapterResult {
    success: boolean;
    animeTitle: string;
    episodes: ScrapedEpisode[];
    animeList?: ScrapedAnime[];
    error?: string;
}
