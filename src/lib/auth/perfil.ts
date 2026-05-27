import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PerfilTipo, PerfilUsuario, Permissao } from '@/lib/types/usuario'
import { temPermissao } from '@/lib/types/usuario'

/**
 * Busca o perfil do usuário autenticado atual.
 * Retorna null se não encontrar (usuário sem perfil = acesso negado).
 */
export async function getUserPerfil(): Promise<PerfilUsuario | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('perfis_usuario')
    .select('*')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  if (error || !data) return null
  return { ...data, email: user.email }
}

/**
 * Garante que o usuário tem o perfil necessário.
 * Redireciona para /dashboard se não tiver.
 */
export async function requirePerfil(permissao: Permissao): Promise<PerfilUsuario> {
  const perfil = await getUserPerfil()
  if (!perfil || !temPermissao(perfil.perfil as PerfilTipo, permissao)) {
    redirect('/dashboard?erro=sem_permissao')
  }
  return perfil
}

/**
 * Busca todos os usuários do sistema (admin only).
 */
export async function listarUsuarios(): Promise<PerfilUsuario[]> {
  const supabase = await createClient()

  // Busca todos os perfis
  const { data: perfis, error } = await supabase
    .from('perfis_usuario')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !perfis) return []

  // Busca emails dos usuários via RPC (ou retorna só o que temos)
  return perfis as PerfilUsuario[]
}

/**
 * Busca usuários com emails via admin client.
 * Chamada somente em Server Actions.
 */
export async function listarUsuariosComEmail(): Promise<PerfilUsuario[]> {
  const { adminClient } = await import('@/lib/supabase/admin')

  const [{ data: perfis }, { data: authUsers }] = await Promise.all([
    adminClient.from('perfis_usuario').select('*').order('created_at'),
    adminClient.auth.admin.listUsers(),
  ])

  if (!perfis) return []

  const emailMap = new Map(
    (authUsers?.users ?? []).map(u => [u.id, u.email])
  )

  return perfis.map(p => ({
    ...p,
    email: emailMap.get(p.user_id) ?? undefined,
  }))
}
