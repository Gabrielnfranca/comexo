import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = readFileSync(envPath, 'utf-8')
  .split('\n')
  .filter(l => l.includes('='))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=')
    acc[k.trim()] = v.join('=').trim()
    return acc
  }, {})

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()
console.log('Conectado ao banco de dados.')

await client.query(`DROP TABLE IF EXISTS operacoes_fictas CASCADE`)

await client.query(`
  CREATE TABLE operacoes_fictas (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    numero_operacao         TEXT NOT NULL,
    tipo                    TEXT NOT NULL CHECK (tipo IN ('zfm','zpe','recof','drawback_fornecedor','outros')),
    status                  TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_andamento','comprovada','cancelada')),
    cliente                 TEXT NOT NULL,
    cnpj_cliente            TEXT,
    descricao_mercadoria    TEXT,
    ncm                     TEXT,
    quantidade              NUMERIC(15,4),
    unidade                 TEXT,
    valor_nf                NUMERIC(15,2),
    moeda                   TEXT NOT NULL DEFAULT 'BRL',
    numero_nf               TEXT,
    data_nf                 DATE,
    numero_due              TEXT,
    data_due                DATE,
    beneficio_fiscal        TEXT,
    valor_beneficio_fiscal  NUMERIC(15,2),
    comprovante_internamento TEXT,
    data_comprovacao        DATE,
    processo_id             UUID,
    referencia_interna      TEXT,
    observacoes             TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`)
console.log('Tabela operacoes_fictas criada.')

await client.query(`ALTER TABLE operacoes_fictas ENABLE ROW LEVEL SECURITY`)

await client.query(`
  CREATE POLICY "usuarios_proprios_ficta" ON operacoes_fictas
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())
`)
console.log('RLS configurado.')

await client.end()
console.log('\n✅  Tabela operacoes_fictas criada com sucesso.')
