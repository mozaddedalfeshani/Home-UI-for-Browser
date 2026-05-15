CREATE TABLE IF NOT EXISTS token_usage_windows (
  user_id TEXT PRIMARY KEY,
  tokens_used INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
