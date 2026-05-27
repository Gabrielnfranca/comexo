'use server'

import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
})

export type EsqueciSenhaState = {
  erro?: string
  sucesso?: boolean
  campos?: { email?: string[] }
}

export async function esqueciSenhaAction(
  _prev: EsqueciSenhaState,
  formData: FormData
): Promise<EsqueciSenhaState> {
  const dados = { email: formData.get('email') as string }
  const resultado = schema.safeParse(dados)

  if (!resultado.success) {
    return { campos: resultado.error.flatten().fieldErrors }
  }

  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resultado.data.email }),
    })
  } catch (err) {
    console.error('[esqueci-senha action]', err)
  }

  return { sucesso: true }
}
