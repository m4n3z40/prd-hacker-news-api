import Fastify from "fastify";
import fastifyPlugin from "fastify-plugin";
import { plugin } from "./db/index.js";

const app = Fastify({ logger: true });

app.register(fastifyPlugin(plugin));

app.get('/', async (request, reply) => {
  app.db.execute('SELECT 1');

  reply.send({ hello: 'world' })
});

export default app;
