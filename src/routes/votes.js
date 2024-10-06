const newVoteSchema = {
  type: 'object',
  required: ['user_id', 'story_id'],
  properties: {
    user_id: { type: 'string' },
    story_id: { type: 'string' },
    action: { type: 'string', enum: ['up', 'down'], default: 'up' },
  },
};

const voteSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    user_id: { type: 'string' },
    story_id: { type: 'string' },
    weight: { type: 'integer' },
    created_at: { type: 'string' },
  },
};

const voteResponseSchema = {
  type: 'object',
  properties: {
    result: voteSchema,
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    result: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

const createVoteSchema = {
  schema: {
    body: newVoteSchema,
    response: {
      200: voteResponseSchema,
      409: errorSchema,
    },
  }
};

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async app => {
  app.post('/votes', createVoteSchema, async (request, reply) => {
    const { votes: votesRepo } = app.repositories;
    const { user_id, story_id, action = 'up' } = request.body;

    try {
      const vote = await votesRepo.create({ user_id, story_id, action });

      return reply.send({ result: vote });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(409).send({ result: { message: 'User already voted on this story' } });
      }

      throw error;
    }
  });
};
