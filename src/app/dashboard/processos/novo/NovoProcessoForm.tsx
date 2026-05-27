'use client'

import { useActionState, useState } from 'react'
import { criarProcessoAction } from '../actions'
import Link from 'next/link'
import { ArrowLeft, Ship, Plane, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import type { Cliente } from '@/lib/types/cliente'
import type { Fornecedor } from '@/lib/types/fornecedor'
import type { Armador } from '@/lib/types/armador'
import type { NcmCodigo } from '@/lib/types/ncm'
import { formatarNcm } from '@/lib/types/ncm'
import type { ProcessoTipo, ProcessoModal } from '@/lib/types/processo'
import { getTipoModalLabel } from '@/lib/types/processo'

const MOEDAS = ['USD', 'EUR', 'BRL', 'CNY', 'GBP', 'JPY']

const PORTOS_BR = ['Santos/SP', 'Paranaguá/PR', 'Rio de Janeiro/RJ', 'Itajaí/SC', 'Suape/PE', 'Vitória/ES', 'Manaus/AM', 'Rio Grande/RS', 'Salvador/BA', 'Navegantes/SC']
const AEROPORTOS_BR = ['GRU — Guarulhos/SP', 'GIG — Galeão/RJ', 'VCP — Campinas/SP', 'BSB — Brasília/DF', 'CNF — Confins/MG', 'POA — Porto Alegre/RS', 'CWB — Curitiba/PR', 'SSA — Salvador/BA', 'FOR — Fortaleza/CE', 'MAO — Manaus/AM']

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

type Props = {
  clientes: Pick<Cliente, 'id' | 'razao_social'>[]
  fornecedores: Pick<Fornecedor, 'id' | 'razao_social' | 'pais'>[]
  armadores: Pick<Armador, 'id' | 'nome' | 'modal'>[]
  ncms: Pick<NcmCodigo, 'id' | 'codigo' | 'descricao'>[]
  tipoInicial: ProcessoTipo
  modalInicial: ProcessoModal
}

const QUADRANTES: { tipo: ProcessoTipo; modal: ProcessoModal; icon: any; color: string }[] = [
  { tipo: 'importacao', modal: 'maritimo', icon: Ship,  color: 'cyan' },
  { tipo: 'importacao', modal: 'aereo',    icon: Plane, color: 'cyan' },
  { tipo: 'exportacao', modal: 'maritimo', icon: Ship,  color: 'indigo' },
  { tipo: 'exportacao', modal: 'aereo',    icon: Plane, color: 'indigo' },
]

export default function NovoProcessoForm({ clientes, fornecedores, armadores, ncms, tipoInicial, modalInicial }: Props) {
  const [state, action, pending] = useActionState(criarProcessoAction, null)
  const [tipo, setTipo] = useState<ProcessoTipo>(tipoInicial)
  const [modal, setModal] = useState<ProcessoModal>(modalInicial)

  const isImportacao = tipo === 'importacao'
  const isExportacao = tipo === 'exportacao'
  const isMaritimo = modal === 'maritimo'
  const isAereo = modal === 'aereo'

  const armadoresFiltrados = isMaritimo
    ? armadores.filter(a => a.modal === 'maritimo' || !a.modal)
    : isAereo
      ? armadores.filter(a => a.modal === 'aereo' || !a.modal)
      : armadores

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/processos" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-white text-sm mb-4 transition">
          <ArrowLeft size={16} />
          Voltar para Processos
        </Link>
        <h1 className="text-xl font-bold text-white">Novo Processo</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Preencha os dados do processo de comércio exterior</p>
      </div>

      <form action={action} className="space-y-5">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{state.error}</div>
        )}

        {/* Seletor tipo + modal — 4 quadrantes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <p className="text-sm font-semibold text-white mb-4">Tipo de Processo</p>
          <div className="grid grid-cols-2 gap-3">
            {QUADRANTES.map(q => {
              const ativo = tipo === q.tipo && modal === q.modal
              const Icon = q.icon
              const TipoIcon = q.tipo === 'importacao' ? ArrowDownToLine : ArrowUpFromLine
              return (
                <button
                  key={`${q.tipo}-${q.modal}`}
                  type="button"
                  onClick={() => { setTipo(q.tipo); setModal(q.modal) }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    ativo
                      ? q.color === 'cyan'
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-indigo-500/50 bg-indigo-500/10'
                      : 'border-slate-200 dark:border-white/5 bg-black/20 hover:border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${ativo ? (q.color === 'cyan' ? 'bg-cyan-500/20' : 'bg-indigo-500/20') : 'bg-slate-900/5 dark:bg-white/5'}`}>
                    <Icon size={18} className={ativo ? (q.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400') : 'text-slate-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <TipoIcon size={12} className={ativo ? (q.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400') : 'text-slate-500'} />
                      <span className={`font-semibold text-sm ${ativo ? 'text-white' : 'text-slate-500 dark:text-slate-500 dark:text-slate-400'}`}>
                        {getTipoModalLabel(q.tipo, q.modal)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {q.tipo === 'importacao' && q.modal === 'maritimo' && 'DI Â· BL Â· Container'}
                      {q.tipo === 'importacao' && q.modal === 'aereo' && 'DI Â· AWB Â· Peso'}
                      {q.tipo === 'exportacao' && q.modal === 'maritimo' && 'DU-E Â· RE Â· BL'}
                      {q.tipo === 'exportacao' && q.modal === 'aereo' && 'DU-E Â· RE Â· AWB'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="modal" value={modal} />
        </div>

        {/* Dados principais */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Dados do Processo</p>

          <div>
            <label className={labelClass}>{isImportacao ? 'Importador (cliente) *' : 'Exportador (cliente) *'}</label>
            {clientes.length > 0 ? (
              <>
                <input name="cliente" required list="clientes-sugestoes" placeholder="Digite ou selecione..." className={inputClass} autoComplete="off" />
                <datalist id="clientes-sugestoes">
                  {clientes.map(c => <option key={c.id} value={c.razao_social} />)}
                </datalist>
              </>
            ) : (
              <>
                <input name="cliente" required placeholder="Nome da empresa" className={inputClass} />
                <p className="text-slate-600 text-xs mt-1">Nenhum cliente cadastrado — <Link href="/dashboard/clientes/novo" className="text-amber-500 hover:text-amber-400">cadastrar</Link></p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mercadoria / Produto</label>
              <input name="mercadoria" placeholder="Ex: Eletrônicos, Têxteis..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NCM</label>
              {ncms.length > 0 ? (
                <>
                  <input name="ncm" list="ncm-sugestoes" placeholder="Ex: 85171210" className={`${inputClass} font-mono`} autoComplete="off" />
                  <datalist id="ncm-sugestoes">
                    {ncms.map(n => <option key={n.id} value={n.codigo}>{formatarNcm(n.codigo)} — {n.descricao}</option>)}
                  </datalist>
                </>
              ) : (
                <input name="ncm" placeholder="Ex: 85171210" className={`${inputClass} font-mono`} />
              )}
            </div>
          </div>

          {isImportacao && (
            <div>
              <label className={labelClass}>Fornecedor / Exportador (exterior)</label>
              {fornecedores.length > 0 ? (
                <>
                  <input name="fornecedor" list="fornecedores-sugestoes" placeholder="Nome do fornecedor..." className={inputClass} autoComplete="off" />
                  <datalist id="fornecedores-sugestoes">
                    {fornecedores.map(f => <option key={f.id} value={f.razao_social} />)}
                  </datalist>
                </>
              ) : (
                <input name="fornecedor" placeholder="Nome do fornecedor no exterior" className={inputClass} />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>NÂº Invoice</label>
              <input name="numero_invoice" placeholder="Ex: INV-2026-001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Valor FOB</label>
              <div className="flex gap-2">
                <input name="valor_fob" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
                <select name="moeda" defaultValue="USD" className="w-24 px-3 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition shrink-0">
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Transporte — Marítimo */}
        {isMaritimo && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Transporte Marítimo</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Armador</label>
                {armadoresFiltrados.length > 0 ? (
                  <>
                    <input name="armador" list="armadores-sugestoes" placeholder="Ex: Maersk, MSC, CMA CGM..." className={inputClass} autoComplete="off" />
                    <datalist id="armadores-sugestoes">
                      {armadoresFiltrados.map(a => <option key={a.id} value={a.nome} />)}
                    </datalist>
                  </>
                ) : (
                  <input name="armador" placeholder="Nome do armador" className={inputClass} />
                )}
              </div>
              <div>
                <label className={labelClass}>NÂº BL (Bill of Lading)</label>
                <input name="numero_bl_awb" placeholder="Ex: MAEU123456789" className={`${inputClass} font-mono`} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Tipo de Container</label>
                <select name="container_tipo" className={inputClass}>
                  <option value="">Selecione...</option>
                  <option value="fcl">FCL — Container Cheio</option>
                  <option value="lcl">LCL — Carga Fracionada</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>NÂº do Container</label>
                <input name="container_numero" placeholder="Ex: MSCU1234567-8" className={`${inputClass} font-mono`} />
              </div>
            </div>
          </div>
        )}

        {/* Transporte — Aéreo */}
        {isAereo && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Transporte Aéreo</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Companhia Aérea</label>
                <input name="companhia_aerea" placeholder="Ex: LATAM Cargo, Azul Cargo..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>NÂº AWB (Air Waybill)</label>
                <input name="numero_bl_awb" placeholder="Ex: 957-12345678" className={`${inputClass} font-mono`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Peso Bruto (kg)</label>
              <input name="peso_bruto" type="number" step="0.001" min="0" placeholder="Ex: 250.500" className={inputClass} />
            </div>
          </div>
        )}

        {/* Rota */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Rota</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isImportacao ? 'País de Origem' : 'País de Destino'}</label>
              <input
                name={isImportacao ? 'pais_origem' : 'pais_destino'}
                placeholder="Ex: China, EUA, Alemanha..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {isImportacao && isMaritimo && 'Porto de Embarque (exterior)'}
                {isImportacao && isAereo && 'Aeroporto de Origem (exterior)'}
                {isExportacao && isMaritimo && 'Porto de Embarque (BR)'}
                {isExportacao && isAereo && 'Aeroporto de Embarque (BR)'}
              </label>
              <input
                name="porto_embarque"
                list={isAereo && isExportacao ? 'aeroportos-br' : undefined}
                placeholder={isMaritimo ? 'Ex: Shanghai, Rotterdam...' : 'Ex: São Paulo/GRU...'}
                className={inputClass}
              />
              {isAereo && isExportacao && (
                <datalist id="aeroportos-br">
                  {AEROPORTOS_BR.map(a => <option key={a} value={a} />)}
                </datalist>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                {isImportacao && isMaritimo && 'Porto de Destino (BR)'}
                {isImportacao && isAereo && 'Aeroporto de Destino (BR)'}
                {isExportacao && isMaritimo && 'Porto de Destino (exterior)'}
                {isExportacao && isAereo && 'Aeroporto de Destino (exterior)'}
              </label>
              <input
                name="porto_destino"
                list={isImportacao ? (isMaritimo ? 'portos-br' : 'aeroportos-br') : undefined}
                placeholder={isImportacao && isMaritimo ? 'Ex: Santos/SP, Paranaguá/PR...' : isImportacao && isAereo ? 'Ex: GRU, VCP...' : 'Ex: Los Angeles, Hamburg...'}
                className={inputClass}
              />
              {isImportacao && isMaritimo && (
                <datalist id="portos-br">
                  {PORTOS_BR.map(p => <option key={p} value={p} />)}
                </datalist>
              )}
              {isImportacao && isAereo && (
                <datalist id="aeroportos-br">
                  {AEROPORTOS_BR.map(a => <option key={a} value={a} />)}
                </datalist>
              )}
            </div>
            <div>
              <label className={labelClass}>
                {isImportacao ? 'Previsão de Chegada' : 'Previsão de Embarque'}
              </label>
              <input type="date" name="previsao_chegada" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Dados específicos de Importação */}
        {isImportacao && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Desembaraço Aduaneiro</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>NÂº DI / DUIMP</label>
                <input name="numero_di" placeholder="Ex: 26/1234567-8" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Data do Registro</label>
                <input name="data_registro_di" type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Canal de Parametrização</label>
                <select name="canal_parametrizacao" className={inputClass}>
                  <option value="">Não parametrizado</option>
                  <option value="verde">ðŸŸ¢ Verde</option>
                  <option value="amarelo">ðŸŸ¡ Amarelo</option>
                  <option value="vermelho">ðŸ”´ Vermelho</option>
                  <option value="cinza">âš« Cinza</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Dados específicos de Exportação */}
        {isExportacao && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Documentação de Exportação</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>NÂº DU-E</label>
                <input name="numero_due" placeholder="Ex: 26/1234567-8" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>NÂº RE (Registro de Exportação)</label>
                <input name="numero_re" placeholder="Ex: 26BR000123456" className={`${inputClass} font-mono`} />
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <label className={labelClass}>Observações</label>
          <textarea name="observacoes" rows={3} placeholder="Informações adicionais sobre o processo..." className={`${inputClass} resize-none`} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
          >
            {pending ? 'Criando...' : `Criar ${getTipoModalLabel(tipo, modal)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
