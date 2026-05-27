'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { Search, X, ClipboardList, Users, PackageSearch, Warehouse } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Resultado {
  tipo: 'processo' | 'cliente' | 'drawback' | 'entreposto'
  id: string
  titulo: string
  subtitulo: string
  href: string
}

const TIPO_ICON = {
  processo: ClipboardList,
  cliente: Users,
  drawback: PackageSearch,
  entreposto: Warehouse,
}

const TIPO_LABEL = {
  processo: 'Processo',
  cliente: 'Cliente',
  drawback: 'Drawback',
  entreposto: 'Entreposto',
}

const TIPO_COR = {
  processo: 'text-blue-400',
  cliente: 'text-emerald-400',
  drawback: 'text-amber-400',
  entreposto: 'text-cyan-400',
}

async function buscar(q: string): Promise<Resultado[]> {
  if (q.trim().length < 2) return []
  const res = await fetch(`/api/busca?q=${encodeURIComponent(q.trim())}`)
  if (!res.ok) return []
  return res.json()
}

export default function BuscaGlobal() {
  const [aberto, setAberto] = useState(false)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [carregando, setCarregando] = useState(false)
  const [selecionado, setSelecionado] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Atalho Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setAberto((v) => !v)
      }
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focar input ao abrir
  useEffect(() => {
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResultados([])
      setSelecionado(-1)
    }
  }, [aberto])

  // Debounce de busca
  useEffect(() => {
    if (!aberto) return
    const id = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResultados([])
        return
      }
      setCarregando(true)
      const res = await buscar(query)
      setResultados(res)
      setSelecionado(-1)
      setCarregando(false)
    }, 300)
    return () => clearTimeout(id)
  }, [query, aberto])

  function navegar(href: string) {
    router.push(href)
    setAberto(false)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelecionado((v) => Math.min(v + 1, resultados.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelecionado((v) => Math.max(v - 1, -1))
    } else if (e.key === 'Enter' && selecionado >= 0) {
      navegar(resultados[selecionado].href)
    }
  }

  return (
    <>
      {/* Botão de busca no header */}
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-400 hover:border-white/20 hover:text-white transition"
        aria-label="Buscar (Ctrl+K)"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline ml-1 rounded border border-white/10 bg-white/5 px-1.5 text-xs text-slate-500">
          Ctrl K
        </kbd>
      </button>

      {/* Overlay de busca */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAberto(false)}
          />

          {/* Painel */}
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">

            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar processos, clientes, drawback..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded text-slate-500 hover:text-white transition"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-500 hover:text-white transition"
              >
                Esc
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-80 overflow-y-auto">
              {carregando && (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Buscando...
                </div>
              )}

              {!carregando && query.length >= 2 && resultados.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-500">
                  Nenhum resultado para &quot;{query}&quot;
                </div>
              )}

              {!carregando && query.length < 2 && (
                <div className="px-4 py-6 text-center text-sm text-slate-600">
                  Digite ao menos 2 caracteres para buscar
                </div>
              )}

              {resultados.length > 0 && (
                <ul className="py-2">
                  {resultados.map((r, i) => {
                    const Icon = TIPO_ICON[r.tipo]
                    const cor = TIPO_COR[r.tipo]
                    return (
                      <li key={`${r.tipo}-${r.id}`}>
                        <button
                          type="button"
                          onClick={() => navegar(r.href)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                            i === selecionado ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`shrink-0 rounded-lg p-1.5 bg-white/5`}>
                            <Icon size={14} className={cor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{r.titulo}</p>
                            <p className="text-xs text-slate-400 truncate">{r.subtitulo}</p>
                          </div>
                          <span className={`text-xs font-medium ${cor} shrink-0`}>
                            {TIPO_LABEL[r.tipo]}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Rodapé com atalhos */}
            <div className="flex items-center gap-4 border-t border-white/5 px-4 py-2.5 bg-white/2">
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 text-xs">↑↓</kbd> navegar
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 text-xs">↵</kbd> abrir
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <kbd className="rounded border border-white/10 px-1 text-xs">Esc</kbd> fechar
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
