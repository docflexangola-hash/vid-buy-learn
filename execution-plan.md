# Plano de Execução — Correção de Erros e Incongruências

**Projecto:** vid-buy-learn (Costura do Zero ao Profissional)
**Data:** 18-06-2026
**Prioridade:** Crítico → Alto → Médio → Baixo

---

## Fase 0 — Setup e Verificação Inicial

**Objectivo:** Garantir ambiente de desenvolvimento funcional antes de começar.

| #   | Tarefa                                                     | Esforço | Depende de |
| --- | ---------------------------------------------------------- | ------- | ---------- |
| 0.1 | Correr `bun install` para garantir dependências instaladas | 2 min   | —          |
| 0.2 | Correr `bun run dev` e confirmar que o servidor arranca    | 2 min   | 0.1        |
| 0.3 | Correr `bun run lint` para ver estado actual do ESLint     | 2 min   | 0.1        |
| 0.4 | Criar branch `fix/execution-plan` para isolar alterações   | 1 min   | —          |

---

## Fase 1 — Erros Críticos 🛑

**Impacto:** Quebram funcionalidade ou expõem segurança.

### 1.1 — Corrigir `auth-middleware.ts:55` — `getClaims()` inexistente

**Ficheiro:** `src/integrations/supabase/auth-middleware.ts`
**Problema:** `supabase.auth.getClaims(token)` não existe na API do `@supabase/supabase-js`. Irá lançar `TypeError` em runtime sempre que uma server function usar o `requireSupabaseAuth` middleware.
**Solução:** Substituir por `supabase.auth.getUser(token)`.

**Passos:**

1. Abrir `src/integrations/supabase/auth-middleware.ts`
2. Substituir `supabase.auth.getClaims(token)` por `supabase.auth.getUser(token)`
3. Ajustar a extracção do userId: `data.user.id` em vez de `data.claims.sub`
4. Remover a propriedade `claims` do context (já não existe)
5. Manter `supabase` e `userId` no context retornado
6. Correr lint

**Esforço estimado:** 15 min
**Teste:** Criar server function que use `requireSupabaseAuth` e verificar que não lança erro

---

### 1.2 — Corrigir `certificate.functions.ts:3` — Import estático do `supabaseAdmin`

**Ficheiro:** `src/lib/api/certificate.functions.ts`
**Problema:** Import estático ao nível do módulo do `supabaseAdmin` (service role client) em vez de `await import()` dinâmico. O `client.server.ts` e o `AGENTS.md` explicitamente avisam que `*.functions.ts` podem ir para o bundle client.
**Solução:** Substituir import estático por import dinâmico dentro do handler.

**Passos:**

1. Abrir `src/lib/api/certificate.functions.ts`
2. Remover `import { supabaseAdmin } from "@/integrations/supabase/client.server"` do topo
3. Adicionar `const { supabaseAdmin } = await import("@/integrations/supabase/client.server")` dentro do handler do `approveCertificate`
4. Verificar que todas as referências a `supabaseAdmin` no handler continuam a funcionar
5. Correr lint

**Esforço estimado:** 10 min
**Teste:** Verificar que `approveCertificate` server function compila e o bundle client não contém `supabaseAdmin`

---

## Fase 2 — Erros Altos 🟠

**Impacto:** Performance, estabilidade.

### 2.1 — Optimizar `__root.tsx` — Subscrição auth recriada em cada navegação

**Ficheiro:** `src/routes/__root.tsx`
**Problema:** `useRouter()` no `RootComponent` (linha 118) faz parte do array de dependências do `useEffect` (linha 128). Como `useRouter()` retorna uma nova referência em cada render provocado por navegação, o efeito é limpo e recriado a cada rota change — a subscrição `onAuthStateChange` é removida e registada de novo constantemente.
**Solução:** Remover `router` das dependências do `useEffect`. Usar `router.invalidate()` apenas dentro do callback (closure), não no array de dependências.

**Passos:**

1. Abrir `src/routes/__root.tsx`
2. Remover `router` do array de dependências do `useEffect` na linha 128
3. Manter `router.invalidate()` dentro do callback — a closure captura o router
4. Manter `queryClient` nas dependências (estável)
5. Correr lint

