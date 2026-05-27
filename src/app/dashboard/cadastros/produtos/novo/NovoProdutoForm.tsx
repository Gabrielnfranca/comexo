'use client'

import { useActionState, useState } from 'react'
import { criarProdutoAction } from '../actions'
import { PAISES_COMUNS, ORGAOS_ANUENTES, type ProdutoAtributo } from '@/lib/types/produto'
import { Plus, Trash2 } from 'lucide-react'

const inputClass =
  'w-full px-4 py-2.5 bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition'
const labelClass = 'block text-xs text-slate-500 dark:text-slate-400 mb-1.5'

export default function NovoProdutoForm() {
  const [state, action, pending] = useActionState(criarProdutoAction, null)
  const [atributos, setAtributos] = useState<ProdutoAtributo[]>([])
  const [requerLpco, setRequerLpco] = useState(false)

  const addAtributo = () => setAtributos(prev => [...prev, { chave: '', valor: '' }])
  const removeAtributo = (i: number) => setAtributos(prev => prev.filter((_, idx) => idx !== i))
  const updateAtributo = (i: number, field: 'chave' | 'valor', value: string) =>
    setAtributos(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a))

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="atributos_json" value={JSON.stringify(atributos)} />

      {state?.erro && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          {state.erro}
        </div>
      )}

      {/* Identificação */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Identificação do Produto</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Código Interno</label>
            <input name="codigo_interno" placeholder="Ex: PROD-001" className={inputClass} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Descrição Técnica / Aduaneira *</label>
            <input
              name="descricao"
              required
              placeholder="Ex: Aparelho telefônico celular, modelo smartphone, tela OLED 6.1..."
              className={inputClass}
            />
            <p className="text-slate-600 text-xs mt-1">Use a descrição que será informada na DUIMP</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descrição Comercial</label>
          <input
            name="descricao_comercial"
            placeholder="Ex: iPhone 15 Pro 256GB"
            className={inputClass}
          />
        </div>
      </div>

      {/* Classificação Fiscal */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Classificação Fiscal</p>
          <span className="text-xs text-amber-500/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Obrigatório DUIMP 2026
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>NCM * (8 dígitos)</label>
            <input
              name="ncm_codigo"
              required
              placeholder="Ex: 85171210"
              maxLength={10}
              className={`${inputClass} font-mono tracking-wider`}
            />
          </div>
          <div>
            <label className={labelClass}>cClassTrib — IBS/CBS</label>
            <input
              name="c_class_trib"
              placeholder="Ex: 010101"
              maxLength={20}
              className={`${inputClass} font-mono`}
            />
            <p className="text-slate-600 text-xs mt-1">Obrigatório na DUIMP desde jan/2026</p>
          </div>
          <div>
            <label className={labelClass}>Ex-tarifário (se houver)</label>
            <input name="ex_tarifario" placeholder="Ex: EX-001" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Origem e Fabricante */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Origem e Fabricante</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>País de Origem</label>
            <select name="pais_origem" className={inputClass}>
              <option value="">Selecione...</option>
              {PAISES_COMUNS.map(p => (
                <option key={p.codigo} value={p.codigo}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Fabricante</label>
            <input name="fabricante" placeholder="Ex: Apple Inc." className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Marca</label>
            <input name="marca" placeholder="Ex: Apple" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Modelo</label>
            <input name="modelo" placeholder="Ex: iPhone 15 Pro" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Medidas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Medidas e Unidade</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Unidade de Medida</label>
            <select name="unidade_medida" className={inputClass}>
              <option value="UN">UN — Unidade</option>
              <option value="KG">KG — Quilograma</option>
              <option value="L">L — Litro</option>
              <option value="M">M — Metro</option>
              <option value="M2">M² — Metro Quadrado</option>
              <option value="M3">M³ — Metro Cúbico</option>
              <option value="PAR">PAR — Par</option>
              <option value="DZ">DZ — Dúzia</option>
              <option value="CX">CX — Caixa</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Peso Líquido (kg)</label>
            <input
              name="peso_liquido_kg"
              type="number"
              step="0.0001"
              min="0"
              placeholder="Ex: 0.1750"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Peso Bruto (kg)</label>
            <input
              name="peso_bruto_kg"
              type="number"
              step="0.0001"
              min="0"
              placeholder="Ex: 0.2200"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Atributos adicionais */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Atributos Obrigatórios (Siscomex)</p>
            <p className="text-xs text-slate-500 mt-0.5">Ex: Cor, Material, Voltagem, Capacidade — conforme exigência do NCM</p>
          </div>
          <button
            type="button"
            onClick={addAtributo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition"
          >
            <Plus size={13} />
            Adicionar atributo
          </button>
        </div>

        {atributos.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-4 border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
            Nenhum atributo adicionado. Clique em &quot;Adicionar atributo&quot; para incluir.
          </p>
        ) : (
          <div className="space-y-2">
            {atributos.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={a.chave}
                  onChange={e => updateAtributo(i, 'chave', e.target.value)}
                  placeholder="Atributo (ex: Cor)"
                  className={`${inputClass} flex-1`}
                />
                <input
                  value={a.valor}
                  onChange={e => updateAtributo(i, 'valor', e.target.value)}
                  placeholder="Valor (ex: Azul)"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeAtributo(i)}
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licenciamento */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-white">Licenciamento e Restrições</p>

        <div className="grid grid-cols-2 gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="requer_lpco"
              type="checkbox"
              checked={requerLpco}
              onChange={e => setRequerLpco(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm text-white">Requer LPCO / Anuência</p>
              <p className="text-xs text-slate-500">ANVISA, MAPA, IBAMA, INMETRO, Exército, ANATEL...</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="tem_antidumping"
              type="checkbox"
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm text-white">Sujeito a Antidumping</p>
              <p className="text-xs text-slate-500">Direito antidumping ou medida compensatória vigente</p>
            </div>
          </label>
        </div>

        {requerLpco && (
          <div>
            <label className={labelClass}>Órgão Anuente</label>
            <select name="orgao_anuente" className={inputClass}>
              <option value="">Selecione o órgão...</option>
              {ORGAOS_ANUENTES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Observações */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <label className={labelClass}>Observações</label>
        <textarea
          name="observacoes"
          rows={3}
          placeholder="Informações adicionais, notas de classificação, histórico de mudanças..."
          className={inputClass + ' resize-none'}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold text-sm rounded-xl transition"
        >
          {pending ? 'Salvando...' : 'Salvar Produto'}
        </button>
      </div>
    </form>
  )
}
