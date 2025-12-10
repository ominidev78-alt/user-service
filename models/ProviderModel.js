import { pool } from '../config/db.js';

export class ProviderModel {
  static async create({ code, name, baseUrl, active }) {
    const { rows } = await pool.query(
      `
      INSERT INTO providers
        (code, name, base_url, active)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *;
      `,
      [code, name, baseUrl || null, active !== undefined ? active : true]
    );
    return rows[0] || null;
  }

  static async findAll({ active, search, limit, offset } = {}) {
    const params = [];
    let where = '1=1';

    if (active !== undefined) {
      params.push(active);
      where += ` AND active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length - 1} OR code ILIKE $${params.length})`;
    }

    const limitValue = limit && Number.isFinite(Number(limit)) ? Number(limit) : 100;
    const offsetValue = offset && Number.isFinite(Number(offset)) ? Number(offset) : 0;

    params.push(limitValue);
    params.push(offsetValue);

    const { rows } = await pool.query(
      `
      SELECT *
      FROM providers
      WHERE ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length};
      `,
      params
    );

    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM providers
      WHERE id = $1
      LIMIT 1;
      `,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCode(code) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM providers
      WHERE code = $1
      LIMIT 1;
      `,
      [code]
    );
    return rows[0] || null;
  }

  static async update(id, { code, name, baseUrl, active }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (code !== undefined) {
      params.push(code);
      updates.push(`code = $${paramIndex}`);
      paramIndex++;
    }

    if (name !== undefined) {
      params.push(name);
      updates.push(`name = $${paramIndex}`);
      paramIndex++;
    }

    if (baseUrl !== undefined) {
      params.push(baseUrl);
      updates.push(`base_url = $${paramIndex}`);
      paramIndex++;
    }

    if (active !== undefined) {
      params.push(active);
      updates.push(`active = $${paramIndex}`);
      paramIndex++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    // id vai no final
    params.push(id);
    const idParamIndex = paramIndex;

    const { rows } = await pool.query(
      `
      UPDATE providers
      SET ${updates.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *;
      `,
      params
    );

    return rows[0] || null;
  }

  static async updateStatus(id, active) {
    const { rows } = await pool.query(
      `
      UPDATE providers
      SET
        active = $2
      WHERE id = $1
      RETURNING *;
      `,
      [id, active]
    );
    return rows[0] || null;
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `
      DELETE FROM providers
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );
    return rows[0] || null;
  }

  static async count({ active, search } = {}) {
    const params = [];
    let where = '1=1';

    if (active !== undefined) {
      params.push(active);
      where += ` AND active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length - 1} OR code ILIKE $${params.length})`;
    }

    const { rows } = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM providers
      WHERE ${where};
      `,
      params
    );

    return Number(rows[0]?.total || 0);
  }
}