**Esforço estimado:** 15 min
**Teste:** Navegar entre páginas e confirmar que auth state listener não é recriado (usar console.log no efeito)

---

### 2.2 — Corrigir `router.tsx` — `QueryClient` recriado em cada chamada

**Ficheiro:** `src/router.tsx`
**Problema:** `new QueryClient()` dentro de `getRouter()` cria nova instância em cada chamada. Se `getRouter()` for chamado múltiplas vezes (ex: SSR + hydration + hot reload), o cache do React Query é fragmentado.
**Solução:** Mover `QueryClient` para fora da função como singleton.

**Passos:**

1. Abrir `src/router.tsx`
2. Mover `const queryClient = new QueryClient()` para fora de `getRouter()`, ao nível do módulo
3. Referenciar `queryClient` dentro da função
4. Correr lint

**Esforço estimado:** 10 min
**Teste:** Verificar que SSR hydration usa o mesmo `queryClient`

---

## Fase 3 — Erros Médios 🟡

**Impacto:** Segurança, consistência, boas práticas.

### 3.1 — Adicionar try/catch nas server functions

**Ficheiros:**

- `src/lib/api/config.functions.ts`
- `src/lib/api/certificate.functions.ts`

**Problema:** Nenhum handler tem tratamento de erro. Erros de BD, PDF, ou filesystem propagam como 500 genérico.
**Solução:** Envolver cada handler em try/catch com logging e erro amigável.

**Passos:**

1. Abrir `src/lib/api/config.functions.ts`
2. Adicionar try/catch no handler `getSiteConfig` e `updateSiteConfig`
3. Abrir `src/lib/api/certificate.functions.ts`
4. Adicionar try/catch no handler `approveCertificate`
5. Usar `console.error("[functionName]", err)` em cada catch
6. Lançar mensagem amigável em português
7. Correr lint

**Esforço estimado:** 20 min
**Teste:** Simular erro de BD (ex: tabela dropping) e verificar resposta 500 com mensagem amigável

---

### 3.2 — Corrigir `config.functions.ts` — `.single()` → `.maybeSingle()`

**Ficheiro:** `src/lib/api/config.functions.ts:18`
**Problema:** `.single()` lança erro `PGRST116` se a tabela estiver vazia (0 rows). O código espera retornar `null`, mas na prática lança uma excepção.
**Solução:** Substituir `.single()` por `.maybeSingle()`.

**Passos:**

1. Abrir `src/lib/api/config.functions.ts`
2. Substituir `.single()` por `.maybeSingle()` na query `getSiteConfig`
3. Adicionar verificação de `error` (não apenas `!data`)
4. Correr lint

**Esforço estimado:** 5 min
**Teste:** Query com tabela vazia retorna `null` sem lançar erro

---

### 3.3 — Corrigir `whatsapp.ts` — Token exposto + dependências client-side

**Ficheiro:** `src/lib/whatsapp.ts`
**Problema 1:** `import.meta.env.VITE_EVOGO_TOKEN` inlineia o token EvoGo no bundle client.
**Problema 2:** O ficheiro é importado directamente de 2 componentes client (`admin.tsx`, `CertificatesTab.tsx`). Se removermos o VITE\_ fallback, estas chamadas deixam de funcionar porque `process.env` não está disponível no browser.

**Solução:** Criar server function wrapper + manter `whatsapp.ts` como módulo partilhado (não `.server.ts`) com o VITE\_ fallback como única opção client, OU migrar para server functions.

**Abordagem recomendada:**

1. Manter `whatsapp.ts` como está (não renomear) — as funções de formatação de mensagem são inofensivas no client, e o `getConfig()` com VITE\_ fallback permite uso opcional no client
2. Criar `src/lib/api/whatsapp.functions.ts` com server functions `sendEnrollmentWhatsApp` e `sendCertificateWhatsApp` que usam `process.env.EVOGO_*` do lado servidor
3. Manter chamadas de formatação de mensagem nos componentes client (são puras, sem token)
4. Actualizar `admin.tsx` e `CertificatesTab.tsx` para usar as server functions para enviar, em vez de importar `sendWhatsApp` directamente
5. Correr lint

**Esforço estimado:** 30 min
**Teste:** Verificar que bundle client não contém EVOGO_TOKEN e que WhatsApp continua a funcionar

