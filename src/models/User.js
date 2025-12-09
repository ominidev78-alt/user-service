import { db } from '../config/db.js'

export const UserModel = {
  findById(id) {
    return db.query('SELECT * FROM users WHERE id=$1', [id])
  },
  list() {
    return db.query('SELECT * FROM users ORDER BY id DESC')
  },
  update(id, data) {
    return db.query(
      'UPDATE users SET first_name=$1, last_name=$2, phone=$3, doc_status=$4 WHERE id=$5 RETURNING *',
      [data.first_name, data.last_name, data.phone, data.doc_status, id]
    )
  }
}
