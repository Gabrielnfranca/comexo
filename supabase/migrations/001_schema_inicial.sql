-- ============================================================
-- COMEXO — Migration 001: Schema Inicial Completo
-- Criado em: 2026-05-26
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE plano_tipo AS ENUM ('trial', 'starter', 'professional', 'enterprise');
CREATE TYPE usuario_perfil AS ENUM ('admin', 'supervisor', 'operador', 'visualizador');
CREATE TYPE processo_tipo AS ENUM ('importacao', 'exportacao');
CREATE TYPE processo_modal AS ENUM ('aereo', 'maritimo', 'rodoviario', 'ferroviario');
CREATE TYPE processo_status AS ENUM (
  'aberto', 'aguardando_documentos', 'em_transito', 'chegada_confirmada',
  'em_despacho', 'parametrizado', 'liberado', 'entregue', 'finalizado', 'cancelado'
);
CREATE TYPE canal_parametrizacao AS ENUM ('verde', 'amarelo', 'vermelho', 'cinza');
CREATE TYPE documento_tipo AS ENUM (
  'invoice', 'packing_list', 'bl', 'awb', 'crt', 'mic_dta', 'tif',
  'due', 'di', 'li', 'certificado_origem', 'nota_fiscal',
  'comprovante_pagamento', 'contrato_cambio', 'outros'
);
CREATE TYPE drawback_modalidade AS ENUM ('suspensao', 'isencao', 'restituicao');
CREATE TYPE notificacao_canal AS ENUM ('email', 'whatsapp', 'sistema');
CREATE TYPE financeiro_status AS ENUM ('pendente', 'pago', 'vencido', 'cancelado');

-- ============================================================
-- TABELA: empresas (multi-tenant — cada cliente é uma empresa)
-- ============================================================
CREATE TABLE empresas (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  TEXT NOT NULL,
  cnpj                  TEXT UNIQUE NOT NULL,
  email                 TEXT NOT NULL,
  telefone              TEXT,
  endereco              JSONB DEFAULT '{}',
  plano                 plano_tipo DEFAULT 'trial',
  plano_inicio          DATE,
  plano_fim             DATE,
  processos_mes_limite  INTEGER DEFAULT 30,
  usuarios_limite       INTEGER DEFAULT 3,
  storage_limite_gb     INTEGER DEFAULT 10,
  logo_url              TEXT,
  ativo                 BOOLEAN DEFAULT true,
  configuracoes         JSONB DEFAULT '{}',
  criado_em             TIMESTAMPTZ DEFAULT now(),
  atualizado_em         TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: usuarios (espelho de auth.users com dados adicionais)
-- ============================================================
CREATE TABLE usuarios (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome                TEXT NOT NULL,
  email               TEXT NOT NULL,
  telefone            TEXT,
  perfil              usuario_perfil DEFAULT 'operador',
  avatar_url          TEXT,
  dois_fatores_ativo  BOOLEAN DEFAULT false,
  ultimo_acesso       TIMESTAMPTZ,
  ativo               BOOLEAN DEFAULT true,
  criado_em           TIMESTAMPTZ DEFAULT now(),
  atualizado_em       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: clientes
-- ============================================================
CREATE TABLE clientes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id              UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  razao_social            TEXT NOT NULL,
  nome_fantasia           TEXT,
  cnpj_cpf                TEXT,
  pais                    TEXT DEFAULT 'BR',
  email                   TEXT,
  telefone                TEXT,
  contato_nome            TEXT,
  endereco                JSONB DEFAULT '{}',
  portal_acesso_ativo     BOOLEAN DEFAULT false,
  portal_email            TEXT,
  portal_token            TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  observacoes             TEXT,
  ativo                   BOOLEAN DEFAULT true,
  criado_em               TIMESTAMPTZ DEFAULT now(),
  atualizado_em           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: fornecedores (exportadores/vendors no exterior)
-- ============================================================
CREATE TABLE fornecedores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  razao_social  TEXT NOT NULL,
  pais          TEXT NOT NULL,
  endereco      JSONB DEFAULT '{}',
  email         TEXT,
  telefone      TEXT,
  contato_nome  TEXT,
  observacoes   TEXT,
  ativo         BOOLEAN DEFAULT true,
  criado_em     TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: transportadores (armadores, cias aéreas, transportadoras)
-- ============================================================
CREATE TABLE transportadores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('armador', 'cia_aerea', 'transportadora_rodoviaria', 'agente_carga')),
  codigo      TEXT,
  pais        TEXT,
  site        TEXT,
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: recintos_aduaneiros (portos, aeroportos, postos, EDIs)
-- ============================================================
CREATE TABLE recintos_aduaneiros (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome             TEXT NOT NULL,
  tipo             TEXT NOT NULL CHECK (tipo IN ('porto', 'aeroporto', 'posto_fronteira', 'eadi', 'clias', 'depot', 'redex')),
  codigo_siscomex  TEXT,
  cidade           TEXT,
  uf               TEXT,
  pais             TEXT DEFAULT 'BR',
  ativo            BOOLEAN DEFAULT true,
  criado_em        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: ncm (Nomenclatura Comum do Mercosul)
-- ============================================================
CREATE TABLE ncm (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo          TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  ii_aliquota     DECIMAL(5,2) DEFAULT 0,
  ipi_aliquota    DECIMAL(5,2) DEFAULT 0,
  pis_aliquota    DECIMAL(5,2) DEFAULT 0,
  cofins_aliquota DECIMAL(5,2) DEFAULT 0,
  ex_tarifario    TEXT,
  observacoes     TEXT,
  ativo           BOOLEAN DEFAULT true,
  criado_em       TIMESTAMPTZ DEFAULT now(),
  atualizado_em   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, codigo)
);

-- ============================================================
-- TABELA: cambio (taxas de câmbio históricas)
-- ============================================================
CREATE TABLE cambio (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  moeda       TEXT NOT NULL CHECK (moeda IN ('USD', 'EUR', 'CNY', 'GBP', 'ARS', 'CLP', 'UYU', 'PYG', 'CHF', 'JPY')),
  data        DATE NOT NULL,
  taxa_compra DECIMAL(10,4) NOT NULL,
  taxa_venda  DECIMAL(10,4) NOT NULL,
  fonte       TEXT DEFAULT 'manual' CHECK (fonte IN ('manual', 'bacen', 'api')),
  criado_em   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, moeda, data)
);

