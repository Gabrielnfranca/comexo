'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react'

type Mercadoria = {
  descricao: string | null
  quantidade: number | null
  unidade: string | null
  valor_unitario: number | null
  valor_total: number | null
  ncm_sugerido: string | null
  ncm_justificativa: string | null
}

type ResultadoIA = {
  tipo_documento: string | null
  numero_documento: string | null
  data_documento: string | null
  exportador_nome: string | null
  exportador_pais: string | null
  importador_nome: string | null
  importador_pais: string | null
  incoterm: string | null
  moeda: string | null
  mercadorias: Mercadoria[]
  valor_total_fob: number | null
  valor_frete: number | null
  peso_bruto_kg: number | null
  numero_volumes: number | null
  observacoes: string | null
}

const TIPO_LABELS: Record<string, string> = {
  invoice: 'Invoice Comercial',
  packing_list: 'Packing List',
  bill_of_lading: 'Bill of Lading',
  outro: 'Outro',
}

export default function IAClient({ historico }: { historico: any[] }) {
  const [dragging, setDragging] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoIA | null>(null)
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState<'analisar' | 'historico'>('analisar')
  const [mercExpanded, setMercExpanded] = useState<number | null>(0)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setArquivo(f)
    setResultado(null)
    setErro('')
  }

  async function analisar() {
    if (!arquivo) return
    setLoading(true)
    setErro('')
    setResultado(null)
    try {
      const fd = new FormData()
      fd.append('arquivo', arquivo)
      const res = await fetch('/api/ia/analisar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error ?? 'Erro ao analisar documento')
      } else {
        setResultado(data)
      }
    } catch {
      setErro('Falha na conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (v: number | null, moeda?: string | null) => {
    if (v == null) return '—'
    return `${moeda ?? ''} ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`.trim()
  }

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex gap-2">
        {(['analisar', 'historico'] as const).map(tab => (
          <button key={tab} onClick={() => setAba(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${aba === tab ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-900/5 dark:bg-white/5'}`}>
            {tab === 'analisar' ? 'Nova Análise' : `Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {aba === 'analisar' && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
              dragging ? 'border-amber-400 bg-amber-500/5' : 'border-slate-200 dark:border-white/10 hover:border-white/20 hover:bg-white/3'
            }`}
          >
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            <Upload size={32} className="mx-auto mb-3 text-slate-500" />
            {arquivo ? (
              <div>
                <p className="text-white font-medium">{arquivo.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{(arquivo.size / 1024).toFixed(0)} KB — clique para trocar</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-300 font-medium">Arraste o arquivo ou clique para selecionar</p>
                <p className="text-slate-500 text-sm mt-1">Invoice, Packing List ou Bill of Lading • PDF, JPG, PNG, WEBP • máx. 20MB</p>
              </div>
            )}
          </div>

          {arquivo && !loading && (
            <button onClick={analisar}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
              Analisar com IA (Gemini)
            </button>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400">
              <Loader2 size={32} className="animate-spin mb-3 text-amber-400" />
              <p className="font-medium">Analisando documento com IA...</p>
              <p className="text-sm mt-1 text-slate-500">Isso leva alguns segundos</p>
            </div>
          )}

          {erro && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{erro}</p>
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Análise concluída e salva no histórico</span>
              </div>

              {/* Resumo geral */}
              <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Informações Gerais</h3>
                  {resultado.tipo_documento && (
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">
                      {TIPO_LABELS[resultado.tipo_documento] ?? resultado.tipo_documento}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Nº Documento', value: resultado.numero_documento },
                    { label: 'Data', value: resultado.data_documento },
                    { label: 'Incoterm', value: resultado.incoterm },
                    { label: 'Exportador', value: resultado.exportador_nome ? `${resultado.exportador_nome}${resultado.exportador_pais ? ` (${resultado.exportador_pais})` : ''}` : null },
                    { label: 'Importador', value: resultado.importador_nome },
                    { label: 'Moeda', value: resultado.moeda },
                    { label: 'Valor FOB', value: fmt(resultado.valor_total_fob, resultado.moeda) },
                    { label: 'Frete', value: fmt(resultado.valor_frete, resultado.moeda) },
                    { label: 'Peso Bruto', value: resultado.peso_bruto_kg ? `${resultado.peso_bruto_kg} kg` : null },
                    { label: 'Volumes', value: resultado.numero_volumes },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-white text-sm font-medium mt-0.5">{item.value ?? '—'}</p>
                    </div>
                  ))}
                </div>
                {resultado.observacoes && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <p className="text-xs text-slate-500">Observações da IA</p>
                    <p className="text-slate-300 text-sm mt-0.5">{resultado.observacoes}</p>
                  </div>
                )}
              </div>

              {/* Mercadorias */}
              {resultado.mercadorias && resultado.mercadorias.length > 0 && (
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
                  <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">
                    Mercadorias ({resultado.mercadorias.length})
                  </h3>
                  <div className="space-y-2">
                    {resultado.mercadorias.map((m, i) => (
                      <div key={i} className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setMercExpanded(mercExpanded === i ? null : i)}
                          className="w-full flex items-center justify-between p-3 hover:bg-white/3 transition"
                        >
                          <div className="flex items-center gap-3 text-left">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm text-white font-medium">{m.descricao ?? 'Sem descrição'}</p>
                              {m.ncm_sugerido && (
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                                  NCM {m.ncm_sugerido}
                                </span>
                              )}
                            </div>
                          </div>
                          {mercExpanded === i ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                        </button>
                        {mercExpanded === i && (
                          <div className="px-3 pb-3 border-t border-slate-200 dark:border-white/5 pt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs text-slate-500">Quantidade</p>
                              <p className="text-white text-sm">{m.quantidade != null ? `${m.quantidade} ${m.unidade ?? ''}`.trim() : '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Valor Unitário</p>
                              <p className="text-white text-sm">{fmt(m.valor_unitario, resultado.moeda)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Valor Total</p>
                              <p className="text-white text-sm font-medium">{fmt(m.valor_total, resultado.moeda)}</p>
                            </div>
                            {m.ncm_justificativa && (
                              <div className="col-span-2 md:col-span-3">
                                <p className="text-xs text-slate-500">Justificativa NCM</p>
                                <p className="text-slate-300 text-xs mt-0.5">{m.ncm_justificativa}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {aba === 'historico' && (
        <div className="space-y-3">
          {historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <FileText size={40} className="mb-3 opacity-30" />
              <p className="font-medium">Nenhuma análise realizada</p>
            </div>
          ) : (
            historico.map(h => {
              const dados = h.dados_extraidos as ResultadoIA | null
              return (
                <div key={h.id} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">{h.nome_arquivo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {h.tipo_documento && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {TIPO_LABELS[h.tipo_documento] ?? h.tipo_documento}
                          </span>
                        )}
                        {h.ncm_principal && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-mono">
                            NCM {h.ncm_principal}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {dados && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                      {dados.exportador_nome && <p>Exportador: {dados.exportador_nome}{dados.exportador_pais ? ` — ${dados.exportador_pais}` : ''}</p>}
                      {dados.mercadorias && dados.mercadorias.length > 0 && (
                        <p>{dados.mercadorias.length} item(ns) • {dados.valor_total_fob != null ? `FOB ${dados.moeda ?? ''} ${Number(dados.valor_total_fob).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
