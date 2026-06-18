# AGENTS.md — Manual de Boas Práticas

## Project Overview

**vid-buy-learn** — Plataforma de curso online "Costura do Zero ao Profissional" (Ondjango Capital).
Curso de corte e costura com aulas em vídeo, materiais de apoio, quizzes, certificados e gestão de alunos.

---

## Stack

| Camada      | Tecnologia                      |
| ----------- | ------------------------------- |
| Runtime     | Bun                             |
| Framework   | TanStack Start (SSR)            |
| Bundler     | Vite 8                          |
| UI          | React 19                        |
| Routing     | TanStack Router (file-based)    |
| CSS         | Tailwind CSS v4                 |
| Componentes | shadcn/ui (Radix UI primitives) |
| DB/Auth     | Supabase (Postgres + Auth)      |
| Charts      | Recharts                        |
| Rich Text   | Tiptap                          |
| PDF         | pdf-lib (server-side)           |
| Ícones      | lucide-react                    |
| Deploy      | Vercel (Nitro preset)           |

---

## Commands

```bash
bun run dev          # Dev server (Vite)
bun run build        # Build produção (Vercel)
bun run build:dev    # Build modo dev
bun run lint         # ESLint
bun run format       # Prettier
```

---

## Project Structure

```
src/
├── assets/                  # Imagens, fonts, etc.
├── components/
│   ├── admin/               # Componentes lazy da página admin
│   │   ├── AdminsTab.tsx
│   │   ├── CertificatesTab.tsx
│   │   ├── DashboardTab.tsx
│   │   ├── MaterialsDialog.tsx
│   │   ├── PaymentsTab.tsx
│   │   ├── QuizzesDialog.tsx
│   │   ├── StudentProfileDialog.tsx
│   │   └── types.ts
│   ├── ui/                  # shadcn/ui (Radix primitives)
│   ├── BlogAdminTab.tsx
│   ├── Logo.tsx
│   ├── RichTextEditor.tsx
│   ├── RichTextRenderer.tsx
│   └── SiteHeader.tsx
├── hooks/
├── integrations/
│   └── supabase/
│       ├── auth-attacher.ts    # Middleware auth (client → server)
│       ├── auth-middleware.ts   # Middleware auth (server-side)
│       ├── client.ts            # Supabase client (browser)
│       ├── client.server.ts     # Supabase admin (service role)
│       └── types.ts            # Database types
├── lib/
│   ├── api/
│   │   ├── certificate.functions.ts
│   │   ├── config.functions.ts
│   │   └── example.functions.ts
│   ├── certificate/
│   │   └── generate-pdf.server.ts
│   ├── config.server.ts
│   ├── course.ts
│   ├── error-capture.ts
│   ├── error-page.ts
│   ├── utils.ts
│   └── whatsapp.ts
├── routes/
│   ├── __root.tsx              # Root layout (shell + providers)
│   ├── index.tsx               # Landing page
│   ├── auth.tsx                # Login/register/reset
│   ├── blog.tsx                # Blog list
│   ├── blog.$slug.tsx          # Blog post
│   ├── reset-password.tsx      # Password reset
│   └── _authenticated/
│       ├── route.tsx           # Auth guard layout
│       ├── admin.tsx           # Painel admin (lazy tabs)
│       └── curso.tsx           # Área do aluno
├── router.tsx
├── routeTree.gen.ts            # Auto-gerado (não editar)
├── start.ts                    # TanStack Start config
└── styles.css                  # Tailwind + tema custom
```

---

## Routing Conventions

- **File-based routing** via TanStack Router (`routeTree.gen.ts` é auto-gerado)
- Prefix `_` em pastas = **layout route** (ex: `_authenticated/` agrupa rotas que precisam de auth)
- Ficheiros `route.tsx` dentro de pastas `_group/` = **layout component**
- `$param` = **dynamic segment** (ex: `blog.$slug.tsx`)
- Após criar/renomear uma rota, **regerar a route tree**: reiniciar dev server
- Toda rota exporta: `export const Route = createFileRoute("...")({ ... })`
- `head` para meta tags, `component` para o componente

### Auth Routes

- Rotas em `_authenticated/` têm um layout que verifica sessão
- Redirecciona para `/auth` se não autenticado
- Dentro do componente, verificar `enrollments.status` para acesso ao curso
- Admin check: `user_roles.role === "admin"`

---

## Server Functions

Usar `createServerFn` do `@tanstack/react-start` para operações server-side:

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const myFunction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ ... }))
  .handler(async ({ data }) => {
    // código server-side
  });
