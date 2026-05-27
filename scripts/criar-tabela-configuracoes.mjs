import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  .split('\n').filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); if (k) acc[k.trim()] = v.join('=').trim(); return acc }, {})

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

await client.query(`
  CREATE TABLE IF NOT EXISTS configuracoes (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    nome_empresa    TEXT,
    cnpj_empresa    TEXT,
    telefone        TEXT,
    email_empresa   TEXT,
    site            TEXT,
    endereco        TEXT,
    cidade          TEXT,
    estado          TEXT,
    cep             TEXT,
    responsavel     TEXT,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  )
`)
console.log('✓ Tabela "configuracoes" criada.')

await client.query(`ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "configuracoes_own" ON configuracoes`)
await client.query(`
  CREATE POLICY "configuracoes_own"
    ON configuracoes FOR ALL
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)
console.log('✓ RLS configurado.')

await client.end()
console.log('\n✅ Tabela de configurações criada com sucesso!')
