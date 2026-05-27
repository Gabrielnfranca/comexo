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

console.log('🚀 Iniciando migration V3.0...')

// ── 1. cClassTrib em ncm_codigos ──────────────────────────────
console.log('📌 Adicionando cClassTrib em ncm_codigos...')
await client.query(`
  ALTER TABLE ncm_codigos
    ADD COLUMN IF NOT EXISTS c_class_trib         TEXT,
    ADD COLUMN IF NOT EXISTS requer_lpco          BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS orgao_anuente        TEXT,
    ADD COLUMN IF NOT EXISTS tem_antidumping      BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ex_tarifario         TEXT,
    ADD COLUMN IF NOT EXISTS atributos_ncm        JSONB DEFAULT '[]'::jsonb
`)
console.log('   ✅ ncm_codigos atualizado')

// ── 2. RADAR em clientes ──────────────────────────────────────
console.log('📌 Adicionando campos RADAR em clientes...')
await client.query(`
  ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS numero_radar              TEXT,
    ADD COLUMN IF NOT EXISTS tipo_habilitacao_radar    TEXT CHECK (tipo_habilitacao_radar IN ('limitada','ilimitada','especial','nenhuma')),
    ADD COLUMN IF NOT EXISTS validade_radar            DATE,
    ADD COLUMN IF NOT EXISTS radar_ativo               BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS inscricao_estadual        TEXT,
    ADD COLUMN IF NOT EXISTS regime_tributario         TEXT CHECK (regime_tributario IN ('simples_nacional','lucro_presumido','lucro_real'))
`)
console.log('   ✅ clientes atualizado')

// ── 3. Catálogo de Produtos ───────────────────────────────────
console.log('📌 Criando tabela produtos_catalogo...')
await client.query(`DROP TABLE IF EXISTS produtos_catalogo CASCADE`)
await client.query(`
  CREATE TABLE produtos_catalogo (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Identificação do produto
    codigo_interno        TEXT,
    descricao             TEXT NOT NULL,
    descricao_comercial   TEXT,
    -- Classificação fiscal
    ncm_codigo            TEXT NOT NULL,
    c_class_trib          TEXT,
    -- Origem e fabricante
    pais_origem           TEXT,
    fabricante            TEXT,
    marca                 TEXT,
    modelo                TEXT,
    -- Atributos obrigatórios Siscomex (JSONB: [{chave, valor}])
    atributos             JSONB DEFAULT '[]'::jsonb,
    -- Licenciamento
    requer_lpco           BOOLEAN DEFAULT FALSE,
    orgao_anuente         TEXT,
    -- Fiscais
    tem_antidumping       BOOLEAN DEFAULT FALSE,
    ex_tarifario          TEXT,
    -- Medidas
    unidade_medida        TEXT DEFAULT 'UN',
    peso_liquido_kg       NUMERIC(12,4),
    peso_bruto_kg         NUMERIC(12,4),
    -- Observações
    observacoes           TEXT,
    ativo                 BOOLEAN DEFAULT TRUE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
  )
`)

await client.query(`
  ALTER TABLE produtos_catalogo ENABLE ROW LEVEL SECURITY
`)
await client.query(`
  CREATE POLICY "usuarios_seus_produtos" ON produtos_catalogo
    FOR ALL USING (user_id = auth.uid())
`)
console.log('   ✅ produtos_catalogo criada')

// ── 4. Intervenientes ─────────────────────────────────────────
console.log('📌 Criando tabela intervenientes...')
await client.query(`DROP TABLE IF EXISTS intervenientes CASCADE`)
await client.query(`
  CREATE TABLE intervenientes (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo              TEXT NOT NULL CHECK (tipo IN (
                        'agente_carga',
                        'transportador_terrestre',
                        'recinto_alfandegado',
                        'despachante_parceiro',
                        'agente_exterior',
                        'fabricante_estrangeiro',
                        'seguradora',
                        'banco'
                      )),
    razao_social      TEXT NOT NULL,
    nome_fantasia     TEXT,
    -- Identificação (CNPJ para BR, Tax ID para exterior)
    cnpj              TEXT,
    tax_id_exterior   TEXT,
    pais              TEXT DEFAULT 'BR',
    -- Contato
    email             TEXT,
    telefone          TEXT,
    contato_nome      TEXT,
    -- Endereço
    endereco          TEXT,
    cidade            TEXT,
    estado            TEXT,
    cep               TEXT,
    -- Específico por tipo
    codigo_recinto    TEXT,              -- para recinto_alfandegado
    nire              TEXT,              -- para agente_carga
    -- Flags
    ativo             BOOLEAN DEFAULT TRUE,
    observacoes       TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
  )
`)

await client.query(`
  ALTER TABLE intervenientes ENABLE ROW LEVEL SECURITY
`)
await client.query(`
  CREATE POLICY "usuarios_seus_intervenientes" ON intervenientes
    FOR ALL USING (user_id = auth.uid())
`)
console.log('   ✅ intervenientes criada')

