'use client'

import { useActionState, useRef } from 'react'
import { verificarMFAAction } from './actions'
import { Loader2, KeyRound } from 'lucide-react'

const estadoInicial = {}

export default function Verificar2FAPage() {
  const [state, formAction, isPending] = useActionState(verificarMFAAction, estadoInicial)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // Navega automaticamente entre os campos ao digitar
  function handleInput(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const valor = e.target.value.replace(/\D/g, '')
    e.target.value = valor
    if (valor && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  // Monta o código a partir dos 6 inputs individuais
  function getCodigoCompleto() {
    return inputsRef.current.map(i => i?.value || '').join('')
  }

  async function handleSubmit(formData: FormData) {
    const codigo = getCodigoCompleto()
    formData.set('codigo', codigo)
    return formAction(formData)
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center space-y-3 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-lg shadow-amber-500/20 mb-1 border border-amber-300/20">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Segurança Adicional</h1>
        <p className="text-slate-400 text-sm">Proteção em duas etapas ativada</p>
      </div>

      {/* Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Linha superior de destaque âmbar no card */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        
        <div className="mb-6 text-center">
          <h2 className="text-lg font-semibold text-white">Confirme sua identidade</h2>
          <p className="text-slate-400 text-sm mt-2">
            Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Erro */}
          {state.erro && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="shrink-0">⚠</span>
              {state.erro}
            </div>
          )}

          {/* 6 inputs de código */}
          <div className="flex gap-2 sm:gap-3 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={el => { inputsRef.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                disabled={isPending}
                onChange={e => handleInput(i, e)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold
                           bg-black/40 border border-white/10 rounded-xl text-white
                           focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50
                           disabled:opacity-50 transition caret-transparent"
              />
            ))}
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed
                       text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 mt-2
                       shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] border border-amber-400/20"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </button>
        </form>
      </div>

      <div className="text-center">
        <a href="/login" className="text-slate-400 hover:text-white text-sm transition">
          ← Voltar para o login
        </a>
      </div>
    </div>
  )
}
