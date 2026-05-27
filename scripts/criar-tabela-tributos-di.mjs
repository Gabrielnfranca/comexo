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

await client.query(`DROP TABLE IF EXISTS tributos_di CASCADE`)
await client.query(`
  CREATE TABLE tributos_di (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    processo_id     UUID REFERENCES processos(id) ON DELETE CASCADE NOT NULL,
    tipo_tributo    TEXT NOT NULL,
    descricao       TEXT,
    base_calculo    NUMERIC(15,2),
    aliquota        NUMERIC(7,4),
    valor_calculado NUMERIC(15,2),
    valor_pago      NUMERIC(15,2),
    numero_darf     TEXT,
    data_pagamento  DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE tributos_di ENABLE ROW LEVEL SECURITY`)
await client.query(`DROP POLICY IF EXISTS "tributos_di_own" ON tributos_di`)
await client.query(`
  CREATE POLICY "tributos_di_own"
    ON tributos_di FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM processos p
        WHERE p.id = tributos_di.processo_id
          AND p.responsavel_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM processos p
        WHERE p.id = tributos_di.processo_id
          AND p.responsavel_id = auth.uid()
      )
    )
`)

console.log('✅ Tabela tributos_di criada com sucesso!')
await client.end()
