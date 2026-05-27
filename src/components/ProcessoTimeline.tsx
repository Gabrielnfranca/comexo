'use client'

import { useActionState, useRef } from 'react'
import { MessageSquarePlus, CheckCircle2, ArrowRightLeft, MessageCircle, Clock } from 'lucide-react'
import { adicionarComentarioAction } from '@/app/dashboard/processos/actions'

type TimelineEvento = {
  id: string
  evento: string
  descricao: string | null
  dados: Record<string, unknown> | null
  visivel_cliente: boolean
  criado_em: string
  usuario_id: string | null
}

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

function EventoIcon({ evento }: { evento: string }) {
  if (evento === 'status_alterado') return <ArrowRightLeft size={14} className="text-amber-400" />
  if (evento === 'comentario')      return <MessageCircle size={14} className="text-blue-400" />
  if (evento === 'documento')       return <CheckCircle2 size={14} className="text-green-400" />
  return <Clock size={14} className="text-slate-400" />
}

function EventoClasse(evento: string) {
  if (evento === 'status_alterado') return 'bg-amber-500/10 border-amber-500/20'
  if (evento === 'comentario')      return 'bg-blue-500/10 border-blue-500/20'
  if (evento === 'documento')       return 'bg-green-500/10 border-green-500/20'
  return 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
}

export default function ProcessoTimeline({
  processoId,
  eventos,
}: {
  processoId: string
  eventos: TimelineEvento[]
}) {
  const [state, action, pending] = useActionState(adicionarComentarioAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  // Limpar form após sucesso
  if (!state && formRef.current && !pending) {
    formRef.current?.reset()
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-amber-400" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Histórico do Processo</p>
        <span className="ml-auto text-xs text-slate-400">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Formulário de comentário */}
      <form ref={formRef} action={action} className="flex gap-2">
        <input type="hidden" name="id" value={processoId} />
        <input type="hidden" name="visivel_cliente" value="false" />
        <input
          name="texto"
          type="text"
          placeholder="Adicionar observação ao processo..."
          className="flex-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          <MessageSquarePlus size={15} />
          <span className="hidden sm:inline">Anotar</span>
        </button>
      </form>
      {state?.error && (
        <p className="text-xs text-red-500">{state.error}</p>
      )}

      {/* Lista de eventos */}
      {eventos.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Nenhum evento registrado ainda.</p>
      ) : (
        <div className="relative space-y-0">
          {/* Linha vertical */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-slate-200 dark:bg-white/5" />

          {eventos.map((ev, i) => (
            <div key={ev.id} className={`relative flex gap-4 pb-4 ${i === eventos.length - 1 ? '' : ''}`}>
              {/* Ícone no eixo */}
              <div className={`relative z-10 w-8 h-8 shrink-0 rounded-full border flex items-center justify-center ${EventoClasse(ev.evento)}`}>
                <EventoIcon evento={ev.evento} />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                  {ev.descricao ?? '—'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{formatarData(ev.criado_em)}</span>
                  {ev.visivel_cliente && (
                    <span className="text-[10px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-full border border-blue-400/20">
                      visível ao cliente
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
