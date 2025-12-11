import { pool } from '../config/db.js';

export class OperatorModel {
  static async create({ name, email, document, companyName, companyDocument, splitFee }) {
    const { rows } = await pool.query(
      `
      INSERT INTO operators
        (name, email, document, company_name, company_document, split_fee)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        name,
        email || null,
        document || null,
        companyName || null,
        companyDocument || null,
        splitFee || 0,
      ]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM operators
      WHERE id = $1
      LIMIT 1;
      `,
      [id]
    );
    return rows[0] || null;
  }

  static async findByAppId(appId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM operators
      WHERE app_id = $1
      LIMIT 1;
      `,
      [appId]
    );
    return rows[0] || null;
  }

  static async setCredentials(id, { appId, appSecretHash }) {
    const { rows } = await pool.query(
      `
      UPDATE operators
      SET
        app_id = $2,
        app_secret_hash = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [id, appId, appSecretHash]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, { isActive }) {
    const { rows } = await pool.query(
      `
      UPDATE operators
      SET
        is_active = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
      `,
      [id, isActive]
    );
    return rows[0] || null;
  }
}