-- ============================================================
-- TABELA: processos (núcleo do sistema — importação e exportação)
-- ============================================================
CREATE TABLE processos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id            UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  referencia            TEXT NOT NULL,
  tipo                  processo_tipo NOT NULL,
  modal                 processo_modal NOT NULL,
  status                processo_status DEFAULT 'aberto',
  canal                 canal_parametrizacao,

  -- Partes envolvidas
  cliente_id            UUID REFERENCES clientes(id),
  fornecedor_id         UUID REFERENCES fornecedores(id),
  transportador_id      UUID REFERENCES transportadores(id),
  recinto_origem_id     UUID REFERENCES recintos_aduaneiros(id),
  recinto_destino_id    UUID REFERENCES recintos_aduaneiros(id),
  responsavel_id        UUID REFERENCES usuarios(id),

  -- Datas do processo
  data_abertura         DATE DEFAULT CURRENT_DATE,
  data_embarque         DATE,
  data_chegada_prevista DATE,
  data_chegada_real     DATE,
  data_registro_di_due  DATE,
  data_desembaraco      DATE,
  data_entrega          DATE,

  -- Documentos principais
  numero_bl_awb         TEXT,
  numero_di             TEXT,
  numero_due            TEXT,
  numero_li             TEXT,
  numero_re             TEXT,

  -- Valores financeiros
  moeda                 TEXT DEFAULT 'USD',
  valor_mercadoria      DECIMAL(15,2),
  valor_frete           DECIMAL(15,2) DEFAULT 0,
  valor_seguro          DECIMAL(15,2) DEFAULT 0,
  incoterm              TEXT CHECK (incoterm IN ('EXW','FCA','FAS','FOB','CFR','CIF','CPT','CIP','DAP','DPU','DDP')),

  -- Impostos calculados (armazenado como JSON para flexibilidade)
  impostos              JSONB DEFAULT '{}',

  -- Regime especial
  regime_especial       TEXT CHECK (regime_especial IN ('normal', 'drawback', 'entreposto', 'ficta', 'ata_carnet', 'admissao_temporaria')),

  -- Dados adicionais por modal (flexível)
  dados_modal           JSONB DEFAULT '{}',

  observacoes           TEXT,
  criado_por            UUID REFERENCES usuarios(id),
  criado_em             TIMESTAMPTZ DEFAULT now(),
  atualizado_em         TIMESTAMPTZ DEFAULT now(),

  UNIQUE(empresa_id, referencia)
);

