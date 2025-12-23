import { pool } from '../config/db.js'

/**
 * Beneficiary Model (Pix Favorecido)
 * fields: id (serial), user_id, name, bank_name, document, pix_key, key_type, created_at
 */
const BeneficiaryModel = {
  async create(userId, data) {
    const { name, bank_name, document, pix_key, key_type } = data
    const q = `INSERT INTO beneficiaries (user_id, name, bank_name, document, pix_key, key_type)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`
    const params = [userId, name, bank_name || null, document || null, pix_key, key_type || null]
    const res = await pool.query(q, params)
    return res.rows[0]
  },
  async listByUser(userId) {
    const res = await pool.query('SELECT * FROM beneficiaries WHERE user_id=$1 ORDER BY id DESC', [userId])
    return res.rows
  },
  async get(userId, id) {
    const res = await pool.query('SELECT * FROM beneficiaries WHERE user_id=$1 AND id=$2', [userId, id])
    return res.rows[0]
  },
  async remove(userId, id) {
    await pool.query('DELETE FROM beneficiaries WHERE user_id=$1 AND id=$2', [userId, id])
    return { success: true }
  },
  async update(userId, id, data) {
    const fields = []
    const params = [userId, id]
    let idx = 3
    if (data.name !== undefined) { fields.push(`name=$${idx++}`); params.push(data.name) }
    if (data.bank_name !== undefined) { fields.push(`bank_name=$${idx++}`); params.push(data.bank_name || null) }
    if (data.document !== undefined) { fields.push(`document=$${idx++}`); params.push(data.document || null) }
    if (data.pix_key !== undefined) { fields.push(`pix_key=$${idx++}`); params.push(data.pix_key) }
    if (data.key_type !== undefined) { fields.push(`key_type=$${idx++}`); params.push(data.key_type || null) }
    if (fields.length === 0) {
      const res = await pool.query('SELECT * FROM beneficiaries WHERE user_id=$1 AND id=$2', [userId, id])
      return res.rows[0]
    }
    const q = `UPDATE beneficiaries SET ${fields.join(', ')} WHERE user_id=$1 AND id=$2 RETURNING *`
    const res = await pool.query(q, params)
    return res.rows[0]
  },
};
export default BeneficiaryModel
