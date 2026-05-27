'use client'

import { useActionState } from 'react'
import { atualizarStatusAction } from '../actions'
import { STATUS_LABELS, getStatusFlow } from '@/lib/types/processo'
import type { ProcessoStatus, ProcessoTipo, ProcessoModal } from '@/lib/types/processo'

export default function AtualizarStatus({
  processoId,
  statusAtual,
  tipo,
  modal,
}: {
  processoId: string
  statusAtual: ProcessoStatus
  tipo: ProcessoTipo
  modal: ProcessoModal | null
}) {
  const [state, action, pending] = useActionState(atualizarStatusAction, null)
  const statusFlow = getStatusFlow(tipo, modal)

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={processoId} />
      <select
        name="status"
        defaultValue={statusAtual}
        className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
      >
        {statusFlow.map(s => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-sm font-semibold rounded-xl transition"
      >
        {pending ? '...' : 'Atualizar'}
      </button>
      {state?.error && <span className="text-red-400 text-xs">{state.error}</span>}
    </form>
  )
}
