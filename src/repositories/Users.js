import hashPassword from '../utils/hashPassword.js';

export default class UsersRepository {
  #db;

  constructor(db) {
    this.#db = db;
  }

  async create({ username, password }) {
    const { lastInsertRowid } = await this.db.execute({
      sql: 'INSERT INTO users (username, password) VALUES (?, ?)',
      args: [username, hashPassword(password)],
    });

    return lastInsertRowid;
  }

  async getByUsername(username) {
    const { rows: [user] } = await this.db.execute({
      sql: 'SELECT id, username, role, created_at FROM users WHERE username = ?',
      args: [username],
    });

    return user || null;
  }

  async getByLoginData({ username, password }) {
    const { rows: [user] } = await this.db.execute({
      sql: 'SELECT id, username, role, created_at FROM users WHERE username = ? AND password = ?',
      args: [username, hashPassword(password)],
    });

    return user || null;
  }
}
