-- ============================================================
-- COMEXO — Migration 003: Row Level Security (RLS)
-- SEGURANÇA: cada empresa só acessa seus próprios dados
-- ============================================================

-- ============================================================
-- Habilita RLS em todas as tabelas
-- ============================================================
ALTER TABLE empresas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportadores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recintos_aduaneiros   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncm                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cambio                ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE processo_itens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE processo_documentos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE processo_timeline     ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_receitas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_despesas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawback_atos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawback_itens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE drawback_vinculos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE entreposto_saldos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE operacao_ficta        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria             ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÃO auxiliar: retorna o empresa_id do usuário logado
-- (evita subquery repetida em todas as policies)
-- ============================================================
CREATE OR REPLACE FUNCTION minha_empresa_id()
RETURNS UUID AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNÇÃO auxiliar: retorna o perfil do usuário logado
-- ============================================================
CREATE OR REPLACE FUNCTION meu_perfil()
RETURNS TEXT AS $$
  SELECT perfil::TEXT FROM usuarios WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- POLICIES: empresas
-- ============================================================
CREATE POLICY "empresa_select" ON empresas
  FOR SELECT USING (id = minha_empresa_id());

CREATE POLICY "empresa_update_admin" ON empresas
  FOR UPDATE USING (id = minha_empresa_id() AND meu_perfil() = 'admin');

-- ============================================================
-- POLICIES: usuarios
-- ============================================================
CREATE POLICY "usuarios_select" ON usuarios
  FOR SELECT USING (empresa_id = minha_empresa_id());

CREATE POLICY "usuarios_insert_admin" ON usuarios
  FOR INSERT WITH CHECK (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

CREATE POLICY "usuarios_update_admin" ON usuarios
  FOR UPDATE USING (empresa_id = minha_empresa_id() AND (id = auth.uid() OR meu_perfil() = 'admin'));

CREATE POLICY "usuarios_delete_admin" ON usuarios
  FOR DELETE USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin' AND id != auth.uid());

-- ============================================================
-- MACRO: cria policies padrão de isolamento por empresa
-- (SELECT/INSERT/UPDATE/DELETE restritos ao empresa_id)
-- ============================================================

-- clientes
CREATE POLICY "clientes_select"  ON clientes FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "clientes_insert"  ON clientes FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "clientes_update"  ON clientes FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "clientes_delete"  ON clientes FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- fornecedores
CREATE POLICY "fornecedores_select"  ON fornecedores FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "fornecedores_insert"  ON fornecedores FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "fornecedores_update"  ON fornecedores FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "fornecedores_delete"  ON fornecedores FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- transportadores
CREATE POLICY "transportadores_select"  ON transportadores FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "transportadores_insert"  ON transportadores FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "transportadores_update"  ON transportadores FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "transportadores_delete"  ON transportadores FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- recintos_aduaneiros
CREATE POLICY "recintos_select"  ON recintos_aduaneiros FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "recintos_insert"  ON recintos_aduaneiros FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "recintos_update"  ON recintos_aduaneiros FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "recintos_delete"  ON recintos_aduaneiros FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- ncm
CREATE POLICY "ncm_select"  ON ncm FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "ncm_insert"  ON ncm FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "ncm_update"  ON ncm FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "ncm_delete"  ON ncm FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- cambio
CREATE POLICY "cambio_select"  ON cambio FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "cambio_insert"  ON cambio FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "cambio_update"  ON cambio FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "cambio_delete"  ON cambio FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- processos
CREATE POLICY "processos_select"  ON processos FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "processos_insert"  ON processos FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "processos_update"  ON processos FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "processos_delete"  ON processos FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- processo_itens
CREATE POLICY "processo_itens_select"  ON processo_itens FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "processo_itens_insert"  ON processo_itens FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "processo_itens_update"  ON processo_itens FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "processo_itens_delete"  ON processo_itens FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- processo_documentos
CREATE POLICY "docs_select"  ON processo_documentos FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "docs_insert"  ON processo_documentos FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "docs_update"  ON processo_documentos FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "docs_delete"  ON processo_documentos FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- processo_timeline
CREATE POLICY "timeline_select"  ON processo_timeline FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "timeline_insert"  ON processo_timeline FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());