-- ============================================================
-- TABELA: processo_itens (produtos / mercadorias do processo)
-- ============================================================
CREATE TABLE processo_itens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id     UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ncm_id          UUID REFERENCES ncm(id),
  ncm_codigo      TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  quantidade      DECIMAL(15,4) NOT NULL,
  unidade         TEXT NOT NULL,
  valor_unitario  DECIMAL(15,4) NOT NULL,
  valor_total     DECIMAL(15,2) NOT NULL,
  pais_origem     TEXT,
  peso_liquido    DECIMAL(15,4),
  peso_bruto      DECIMAL(15,4),
  criado_em       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: processo_documentos (GED — Gestão Eletrônica de Documentos)
-- ============================================================
CREATE TABLE processo_documentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id      UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo             documento_tipo NOT NULL,
  nome_original    TEXT NOT NULL,
  storage_path     TEXT NOT NULL,
  tamanho_bytes    INTEGER,
  mime_type        TEXT,
  versao           INTEGER DEFAULT 1,
  aprovado         BOOLEAN,
  aprovado_por     UUID REFERENCES usuarios(id),
  aprovado_em      TIMESTAMPTZ,
  visivel_cliente  BOOLEAN DEFAULT false,
  observacoes      TEXT,
  upload_por       UUID REFERENCES usuarios(id),
  criado_em        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: processo_timeline (histórico de eventos do processo)
-- ============================================================
CREATE TABLE processo_timeline (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id      UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id       UUID REFERENCES usuarios(id),
  evento           TEXT NOT NULL,
  descricao        TEXT,
  dados            JSONB DEFAULT '{}',
  visivel_cliente  BOOLEAN DEFAULT true,
  criado_em        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: financeiro_receitas (a receber do cliente)
-- ============================================================
CREATE TABLE financeiro_receitas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  processo_id     UUID REFERENCES processos(id),
  cliente_id      UUID REFERENCES clientes(id),
  descricao       TEXT NOT NULL,
  valor           DECIMAL(15,2) NOT NULL,
  moeda           TEXT DEFAULT 'BRL',
  taxa_cambio     DECIMAL(10,4) DEFAULT 1,
  valor_brl       DECIMAL(15,2),
  data_emissao    DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  data_pagamento  DATE,
  status          financeiro_status DEFAULT 'pendente',
  numero_nf       TEXT,
  observacoes     TEXT,
  criado_por      UUID REFERENCES usuarios(id),
  criado_em       TIMESTAMPTZ DEFAULT now(),
  atualizado_em   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: financeiro_despesas (a pagar a fornecedores)
-- ============================================================
CREATE TABLE financeiro_despesas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  processo_id     UUID REFERENCES processos(id),
  fornecedor_id   UUID REFERENCES fornecedores(id),
  descricao       TEXT NOT NULL,
  categoria       TEXT CHECK (categoria IN ('frete', 'armador', 'armazenagem', 'despacho', 'impostos', 'seguro', 'capatazia', 'outros')),
  valor           DECIMAL(15,2) NOT NULL,
  moeda           TEXT DEFAULT 'BRL',
  taxa_cambio     DECIMAL(10,4) DEFAULT 1,
  valor_brl       DECIMAL(15,2),
  data_emissao    DATE DEFAULT CURRENT_DATE,
  data_vencimento DATE,
  data_pagamento  DATE,
  status          financeiro_status DEFAULT 'pendente',
  numero_nf       TEXT,
  observacoes     TEXT,
  criado_por      UUID REFERENCES usuarios(id),
  criado_em       TIMESTAMPTZ DEFAULT now(),
  atualizado_em   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: drawback_atos (ato concessório de drawback)
-- ============================================================
CREATE TABLE drawback_atos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_ato      TEXT NOT NULL,
  modalidade      drawback_modalidade NOT NULL,
  cliente_id      UUID REFERENCES clientes(id),
  data_concessao  DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  valor_aprovado  DECIMAL(15,2),
  valor_utilizado DECIMAL(15,2) DEFAULT 0,
  valor_saldo     DECIMAL(15,2) GENERATED ALWAYS AS (valor_aprovado - valor_utilizado) STORED,
  status          TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'comprovado', 'cancelado')),
  alerta_enviado  BOOLEAN DEFAULT false,
  observacoes     TEXT,
  criado_por      UUID REFERENCES usuarios(id),
  criado_em       TIMESTAMPTZ DEFAULT now(),
  atualizado_em   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(empresa_id, numero_ato)
);

