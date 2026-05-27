'use client'

import { useActionState, useState } from 'react'
import { criarAFFRMAction } from '../actions'
import { RefreshCw } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'dpc_gerado', label: 'DPC Gerado' },
  { value: 'pago', label: 'Pago' },
  { value: 'dispensado', label: 'Dispensado' },
]

export default function NovoMercanteForm() {
  const [state, action, pending] = useActionState(criarAFFRMAction, null)
  const [freteUSD, setFreteUSD] = useState('')
  const [cambio, setCambio] = useState('')
  const [buscandoPtax, setBuscandoPtax] = useState(false)
  const freteBRL = freteUSD && cambio ? (parseFloat(freteUSD) * parseFloat(cambio)).toFixed(2) : ''
  const afrmm = freteBRL ? (parseFloat(freteBRL) * 0.25).toFixed(2) : ''

  async function buscarPtax() {
    setBuscandoPtax(true)
    try {
      const hoje = new Date().toISOString().slice(0, 10)
      const resp = await fetch(`/api/ptax?moeda=USD&data=${hoje}`)
      const data = await resp.json()
      if (data.cotacaoVenda) setCambio(String(data.cotacaoVenda))
    } catch { /* silencioso */ } finally {
      setBuscandoPtax(false)
    }
  }

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{state.error}</div>
      )}

      {/* Identificação */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Conhecimento de Embarque</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Nº do Conhecimento (BL) *</label>
            <input name="numero_conhecimento" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="HLCU1234567" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Data de Embarque</label>
            <input name="data_embarque" type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Armador</label>
            <input name="armador" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Hapag-Lloyd" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Porto de Origem</label>
            <input name="porto_origem" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Xangai (CNSHA)" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Porto de Destino</label>
            <input name="porto_destino" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Santos (BRSSZ)" />
          </div>
        </div>
      </div>

      {/* Cálculo AFRMM */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Cálculo AFRMM</h2>
        <p className="text-xs text-slate-500">AFRMM = 25% do valor do frete internacional em BRL</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Valor do Frete (USD)</label>
            <input
              name="valor_frete_usd" type="number" step="0.01"
              value={freteUSD} onChange={e => setFreteUSD(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              placeholder="2500.00"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Taxa de Câmbio (USD → BRL)</label>
            <div className="flex gap-1.5">
              <input
                name="taxa_cambio" type="number" step="0.0001"
                value={cambio} onChange={e => setCambio(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="5.4250"
              />
              <button type="button" onClick={buscarPtax} disabled={buscandoPtax}
                title="Buscar PTAX do Banco Central"
                className="flex items-center gap-1 px-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition text-xs whitespace-nowrap disabled:opacity-60">
                <RefreshCw size={12} className={buscandoPtax ? 'animate-spin' : ''} />
                PTAX
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Frete em BRL (calculado)</label>
            <div className="w-full bg-white dark:bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 text-sm">
              {freteBRL ? `R$ ${parseFloat(freteBRL).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">AFRMM 25% (calculado)</label>
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-amber-400 text-sm font-semibold">
              {afrmm ? `R$ ${parseFloat(afrmm).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* DPC e Pagamento */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">DPC e Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Nº do DPC</label>
            <input name="numero_dpc" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Vencimento do DPC</label>
            <input name="data_vencimento_dpc" type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Data de Pagamento</label>
            <input name="data_pagamento" type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
            <select name="status" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Observações</label>
        <textarea name="observacoes" rows={3} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-xl transition">
          {pending ? 'Salvando...' : 'Salvar Registro'}
        </button>
        <a href="/dashboard/mercante" className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-white transition text-sm font-medium">
          Cancelar
        </a>
      </div>
    </form>
  )
}
