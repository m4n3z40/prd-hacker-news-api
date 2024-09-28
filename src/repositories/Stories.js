import createStory from "../utils/createStory.js";

export default class StoriesRepository {
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

  async create({ title = null, url = null, text = null, type, user_id, parent_id = null }) {
    const domain = url ? new URL(url).hostname : null;

    const { rows: [lastInsertedRow] } = await this.#db.execute({
      sql: 'INSERT INTO stories (title, url, domain, text, type, user_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      args: [title || '', url, domain, text || '', type, user_id, parent_id],
    });

    return createStory(lastInsertedRow);
  }

  async getAll({ type = 'post', by, domain, title, list = 'new', perPage = 30, page = 1 } = {}) {
    const limit = perPage;
    const offset = (page - 1) * limit;

    const { rows: stories } = await this.#db.execute({
      sql: `SELECT
        s.*,
        u.username AS by,
        json_group_array(c.id) AS kids,
        (WITH RECURSIVE children (id, parent_id) as (
          SELECT sc1.id, sc1.parent_id
          FROM stories sc1
          WHERE sc1.parent_id = s.id
          UNION ALL
          SELECT sc2.id, sc2.parent_id
          FROM stories sc2
          INNER JOIN children d ON d.id = sc2.parent_id
        ) SELECT COUNT(id) FROM children) AS descendants,
        (SELECT COALESCE(SUM(weight), 0) FROM story_votes WHERE story_id = s.id) AS score
      FROM stories s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stories c ON s.id = c.parent_id
      WHERE s.type = ?
      ${by ? 'AND u.username = ?' : ''}
      ${domain ? 'AND s.domain = ?' : ''}
      ${title ? 'AND s.title LIKE ?' : ''}
      GROUP BY s.id
      ORDER BY ${list === 'top' ? 'score DESC, descendants DESC,' : ''} created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      args: [type, by, domain, title && `%${title}%`].filter(Boolean),
    });

    return stories.map(createStory);
  }

  async getAllComments({ perPage = 30, page = 1 } = {}) {
    const limit = perPage;
    const offset = (page - 1) * limit;

    const { rows: comments } = await this.#db.execute({
      sql: `WITH comments AS (
        SELECT c.*,
        (WITH RECURSIVE parents (id, parent_id) as (
            SELECT sc.id, sc.parent_id
            FROM stories sc
            WHERE sc.id = c.id
            UNION ALL
            SELECT sp.id, sp.parent_id
            FROM stories sp
            INNER JOIN parents d ON d.parent_id = sp.id
        ) SELECT p.id FROM parents p WHERE p.parent_id IS NULL) AS root_id
        FROM stories c
        WHERE c.type = 'comment'
      )
      SELECT
        c.*,
        p.title AS root_title,
        u.username AS by,
        json_group_array(s.id) AS kids,
        (SELECT COALESCE(SUM(weight), 0) FROM story_votes WHERE story_id = c.id) AS score
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN stories p ON c.root_id = p.id
      LEFT JOIN stories s ON s.parent_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}`,
      args: [],
    });

    return comments.map(createStory);
  }

  async getById(id) {
    const { rows } = await this.#db.execute({
      sql: `SELECT
        s.*,
        u.username AS by,
        json_group_array(c.id) AS kids,
        (WITH RECURSIVE children (id, parent_id) as (
          SELECT sc1.id, sc1.parent_id
          FROM stories sc1
          WHERE sc1.parent_id = s.id
          UNION ALL
          SELECT sc2.id, sc2.parent_id
          FROM stories sc2
          INNER JOIN children d ON d.id = sc2.parent_id
        ) SELECT COUNT(id) FROM children) AS descendants,
        COALESCE(SUM(v.weight), 0) AS score
      FROM stories s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stories c ON s.id = c.parent_id
      LEFT JOIN story_votes v ON s.id = v.story_id
      WHERE s.id = ?
      GROUP BY s.id`,
      args: [id],
    });

    return rows[0] ? createStory(rows[0]) : null;
  }

  async getDescendantsByParentId(parentId) {
    const { rows } = await this.#db.execute({
      sql: `WITH RECURSIVE descendants (id, parent_id) as (
        SELECT s.id, s.parent_id
        FROM stories s
        WHERE s.parent_id = ?
        UNION ALL
        SELECT sc.id, sc.parent_id
        FROM stories sc
        INNER JOIN descendants d ON d.id = sc.parent_id
      )
      SELECT
        s.*,
        u.username AS by,
        json_group_array(c.id) AS kids,
        COALESCE(SUM(v.weight), 0) AS score
      FROM stories s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stories c ON s.id = c.parent_id
      LEFT JOIN story_votes v ON s.id = v.story_id
      WHERE s.id IN (SELECT id FROM descendants)
      GROUP BY s.id`,
      args: [parentId],
    });

    return rows.map(createStory);
  }

  async getRootByDescendantId(id) {
    const { rows } = await this.#db.execute({
      sql: `WITH RECURSIVE parents (id, parent_id) as (
        SELECT sc.id, sc.parent_id
        FROM stories sc
        WHERE sc.id = ?
        UNION ALL
        SELECT sp.id, sp.parent_id
        FROM stories sp
        INNER JOIN parents d ON d.parent_id = sp.id
      ) SELECT
        s.*,
        u.username AS by,
        json_group_array(c.id) AS kids,
        COALESCE(SUM(v.weight), 0) AS score
      FROM stories s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN stories c ON s.id = c.parent_id
      LEFT JOIN story_votes v ON s.id = v.story_id
      WHERE s.id IN (
        SELECT id FROM parents WHERE parent_id is NULL
      )
      GROUP BY s.id`,
      args: [id],
    });

    return rows[0] ? createStory(rows[0]) : null;
  }

  async countAll({ type = 'post', by, domain, title } = {}) {
    const { rows } = await this.#db.execute({
      sql: `SELECT COUNT(s.id) AS count
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE type = ?
      ${by ? 'AND u.username = ?' : ''}
      ${domain ? 'AND s.domain = ?' : ''}
      ${title ? 'AND s.title LIKE ?' : ''}`,
      args: [type, by, domain, title && `%${title}%`].filter(Boolean),
    });

    return rows[0] ? rows[0].count : 0;
  }
}
