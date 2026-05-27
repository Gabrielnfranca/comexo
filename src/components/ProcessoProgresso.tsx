import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { getStatusFlow, STATUS_LABELS } from '@/lib/types/processo'
import type { ProcessoStatus, ProcessoTipo, ProcessoModal } from '@/lib/types/processo'

export default function ProcessoProgresso({
  status,
  tipo,
  modal,
}: {
  status: ProcessoStatus
  tipo: ProcessoTipo
  modal: ProcessoModal | null
}) {
  const flow = getStatusFlow(tipo, modal).filter(s => s !== 'cancelado')
  const cancelado = status === 'cancelado'
  const idxAtual = cancelado ? -1 : flow.indexOf(status as (typeof flow)[number])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Progresso do Processo</p>
        {cancelado && (
          <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
            <XCircle size={14} /> Cancelado
          </span>
        )}
      </div>

      {/* Barra de etapas */}
      <div className="relative">
        {/* Linha conectora */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-white/10" />
        {!cancelado && idxAtual > 0 && (
          <div
            className="absolute top-4 left-4 h-0.5 bg-amber-500 transition-all duration-500"
            style={{ width: `calc(${(idxAtual / (flow.length - 1)) * 100}% - 8px)` }}
          />
        )}

        {/* Etapas */}
        <div className="relative flex justify-between">
          {flow.map((etapa, idx) => {
            const concluida = !cancelado && idx < idxAtual
            const atual     = !cancelado && idx === idxAtual
            const futura    = cancelado || idx > idxAtual

            return (
              <div key={etapa} className="flex flex-col items-center gap-1.5 flex-1">
                {/* Ícone */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors
                  ${concluida ? 'bg-amber-500 text-white' :
                    atual      ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-500' :
                                 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400'
                  }`}>
                  {concluida
                    ? <CheckCircle2 size={16} />
                    : atual
                      ? <Circle size={14} className="fill-amber-500" />
                      : <Circle size={14} />
                  }
                </div>
                {/* Label */}
                <span className={`text-center leading-tight hidden sm:block
                  ${concluida ? 'text-amber-500 text-[10px] font-medium' :
                    atual      ? 'text-amber-400 text-[10px] font-semibold' :
                                 'text-slate-400 dark:text-slate-500 text-[10px]'
                  }`}>
                  {STATUS_LABELS[etapa]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status atual em mobile */}
      <p className="sm:hidden text-xs text-center mt-3 text-slate-500 dark:text-slate-400">
        Etapa atual: <span className="text-amber-400 font-medium">{STATUS_LABELS[status]}</span>
      </p>
    </div>
  )
}
