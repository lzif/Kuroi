-- Clean AniList Metadata
CREATE TABLE IF NOT EXISTS anilist_metadata (
    id INTEGER PRIMARY KEY,
    romaji_title TEXT NOT NULL,
    cover_image TEXT,
    description TEXT,
    genres TEXT, -- Stored as JSON string array
    last_updated INTEGER
);

-- Dirty Scraper Mapping
CREATE TABLE IF NOT EXISTS scraper_sources (
    slug TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    anilist_id INTEGER,
    latest_episode TEXT,
    is_synced BOOLEAN DEFAULT 0,
    FOREIGN KEY (anilist_id) REFERENCES anilist_metadata(id) ON DELETE SET NULL
);

-- Episodes Table (Linked to scraper_sources)
CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY, -- format: sourceName:slug-episode-X
    source_slug TEXT NOT NULL,
    episode_number REAL NOT NULL,
    title TEXT,
    stream_links TEXT, -- JSON string array
    download_links TEXT, -- JSON string array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_slug) REFERENCES scraper_sources(slug) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_episodes_source ON episodes(source_slug, episode_number DESC);
