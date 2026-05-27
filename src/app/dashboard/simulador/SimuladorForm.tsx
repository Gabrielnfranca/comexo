'use client'

import { useState, useCallback } from 'react'
import { Calculator, Save, RotateCcw } from 'lucide-react'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

interface Aliquotas {
  ii: string
  ipi: string
  pis: string
  cofins: string
  icms: string
}

interface Resultado {
  valorAduaneiroBRL: number
  baseII: number
  ii: number
  baseIPI: number
  ipi: number
  pisCofinsBase: number
  pis: number
  cofins: number
  baseICMS: number
  icms: number
  afrmm: number
  taxaSiscomex: number
  totalTributos: number
  custoTotal: number
}

const ESTADOS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
  'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
  'RO','RR','RS','SC','SE','SP','TO',
]

const ICMS_POR_UF: Record<string, number> = {
  SP: 18, RJ: 20, MG: 18, RS: 17, PR: 12, SC: 17,
  BA: 19, PE: 18, CE: 18, GO: 17, DF: 18, ES: 17,
  AM: 20, PA: 17, MT: 17, MS: 17, MA: 20, PB: 18,
  AL: 19, SE: 18, PI: 21, RN: 18, AC: 17, AP: 18,
  RO: 17, RR: 17, TO: 20,
}

