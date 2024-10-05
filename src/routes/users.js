const newUserSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['username', 'password'],
};

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    role: { type: 'string' },
    karma: { type: 'integer' },
    created_at: { type: 'string' },
  },
};

const userResponseSchema = {
  type: 'object',
  properties: {
    result: userSchema,
  },
};

const getUserParamsSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
  },
  required: ['username'],
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

const createUserSchema = {
  body: newUserSchema,
  response: {
    200: userResponseSchema,
    409: errorSchema,
  },
};

const getUserSchema = {
  params: getUserParamsSchema,
  response: {
    200: userResponseSchema,
    404: errorSchema,
  },
};

const authUserSchema = {
  body: newUserSchema,
  response: {
    200: userResponseSchema,
    401: errorSchema,
  },
};

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async app => {
  app.post('/users', createUserSchema, async (request, reply) => {
    const { username, password } = request.body;
    const { users: usersRepo } = app.repositories;

    try {
      const user = await usersRepo.create({ username, password });

      return reply.send({ result: user });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return reply.status(409).send({ message: 'User with the same username already exists' });
      }

      throw error;
    }
  });

  app.get('/users/:username', getUserSchema, async (request, reply) => {
    const { username } = request.params;
    const { users: usersRepo } = app.repositories;

    const user = await usersRepo.getByLoginData({ username });

    if (!user) {
      return reply.status(404).send({ result: { message: 'User not found' } });
    }

    return reply.send({ result: user });
  });

  app.post('/users/auth', authUserSchema, async (request, reply) => {
    const { username, password } = request.body;
    const { users: usersRepo } = app.repositories;

    const user = await usersRepo.getByLoginData({ username, password });

    if (!user) {
      return reply.status(401).send({ result: { message: 'Invalid username or password' } });
    }

    return reply.send({ result: user });
  });
};
