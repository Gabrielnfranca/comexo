import { Receipt, TrendingDown, TrendingUp, DollarSign } from 'lucide-react'
import type { Lancamento } from '@/lib/types/financeiro'
import type { TributoDi } from '@/lib/types/desembaraco'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Props = {
  lancamentos: Lancamento[]
  tributos: TributoDi[]
  valorCifBRL: number | null
}

export default function ResumoFinanceiroProcesso({ lancamentos, tributos, valorCifBRL }: Props) {
  // Apenas lançamentos em BRL não cancelados
  const ativos = lancamentos.filter(l => l.status !== 'cancelado' && l.moeda === 'BRL')

  // Receitas (honorários cobrados do cliente)
  const receitas = ativos.filter(l => l.tipo === 'receita')
  const totalReceitas = receitas.reduce((s, l) => s + Number(l.valor), 0)

  // Despesas operacionais (o que o despachante pagou)
  const despesas = ativos.filter(l => l.tipo === 'despesa')
  const totalDespesas = despesas.reduce((s, l) => s + Number(l.valor), 0)

  // Tributos já lançados (II, IPI, PIS, COFINS etc.)
  const totalTributos = tributos.reduce((s, t) => s + Number(t.valor_calculado ?? 0), 0)
  const totalTributosPago = tributos.reduce((s, t) => s + Number(t.valor_pago ?? 0), 0)

  // Custo total do processo = tributos + despesas operacionais
  const custoTotal = totalTributos + totalDespesas

  // Margem = receitas - despesas (excluindo tributos que são repassados ao cliente)
  const margem = totalReceitas - totalDespesas

  // Agrupamento de despesas por categoria
  const porCategoria = despesas.reduce((acc, l) => {
    const key = l.categoria
    acc[key] = (acc[key] ?? 0) + Number(l.valor)
    return acc
  }, {} as Record<string, number>)

  if (totalTributos === 0 && totalDespesas === 0 && totalReceitas === 0) return null

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Receipt size={16} className="text-amber-400" />
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Resumo do Processo</p>
      </div>

      {/* Cards de totais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {valorCifBRL !== null && valorCifBRL > 0 && (
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign size={11} /> Valor CIF
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtBRL(valorCifBRL)}</p>
          </div>
        )}
        <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tributos</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtBRL(totalTributos)}</p>
          {totalTributosPago > 0 && totalTributosPago < totalTributos && (
            <p className="text-[10px] text-amber-400 mt-0.5">
              Pago: {fmtBRL(totalTributosPago)}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <TrendingDown size={11} className="text-red-400" /> Despesas Op.
          </p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{fmtBRL(totalDespesas)}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <TrendingUp size={11} className="text-emerald-400" /> Receitas (Honorários)
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{fmtBRL(totalReceitas)}</p>
        </div>
      </div>

      {/* Custo total e margem */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Custo total do processo</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">{fmtBRL(custoTotal)}</p>
          <p className="text-[10px] text-slate-400">(tributos + despesas operacionais)</p>
        </div>
        {totalReceitas > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Margem operacional</p>
            <p className={`text-base font-bold ${margem >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {fmtBRL(margem)}
            </p>
            <p className="text-[10px] text-slate-400">(receitas - despesas op.)</p>
          </div>
        )}
      </div>

      {/* Detalhe por categoria */}
      {Object.keys(porCategoria).length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Despesas por categoria</p>
          {Object.entries(porCategoria).map(([cat, valor]) => (
            <div key={cat} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 capitalize">{cat.replace(/_/g, ' ')}</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">{fmtBRL(valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
