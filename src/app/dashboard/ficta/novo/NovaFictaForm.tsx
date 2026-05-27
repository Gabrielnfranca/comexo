'use client'

import { useActionState } from 'react'
import { criarFictaAction } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TIPOS = [
  { value: 'zfm',                 label: 'Zona Franca de Manaus (ZFM)' },
  { value: 'zpe',                 label: 'Zona de Proc. de Exportações (ZPE)' },
  { value: 'recof',               label: 'RECOF / RECOF-SPED' },
  { value: 'drawback_fornecedor', label: 'Venda a beneficiário de Drawback' },
  { value: 'outros',              label: 'Outros' },
]

const BENEFICIOS = [
  'Suspensão de II e IPI',
  'Suspensão de II, IPI, PIS e COFINS',
  'Isenção de ICMS',
  'Isenção de IPI',
  'Suspensão de IPI',
  'Não incidência de IPI e ICMS (ZFM)',
]

export default function NovaFictaForm() {
  const [state, formAction, pending] = useActionState(criarFictaAction, null)

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">

      {/* Header */}
      <div>
        <Link
          href="/dashboard/ficta"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Operação Ficta</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Exportação documental sem saída física — ZFM, ZPE, RECOF ou venda a beneficiário de Drawback.
        </p>
      </div>

      {state?.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-6">

        {/* Identificação */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Identificação</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Nº da Operação <span className="text-red-400">*</span>
              </label>
              <input
                name="numero_operacao"
                required
                placeholder="EX-FICTA-001"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Referência Interna</label>
              <input
                name="referencia_interna"
                placeholder="Código interno"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Modalidade / Tipo <span className="text-red-400">*</span>
            </label>
            <select
              name="tipo"
              required
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Selecione o tipo</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Cliente / Destinatário <span className="text-red-400">*</span>
              </label>
              <input
                name="cliente"
                required
                placeholder="Razão social"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">CNPJ do Cliente</label>
              <input
                name="cnpj_cliente"
                placeholder="00.000.000/0000-00"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Mercadoria */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mercadoria</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Descrição da Mercadoria</label>
            <textarea
              name="descricao_mercadoria"
              rows={2}
              placeholder="Descrição completa"
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">NCM</label>
              <input
                name="ncm"
                placeholder="0000.00.00"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Quantidade</label>
              <input
                name="quantidade"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Unidade</label>
              <input
                name="unidade"
                placeholder="UN / KG / M²"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Documentação */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Documentação</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Nº da NF-e</label>
              <input
                name="numero_nf"
                placeholder="000000000"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Data da NF-e</label>
              <input
                name="data_nf"
                type="date"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Nº da DUE</label>
              <input
                name="numero_due"
                placeholder="BR000000000000-0"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Data da DUE</label>
              <input
                name="data_due"
                type="date"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Valor da NF-e</label>
              <input
                name="valor_nf"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Moeda</label>
              <select
                name="moeda"
                defaultValue="BRL"
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="BRL">BRL — Real Brasileiro</option>
                <option value="USD">USD — Dólar Americano</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Benefício Fiscal */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Benefício Fiscal</h2>
          <p className="text-xs text-slate-500">
            Informe os tributos suspensos ou isentos nesta operação.
          </p>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Descrição do Benefício</label>
            <select
              name="beneficio_fiscal"
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">Selecione ou deixe em branco</option>
              {BENEFICIOS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Valor Estimado do Benefício (R$)
            </label>
            <input
              name="valor_beneficio_fiscal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Observações */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Observações</label>
          <textarea
            name="observacoes"
            rows={3}
            placeholder="Informações adicionais sobre a operação..."
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/10 dark:bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/ficta"
            className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition"
          >
            {pending ? 'Salvando...' : 'Criar Operação'}
          </button>
        </div>
      </form>
    </div>
  )
}
