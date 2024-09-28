import hashPassword from '../utils/hashPassword.js';

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

  async create({ username, password }) {
    const { rows: [user] } = await this.#db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?) RETURNING *',
      args: [username, hashPassword(password)],
    });

    return user;
  }

  async getByUsername(username) {
    const { rows: [user] } = await this.#db.execute({
      sql: 'SELECT id, username, role, created_at FROM users WHERE username = ?',
      args: [username],
    });

    return user || null;
  }

  async getByLoginData({ username, password }) {
    const { rows: [user] } = await this.#db.execute({
      sql: 'SELECT id, username, role, created_at FROM users WHERE username = ? AND password = ?',
      args: [username, hashPassword(password)],
    });

    return user || null;
  }
}
