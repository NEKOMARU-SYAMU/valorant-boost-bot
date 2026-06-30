const db = require("./connection");

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    targetRank INTEGER NOT NULL,
    currentRank INTEGER NOT NULL,
    rr INTEGER NOT NULL,
    previousRank INTEGER DEFAULT NULL,
    previousRR INTEGER DEFAULT NULL,
    lastDiffRR INTEGER DEFAULT 0,
    progress REAL DEFAULT 0,
    comment TEXT DEFAULT '',
    messageId TEXT DEFAULT NULL,
    updatedAt TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS subAccounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    rankId INTEGER NOT NULL,
    amount INTEGER NOT NULL
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS undoHistory (
    userId TEXT PRIMARY KEY,
    data TEXT NOT NULL
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
    guildId TEXT PRIMARY KEY,
    publishChannel TEXT,
    publishMessage TEXT,
    rankUpChannel TEXT
)
`).run();

try {
    db.prepare(`ALTER TABLE settings ADD COLUMN rankUpChannel TEXT`).run();
} catch (_) {}

db.prepare(`
CREATE TABLE IF NOT EXISTS rrHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    oldRank INTEGER NOT NULL,
    oldRR INTEGER NOT NULL,
    newRank INTEGER NOT NULL,
    newRR INTEGER NOT NULL,
    diffRR INTEGER NOT NULL,
    createdAt TEXT NOT NULL,
    createdAtMs INTEGER NOT NULL
)
`).run();

const addColumn = (sql) => {
    try {
        db.prepare(sql).run();
    } catch (_) {}
};

addColumn(`ALTER TABLE users ADD COLUMN riotName TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN riotTag TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN region TEXT DEFAULT 'ap'`);
addColumn(`ALTER TABLE users ADD COLUMN lastMatchId TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN lastMatchResult TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN lastMatchMap TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN lastMatchScore TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN lastMatchRR INTEGER DEFAULT 0`);
addColumn(`ALTER TABLE users ADD COLUMN lastApiUpdate TEXT`);
addColumn(`ALTER TABLE users ADD COLUMN apiError TEXT`);