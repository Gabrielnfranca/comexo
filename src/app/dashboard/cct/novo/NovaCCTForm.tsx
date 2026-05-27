'use client'

import { useActionState } from 'react'
import { criarCCTAction } from '../actions'

const STATUS_OPTIONS = [
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'recebido', label: 'Recebido' },
  { value: 'com_divergencia', label: 'Com Divergência' },
  { value: 'regularizado', label: 'Regularizado' },
]

export default function NovaCCTForm() {
  const [state, action, pending] = useActionState(criarCCTAction, null)

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      {/* Identificação */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Identificação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Nº do Conhecimento (BL / AWB / CRT) *</label>
            <input name="numero_conhecimento" required className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="HLCU1234567" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Data de Chegada</label>
            <input name="data_chegada" type="date" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Local de Chegada (Porto / Aeroporto)</label>
            <input name="local_chegada" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Porto de Santos" />
          </div>
        </div>
      </div>

      {/* Transporte */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Transporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Transportadora / Armador</label>
            <input name="transportadora" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Hapag-Lloyd" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
            <select name="status" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Peso Bruto (kg)</label>
            <input name="peso_bruto_kg" type="number" step="0.001" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="1500.000" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Nº de Volumes</label>
            <input name="numero_volumes" type="number" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="10" />
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
          {pending ? 'Salvando...' : 'Salvar CCT'}
        </button>
        <a href="/dashboard/cct" className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-white transition text-sm font-medium">
          Cancelar
        </a>
      </div>
    </form>
  )
}
