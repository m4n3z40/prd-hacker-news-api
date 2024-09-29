import sql from '../utils/sql.js';

export default class VotesRepository {
  /**
   * @type {import('@libsql/client').Client}
   */
  #db;

  /**
   *
   * @param {{ db: import('@libsql/client').Client }} config
   */
  constructor({ db }) {
    this.#db = db;
  }

  async ready() {
    const { rows: [result] } = await this.#db.execute(sql`
      SELECT EXISTS(SELECT * FROM sqlite_master WHERE type='table' AND name='story_votes') as table_ready;
    `);

    return result.table_ready === 1;
  }

  async create({ user_id, story_id, action = 'up' }) {
    const { rows: [lastInsertedRow] } = await this.#db.execute(sql`
      INSERT INTO story_votes (user_id, story_id, weight)
      VALUES (${user_id}, ${story_id}, ${action === 'up' ? 1 : -1})
      RETURNING *
    `);

    return lastInsertedRow;
  }
}
