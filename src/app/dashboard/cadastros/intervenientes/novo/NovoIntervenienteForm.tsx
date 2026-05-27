'use client'

import { useActionState, useState } from 'react'
import { criarIntervenienteAction } from '../actions'
import {
  INTERVENIENTE_TIPOS_LIST,
  INTERVENIENTE_TIPO_LABELS,
  type IntervenienteTipo,
} from '@/lib/types/interveniente'
import { PAISES_COMUNS } from '@/lib/types/produto'
import { ESTADOS_BR } from '@/lib/types/cliente'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

export default function NovoIntervenienteForm() {
  const [state, action, pending] = useActionState(criarIntervenienteAction, null)
  const [tipo, setTipo] = useState<IntervenienteTipo>('agente_carga')
  const [pais, setPais] = useState('BR')

  const isEstrangeiro = pais !== 'BR'
  const isRecinto = tipo === 'recinto_alfandegado'
  const isAgenteCarga = tipo === 'agente_carga'

  return (
    <form action={action} className="space-y-5">
      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      {/* Tipo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-3">
        <p className="text-sm font-semibold text-white">Tipo de Interveniente</p>
        <div className="grid grid-cols-2 gap-2">
          {INTERVENIENTE_TIPOS_LIST.map(t => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              <div className={`px-4 py-3 rounded-xl border text-sm font-medium transition text-center
                ${tipo === t
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-black/20 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:border-white/10'
                }`}>
                {INTERVENIENTE_TIPO_LABELS[t]}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Dados */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Dados do Interveniente</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>País</label>
            <select
              name="pais"
              value={pais}
              onChange={e => setPais(e.target.value)}
              className={inputClass}
            >
              <option value="BR">Brasil</option>
              {PAISES_COMUNS.filter(p => p.codigo !== 'BR').map(p => (
                <option key={p.codigo} value={p.codigo}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{isEstrangeiro ? 'Tax ID / Identificação Fiscal' : 'CNPJ'}</label>
            <input
              name={isEstrangeiro ? 'tax_id_exterior' : 'cnpj'}
              placeholder={isEstrangeiro ? 'Tax ID no país de origem' : '00.000.000/0001-00'}
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Razão Social *</label>
          <input name="razao_social" required placeholder="Nome completo da empresa" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome Fantasia</label>
            <input name="nome_fantasia" placeholder="Nome comercial" className={inputClass} />
          </div>
          {isRecinto && (
            <div>
              <label className={labelClass}>Código do Recinto (RFB)</label>
              <input name="codigo_recinto" placeholder="Ex: 0831600" className={`${inputClass} font-mono`} />
            </div>
          )}
          {isAgenteCarga && (
            <div>
              <label className={labelClass}>NIRE / Reg. ANAC (Agente)</label>
              <input name="nire" placeholder="Ex: 12345678" className={`${inputClass} font-mono`} />
            </div>
          )}
        </div>
      </div>

      {/* Contato */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Contato</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nome do Contato</label>
            <input name="contato_nome" placeholder="Responsável" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input name="telefone" placeholder="(00) 00000-0000" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input name="email" type="email" placeholder="contato@empresa.com" className={inputClass} />
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Endereço</p>
        <div>
          <label className={labelClass}>Endereço</label>
          <input name="endereco" placeholder="Rua, número, bairro" className={inputClass} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className={labelClass}>Cidade</label>
            <input name="cidade" placeholder="São Paulo" className={inputClass} />
          </div>
          {!isEstrangeiro ? (
            <>
              <div>
                <label className={labelClass}>UF</label>
                <select name="estado" className={inputClass}>
                  <option value="">—</option>
                  {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>CEP</label>
                <input name="cep" placeholder="00000-000" className={`${inputClass} font-mono`} />
              </div>
            </>
          ) : (
            <div className="col-span-2">
              <label className={labelClass}>Estado / Província</label>
              <input name="estado" placeholder="State / Province" className={inputClass} />
            </div>
          )}
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <label className={labelClass}>Observações</label>
        <textarea name="observacoes" rows={2} className={inputClass + ' resize-none'} />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Salvar Interveniente'}
        </button>
      </div>
    </form>
  )
}
