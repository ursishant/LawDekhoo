-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT DEFAULT '',
  socials TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Legal aid views tracking
CREATE TABLE IF NOT EXISTS legal_aid_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  org_name TEXT NOT NULL,
  org_city TEXT DEFAULT '',
  org_address TEXT DEFAULT '',
  org_phone TEXT DEFAULT '',
  org_services TEXT DEFAULT '',
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
