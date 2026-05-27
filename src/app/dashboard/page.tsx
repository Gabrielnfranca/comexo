import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Ship, Package, DollarSign, FileText,
  AlertTriangle, TrendingUp, Clock, Plus, Users,
  AlertCircle,
} from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, TIPO_LABELS, TIPO_COLORS } from '@/lib/types/processo'
import type { Processo } from '@/lib/types/processo'

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function diasAte(dataStr: string) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataStr + 'T12:00:00')
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const STATUSES_ATIVOS = ['aberto', 'aguardando_docs', 'em_transito', 'no_porto', 'em_desembaraco', 'liberado']
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const em10dias = new Date(hoje); em10dias.setDate(hoje.getDate() + 10)
  const em7dias = new Date(hoje); em7dias.setDate(hoje.getDate() + 7)

  // ── Queries em paralelo ────────────────────────────────────────────────────
  const [
    { data: processosAtivosData },
    { data: processosRecentes },
    { data: lancamentosReceita },
    { data: lancamentosDespesa },
    { data: totalClientes },
    { data: processosAlerta },
    { data: lancamentosVencendo },
    { data: drawbackAlerta },
  ] = await Promise.all([
    supabase.from('processos').select('id, status').in('status', STATUSES_ATIVOS),
    supabase.from('processos').select('id, numero, tipo, status, cliente, previsao_chegada')
      .order('created_at', { ascending: false }).limit(6),
    supabase.from('lancamentos_financeiros')
      .select('valor').eq('tipo', 'receita').eq('status', 'pendente').eq('moeda', 'BRL'),
    supabase.from('lancamentos_financeiros')
      .select('valor').eq('tipo', 'despesa').eq('status', 'pendente').eq('moeda', 'BRL'),
    supabase.from('clientes').select('id', { count: 'exact', head: true }),
    // processos ativos com previsao_chegada: vencidos ou nos próximos 10 dias
    supabase.from('processos')
      .select('id, numero, tipo, status, cliente, previsao_chegada')
      .in('status', STATUSES_ATIVOS)
      .not('previsao_chegada', 'is', null)
      .lte('previsao_chegada', em10dias.toISOString().slice(0, 10))
      .order('previsao_chegada', { ascending: true })
      .limit(20),
    // lançamentos financeiros vencendo em 7 dias
    supabase.from('lancamentos_financeiros')
      .select('id, descricao, valor, vencimento, tipo, categoria, moeda, status')
      .eq('status', 'pendente')
      .not('vencimento', 'is', null)
      .lte('vencimento', em7dias.toISOString().slice(0, 10))
      .order('vencimento', { ascending: true })
      .limit(10),
    // drawback atos vencendo em 30 dias
    supabase.from('drawback_atos')
      .select('id, numero_ato, cliente, data_vencimento, status, modalidade')
      .in('status', ['vigente', 'prorrogado'])
      .not('data_vencimento', 'is', null)
      .lte('data_vencimento', new Date(hoje.getTime() + 30 * 86400000).toISOString().slice(0, 10))
      .order('data_vencimento', { ascending: true })
      .limit(10),
  ])

  const qtdAtivos = processosAtivosData?.length ?? 0
  const aReceber = (lancamentosReceita ?? []).reduce((s, l) => s + Number(l.valor), 0)
  const aPagar = (lancamentosDespesa ?? []).reduce((s, l) => s + Number(l.valor), 0)

  // Separar alertas de processos: vencidos (chegada passou) vs próximos
  const todayStr = hoje.toISOString().slice(0, 10)
  const processosVencidos = (processosAlerta ?? []).filter(
    (p: Partial<Processo>) => p.previsao_chegada! < todayStr
  )
  const processosPróximos = (processosAlerta ?? []).filter(
    (p: Partial<Processo>) => p.previsao_chegada! >= todayStr
  )

  const totalAlertas = (processosAlerta?.length ?? 0) + (lancamentosVencendo?.length ?? 0) + (drawbackAlerta?.length ?? 0)

  const semProcessos = (processosRecentes ?? []).length === 0

  return (
    <div className="space-y-6">

      {/* Boas-vindas (só exibe se não houver processos) */}
      {semProcessos && (
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 text-xl font-bold">🎉</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Bem-vindo ao Comexo!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Comece cadastrando seus clientes e abrindo o primeiro processo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Processos Ativos</p>
            <div className="w-9 h-9 rounded-xl bg-blue-400/10 flex items-center justify-center">
              <Ship size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-white text-2xl font-bold">{qtdAtivos}</p>
          <p className="text-slate-500 text-xs mt-1">
            {qtdAtivos === 0 ? 'Nenhum processo aberto' : `${qtdAtivos} em andamento`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">A Receber</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-white text-2xl font-bold">{formatBRL(aReceber)}</p>
          <p className="text-slate-500 text-xs mt-1">Pendentes em BRL</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">A Pagar</p>
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <DollarSign size={18} className="text-amber-400" />
            </div>
          </div>
          <p className="text-white text-2xl font-bold">{formatBRL(aPagar)}</p>
          <p className="text-slate-500 text-xs mt-1">Pendentes em BRL</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Alertas de Prazo</p>
            <div className="w-9 h-9 rounded-xl bg-red-400/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${totalAlertas > 0 ? 'text-red-400' : 'text-white'}`}>
            {totalAlertas}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {totalAlertas === 0 ? 'Nenhum prazo crítico' : `${totalAlertas} iten${totalAlertas > 1 ? 's' : ''} exige${totalAlertas === 1 ? '' : 'm'} atenção`}
          </p>
        </div>
      </div>

      {/* Grid inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Processos recentes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Processos Recentes</h3>
            <Link href="/dashboard/processos" className="text-amber-400 text-xs hover:text-amber-300 transition">
              Ver todos →
            </Link>
          </div>

          {semProcessos ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Ship className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Nenhum processo ainda</p>
              <Link
                href="/dashboard/processos/novo"
                className="mt-4 px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-medium rounded-xl transition"
              >
                + Novo Processo
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {(processosRecentes ?? []).map((p: Partial<Processo> & { id: string }) => (
                <Link
                  key={p.id}
                  href={`/dashboard/processos/${p.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900/5 dark:bg-white/5 transition group"
                >
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${TIPO_COLORS[p.tipo!]}`}>
                    {TIPO_LABELS[p.tipo!]}
                  </span>
                  <span className="font-mono text-sm text-amber-400 font-semibold group-hover:text-amber-300 shrink-0">
                    {p.numero}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm truncate flex-1">{p.cliente}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${STATUS_COLORS[p.status!]}`}>
                    {STATUS_LABELS[p.status!]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Alertas de prazo */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Alertas de Prazo</h3>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>

          {totalAlertas === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Nenhum alerta</p>
              <p className="text-slate-600 text-xs mt-1">Processos com previsão de chegada em até 10 dias aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">

              {/* Processos vencidos */}
              {processosVencidos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> Chegada Vencida
                  </p>
                  <div className="space-y-1">
                    {processosVencidos.map((p: Partial<Processo> & { id: string }) => {
                      const dias = Math.abs(diasAte(p.previsao_chegada!))
                      return (
                        <Link key={p.id} href={`/dashboard/processos/${p.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-950/30 transition group">
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                          <span className="font-mono text-sm text-amber-400 font-semibold shrink-0">{p.numero}</span>
                          <span className="text-slate-400 text-sm truncate flex-1">{p.cliente}</span>
                          <span className="text-xs font-semibold text-red-400 shrink-0">
                            Há {dias}d
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Processos próximos */}
              {processosPróximos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Clock size={11} /> Chegada Próxima
                  </p>
                  <div className="space-y-1">
                    {processosPróximos.map((p: Partial<Processo> & { id: string }) => {
                      const dias = diasAte(p.previsao_chegada!)
                      return (
                        <Link key={p.id} href={`/dashboard/processos/${p.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition group">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dias <= 2 ? 'bg-red-400' : dias <= 5 ? 'bg-amber-400' : 'bg-yellow-400'}`} />
                          <span className="font-mono text-sm text-amber-400 font-semibold shrink-0">{p.numero}</span>
                          <span className="text-slate-400 text-sm truncate flex-1">{p.cliente}</span>
                          <span className={`text-xs font-semibold shrink-0 ${dias <= 2 ? 'text-red-400' : dias <= 5 ? 'text-amber-400' : 'text-yellow-400'}`}>
                            {dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias}d`}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Lançamentos vencendo */}
              {(lancamentosVencendo?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <DollarSign size={11} /> Vencimentos Financeiros
                  </p>
                  <div className="space-y-1">
                    {(lancamentosVencendo ?? []).map((l: { id: string; descricao: string; valor: number; vencimento: string; tipo: string; moeda: string }) => {
                      const dias = diasAte(l.vencimento)
                      return (
                        <Link key={l.id} href="/dashboard/financeiro"
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition group">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dias < 0 ? 'bg-red-500' : dias <= 2 ? 'bg-orange-400' : 'bg-amber-400'}`} />
                          <span className="text-slate-300 text-sm truncate flex-1">{l.descricao}</span>
                          <span className="text-slate-400 text-xs shrink-0">
                            {l.valor.toLocaleString('pt-BR', { style: 'currency', currency: l.moeda ?? 'BRL' })}
                          </span>
                          <span className={`text-xs font-semibold shrink-0 ${dias < 0 ? 'text-red-400' : dias <= 2 ? 'text-orange-400' : 'text-amber-400'}`}>
                            {dias < 0 ? `Há ${Math.abs(dias)}d` : dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias}d`}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
              {/* Drawback vencendo */}
              {(drawbackAlerta?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> Drawback Vencendo
                  </p>
                  <div className="space-y-1">
                    {(drawbackAlerta ?? []).map((a: { id: string; numero_ato: string; cliente: string; data_vencimento: string }) => {
                      const dias = diasAte(a.data_vencimento)
                      return (
                        <Link key={a.id} href={`/dashboard/drawback/${a.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition group">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${dias < 0 ? 'bg-red-500' : dias <= 7 ? 'bg-violet-400' : 'bg-violet-300'}`} />
                          <span className="font-mono text-sm text-violet-400 font-semibold shrink-0">{a.numero_ato}</span>
                          <span className="text-slate-400 text-sm truncate flex-1">{a.cliente}</span>
                          <span className={`text-xs font-semibold shrink-0 ${dias < 0 ? 'text-red-400' : 'text-violet-400'}`}>
                            {dias < 0 ? `Vencido há ${Math.abs(dias)}d` : dias === 0 ? 'Hoje' : `${dias}d`}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Plus,       label: 'Novo Processo',    href: '/dashboard/processos/novo',    cor: 'bg-blue-500/10 border-blue-500/20 text-blue-400'       },
            { icon: Users,      label: 'Novo Cliente',     href: '/dashboard/clientes/novo',     cor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
            { icon: DollarSign, label: 'Novo Lançamento',  href: '/dashboard/financeiro/novo',   cor: 'bg-amber-500/10 border-amber-500/20 text-amber-400'     },
            { icon: FileText,   label: 'Documentos',       href: '/dashboard/documentos',        cor: 'bg-purple-500/10 border-purple-500/20 text-purple-400'  },
          ].map(({ icon: Icon, label, href, cor }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border ${cor} hover:opacity-80 transition`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
