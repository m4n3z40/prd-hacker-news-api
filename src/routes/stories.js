const newStorySchema = {
  type: 'object',
  required: ['title', 'type', 'user_id'],
  oneOf: [
    { required: ['url'], not: { required: ['text'] } },
    { required: ['text'], not: { required: ['url'] } },
    { required: ['url', 'text'] },
  ],
  properties: {
    title: { type: 'string' },
    url: {
      type: 'string',
      format: 'uri',
      pattern: "^https?://",
      nullable: true,
      default: null,
    },
    text: { type: 'string' },
    type: { enum: ['post', 'comment', 'job', 'ask', 'show'] },
    user_id: { type: 'integer' },
    parent_id: {
      type: 'integer',
      nullable: true,
      default: null
    },
  },
};

const storySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    slug: { type: 'string' },
    title: { type: 'string' },
    text: { type: 'string' },
    domain: { type: 'string' },
    url: {
      type: 'string',
      format: 'uri',
      pattern: "^https?://"
    },
    score: { type: 'integer' },
    user_id: { type: 'integer' },
    by: { type: 'string' },
    time_ago: { type: 'string' },
    descendants: { type: 'integer' },
    parent_id: { type: 'integer' },
    root_id: { type: 'integer' },
    root_title: { type: 'string' },
    root_slug: { type: 'string' },
    kids: {
      type: 'array',
      items: { type: 'integer' },
    },
    type: { enum: ['post', 'comment', 'job', 'ask', 'show'] },
    created_at: { type: 'string' },
  },
};

const storiesListQuerySchema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    by: { type: 'string' },
    domain: { type: 'string' },
    title: { type: 'string' },
    order: { type: 'string' },
    perPage: { type: 'integer' },
    page: { type: 'integer' },
  },
};

const commentsListQuerySchema = {
  type: 'object',
  properties: {
    perPage: { type: 'integer' },
    page: { type: 'integer' },
  },
};

const resultMetaSchema = {
  type: 'object',
  properties: {
    total: { type: 'integer' },
    page: { type: 'integer' },
    perPage: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
};

const storiesListSchema = {
  type: 'object',
  properties: {
    result: {
      type: 'array',
      items: storySchema,
    },
    meta: resultMetaSchema,
  },
};

const storyPathParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
  },
  required: ['id'],
};

const singleStorySchema = {
  type: 'object',
  properties: {
    result: storySchema,
  },
};

const descendantsSchema = {
  type: 'object',
  properties: {
    result: {
      type: 'object',
      properties: {
        stories: {
          type: 'object',
          patternProperties: {
            '^[0-9]+$': storySchema,
          },
          additionalProperties: false,
        },
        rootKids: {
          type: 'array',
          items: { type: 'integer' },
        },
      }
    },
    meta: resultMetaSchema,
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

const createStoryRouteConfig = {
  schema: {
    body: newStorySchema,
    response: {
      200: singleStorySchema,
    },
  },
};

const getAllStoriesRouteConfig = {
  schema: {
    querystring: storiesListQuerySchema,
    response: {
      200: storiesListSchema
    },
  },
};

const getStoryRouteConfig = {
  schema: {
    params: storyPathParamsSchema,
    response: {
      200: singleStorySchema,
      404: errorSchema,
    },
  },
};

const descendantsRouteConfig = {
  schema: {
    params: storyPathParamsSchema,
    response: {
      200: descendantsSchema,
      404: errorSchema,
    },
  },
};

const rootRouteConfig = {
  schema: {
    params: storyPathParamsSchema,
    response: {
      200: singleStorySchema,
      404: errorSchema,
      400: errorSchema,
    },
  },
};

/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async app => {
  app.post('/stories', createStoryRouteConfig, async (request, reply) => {
    const { stories: storiesRepo } = app.repositories;
    const { title, url, text, type, user_id, parent_id } = request.body;

    const story = await storiesRepo.create({ title, url, text, type, user_id, parent_id });

    return reply.send({ result: story });
  });

  app.get('/stories', getAllStoriesRouteConfig, async (request, reply) => {
    const { stories: storiesRepo } = app.repositories;
    const { type, by, domain, title, order, perPage = 30, page = 1 } = request.query;

    const total = await storiesRepo.countAll({ type, by, domain, title });

    if (total === 0) {
      return reply.send({ result: [], meta: { total, page, perPage } });
    }

    const stories = await storiesRepo.getAll({ type, by, domain, title, order, perPage, page });

    return reply.send({
      result: stories,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) }
    });
  });

  app.get('/comments', commentsListQuerySchema, async (request, reply) => {
    const { stories: storiesRepo } = app.repositories;
    const { perPage = 30, page = 1 } = request.query;

    const total = await storiesRepo.countAll({ type: 'comment' });

    if (total === 0) {
      return reply.send({ result: [], meta: { total, page, perPage } });
    }

    const comments = await storiesRepo.getAllComments({ perPage, page });

    return reply.send({
      result: comments,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) }
    });
  });

  app.get('/stories/:id', getStoryRouteConfig, async (request, reply) => {
    const { id } = request.params;
    const { stories: storiesRepo } = app.repositories;

    const story = await storiesRepo.getById(id);

    if (!story) {
      return reply.code(404).send({ result: { message: 'Story not found' } });
    }

    return reply.send({ result: story });
  });

  app.get('/stories/:id/descendants', descendantsRouteConfig, async (request, reply) => {
    const { id } = request.params;
    const { stories: storiesRepo } = app.repositories;

    const parentStory = await storiesRepo.getById(id);

    if (!parentStory) {
      return reply.code(404).send({ result: { message: 'Story not found' } });
    }

    if (parentStory.descendants === 0) {
      return reply.send({ result: { stories: {}, rootKids: [] }, meta: { total: 0 } });
    }

    const stories = await storiesRepo.getDescendantsByParentId(id);

    const storiesMap = stories.reduce((acc, story) => {
      acc[story.id] = story;
      return acc;
    }, {});

    const rootKids = parentStory.kids;

    return reply.send({
      result: { stories: storiesMap, rootKids },
      meta: { total: stories.length }
    });
  });

  app.get('/stories/:id/root', rootRouteConfig, async (request, reply) => {
    const { id } = request.params;
    const { stories: storiesRepo } = app.repositories;

    const story = await storiesRepo.getById(id);

    if (!story) {
      return reply.code(404).send({ result: { message: 'Story not found.' } });
    }

    if (!story.parent_id) {
      return reply.code(400).send({ result: { message: 'Story is already the root story.' } });
    }

    const rootStory = await storiesRepo.getRootByDescendantId(id);

    return reply.send({ result: rootStory });
  });
};