```

Regras:

- **Ficheiros `.server.ts`** contêm código que só corre no servidor
- Server functions em `lib/api/*.functions.ts` são automaticamente bundled como server code
- **Nunca** importar `client.server.ts` (service role) em client code — usar `await import()` dinâmico
- Sempre validar input com `zod`
- Para aceder ao Supabase com service role em server functions: `const { supabaseAdmin } = await import("@/integrations/supabase/client.server")`

---

## Supabase Patterns

### Client (browser)

```ts
import { supabase } from "@/integrations/supabase/client";
// Usa anon key + RLS
```

### Admin (server-side)

```ts
const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
// Usa service_role key — bypass RLS. SÓ usar em server functions!
```

### Auth flow

1. `auth-attacher.ts` (function middleware) anexa Bearer token do cliente a server functions
2. `auth-middleware.ts` verifica token no servidor
3. No cliente: `supabase.auth.getUser()` para sessão actual
4. Auth state changes: `supabase.auth.onAuthStateChange()` em `__root.tsx`

### DB naming

- `snake_case` para tabelas e colunas
- Tabelas: `lessons`, `enrollments`, `profiles`, `lesson_materials`, `lesson_quizzes`, `lesson_progress`, `quiz_attempts`, `lesson_comments`, `certificate_requests`, `user_roles`, `site_config`, `blog_posts`

---

## Component Conventions

### shadcn/ui

- Componentes em `src/components/ui/` seguem padrão shadcn
- Usar `cn()` de `@/lib/utils` para merge de classes
- `cva` da `class-variance-authority` para variantes

### Admin Page (lazy loading)

- Cada tab do admin é um componente separado em `src/components/admin/`
- Carregado com `React.lazy()` + `Suspense`
- **Não** importar Recharts, Tiptap ou outras libs pesadas no bundle inicial do admin
- `types.ts` contém tipos partilhados entre os componentes admin

### Layout de página

- `SiteHeader` em quase todas as páginas
- Container: `<div className="mx-auto max-w-6xl px-4">`
- Loading state: `<p className="text-center text-muted-foreground">A carregar...</p>`

---

## CSS / Styling

### Tailwind v4

- Config via `@theme inline` em `styles.css`
- `@source "../src"` para scanning de classes
- `@import "tailwindcss" source(none)` + `@source "../src"` (evita scanning de node_modules)

### Tema custom

```css
--color-gold: oklch(0.7 0.12 70); /* #C9A84C - brand accent */
--color-primary: oklch(0.24 0.035 45); /* deep coffee brown */
--color-background: oklch(0.985 0.012 70); /* warm cream */
```

Utilitários: `text-gold`, `bg-gold`, `bg-dots`

### Dark mode

- `@custom-variant dark (&:is(.dark *))` — preparado para dark mode
- Tema claro apenas (dark não implementado)

---

## Performance (Otimizações Aplicadas)

### vite.config.ts

- `nitro()` plugin só em produção (removido em dev)
- `optimizeDeps.include` com 16 libs pesadas para pré-compilação

### Code Splitting

- Admin tabs: todas lazy-loaded com `React.lazy()`
- Recharts, Tiptap, pdf-lib isolados em chunks separados
- BlogAdminTab lazy-loaded

---

## Deployment

- **Vercel** via Nitro preset
- `vercel.json` na raiz
- `bun run build` gera output para Vercel
- `.vercel/` contém output do build
- Variáveis de ambiente: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

---

## Scripts / Package Manager

- **Bun** é o package manager (bun.lock)
- `bunfig.toml` com `minimumReleaseAge = 86400` (segurança supply-chain)
- Sempre usar `bun` em vez de `npm` ou `yarn`

---

## Common Pitfalls

1. **Nunca editar `routeTree.gen.ts`** — é auto-gerado pelo TanStack Router
2. **Service role key** nunca deve estar em client code — sempre `await import()` dinâmico
3. **Server functions** precisam de input validation com zod
4. **Mudar ficheiros de rota** requer restart do dev server
5. **Proxy do Supabase client** (lazy init) — o client só é criado no primeiro acesso
6. **Nitro em beta** — se der erro no build, verificar compatibilidade

---

## A manter actualizado

Este ficheiro deve ser actualizado sempre que:

- Nova rota ou padrão de routing for adicionado
- Nova lib for integrada
- Config de build mudar
- Novo padrão de componente for estabelecido
- Performance optimisation for aplicada
