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

const { Client } = pg
const client = new Client({ connectionString: env.SUPABASE_DB_URL })

async function run() {
  await client.connect()
  console.log('Conectado ao banco de dados.')

  await client.query(`DROP TABLE IF EXISTS entreposto_lotes CASCADE`)

  await client.query(`
    CREATE TABLE entreposto_lotes (
      id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      numero_lote         TEXT NOT NULL,
      processo_id         UUID REFERENCES processos(id) ON DELETE SET NULL,
      tipo                TEXT NOT NULL CHECK (tipo IN ('importacao','exportacao')),
      regime              TEXT NOT NULL DEFAULT 'comum'
                          CHECK (regime IN ('comum','especial','industrial')),
      beneficiario        TEXT NOT NULL,
      descricao_mercadoria TEXT,
      ncm                 TEXT,
      quantidade          NUMERIC(15,4),
      unidade             TEXT,
      valor_aduaneiro     NUMERIC(15,2),
      moeda               TEXT DEFAULT 'USD',
      data_entrada        DATE NOT NULL,
      prazo_meses         INTEGER DEFAULT 12,
      data_limite         DATE,
      data_saida          DATE,
      tipo_saida          TEXT CHECK (tipo_saida IN ('desembaraco','reexportacao','destruicao','abandono')),
      status              TEXT NOT NULL DEFAULT 'armazenado'
                          CHECK (status IN ('armazenado','desembaracado','reexportado','destruido','abandonado','vencido')),
      recinto_aduaneiro   TEXT,
      numero_dacta        TEXT,
      observacoes         TEXT,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('Tabela entreposto_lotes criada.')

  await client.query(`ALTER TABLE entreposto_lotes ENABLE ROW LEVEL SECURITY`)
  await client.query(`DROP POLICY IF EXISTS "users_own_entreposto" ON entreposto_lotes`)
  await client.query(`
    CREATE POLICY "users_own_entreposto"
      ON entreposto_lotes FOR ALL
      USING (user_id = auth.uid())
  `)
  console.log('RLS configurado.')

  await client.end()
  console.log('\n✅  Tabela entreposto_lotes criada com sucesso.')
}

run().catch((err) => {
  console.error('Erro:', err.message)
  process.exit(1)
})
