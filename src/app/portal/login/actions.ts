'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type EstadoLogin = { erro?: string }

export async function loginPortalAction(
  _prev: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const supabase = await createClient()
  const email = formData.get('email')?.toString().trim() ?? ''
  const senha = formData.get('senha')?.toString() ?? ''

  if (!email || !senha) return { erro: 'Preencha e-mail e senha.' }

  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) return { erro: 'E-mail ou senha incorretos.' }

  redirect('/portal/processos')
}
