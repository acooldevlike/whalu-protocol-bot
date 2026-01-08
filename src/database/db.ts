import Database from 'better-sqlite3'
import path from 'path'

const db: Database.Database = new Database(path.join(__dirname, '../../whalu_protocol.db'))

// Create tables on startup
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    telegram_id INTEGER PRIMARY KEY,
    username TEXT,
    wallet_address TEXT,
    wallet_private_key_encrypted TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS buyback_volume (
    id INTEGER PRIMARY KEY,
    total_volume REAL DEFAULT 0,
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS lottery_pool (
    id INTEGER PRIMARY KEY,
    current_amount REAL DEFAULT 0,
    current_market_cap REAL DEFAULT 0,
    next_milestone_market_cap REAL DEFAULT 30000,
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS lottery_winners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone REAL,
    winner_wallet TEXT,
    amount REAL,
    won_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS buyback_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount_sol REAL,
    amount_tokens REAL,
    price REAL,
    tx_signature TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS price_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER,
    trigger_price REAL,
    amount_sol REAL,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
  );

  CREATE TABLE IF NOT EXISTS freeze_protocol (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_address TEXT NOT NULL,
    frozen INTEGER DEFAULT 0,
    freeze_date INTEGER,
    freeze_type TEXT,
    unlock_date INTEGER,
    tx_signature TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- NAMI SCORE SYSTEM TABLES
  CREATE TABLE IF NOT EXISTS nami_scores (
    wallet TEXT PRIMARY KEY,
    entry_score INTEGER DEFAULT 0,
    diamond_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    holdings REAL DEFAULT 0,
    weighted_score REAL DEFAULT 0,
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS nami_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    buy_timestamp INTEGER NOT NULL,
    buy_price REAL NOT NULL,
    buy_amount REAL NOT NULL,
    price_context TEXT,
    points_earned INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (wallet) REFERENCES nami_scores(wallet)
  );

  CREATE TABLE IF NOT EXISTS nami_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    price_before REAL,
    price_after REAL,
    price_change_percent REAL,
    holders_held INTEGER,
    holders_sold INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS nami_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    nami_score INTEGER,
    holdings REAL,
    weighted_score REAL,
    reward_amount REAL,
    claimed INTEGER DEFAULT 0,
    claim_timestamp INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- FUCHI POOL SYSTEM TABLES
  CREATE TABLE IF NOT EXISTS fuchi_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    milestone_type TEXT NOT NULL,
    threshold INTEGER NOT NULL,
    multiplier REAL NOT NULL,
    unlocked INTEGER DEFAULT 0,
    unlocked_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS fuchi_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp INTEGER NOT NULL,
    total_multiplier REAL NOT NULL,
    holders_count INTEGER,
    mcap_value REAL,
    event_type TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  -- BOT CONFIGURATION TABLE
  CREATE TABLE IF NOT EXISTS bot_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    token_ca TEXT NOT NULL,
    configured INTEGER DEFAULT 0,
    setup_date INTEGER,
    CHECK (id = 1)
  );

  -- TOKEN METRICS CACHE TABLE
  CREATE TABLE IF NOT EXISTS token_metrics (
    token_ca TEXT PRIMARY KEY,
    holder_count INTEGER DEFAULT 0,
    market_cap REAL DEFAULT 0,
    price REAL DEFAULT 0,
    volume_24h REAL DEFAULT 0,
    price_change_24h REAL DEFAULT 0,
    last_updated INTEGER DEFAULT (strftime('%s', 'now'))
  );
`)

// Initialize default data
const initData = db.prepare('SELECT COUNT(*) as count FROM lottery_pool').get() as { count: number }
if (initData.count === 0) {
  db.prepare('INSERT INTO lottery_pool (current_amount, current_market_cap, next_milestone_market_cap) VALUES (0, 0, 30000)').run()
  db.prepare('INSERT INTO buyback_volume (total_volume) VALUES (0)').run()
}

// Initialize Fuchi milestones
const fuchiData = db.prepare('SELECT COUNT(*) as count FROM fuchi_milestones').get() as { count: number }
if (fuchiData.count === 0) {
  const milestones = [
    ['holders', 100, 1.1],
    ['holders', 500, 1.2],
    ['holders', 1000, 1.3],
    ['holders', 5000, 1.5],
    ['holders', 10000, 2.0],
    ['mcap', 100000, 1.2],
    ['mcap', 500000, 1.4],
    ['mcap', 1000000, 1.6],
    ['mcap', 5000000, 2.0]
  ]
  
  const stmt = db.prepare('INSERT INTO fuchi_milestones (milestone_type, threshold, multiplier) VALUES (?, ?, ?)')
  for (const [type, threshold, multiplier] of milestones) {
    stmt.run(type, threshold, multiplier)
  }
}

export default db
