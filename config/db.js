import pkg from 'pg'
const { Pool } = pkg
import { env } from './env.js'

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function initDb() {
  console.log('[DB user-service] init...')


  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      external_id TEXT,
      name TEXT NOT NULL,
      email TEXT,
      document TEXT,
      cnpj TEXT,
      company_name TEXT,
      trade_name TEXT,
      partner_name TEXT,
      cnpj_data JSONB,
      doc_status TEXT DEFAULT 'PENDING',
      doc_status_notes TEXT,
      doc_status_updated_at TIMESTAMPTZ,
      gateway_fee_percent NUMERIC(5,2) DEFAULT 0,
      partner_fee_percent NUMERIC(5,2) DEFAULT 100,
      status TEXT DEFAULT 'ACTIVE',
      password_hash TEXT,
      role TEXT DEFAULT 'USER',
      provider TEXT,
      webhook_url TEXT,
      ip_whitelist TEXT,
      webhook_url_pix_in TEXT,
      webhook_url_pix_out TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj);
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);
  `)

 
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_fees (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      pix_in_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
      pix_out_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
      pix_in_fee_type TEXT DEFAULT 'PERCENT',
      pix_in_fee_value NUMERIC(18,2) NOT NULL DEFAULT 0,
      pix_out_fee_type TEXT DEFAULT 'PERCENT',
      pix_out_fee_value NUMERIC(18,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_user_fees_user_id
    ON user_fees(user_id);
  `)

 
  await db.query(`
    CREATE TABLE IF NOT EXISTS providers (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      base_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_providers_code ON providers(code);
  `)

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(active);
  `)

  console.log('[DB user-service] ok.')
}
