import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FolderOpen, Upload } from 'lucide-react'
import type { Documento } from '@/lib/types/documento'
import { TIPO_DOCUMENTO_LABELS, formatarTamanho } from '@/lib/types/documento'
import DocumentoCard from './DocumentoCard'

export default async function DocumentosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('documentos')
    .select('*, processos(numero, cliente)')
    .order('created_at', { ascending: false })

  const documentos = (data ?? []) as Documento[]

  // Agrupamento por processo
  const porProcesso: Record<string, Documento[]> = {}
  for (const doc of documentos) {
    const chave = doc.processo_id
    if (!porProcesso[chave]) porProcesso[chave] = []
    porProcesso[chave].push(doc)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documentos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {documentos.length === 0
              ? 'Nenhum documento enviado ainda.'
              : `${documentos.length} documento${documentos.length > 1 ? 's' : ''} em ${Object.keys(porProcesso).length} processo${Object.keys(porProcesso).length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Estado vazio */}
      {documentos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-full p-6 mb-5">
            <FolderOpen size={32} className="text-slate-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-1">Nenhum documento enviado</p>
          <p className="text-slate-600 text-sm mb-6">
            Acesse um processo e envie documentos como DI, BL, Invoice, etc.
          </p>
          <Link
            href="/dashboard/processos"
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition"
          >
            Ver Processos
          </Link>
        </div>
      )}

      {/* Lista agrupada por processo */}
      {Object.entries(porProcesso).map(([, docs]) => {
        const processo = docs[0]?.processos
        return (
          <div key={docs[0].processo_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
            {/* Cabeçalho do processo */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div>
                <Link
                  href={`/dashboard/processos/${docs[0].processo_id}`}
                  className="font-mono font-bold text-amber-400 hover:text-amber-300 transition text-sm"
                >
                  {processo?.numero ?? 'Processo'}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{processo?.cliente}</p>
              </div>
              <span className="text-xs text-slate-500">
                {docs.length} doc{docs.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Grid de documentos */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {docs.map((doc) => (
                <DocumentoCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
