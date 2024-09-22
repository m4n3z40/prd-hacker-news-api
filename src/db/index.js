import { createClient } from '@libsql/client';
import fastifyPlugin from "fastify-plugin";

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

export const plugin = fastifyPlugin(async (app) => {
  app.decorate('db', getDb());
});
