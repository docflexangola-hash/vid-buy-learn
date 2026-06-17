# Design: Certificado PDF — Geração e Layout

**Data:** 2026-06-17
**Projeto:** vid-buy-learn (TanStack Start + Supabase + pdf-lib)
**Baseado no design system:** DESIGN.md

---

## 1. Contexto

O fluxo de certificados já existe parcialmente:

- Aluno solicita → `certificate_requests` com `status: "pending"`
- Admin aprova/rejeita na tab Certificados do admin
- **Falta:** gerar o PDF e fazer upload ao Storage, e permitir download pelo aluno

---

## 2. Geração do PDF (Server Function)

Nova server function em `src/lib/api/certificate.functions.ts`:

```ts
export const generateCertificate = createServerFn({ method: "POST" })
  .inputValidator(z.object({ requestId: z.string().uuid() }))
  .handler(async ({ data }) => {
    // 1. Buscar request + profile (service role)
    // 2. Gerar PDF com pdf-lib
    // 3. Upload para Supabase Storage bucket "certificates"
    // 4. Fazer update da request: status, certificate_url, reviewed_at, reviewer_id
    // 5. Retornar { success: true, url }
  });
```

### Dados do PDF

| Campo             | Origem                                       |
| ----------------- | -------------------------------------------- |
| Nome do curso     | Hardcoded: "Costura do Zero ao Profissional" |
| Nome do aluno     | `profiles.full_name`                         |
| Data de conclusão | `new Date()` no momento da aprovação         |

### Filename

`certificado-costura-do-zero-ao-profissional-{nome-do-aluno}.pdf`

O nome do aluno é sanitizado (lowercase, sem acentos, espaços → hífens).

### URL armazenada

A `certificate_url` na BD será a URL pública do Supabase Storage:
`https://{project}.supabase.co/storage/v1/object/public/certificates/{filename}`

(Em vez do path antigo `/certificates/{userId}.pdf` que era placeholder.)

---

## 3. Layout do PDF (A4 Paisagem)

Baseado no design system existente e aprovado como "Opção C — Marca / Institucional".

### 3.1 Dimensões

- **Tamanho:** A4 paisagem (297mm × 210mm)
- **Margens internas:** 20mm em todos os lados
- **Moldura:** Burnished Gold (`#c9a84c`) 3px contínua, com 4px de padding interno
- **Background:** Warm Artisan Cream (`#f5f0e8`)
- **Dot pattern:** 18px grid, opacidade reduzida (simulado com círculos pequenos)
- **Área interna:** fundo branco (`#faf7f0`)

### 3.2 Hierarquia Vertical

```
┌─────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────┐  │
│  │         (dot pattern subtle background)        │  │
│  │                                                 │  │
│  │      COSTURA DO ZERO AO PROFISSIONAL            │  │  ← 14pt, SemiBold, #3d2e1e, tracking 2px
│  │                                                 │  │
│  │               CERTIFICADO                       │  │  ← 28pt, Bold, #3d2e1e, tracking 3px
│  │                                                 │  │
│  │         ──── gold line (50% width) ────         │  │  ← 1.5px, #c9a84c
│  │                                                 │  │
│  │              Nome do Aluno                      │  │  ← 20pt, Bold, #3d2e1e
│  │   completou todos os requisitos do curso        │  │  ← 11pt, Regular, #6b5a4a
│  │                                                 │  │
│  │         ──── gold line (50% width) ────         │  │  ← 1.5px, #c9a84c
│  │                                                 │  │
│  │       Data de conclusão: 15 de Junho de 2026    │  │  ← 10pt, Regular, #8c7855
│  │                                                 │  │
│  │      _________________   _________________      │  │
│  │       Professora          Direção               │  │  ← 8pt, #6b5a4a
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 3.3 Tipografia (Fonte: Hanken Grotesk)

| Elemento            | Ficheiro TTF                 | Tamanho | Cor       |
| ------------------- | ---------------------------- | ------- | --------- |
| Header curso        | `HankenGrotesk-SemiBold.ttf` | 14pt    | `#3d2e1e` |
| Título CERTIFICADO  | `HankenGrotesk-Bold.ttf`     | 28pt    | `#3d2e1e` |
| Nome do aluno       | `HankenGrotesk-Bold.ttf`     | 20pt    | `#3d2e1e` |
| Texto descritivo    | `HankenGrotesk-Regular.ttf`  | 11pt    | `#6b5a4a` |
| Data                | `HankenGrotesk-Regular.ttf`  | 10pt    | `#8c7855` |
| Assinaturas (label) | `HankenGrotesk-Regular.ttf`  | 8pt     | `#6b5a4a` |

