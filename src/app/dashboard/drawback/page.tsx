import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, PackageSearch, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  DrawbackAto,
  MODALIDADE_LABELS, MODALIDADE_COLORS,
  STATUS_DRAWBACK_LABELS, STATUS_DRAWBACK_COLORS,
  diasParaVencimento, pctExportado,
} from '@/lib/types/drawback'

function fmtData(s: string | null) {
  if (!s) return '—'
  const [y, m, d] = s.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function AlertaBadge({ dias }: { dias: number | null }) {
  if (dias === null) return null
  if (dias < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
        <AlertTriangle size={11} /> Vencido há {Math.abs(dias)}d
      </span>
    )
  if (dias <= 30)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
        <Clock size={11} /> {dias}d restantes
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Clock size={11} /> {dias}d
    </span>
  )
}

export default async function DrawbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: atos } = await supabase
    .from('drawback_atos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const lista: DrawbackAto[] = atos ?? []

  // KPIs
  const total    = lista.length
  const vigentes = lista.filter((a) => a.status === 'vigente' || a.status === 'prorrogado').length
  const alertas  = lista.filter((a) => {
    const d = diasParaVencimento(a.data_vencimento)
    return d !== null && d <= 30 && (a.status === 'vigente' || a.status === 'prorrogado')
  }).length
  const comprovados = lista.filter((a) => a.status === 'comprovado').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Drawback</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Controle de regimes aduaneiros especiais — Suspensão, Isenção e Restituição
          </p>
        </div>
        <Link
          href="/dashboard/drawback/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo Ato
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Total de Atos</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-green-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Vigentes</p>
          </div>
          <p className="text-2xl font-bold text-green-400">{vigentes}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-yellow-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Alertas ≤30 dias</p>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{alertas}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprovados</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{comprovados}</p>
        </div>
      </div>

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PackageSearch size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum ato concessório cadastrado</p>
          <p className="text-slate-600 text-sm mt-1">
            Cadastre um ato de Drawback para começar o controle
          </p>
          <Link
            href="/dashboard/drawback/novo"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Plus size={15} />
            Cadastrar primeiro ato
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nº Ato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Modalidade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Beneficiário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Vencimento</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Progresso Export.</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((ato) => {
                const dias = diasParaVencimento(ato.data_vencimento)
                const pct  = pctExportado(ato.valor_fob_exportado, ato.valor_fob_exportar)
                return (
                  <tr key={ato.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-mono text-sm font-semibold">{ato.numero_ato}</p>
                      {ato.referencia_interna && (
                        <p className="text-slate-500 text-xs mt-0.5">{ato.referencia_interna}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MODALIDADE_COLORS[ato.modalidade]}`}>
                        {MODALIDADE_LABELS[ato.modalidade]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-sm">{ato.cliente}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{fmtData(ato.data_vencimento)}</p>
                      <div className="mt-0.5">
                        <AlertaBadge dias={dias} />
                      </div>
                    </td>
                    <td className="px-4 py-3 w-40">
                      {ato.valor_fob_exportar ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">
                              {fmtBRL(ato.valor_fob_exportado)} / {fmtBRL(ato.valor_fob_exportar)}
                            </span>
                            <span className="text-xs font-semibold text-white">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-900/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">Não definido</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_DRAWBACK_COLORS[ato.status]}`}>
                        {STATUS_DRAWBACK_LABELS[ato.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/drawback/${ato.id}`}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium transition"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