-- ============================================================
-- TABELA: drawback_itens (insumos do ato concessório)
-- ============================================================
CREATE TABLE drawback_itens (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ato_id                UUID NOT NULL REFERENCES drawback_atos(id) ON DELETE CASCADE,
  empresa_id            UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ncm_codigo            TEXT NOT NULL,
  descricao             TEXT NOT NULL,
  quantidade_aprovada   DECIMAL(15,4),
  quantidade_utilizada  DECIMAL(15,4) DEFAULT 0,
  quantidade_saldo      DECIMAL(15,4) GENERATED ALWAYS AS (quantidade_aprovada - quantidade_utilizada) STORED,
  valor_unitario        DECIMAL(15,4),
  criado_em             TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: drawback_vinculos (vincula processo ao ato de drawback)
-- ============================================================
CREATE TABLE drawback_vinculos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id     UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  ato_id         UUID NOT NULL REFERENCES drawback_atos(id) ON DELETE CASCADE,
  processo_id    UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  tipo_vinculo   TEXT NOT NULL CHECK (tipo_vinculo IN ('importacao_insumo', 'exportacao_comprovacao')),
  valor_vinculado DECIMAL(15,2),
  observacoes    TEXT,
  criado_em      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ato_id, processo_id, tipo_vinculo)
);

-- ============================================================
-- TABELA: entreposto_saldos (controle de entreposto aduaneiro)
-- ============================================================
CREATE TABLE entreposto_saldos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  processo_id         UUID REFERENCES processos(id),
  recinto_id          UUID REFERENCES recintos_aduaneiros(id),
  numero_admissao     TEXT NOT NULL,
  ncm_codigo          TEXT NOT NULL,
  descricao           TEXT NOT NULL,
  data_admissao       DATE NOT NULL,
  data_vencimento     DATE NOT NULL,
  quantidade_entrada  DECIMAL(15,4) NOT NULL,
  quantidade_saida    DECIMAL(15,4) DEFAULT 0,
  quantidade_saldo    DECIMAL(15,4) GENERATED ALWAYS AS (quantidade_entrada - quantidade_saida) STORED,
  valor_total         DECIMAL(15,2),
  status              TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'desembaracado', 'reexportado', 'destruido')),
  destinacao          TEXT CHECK (destinacao IN ('importacao', 'reexportacao', 'destruicao', 'outro_regime')),
  alerta_enviado      BOOLEAN DEFAULT false,
  observacoes         TEXT,
  criado_por          UUID REFERENCES usuarios(id),
  criado_em           TIMESTAMPTZ DEFAULT now(),
  atualizado_em       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: operacao_ficta (exportação sem saída física — ZFM)
-- ============================================================
CREATE TABLE operacao_ficta (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  processo_id      UUID REFERENCES processos(id),
  cliente_id       UUID REFERENCES clientes(id),
  numero_due       TEXT,
  numero_nf_venda  TEXT NOT NULL,
  data_nf          DATE NOT NULL,
  destinacao       TEXT NOT NULL CHECK (destinacao IN ('ZFM', 'ALC', 'ZPE', 'outro')),
  valor_total      DECIMAL(15,2) NOT NULL,
  beneficio_fiscal TEXT,
  status           TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'comprovado', 'cancelado')),
  observacoes      TEXT,
  criado_por       UUID REFERENCES usuarios(id),
  criado_em        TIMESTAMPTZ DEFAULT now(),
  atualizado_em    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: notificacoes
-- ============================================================
CREATE TABLE notificacoes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  processo_id  UUID REFERENCES processos(id),
  usuario_id   UUID REFERENCES usuarios(id),
  canal        notificacao_canal NOT NULL,
  destinatario TEXT NOT NULL,
  assunto      TEXT,
  mensagem     TEXT NOT NULL,
  enviado      BOOLEAN DEFAULT false,
  enviado_em   TIMESTAMPTZ,
  erro         TEXT,
  criado_em    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: auditoria (log de todas as ações críticas)
-- ============================================================
CREATE TABLE auditoria (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID REFERENCES empresas(id),
  usuario_id    UUID REFERENCES usuarios(id),
  acao          TEXT NOT NULL,
  tabela        TEXT,
  registro_id   UUID,
  dados_antes   JSONB,
  dados_depois  JSONB,
  ip            TEXT,
  user_agent    TEXT,
  criado_em     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- TABELA: assinaturas (controle de plano por empresa)
-- ============================================================
CREATE TABLE assinaturas (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id              UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  plano                   plano_tipo NOT NULL,
  status                  TEXT DEFAULT 'trial' CHECK (status IN ('trial', 'ativo', 'cancelado', 'suspenso', 'inadimplente')),
  data_inicio             DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim                DATE,
  valor_mensal            DECIMAL(10,2),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  criado_em               TIMESTAMPTZ DEFAULT now(),
  atualizado_em           TIMESTAMPTZ DEFAULT now()
);
