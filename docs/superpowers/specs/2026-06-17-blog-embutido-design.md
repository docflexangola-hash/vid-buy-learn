# Blog Embutido — Especificação de Design

**Data:** 2026-06-17
**Projecto:** Ondjango Capital — Costura do Zero ao Profissional
**Stack:** TanStack Start + Nitro + Supabase + Tailwind CSS v4 + shadcn/ui

---

## 1. Resumo

Adicionar um blog ao projecto onde administradores podem publicar artigos com editor rich text, e alunos (ou visitantes) podem lê-los. O blog suporta posts públicos e exclusivos para membros autenticados, rascunhos, imagem de capa, e gestão por autor.

---

## 2. Arquitectura

### 2.1 Rotas

```
/blog              → Listagem de posts publicados (público)
/blog/$slug        → Leitura do post (público, com restrição se members_only)
```

Admin tab "Blog" vive dentro da rota `/admin` (single-page com Tabs), seguindo o padrão existente.

### 2.2 Componentes novos

| Componente         | Localização                           | Função                                  |
| ------------------ | ------------------------------------- | --------------------------------------- |
| `RichTextEditor`   | `src/components/RichTextEditor.tsx`   | Editor Tiptap para o admin              |
| `RichTextRenderer` | `src/components/RichTextRenderer.tsx` | Renderização segura (DOMPurify) do HTML |

### 2.3 Ficheiros a modificar

| Ficheiro                                | Mudança                   |
| --------------------------------------- | ------------------------- |
| `src/integrations/supabase/types.ts`    | + `blog_posts` table type |
| `src/routes/_authenticated/admin.tsx`   | + Tab "Blog" com CRUD     |
| `src/components/SiteHeader.tsx`         | + Link "Blog" na navbar   |
| `supabase/migrations/...blog_posts.sql` | Nova migration (criar)    |

### 2.4 Dependências novas

| Pacote                                                                                         | Uso                                     |
| ---------------------------------------------------------------------------------------------- | --------------------------------------- |
| `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-image` + `@tiptap/extension-link` | Editor rich text                        |
| `dompurify`                                                                                    | Sanitização do HTML antes de renderizar |

---

## 3. Base de Dados

### 3.1 Tabela `blog_posts`

```sql
create table blog_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  content       text not null default '',
  excerpt       text not null default '',
  cover_image   text,
  author_id     uuid not null references profiles(id),
  published     boolean not null default false,
  members_only  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index para listagem cronológica
create index idx_blog_posts_published_created
  on blog_posts (published, created_at desc);

-- RLS
alter table blog_posts enable row level security;

-- Admins (autenticados com role=admin) podem CRUD
create policy "admins_all" on blog_posts
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Todos (público) podem SELECT apenas posts publicados
create policy "public_select_published" on blog_posts
  for select using (published = true);
```

### 3.2 Slug único com fallback

No momento de criar/editar o post (no client), gerar slug do título:

```
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

Antes de inserir, verificar se o slug existe. Se existir, appender `-1`, `-2` etc.

### 3.3 Buckets Storage

- `blog-covers` — imagens de capa dos posts (público)
- `blog-content` — imagens embutidas no conteúdo do Tiptap (público)

---

## 4. Componente RichTextEditor (Tiptap)

### 4.1 Toolbar

```
[Bold] [Italic] [Underline] | [H2] [H3] | [Bullet List] [Ordered List] | [Blockquote] | [Link] [Image]
```

### 4.2 Extensões

- `@tiptap/starter-kit` (Bold, Italic, Heading, BulletList, OrderedList, Blockquote)
- `@tiptap/extension-underline`
- `@tiptap/extension-link`
- `@tiptap/extension-image`

### 4.3 Image Upload

Botão "Image" na toolbar abre um file picker. O ficheiro é:

1. Upload para Supabase Storage bucket `blog-content`
2. URL público obtido
3. Inserido como `<img src="...">` no editor

### 4.4 Props

```tsx
type RichTextEditorProps = {
  content: string; // HTML inicial
  onChange: (html: string) => void;
  placeholder?: string;
};
```

---

## 5. Componente RichTextRenderer

Renderiza HTML do Tiptap de forma segura:

```tsx
type RichTextRendererProps = {
  content: string;
  className?: string;
};
```

- Sanitiza com DOMPurify antes de renderizar
- Aplica estilos Tailwind via className (prose-like)
- Usa `dangerouslySetInnerHTML` **após** sanitização

---

## 6. Admin — Tab Blog

### 6.1 Funcionalidades

| Acção            | Comportamento                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Listar posts** | Tabela com título, autor, publicado (sim/não c/ badge), exclusivo (badge ouro), data. Ordenado por created_at desc. Botões Editar / Apagar.                                        |
| **Criar post**   | Modal com formulário completo: title, slug (auto), excerpt, cover_image (upload + preview), members_only (toggle), content (RichTextEditor), botões "Salvar rascunho" e "Publicar" |
| **Editar post**  | Mesmo modal, pré-preenchido. Só permitido se `author_id === currentUserId`                                                                                                         |
| **Apagar post**  | Confirmação "Tem a certeza?" + delete. Só permitido se `author_id === currentUserId`                                                                                               |
| **Preview**      | Botão que abre o post renderizado (RichTextRenderer) num Dialog                                                                                                                    |

### 6.2 Verificação de autor

No backend (server function) ou no client antes de permitir editar/apagar:

```ts
const { data: post } = await supabase
  .from("blog_posts")
  .select("author_id")
  .eq("id", postId)
  .single();

