import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  ClipboardList,
  DollarSign,
  FileText,
  BarChart2,
  PackageSearch,
  Warehouse,
  Bell,
  Shield,
  Zap,
  Globe,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Processos de Importação e Exportação',
    desc: 'Acompanhe todos os processos com status, canal de despacho, DI/DUE e tributos em tempo real.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: DollarSign,
    title: 'Financeiro Integrado',
    desc: 'Lançamentos financeiros vinculados a cada processo. Controle receitas, despesas e tributos.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: FileText,
    title: 'Gestão Eletrônica de Documentos',
    desc: 'Upload, organização e acesso rápido a todos os documentos aduaneiros e comerciais.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: BarChart2,
    title: 'Relatórios e Analytics',
    desc: 'Relatórios de performance por período, modal, cliente e status. Exportação em CSV.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: PackageSearch,
    title: 'Controle de Drawback',
    desc: 'Gestão completa de atos concessórios — insumos, exportações vinculadas e comprovação Receita Federal.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Warehouse,
    title: 'Entreposto Aduaneiro',
    desc: 'Controle de lotes em regime de entreposto com alertas automáticos de vencimento de prazo.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: Bell,
    title: 'Notificações Automáticas',
    desc: 'Alertas por e-mail para vencimentos de Drawback e Entreposto. Nunca perca um prazo.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Globe,
    title: 'Portal do Cliente',
    desc: 'Seus clientes acompanham processos em tempo real por um portal exclusivo com convite por e-mail.',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
]

const PLANOS = [
  {
    nome: 'Starter',
    preco: 'R$ 297',
    periodo: '/mês',
    desc: 'Para despachantes autônomos que querem organizar a operação.',
    recursos: [
      'Até 50 processos ativos',
      'Importação e Exportação',
      'Financeiro e Documentos',
      'Relatórios básicos',
      'Portal do Cliente',
      'Suporte por e-mail',
    ],
    destaque: false,
    cta: 'Começar grátis',
  },
  {
    nome: 'Profissional',
    preco: 'R$ 597',
    periodo: '/mês',
    desc: 'Para equipes em crescimento com operações complexas.',
    recursos: [
      'Processos ilimitados',
      'Tudo do Starter',
      'Drawback completo',
      'Entreposto Aduaneiro',
      'Notificações por e-mail',
      'Relatórios avançados + CSV',
      'Suporte prioritário',
    ],
    destaque: true,
    cta: 'Assinar agora',
  },
  {
    nome: 'Enterprise',
    preco: 'Sob consulta',
    periodo: '',
    desc: 'Para grandes despachantes e trading companies.',
    recursos: [
      'Tudo do Profissional',
      'Multi-empresa',
      'API de integração',
      'SLA garantido',
      'Onboarding dedicado',
      'Gerente de conta',
    ],
    destaque: false,
    cta: 'Falar com vendas',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A101D] text-white">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0A101D]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-white font-bold text-sm">CX</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">COMEXO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#funcionalidades" className="hover:text-white transition">Funcionalidades</a>
            <a href="#planos" className="hover:text-white transition">Planos</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              Testar grátis
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400 mb-8">
          <Zap size={12} />
          Plataforma SaaS para Despachantes Aduaneiros
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          O sistema que seu{' '}
          <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
            despachante aduaneiro
          </span>{' '}
          precisa
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          Gerencie importações, exportações, Drawback e Entreposto Aduaneiro em uma única plataforma.
          Reduza erros, cumpra prazos e encante seus clientes com um portal exclusivo.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-amber-500/25 hover:bg-amber-400 transition"
          >
            Começar gratuitamente
            <ArrowRight size={16} />
          </Link>
          <a
            href="#funcionalidades"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            Ver funcionalidades
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-500">Sem cartão de crédito · 14 dias grátis</p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 max-w-3xl mx-auto">
          {[
            { valor: '100%', desc: 'Cloud — acesse de qualquer lugar' },
            { valor: 'Resend', desc: 'E-mails transacionais confiáveis' },
            { valor: 'RLS', desc: 'Seus dados isolados com segurança' },
            { valor: '14 dias', desc: 'Teste gratuito sem compromisso' },
          ].map(({ valor, desc }) => (
            <div key={valor} className="rounded-xl border border-white/5 bg-white/5 p-5">
              <p className="text-2xl font-bold text-amber-400">{valor}</p>
              <p className="mt-1 text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section id="funcionalidades" className="border-t border-white/5 bg-[#0F1929] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Do despacho ao portal do cliente — funcionalidades pensadas para o dia a dia do comércio exterior.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-xl border border-white/5 bg-white/5 p-6 hover:border-white/10 hover:bg-white/8 transition"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section id="planos" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Planos transparentes, sem surpresas
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Escolha o plano ideal para o tamanho da sua operação.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {PLANOS.map(({ nome, preco, periodo, desc, recursos, destaque, cta }) => (
              <div
                key={nome}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  destaque
                    ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/30'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
                      Mais popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{nome}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className={`text-4xl font-extrabold ${destaque ? 'text-amber-400' : 'text-white'}`}>
                      {preco}
                    </span>
                    {periodo && <span className="text-slate-400 mb-1">{periodo}</span>}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{desc}</p>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle size={15} className={`mt-0.5 shrink-0 ${destaque ? 'text-amber-400' : 'text-emerald-400'}`} />
                      {r}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block w-full text-center rounded-xl px-5 py-3 text-sm font-bold transition ${
                    destaque
                      ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-lg shadow-amber-500/25'
                      : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-white/5 bg-[#0F1929] py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <Shield size={28} className="text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-white md:text-4xl mb-4">
            Pronto para modernizar sua operação?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Comece hoje com 14 dias gratuitos. Sem cartão de crédito, sem compromisso.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/25 hover:bg-amber-400 transition"
          >
            Criar conta grátis
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">CX</span>
            </div>
            <span className="text-slate-400 text-sm font-semibold">COMEXO</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Comexo. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}

