'use client'

import { useActionState, useState } from 'react'
import { enviarAlertasAction, AlertaDrawback, AlertaEntreposto } from './actions'
import { Bell, Send, CheckCircle, AlertTriangle, Clock, PackageSearch, Warehouse } from 'lucide-react'

interface Props {
  alertasDrawback: AlertaDrawback[]
  alertasEntreposto: AlertaEntreposto[]
}

function BadgeDias({ dias }: { dias: number }) {
  if (dias < 0) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-semibold text-red-300">
      <AlertTriangle className="h-3 w-3" />
      Vencido
    </span>
  )
  if (dias <= 7) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-semibold text-red-300">
      <AlertTriangle className="h-3 w-3" />
      {dias}d
    </span>
  )
  if (dias <= 30) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-300">
      <Clock className="h-3 w-3" />
      {dias}d
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-900/40 px-2 py-0.5 text-xs font-semibold text-blue-300">
      <Clock className="h-3 w-3" />
      {dias}d
    </span>
  )
}

export default function NotificacoesClient({ alertasDrawback, alertasEntreposto }: Props) {
  const [state, formAction, pending] = useActionState(enviarAlertasAction, null)

  // seleção de alertas
  const [selDrawback, setSelDrawback] = useState<Set<string>>(new Set())
  const [selEntreposto, setSelEntreposto] = useState<Set<string>>(new Set())

  function toggleDrawback(id: string) {
    setSelDrawback((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleEntreposto(id: string) {
    setSelEntreposto((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function selecionarTodos() {
    setSelDrawback(new Set(alertasDrawback.map((d) => d.id)))
    setSelEntreposto(new Set(alertasEntreposto.map((e) => e.id)))
  }
  function limparSelecao() {
    setSelDrawback(new Set())
    setSelEntreposto(new Set())
  }

  const totalSelecionados = selDrawback.size + selEntreposto.size
  const totalAlertas = alertasDrawback.length + alertasEntreposto.length

  return (
    <div className="space-y-6">

      {/* Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total de Alertas</p>
          <p className="mt-1 text-3xl font-bold text-white">{totalAlertas}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-sm text-amber-400">Drawback em Alerta</p>
          <p className="mt-1 text-3xl font-bold text-amber-300">{alertasDrawback.length}</p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <p className="text-sm text-cyan-400">Entreposto em Alerta</p>
          <p className="mt-1 text-3xl font-bold text-cyan-300">{alertasEntreposto.length}</p>
        </div>
      </div>

      {totalAlertas === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-16 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="mt-4 text-lg font-semibold text-white">Nenhum alerta no momento</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Todos os prazos de Drawback e Entreposto estão dentro dos limites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Coluna esquerda — Listas de alertas */}
          <div className="space-y-4">

            {/* Drawback */}
            {alertasDrawback.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 px-4 py-3">
                  <PackageSearch className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">Drawback — Atos Vencendo</h3>
                  <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    {alertasDrawback.length}
                  </span>
                </div>
                <ul className="divide-y divide-white/5">
                  {alertasDrawback.map((alerta) => (
                    <li key={alerta.id}>
                      <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-900/5 dark:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selDrawback.has(alerta.id)}
                          onChange={() => toggleDrawback(alerta.id)}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900/10 dark:bg-white/10 text-amber-500 accent-amber-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{alerta.numero_ato}</span>
                            <BadgeDias dias={alerta.dias_restantes} />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{alerta.cliente}</p>
                          <p className="text-xs text-slate-500">
                            {alerta.modalidade} · vence {new Date(alerta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entreposto */}
            {alertasEntreposto.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 px-4 py-3">
                  <Warehouse className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Entreposto — Lotes Vencendo</h3>
                  <span className="ml-auto rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
                    {alertasEntreposto.length}
                  </span>
                </div>
                <ul className="divide-y divide-white/5">
                  {alertasEntreposto.map((alerta) => (
                    <li key={alerta.id}>
                      <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-900/5 dark:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selEntreposto.has(alerta.id)}
                          onChange={() => toggleEntreposto(alerta.id)}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900/10 dark:bg-white/10 text-cyan-500 accent-cyan-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{alerta.numero_lote}</span>
                            <BadgeDias dias={alerta.dias_restantes} />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{alerta.beneficiario}</p>
                          <p className="text-xs text-slate-500">
                            {alerta.regime} · limite {new Date(alerta.data_limite).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Selecionar todos / limpar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selecionarTodos}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Selecionar todos
              </button>
              <span className="text-xs text-slate-600">·</span>
              <button
                type="button"
                onClick={limparSelecao}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-300 underline"
              >
                Limpar seleção
              </button>
            </div>
          </div>

          {/* Coluna direita — Formulário de envio */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 self-start">
            <h3 className="mb-4 text-base font-semibold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-blue-400" />
              Enviar Notificações
            </h3>

            <form action={formAction} className="space-y-4">
              {/* Hidden inputs para IDs selecionados */}
              {Array.from(selDrawback).map((id) => (
                <input key={id} type="hidden" name="drawback_ids" value={id} />
              ))}
              {Array.from(selEntreposto).map((id) => (
                <input key={id} type="hidden" name="entreposto_ids" value={id} />
              ))}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  E-mail destinatário
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="cliente@empresa.com.br"
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Um e-mail separado será enviado para cada alerta selecionado.
                </p>
              </div>

              {/* Resumo seleção */}
              <div className="rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-white">{totalSelecionados}</span> alerta
                  {totalSelecionados !== 1 ? 's' : ''} selecionado{totalSelecionados !== 1 ? 's' : ''}
                </p>
                {selDrawback.size > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">• {selDrawback.size} Drawback</p>
                )}
                {selEntreposto.size > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">• {selEntreposto.size} Entreposto</p>
                )}
              </div>

              {/* Feedback */}
              {state?.error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-sm text-red-400">{state.error}</p>
                </div>
              )}
              {state?.sucesso !== undefined && state.sucesso > 0 && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <p className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {state.sucesso} e-mail{state.sucesso !== 1 ? 's' : ''} enviado{state.sucesso !== 1 ? 's' : ''} com sucesso!
                  </p>
                </div>
              )}
              {state?.erros && state.erros.length > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 space-y-1">
                  {state.erros.map((e, i) => (
                    <p key={i} className="text-xs text-red-400">{e}</p>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={pending || totalSelecionados === 0}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {pending ? 'Enviando...' : `Enviar ${totalSelecionados > 0 ? `(${totalSelecionados})` : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
