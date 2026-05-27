import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fallback seguro: sem env de Supabase, não tenta inicializar cliente no middleware.
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Renova a sessão se expirada
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Portal do cliente ─────────────────────────────────────────────────────
  if (pathname.startsWith('/portal')) {
    const isPortalPublic = ['/portal/login', '/portal/convite'].some(r => pathname.startsWith(r))
    if (!user && !isPortalPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      return NextResponse.redirect(url)
    }
    // Usuário logado no portal tentando acessar /portal/login → vai para processos
    if (user && pathname === '/portal/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/processos'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ── Área administrativa ────────────────────────────────────────────────────
  const rotasPublicas = [
    '/login',
    '/registro',
    '/esqueci-senha',
    '/redefinir-senha',
    '/api/auth',
  ]
  const isRotaPublica = rotasPublicas.some(rota => pathname.startsWith(rota))

  // Portal users não têm acesso ao dashboard — redireciona para o portal
  if (user && pathname.startsWith('/dashboard')) {
    const tipo = user.user_metadata?.tipo
    if (tipo === 'portal') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/processos'
      return NextResponse.redirect(url)
    }
  }

  // Redireciona para /login se tentar acessar área privada sem sessão
  if (!user && !isRotaPublica) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redireciona para /dashboard se já estiver logado e tentar acessar /login
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico, robots.txt, etc.
     * - Rotas de API públicas
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/webhook).*)',
  ],
}
