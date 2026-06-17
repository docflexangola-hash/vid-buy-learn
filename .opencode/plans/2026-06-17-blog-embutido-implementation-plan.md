# Blog Embutido — Plano de Implementação

**Baseado na spec:** `docs/superpowers/specs/2026-06-17-blog-embutido-design.md`

---

## Ordem de Implementação

Cada fase tem dependência da anterior.

### Fase 1: Setup (sem deps)

1. Migration SQL `blog_posts` → `.sql` file
2. Update `types.ts` → + blog_posts types
3. Instalar dependências → tiptap, dompurify

### Fase 2: Componentes base (depois de deps instaladas)

4. `RichTextRenderer` → renderização segura HTML
5. `RichTextEditor` → editor Tiptap com toolbar

### Fase 3: Rotas (depois de componentes base)

6. `admin.tsx` → + Blog tab (CRUD)
7. `blog.tsx` → listagem pública
8. `blog.$slug.tsx` → detalhe público

### Fase 4: Final (independente)

9. `SiteHeader.tsx` → + link Blog

---

## Detalhe por Tarefa

### 1. Migration SQL

- Ficheiro: `supabase/migrations/20260617000000_blog_posts.sql`
- Tabela `blog_posts` com RLS + policies + indexes

### 2. types.ts

- Adicionar `blog_posts: { Row, Insert, Update }` dentro de `Tables`
- Adicionar `Tables` no `Database` type

### 3. Dependências

```bash
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image dompurify
bun add -D @types/dompurify
```

### 4. RichTextRenderer

- Import DOMPurify, sanitize content, render with dangerouslySetInnerHTML
- Prose-like styling via Tailwind

### 5. RichTextEditor

- Tiptap com StarterKit, Underline, Link, Image
- Toolbar: Bold, Italic, Underline, H2, H3, BulletList, OrderedList, Blockquote, Link, Image
- Image upload para Supabase Storage bucket `blog-content`
- Props: { content: string, onChange: (html: string) => void }

### 6. Admin Blog Tab

- Adicionar tab "Blog" no TabsList
- Lista de posts com: título, autor, publicado (badge), exclusivo (badge), data
- Modal "Novo Post" com formulário completo + RichTextEditor
- Modal "Editar Post" (pré-preenchido, verifica author_id)
- Apagar com confirmação (verifica author_id)
- Preview num Dialog

### 7. Rota /blog

- Buscar posts published=true, order by created_at desc
- Paginação (10 por página)
- Grid de cards com cover/fallback, título, excerpt, data, autor
- Badge "Exclusivo alunos" se members_only
- SEO: head() com meta tags

### 8. Rota /blog/$slug

- Buscar post por slug
- Se members_only + !user → mostrar excerpt + call-to-action login
- Breadcrumb, cover, título, autor, data, RichTextRenderer
- SEO dinâmico por post

### 9. SiteHeader

- Adicionar link "Blog" (variant ghost, size sm)
- Visível para todos os utilizadores

---

## Estimativa de Esforço

| Tarefa              | Esforço   |
| ------------------- | --------- |
| 1. Migration SQL    | ~15 min   |
| 2. types.ts         | ~10 min   |
| 3. Instalar deps    | ~5 min    |
| 4. RichTextRenderer | ~20 min   |
| 5. RichTextEditor   | ~45 min   |
| 6. Admin Blog tab   | ~90 min   |
| 7. Rota /blog       | ~45 min   |
| 8. Rota /blog/$slug | ~45 min   |
| 9. SiteHeader       | ~5 min    |
| **Total**           | **~4.5h** |
