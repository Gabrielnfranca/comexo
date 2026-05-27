import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, Clock, Plus } from 'lucide-react'
import {
  CATEGORIA_LABELS,
  STATUS_LANCAMENTO_LABELS,
  STATUS_LANCAMENTO_COLORS,
} from '@/lib/types/financeiro'
import type { Lancamento, LancamentoStatus } from '@/lib/types/financeiro'
import AcoesLancamento from './AcoesLancamento'

function fmtMoeda(valor: number, moeda = 'BRL') {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda }).format(valor)
}
function fmtData(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${day}/${m}/${y}`
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>
}) {
  const { tipo, status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('lancamentos_financeiros')
    .select('*, processos(numero, cliente)')
    .order('created_at', { ascending: false })

  if (tipo === 'receita' || tipo === 'despesa') query = query.eq('tipo', tipo)
  if (status === 'pendente' || status === 'pago' || status === 'cancelado') query = query.eq('status', status)

  const { data } = await query
  const lancamentos: Lancamento[] = data ?? []

  // KPIs
  const aReceber = lancamentos
    .filter(l => l.tipo === 'receita' && l.status === 'pendente' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  const aPagar = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status === 'pendente' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  const recebido = lancamentos
    .filter(l => l.tipo === 'receita' && l.status === 'pago' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  const pago = lancamentos
    .filter(l => l.tipo === 'despesa' && l.status === 'pago' && l.moeda === 'BRL')
    .reduce((s, l) => s + Number(l.valor), 0)

  const filtros = [
    { label: 'Todos',      href: '/dashboard/financeiro',                   active: !tipo },
    { label: 'Receitas',   href: '/dashboard/financeiro?tipo=receita',      active: tipo === 'receita' },
    { label: 'Despesas',   href: '/dashboard/financeiro?tipo=despesa',      active: tipo === 'despesa' },
    { label: 'Pendentes',  href: '/dashboard/financeiro?status=pendente',   active: status === 'pendente' },
    { label: 'Pagos',      href: '/dashboard/financeiro?status=pago',       active: status === 'pago' },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Financeiro</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {lancamentos.length} lançamento{lancamentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/financeiro/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Novo Lançamento
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'A Receber',
            valor: fmtMoeda(aReceber),
            icon: TrendingUp,
            cor: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            sub: 'Receitas pendentes',
          },
          {
            label: 'A Pagar',
            valor: fmtMoeda(aPagar),
            icon: TrendingDown,
            cor: 'text-red-400',
            bg: 'bg-red-400/10',
            sub: 'Despesas pendentes',
          },
          {
            label: 'Total Recebido',
            valor: fmtMoeda(recebido),
            icon: DollarSign,
            cor: 'text-blue-400',
            bg: 'bg-blue-400/10',
            sub: 'Receitas pagas',
          },
          {
            label: 'Total Pago',
            valor: fmtMoeda(pago),
            icon: Clock,
            cor: 'text-slate-500 dark:text-slate-500 dark:text-slate-400',
            bg: 'bg-slate-400/10',
            sub: 'Despesas pagas',
          },
        ].map(({ label, valor, icon: Icon, cor, bg, sub }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={cor} />
              </div>
            </div>
            <p className={`text-xl font-bold ${cor}`}>{valor}</p>
            <p className="text-slate-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filtros.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition border
              ${f.active
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-white border-slate-200 dark:border-white/5 hover:border-slate-200 dark:border-white/10'
              }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      {lancamentos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-16 text-center">
          <DollarSign size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg mb-2">Nenhum lançamento encontrado</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Registre receitas e despesas vinculadas aos processos.
          </p>
          <Link
            href="/dashboard/financeiro/novo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm rounded-xl transition"
          >
            <Plus size={16} />
            Novo Lançamento
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left text-slate-500 font-medium px-5 py-3.5">Descrição</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Processo</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Categoria</th>
                <th className="text-right text-slate-500 font-medium px-4 py-3.5">Valor</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Vencimento</th>
                <th className="text-left text-slate-500 font-medium px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lancamentos.map((l) => (
                <tr key={l.id} className="hover:bg-white/2 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.tipo === 'receita' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      <div>
                        <p className="text-white text-sm">{l.descricao}</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {l.processos ? (
                      <Link href={`/dashboard/processos/${l.processo_id}`} className="block">
                        <p className="text-slate-300 text-xs font-mono hover:text-amber-400 transition">{l.processos.numero}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[120px]">{l.processos.cliente}</p>
                      </Link>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                    {CATEGORIA_LABELS[l.categoria]}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={`font-mono font-medium text-sm ${l.tipo === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {l.tipo === 'receita' ? '+' : '-'}{fmtMoeda(Number(l.valor), l.moeda)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                    {fmtData(l.vencimento)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_LANCAMENTO_COLORS[l.status as LancamentoStatus]}`}>
                      {STATUS_LANCAMENTO_LABELS[l.status as LancamentoStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <AcoesLancamento id={l.id} status={l.status as LancamentoStatus} processoId={l.processo_id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