// ── 5. LPCO / Licenciamento ───────────────────────────────────
console.log('📌 Criando tabela lpco_registros...')
await client.query(`DROP TABLE IF EXISTS lpco_registros CASCADE`)
await client.query(`
  CREATE TABLE lpco_registros (
    id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id               UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    processo_id           UUID,           -- pode estar vinculado a um processo
    -- Identificação
    numero_lpco           TEXT,
    tipo_licenca          TEXT CHECK (tipo_licenca IN ('li','lpco','anuencia')),
    orgao_anuente         TEXT NOT NULL,   -- ANVISA, MAPA, IBAMA, etc.
    -- Produto / NCM
    ncm_codigo            TEXT,
    descricao_mercadoria  TEXT,
    -- Status
    status                TEXT NOT NULL DEFAULT 'rascunho'
                            CHECK (status IN ('rascunho','solicitado','em_analise','aprovado','indeferido','expirado','cancelado')),
    -- Datas
    data_solicitacao      DATE,
    data_aprovacao        DATE,
    data_validade         DATE,
    -- Valores
    quantidade            NUMERIC(14,4),
    unidade_medida        TEXT,
    valor_usd             NUMERIC(14,2),
    -- Importador
    importador_cnpj       TEXT,
    importador_nome       TEXT,
    -- Exportador / Fabricante
    exportador_nome       TEXT,
    pais_origem           TEXT,
    -- Observações
    numero_di             TEXT,           -- DI/DUIMP vinculada
    observacoes           TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
  )
`)

await client.query(`
  ALTER TABLE lpco_registros ENABLE ROW LEVEL SECURITY
`)
await client.query(`
  CREATE POLICY "usuarios_seus_lpco" ON lpco_registros
    FOR ALL USING (user_id = auth.uid())
`)
console.log('   ✅ lpco_registros criada')

// ── 6. Simulador de Tributos (histórico) ──────────────────────
console.log('📌 Criando tabela simulacoes_tributos...')
await client.query(`DROP TABLE IF EXISTS simulacoes_tributos CASCADE`)
await client.query(`
  CREATE TABLE simulacoes_tributos (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Input
    ncm_codigo          TEXT NOT NULL,
    descricao           TEXT,
    valor_aduaneiro_usd NUMERIC(14,2) NOT NULL,
    taxa_cambio         NUMERIC(10,4) NOT NULL,
    frete_usd           NUMERIC(14,2) DEFAULT 0,
    seguro_usd          NUMERIC(14,2) DEFAULT 0,
    quantidade          NUMERIC(14,4) DEFAULT 1,
    unidade_medida      TEXT,
    estado_destino      TEXT,
    -- Alíquotas usadas
    aliquota_ii         NUMERIC(8,4),
    aliquota_ipi        NUMERIC(8,4),
    aliquota_pis        NUMERIC(8,4),
    aliquota_cofins     NUMERIC(8,4),
    aliquota_icms       NUMERIC(8,4),
    -- Resultados calculados
    valor_aduaneiro_brl NUMERIC(14,2),
    valor_ii            NUMERIC(14,2),
    valor_ipi           NUMERIC(14,2),
    valor_pis           NUMERIC(14,2),
    valor_cofins        NUMERIC(14,2),
    valor_icms          NUMERIC(14,2),
    valor_afrmm         NUMERIC(14,2),
    taxa_siscomex       NUMERIC(14,2),
    total_tributos      NUMERIC(14,2),
    custo_total         NUMERIC(14,2),
    -- Meta
    observacoes         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
  )
`)

await client.query(`
  ALTER TABLE simulacoes_tributos ENABLE ROW LEVEL SECURITY
`)
await client.query(`
  CREATE POLICY "usuarios_suas_simulacoes" ON simulacoes_tributos
    FOR ALL USING (user_id = auth.uid())
`)
console.log('   ✅ simulacoes_tributos criada')

// ── Triggers de updated_at ────────────────────────────────────
const tablesWithUpdatedAt = ['produtos_catalogo', 'intervenientes', 'lpco_registros']
for (const t of tablesWithUpdatedAt) {
  await client.query(`
    CREATE OR REPLACE FUNCTION update_${t}_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql
  `)
  await client.query(`
    DROP TRIGGER IF EXISTS trigger_update_${t}_updated_at ON ${t};
    CREATE TRIGGER trigger_update_${t}_updated_at
      BEFORE UPDATE ON ${t}
      FOR EACH ROW EXECUTE FUNCTION update_${t}_updated_at()
  `)
}
console.log('   ✅ Triggers updated_at criados')

await client.end()
console.log('')
console.log('🎉 Migration V3.0 concluída com sucesso!')
console.log('   Tabelas criadas: produtos_catalogo, intervenientes, lpco_registros, simulacoes_tributos')
console.log('   Tabelas alteradas: ncm_codigos (cClassTrib), clientes (RADAR)')
