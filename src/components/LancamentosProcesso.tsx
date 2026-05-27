'use client'

import { useActionState, useState } from 'react'
import { criarLancamentoAction } from '@/app/dashboard/financeiro/actions'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import {
  CATEGORIA_LABELS,
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  STATUS_LANCAMENTO_LABELS,
  STATUS_LANCAMENTO_COLORS,
  MOEDAS,
} from '@/lib/types/financeiro'
import type { Lancamento, LancamentoStatus } from '@/lib/types/financeiro'
import AcoesLancamento from '@/app/dashboard/financeiro/AcoesLancamento'

function fmtMoeda(valor: number, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(valor)
}
function fmtData(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

const inputClass =
  'w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition'

type Props = {
  processoId: string
  lancamentos: Lancamento[]
}

export default function LancamentosProcesso({ processoId, lancamentos }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [estado, action, pending] = useActionState(criarLancamentoAction, {})
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  const totalReceitas = lancamentos
    .filter(l => l.tipo === 'receita' && l.status !== 'cancelado' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  const totalDespesas = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status !== 'cancelado' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <p className="text-white font-semibold text-sm">Financeiro</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp size={12} />
              {fmtMoeda(totalReceitas)}
            </span>
            <span className="flex items-center gap-1 text-xs text-red-400">
              <TrendingDown size={12} />
              {fmtMoeda(totalDespesas)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition"
        >
          <Plus size={13} />
          Adicionar
        </button>
      </div>

      {/* Formulário inline */}
      {mostrarForm && (
        <div className="px-5 py-4 border-b border-white/5 bg-slate-950/40">
          {estado.sucesso && (
            <p className="text-green-400 text-xs mb-3">{estado.sucesso}</p>
          )}
          {estado.erro && (
            <p className="text-red-400 text-xs mb-3">{estado.erro}</p>
          )}
          <form action={action} className="space-y-3">
            <input type="hidden" name="processo_id" value={processoId} />

            {/* Tipo */}
            <div className="grid grid-cols-2 gap-2">
              {(['despesa', 'receita'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`py-2 rounded-xl text-xs font-medium border transition
                    ${tipo === t ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'border-white/10 text-slate-400 hover:border-white/20'}`}
                >
                  {t === 'despesa' ? '− Despesa' : '+ Receita'}
                </button>
              ))}
            </div>
            <input type="hidden" name="tipo" value={tipo} />

            <input name="descricao" required placeholder="Descrição *" className={inputClass} />

            <div className="grid grid-cols-2 gap-2">
              <select name="categoria" className={inputClass}>
                {categorias.map(c => <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>)}
              </select>
              <select name="moeda" defaultValue="BRL" className={inputClass}>
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Valor *"
                className={inputClass}
              />
              <input type="date" name="vencimento" className={inputClass} />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
              >
                {pending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {lancamentos.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-slate-500 text-sm">Nenhum lançamento neste processo</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {lancamentos.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.tipo === 'receita' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs truncate">{l.descricao}</p>
                <p className="text-slate-500 text-xs mt-0.5">{CATEGORIA_LABELS[l.categoria]} · {fmtData(l.vencimento)}</p>
              </div>
              <span className={`font-mono text-xs font-medium ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                {l.tipo === 'receita' ? '+' : '-'}{fmtMoeda(Number(l.valor), l.moeda)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${STATUS_LANCAMENTO_COLORS[l.status as LancamentoStatus]}`}>
                {STATUS_LANCAMENTO_LABELS[l.status as LancamentoStatus]}
              </span>
              <AcoesLancamento id={l.id} status={l.status as LancamentoStatus} processoId={processoId} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
