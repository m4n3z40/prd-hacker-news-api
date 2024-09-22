export default class VotesRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async create({ userId, storyId, action = 'up' }) {
    const res = await this.db.execute({
      sql: 'INSERT INTO story_votes (user_id, story_id, weight) VALUES (?, ?, ?)',
      args: [userId, storyId, action === 'up' ? 1 : -1],
    });

    return res.lastInsertRowid;
  }

  async getUserKarma(userId) {
    const { rows } = await this.db.execute({
      sql: 'SELECT SUM(weight)as karma FROM story_votes WHERE user_id = ?',
      args: [userId],
    });

    return rows[0]?.karma || 0;
  }
}
