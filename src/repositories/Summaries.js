import crypto from 'node:crypto';
import SummarizerAgent from '../utils/SummarizerAgent.js';
import sql from '../utils/sql.js';

export default class SummariesRepository {
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
      SELECT EXISTS(SELECT * FROM sqlite_master WHERE type='table' AND name='summaries') as table_ready;
    `);

    return result.table_ready === 1;
  }

  #createHash(story) {
    const key = story.url ? new URL(story.url).href : `story-${story.id}`;

    return crypto.createHash('sha256').update(key).digest('hex');
  }

  async #createSummary(story) {
    const summarizer = new SummarizerAgent();
    const summary = await summarizer.summarizeStory(story);

    const hash = this.#createHash(story);

    const { rows: [lastInsertedRow] } = await this.#db.execute(sql`
      INSERT INTO summaries (hash, summary)
      VALUES (${hash}, ${summary})
      RETURNING *
    `);

    return lastInsertedRow;
  }

  async getSummaryFor(story) {
    const hash = this.#createHash(story);

    const { rows: [summary] } = await this.#db.execute(sql`
      SELECT hash, summary, created_at
      FROM summaries
      WHERE hash = ${hash}
    `);

    if (summary) {
      return summary;
    }

    return this.#createSummary(story);
  }
}
