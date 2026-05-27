// Migração: tabelas ccts e afrmm_registros
import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg
const envFile = readFileSync('.env.local', 'utf-8')
const dbUrl = envFile.match(/SUPABASE_DB_URL=(.+)/)?.[1]?.trim()
if (!dbUrl) { console.error('SUPABASE_DB_URL não encontrada'); process.exit(1) }

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
await client.connect()

console.log('🔧 Criando tabelas CCT e AFRMM...\n')

const sql = `
-- ── Tabela CCT (Controle de Carga e Trânsito) ─────────────────────────────
CREATE TABLE IF NOT EXISTS ccts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  processo_id       UUID REFERENCES processos(id) ON DELETE SET NULL,
  numero_conhecimento TEXT NOT NULL,
  data_chegada      DATE,
  local_chegada     TEXT,
  transportadora    TEXT,
  peso_bruto_kg     NUMERIC(12,3),
  numero_volumes    INTEGER,
  status            TEXT NOT NULL DEFAULT 'aguardando'
                    CHECK (status IN ('aguardando','recebido','com_divergencia','regularizado')),
  numero_ce         TEXT,           -- CE-Mercante (futuro: buscar via API Siscomex)
  numero_manifesto  TEXT,           -- Número do Manifesto de Carga
  navio_nome        TEXT,           -- Nome do navio/aeronave
  viagem_numero     TEXT,           -- Número da viagem
  terminal          TEXT,           -- Terminal de chegada
  observacoes       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE ccts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_veem_proprios_ccts" ON ccts;
CREATE POLICY "usuarios_veem_proprios_ccts" ON ccts
  FOR ALL USING (auth.uid() = user_id);

-- ── Tabela AFRMM (Marinha Mercante) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS afrmm_registros (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  processo_id           UUID REFERENCES processos(id) ON DELETE SET NULL,
  numero_conhecimento   TEXT NOT NULL,
  data_embarque         DATE,
  porto_origem          TEXT,
  porto_destino         TEXT,
  armador               TEXT,
  -- Valores
  valor_frete_usd       NUMERIC(14,2),
  taxa_cambio           NUMERIC(10,6),
  valor_frete_brl       NUMERIC(14,2),
  valor_afrmm_brl       NUMERIC(14,2),
  -- DPC (Documento de Prestação de Contas) / GFEM
  numero_dpc            TEXT,           -- Número do DPC / GFEM
  data_vencimento_dpc   DATE,
  data_pagamento        DATE,
  numero_darf           TEXT,           -- DARF do AFRMM
  -- Status
  status                TEXT NOT NULL DEFAULT 'pendente'
                        CHECK (status IN ('pendente','dpc_gerado','pago','dispensado')),
  -- Futuro: integração API Mercante
  ce_mercante           TEXT,           -- CE registrado no Sistema Mercante (API)
  consultado_em         TIMESTAMPTZ,    -- Última consulta ao Sistema Mercante
  observacoes           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE afrmm_registros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_veem_proprios_afrmm" ON afrmm_registros;
CREATE POLICY "usuarios_veem_proprios_afrmm" ON afrmm_registros
  FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ccts_processo ON ccts(processo_id);
CREATE INDEX IF NOT EXISTS idx_ccts_user ON ccts(user_id);
CREATE INDEX IF NOT EXISTS idx_afrmm_processo ON afrmm_registros(processo_id);
CREATE INDEX IF NOT EXISTS idx_afrmm_user ON afrmm_registros(user_id);
CREATE INDEX IF NOT EXISTS idx_afrmm_status ON afrmm_registros(status);
`

try {
  await client.query(sql)
  console.log('✅ Tabela "ccts" criada com sucesso')
  console.log('✅ Tabela "afrmm_registros" criada com sucesso')
  console.log('✅ RLS habilitado em ambas')
  console.log('✅ Índices criados')
  console.log('\n🎉 Migração concluída! CCT e Mercante prontos para uso.')
} catch (err) {
  console.error('❌ Erro:', err.message)
} finally {
  await client.end()
}
