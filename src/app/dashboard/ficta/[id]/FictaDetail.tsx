"use client";

import { useActionState, useState } from 'react'
import {
  editarFictaAction,
  atualizarStatusFictaAction,
  registrarComprovacaoAction,
  excluirFictaAction,
} from '../actions'
import {
  OperacaoFicta,
  FICTA_TIPO_LABELS,
  FICTA_TIPO_COLORS,
  FICTA_STATUS_LABELS,
  FICTA_STATUS_COLORS,
} from '@/lib/types/ficta'
import Link from 'next/link'
import { ArrowLeft, Edit2, CheckCircle, X, Trash2, FileText } from 'lucide-react'

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

function Campo({ label, valor }: { label: string; valor?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white">{valor ?? <span className="text-slate-600">—</span>}</p>
    </div>
  )
}

function FormEditarOperacao({ op }: { op: OperacaoFicta }) {
  const [state, formAction, pending] = useActionState(editarFictaAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={op.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Nº da Operação *</label>
          <input name="numero_operacao" required defaultValue={op.numero_operacao}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Referência Interna</label>
          <input name="referencia_interna" defaultValue={op.referencia_interna ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Tipo *</label>
          <select name="tipo" required defaultValue={op.tipo}
            className="w-full rounded-lg border border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none">
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Cliente *</label>
          <input name="cliente" required defaultValue={op.cliente}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">CNPJ do Cliente</label>
          <input name="cnpj_cliente" defaultValue={op.cnpj_cliente ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">NCM</label>
          <input name="ncm" defaultValue={op.ncm ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Nº NF-e</label>
          <input name="numero_nf" defaultValue={op.numero_nf ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Data NF-e</label>
          <input name="data_nf" type="date" defaultValue={op.data_nf ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Nº DUE</label>
          <input name="numero_due" defaultValue={op.numero_due ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Data DUE</label>
          <input name="data_due" type="date" defaultValue={op.data_due ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Valor NF-e</label>
          <input name="valor_nf" type="number" step="0.01" defaultValue={op.valor_nf ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Moeda</label>
          <select name="moeda" defaultValue={op.moeda}
            className="w-full rounded-lg border border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none">
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Benefício Fiscal</label>
          <select name="beneficio_fiscal" defaultValue={op.beneficio_fiscal ?? ''}
            className="w-full rounded-lg border border-white/10 bg-[#0F2643] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none">
            <option value="">—</option>
            {BENEFICIOS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Valor do Benefício (R$)</label>
          <input name="valor_beneficio_fiscal" type="number" step="0.01" defaultValue={op.valor_beneficio_fiscal ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Descrição da Mercadoria</label>
        <textarea name="descricao_mercadoria" rows={2} defaultValue={op.descricao_mercadoria ?? ''}
          className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Observações</label>
        <textarea name="observacoes" rows={2} defaultValue={op.observacoes ?? ''}
          className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none" />
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Salvo com sucesso.</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition">
        {pending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}

function FormRegistrarComprovacao({ op }: { op: OperacaoFicta }) {
  const [state, formAction, pending] = useActionState(registrarComprovacaoAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={op.id} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Comprovante de Internamento / Protocolo
          </label>
          <input
            name="comprovante_internamento"
            placeholder="Nº do comprovante (ZFM) ou protocolo"
            defaultValue={op.comprovante_internamento ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Data de Comprovação <span className="text-red-400">*</span>
          </label>
          <input
            name="data_comprovacao"
            type="date"
            required
            defaultValue={op.data_comprovacao ?? ''}
            className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle className="h-4 w-4" /> Comprovação registrada!
        </p>
      )}
      <button type="submit" disabled={pending}
        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition">
        <CheckCircle className="h-4 w-4" />
        {pending ? 'Registrando...' : 'Registrar Comprovação'}
      </button>
    </form>
  )
}

export default function FictaDetail({ op }: { op: OperacaoFicta }) {
  const [editando, setEditando] = useState(false)
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false)
  const [statusState, statusAction, statusPending] = useActionState(atualizarStatusFictaAction, null)

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/ficta"
            className="mb-2 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{op.numero_operacao}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FICTA_TIPO_COLORS[op.tipo]}`}>
              {op.tipo === 'zfm' ? 'ZFM' :
               op.tipo === 'zpe' ? 'ZPE' :
               op.tipo === 'recof' ? 'RECOF' :
               op.tipo === 'drawback_fornecedor' ? 'Drawback' : 'Outros'}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${FICTA_STATUS_COLORS[op.status]}`}>
              {FICTA_STATUS_LABELS[op.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{FICTA_TIPO_LABELS[op.tipo]}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditando((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
        >
          {editando ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          {editando ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {/* Formulário de edição */}
      {editando && (
        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6">
          <h2 className="mb-4 text-sm font-semibold text-purple-300">Editar Operação</h2>
          <FormEditarOperacao op={op} />
        </div>
      )}

      {/* Dados da operação */}
      {!editando && (
        <>
          {/* Identificação + Mercadoria */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Identificação</h2>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Cliente" valor={op.cliente} />
                <Campo label="CNPJ" valor={op.cnpj_cliente} />
                <Campo label="Referência Interna" valor={op.referencia_interna} />
                <Campo label="Tipo" valor={FICTA_TIPO_LABELS[op.tipo]} />
              </div>
              {op.observacoes && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Observações</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{op.observacoes}</p>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Mercadoria</h2>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="NCM" valor={op.ncm} />
                <Campo label="Unidade" valor={op.unidade} />
                <Campo label="Quantidade" valor={op.quantidade?.toLocaleString('pt-BR')} />
              </div>
              {op.descricao_mercadoria && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Descrição</p>
                  <p className="text-sm text-slate-300">{op.descricao_mercadoria}</p>
                </div>
              )}
            </div>
          </div>

          {/* Documentação + Benefício */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentação
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Campo label="Nº NF-e" valor={op.numero_nf} />
                <Campo label="Data NF-e" valor={op.data_nf ? new Date(op.data_nf).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null} />
                <Campo label="Nº DUE" valor={op.numero_due} />
                <Campo label="Data DUE" valor={op.data_due ? new Date(op.data_due).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null} />
                <Campo
                  label="Valor NF-e"
                  valor={op.valor_nf != null ? `${op.moeda} ${op.valor_nf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null}
                />
              </div>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-400">Benefício Fiscal</h2>
              <Campo label="Benefício" valor={op.beneficio_fiscal} />
              {op.valor_beneficio_fiscal != null && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Valor Estimado</p>
                  <p className="text-2xl font-bold text-purple-300">{fmt(op.valor_beneficio_fiscal)}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Atualizar status */}
      {op.status !== 'comprovada' && op.status !== 'cancelada' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Atualizar Status</h2>
          <form action={statusAction} className="flex flex-wrap gap-3">
            <input type="hidden" name="id" value={op.id} />
            {op.status === 'aberta' && (
              <button name="status" value="em_andamento"
                className="rounded-lg bg-amber-600/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/20 transition">
                Marcar Em andamento
              </button>
            )}
            <button name="status" value="cancelada"
              className="rounded-lg bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 transition">
              Cancelar operação
            </button>
            {statusState?.error && <p className="self-center text-sm text-red-400">{statusState.error}</p>}
          </form>
        </div>
      )}

      {/* Comprovação */}
      {op.status !== 'cancelada' && (
        <div className={`rounded-xl border p-6 ${
          op.status === 'comprovada'
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-white/10 bg-white/5'
        }`}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Comprovação da Operação
          </h2>
          {op.status === 'comprovada' ? (
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-emerald-400 shrink-0 mt-0.5" />
              <div className="grid grid-cols-2 gap-4">
                <Campo
                  label="Data de Comprovação"
                  valor={op.data_comprovacao ? new Date(op.data_comprovacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : null}
                />
                <Campo label="Comprovante / Protocolo" valor={op.comprovante_internamento} />
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-400">
                {op.tipo === 'zfm'
                  ? 'Informe o número do Comprovante de Internamento emitido pela SUFRAMA e a data de comprovação.'
                  : 'Informe o protocolo de comprovação junto ao órgão competente e a data de conclusão.'}
              </p>
              <FormRegistrarComprovacao op={op} />
            </>
          )}
        </div>
      )}

      {/* Excluir */}
      <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-6">
        <h2 className="mb-2 text-sm font-semibold text-red-400">Zona de Perigo</h2>
        <p className="mb-4 text-sm text-slate-400">A exclusão é permanente e não pode ser desfeita.</p>
        {!confirmandoExcluir ? (
          <button
            type="button"
            onClick={() => setConfirmandoExcluir(true)}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 className="h-4 w-4" />
            Excluir operação
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-400 font-medium">Confirmar exclusão?</p>
            <form action={async () => { 'use server'; await excluirFictaAction(op.id) }}>
              <button type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition">
                Sim, excluir
              </button>
            </form>
            <button type="button" onClick={() => setConfirmandoExcluir(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:text-white transition">
              Cancelar
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
