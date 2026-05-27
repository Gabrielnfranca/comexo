export type PerfilTipo = 'admin' | 'supervisor' | 'analista' | 'financeiro'

export type PerfilUsuario = {
  id: string
  user_id: string
  perfil: PerfilTipo
  nome: string
  ativo: boolean
  created_at: string
  updated_at: string
  // join opcional com auth.users
  email?: string
}

export const PERFIL_LABELS: Record<PerfilTipo, string> = {
  admin:       'Administrador',
  supervisor:  'Supervisor',
  analista:    'Analista de Despacho',
  financeiro:  'Financeiro',
}

export const PERFIL_COLORS: Record<PerfilTipo, string> = {
  admin:      'text-amber-400 bg-amber-400/10 border-amber-400/20',
  supervisor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  analista:   'text-green-400 bg-green-400/10 border-green-400/20',
  financeiro: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

export const PERFIL_DESCRICAO: Record<PerfilTipo, string> = {
  admin:      'Acesso total — configura usuários, vê tudo, aprova limites',
  supervisor: 'Aprova pagamentos, libera processos, vê relatórios financeiros',
  analista:   'Registra processos e despacho — sem acesso financeiro de outros processos',
  financeiro: 'Contas a pagar/receber, confirma pagamentos, gera relatórios',
}

// Permissões por perfil
export const PERMISSOES = {
  // Financeiro
  ver_financeiro_completo: ['admin', 'supervisor', 'financeiro'] as PerfilTipo[],
  criar_lancamento:        ['admin', 'supervisor', 'analista', 'financeiro'] as PerfilTipo[],
  aprovar_pagamento:       ['admin', 'supervisor', 'financeiro'] as PerfilTipo[],
  // Processos
  criar_processo:          ['admin', 'supervisor', 'analista'] as PerfilTipo[],
  editar_processo:         ['admin', 'supervisor', 'analista'] as PerfilTipo[],
  excluir_processo:        ['admin'] as PerfilTipo[],
  // Usuários
  gerenciar_usuarios:      ['admin'] as PerfilTipo[],
  // Configurações
  editar_configuracoes:    ['admin'] as PerfilTipo[],
  // Auditoria
  ver_audit_log:           ['admin', 'supervisor'] as PerfilTipo[],
} as const

export type Permissao = keyof typeof PERMISSOES

export function temPermissao(perfil: PerfilTipo | null | undefined, permissao: Permissao): boolean {
  if (!perfil) return false
  return (PERMISSOES[permissao] as readonly PerfilTipo[]).includes(perfil)
}

// Tipos de ações do audit log
export type AuditAcao =
  | 'login'
  | 'logout'
  | 'criar_processo'
  | 'atualizar_status'
  | 'criar_lancamento'
  | 'aprovar_pagamento'
  | 'cancelar_lancamento'
  | 'convidar_usuario'
  | 'alterar_perfil_usuario'
  | 'desativar_usuario'
  | 'criar_cliente'
  | 'excluir_registro'

export type AuditLog = {
  id: string
  user_id: string | null
  user_email: string | null
  acao: AuditAcao
  modulo: string | null
  registro_id: string | null
  descricao: string | null
  dados_novos: Record<string, unknown> | null
  created_at: string
}
