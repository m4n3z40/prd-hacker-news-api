import fastifyPlugin from "fastify-plugin";

import stories from './stories.js';
import users from './users.js';
import votes from './votes.js';

export { stories, users, votes };

export const plugin = fastifyPlugin(async app => {
  await Promise.all([
    stories(app),
    users(app),
    votes(app),
  ]);
});
