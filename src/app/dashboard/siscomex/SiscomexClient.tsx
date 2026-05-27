'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Download, Globe, CheckCircle2, Clock } from 'lucide-react'

export default function SiscomexClient() {
  const [exportando, setExportando] = useState(false)
  const [msg, setMsg] = useState('')

  async function exportarProcessos() {
    setExportando(true)
    setMsg('')
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('processos')
        .select('numero_processo, tipo, status, cliente, referencia_interna, created_at')
        .order('created_at', { ascending: false })

      if (!data || data.length === 0) {
        setMsg('Nenhum processo encontrado.')
        return
      }

      const header = ['Número do Processo', 'Tipo', 'Status', 'Cliente', 'Referência Interna', 'Data de Abertura']
      const rows = data.map(p => [
        p.numero_processo ?? '',
        p.tipo === 'importacao' ? 'Importação' : 'Exportação',
        p.status ?? '',
        p.cliente ?? '',
        p.referencia_interna ?? '',
        p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '',
      ])

      const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `processos_siscomex_${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setMsg(`${data.length} processos exportados com sucesso.`)
    } catch {
      setMsg('Erro ao exportar.')
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status das integrações */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">Status das Integrações</h2>
        <div className="space-y-3">
          {[
            {
              nome: 'Exportação CSV / Excel',
              descricao: 'Exportar processos para preenchimento manual no Siscomex',
              status: 'disponivel',
            },
            {
              nome: 'Siscomex Web (PUComex)',
              descricao: 'Integração via API requer certificado digital e-CNPJ',
              status: 'em_breve',
            },
            {
              nome: 'Nota Fiscal Eletrônica (NF-e)',
              descricao: 'Consulta e vinculação de NF-e via SEFAZ',
              status: 'em_breve',
            },
            {
              nome: 'Câmbio em tempo real (BCB)',
              descricao: 'Taxa de câmbio automática via Banco Central do Brasil',
              status: 'em_breve',
            },
          ].map(item => (
            <div key={item.nome} className="flex items-start gap-3 p-3 rounded-xl bg-white/3">
              {item.status === 'disponivel'
                ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                : <Clock size={18} className="text-slate-500 shrink-0 mt-0.5" />
              }
              <div>
                <p className="text-sm font-medium text-white">{item.nome}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.descricao}</p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ${
                item.status === 'disponivel'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-600/50 text-slate-500 dark:text-slate-500 dark:text-slate-400'
              }`}>
                {item.status === 'disponivel' ? 'Disponível' : 'Em breve'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Exportação */}
      <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/5 p-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Exportar Dados</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
          Exporte os dados do sistema em formato CSV para auxiliar no preenchimento do Siscomex/PUComex.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={exportarProcessos}
            disabled={exportando}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-900/5 dark:bg-white/5 transition text-left disabled:opacity-50"
          >
            <Download size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Processos</p>
              <p className="text-xs text-slate-500">Exportar lista de DIs/DUEs</p>
            </div>
          </button>
        </div>

        {msg && (
          <p className={`mt-3 text-sm ${msg.includes('Erro') ? 'text-red-400' : 'text-emerald-400'}`}>{msg}</p>
        )}
      </div>

      {/* Informações técnicas */}
      <div className="bg-blue-500/5 rounded-2xl border border-blue-500/20 p-5">
        <div className="flex items-start gap-3">
          <Globe size={20} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-400">Sobre a integração com Siscomex / PUComex</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              A integração direta com o Portal Único do Comércio Exterior (PUComex) da Receita Federal
              requer certificado digital e-CNPJ (A3 ou A1) e credenciamento como desenvolvedor de software
              de comércio exterior. Não existe API pública disponível — o acesso é restrito a sistemas
              certificados pelo Projeto VICOMEX.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
              Quando essa integração for implementada, os dados cadastrados no Comexo serão sincronizados
              automaticamente com o Siscomex, eliminando o preenchimento manual.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
