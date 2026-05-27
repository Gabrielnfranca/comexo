'use client'

import { useActionState } from 'react'
import { criarEntrepostoAction } from '../actions'

const inputClass =
  'w-full px-3 py-2 bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1'

export default function NovoEntrepostoForm() {
  const [state, action, pending] = useActionState(criarEntrepostoAction, null)

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      {/* Identificação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Identificação do Lote</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Número do Lote *</label>
            <input name="numero_lote" required placeholder="Ex: ENT-2025-001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>DACTA (Nº Declaração)</label>
            <input name="numero_dacta" placeholder="Nº da DACTA" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo *</label>
            <select name="tipo" required className={inputClass}>
              <option value="">Selecione</option>
              <option value="importacao">Importação</option>
              <option value="exportacao">Exportação</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Regime *</label>
            <select name="regime" defaultValue="comum" className={inputClass}>
              <option value="comum">Comum</option>
              <option value="especial">Especial</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Beneficiário *</label>
            <input name="beneficiario" required placeholder="Razão social do depositante" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Recinto Aduaneiro</label>
          <input name="recinto_aduaneiro" placeholder="Nome / endereço do recinto" className={inputClass} />
        </div>
      </div>

      {/* Mercadoria */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Mercadoria</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Descrição da Mercadoria</label>
            <input name="descricao_mercadoria" placeholder="Descrição detalhada" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>NCM</label>
            <input name="ncm" placeholder="00000000" maxLength={10} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Valor Aduaneiro</label>
            <div className="flex gap-2">
              <input name="valor_aduaneiro" type="number" step="0.01" min="0" placeholder="0.00"
                className={`${inputClass} flex-1`} />
              <select name="moeda" defaultValue="USD" className="w-24 px-2 py-2 bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg text-white text-sm focus:outline-none">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="BRL">BRL</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Quantidade</label>
            <input name="quantidade" type="number" step="0.0001" min="0" placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unidade</label>
            <input name="unidade" placeholder="KG / UN / M² / L" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Prazo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Prazo de Permanência</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data de Entrada no Recinto *</label>
            <input type="date" name="data_entrada" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Prazo (meses)</label>
            <input type="number" name="prazo_meses" defaultValue={12} min={1} max={36} className={inputClass} />
          </div>
        </div>
        <p className="text-xs text-slate-500">
          A data limite será calculada automaticamente. Prazo padrão: 12 meses (prorrogável).
          Você receberá alertas 30 dias antes do vencimento.
        </p>
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Observações</h3>
        <textarea name="observacoes" rows={3} placeholder="Informações adicionais..."
          className={`${inputClass} resize-none`} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <a href="/dashboard/entreposto" className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white transition">
          Cancelar
        </a>
        <button type="submit" disabled={pending}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition">
          {pending ? 'Salvando...' : 'Cadastrar Lote'}
        </button>
      </div>
    </form>
  )
}
