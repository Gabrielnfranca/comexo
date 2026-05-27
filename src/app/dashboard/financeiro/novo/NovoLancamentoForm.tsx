'use client'

import { useActionState, useState } from 'react'
import { criarLancamentoAction } from '../actions'
import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'
import {
  CATEGORIA_LABELS,
  CATEGORIAS_RECEITA,
  CATEGORIAS_DESPESA,
  MOEDAS,
} from '@/lib/types/financeiro'

const inputClass =
  'w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition'

type ProcessoOpt = { id: string; numero: string; cliente: string }

export default function NovoLancamentoForm({ processos }: { processos: ProcessoOpt[] }) {
  const [estado, action, pending] = useActionState(criarLancamentoAction, {})
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')

  const categorias = tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/financeiro" className="p-2 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-900/5 dark:bg-white/5 rounded-xl transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Lançamento</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Registrar receita ou despesa</p>
        </div>
      </div>

      {estado.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {estado.erro}
        </div>
      )}
      {estado.sucesso && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-sm">
          {estado.sucesso}
        </div>
      )}

      <form action={action} className="space-y-5">

        {/* Tipo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-amber-400" />
            <p className="text-white font-semibold text-sm">Tipo de Lançamento</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'despesa', label: 'Despesa', desc: 'Custo do processo', icon: '−', cor: 'text-red-400' },
              { value: 'receita', label: 'Receita', desc: 'Honorários / entrada', icon: '+', cor: 'text-emerald-400' },
            ] as const).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTipo(t.value)}
                className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition
                  ${tipo === t.value ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-200 dark:border-white/5 bg-black/20 hover:border-slate-200 dark:border-white/10'}`}
              >
                <span className={`text-2xl font-bold ${t.cor}`}>{t.icon}</span>
                <span className={`font-semibold text-sm ${tipo === t.value ? 'text-white' : 'text-slate-500 dark:text-slate-500 dark:text-slate-400'}`}>{t.label}</span>
                <span className="text-xs text-slate-500">{t.desc}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="tipo" value={tipo} />
        </div>

        {/* Dados */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <p className="text-white font-semibold text-sm">Dados do Lançamento</p>

          {/* Processo */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Processo (opcional)</label>
            <select name="processo_id" className={inputClass}>
              <option value="">— Sem vínculo com processo —</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero} — {p.cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Descrição *</label>
            <input
              name="descricao"
              required
              placeholder="Ex: Honorários despacho aduaneiro, Imposto II ref. DI 2026..."
              className={inputClass}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Categoria</label>
            <select name="categoria" className={inputClass}>
              {categorias.map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABELS[c]}</option>
              ))}
            </select>
          </div>

          {/* Valor + Moeda */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Valor *</label>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Moeda</label>
              <select name="moeda" defaultValue="BRL" className={inputClass}>
                {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Vencimento */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">
              {tipo === 'receita' ? 'Previsão de Recebimento' : 'Data de Vencimento'}
            </label>
            <input type="date" name="vencimento" className={inputClass} />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1.5">Observações</label>
            <textarea
              name="observacoes"
              rows={2}
              placeholder="Informações adicionais..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Link href="/dashboard/financeiro" className="px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-white border border-slate-200 dark:border-white/10 hover:border-white/20 rounded-xl text-sm transition">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
          >
            {pending ? 'Salvando...' : 'Registrar Lançamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