if (post.author_id !== currentUserId) {
  toast.error("Só o autor pode editar este post");
  return;
}
```

---

## 7. Rota `/blog` (Listagem)

### 7.1 Comportamento

- GET `blog_posts` com `published = true`, ordenado por `created_at DESC`
- Paginação: 10 posts por página (offset/limit ou cursor)
- Grid de cards com:
  - `cover_image` (ou fallback gradiente)
  - `title`
  - `excerpt`
  - Data formatada
  - Nome do autor
  - Badge "Exclusivo alunos" se `members_only = true`
- Se utilizador não autenticado: posts com `members_only` aparecem mas o link leva à página de login

### 7.2 SEO

```tsx
head: () => ({
  meta: [
    { title: "Blog — Ondjango Capital" },
    { name: "description", content: "Artigos sobre corte e costura, dicas e novidades." },
  ],
}),
```

---

## 8. Rota `/blog/$slug` (Detalhe)

### 8.1 Comportamento

- Busca post por slug
- Se não encontrado → 404 customizado
- Se `members_only = true` e user não autenticado:
  - Mostra excerpt + mensagem "Faça login para ler o conteúdo completo"
  - Botão "Entrar" que redireciona para `/auth`
- Se autenticado ou público: renderiza conteúdo completo

### 8.2 Layout

```
[Breadcrumb: Blog > Título do Post]
[Capa (se existir)]
[Título]
[Autor · Data]
[RichTextRenderer com content]
```

### 8.3 SEO

```tsx
head: () => ({
  meta: [
    { title: `${post.title} — Blog Ondjango Capital` },
    { name: "description", content: post.excerpt },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.excerpt },
    ...(post.cover_image ? [{ property: "og:image", content: post.cover_image }] : []),
  ],
}),
```

---

## 9. SiteHeader — Link Blog

Adicionar link "Blog" no `SiteHeader.tsx`:

```tsx
<Button asChild variant="ghost" size="sm">
  <Link to="/blog">Blog</Link>
</Button>
```

- Visível para todos (autenticados e não autenticados)
- Posicionado antes de "Entrar" / "Meu curso"

---

## 10. Gaps & Edge Cases Resolvidos

| Gap                     | Solução                                               |
| ----------------------- | ----------------------------------------------------- |
| **Slug duplicado**      | Verificação + fallback numérico (`-1`, `-2`)          |
| **Excerpt vazio**       | Auto-gerado dos primeiros 150 caracteres do `content` |
| **XSS no HTML**         | DOMPurify no `RichTextRenderer`                       |
| **Imagens no conteúdo** | Upload para bucket `blog-content` via extensão Tiptap |
| **Cover image ausente** | Fallback visual (gradiente linear com cores do brand) |
| **SEO por post**        | `head()` dinâmico com title, description, og:image    |
| **Segurança (edição)**  | Verificação de `author_id` antes de editar/apagar     |
| **Post exclusivo**      | Badge na listagem + bloqueio de conteúdo no detalhe   |

---

## 11. Dependências

```bash
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image dompurify
bun add -D @types/dompurify
```

---

## 12. Não Escopo (excluído deliberadamente)

- Categorias / Tags
- Comentários nos posts
- Newsletter / subscrição
- RSS feed
- Modo escuro (já não existe no CSS actual)
- Versão em inglês
- Cache / ISR (deixar para fase de performance)
