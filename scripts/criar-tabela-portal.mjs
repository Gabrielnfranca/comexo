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
  CREATE TABLE IF NOT EXISTS portal_acessos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    despachante_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cliente_id      UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
    email           TEXT NOT NULL,
    token_convite   UUID DEFAULT gen_random_uuid() NOT NULL,
    token_expira    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    aceito          BOOLEAN DEFAULT false,
    ativo           BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(despachante_id, email)
  )
`)
console.log('✓ Tabela "portal_acessos" criada.')

await client.query(`ALTER TABLE portal_acessos ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "portal_despachante_manage" ON portal_acessos`)
await client.query(`
  CREATE POLICY "portal_despachante_manage"
    ON portal_acessos FOR ALL
    USING  (auth.uid() = despachante_id)
    WITH CHECK (auth.uid() = despachante_id)
`)
console.log('✓ RLS configurado.')

await client.end()
console.log('\n✅ Tabela portal_acessos criada com sucesso!')
