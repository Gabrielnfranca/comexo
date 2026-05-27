'use client'

import { useActionState, useState } from 'react'
import {
  salvarDesembaracoAction,
  adicionarTributoAction,
  atualizarTributoAction,
  excluirTributoAction,
} from '@/app/dashboard/processos/[id]/actions-desembaraco'
import type { TributoDi, CanalParametrizacao } from '@/lib/types/desembaraco'
import {
  TRIBUTO_LABELS,
  CANAL_LABELS,
  CANAL_COLORS,
  CANAL_DESCRICAO,
  TRIBUTOS_PADRAO,
} from '@/lib/types/desembaraco'
import { Shield, Plus, Pencil, X, CheckCircle2, Clock, FileCheck } from 'lucide-react'

const inputClass =
  'w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-400 mb-1'

const CANAIS: CanalParametrizacao[] = ['verde', 'amarelo', 'vermelho', 'cinza']

const CANAL_BG: Record<CanalParametrizacao, string> = {
  verde:    'bg-green-500',
  amarelo:  'bg-yellow-500',
  vermelho: 'bg-red-500',
  cinza:    'bg-slate-500',
}

function formatBRL(v: number | null) {
  if (v === null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(s: string | null) {
  if (!s) return '—'
  return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR')
}

// ─── Form Dados DI ─────────────────────────────────────────────────────────────

function FormDadosDI({
  processoId,
  numeroDi,
  canal,
  dataRegistroDi,
  dataDesembaraco,
  onClose,
}: {
  processoId: string
  numeroDi: string | null
  canal: string | null
  dataRegistroDi: string | null
  dataDesembaraco: string | null
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(salvarDesembaracoAction, null)

  return (
    <form action={action} className="space-y-4 pt-3 border-t border-white/5">
      <input type="hidden" name="processo_id" value={processoId} />

      {state?.erro && (
        <p className="text-red-400 text-xs">{state.erro}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nº DI / DUE</label>
          <input
            name="numero_di"
            defaultValue={numeroDi ?? ''}
            placeholder="Ex: 26/0123456-7"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Canal de Parametrização</label>
          <select name="canal_parametrizacao" defaultValue={canal ?? ''} className={inputClass}>
            <option value="">Não definido</option>
            {CANAIS.map((c) => (
              <option key={c} value={c}>{CANAL_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Data de Registro da DI</label>
          <input type="date" name="data_registro_di" defaultValue={dataRegistroDi ?? ''} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data de Desembaraço</label>
          <input type="date" name="data_desembaraco" defaultValue={dataDesembaraco ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm transition">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          onClick={() => { if (!pending) setTimeout(onClose, 300) }}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

// ─── Form Novo Tributo ─────────────────────────────────────────────────────────

function FormNovoTributo({
  processoId,
  onClose,
}: {
  processoId: string
  onClose: () => void
}) {
  const [state, action, pending] = useActionState(adicionarTributoAction, null)
  const [tipoSelecionado, setTipoSelecionado] = useState('')

  return (
    <form action={action} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
      <input type="hidden" name="processo_id" value={processoId} />

      {state?.erro && <p className="text-red-400 text-xs">{state.erro}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tributo *</label>
          <select
            name="tipo_tributo"
            required
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value)}
            className={inputClass}
          >
            <option value="">Selecione...</option>
            {TRIBUTOS_PADRAO.map((t) => (
              <option key={t} value={t}>{TRIBUTO_LABELS[t]}</option>
            ))}
            <option value="outros">Outros</option>
          </select>
        </div>
        {tipoSelecionado === 'outros' && (
          <div>
            <label className={labelClass}>Descrição</label>
            <input name="descricao" placeholder="Ex: IOF, Multa..." className={inputClass} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Base de Cálculo (R$)</label>
          <input name="base_calculo" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Alíquota (%)</label>
          <input name="aliquota" type="number" step="0.0001" min="0" placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Valor Calculado (R$)</label>
          <input name="valor_calculado" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Valor Pago (R$)</label>
          <input name="valor_pago" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nº DARF</label>
          <input name="numero_darf" placeholder="Ex: 1234567890" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data Pagamento</label>
          <input type="date" name="data_pagamento" className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm transition">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-lg transition"
        >
          {pending ? 'Adicionando...' : 'Adicionar Tributo'}
        </button>
      </div>
    </form>
  )
}

// ─── Linha de Tributo ──────────────────────────────────────────────────────────

function TributoRow({
  tributo,
  processoId,
}: {
  tributo: TributoDi
  processoId: string
}) {
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [state, action, pending] = useActionState(atualizarTributoAction, null)

  const label = TRIBUTO_LABELS[tributo.tipo_tributo] ?? tributo.tipo_tributo.toUpperCase()
  const nome = tributo.descricao ? `${tributo.descricao}` : label

  if (editando) {
    return (
      <tr>
        <td colSpan={6} className="px-4 py-3">
          <form action={action} className="grid grid-cols-6 gap-2 items-end">
            <input type="hidden" name="id" value={tributo.id} />
            <input type="hidden" name="processo_id" value={processoId} />
            <div>
              <label className={labelClass}>Base (R$)</label>
              <input name="base_calculo" type="number" step="0.01" defaultValue={tributo.base_calculo ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Alíq. (%)</label>
              <input name="aliquota" type="number" step="0.0001" defaultValue={tributo.aliquota ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Calculado (R$)</label>
              <input name="valor_calculado" type="number" step="0.01" defaultValue={tributo.valor_calculado ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pago (R$)</label>
              <input name="valor_pago" type="number" step="0.01" defaultValue={tributo.valor_pago ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>DARF</label>
              <input name="numero_darf" defaultValue={tributo.numero_darf ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Dt. Pgto</label>
              <input type="date" name="data_pagamento" defaultValue={tributo.data_pagamento ?? ''} className={inputClass} />
            </div>
            <input type="hidden" name="descricao" value={tributo.descricao ?? ''} />
            <div className="col-span-6 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditando(false)} className="text-slate-400 hover:text-white text-xs transition">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                onClick={() => { if (!pending) setTimeout(() => setEditando(false), 300) }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition"
              >
                {pending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-white/[0.02] transition group">
      <td className="px-4 py-3">
        <span className="text-sm text-white font-medium">{nome}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-slate-300 text-sm font-mono">
          {tributo.base_calculo !== null ? formatBRL(tributo.base_calculo) : '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-slate-300 text-sm font-mono">
          {tributo.aliquota !== null ? `${tributo.aliquota.toFixed(2)}%` : '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-slate-300 text-sm font-mono">
          {formatBRL(tributo.valor_calculado)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {tributo.valor_pago !== null ? (
          <span className="inline-flex items-center gap-1 text-green-400 text-sm font-mono">
            <CheckCircle2 size={12} />
            {formatBRL(tributo.valor_pago)}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-yellow-400/70 text-xs">
            <Clock size={11} />
            Pendente
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-slate-400 hover:text-amber-400 transition"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          {!confirmando ? (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="text-slate-400 hover:text-red-400 transition"
              title="Excluir"
            >
              <X size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { excluirTributoAction(tributo.id, processoId); setConfirmando(false) }}
              className="text-red-400 hover:text-red-300 text-xs font-semibold transition"
            >
              Excluir?
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Component principal ───────────────────────────────────────────────────────

type Props = {
  processoId: string
  tipo: 'importacao' | 'exportacao'
  numeroDi: string | null
  canal: string | null
  dataRegistroDi: string | null
  dataDesembaraco: string | null
  tributos: TributoDi[]
}

export default function DesembaracoSection({
  processoId,
  tipo,
  numeroDi,
  canal,
  dataRegistroDi,
  dataDesembaraco,
  tributos,
}: Props) {
  const [editandoDI, setEditandoDI] = useState(false)
  const [adicionandoTributo, setAdicionandoTributo] = useState(false)

  const canalValido = (canal as CanalParametrizacao) ?? null
  const totalCalculado = tributos.reduce((s, t) => s + (t.valor_calculado ?? 0), 0)
  const totalPago = tributos.reduce((s, t) => s + (t.valor_pago ?? 0), 0)
  const todosPagos = tributos.length > 0 && tributos.every((t) => t.valor_pago !== null)

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">Desembaraço Aduaneiro</p>
        </div>
        <button
          type="button"
          onClick={() => setEditandoDI((v) => !v)}
          className="text-xs text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
        >
          <Pencil size={12} />
          {editandoDI ? 'Fechar' : 'Editar dados'}
        </button>
      </div>

      {/* Dados DI/Canal */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Canal badge */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Canal</p>
          {canalValido ? (
            <div className="space-y-0.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${CANAL_COLORS[canalValido]}`}>
                <span className={`w-2 h-2 rounded-full ${CANAL_BG[canalValido]}`} />
                {CANAL_LABELS[canalValido]}
              </span>
              <p className="text-slate-600 text-xs">{CANAL_DESCRICAO[canalValido]}</p>
            </div>
          ) : (
            <span className="text-slate-600 text-sm">Não parametrizado</span>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1.5">
            {tipo === 'importacao' ? 'Nº DI' : 'Nº DUE'}
          </p>
          <p className="text-white text-sm font-mono">{numeroDi || '—'}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1.5">Registro</p>
          <p className="text-white text-sm">{formatDate(dataRegistroDi)}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1.5">Desembaraço</p>
          {dataDesembaraco ? (
            <span className="inline-flex items-center gap-1.5 text-green-400 text-sm">
              <FileCheck size={13} />
              {formatDate(dataDesembaraco)}
            </span>
          ) : (
            <span className="text-slate-600 text-sm">Pendente</span>
          )}
        </div>
      </div>

      {/* Form editar DI */}
      {editandoDI && (
        <FormDadosDI
          processoId={processoId}
          numeroDi={numeroDi}
          canal={canal}
          dataRegistroDi={dataRegistroDi}
          dataDesembaraco={dataDesembaraco}
          onClose={() => setEditandoDI(false)}
        />
      )}

      {/* Divisor */}
      <div className="border-t border-white/5" />

      {/* Tributos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tributos</p>
          {!adicionandoTributo && (
            <button
              type="button"
              onClick={() => setAdicionandoTributo(true)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
            >
              <Plus size={13} />
              Adicionar tributo
            </button>
          )}
        </div>

        {adicionandoTributo && (
          <FormNovoTributo processoId={processoId} onClose={() => setAdicionandoTributo(false)} />
        )}

        {tributos.length > 0 ? (
          <div className="bg-black/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-2 text-xs text-slate-500 font-medium">Tributo</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">Base Cálc.</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">Alíq.</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">Calculado</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500 font-medium">Pago</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tributos.map((t) => (
                  <TributoRow key={t.id} tributo={t} processoId={processoId} />
                ))}
              </tbody>
            </table>

            {/* Totais */}
            <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between bg-black/20">
              <span className="text-xs text-slate-400">Total dos Tributos</span>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Calculado</p>
                  <p className="text-sm font-mono font-semibold text-white">{formatBRL(totalCalculado)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Pago</p>
                  <p className={`text-sm font-mono font-semibold ${todosPagos ? 'text-green-400' : 'text-yellow-400'}`}>
                    {formatBRL(totalPago)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !adicionandoTributo && (
            <p className="text-slate-600 text-sm text-center py-4">
              Nenhum tributo lançado. Clique em "Adicionar tributo" para registrar os impostos.
            </p>
          )
        )}
      </div>
    </div>
  )
}