---

### 3.4 — Migrar Admin Ops Sensíveis para Server Functions

**Ficheiros:**

- `src/components/admin/AdminsTab.tsx` (insert/delete user_roles)
- `src/components/admin/CertificatesTab.tsx` (reject certificate — aprovação já é server fn)
- `src/routes/_authenticated/admin.tsx` (delete lessons, update enrollments)

**Problema:** Operações destrutivas executadas com anon key directamente do browser. RLS é a única defesa. Se alguma RLS policy estiver mal configurada, qualquer aluno pode auto-promover-se a admin.
**Solução:** Criar server functions para operações admin críticas e substituir chamadas directas.

**Passos:**

1. Criar `src/lib/api/admin.functions.ts` com:
   - `addAdminRole` (INSERT user_roles)
   - `removeAdminRole` (DELETE user_roles)
   - `rejectCertificate` (UPDATE certificate_requests — preencher lacuna com a aprovação)
   - `deleteLesson` (DELETE lessons + materiais/quizzes associados)
   - `updateEnrollmentStatus` (UPDATE enrollments)
2. Cada função usa `requireSupabaseAuth` middleware + verificação de role admin
3. Substituir chamadas directas nos componentes pelas server functions
4. Correr lint

**Esforço estimado:** 45 min
**Teste:** Verificar que chamada directa `supabase.from("user_roles").insert(...)` do console browser falha (RLS), mas server function funciona para admin

---

### 3.5 — Adicionar `head()` ao `blog.$slug.tsx`

**Ficheiro:** `src/routes/blog.$slug.tsx`
**Problema:** Missing SEO meta tags. Todas as outras rotas definem `head()` com title + meta. Esta rota não tem, o que prejudica SEO e acessibilidade.
**Solução:** Adicionar função `head` com título baseado no slug (ou fetch do post para obter título real).

**Passos:**

1. Abrir `src/routes/blog.$slug.tsx`
2. Adicionar `head: ({ params }) => ({ meta: [...] })` à definição da rota
3. Incluir title com o slug (ou fazer loader para buscar título real)
4. Correr lint

**Esforço estimado:** 10 min
**Teste:** Verificar que página de post tem `<title>` no HTML renderizado

---

### 3.6 — Scoped Query Invalidation em `__root.tsx`

**Ficheiro:** `src/routes/__root.tsx:124`
**Problema:** `queryClient.invalidateQueries()` sem argumentos invalida TODAS as queries cacheadas, causando refetch desnecessário de queries não relacionadas com auth.
**Solução:** Especificar query keys relevantes.

**Passos:**

1. Abrir `src/routes/__root.tsx`
2. Substituir `queryClient.invalidateQueries()` por `queryClient.invalidateQueries({ queryKey: ["enrollments"] })`
3. Identificar outras query keys usadas no projecto e adicioná-las se relevante
4. Correr lint

**Esforço estimado:** 10 min
**Teste:** Confirmar que queries com keys diferentes não são refetchadas após auth change

---

### 3.7 — LSP Error: `requestId` type mismatch em `CertificatesTab.tsx`

**Ficheiro:** `src/components/admin/CertificatesTab.tsx:53` + `src/lib/api/certificate.functions.ts`
**Problema:** O LSP reporta:

> `Object literal may only specify known properties, and 'requestId' does not exist in type`

Isto ocorre porque o tipo inferido do `.inputValidator()` pode não estar a propagar correctamente os nomes das propriedades, possivelmente devido ao import estático do `supabaseAdmin` (item 1.2). Ao corrigir o item 1.2, o tipo pode começar a funcionar. Se não, é um bug no TanStack Start.

**Passos:**

1. Após corrigir o item 1.2, verificar se o LSP error persiste
2. Se persistir, investigar se é bug do TanStack Start ou se o `createServerFn` precisa de tipo explícito
3. Se for bug, adicionar `as const` ao objecto passado ou cast explícito
4. Correr lint

**Esforço estimado:** 10 min
**Teste:** LSP error desaparece após correcção

---

### 3.8 — Analisar Dependência Circular `router.tsx` ↔ `routeTree.gen.ts`

