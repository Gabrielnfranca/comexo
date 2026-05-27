'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoConvitePortal = { erro?: string; sucesso?: string; link?: string }

export async function convidarPortalAction(
  _prev: EstadoConvitePortal,
  formData: FormData,
): Promise<EstadoConvitePortal> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const clienteId = formData.get('cliente_id')?.toString()
  const email = formData.get('email')?.toString().trim().toLowerCase()

  if (!clienteId || !email) return { erro: 'Informe o e-mail do cliente.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'E-mail inválido.' }

  const service = createServiceClient()

  // Upsert do acesso — atualiza token se já existir
  const { data, error } = await service
    .from('portal_acessos')
    .upsert(
      {
        despachante_id: user.id,
        cliente_id: clienteId,
        email,
        token_convite: crypto.randomUUID(),
        token_expira: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        aceito: false,
        ativo: true,
      },
      { onConflict: 'despachante_id,email', ignoreDuplicates: false },
    )
    .select('token_convite')
    .single()

  if (error) return { erro: `Erro ao criar convite: ${error.message}` }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/portal/convite?token=${data.token_convite}`

  revalidatePath(`/dashboard/clientes/${clienteId}`)

  return {
    sucesso: 'Convite gerado!',
    link,
  }
}

export async function revogarAcessoPortalAction(
  acessoId: string,
  clienteId: string,
): Promise<EstadoConvitePortal> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { error } = await supabase
    .from('portal_acessos')
    .update({ ativo: false })
    .eq('id', acessoId)
    .eq('despachante_id', user.id)

  if (error) return { erro: `Erro ao revogar: ${error.message}` }

  revalidatePath(`/dashboard/clientes/${clienteId}`)
  return { sucesso: 'Acesso revogado.' }
}
