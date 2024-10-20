const healthRoutesSchema = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
      503: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  }
};

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async app => {
  app.get('/ready', healthRoutesSchema, async (_, reply) => {
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

  app.get('/alive', healthRoutesSchema, async (_, reply) => {
    await app.db.execute('SELECT 1');

    return reply.send({ status: 'ok' });
  });
};
