import { db } from '../config/db.js'

export const ProviderModel = {
  list() {
    return db.query('SELECT * FROM providers ORDER BY id DESC')
  },
  create(name, code) {
    return db.query(
      'INSERT INTO providers (name, code) VALUES ($1,$2) RETURNING *',
      [name, code]
    )
  }
}