export default function SimuladorForm() {
  const [modalidade, setModalidade] = useState<'maritimo' | 'aereo' | 'rodoviario'>('maritimo')
  const [uf, setUF] = useState('SP')
  const [aliquotas, setAliquotas] = useState<Aliquotas>({
    ii: '', ipi: '', pis: '2.10', cofins: '9.65', icms: String(ICMS_POR_UF['SP'] ?? 18),
  })
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [salvando, setSalvando] = useState(false)

  const setAliq = (campo: keyof Aliquotas, val: string) => {
    setAliquotas(prev => ({ ...prev, [campo]: val }))
  }

  const handleUFChange = (novaUF: string) => {
    setUF(novaUF)
    const icmsUF = ICMS_POR_UF[novaUF]
    if (icmsUF !== undefined) {
      setAliquotas(prev => ({ ...prev, icms: String(icmsUF) }))
    }
  }

  const calcular = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const n = (k: string) => parseFloat(fd.get(k) as string) || 0

    const valorUSD = n('valor_usd')
    const frete = n('frete_usd')
    const seguro = n('seguro_usd')
    const cambio = n('taxa_cambio')

    const aii = n('ii') / 100
    const aipi = n('ipi') / 100
    const apis = n('pis') / 100
    const acofins = n('cofins') / 100
    const aicms = n('icms') / 100

    // Base de cálculo aduaneiro = CIF em BRL
    const baseII = (valorUSD + frete + seguro) * cambio
    const valorAduaneiroBRL = baseII

    const ii = baseII * aii
    const baseIPI = baseII + ii
    const ipi = baseIPI * aipi
    const pisCofinsBase = baseII
    const pis = pisCofinsBase * apis
    const cofins = pisCofinsBase * acofins

    // ICMS calculado por dentro: ICMS = (base + II + IPI + PIS + COFINS) / (1 - aicms) * aicms
    const baseICMSsemICMS = baseII + ii + ipi + pis + cofins
    const baseICMS = baseICMSsemICMS / (1 - aicms)
    const icms = baseICMS * aicms

    const afrmm = modalidade === 'maritimo' ? frete * cambio * 0.25 : 0
    const taxaSiscomex = 215

    const totalTributos = ii + ipi + pis + cofins + icms + afrmm + taxaSiscomex
    const custoTotal = valorAduaneiroBRL + totalTributos

    setResultado({
      valorAduaneiroBRL,
      baseII,
      ii,
      baseIPI,
      ipi,
      pisCofinsBase,
      pis,
      cofins,
      baseICMS,
      icms,
      afrmm,
      taxaSiscomex,
      totalTributos,
      custoTotal,
    })
  }, [modalidade])

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const pct = (tributo: number, base: number) =>
    base > 0 ? ((tributo / base) * 100).toFixed(1) + '%' : '—'

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Form */}
      <form onSubmit={calcular} className="col-span-3 space-y-5">
        {/* Valores */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Valores da Operação</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Valor da Mercadoria (USD) *</label>
              <input required name="valor_usd" type="number" step="0.01" min="0" placeholder="Ex: 10000.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Taxa de Câmbio (R$/USD) *</label>
              <input required name="taxa_cambio" type="number" step="0.0001" min="0" placeholder="Ex: 5.15" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Frete Internacional (USD)</label>
              <input name="frete_usd" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Seguro Internacional (USD)</label>
              <input name="seguro_usd" type="number" step="0.01" min="0" defaultValue="0" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Modalidade de Transporte</label>
            <div className="flex gap-3">
              {(['maritimo', 'aereo', 'rodoviario'] as const).map(m => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setModalidade(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                    modalidade === m
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-black/30 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-white/20'
                  }`}
                >
                  {m === 'maritimo' ? 'Marítimo' : m === 'aereo' ? 'Aéreo' : 'Rodoviário'}
                </button>
              ))}
            </div>
            {modalidade === 'maritimo' && (
              <p className="text-xs text-amber-400/70 mt-1.5">AFRMM de 25% sobre frete marítimo será incluído</p>
            )}
          </div>
        </div>

        {/* Alíquotas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Alíquotas (%)</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>II — Imposto de Importação</label>
              <input required name="ii" type="number" step="0.01" min="0" max="100" value={aliquotas.ii} onChange={e => setAliq('ii', e.target.value)} placeholder="Ex: 14" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>IPI</label>
              <input required name="ipi" type="number" step="0.01" min="0" max="100" value={aliquotas.ipi} onChange={e => setAliq('ipi', e.target.value)} placeholder="Ex: 5" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PIS</label>
              <input name="pis" type="number" step="0.01" min="0" max="100" value={aliquotas.pis} onChange={e => setAliq('pis', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>COFINS</label>
              <input name="cofins" type="number" step="0.01" min="0" max="100" value={aliquotas.cofins} onChange={e => setAliq('cofins', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                ICMS — Estado destino
                <span className="ml-2 text-amber-400 font-semibold">{uf}</span>
              </label>
              <input name="icms" type="number" step="0.01" min="0" max="100" value={aliquotas.icms} onChange={e => setAliq('icms', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>UF Destino</label>
              <select value={uf} onChange={e => handleUFChange(e.target.value)} className={inputClass}>
                {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500">Taxa Siscomex: R$ 215,00 (fixo)</p>
        </div>

        {/* Identificação opcional */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-white">Identificação (opcional)</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>NCM</label>
              <input name="ncm_codigo" placeholder="Ex: 85171210" maxLength={10} className={`${inputClass} font-mono`} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Descrição da Mercadoria</label>
              <input name="descricao_mercadoria" placeholder="Ex: Smartphone..." className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition"
          >
            <Calculator size={16} />
            Calcular
          </button>
          <button
            type="reset"
            onClick={() => setResultado(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl border border-slate-200 dark:border-white/10 transition"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
        </div>
      </form>

      {/* Resultado */}
      <div className="col-span-2">
        {!resultado ? (
          <div className="sticky top-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-8 text-center">
            <Calculator size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Preencha os valores e clique em Calcular</p>
          </div>
        ) : (
          <div className="sticky top-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-semibold text-white">Resultado da Simulação</p>

            {/* Base */}
            <div className="bg-black/30 rounded-xl px-4 py-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Valor Aduaneiro (CIF BRL)</span>
                <span className="text-white font-mono">{fmt(resultado.valorAduaneiroBRL)}</span>
              </div>
            </div>

            {/* Tributos */}
            <div className="space-y-2">
              {[
                { label: 'II', valor: resultado.ii, base: resultado.baseII },
                { label: 'IPI', valor: resultado.ipi, base: resultado.baseIPI },
                { label: 'PIS', valor: resultado.pis, base: resultado.pisCofinsBase },
                { label: 'COFINS', valor: resultado.cofins, base: resultado.pisCofinsBase },
                { label: 'ICMS', valor: resultado.icms, base: resultado.baseICMS },
                ...(resultado.afrmm > 0 ? [{ label: 'AFRMM', valor: resultado.afrmm, base: 0 }] : []),
                { label: 'Taxa Siscomex', valor: resultado.taxaSiscomex, base: 0 },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 w-16">{row.label}</span>
                    {row.base > 0 && (
                      <span className="text-slate-600 text-[10px]">{pct(row.valor, row.base)}</span>
                    )}
                  </div>
                  <span className="text-slate-300 font-mono">{fmt(row.valor)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total Tributos</span>
                <span className="text-amber-400 font-semibold font-mono">{fmt(resultado.totalTributos)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Custo Total Desembaraçado</span>
                <span className="text-white font-mono">{fmt(resultado.custoTotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Carga tributária efetiva</span>
                <span className="text-slate-500 dark:text-slate-400">{pct(resultado.totalTributos, resultado.valorAduaneiroBRL)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={salvando}
              onClick={async () => {
                setSalvando(true)
                try {
                  // Salvar via API route (implementar se necessário)
                  await new Promise(r => setTimeout(r, 500))
                } finally {
                  setSalvando(false)
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 border border-slate-200 dark:border-white/10 text-slate-300 text-sm rounded-xl transition"
            >
              <Save size={14} />
              {salvando ? 'Salvando...' : 'Salvar Simulação'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
