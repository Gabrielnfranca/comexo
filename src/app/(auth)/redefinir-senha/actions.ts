'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  senha: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
  confirmar: z.string(),
}).refine(d => d.senha === d.confirmar, {
  message: 'As senhas não coincidem.',
  path: ['confirmar'],
})

export type RedefinirSenhaState = {
  erro?: string
  campos?: { senha?: string[]; confirmar?: string[] }
}

export async function redefinirSenhaAction(
  _prev: RedefinirSenhaState,
  formData: FormData
): Promise<RedefinirSenhaState> {
  const dados = {
    senha: formData.get('senha') as string,
    confirmar: formData.get('confirmar') as string,
  }

  const resultado = schema.safeParse(dados)
  if (!resultado.success) {
    return { campos: resultado.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: resultado.data.senha })

  if (error) {
    return { erro: 'Não foi possível redefinir a senha. O link pode ter expirado.' }
  }

  redirect('/login')
}
