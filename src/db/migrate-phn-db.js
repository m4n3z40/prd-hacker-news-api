import { createClient } from '@libsql/client';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_DATABASE_TOKEN,
});

const createUsersTableSql = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK( role IN ('user','admin') ) NOT NULL DEFAULT 'user',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

const createStoriesTableSql = `
  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    domain TEXT,
    url TEXT,
    type TEXT CHECK( type IN ('post','comment', 'ask', 'show', 'job') ) NOT NULL DEFAULT 'post',
    user_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(parent_id) REFERENCES stories(id)
  );
`;

const createVotesTableSql = `
  CREATE TABLE IF NOT EXISTS story_votes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    story_id INTEGER NOT NULL,
    weight DECIMAL NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, story_id) ON CONFLICT ABORT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(story_id) REFERENCES stories(id)
  );
`;

const createSummariesTableSql = `
  CREATE TABLE IF NOT EXISTS summaries (
    hash CHAR(64) PRIMARY KEY,
    summary TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

async function runMigrations() {
  return turso.migrate([
    { sql: createUsersTableSql },
    { sql: createStoriesTableSql },
    { sql: createVotesTableSql },
    { sql: createSummariesTableSql },
  ]);
}

runMigrations()
  .then((rs) => console.log('Migrations ran successfully.', rs))
  .catch((err) => console.error(err));
