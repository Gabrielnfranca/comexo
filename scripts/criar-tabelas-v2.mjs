import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(l => l.includes('=') && !l.startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=')
    acc[k.trim()] = v.join('=').trim()
    return acc
  }, {})

const client = new pg.Client({ connectionString: env.SUPABASE_DB_URL })
await client.connect()

// ── CCTs ─────────────────────────────────────────────────────
await client.query(`DROP TABLE IF EXISTS ccts CASCADE`)
await client.query(`
  CREATE TABLE ccts (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    numero_conhecimento TEXT NOT NULL,
    data_chegada      DATE,
    local_chegada     TEXT,
    transportadora    TEXT,
    peso_bruto_kg     NUMERIC(12,3),
    numero_volumes    INTEGER,
    processo_id       UUID,
    status            TEXT DEFAULT 'aguardando'
                      CHECK (status IN ('aguardando','recebido','com_divergencia','regularizado')),
    observacoes       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE ccts ENABLE ROW LEVEL SECURITY`)
await client.query(`
  CREATE POLICY "users_own_ccts" ON ccts
  FOR ALL USING (user_id = auth.uid())
`)
console.log('✅ Tabela ccts criada.')

// ── AFRMM (Mercante) ─────────────────────────────────────────
await client.query(`DROP TABLE IF EXISTS afrmm_registros CASCADE`)
await client.query(`
  CREATE TABLE afrmm_registros (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    numero_conhecimento   TEXT NOT NULL,
    data_embarque         DATE,
    porto_origem          TEXT,
    porto_destino         TEXT,
    armador               TEXT,
    valor_frete_usd       NUMERIC(15,2),
    taxa_cambio           NUMERIC(10,4),
    valor_frete_brl       NUMERIC(15,2),
    valor_afrmm_brl       NUMERIC(15,2),
    numero_dpc            TEXT,
    data_vencimento_dpc   DATE,
    data_pagamento        DATE,
    status                TEXT DEFAULT 'pendente'
                          CHECK (status IN ('pendente','dpc_gerado','pago','dispensado')),
    processo_id           UUID,
    observacoes           TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE afrmm_registros ENABLE ROW LEVEL SECURITY`)
await client.query(`
  CREATE POLICY "users_own_afrmm" ON afrmm_registros
  FOR ALL USING (user_id = auth.uid())
`)
console.log('✅ Tabela afrmm_registros criada.')

// ── IA Consultas ─────────────────────────────────────────────
await client.query(`DROP TABLE IF EXISTS ia_consultas CASCADE`)
await client.query(`
  CREATE TABLE ia_consultas (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_arquivo     TEXT,
    tipo_documento   TEXT,
    dados_extraidos  JSONB,
    ncm_principal    TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
  )
`)
await client.query(`ALTER TABLE ia_consultas ENABLE ROW LEVEL SECURITY`)
await client.query(`
  CREATE POLICY "users_own_ia_consultas" ON ia_consultas
  FOR ALL USING (user_id = auth.uid())
`)
console.log('✅ Tabela ia_consultas criada.')

await client.end()
console.log('\n🎉 Migration V2.0 concluída com sucesso!')
