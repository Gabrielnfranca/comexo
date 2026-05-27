import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=')
    if (k) acc[k.trim()] = v.join('=').trim()
    return acc
  }, {})

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

await client.query(`DROP TABLE IF EXISTS armadores CASCADE`)
await client.query(`
  CREATE TABLE armadores (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome       TEXT NOT NULL,
    codigo     TEXT,
    modal      TEXT NOT NULL DEFAULT 'maritimo',
    pais_sede  TEXT,
    site       TEXT,
    observacoes TEXT,
    ativo      BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE armadores ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "armadores_own" ON armadores`)
await client.query(`
  CREATE POLICY "armadores_own"
    ON armadores FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)

console.log('✅ Tabela armadores criada com sucesso!')
await client.end()
