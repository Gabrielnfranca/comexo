'use client'

import { useActionState, useState, useCallback } from 'react'
import { DollarSign, Calculator, ChevronDown, ChevronUp, Pencil, Check, RefreshCw } from 'lucide-react'
import { salvarCambioAction, adicionarTributoAction } from '@/app/dashboard/processos/[id]/actions-desembaraco'

const inputClass =
  'w-full px-3 py-2 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'

type Props = {
  processoId: string
  moeda: string
  valorFob: number | null
  valorFrete: number | null
  valorSeguro: number | null
  taxaCambio: number | null
  isMaritimo: boolean
}

type TributoCalc = {
  tipo: string
  label: string
  base: number
  aliquota: number
  valor: number
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtMoeda(v: number | null, moeda: string) {
  if (v === null) return '—'
  return `${moeda} ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

export default function CambioCard({
  processoId, moeda, valorFob, valorFrete, valorSeguro, taxaCambio, isMaritimo,
}: Props) {
  const [editando, setEditando] = useState(!taxaCambio)
  const [calculadoraAberta, setCalculadoraAberta] = useState(false)
  const [state, action, pending] = useActionState(salvarCambioAction, null)
  const [_, addAction, addPending] = useActionState(adicionarTributoAction, null)
  const [buscandoPtax, setBuscandoPtax] = useState(false)
  const [ptaxInfo, setPtaxInfo] = useState<{ dataCotacao: string } | null>(null)

  // Alíquotas editáveis pelo usuário
  const [aliqII,     setAliqII]     = useState(0)
  const [aliqIPI,    setAliqIPI]    = useState(0)
  const [aliqPIS,    setAliqPIS]    = useState(2.1)
  const [aliqCOFINS, setAliqCOFINS] = useState(9.65)

  // Usar os valores salvos ou os inputs locais
  const [localFob,     setLocalFob]     = useState(valorFob ?? 0)
  const [localFrete,   setLocalFrete]   = useState(valorFrete ?? 0)
  const [localSeguro,  setLocalSeguro]  = useState(valorSeguro ?? 0)
  const [localCambio,  setLocalCambio]  = useState(taxaCambio ?? 0)

  async function buscarPtax() {
    setBuscandoPtax(true)
    try {
      const hoje = new Date().toISOString().slice(0, 10)
      const resp = await fetch(`/api/ptax?moeda=${moeda}&data=${hoje}`)
      const data = await resp.json()
      if (data.cotacaoVenda) {
        setLocalCambio(data.cotacaoVenda)
        setPtaxInfo({ dataCotacao: data.dataCotacao })
      }
    } catch { /* silencioso */ } finally {
      setBuscandoPtax(false)
    }
  }

  // CIF = (FOB + Frete + Seguro) × câmbio
  const cif    = (localFob + localFrete + localSeguro) * localCambio
  const fobBRL = localFob * localCambio
  const freteBRL = localFrete * localCambio

  // Cálculo em cascata
  const vII      = cif * (aliqII / 100)
  const baseIPI  = cif + vII
  const vIPI     = baseIPI * (aliqIPI / 100)
  const basePIS  = cif + vII + vIPI
  const vPIS     = basePIS * (aliqPIS / 100)
  const vCOFINS  = basePIS * (aliqCOFINS / 100)
  const vAFRMM   = isMaritimo ? freteBRL * 0.25 : 0
  const totalTributos = vII + vIPI + vPIS + vCOFINS + vAFRMM

  const tributos: TributoCalc[] = [
    { tipo: 'ii',      label: 'II — Imposto de Importação',    base: cif,    aliquota: aliqII,     valor: vII      },
    { tipo: 'ipi',     label: 'IPI — Imp. Prod. Industrializ.',base: baseIPI,aliquota: aliqIPI,    valor: vIPI     },
    { tipo: 'pis',     label: 'PIS/PASEP',                     base: basePIS,aliquota: aliqPIS,    valor: vPIS     },
    { tipo: 'cofins',  label: 'COFINS',                        base: basePIS,aliquota: aliqCOFINS, valor: vCOFINS  },
    ...(isMaritimo ? [{ tipo: 'afrmm', label: 'AFRMM', base: freteBRL, aliquota: 25, valor: vAFRMM }] : []),
  ]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Câmbio & Valor CIF</p>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition"
        >
          <Pencil size={12} />
          {editando ? 'Fechar' : 'Editar'}
        </button>
      </div>

      {/* Formulário de câmbio */}
      {editando && (
        <form action={action} className="space-y-3 pb-3 border-b border-slate-100 dark:border-white/5">
          <input type="hidden" name="processo_id" value={processoId} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Câmbio ({moeda}/BRL)</label>
              <div className="flex gap-1.5">
                <input
                  name="taxa_cambio" type="number" step="0.000001" min="0"
                  value={localCambio || ''}
                  onChange={e => setLocalCambio(parseFloat(e.target.value) || 0)}
                  placeholder="5.750000"
                  className={inputClass}
                />
                {moeda !== 'BRL' && (
                  <button
                    type="button"
                    onClick={buscarPtax}
                    disabled={buscandoPtax}
                    title="Buscar PTAX do Banco Central"
                    className="flex items-center gap-1 px-2.5 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition text-xs whitespace-nowrap disabled:opacity-60"
                  >
                    <RefreshCw size={12} className={buscandoPtax ? 'animate-spin' : ''} />
                    PTAX
                  </button>
                )}
              </div>
              {ptaxInfo && (
                <p className="text-[10px] text-amber-400 mt-1">
                  PTAX {moeda} de {ptaxInfo.dataCotacao.split('-').reverse().join('/')} — cotação venda
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">FOB ({moeda})</label>
              <input
                name="valor_fob_display" type="number" step="0.01" min="0" readOnly
                value={localFob || ''} placeholder="—"
                className={inputClass + ' opacity-60 cursor-not-allowed'}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Frete ({moeda})</label>
              <input
                name="valor_frete" type="number" step="0.01" min="0"
                value={localFrete || ''}
                onChange={e => setLocalFrete(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Seguro ({moeda})</label>
              <input
                name="valor_seguro" type="number" step="0.01" min="0"
                value={localSeguro || ''}
                onChange={e => setLocalSeguro(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={inputClass}
              />
            </div>
          </div>
          {state?.erro && <p className="text-xs text-red-500">{state.erro}</p>}
          <button
            type="submit" disabled={pending}
            onClick={() => { if (!pending) setTimeout(() => setEditando(false), 300) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-medium transition disabled:opacity-60"
          >
            <Check size={13} />
            {pending ? 'Salvando...' : 'Salvar câmbio'}
          </button>
        </form>
      )}

      {/* Resumo CIF */}
      {localCambio > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: `FOB em BRL`,    value: fmtBRL(fobBRL) },
            { label: `Frete em BRL`,  value: fmtBRL(freteBRL) },
            { label: `Seguro em BRL`, value: fmtBRL(localSeguro * localCambio) },
            { label: `CIF Total BRL`, value: fmtBRL(cif), destaque: true },
          ].map(({ label, value, destaque }) => (
            <div key={label} className={`rounded-lg p-3 ${destaque ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-50 dark:bg-white/5'}`}>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
              <p className={`text-sm font-semibold ${destaque ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Calculadora de tributos */}
      {localCambio > 0 && cif > 0 && (
        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          <button
            type="button"
            onClick={() => setCalculadoraAberta(!calculadoraAberta)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-amber-400 transition"
          >
            <Calculator size={15} className="text-amber-400" />
            Calculadora de Tributos
            {calculadoraAberta ? <ChevronUp size={13} className="opacity-50" /> : <ChevronDown size={13} className="opacity-50" />}
          </button>

          {calculadoraAberta && (
            <div className="mt-4 space-y-4">
              {/* Alíquotas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">II (%)</label>
                  <input type="number" step="0.01" min="0" value={aliqII}
                    onChange={e => setAliqII(parseFloat(e.target.value) || 0)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">IPI (%)</label>
                  <input type="number" step="0.01" min="0" value={aliqIPI}
                    onChange={e => setAliqIPI(parseFloat(e.target.value) || 0)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">PIS (%)</label>
                  <input type="number" step="0.0001" min="0" value={aliqPIS}
                    onChange={e => setAliqPIS(parseFloat(e.target.value) || 0)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">COFINS (%)</label>
                  <input type="number" step="0.0001" min="0" value={aliqCOFINS}
                    onChange={e => setAliqCOFINS(parseFloat(e.target.value) || 0)}
                    className={inputClass} />
                </div>
              </div>

              {/* Tabela de resultados */}
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 text-xs text-slate-500 dark:text-slate-400">
                      <th className="text-left px-3 py-2">Tributo</th>
                      <th className="text-right px-3 py-2">Base (R$)</th>
                      <th className="text-right px-3 py-2">Alíq.</th>
                      <th className="text-right px-3 py-2">Valor (R$)</th>
                      <th className="px-2 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {tributos.map(t => (
                      <tr key={t.tipo} className="hover:bg-slate-50 dark:hover:bg-white/3">
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{t.label}</td>
                        <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 text-xs">{fmtBRL(t.base)}</td>
                        <td className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 text-xs">{t.aliquota.toFixed(2)}%</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-900 dark:text-white">{fmtBRL(t.valor)}</td>
                        <td className="px-2 py-2">
                          <form action={addAction}>
                            <input type="hidden" name="processo_id" value={processoId} />
                            <input type="hidden" name="tipo_tributo" value={t.tipo} />
                            <input type="hidden" name="base_calculo" value={t.base.toFixed(2)} />
                            <input type="hidden" name="aliquota" value={t.aliquota.toFixed(4)} />
                            <input type="hidden" name="valor_calculado" value={t.valor.toFixed(2)} />
                            <button type="submit" disabled={addPending}
                              className="text-xs text-amber-400 hover:text-amber-300 transition disabled:opacity-50 px-1"
                              title="Lançar este tributo">
                              + lançar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 dark:bg-white/5 font-semibold">
                      <td colSpan={3} className="px-3 py-2 text-slate-700 dark:text-slate-300 text-xs">Total de Tributos</td>
                      <td className="px-3 py-2 text-right text-amber-500">{fmtBRL(totalTributos)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="text-xs text-slate-400">
                ⚠️ Clique em <strong>+ lançar</strong> para registrar cada tributo na seção de Desembaraço.
                Alíquotas de II e IPI variam por NCM — consulte a TEC.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
