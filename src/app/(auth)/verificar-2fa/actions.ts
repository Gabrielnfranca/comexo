'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type MFAState = {
  erro?: string
}

export async function verificarMFAAction(
  _prev: MFAState,
  formData: FormData
): Promise<MFAState> {
  const codigo = formData.get('codigo') as string

  if (!codigo || codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
    return { erro: 'Código deve ter 6 dígitos numéricos.' }
  }

  const supabase = await createClient()

  // Verifica o fator MFA ativo
  const { data: fatores } = await supabase.auth.mfa.listFactors()
  const fatorTOTP = fatores?.totp?.[0]

  if (!fatorTOTP) {
    return { erro: 'Nenhum autenticador configurado.' }
  }

  // Cria o desafio e verifica
  const { data: desafio, error: erroDesafio } = await supabase.auth.mfa.challenge({
    factorId: fatorTOTP.id,
  })

  if (erroDesafio || !desafio) {
    return { erro: 'Erro ao iniciar verificação. Tente novamente.' }
  }

  const { error: erroVerificacao } = await supabase.auth.mfa.verify({
    factorId: fatorTOTP.id,
    challengeId: desafio.id,
    code: codigo,
  })

  if (erroVerificacao) {
    if (erroVerificacao.message.includes('Invalid TOTP code')) {
      return { erro: 'Código inválido. Verifique o app autenticador.' }
    }
    return { erro: 'Erro na verificação. Tente novamente.' }
  }

  redirect('/dashboard')
}
