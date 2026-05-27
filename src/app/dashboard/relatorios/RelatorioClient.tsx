'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2, Download, Printer, Filter, X,
  TrendingUp, TrendingDown, FileText, ArrowUpRight,
} from 'lucide-react'
import type { ProcessoRelatorio } from './page'
import { STATUS_LABELS, TIPO_LABELS, MODAL_LABELS } from '@/lib/types/processo'
import type { ProcessoStatus } from '@/lib/types/processo'

const inputClass =
  'w-full px-3 py-2 bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'

const CANAL_BADGE: Record<string, string> = {
  verde:    'text-green-400 bg-green-400/10',
  amarelo:  'text-yellow-400 bg-yellow-400/10',
  vermelho: 'text-red-400 bg-red-400/10',
  cinza:    'text-slate-500 dark:text-slate-400 bg-slate-400/10',
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtData(s: string | null) {
  if (!s) return '—'
  const [y, m, d] = s.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

// ─── Exportar CSV ─────────────────────────────────────────────────────────────

function exportCSV(processos: ProcessoRelatorio[]) {
  const headers = [
    'Número', 'Tipo', 'Status', 'Cliente', 'Modal',
    'Data Abertura', 'Previsão Chegada', 'Data Desembaraço',
    'Canal DI', 'Nº DI/DUE',
    'Valor FOB', 'Moeda',
    'Total Receitas (R$)', 'Total Despesas (R$)', 'Total Tributos (R$)', 'Resultado (R$)',
  ]

  const rows = processos.map((p) => [
    p.numero,
    TIPO_LABELS[p.tipo],
    STATUS_LABELS[p.status as ProcessoStatus] ?? p.status,
    p.cliente,
    p.modal ? MODAL_LABELS[p.modal] : '',
    fmtData(p.data_abertura),
    fmtData(p.previsao_chegada),
    fmtData(p.data_desembaraco),
    p.canal_parametrizacao ?? '',
    p.numero_di ?? '',
    p.valor_fob?.toString() ?? '',
    p.moeda,
    p.total_receitas.toFixed(2),
    p.total_despesas.toFixed(2),
    p.total_tributos.toFixed(2),
    (p.total_receitas - p.total_despesas).toFixed(2),
  ])

  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comexo-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, valor, icon: Icon, cor,
}: {
  label: string
  valor: string
  icon: React.ElementType
  cor: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cor}`}>
          <Icon size={15} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="text-xl font-bold text-white">{valor}</p>
    </div>
  )
}

// ─── Component principal ───────────────────────────────────────────────────────

type Filtros = {
  data_ini?: string
  data_fim?: string
  tipo?: string
  status?: string
  modal?: string
  cliente?: string
}

export default function RelatorioClient({
  processos,
  filtrosIniciais,
}: {
  processos: ProcessoRelatorio[]
  filtrosIniciais: Filtros
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais)
  const [filtrosAbertos, setFiltrosAbertos] = useState(
    Object.values(filtrosIniciais).some(Boolean)
  )

  const aplicarFiltros = useCallback(
    (novosFiltros: Filtros) => {
      const params = new URLSearchParams()
      Object.entries(novosFiltros).forEach(([k, v]) => { if (v) params.set(k, v) })
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname]
  )

  const limparFiltros = () => {
    setFiltros({})
    startTransition(() => router.push(pathname))
  }

  // Totais
  const totalProcessos = processos.length
  const totalReceitas = processos.reduce((s, p) => s + p.total_receitas, 0)
  const totalDespesas = processos.reduce((s, p) => s + p.total_despesas, 0)
  const totalTributos = processos.reduce((s, p) => s + p.total_tributos, 0)
  const resultado = totalReceitas - totalDespesas

  const filtrosAtivos = Object.values(filtros).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Análise por período, tipo e cliente
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition
              ${filtrosAtivos > 0
                ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-white bg-slate-900/5 dark:bg-white/5'
              }`}
          >
            <Filter size={15} />
            Filtros
            {filtrosAtivos > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                {filtrosAtivos}
              </span>
            )}
          </button>
          <button
            onClick={() => exportCSV(processos)}
            disabled={processos.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-white bg-slate-900/5 dark:bg-white/5 transition disabled:opacity-40"
          >
            <Download size={15} />
            CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-white bg-slate-900/5 dark:bg-white/5 transition"
          >
            <Printer size={15} />
            Imprimir
          </button>
        </div>
      </div>

      {/* Filtros */}
      {filtrosAbertos && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4 print:hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Data inicial</label>
              <input
                type="date"
                value={filtros.data_ini ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, data_ini: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Data final</label>
              <input
                type="date"
                value={filtros.data_fim ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, data_fim: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <select
                value={filtros.tipo ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, tipo: e.target.value }))}
                className={inputClass}
              >
                <option value="">Todos</option>
                <option value="importacao">Importação</option>
                <option value="exportacao">Exportação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
              <select
                value={filtros.status ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
                className={inputClass}
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Modal</label>
              <select
                value={filtros.modal ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, modal: e.target.value }))}
                className={inputClass}
              >
                <option value="">Todos</option>
                {Object.entries(MODAL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Cliente</label>
              <input
                type="text"
                value={filtros.cliente ?? ''}
                onChange={(e) => setFiltros((f) => ({ ...f, cliente: e.target.value }))}
                placeholder="Buscar cliente..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {filtrosAtivos > 0 && (
              <button
                type="button"
                onClick={limparFiltros}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-white transition"
              >
                <X size={13} />
                Limpar filtros
              </button>
            )}
            <button
              type="button"
              onClick={() => aplicarFiltros(filtros)}
              disabled={isPending}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition"
            >
              {isPending ? 'Buscando...' : 'Aplicar filtros'}
            </button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Processos"
          valor={String(totalProcessos)}
          icon={FileText}
          cor="bg-violet-500/20 text-violet-400"
        />
        <KpiCard
          label="Total Receitas"
          valor={fmtBRL(totalReceitas)}
          icon={TrendingUp}
          cor="bg-green-500/20 text-green-400"
        />
        <KpiCard
          label="Total Despesas"
          valor={fmtBRL(totalDespesas)}
          icon={TrendingDown}
          cor="bg-red-500/20 text-red-400"
        />
        <KpiCard
          label="Resultado"
          valor={fmtBRL(resultado)}
          icon={BarChart2}
          cor={resultado >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}
        />
      </div>

      {/* Linha extra: tributos */}
      {totalTributos > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total de Tributos Aduaneiros no período</span>
          <span className="text-white font-mono font-semibold">{fmtBRL(totalTributos)}</span>
        </div>
      )}

      {/* Tabela */}
      {processos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart2 size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum processo encontrado</p>
          <p className="text-slate-600 text-sm mt-1">
            Ajuste os filtros ou cadastre novos processos
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Processo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Modal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Abertura</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Canal</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Receitas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Despesas</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tributos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Resultado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {processos.map((p) => {
                const resultado = p.total_receitas - p.total_despesas
                const tipoLabel = TIPO_LABELS[p.tipo]
                const statusLabel = STATUS_LABELS[p.status as ProcessoStatus] ?? p.status
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-mono text-sm font-medium">{p.numero}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                          ${p.tipo === 'importacao' ? 'text-cyan-400 bg-cyan-400/10' : 'text-indigo-400 bg-indigo-400/10'}`}>
                          {tipoLabel}
                        </span>
                        <span className="text-xs text-slate-500">{statusLabel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-sm">{p.cliente}</p>
                      {p.mercadoria && <p className="text-slate-600 text-xs mt-0.5">{p.mercadoria}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">
                        {p.modal ? MODAL_LABELS[p.modal] : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{fmtData(p.data_abertura)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.canal_parametrizacao ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${CANAL_BADGE[p.canal_parametrizacao] ?? 'text-slate-500 dark:text-slate-500 dark:text-slate-400'}`}>
                          {p.canal_parametrizacao}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-400 text-sm font-mono">
                        {p.total_receitas > 0 ? fmtBRL(p.total_receitas) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-400 text-sm font-mono">
                        {p.total_despesas > 0 ? fmtBRL(p.total_despesas) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-amber-400/80 text-sm font-mono">
                        {p.total_tributos > 0 ? fmtBRL(p.total_tributos) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-mono font-semibold ${resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {p.total_receitas > 0 || p.total_despesas > 0 ? fmtBRL(resultado) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/processos/${p.id}`}
                        className="text-amber-400 hover:text-amber-300 transition"
                        title="Ver processo"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* Totais */}
            <tfoot>
              <tr className="border-t border-slate-200 dark:border-white/10 bg-black/20">
                <td colSpan={5} className="px-4 py-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Total — {totalProcessos} processo{totalProcessos !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-400 font-mono text-sm font-semibold">{fmtBRL(totalReceitas)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-red-400 font-mono text-sm font-semibold">{fmtBRL(totalDespesas)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-amber-400/80 font-mono text-sm font-semibold">{fmtBRL(totalTributos)}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-mono text-sm font-bold ${resultado >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmtBRL(resultado)}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Nota de rodapé para impressão */}
      <div className="hidden print:block text-xs text-slate-500 text-center pt-4 border-t border-slate-200">
        Relatório Comexo — gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
      </div>
    </div>
  )
}
