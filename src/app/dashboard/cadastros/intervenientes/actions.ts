'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type Estado = { erro?: string; sucesso?: string } | null

function payload(formData: FormData, userId?: string) {
  const base = {
    tipo: formData.get('tipo')?.toString() ?? 'agente_carga',
    razao_social: formData.get('razao_social')?.toString().trim() ?? '',
    nome_fantasia: formData.get('nome_fantasia')?.toString().trim() || null,
    cnpj: formData.get('cnpj')?.toString().trim() || null,
    tax_id_exterior: formData.get('tax_id_exterior')?.toString().trim() || null,
    pais: formData.get('pais')?.toString() || 'BR',
    email: formData.get('email')?.toString().trim() || null,
    telefone: formData.get('telefone')?.toString().trim() || null,
    contato_nome: formData.get('contato_nome')?.toString().trim() || null,
    endereco: formData.get('endereco')?.toString().trim() || null,
    cidade: formData.get('cidade')?.toString().trim() || null,
    estado: formData.get('estado')?.toString() || null,
    cep: formData.get('cep')?.toString().trim() || null,
    codigo_recinto: formData.get('codigo_recinto')?.toString().trim() || null,
    nire: formData.get('nire')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  }
  return userId ? { ...base, user_id: userId } : base
}

export async function criarIntervenienteAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const razao_social = formData.get('razao_social')?.toString().trim()
  if (!razao_social) return { erro: 'Razão Social é obrigatória.' }

  const { data, error } = await supabase
    .from('intervenientes')
    .insert(payload(formData, user.id))
    .select('id').single()

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/intervenientes')
  redirect(`/dashboard/cadastros/intervenientes/${data.id}`)
}

export async function editarIntervenienteAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString()
  const razao_social = formData.get('razao_social')?.toString().trim()
  if (!id) return { erro: 'ID inválido.' }
  if (!razao_social) return { erro: 'Razão Social é obrigatória.' }

  const { error } = await supabase
    .from('intervenientes')
    .update({ ...payload(formData), updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/intervenientes')
  revalidatePath(`/dashboard/cadastros/intervenientes/${id}`)
  return { sucesso: 'Interveniente atualizado com sucesso!' }
}

export async function excluirIntervenienteAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('intervenientes').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard/cadastros/intervenientes')
  redirect('/dashboard/cadastros/intervenientes')
}
