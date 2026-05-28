'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type EstadoCliente = { erro?: string; sucesso?: string }

// ─── Criar ───────────────────────────────────────────────────────────────────
export async function criarClienteAction(
  _prev: EstadoCliente,
  formData: FormData,
): Promise<EstadoCliente> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const razao_social = formData.get('razao_social')?.toString().trim()
  if (!razao_social) return { erro: 'Razão Social é obrigatória.' }

  const payload = {
    user_id:      user.id,
    razao_social,
    nome_fantasia: formData.get('nome_fantasia')?.toString().trim() || null,
    cnpj:         formData.get('cnpj')?.toString().trim() || null,
    tipo:         formData.get('tipo')?.toString() || 'importador',
    email:        formData.get('email')?.toString().trim() || null,
    telefone:     formData.get('telefone')?.toString().trim() || null,
    contato_nome: formData.get('contato_nome')?.toString().trim() || null,
    endereco:     formData.get('endereco')?.toString().trim() || null,
    cidade:       formData.get('cidade')?.toString().trim() || null,
    estado:       formData.get('estado')?.toString() || null,
    cep:          formData.get('cep')?.toString().trim() || null,
    numero_radar:           formData.get('numero_radar')?.toString().trim() || null,
    tipo_habilitacao_radar: formData.get('tipo_habilitacao_radar')?.toString() || null,
    validade_radar:         formData.get('validade_radar')?.toString() || null,
    radar_ativo:            formData.get('radar_ativo') !== 'false',
    inscricao_estadual:     formData.get('inscricao_estadual')?.toString().trim() || null,
    regime_tributario:      formData.get('regime_tributario')?.toString() || null,
    pais:                   formData.get('pais')?.toString().trim() || null,
    id_fiscal_exterior:     formData.get('id_fiscal_exterior')?.toString().trim() || null,
    observacoes:  formData.get('observacoes')?.toString().trim() || null,
  }

  const { data, error } = await supabase.from('clientes').insert(payload).select('id').single()
  if (error) return { erro: error.message }

  redirect(`/dashboard/clientes/${data.id}`)
}

// ─── Atualizar ────────────────────────────────────────────────────────────────
export async function atualizarClienteAction(
  _prev: EstadoCliente,
  formData: FormData,
): Promise<EstadoCliente> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const id = formData.get('id')?.toString()
  const razao_social = formData.get('razao_social')?.toString().trim()
  if (!id) return { erro: 'ID inválido.' }
  if (!razao_social) return { erro: 'Razão Social é obrigatória.' }

  const payload = {
    razao_social,
    nome_fantasia: formData.get('nome_fantasia')?.toString().trim() || null,
    cnpj:         formData.get('cnpj')?.toString().trim() || null,
    tipo:         formData.get('tipo')?.toString() || 'importador',
    email:        formData.get('email')?.toString().trim() || null,
    telefone:     formData.get('telefone')?.toString().trim() || null,
    contato_nome: formData.get('contato_nome')?.toString().trim() || null,
    endereco:     formData.get('endereco')?.toString().trim() || null,
    cidade:       formData.get('cidade')?.toString().trim() || null,
    estado:       formData.get('estado')?.toString() || null,
    cep:          formData.get('cep')?.toString().trim() || null,
    numero_radar:           formData.get('numero_radar')?.toString().trim() || null,
    tipo_habilitacao_radar: formData.get('tipo_habilitacao_radar')?.toString() || null,
    validade_radar:         formData.get('validade_radar')?.toString() || null,
    radar_ativo:            formData.get('radar_ativo') !== 'false',
    inscricao_estadual:     formData.get('inscricao_estadual')?.toString().trim() || null,
    regime_tributario:      formData.get('regime_tributario')?.toString() || null,
    pais:                   formData.get('pais')?.toString().trim() || null,
    id_fiscal_exterior:     formData.get('id_fiscal_exterior')?.toString().trim() || null,
    observacoes:  formData.get('observacoes')?.toString().trim() || null,
    updated_at:   new Date().toISOString(),
  }

  const { error } = await supabase.from('clientes').update(payload).eq('id', id).eq('user_id', user.id)
  if (error) return { erro: error.message }

  revalidatePath(`/dashboard/clientes/${id}`)
  return { sucesso: 'Cliente atualizado com sucesso!' }
}

// ─── Arquivar / Reativar ──────────────────────────────────────────────────────
export async function toggleAtivoAction(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('clientes').update({ ativo }).eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard/clientes')
  revalidatePath(`/dashboard/clientes/${id}`)
}
