'use client'

import { useActionState, useState, useMemo } from 'react'
import { criarProcessoAction } from '../actions'
import Link from 'next/link'
import {
  ArrowLeft, Ship, Plane, ArrowDownToLine, ArrowUpFromLine,
  DollarSign, Package, Building2, FileText, Calculator, Info,
} from 'lucide-react'
import type { Cliente } from '@/lib/types/cliente'
import type { Fornecedor } from '@/lib/types/fornecedor'
import type { Armador } from '@/lib/types/armador'
import type { NcmCodigo } from '@/lib/types/ncm'
import { formatarNcm } from '@/lib/types/ncm'
import type { ProcessoTipo, ProcessoModal } from '@/lib/types/processo'
import { getTipoModalLabel } from '@/lib/types/processo'

const MOEDAS = ['USD', 'EUR', 'BRL', 'CNY', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD']

const INCOTERMS = [
  'EXW — Ex Works',
  'FCA — Free Carrier',
  'FAS — Free Alongside Ship',
  'FOB — Free On Board',
  'CFR — Cost and Freight',
  'CIF — Cost, Insurance and Freight',
  'CPT — Carriage Paid To',
  'CIP — Carriage and Insurance Paid To',
  'DAP — Delivered at Place',
  'DPU — Delivered at Place Unloaded',
  'DDP — Delivered Duty Paid',
]

const PORTOS_BR = [
  'Santos/SP', 'Paraná/PR', 'Rio de Janeiro/RJ', 'Itajaí/SC',
  'Suape/PE', 'Vitória/ES', 'Manaus/AM', 'Rio Grande/RS',
  'Salvador/BA', 'Navegantes/SC', 'São Francisco do Sul/SC',
]
const AEROPORTOS_BR = [
  'GRU — Guarulhos/SP', 'GIG — Galeão/RJ', 'VCP — Campinas/SP',
  'BSB — Brasília/DF', 'CNF — Confins/MG', 'POA — Porto Alegre/RS',
  'CWB — Curitiba/PR', 'SSA — Salvador/BA', 'FOR — Fortaleza/CE',
  'MAO — Manaus/AM',
]

const RECINTOS = [
  'Porto de Santos', 'Porto de Paraná', 'Porto do Rio de Janeiro',
  'Porto de Itajaí', 'EADI Santo André', 'EADI Campinas', 'EADI Guarulhos',
  'Porto Seco Curitiba', 'Porto Seco Foz do Iguaçu', 'Porto Seco Rio Grande',
  'Recinto Aeroporto GRU', 'Recinto Aeroporto GIG', 'Recinto Aeroporto VCP',
]

const inputClass = 'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'
const selectClass = `${inputClass} cursor-pointer`

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

function SectionHeader({ icon: Icon, title, color = 'amber' }: { icon: any; title: string; color?: string }) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    indigo: 'text-indigo-400',
    green: 'text-green-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
  }
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className={colorMap[color] ?? 'text-amber-400'} />
      <p className="text-sm font-semibold text-white">{title}</p>
    </div>
  )
}

