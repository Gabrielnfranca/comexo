'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type EstadoConvite = { erro?: string }

export async function aceitarConviteAction(
  _prev: EstadoConvite,
  formData: FormData,
): Promise<EstadoConvite> {
  const token = formData.get('token')?.toString().trim()
  const senha = formData.get('senha')?.toString() ?? ''
  const senhaConf = formData.get('senha_conf')?.toString() ?? ''

  if (!token) return { erro: 'Token inválido.' }
  if (senha.length < 6) return { erro: 'A senha deve ter pelo menos 6 caracteres.' }
  if (senha !== senhaConf) return { erro: 'As senhas não conferem.' }

  const service = createServiceClient()

  // Busca o convite pelo token
  const { data: acesso, error: acessoError } = await service
    .from('portal_acessos')
    .select('id, email, despachante_id, aceito, token_expira, ativo')
    .eq('token_convite', token)
    .maybeSingle()

  if (acessoError || !acesso) return { erro: 'Link de convite inválido ou expirado.' }
  if (!acesso.ativo) return { erro: 'Este acesso foi revogado. Entre em contato com o despachante.' }

  const agora = new Date()
  const expira = new Date(acesso.token_expira)
  if (agora > expira) return { erro: 'Este link de convite expirou. Solicite um novo ao despachante.' }

  // Se já foi aceito, apenas faz login
  if (acesso.aceito) {
    const supabase = await createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: acesso.email,
      password: senha,
    })
    if (loginError) return { erro: 'Senha incorreta. Se esqueceu a senha, entre em contato com o despachante.' }
    redirect('/portal/processos')
  }

  // Cria o usuário via admin (service role)
  const { data: novoUser, error: createError } = await service.auth.admin.createUser({
    email: acesso.email,
    password: senha,
    email_confirm: true,
    user_metadata: { tipo: 'portal' },
  })

  if (createError) {
    if (createError.message.includes('already registered')) {
      // Usuário já existe — apenas marca como aceito e faz login
    } else {
      return { erro: `Erro ao criar conta: ${createError.message}` }
    }
  }

  // Marca convite como aceito
  await service
    .from('portal_acessos')
    .update({ aceito: true })
    .eq('id', acesso.id)

  // Faz login imediatamente
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: acesso.email,
    password: senha,
  })
  if (loginError) return { erro: 'Conta criada! Acesse com seu e-mail e senha.' }

  redirect('/portal/processos')
}