**Ficheiros:** `src/router.tsx`, `src/routeTree.gen.ts`
**Problema:** `router.tsx` importa `routeTree.gen.ts` (linha 3) e `routeTree.gen.ts` importa `router.tsx` (linha 224). Dependência circular. Mitigada por `import type` (elidido em runtime), mas frágil.
**Solução:** Verificar se o `import type` é suficiente; se não, refactor.

**Passos:**

1. Verificar que `routeTree.gen.ts` usa `import type { getRouter }` (apenas tipo, não valor)
2. Confirmar que o build não produz warnings de circular dependency
3. Se houver warnings, mover o tipo infere para um ficheiro `.d.ts` separado
4. Correr lint + build

**Esforço estimado:** 15 min
**Teste:** Build de produção não quebra nem produz warnings de circular dependency

---

## Fase 4 — Erros Baixos 🟢

**Impacto:** Limpeza, código morto, asset faltante.

### 4.1 — Remover import não usado `ReactNode` em `RichTextRenderer.tsx`

**Ficheiro:** `src/components/RichTextRenderer.tsx`
**Problema:** `import type { ReactNode } from "react"` na linha 1, mas `ReactNode` nunca é usado no componente.
**Solução:** Remover o import.

**Passos:**

1. Remover `import type { ReactNode } from "react"`
2. Correr lint

**Esforço estimado:** 2 min

---

### 4.2 — Corrigir prop `placeholder` no `RichTextEditor.tsx`

**Ficheiro:** `src/components/RichTextEditor.tsx`
**Problema:** A prop `placeholder` é aceita pelo componente mas nunca passada ao Tiptap. O `@tiptap/extension-placeholder` não está instalado. A prop é actualmente um no-op.
**Solução:** Instalar `@tiptap/extension-placeholder` e adicionar às extensões, ou remover a prop.

**Passos:**

1. Decidir abordagem: instalar extensão ou remover prop
2. Se instalar: `bun add @tiptap/extension-placeholder` + adicionar ao array de extensions
3. Se remover: remover a prop do tipo e do destructuring
4. Correr lint

**Esforço estimado:** 10 min

---

### 4.3 — Remover `reviewerName` do validator ou usar no handler

**Ficheiro:** `src/lib/api/certificate.functions.ts`
**Problema:** `reviewerName` é validado no `.inputValidator()` e destruturado no handler, mas nunca usado. O update do certificate_request não guarda o nome do revisor.
**Solução:** Usar `reviewerName` no update, ou remover do validator.

**Passos:**

1. Opção recomendada: adicionar `reviewer_name` ao update do certificate_requests (já guardamos `reviewer_id`, faz sentido guardar também o nome)
2. Se a BD não tiver coluna `reviewer_name`, apenas remover do validator
3. Correr lint

**Esforço estimado:** 5 min

---

### 4.4 — Corrigir caminho das fonts em `generate-pdf.server.ts`

**Ficheiro:** `src/lib/certificate/generate-pdf.server.ts`
**Problema:** `FONTS_DIR` é resolvido com `path.resolve(__dirname, "fonts")` relativo a `__filename`/`__dirname` constructos ESM (`fileURLToPath`, `import.meta.url`). Em build serverless (Vercel Nitro), o `__dirname` pode ser diferente do esperado, quebrando o carregamento das fonts.
**Solução:** Tornar a resolução robusta e adicionar try/catch.

**Passos:**

1. Verificar como o Nitro empacota assets estáticos (se as fonts vão para a pasta `dist/` ou ficam no bundle)
2. Se necessário, configurar o `nitro` plugin para incluir a pasta `fonts/` como asset
3. Adicionar try/catch no `loadFont()` com mensagem de erro clara
4. Correr lint

**Esforço estimado:** 20 min

---

### 4.5 — Logo partido (SVG placeholder)

**Ficheiro:** `src/assets/ondjango-logo.png` + `src/components/Logo.tsx`
**Problema:** O PNG real (891 KB) não está no repositório. Apenas existe `ondjango-logo.png.asset.json` com URL da Lovable Cloud que não resolve. O logo aparece partido em 3 locais (header, hero price card, footer).

**Solução:** Criar SVG inline com as iniciais "OC" usando as cores do tema (gold + brown).

**Passos:**

