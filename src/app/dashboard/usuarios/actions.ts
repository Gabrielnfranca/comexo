'use server'

import { revalidatePath } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'
import { requirePerfil } from '@/lib/auth/perfil'
import { registrarAudit } from '@/lib/audit'
import { listarUsuariosComEmail } from '@/lib/auth/perfil'
import type { PerfilTipo, PerfilUsuario } from '@/lib/types/usuario'

export type ActionResult = { ok: boolean; erro?: string }

// ── Listar usuários ─────────────────────────────────────────────────────────
export async function listarUsuariosAction(): Promise<PerfilUsuario[]> {
  await requirePerfil('gerenciar_usuarios')
  return listarUsuariosComEmail()
}

// ── Convidar novo usuário ───────────────────────────────────────────────────
export async function convidarUsuarioAction(
  _: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const perfil = await requirePerfil('gerenciar_usuarios')

  const email  = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const tipo   = (formData.get('perfil') as PerfilTipo | null) ?? 'analista'
  const nome   = (formData.get('nome') as string | null)?.trim() ?? ''

  if (!email || !email.includes('@')) {
    return { ok: false, erro: 'E-mail inválido.' }
  }

  const tiposValidos: PerfilTipo[] = ['admin', 'supervisor', 'analista', 'financeiro']
  if (!tiposValidos.includes(tipo)) {
    return { ok: false, erro: 'Perfil inválido.' }
  }

  // Verificar se e-mail já existe
  const { data: existentes } = await adminClient.auth.admin.listUsers()
  const jaExiste = existentes?.users.find(u => u.email === email)

  if (jaExiste) {
    // Usuário já existe → garante que tem perfil
    const { error } = await adminClient.from('perfis_usuario').upsert({
      user_id: jaExiste.id,
      perfil:  tipo,
      nome:    nome || email.split('@')[0],
      ativo:   true,
    }, { onConflict: 'user_id' })

    if (error) return { ok: false, erro: 'Erro ao definir perfil: ' + error.message }
  } else {
    // Convidar usuário novo via magic link
    const { data: invited, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { nome },
    })

    if (inviteErr || !invited?.user) {
      return { ok: false, erro: 'Erro ao enviar convite: ' + (inviteErr?.message ?? 'desconhecido') }
    }

    // Criar perfil
    const { error } = await adminClient.from('perfis_usuario').insert({
      user_id: invited.user.id,
      perfil:  tipo,
      nome:    nome || email.split('@')[0],
    })

    if (error) return { ok: false, erro: 'Convite enviado, mas erro ao criar perfil: ' + error.message }
  }

  await registrarAudit({
    acao:       'convidar_usuario',
    modulo:     'usuarios',
    descricao:  `Convidou ${email} como ${tipo}`,
    dados_novos: { email, tipo, nome },
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}

// ── Alterar perfil de um usuário ────────────────────────────────────────────
export async function alterarPerfilAction(
  userId: string,
  novoPerfil: PerfilTipo
): Promise<ActionResult> {
  await requirePerfil('gerenciar_usuarios')

  const tiposValidos: PerfilTipo[] = ['admin', 'supervisor', 'analista', 'financeiro']
  if (!tiposValidos.includes(novoPerfil)) {
    return { ok: false, erro: 'Perfil inválido.' }
  }

  const { error } = await adminClient
    .from('perfis_usuario')
    .update({ perfil: novoPerfil, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return { ok: false, erro: error.message }

  await registrarAudit({
    acao:        'alterar_perfil_usuario',
    modulo:      'usuarios',
    registro_id: userId,
    descricao:   `Perfil alterado para ${novoPerfil}`,
    dados_novos: { novoPerfil },
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}

// ── Desativar usuário (soft delete) ─────────────────────────────────────────
export async function desativarUsuarioAction(userId: string): Promise<ActionResult> {
  const meuPerfil = await requirePerfil('gerenciar_usuarios')

  // Impede admin de se desativar
  if (meuPerfil.user_id === userId) {
    return { ok: false, erro: 'Você não pode desativar sua própria conta.' }
  }

  const { error } = await adminClient
    .from('perfis_usuario')
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return { ok: false, erro: error.message }

  await registrarAudit({
    acao:        'desativar_usuario',
    modulo:      'usuarios',
    registro_id: userId,
    descricao:   'Usuário desativado',
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}

// ── Reativar usuário ─────────────────────────────────────────────────────────
export async function reativarUsuarioAction(userId: string): Promise<ActionResult> {
  await requirePerfil('gerenciar_usuarios')

  const { error } = await adminClient
    .from('perfis_usuario')
    .update({ ativo: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return { ok: false, erro: error.message }

  revalidatePath('/dashboard/usuarios')
  return { ok: true }
}
