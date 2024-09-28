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

  async create({ userId, storyId, action = 'up' }) {
    const { rows: [lastInsertedRow] } = await this.#db.execute({
      sql: 'INSERT INTO story_votes (user_id, story_id, weight) VALUES (?, ?, ?) RETURNING *',
      args: [userId, storyId, action === 'up' ? 1 : -1],
    });

    return lastInsertedRow;
  }

  async getUserKarma(userId) {
    const { rows: [user] } = await this.#db.execute({
      sql: 'SELECT SUM(weight) AS karma FROM story_votes WHERE user_id = ?',
      args: [userId],
    });

    return user?.karma || 0;
  }
}