export default function NovoProcessoForm({ clientes, fornecedores, armadores, ncms, tipoInicial, modalInicial }: Props) {
  const [state, action, pending] = useActionState(criarProcessoAction, null)
  const [tipo, setTipo] = useState<ProcessoTipo>(tipoInicial)
  const [modal, setModal] = useState<ProcessoModal>(modalInicial)

  const [valorFob, setValorFob] = useState('')
  const [valorFrete, setValorFrete] = useState('')
  const [valorSeguro, setValorSeguro] = useState('')
  const [seguroTipo, setSeguroTipo] = useState<'valor' | 'percentual'>('valor')
  const [freteCollect, setFreteCollect] = useState(false)

  const isImportacao = tipo === 'importacao'
  const isExportacao = tipo === 'exportacao'
  const isMaritimo = modal === 'maritimo'
  const isAereo = modal === 'aereo'

  const armadoresFiltrados = isMaritimo
    ? armadores.filter(a => a.modal === 'maritimo' || !a.modal)
    : isAereo
      ? armadores.filter(a => a.modal === 'aereo' || !a.modal)
      : armadores

  const resumoCIF = useMemo(() => {
    const fob = parseFloat(valorFob) || 0
    const frete = parseFloat(valorFrete) || 0
    const seguroRaw = parseFloat(valorSeguro) || 0
    const seguro = seguroTipo === 'percentual' ? (fob * seguroRaw / 100) : seguroRaw
    return { fob, frete, seguro, cif: fob + frete + seguro }
  }, [valorFob, valorFrete, valorSeguro, seguroTipo])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

        {/* 1. TIPO DE PROCESSO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <SectionHeader icon={isMaritimo ? Ship : Plane} title="Tipo de Processo" color={isImportacao ? 'cyan' : 'indigo'} />
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
                      : 'border-slate-200 dark:border-white/5 bg-black/20 hover:border-slate-200 dark:hover:border-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${ativo ? (q.color === 'cyan' ? 'bg-cyan-500/20' : 'bg-indigo-500/20') : 'bg-slate-900/5 dark:bg-white/5'}`}>
                    <Icon size={18} className={ativo ? (q.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400') : 'text-slate-500'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <TipoIcon size={12} className={ativo ? (q.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400') : 'text-slate-500'} />
                      <span className={`font-semibold text-sm ${ativo ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {getTipoModalLabel(q.tipo, q.modal)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {q.tipo === 'importacao' && q.modal === 'maritimo' && 'DI · BL · CE Mercante'}
                      {q.tipo === 'importacao' && q.modal === 'aereo'    && 'DI · AWB · RUC'}
                      {q.tipo === 'exportacao' && q.modal === 'maritimo' && 'DU-E · RE · BL'}
                      {q.tipo === 'exportacao' && q.modal === 'aereo'    && 'DU-E · RE · AWB'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="modal" value={modal} />
        </div>

        {/* 2. PARTES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <SectionHeader icon={Building2} title="Partes Envolvidas" color="amber" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-slate-600 text-xs mt-1">Sem clientes — <Link href="/dashboard/clientes/novo" className="text-amber-500 hover:text-amber-400">cadastrar</Link></p>
                </>
              )}
            </div>
            <div>
              <label className={labelClass}>CNPJ do {isImportacao ? 'Importador' : 'Exportador'}</label>
              <input name="cnpj_importador" placeholder="00.000.000/0000-00" maxLength={18} className={inputClass} />
            </div>
          </div>

          {isImportacao && (
            <div>
              <label className={labelClass}>Fornecedor / Exportador (exterior)</label>
              {fornecedores.length > 0 ? (
                <>
                  <input name="fornecedor" list="fornecedores-sugestoes" placeholder="Nome do fornecedor no exterior..." className={inputClass} autoComplete="off" />
                  <datalist id="fornecedores-sugestoes">
                    {fornecedores.map(f => <option key={f.id} value={f.razao_social} />)}
                  </datalist>
                </>
              ) : (
                <input name="fornecedor" placeholder="Nome do fornecedor no exterior" className={inputClass} />
              )}
            </div>
          )}
          {isExportacao && (
            <div>
              <label className={labelClass}>Comprador / Importador (exterior)</label>
              <input name="fornecedor" placeholder="Nome do comprador no exterior" className={inputClass} />
            </div>
          )}
        </div>

        {/* 3. MERCADORIA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <SectionHeader icon={Package} title="Mercadoria" color="amber" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Descrição da Mercadoria</label>
              <input name="mercadoria" placeholder="Ex: Smartphones, Têxteis, Máquinas..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>NCM</label>
              {ncms.length > 0 ? (
                <>
                  <input name="ncm" list="ncm-sugestoes" placeholder="Ex: 8517.12.10" className={`${inputClass} font-mono`} autoComplete="off" />
                  <datalist id="ncm-sugestoes">
                    {ncms.map(n => <option key={n.id} value={n.codigo}>{formatarNcm(n.codigo)} — {n.descricao}</option>)}
                  </datalist>
                </>
              ) : (
                <input name="ncm" placeholder="Ex: 85171210" className={`${inputClass} font-mono`} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nº Invoice / Fatura Comercial</label>
              <input name="numero_invoice" placeholder="Ex: INV-2026-001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Incoterm</label>
              <select name="incoterm" className={selectClass}>
                <option value="">Selecione o Incoterm...</option>
                {INCOTERMS.map(i => <option key={i} value={i.split(' — ')[0]}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 4. VALORES E CAMBIO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <SectionHeader icon={DollarSign} title="Valores e Câmbio" color="green" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Valor FOB</label>
              <div className="flex gap-2">
                <input
                  name="valor_fob"
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className={inputClass}
                  value={valorFob}
                  onChange={e => setValorFob(e.target.value)}
                />
                <select name="moeda" defaultValue="USD" className="w-28 px-3 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition shrink-0">
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Taxa de Câmbio (R$)</label>
              <input name="taxa_cambio" type="number" step="0.0001" min="0" placeholder="Ex: 5.0579" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Valor do Frete Internacional</label>
              <div className="flex gap-2">
                <input
                  name="valor_frete"
                  type="number" step="0.01" min="0" placeholder="0.00"
                  className={inputClass}
                  value={valorFrete}
                  onChange={e => setValorFrete(e.target.value)}
                />
                <select name="moeda_frete" defaultValue="USD" className="w-28 px-3 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition shrink-0">
                  {MOEDAS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Condição de Frete</label>
              <div className="flex gap-2 h-[42px]">
                <button type="button" onClick={() => setFreteCollect(false)}
                  className={`flex-1 rounded-xl border text-sm font-medium transition ${!freteCollect ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-white/20'}`}>
                  Prepaid
                </button>
                <button type="button" onClick={() => setFreteCollect(true)}
                  className={`flex-1 rounded-xl border text-sm font-medium transition ${freteCollect ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-white/20'}`}>
                  Collect
                </button>
                <input type="hidden" name="frete_collect" value={freteCollect ? 'true' : 'false'} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>
                Valor do Seguro {seguroTipo === 'percentual' ? '(% sobre FOB)' : '(valor fixo)'}
              </label>
              <div className="flex gap-2">
                <input
                  name="valor_seguro"
                  type="number" step="0.01" min="0"
                  placeholder={seguroTipo === 'percentual' ? 'Ex: 0.5 (%)' : '0.00'}
                  className={inputClass}
                  value={valorSeguro}
                  onChange={e => setValorSeguro(e.target.value)}
                />
                <div className="flex gap-1 shrink-0">
                  <button type="button" onClick={() => setSeguroTipo('valor')}
                    className={`px-3 rounded-xl border text-xs font-medium transition ${seguroTipo === 'valor' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-white/20'}`}>
                    R$
                  </button>
                  <button type="button" onClick={() => setSeguroTipo('percentual')}
                    className={`px-3 rounded-xl border text-xs font-medium transition ${seguroTipo === 'percentual' ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-white/20'}`}>
                    %
                  </button>
                </div>
                <input type="hidden" name="seguro_tipo" value={seguroTipo} />
              </div>
            </div>

            {(resumoCIF.fob > 0 || resumoCIF.frete > 0 || resumoCIF.seguro > 0) && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-400 font-semibold mb-2 flex items-center gap-1">
                  <Calculator size={12} />
                  Resumo CIF
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>FOB</span>
                    <span className="font-mono">{resumoCIF.fob.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>+ Frete</span>
                    <span className="font-mono">{resumoCIF.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>+ Seguro</span>
                    <span className="font-mono">{resumoCIF.seguro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-amber-500/20 pt-1">
                    <span>= CIF</span>
                    <span className="font-mono">{resumoCIF.cif.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5a. TRANSPORTE MARITIMO */}
        {isMaritimo && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <SectionHeader icon={Ship} title="Transporte Marítimo" color="cyan" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className={labelClass}>Nº BL (Bill of Lading)</label>
                <input name="numero_bl_awb" placeholder="Ex: MAEU123456789" className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>CE Mercante</label>
                <input name="ce_mercante" placeholder="Ex: 0312345678901" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Peso Bruto (kg)</label>
                <input name="peso_bruto" type="number" step="0.001" min="0" placeholder="Ex: 12500.000" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Tipo de Carga</label>
                <select name="container_tipo" className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="fcl">FCL — Container Cheio</option>
                  <option value="lcl">LCL — Carga Fracionada</option>
                  <option value="roro">RoRo — Roll-on/Roll-off</option>
                  <option value="granel">Granel</option>
                  <option value="projeto">Carga de Projeto</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Nº do Container</label>
                <input name="container_numero" placeholder="Ex: MSCU1234567-8" className={`${inputClass} font-mono`} />
              </div>
            </div>
          </div>
        )}

        {/* 5b. TRANSPORTE AEREO */}
        {isAereo && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <SectionHeader icon={Plane} title="Transporte Aéreo" color="cyan" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Companhia Aérea / Agente de Carga</label>
                <input name="companhia_aerea" placeholder="Ex: LATAM Cargo, Azul Cargo, DHL..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nº AWB (Air Waybill)</label>
                <input name="numero_bl_awb" placeholder="Ex: 957-12345678" className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>RUC</label>
                <input name="ruc" placeholder="Ex: 12345678901234" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Peso Bruto (kg)</label>
                <input name="peso_bruto" type="number" step="0.001" min="0" placeholder="Ex: 250.500" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Peso Taxado (kg)</label>
                <input name="peso_taxado" type="number" step="0.001" min="0" placeholder="Ex: 300.000" className={inputClass} />
              </div>
            </div>
          </div>
        )}

        {/* 6. ROTA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <SectionHeader icon={isMaritimo ? Ship : Plane} title="Rota" color="blue" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {isExportacao && isMaritimo && 'Porto de Embarque (Brasil)'}
                {isExportacao && isAereo && 'Aeroporto de Embarque (Brasil)'}
              </label>
              <input
                name="porto_embarque"
                list={isMaritimo && isExportacao ? 'portos-br-emb' : isAereo && isExportacao ? 'aeroportos-br-emb' : undefined}
                placeholder={isMaritimo ? 'Ex: Shanghai, Rotterdam...' : 'Ex: São Paulo/GRU...'}
                className={inputClass}
              />
              {isMaritimo && isExportacao && <datalist id="portos-br-emb">{PORTOS_BR.map(p => <option key={p} value={p} />)}</datalist>}
              {isAereo && isExportacao && <datalist id="aeroportos-br-emb">{AEROPORTOS_BR.map(a => <option key={a} value={a} />)}</datalist>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                {isImportacao && isMaritimo && 'Porto de Destino (Brasil)'}
                {isImportacao && isAereo && 'Aeroporto de Destino (Brasil)'}
                {isExportacao && isMaritimo && 'Porto de Destino (exterior)'}
                {isExportacao && isAereo && 'Aeroporto de Destino (exterior)'}
              </label>
              <input
                name="porto_destino"
                list={isImportacao ? (isMaritimo ? 'portos-br' : 'aeroportos-br') : undefined}
                placeholder={isImportacao && isMaritimo ? 'Ex: Santos/SP, Paraná/PR...' : isImportacao && isAereo ? 'Ex: GRU, VCP...' : 'Ex: Los Angeles, Hamburg...'}
                className={inputClass}
              />
              {isImportacao && isMaritimo && <datalist id="portos-br">{PORTOS_BR.map(p => <option key={p} value={p} />)}</datalist>}
              {isImportacao && isAereo && <datalist id="aeroportos-br">{AEROPORTOS_BR.map(a => <option key={a} value={a} />)}</datalist>}
            </div>
            <div>
              <label className={labelClass}>{isImportacao ? 'Previsão de Chegada' : 'Previsão de Embarque'}</label>
              <input type="date" name="previsao_chegada" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Transportadora (interna)</label>
              <input name="transportadora" placeholder="Ex: JSL, Localfrio, Brasanitas..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* 7a. DESEMBARACO - IMPORTACAO */}
        {isImportacao && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <SectionHeader icon={FileText} title="Desembaraço Aduaneiro" color="rose" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Despachante Aduaneiro</label>
                <input name="despachante" placeholder="Nome do despachante..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Recinto Aduaneiro</label>
                <input name="recinto" list="recintos-lista" placeholder="Ex: Porto de Santos, EADI..." className={inputClass} autoComplete="off" />
                <datalist id="recintos-lista">
                  {RECINTOS.map(r => <option key={r} value={r} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Nº DI / DUIMP</label>
                <input name="numero_di" placeholder="Ex: 26/1234567-8" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Data do Registro</label>
                <input name="data_registro_di" type="date" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Canal de Parametrização</label>
                <select name="canal_parametrizacao" className={selectClass}>
                  <option value="">Não parametrizado</option>
                  <option value="verde">🟢 Verde</option>
                  <option value="amarelo">🟡 Amarelo</option>
                  <option value="vermelho">🔴 Vermelho</option>
                  <option value="cinza">⚫ Cinza</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Documento de Despacho (LI, Anuência, Licença...)</label>
              <input name="documento_despacho" placeholder="Ex: LI nº 26/1234, Anuência MAPA..." className={inputClass} />
            </div>
          </div>
        )}

        {/* 7b. DOCUMENTACAO - EXPORTACAO */}
        {isExportacao && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <SectionHeader icon={FileText} title="Documentação de Exportação" color="indigo" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Despachante Aduaneiro</label>
                <input name="despachante" placeholder="Nome do despachante..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Recinto Aduaneiro</label>
                <input name="recinto" list="recintos-lista-exp" placeholder="Ex: Porto de Santos, Aeroporto GRU..." className={inputClass} autoComplete="off" />
                <datalist id="recintos-lista-exp">
                  {RECINTOS.map(r => <option key={r} value={r} />)}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nº DU-E</label>
                <input name="numero_due" placeholder="Ex: 26/1234567-8" className={`${inputClass} font-mono`} />
              </div>
              <div>
                <label className={labelClass}>Nº RE (Registro de Exportação)</label>
                <input name="numero_re" placeholder="Ex: 26BR000123456" className={`${inputClass} font-mono`} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Documento de Despacho (Drawback, Regime Especial...)</label>
              <input name="documento_despacho" placeholder="Ex: Drawback nº 12345, Regime Especial..." className={inputClass} />
            </div>
          </div>
        )}

        {/* 8. IMPOSTOS - IMPORTACAO */}
        {isImportacao && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <SectionHeader icon={Calculator} title="Impostos e Tributos" color="rose" />
            <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2.5 text-xs text-blue-300">
              <Info size={14} className="shrink-0 mt-0.5" />
              Preencha as alíquotas aplicáveis. Campos em branco serão ignorados no cálculo.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>II — Imposto de Importação (%)</label>
                <div className="relative">
                  <input name="ii_percentual" type="number" step="0.01" min="0" max="100" placeholder="Ex: 12.00" className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>IPI (%)</label>
                <div className="relative">
                  <input name="ipi_percentual" type="number" step="0.01" min="0" max="100" placeholder="Ex: 5.00" className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>PIS (%)</label>
                <div className="relative">
                  <input name="pis_percentual" type="number" step="0.01" min="0" max="100" placeholder="Ex: 2.10" className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>COFINS (%)</label>
                <div className="relative">
                  <input name="cofins_percentual" type="number" step="0.01" min="0" max="100" placeholder="Ex: 9.65" className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>ICMS (%)</label>
                <div className="relative">
                  <input name="icms_percentual" type="number" step="0.01" min="0" max="100" placeholder="Ex: 18.00" className={inputClass} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">%</span>
                </div>
              </div>
              {isMaritimo && (
                <div>
                  <label className={labelClass}>AFRMM (R$)</label>
                  <input name="afrmm_valor" type="number" step="0.01" min="0" placeholder="Valor em R$" className={inputClass} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. ITENS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <SectionHeader icon={Package} title="Itens / Produtos" color="amber" />
          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5 text-xs text-amber-300">
            <Info size={14} className="shrink-0 mt-0.5" />
            Liste os itens da carga. Um item por linha. Formato sugerido: NCM | Descrição | Qtd | Unidade | Valor Unit.
          </div>
          <textarea
            name="itens_descricao"
            rows={5}
            placeholder={"Ex:\n85171210 | Smartphone Samsung Galaxy A15 | 100 | UN | USD 150.00\n84713012 | Notebook Dell Inspiron 15 | 20 | UN | USD 800.00"}
            className={`${inputClass} resize-y font-mono text-xs leading-relaxed`}
          />
        </div>

        {/* 10. OBSERVACOES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <SectionHeader icon={Info} title="Observações" color="amber" />
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
