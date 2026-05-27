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

await client.query(`DROP TABLE IF EXISTS fornecedores CASCADE`)
await client.query(`
  CREATE TABLE fornecedores (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    razao_social  TEXT NOT NULL,
    nome_fantasia TEXT,
    pais          TEXT,
    cidade        TEXT,
    contato_nome  TEXT,
    contato_email TEXT,
    contato_telefone TEXT,
    site          TEXT,
    observacoes   TEXT,
    ativo         BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "fornecedores_own" ON fornecedores`)
await client.query(`
  CREATE POLICY "fornecedores_own"
    ON fornecedores FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)

console.log('✅ Tabela fornecedores criada com sucesso!')
await client.end()
