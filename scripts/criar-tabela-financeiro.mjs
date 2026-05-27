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

await client.query(`DROP TABLE IF EXISTS lancamentos_financeiros CASCADE`)

await client.query(`
  CREATE TABLE lancamentos_financeiros (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    processo_id  UUID REFERENCES processos(id) ON DELETE SET NULL,
    tipo         TEXT NOT NULL DEFAULT 'despesa',
    categoria    TEXT NOT NULL DEFAULT 'outros',
    descricao    TEXT NOT NULL,
    valor        DECIMAL(15,2) NOT NULL DEFAULT 0,
    moeda        TEXT NOT NULL DEFAULT 'BRL',
    status       TEXT NOT NULL DEFAULT 'pendente',
    vencimento   DATE,
    pagamento    DATE,
    observacoes  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
  )
`)

await client.query(`ALTER TABLE lancamentos_financeiros ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "lancamentos_own" ON lancamentos_financeiros`)
await client.query(`
  CREATE POLICY "lancamentos_own"
    ON lancamentos_financeiros FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)
`)

console.log('✅ Tabela lancamentos_financeiros criada com sucesso!')
await client.end()
