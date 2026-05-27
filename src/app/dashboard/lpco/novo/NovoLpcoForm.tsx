'use client'

import { useActionState } from 'react'
import { criarLpcoAction } from '../actions'
import {
  LPCO_TIPO_LABELS,
  ORGAOS_ANUENTES_LPCO,
  type LpcoTipo,
  type LpcoStatus,
} from '@/lib/types/lpco'
import { PAISES_COMUNS } from '@/lib/types/produto'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

const TIPOS: { value: LpcoTipo; label: string }[] = [
  { value: 'lpco', label: LPCO_TIPO_LABELS.lpco },
  { value: 'li', label: LPCO_TIPO_LABELS.li },
  { value: 'anuencia', label: LPCO_TIPO_LABELS.anuencia },
]

const STATUS_OPTIONS: { value: LpcoStatus; label: string }[] = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'indeferido', label: 'Indeferido' },
  { value: 'expirado', label: 'Expirado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function NovoLpcoForm() {
  const [state, action, pending] = useActionState(criarLpcoAction, null)

  return (
    <form action={action} className="space-y-5">
      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      {/* Identificação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Identificação da LPCO</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="tipo_licenca" defaultValue="lpco" className={inputClass}>
              {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Órgão Anuente *</label>
            <select name="orgao_anuente" required className={inputClass}>
              <option value="">Selecione...</option>
              {ORGAOS_ANUENTES_LPCO.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" defaultValue="rascunho" className={inputClass}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Número LPCO (se já emitida)</label>
            <input name="numero_lpco" placeholder="Ex: 26/0123456" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>DUIMP / DI vinculada</label>
            <input name="numero_di" placeholder="Ex: 26/1234567-8" className={`${inputClass} font-mono`} />
          </div>
        </div>
      </div>

      {/* Mercadoria */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Mercadoria</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>NCM (8 dígitos)</label>
            <input name="ncm_codigo" placeholder="Ex: 85171210" maxLength={10} className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>País de Origem</label>
            <select name="pais_origem" className={inputClass}>
              <option value="">Selecione...</option>
              {PAISES_COMUNS.map(p => (
                <option key={p.codigo} value={p.codigo}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Exportador / Fabricante</label>
            <input name="exportador_nome" placeholder="Nome da empresa" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Descrição da Mercadoria</label>
          <textarea
            name="descricao_mercadoria"
            rows={2}
            placeholder="Descrição detalhada da mercadoria para fins de licenciamento..."
            className={inputClass + ' resize-none'}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Quantidade</label>
            <input name="quantidade" type="number" step="0.01" min="0" placeholder="Ex: 1000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unidade</label>
            <select name="unidade_medida" className={inputClass}>
              <option value="">—</option>
              <option value="UN">UN — Unidade</option>
              <option value="KG">KG — Quilograma</option>
              <option value="L">L — Litro</option>
              <option value="M">M — Metro</option>
              <option value="CX">CX — Caixa</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Valor USD</label>
            <input name="valor_usd" type="number" step="0.01" min="0" placeholder="Ex: 15000.00" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Importador */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Importador</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>CNPJ do Importador</label>
            <input name="importador_cnpj" placeholder="00.000.000/0001-00" className={`${inputClass} font-mono`} />
          </div>
          <div>
            <label className={labelClass}>Razão Social do Importador</label>
            <input name="importador_nome" placeholder="Nome da empresa" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Datas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Datas</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Data de Solicitação</label>
            <input name="data_solicitacao" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Aprovação</label>
            <input name="data_aprovacao" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Validade</label>
            <input name="data_validade" type="date" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <label className={labelClass}>Observações</label>
        <textarea name="observacoes" rows={3} placeholder="Exigências especiais, documentos anexos, histórico..." className={inputClass + ' resize-none'} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Registrar LPCO'}
        </button>
      </div>
    </form>
  )
}
