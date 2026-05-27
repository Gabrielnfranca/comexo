'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoDocumento = { erro?: string; sucesso?: string }

// ─── Upload de documento ──────────────────────────────────────────────────────
export async function uploadDocumentoAction(
  _prev: EstadoDocumento,
  formData: FormData,
): Promise<EstadoDocumento> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const arquivo = formData.get('arquivo') as File | null
  const processoId = formData.get('processo_id')?.toString().trim()
  const tipoDocumento = formData.get('tipo_documento')?.toString().trim() || 'outros'

  if (!arquivo || arquivo.size === 0) return { erro: 'Selecione um arquivo.' }
  if (!processoId) return { erro: 'Processo não informado.' }

  if (arquivo.size > 10 * 1024 * 1024) return { erro: 'Arquivo muito grande. Limite: 10 MB.' }

  // Caminho no storage: {user_id}/{processo_id}/{timestamp}_{nome}
  const ext = arquivo.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `${user.id}/${processoId}/${Date.now()}_${nomeSeguro}`

  const arrayBuffer = await arquivo.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(storagePath, buffer, {
      contentType: arquivo.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return { erro: `Erro ao enviar arquivo: ${uploadError.message}` }

  const { error: dbError } = await supabase.from('documentos').insert({
    user_id: user.id,
    processo_id: processoId,
    tipo_documento: tipoDocumento,
    nome_original: arquivo.name,
    storage_path: storagePath,
    tamanho: arquivo.size,
    mimetype: arquivo.type || null,
  })

  if (dbError) {
    // Remove o arquivo do storage se o registro falhou
    await supabase.storage.from('documentos').remove([storagePath])
    return { erro: `Erro ao salvar documento: ${dbError.message}` }
  }

  revalidatePath('/dashboard/documentos')
  revalidatePath(`/dashboard/processos/${processoId}`)

  return { sucesso: `Documento "${arquivo.name}" enviado com sucesso!` }
}

// ─── Excluir documento ────────────────────────────────────────────────────────
export async function excluirDocumentoAction(
  id: string,
  storagePath: string,
  processoId: string,
): Promise<EstadoDocumento> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const { error: storageError } = await supabase.storage
    .from('documentos')
    .remove([storagePath])

  if (storageError) return { erro: `Erro ao remover arquivo: ${storageError.message}` }

  const { error: dbError } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (dbError) return { erro: `Erro ao excluir registro: ${dbError.message}` }

  revalidatePath('/dashboard/documentos')
  revalidatePath(`/dashboard/processos/${processoId}`)

  return { sucesso: 'Documento excluído.' }
}

// ─── Gerar URL de download temporária ────────────────────────────────────────
export async function getDownloadUrlAction(storagePath: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from('documentos')
    .createSignedUrl(storagePath, 60 * 5) // 5 minutos

  return data?.signedUrl ?? null
}
