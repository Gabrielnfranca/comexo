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

  // ── drawback_atos ─────────────────────────────────────────────────────────
  await client.query(`DROP TABLE IF EXISTS drawback_exportacoes CASCADE`)
  await client.query(`DROP TABLE IF EXISTS drawback_insumos CASCADE`)
  await client.query(`DROP TABLE IF EXISTS drawback_atos CASCADE`)
  await client.query(`
    CREATE TABLE drawback_atos (
      id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      numero_ato          TEXT NOT NULL,
      modalidade          TEXT NOT NULL CHECK (modalidade IN ('suspensao','isencao','restituicao')),
      cliente             TEXT NOT NULL,
      data_concessao      DATE,
      data_vencimento     DATE,
      prazo_meses         INTEGER DEFAULT 12,
      valor_fob_exportar  NUMERIC(15,2),
      valor_fob_exportado NUMERIC(15,2) DEFAULT 0,
      status              TEXT NOT NULL DEFAULT 'vigente'
                          CHECK (status IN ('vigente','vencido','prorrogado','comprovado','cancelado')),
      referencia_interna  TEXT,
      observacoes         TEXT,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('Tabela drawback_atos criada/existente.')

  await client.query(`
    ALTER TABLE drawback_atos ENABLE ROW LEVEL SECURITY
  `)
  await client.query(`
    DROP POLICY IF EXISTS "users_own_drawback_atos" ON drawback_atos
  `)
  await client.query(`
    CREATE POLICY "users_own_drawback_atos"
      ON drawback_atos FOR ALL
      USING (user_id = auth.uid())
  `)
  console.log('RLS drawback_atos configurado.')

  // ── drawback_insumos ──────────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE drawback_insumos (
      id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ato_id                UUID REFERENCES drawback_atos(id) ON DELETE CASCADE NOT NULL,
      user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      descricao             TEXT NOT NULL,
      ncm                   TEXT,
      unidade               TEXT,
      quantidade_autorizada NUMERIC(15,4),
      quantidade_utilizada  NUMERIC(15,4) DEFAULT 0,
      valor_unitario_fob    NUMERIC(15,4),
      ii_suspenso           NUMERIC(15,2) DEFAULT 0,
      ipi_suspenso          NUMERIC(15,2) DEFAULT 0,
      pis_suspenso          NUMERIC(15,2) DEFAULT 0,
      cofins_suspenso       NUMERIC(15,2) DEFAULT 0,
      created_at            TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('Tabela drawback_insumos criada/existente.')

  await client.query(`ALTER TABLE drawback_insumos ENABLE ROW LEVEL SECURITY`)
  await client.query(`DROP POLICY IF EXISTS "users_own_drawback_insumos" ON drawback_insumos`)
  await client.query(`
    CREATE POLICY "users_own_drawback_insumos"
      ON drawback_insumos FOR ALL
      USING (user_id = auth.uid())
  `)
  console.log('RLS drawback_insumos configurado.')

  // ── drawback_exportacoes ──────────────────────────────────────────────────
  await client.query(`
    CREATE TABLE drawback_exportacoes (
      id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      ato_id               UUID REFERENCES drawback_atos(id) ON DELETE CASCADE NOT NULL,
      user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      processo_id          UUID REFERENCES processos(id) ON DELETE SET NULL,
      numero_due           TEXT,
      data_embarque        DATE,
      valor_fob_exportado  NUMERIC(15,2),
      mercadoria           TEXT,
      observacoes          TEXT,
      created_at           TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('Tabela drawback_exportacoes criada/existente.')

  await client.query(`ALTER TABLE drawback_exportacoes ENABLE ROW LEVEL SECURITY`)
  await client.query(`DROP POLICY IF EXISTS "users_own_drawback_exportacoes" ON drawback_exportacoes`)
  await client.query(`
    CREATE POLICY "users_own_drawback_exportacoes"
      ON drawback_exportacoes FOR ALL
      USING (user_id = auth.uid())
  `)
  console.log('RLS drawback_exportacoes configurado.')

  await client.end()
  console.log('\n✅  Todas as tabelas de Drawback criadas com sucesso.')
}

run().catch((err) => {
  console.error('Erro:', err.message)
  process.exit(1)
})
