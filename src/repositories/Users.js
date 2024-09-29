import hashPassword from '../utils/hashPassword.js';
import sql, { empty } from '../utils/sql.js';

export default class UsersRepository {
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
      SELECT EXISTS(SELECT * FROM sqlite_master WHERE type='table' AND name='users') as table_ready;
    `);

    return result.table_ready === 1;
  }

  async create({ username, password }) {
    const { rows: [user] } = await this.#db.execute(sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${hashPassword(password)})
      RETURNING id, username, role, 0 AS karma, created_at
    `);

    return user;
  }

  async getByLoginData({ username, password }) {
    const { rows: [user] } = await this.#db.execute(sql`
      SELECT u.id, u.username, u.role, COALESCE(SUM(s.weight), 0) AS karma, u.created_at
      FROM users u
      LEFT JOIN story_votes s ON s.user_id = u.id
      WHERE username = ${username}
      ${password ? sql`AND password = ${hashPassword(password)}` : empty}
      GROUP BY u.id
    `);

    return user || null;
  }
}
