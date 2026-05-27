'use client'

import { useState, useTransition } from 'react'
import { FileText, Download, Trash2, Loader2 } from 'lucide-react'
import type { Documento } from '@/lib/types/documento'
import { TIPO_DOCUMENTO_LABELS, TIPO_DOCUMENTO_ICONES, formatarTamanho } from '@/lib/types/documento'
import { getDownloadUrlAction, excluirDocumentoAction } from './actions'

export default function DocumentoCard({ doc }: { doc: Documento }) {
  const [isPending, startTransition] = useTransition()
  const [confirmando, setConfirmando] = useState(false)

  function handleDownload() {
    startTransition(async () => {
      const url = await getDownloadUrlAction(doc.storage_path)
      if (url) window.open(url, '_blank')
    })
  }

  function handleExcluir() {
    if (!confirmando) {
      setConfirmando(true)
      setTimeout(() => setConfirmando(false), 3000)
      return
    }
    startTransition(async () => {
      await excluirDocumentoAction(doc.id, doc.storage_path, doc.processo_id)
      setConfirmando(false)
    })
  }

  const icone = TIPO_DOCUMENTO_ICONES[doc.tipo_documento] ?? '📄'
  const label = TIPO_DOCUMENTO_LABELS[doc.tipo_documento] ?? 'Documento'
  const data = new Date(doc.created_at).toLocaleDateString('pt-BR')

  return (
    <div className="flex items-start gap-3 bg-slate-100 dark:bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-3 group">
      {/* Ícone */}
      <div className="text-2xl leading-none mt-0.5 select-none">{icone}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate" title={doc.nome_original}>
          {doc.nome_original}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        <p className="text-xs text-slate-600 mt-1">
          {formatarTamanho(doc.tamanho)} · {data}
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDownload}
          disabled={isPending}
          title="Baixar"
          className="p-1.5 rounded-lg hover:bg-slate-900/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-white transition"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        </button>
        <button
          onClick={handleExcluir}
          disabled={isPending}
          title={confirmando ? 'Clique novamente para confirmar' : 'Excluir'}
          className={`p-1.5 rounded-lg transition ${
            confirmando
              ? 'bg-red-500/20 text-red-400'
              : 'hover:bg-slate-900/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-red-400'
          }`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
