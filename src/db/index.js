import { createClient } from '@libsql/client';

let db = null;

function getDb() {
  if (!db) {
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_DATABASE_TOKEN,
    });
  }

  return db;
}

export default getDb;

export async function plugin(app) {
  app.decorate('db', getDb());
}
