import fastifyPlugin from "fastify-plugin";

let db = null;

async function getDb() {
  if (!db) {
    const client = process.env.NODE_ENV === 'production'
      ? await import('@libsql/client/web')
      : await import('@libsql/client');

    db = client.createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_DATABASE_TOKEN,
    });
  }

  return db;
}

export default getDb;

export const plugin = fastifyPlugin(async (app) => {
  app.decorate('db', await getDb());
});
