'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginState = {
  erro?: string
  campos?: { email?: string[]; senha?: string[] }
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const dados = {
    email: formData.get('email') as string,
    senha: formData.get('senha') as string,
  }

  // Valida os dados
  const resultado = loginSchema.safeParse(dados)
  if (!resultado.success) {
    return { campos: resultado.error.flatten().fieldErrors }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: resultado.data.email,
      password: resultado.data.senha,
    })

    if (error) {
      // Mensagens amigáveis em português
      if (error.message.includes('Invalid login credentials')) {
        return { erro: 'E-mail ou senha incorretos.' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { erro: 'Confirme seu e-mail antes de fazer login.' }
      }
      if (error.message.includes('Too many requests')) {
        return { erro: 'Muitas tentativas. Aguarde alguns minutos.' }
      }
      return { erro: 'Erro ao fazer login. Tente novamente.' }
    }
  } catch (err: any) {
    if (err?.message === 'SUPABASE_SERVER_ENV_MISSING') {
      return { erro: 'Ambiente de autenticação não configurado. Verifique as variáveis do Supabase na Vercel.' }
    }
    return { erro: 'Falha de conexão com autenticação. Tente novamente em instantes.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
