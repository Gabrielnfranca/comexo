'use client'

import { useTransition } from 'react'
import { marcarPagoAction, cancelarLancamentoAction } from './actions'
import type { LancamentoStatus } from '@/lib/types/financeiro'
import { CheckCircle, XCircle } from 'lucide-react'

type Props = { id: string; status: LancamentoStatus; processoId?: string | null }

export default function AcoesLancamento({ id, status, processoId }: Props) {
  const [isPending, startTransition] = useTransition()

  if (status !== 'pendente') return null

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => marcarPagoAction(id, processoId))}
        title="Marcar como pago"
        className="p-1.5 text-slate-500 hover:text-green-400 disabled:opacity-50 transition rounded-lg hover:bg-green-400/10"
      >
        <CheckCircle size={16} />
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => cancelarLancamentoAction(id, processoId))}
        title="Cancelar lançamento"
        className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-50 transition rounded-lg hover:bg-red-400/10"
      >
        <XCircle size={16} />
      </button>
    </div>
  )
}
