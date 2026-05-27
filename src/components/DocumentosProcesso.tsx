'use client'

import { useActionState, useState, useTransition } from 'react'
import { FolderOpen, Plus, Upload, X, Download, Trash2, Loader2 } from 'lucide-react'
import type { Documento } from '@/lib/types/documento'
import {
  TIPO_DOCUMENTO_LABELS,
  TIPO_DOCUMENTO_ICONES,
  TIPO_DOCUMENTO_LIST,
  formatarTamanho,
} from '@/lib/types/documento'
import {
  uploadDocumentoAction,
  excluirDocumentoAction,
  getDownloadUrlAction,
} from '@/app/dashboard/documentos/actions'

// ─── Card individual ──────────────────────────────────────────────────────────
function DocItem({ doc }: { doc: Documento }) {
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
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 group">
      <span className="text-lg leading-none select-none">{icone}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate" title={doc.nome_original}>
          {doc.nome_original}
        </p>
        <p className="text-xs text-slate-500">{label} · {formatarTamanho(doc.tamanho)} · {data}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={handleDownload}
          disabled={isPending}
          title="Baixar"
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        </button>
        <button
          onClick={handleExcluir}
          disabled={isPending}
          title={confirmando ? 'Clique novamente para confirmar' : 'Excluir'}
          className={`p-1.5 rounded-lg transition ${
            confirmando
              ? 'bg-red-500/20 text-red-400'
              : 'hover:bg-white/10 text-slate-400 hover:text-red-400'
          }`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DocumentosProcesso({
  processoId,
  documentos,
}: {
  processoId: string
  documentos: Documento[]
}) {
  const [aberto, setAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [estado, action, isPending] = useActionState(uploadDocumentoAction, {})

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-white">
            Documentos
            {documentos.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({documentos.length})
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => setAberto(!aberto)}
          className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
        >
          {aberto ? <X size={14} /> : <Plus size={14} />}
          {aberto ? 'Cancelar' : 'Adicionar'}
        </button>
      </div>

      {/* Formulário de upload */}
      {aberto && (
        <div className="px-5 py-4 border-b border-white/5 bg-slate-800/40">
          <form action={action} className="space-y-3">
            <input type="hidden" name="processo_id" value={processoId} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tipo */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tipo de Documento</label>
                <select
                  name="tipo_documento"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/60"
                >
                  {TIPO_DOCUMENTO_LIST.map((t) => (
                    <option key={t} value={t}>{TIPO_DOCUMENTO_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Arquivo */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Arquivo <span className="text-slate-600">(max 10 MB)</span>
                </label>
                <label className="flex items-center gap-2 w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-amber-500/40 transition">
                  <Upload size={14} className="text-slate-400 shrink-0" />
                  <span className={arquivo ? 'text-white truncate' : 'text-slate-500'}>
                    {arquivo ? arquivo.name : 'Clique para selecionar...'}
                  </span>
                  <input
                    type="file"
                    name="arquivo"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            {estado.erro && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {estado.erro}
              </p>
            )}
            {estado.sucesso && (
              <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {estado.sucesso}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending || !arquivo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold text-sm transition"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {isPending ? 'Enviando...' : 'Enviar Documento'}
            </button>
          </form>
        </div>
      )}

      {/* Lista de documentos */}
      <div className="px-5">
        {documentos.length === 0 ? (
          <p className="text-slate-600 text-sm py-5 text-center">
            Nenhum documento enviado ainda.
          </p>
        ) : (
          documentos.map((doc) => <DocItem key={doc.id} doc={doc} />)
        )}
      </div>
    </div>
  )
}
