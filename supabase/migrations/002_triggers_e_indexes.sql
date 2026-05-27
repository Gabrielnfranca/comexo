-- ============================================================
-- COMEXO — Migration 002: Triggers, Funções e Indexes
-- ============================================================

-- ============================================================
-- FUNÇÃO: atualiza o campo atualizado_em automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica o trigger em todas as tabelas com atualizado_em
CREATE TRIGGER trg_empresas_ts
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_usuarios_ts
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_clientes_ts
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_fornecedores_ts
  BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_ncm_ts
  BEFORE UPDATE ON ncm
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_processos_ts
  BEFORE UPDATE ON processos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_financeiro_receitas_ts
  BEFORE UPDATE ON financeiro_receitas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_financeiro_despesas_ts
  BEFORE UPDATE ON financeiro_despesas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_drawback_atos_ts
  BEFORE UPDATE ON drawback_atos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_entreposto_ts
  BEFORE UPDATE ON entreposto_saldos
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_ficta_ts
  BEFORE UPDATE ON operacao_ficta
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trg_assinaturas_ts
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- ============================================================
-- FUNÇÃO: registra novo usuário automaticamente ao criar conta
-- (chamada pelo trigger do auth.users)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Cria o registro básico de usuário quando um novo auth.user é criado
  -- A empresa_id virá via metadata do signup
  IF NEW.raw_user_meta_data->>'empresa_id' IS NOT NULL THEN
    INSERT INTO usuarios (id, empresa_id, nome, email)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'empresa_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNÇÃO: atualiza último acesso do usuário
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_ultimo_acesso(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE usuarios SET ultimo_acesso = now() WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES — Performance nas consultas mais frequentes
-- ============================================================

-- Processos: consultas por empresa, status, cliente e datas
CREATE INDEX idx_processos_empresa_id        ON processos(empresa_id);
CREATE INDEX idx_processos_status            ON processos(empresa_id, status);
CREATE INDEX idx_processos_tipo_modal        ON processos(empresa_id, tipo, modal);
CREATE INDEX idx_processos_cliente           ON processos(empresa_id, cliente_id);
CREATE INDEX idx_processos_responsavel       ON processos(empresa_id, responsavel_id);
CREATE INDEX idx_processos_data_abertura     ON processos(empresa_id, data_abertura DESC);
CREATE INDEX idx_processos_referencia        ON processos(empresa_id, referencia);
CREATE INDEX idx_processos_regime            ON processos(empresa_id, regime_especial);

-- Timeline: para carregar histórico de um processo
CREATE INDEX idx_timeline_processo           ON processo_timeline(processo_id, criado_em DESC);
CREATE INDEX idx_timeline_empresa            ON processo_timeline(empresa_id);

-- Documentos: para listar docs de um processo
CREATE INDEX idx_documentos_processo         ON processo_documentos(processo_id);
CREATE INDEX idx_documentos_empresa          ON processo_documentos(empresa_id);

-- Financeiro: por empresa, processo e status
CREATE INDEX idx_receitas_empresa            ON financeiro_receitas(empresa_id, status);
CREATE INDEX idx_receitas_processo           ON financeiro_receitas(processo_id);
CREATE INDEX idx_receitas_vencimento         ON financeiro_receitas(empresa_id, data_vencimento);
CREATE INDEX idx_despesas_empresa            ON financeiro_despesas(empresa_id, status);
CREATE INDEX idx_despesas_processo           ON financeiro_despesas(processo_id);
CREATE INDEX idx_despesas_vencimento         ON financeiro_despesas(empresa_id, data_vencimento);

-- Clientes
CREATE INDEX idx_clientes_empresa            ON clientes(empresa_id, ativo);
CREATE INDEX idx_clientes_portal_token       ON clientes(portal_token) WHERE portal_token IS NOT NULL;

-- Usuários
CREATE INDEX idx_usuarios_empresa            ON usuarios(empresa_id, ativo);

-- Drawback: alertas de vencimento
CREATE INDEX idx_drawback_empresa_status     ON drawback_atos(empresa_id, status);
CREATE INDEX idx_drawback_vencimento         ON drawback_atos(empresa_id, data_vencimento) WHERE status = 'ativo';

-- Entreposto: alertas de vencimento
CREATE INDEX idx_entreposto_empresa_status   ON entreposto_saldos(empresa_id, status);
CREATE INDEX idx_entreposto_vencimento       ON entreposto_saldos(empresa_id, data_vencimento) WHERE status = 'ativo';

-- Notificações: fila de envio pendente
CREATE INDEX idx_notificacoes_pendentes      ON notificacoes(empresa_id, enviado, criado_em) WHERE enviado = false;

-- Auditoria
CREATE INDEX idx_auditoria_empresa           ON auditoria(empresa_id, criado_em DESC);
CREATE INDEX idx_auditoria_usuario           ON auditoria(usuario_id, criado_em DESC);

-- Câmbio
CREATE INDEX idx_cambio_empresa_moeda        ON cambio(empresa_id, moeda, data DESC);

-- NCM: busca por código
CREATE INDEX idx_ncm_empresa_codigo          ON ncm(empresa_id, codigo);

-- Itens do processo
CREATE INDEX idx_processo_itens_processo     ON processo_itens(processo_id);
