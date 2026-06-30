-- Run once against the D1 database:
--   npx wrangler d1 execute crocs-store --remote --file=./schema.sql
-- (and again with --local for local dev)

CREATE TABLE IF NOT EXISTS shoes (
  id            TEXT PRIMARY KEY,
  model         TEXT NOT NULL,
  price         REAL NOT NULL,
  size          TEXT NOT NULL,
  color         TEXT NOT NULL,
  image_url     TEXT,
  detail_images TEXT,           -- JSON array of URLs
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS shoes_created_at_idx ON shoes(created_at DESC);
