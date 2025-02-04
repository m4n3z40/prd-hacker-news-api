import fastifyPlugin from "fastify-plugin";

import Stories from './Stories.js';
import Users from "./Users.js";
import Votes from './Votes.js';
import Summaries from './Summaries.js';

export { Stories, Users, Votes };

export const plugin = fastifyPlugin(async (app) => {
  if (!app.db) {
    throw new Error('The database instance is required to register the repositories plugin');
  }

  app.decorate('repositories', {
    stories: new Stories({ db: app.db }),
    users: new Users({ db: app.db }),
    votes: new Votes({ db: app.db }),
    summaries: new Summaries({ db: app.db }),
  });
});
