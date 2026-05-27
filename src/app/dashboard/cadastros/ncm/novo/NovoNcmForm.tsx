'use client'

import { useActionState } from 'react'
import { criarNcmAction } from '../actions'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

export default function NovoNcmForm() {
  const [state, action, pending] = useActionState(criarNcmAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      {/* Classificação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Classificação</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Código NCM * (8 dígitos)</label>
            <input
              name="codigo"
              required
              placeholder="Ex: 85171210"
              maxLength={10}
              className={`${inputClass} font-mono tracking-wider`}
            />
            <p className="text-slate-600 text-xs mt-1">Apenas números — 8 dígitos</p>
          </div>
          <div>
            <label className={labelClass}>Unidade de Medida</label>
            <input name="unidade_medida" placeholder="Ex: UN, KG, M2, L..." className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Descrição *</label>
          <input
            name="descricao"
            required
            placeholder="Ex: Aparelhos telefônicos por fio com aparelho telefônico sem fio..."
            className={inputClass}
          />
        </div>
      </div>

      {/* Alíquotas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Alíquotas (%)</p>
          <span className="text-xs text-slate-500">Todos opcionais</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>II — Imposto de Importação</label>
            <input
              name="aliquota_ii"
              type="number"
              step="0.01"
              min="0"
              max="999"
              placeholder="Ex: 12.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>IPI</label>
            <input
              name="aliquota_ipi"
              type="number"
              step="0.01"
              min="0"
              max="999"
              placeholder="Ex: 5.00"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>PIS</label>
            <input
              name="aliquota_pis"
              type="number"
              step="0.01"
              min="0"
              max="999"
              placeholder="Ex: 2.10"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>COFINS</label>
            <input
              name="aliquota_cofins"
              type="number"
              step="0.01"
              min="0"
              max="999"
              placeholder="Ex: 9.65"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Observações</label>
          <textarea
            name="observacoes"
            rows={2}
            placeholder="Ex: Regime especial, exceções, notas fiscais..."
            className={inputClass + ' resize-none'}
          />
        </div>
      </div>

      {/* Reforma Tributária / LPCO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Reforma Tributária 2026 &amp; Licenciamento</p>
          <span className="text-xs text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Obrigatório DUIMP 2026</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>cClassTrib — Classificação Tributária IBS/CBS</label>
            <input
              name="c_class_trib"
              placeholder="Ex: 010101"
              maxLength={20}
              className={`${inputClass} font-mono`}
            />
            <p className="text-slate-600 text-xs mt-1">Obrigatório em toda DUIMP desde jan/2026</p>
          </div>
          <div>
            <label className={labelClass}>Ex-tarifário (se houver)</label>
            <input
              name="ex_tarifario"
              placeholder="Ex: EX-001"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="requer_lpco"
              type="checkbox"
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm text-white">Requer LPCO / Anuência</p>
              <p className="text-xs text-slate-500">ANVISA, MAPA, IBAMA, INMETRO, Exército, ANATEL...</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="tem_antidumping"
              type="checkbox"
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm text-white">Sujeito a Antidumping / Med. Compensatória</p>
              <p className="text-xs text-slate-500">Direito antidumping vigente para este NCM</p>
            </div>
          </label>
        </div>

        <div>
          <label className={labelClass}>Órgão Anuente (se requer LPCO)</label>
          <select name="orgao_anuente" className={inputClass}>
            <option value="">Nenhum / Não aplicável</option>
            <option value="ANVISA">ANVISA — Ag. Nac. Vigilância Sanitária</option>
            <option value="MAPA">MAPA — Ministério Agricultura</option>
            <option value="IBAMA">IBAMA — Meio Ambiente</option>
            <option value="INMETRO">INMETRO — Metrologia e Qualidade</option>
            <option value="EXERCITO">Exército Brasileiro</option>
            <option value="ANATEL">ANATEL — Telecomunicações</option>
            <option value="CNEN">CNEN — Nuclear</option>
            <option value="DECEX">DECEX — Depto. Comércio Exterior</option>
            <option value="OUTRO">Outro órgão</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Salvar NCM'}
        </button>
      </div>
    </form>
  )
}
