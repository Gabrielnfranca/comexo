'use client'

import { useActionState } from 'react'
import { criarArmadorAction } from '../actions'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

const MODAIS = [
  { value: 'maritimo', label: '⚓ Marítimo' },
  { value: 'aereo', label: '✈️ Aéreo' },
  { value: 'rodoviario', label: '🚛 Rodoviário' },
  { value: 'ferroviario', label: '🚂 Ferroviário' },
]

export default function NovoArmadorForm() {
  const [state, action, pending] = useActionState(criarArmadorAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Dados</p>

        <div>
          <label className={labelClass}>Nome *</label>
          <input name="nome" required placeholder="Ex: Maersk, MSC, CMA CGM, LATAM Cargo..." className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Modal de Transporte</label>
            <select name="modal" defaultValue="maritimo" className={inputClass}>
              {MODAIS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Código SCAC / Prefixo</label>
            <input name="codigo" placeholder="Ex: MAEU, MSCU, CMDU..." className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>País Sede</label>
            <input name="pais_sede" placeholder="Ex: Dinamarca, Suíça..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Site</label>
            <input name="site" placeholder="https://www.maersk.com" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            name="observacoes"
            rows={2}
            placeholder="Informações adicionais..."
            className={inputClass + ' resize-none'}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Salvar Armador'}
        </button>
      </div>
    </form>
  )
}
