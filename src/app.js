import Fastify from "fastify";
import { plugin as dbPlugin } from "./db/index.js";
import { plugin as repositoriesPlugin } from "./repositories/index.js";
import { plugin as routesPlugin } from "./routes/index.js";

const app = Fastify({ logger: true });

app.register(dbPlugin);
app.register(repositoriesPlugin);
app.register(routesPlugin);

app.get('/liveness', async (_, reply) => {
  await app.db.execute('SELECT 1');

  return reply.send({ status: 'ok' });
});

export default app;