### 3.4 Cores

| Função           | Hex       | Descrição          |
| ---------------- | --------- | ------------------ |
| Background       | `#f5f0e8` | Warm Artisan Cream |
| Área interna     | `#faf7f0` | Off-white ligeiro  |
| Moldura / linhas | `#c9a84c` | Burnished Gold     |
| Títulos          | `#3d2e1e` | Deep Coffee Brown  |
| Corpo texto      | `#6b5a4a` | Warm Stone Gray    |
| Data             | `#8c7855` | Muted gold-brown   |

### 3.5 Dot Pattern

```ts
// Desenhado com pequenos círculos no PDF
// Grid de 18pt, opacidade ~0.15
for (let x = margin; x < width - margin; x += 18) {
  for (let y = margin; y < height - margin; y += 18) {
    page.drawCircle({ x, y, size: 1, color: rgb(0.55, 0.47, 0.33), opacity: 0.15 });
  }
}
```

---

## 4. Storage

- **Bucket:** `certificates` (já referido no spec anterior)
- **Path:** `certificado-costura-do-zero-ao-profissional-{nome-sanitizado}.pdf`
- **RLS:** admins write, enrolled students + admins read
- **Public ou signed URL:** Usar signed URL ou URL pública do bucket com RLS

---

## 5. Fontes

- Ficheiros TTF em `src/lib/certificate/fonts/`
- Carregados no handler da server function com `fs.readFileSync` (server-side apenas)
- 3 ficheiros: `HankenGrotesk-Regular.ttf`, `HankenGrotesk-SemiBold.ttf`, `HankenGrotesk-Bold.ttf`

---

## 6. Fluxo Completo

```
Admin clica "Aprovar" (admin.tsx)
  → chama generateCertificate({ requestId })
  → server function:
      a. Lê request + profile da BD (service role)
      b. Carrega as 3 fontes TTF
      c. Cria PDF com pdf-lib (layout acima)
      d. Converte PDF para Buffer
      e. Upload ao Supabase Storage bucket "certificates"
      f. Update certificate_requests: status="approved", certificate_url, reviewed_at, reviewer_id
      g. Retorna { success: true, url }
  → admin.tsx recebe resposta, dá toast de sucesso
  → Se aluno tem WhatsApp, envia notificação (já existe)
```

---

## 7. Download pelo Aluno

- Em `curso.tsx`, quando `request.status === "approved"` e `certificate_url` existe:
  - Mostrar botão "Descarregar Certificado"
  - Link aponta para a URL pública do Supabase Storage (`certificate_url`)
  - Bucket é público, por isso não precisa de signed URL

---

## 8. Tratamento de Erros

| Cenário                 | Ação                                            |
| ----------------------- | ----------------------------------------------- |
| Font TTF não encontrada | Log + toast "Erro ao gerar certificado (fonte)" |
| Falha upload Storage    | Tentar cleanup do PDF local, toast erro         |
| Request ID inválido     | 404, toast "Pedido não encontrado"              |
| Aluno sem full_name     | Usar "Aluno" como fallback                      |

---

## 9. Ficheiros a Criar/Modificar

| Ficheiro                               | Ação                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/lib/api/certificate.functions.ts` | Criar — server function                                                                      |
| `src/lib/certificate/fonts/*.ttf`      | Já copiado                                                                                   |
| `src/lib/certificate/generate-pdf.ts`  | Criar — lógica de geração PDF (pure function)                                                |
| `src/routes/_authenticated/admin.tsx`  | Modificar — `approve()` chama `generateCertificate` server function em vez de set URL manual |
| `src/routes/_authenticated/curso.tsx`  | Modificar — botão download quando aprovado                                                   |
