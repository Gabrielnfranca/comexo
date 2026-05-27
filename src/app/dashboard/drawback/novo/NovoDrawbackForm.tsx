'use client'

import { useActionState } from 'react'
import { criarDrawbackAction } from '../actions'

const inputClass =
  'w-full px-3 py-2 bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'

const labelClass = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1'

export default function NovoDrawbackForm() {
  const [state, action, pending] = useActionState(criarDrawbackAction, null)

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      {/* Identificação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Identificação do Ato</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Número do Ato Concessório *</label>
            <input
              type="text"
              name="numero_ato"
              required
              placeholder="Ex: 23080.000001/2025-01"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Referência Interna</label>
            <input
              type="text"
              name="referencia_interna"
              placeholder="Ex: DB-2025-001"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Modalidade *</label>
            <select name="modalidade" required className={inputClass}>
              <option value="">Selecione a modalidade</option>
              <option value="suspensao">Suspensão</option>
              <option value="isencao">Isenção</option>
              <option value="restituicao">Restituição</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Beneficiário / Cliente *</label>
            <input
              type="text"
              name="cliente"
              required
              placeholder="Razão social da empresa beneficiária"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Datas e prazos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Datas e Prazos</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Data de Concessão</label>
            <input type="date" name="data_concessao" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Vencimento</label>
            <input type="date" name="data_vencimento" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prazo (meses)</label>
            <input
              type="number"
              name="prazo_meses"
              defaultValue={12}
              min={1}
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Prazo padrão para comprovação da exportação: 12 meses, prorrogável por mais 12 meses mediante solicitação.
        </p>
      </div>

      {/* Compromisso de exportação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Compromisso de Exportação</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Valor FOB a Exportar (USD)</label>
            <input
              type="number"
              name="valor_fob_exportar"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Valor mínimo de exportação comprometido no ato concessório. Usado para calcular o progresso de comprovação.
        </p>
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Observações</h3>
        <textarea
          name="observacoes"
          rows={3}
          placeholder="Informações adicionais sobre o ato..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a
          href="/dashboard/drawback"
          className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white transition"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Cadastrar Ato'}
        </button>
      </div>
    </form>
  )
}
