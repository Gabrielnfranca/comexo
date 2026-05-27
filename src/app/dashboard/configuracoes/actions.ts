'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoConfig = { erro?: string; sucesso?: string }

export async function salvarConfiguracoesAction(
  _prev: EstadoConfig,
  formData: FormData,
): Promise<EstadoConfig> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const payload = {
    user_id: user.id,
    nome_empresa:   formData.get('nome_empresa')?.toString().trim() || null,
    cnpj_empresa:   formData.get('cnpj_empresa')?.toString().trim() || null,
    telefone:       formData.get('telefone')?.toString().trim()    || null,
    email_empresa:  formData.get('email_empresa')?.toString().trim() || null,
    site:           formData.get('site')?.toString().trim()         || null,
    endereco:       formData.get('endereco')?.toString().trim()     || null,
    cidade:         formData.get('cidade')?.toString().trim()       || null,
    estado:         formData.get('estado')?.toString().trim()       || null,
    cep:            formData.get('cep')?.toString().trim()          || null,
    responsavel:    formData.get('responsavel')?.toString().trim()  || null,
    updated_at:     new Date().toISOString(),
  }

  const { error } = await supabase
    .from('configuracoes')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) return { erro: `Erro ao salvar: ${error.message}` }

  revalidatePath('/dashboard/configuracoes')
  return { sucesso: 'Configurações salvas com sucesso!' }
}
