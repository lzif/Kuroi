-- D1 Schema for Kuroi Anime Cache

-- Anime table: stores metadata
CREATE TABLE IF NOT EXISTS anime (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  anilist_id INTEGER,
  japanese_title TEXT,
  synonyms TEXT,
  alternative_titles TEXT DEFAULT '[]',
  synopsis TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  genres TEXT DEFAULT '[]',
  status TEXT DEFAULT 'unknown',
  type TEXT DEFAULT 'unknown',
  total_episodes INTEGER,
  score REAL,
  release_year INTEGER,
  posted_by TEXT,
  released_on TEXT,
  source TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_anime_slug ON anime(slug);
CREATE INDEX IF NOT EXISTS idx_anime_source ON anime(source);
CREATE INDEX IF NOT EXISTS idx_anime_status ON anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_anilist_id ON anime(anilist_id);

-- Episodes table: stores episode data with streaming/download links
CREATE TABLE IF NOT EXISTS episodes (
  id TEXT PRIMARY KEY,
  anime_id TEXT NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT DEFAULT '',
  stream_links TEXT DEFAULT '[]',
  download_links TEXT DEFAULT '[]',
  release_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
  UNIQUE(anime_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_episodes_number ON episodes(anime_id, episode_number);

-- Search cache table: stores search results
CREATE TABLE IF NOT EXISTS search_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  source TEXT NOT NULL,
  results TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  UNIQUE(query, source)
);

CREATE INDEX IF NOT EXISTS idx_search_query ON search_cache(query);
CREATE INDEX IF NOT EXISTS idx_search_expires ON search_cache(expires_at);

-- AniList Title Search Cache: maps sanitized title to AniList ID
CREATE TABLE IF NOT EXISTS anilist_title_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sanitized_title TEXT NOT NULL UNIQUE,
  anilist_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_anilist_title ON anilist_title_cache(sanitized_title);

-- AniList Metadata Cache: stores full anime metadata from AniList
CREATE TABLE IF NOT EXISTS anilist_metadata (
  anilist_id INTEGER PRIMARY KEY,
  title_romaji TEXT,
  title_english TEXT,
  title_native TEXT,
  cover_large TEXT,
  cover_medium TEXT,
  banner_image TEXT,
  description TEXT,
  genres TEXT DEFAULT '[]',
  status TEXT,
  episodes INTEGER,
  average_score INTEGER,
  season TEXT,
  season_year INTEGER,
  studios TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_anilist_year ON anilist_metadata(season_year);
