import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Warehouse, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  EntrepostoLote,
  STATUS_ENTREPOSTO_LABELS, STATUS_ENTREPOSTO_COLORS,
  REGIME_LABELS, diasParaLimite,
} from '@/lib/types/entreposto'

function fmtData(s: string | null) {
  if (!s) return '—'
  const [y, m, d] = s.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function DiasRestantesBadge({ dias, status }: { dias: number | null; status: string }) {
  if (status !== 'armazenado') return null
  if (dias === null)
    return <span className="text-slate-600 text-xs">—</span>
  if (dias < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
        <AlertTriangle size={10} /> Vencido há {Math.abs(dias)}d
      </span>
    )
  if (dias <= 30)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
        <Clock size={10} /> {dias}d restantes
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Clock size={10} /> {dias}d
    </span>
  )
}

export default async function EntrepostoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lotes } = await supabase
    .from('entreposto_lotes')
    .select('*')
    .eq('user_id', user.id)
    .order('data_entrada', { ascending: false })

  const lista: EntrepostoLote[] = lotes ?? []

  // KPIs
  const armazenados = lista.filter((l) => l.status === 'armazenado').length
  const alertas     = lista.filter((l) => {
    const d = diasParaLimite(l.data_limite)
    return d !== null && d <= 30 && l.status === 'armazenado'
  }).length
  const saidos = lista.filter((l) => l.status !== 'armazenado' && l.status !== 'vencido').length

  // Alertas críticos para banner
  const criticos = lista.filter((l) => {
    const d = diasParaLimite(l.data_limite)
    return d !== null && d <= 7 && l.status === 'armazenado'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Entreposto Aduaneiro</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Controle de lotes com prazo de permanência e alertas automáticos
          </p>
        </div>
        <Link
          href="/dashboard/entreposto/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
        >
          <Plus size={16} />
          Novo Lote
        </Link>
      </div>

      {/* Banner de alertas críticos */}
      {criticos.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-300 font-semibold text-sm">
              {criticos.length} lote{criticos.length > 1 ? 's' : ''} vence{criticos.length === 1 ? '' : 'm'} em até 7 dias!
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {criticos.map((l) => (
              <Link key={l.id} href={`/dashboard/entreposto/${l.id}`}
                className="text-xs text-red-300 hover:text-red-200 underline">
                {l.numero_lote} ({fmtData(l.data_limite)})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Total de Lotes</p>
          <p className="text-2xl font-bold text-white">{lista.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Warehouse size={14} className="text-cyan-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Armazenados</p>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{armazenados}</p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">Com saída registrada</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{saidos}</p>
        </div>
      </div>

      {/* Tabela */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Warehouse size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum lote cadastrado</p>
          <p className="text-slate-600 text-sm mt-1">
            Cadastre um lote para iniciar o controle de entreposto
          </p>
          <Link
            href="/dashboard/entreposto/novo"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Plus size={15} />
            Cadastrar primeiro lote
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lote / DACTA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Beneficiário</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mercadoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Entrada</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Limite</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lista.map((lote) => {
                const dias = diasParaLimite(lote.data_limite)
                return (
                  <tr key={lote.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-mono text-sm font-semibold">{lote.numero_lote}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                          ${lote.tipo === 'importacao' ? 'text-cyan-400 bg-cyan-400/10' : 'text-indigo-400 bg-indigo-400/10'}`}>
                          {lote.tipo === 'importacao' ? 'Importação' : 'Exportação'}
                        </span>
                        <span className="text-xs text-slate-600">{REGIME_LABELS[lote.regime]}</span>
                      </div>
                      {lote.numero_dacta && (
                        <p className="text-slate-600 text-xs mt-0.5">DACTA: {lote.numero_dacta}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-sm">{lote.beneficiario}</p>
                      {lote.recinto_aduaneiro && (
                        <p className="text-slate-600 text-xs mt-0.5">{lote.recinto_aduaneiro}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{lote.descricao_mercadoria ?? '—'}</p>
                      {lote.ncm && <p className="text-slate-600 text-xs">{lote.ncm}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{fmtData(lote.data_entrada)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium
                        ${dias !== null && dias < 0 ? 'text-red-400' : dias !== null && dias <= 30 ? 'text-yellow-400' : 'text-slate-500 dark:text-slate-500 dark:text-slate-400'}`}>
                        {fmtData(lote.data_limite)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <DiasRestantesBadge dias={dias} status={lote.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_ENTREPOSTO_COLORS[lote.status]}`}>
                        {STATUS_ENTREPOSTO_LABELS[lote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/entreposto/${lote.id}`}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium transition">
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