1. Abrir `src/components/Logo.tsx`
2. Substituir `<img>` por SVG inline com as iniciais "OC"
3. Usar `--color-gold` e `--color-primary` para consistência com o tema
4. Manter a prop `className` para controlo de tamanho
5. Opcional: obter o PNG original e colocá-lo em `src/assets/` se e quando disponível
6. Correr lint

**Esforço estimado:** 10 min

---

### 4.6 — Actualizar `AGENTS.md` — Caminhos incorrectos

**Ficheiro:** `AGENTS.md`
**Problema:** Documenta `src/__root.tsx` e `src/index.tsx` mas esses ficheiros não existem — estão em `src/routes/__root.tsx` e `src/routes/index.tsx`.
**Solução:** Corrigir caminhos.

**Passos:**

1. Substituir `src/__root.tsx` → `src/routes/__root.tsx` (2 ocorrências)
2. Substituir `src/index.tsx` → `src/routes/index.tsx` (1 ocorrência)
3. Verificar outros caminhos no documento
4. Remover referência obsoleta a "`cn()` de `@/lib/utils` para merge de classes" em admin components — já não se aplica

**Esforço estimado:** 5 min

---

## Fase 5 — Testes e Validação Final 🧪

**Objectivo:** Garantir que tudo funciona após as correcções.

| #   | Tarefa                                                  | Esforço | Depende de |
| --- | ------------------------------------------------------- | ------- | ---------- |
| 5.1 | Correr `bun run lint` — zero erros                      | 2 min   | Fases 1-4  |
| 5.2 | Correr `bun run dev` — servidor arranca sem warnings    | 2 min   | 5.1        |
| 5.3 | Navegar por todas as rotas manualmente                  | 10 min  | 5.2        |
| 5.4 | Testar login/auth flow                                  | 5 min   | 5.3        |
| 5.5 | Testar admin panel (cada tab)                           | 10 min  | 5.4        |
| 5.6 | Testar geração de certificado                           | 5 min   | 5.5        |
| 5.7 | Testar blog (list + post)                               | 5 min   | 5.5        |
| 5.8 | Correr `bun run build` — build de produção bem-sucedido | 5 min   | 5.1        |

---

## Resumo de Esforço Total

| Fase         | Tarefas | Esforço Estimado |
| ------------ | ------- | ---------------- |
| 0 — Setup    | 4       | 7 min            |
| 1 — Críticos | 2       | 25 min           |
| 2 — Altos    | 2       | 25 min           |
| 3 — Médios   | 8       | 2h 25 min        |
| 4 — Baixos   | 6       | 52 min           |
| 5 — Testes   | 6       | 29 min           |
| **Total**    | **28**  | **~4h 45 min**   |

---

## Dependências Entre Fases

```
Fase 0 (Setup)
  │
  ├── Fase 1 (Críticos)
  │     │
  │     ├── Fase 2.1 (auth subscription)
  │     │
  │     ├── Fase 3.1 (try/catch server fns)
  │     │     │
  │     │     ├── Fase 3.2 (.maybeSingle)
  │     │     └── Fase 3.4 (admin server fns)
  │     │
  │     └── Fase 3.7 (LSP error — pode resolver após 1.2)
  │
  ├── Fase 2.2 (QueryClient singleton)
  │     │
  │     └── Fase 3.6 (scoped invalidation)
  │
  ├── Fase 3.3 (WhatsApp — server functions)
  │
  ├── Fase 3.5 (blog head — independente)
  │
  ├── Fase 3.8 (circular dep — independente)
  │
  └── Fase 4 (baixos, podem ser paralelizados)
        │
        └── Fase 5 (Testes Finais)
```

---

## Notas Adicionais

- **Fase 3.4** (admin server functions) é a mais complexa — ~45 min
- **Fase 3.3** (WhatsApp) subiu de 15 min para 30 min — requer server function wrapper
- **Fase 3.8** (circular dep) pode ser apenas investigativa se o `import type` já resolver
- **Fase 5.8** (build produção) requer que o Nitro beta preset funcione
- Commits devem ser feitos após cada fase completa para facilitar rollback
- Itens removidos do plano original vs1: `error-capture.ts typo` (falso positivo — código correcto), `Link dead import` (falso positivo — é usado no NotFoundComponent)
