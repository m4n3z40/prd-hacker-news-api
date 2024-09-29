import Fastify from "fastify";
import { plugin as dbPlugin } from "./db/index.js";
import { plugin as repositoriesPlugin } from "./repositories/index.js";
import { plugin as routesPlugin } from "./routes/index.js";

const app = Fastify({ logger: true });

app.register(dbPlugin);
app.register(repositoriesPlugin);
app.register(routesPlugin);

app.get('/ready', async (_, reply) => {
  const results = await Promise.all([
    app.repositories.stories.ready(),
    app.repositories.users.ready(),
    app.repositories.votes.ready(),
  ]);

  if (results.some(result => result !== true)) {
    return reply.status(503).send({ status: 'error', message: 'Database or tables not ready' });
  }

  return reply.send({ status: 'ok' });
});

app.get('/alive', async (_, reply) => {
  await app.db.execute('SELECT 1');

  return reply.send({ status: 'ok' });
});

export default app;