-- financeiro_receitas
CREATE POLICY "receitas_select"  ON financeiro_receitas FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "receitas_insert"  ON financeiro_receitas FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "receitas_update"  ON financeiro_receitas FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "receitas_delete"  ON financeiro_receitas FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- financeiro_despesas
CREATE POLICY "despesas_select"  ON financeiro_despesas FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "despesas_insert"  ON financeiro_despesas FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "despesas_update"  ON financeiro_despesas FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "despesas_delete"  ON financeiro_despesas FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- drawback_atos
CREATE POLICY "drawback_atos_select"  ON drawback_atos FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_atos_insert"  ON drawback_atos FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_atos_update"  ON drawback_atos FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "drawback_atos_delete"  ON drawback_atos FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- drawback_itens
CREATE POLICY "drawback_itens_select"  ON drawback_itens FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_itens_insert"  ON drawback_itens FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_itens_update"  ON drawback_itens FOR UPDATE  USING (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_itens_delete"  ON drawback_itens FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- drawback_vinculos
CREATE POLICY "drawback_vinculos_select"  ON drawback_vinculos FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_vinculos_insert"  ON drawback_vinculos FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "drawback_vinculos_delete"  ON drawback_vinculos FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() IN ('admin', 'supervisor'));

-- entreposto_saldos
CREATE POLICY "entreposto_select"  ON entreposto_saldos FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "entreposto_insert"  ON entreposto_saldos FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "entreposto_update"  ON entreposto_saldos FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "entreposto_delete"  ON entreposto_saldos FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- operacao_ficta
CREATE POLICY "ficta_select"  ON operacao_ficta FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "ficta_insert"  ON operacao_ficta FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());
CREATE POLICY "ficta_update"  ON operacao_ficta FOR UPDATE  USING (empresa_id = minha_empresa_id() AND meu_perfil() != 'visualizador');
CREATE POLICY "ficta_delete"  ON operacao_ficta FOR DELETE  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');

-- notificacoes
CREATE POLICY "notificacoes_select"  ON notificacoes FOR SELECT  USING (empresa_id = minha_empresa_id());
CREATE POLICY "notificacoes_insert"  ON notificacoes FOR INSERT  WITH CHECK (empresa_id = minha_empresa_id());

-- auditoria (somente leitura para admin)
CREATE POLICY "auditoria_select"  ON auditoria FOR SELECT  USING (empresa_id = minha_empresa_id() AND meu_perfil() = 'admin');
CREATE POLICY "auditoria_insert"  ON auditoria FOR INSERT  WITH CHECK (true); -- inserção via service_role apenas

-- assinaturas (somente leitura para a própria empresa)
CREATE POLICY "assinaturas_select"  ON assinaturas FOR SELECT  USING (empresa_id = minha_empresa_id());

-- ============================================================
-- POLICY ESPECIAL: Portal do Cliente (acesso anônimo via token)
-- Permite que o cliente externo veja dados SEM autenticação Supabase
-- usando apenas o portal_token único
-- ============================================================
CREATE POLICY "portal_timeline_select" ON processo_timeline
  FOR SELECT USING (
    visivel_cliente = true
    AND processo_id IN (
      SELECT p.id FROM processos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE c.portal_token = current_setting('app.portal_token', true)
        AND c.portal_acesso_ativo = true
    )
  );

CREATE POLICY "portal_documentos_select" ON processo_documentos
  FOR SELECT USING (
    visivel_cliente = true
    AND processo_id IN (
      SELECT p.id FROM processos p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE c.portal_token = current_setting('app.portal_token', true)
        AND c.portal_acesso_ativo = true
    )
  );
