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

await client.query(`DROP TABLE IF EXISTS ncm_codigos CASCADE`)
await client.query(`
  CREATE TABLE ncm_codigos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    codigo          TEXT NOT NULL,
    descricao       TEXT NOT NULL,
    aliquota_ii     NUMERIC(5,2),
    aliquota_ipi    NUMERIC(5,2),
    aliquota_pis    NUMERIC(5,2),
    aliquota_cofins NUMERIC(5,2),
    unidade_medida  TEXT,
    observacoes     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, codigo)
  )
`)
await client.query(`ALTER TABLE ncm_codigos ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "ncm_own" ON ncm_codigos`)
await client.query(`
  CREATE POLICY "ncm_own"
    ON ncm_codigos FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)

console.log('✅ Tabela ncm_codigos criada com sucesso!')
await client.end()
