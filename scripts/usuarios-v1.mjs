// Check DB schema
import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.SUPABASE_DB_URL })

const sql = `
-- ── Tabela de perfis de usuário ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfis_usuario (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  perfil      text        NOT NULL CHECK (perfil IN ('admin','supervisor','analista','financeiro')),
  nome        text        NOT NULL DEFAULT '',
  ativo       boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "perfis_select" ON perfis_usuario;
DROP POLICY IF EXISTS "perfis_insert" ON perfis_usuario;
DROP POLICY IF EXISTS "perfis_update" ON perfis_usuario;

CREATE POLICY "perfis_select" ON perfis_usuario
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "perfis_insert" ON perfis_usuario
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "perfis_update" ON perfis_usuario
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ── Tabela de auditoria imutável (sem UPDATE nem DELETE) ────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users(id),
  user_email   text,
  acao         text        NOT NULL,
  modulo       text,
  registro_id  text,
  descricao    text,
  dados_novos  jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_insert" ON audit_log;
DROP POLICY IF EXISTS "audit_select" ON audit_log;

CREATE POLICY "audit_insert" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "audit_select" ON audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Sem UPDATE / DELETE = imutável por design
`

await client.connect()
console.log('Conectado ao banco...')

await client.query(sql)
console.log('✅ Tabelas criadas: perfis_usuario, audit_log')

// Registrar o usuário atual como admin (primeiro da lista)
const { rows: users } = await client.query(
  `SELECT id, email FROM auth.users ORDER BY created_at LIMIT 1`
)
if (users.length > 0) {
  await client.query(`
    INSERT INTO perfis_usuario (user_id, perfil, nome)
    VALUES ($1, 'admin', $2)
    ON CONFLICT (user_id) DO NOTHING
  `, [users[0].id, users[0].email?.split('@')[0] ?? 'Admin'])
  console.log(`✅ Usuário ${users[0].email} configurado como ADMIN`)
}

await client.end()
console.log('Migration concluída.')
