# Design: Costura do Zero ao Profissional — Novas Funcionalidades

**Data:** 2026-06-15
**Projeto:** vid-buy-learn (TanStack Start + Supabase)

---

## 1. Materiais por Aula (PDF/Imagens)

### Tabela: `lesson_materials`

| Coluna       | Tipo                 | Descrição               |
| ------------ | -------------------- | ----------------------- |
| `id`         | uuid PK              |                         |
| `lesson_id`  | uuid FK → lessons.id |                         |
| `title`      | text                 | Nome do ficheiro        |
| `file_type`  | text                 | "pdf" ou "image"        |
| `file_url`   | text                 | URL do Supabase Storage |
| `created_at` | timestamptz          |                         |

### Storage

- Bucket: `lesson-materials`
- RLS: admins write, enrolled students + admins read

### Admin Flow

- Tab "Aulas" → botão "Gerir Materiais" em cada aula
- Modal: upload file → preview → salvar
- Lista materiais existentes com delete

### Student Flow

- `/curso` → abaixo do player: "Materiais de Apoio"
- Lista com ícone (PDF/image) + nome + download link

---

## 2. Quiz Opcional por Aula

### Tabela: `lesson_quizzes`

| Coluna          | Tipo                 | Descrição                       |
| --------------- | -------------------- | ------------------------------- |
| `id`            | uuid PK              |                                 |
| `lesson_id`     | uuid FK → lessons.id |                                 |
| `question`      | text                 |                                 |
| `options`       | jsonb                | `["opt1","opt2","opt3","opt4"]` |
| `correct_index` | int                  | Índice da opção correta (0-3)   |
| `position`      | int                  | Ordem da pergunta               |
| `created_at`    | timestamptz          |                                 |

### Tabela: `quiz_attempts`

| Coluna       | Tipo                        | Descrição          |
| ------------ | --------------------------- | ------------------ |
| `id`         | uuid PK                     |                    |
| `user_id`    | uuid FK → auth.users        |                    |
| `quiz_id`    | uuid FK → lesson_quizzes.id |                    |
| `score`      | int                         | Nº de acertos      |
| `total`      | int                         | Total de perguntas |
| `passed`     | bool                        |                    |
| `created_at` | timestamptz                 |                    |

### Regras

- Quiz é **opcional** — não bloqueia progresso nem certificado
- Aluno pode refazer à vontade
- Admin adiciona perguntas via modal na edição da aula

---

## 3. Comentários por Aula

### Tabela: `lesson_comments`

| Coluna       | Tipo                 | Descrição |
| ------------ | -------------------- | --------- |
| `id`         | uuid PK              |           |
| `lesson_id`  | uuid FK → lessons.id |           |
| `user_id`    | uuid FK → auth.users |           |
| `content`    | text                 |           |
| `created_at` | timestamptz          |           |
| `updated_at` | timestamptz          |           |

### Regras

- Apenas alunos com matrícula ativa e admins podem comentar
- Admin aparece com badge "Professor"
- Ordenado por mais recente
- Sem aninhamento (versão 1 simples)

---

## 4. Certificados (Solicitação do Aluno)

### Tabela: `certificate_requests`

| Coluna             | Tipo                 | Descrição                           |
| ------------------ | -------------------- | ----------------------------------- |
| `id`               | uuid PK              |                                     |
| `user_id`          | uuid FK → auth.users |                                     |
| `status`           | text                 | "pending" / "approved" / "rejected" |
| `rejection_reason` | text                 | nullable                            |
| `certificate_url`  | text                 | URL do PDF gerado                   |
| `requested_at`     | timestamptz          |                                     |
| `reviewed_at`      | timestamptz          | nullable                            |
| `reviewer_id`      | uuid FK → auth.users | nullable                            |

### Student Flow

- Completou todas as aulas → botão "Solicitar Certificado"
- Status: pendente → aguardando admin
- Se aprovado: download PDF
- Se rejeitado: vê motivo

### Admin Flow

- Nova tab "Certificados" no `/admin`
- Lista pedidos com status
- Aprovar → gera PDF e disponibiliza
- Rejeitar → campo de motivo

### PDF

- Gerado com `@pdf-lib/pdf-lib` (server-side)
- Conteúdo: nome do aluno, nome do curso, data de conclusão

---

## 5. Notificações WhatsApp (Evo Go)

### Integração

- API: Evo Go (https://evo-go.com)
- Novo campo em `profiles`: `whatsapp_number` (text, nullable)
- Admin configura token/instância no painel

### Gatilhos

| Evento              | Mensagem                                                   |
| ------------------- | ---------------------------------------------------------- |
| Matrícula ativada   | "Olá {nome}, o teu acesso ao curso foi ativado!"           |
| Certificado emitido | "O teu certificado já está disponível para download."      |
| Novo material       | "{Admin} adicionou novo material à aula {título}."         |
| Lembrete semanal    | "Não te esqueças de estudar! Tens {X} aulas por concluir." |

### Server Functions

- `sendWhatsApp(phone, message)` — chama API Evo Go
- Chamada nos momentos dos gatilhos

---

## Resumo de Novas Tabelas (5)

1. `lesson_materials`
2. `lesson_quizzes`
3. `quiz_attempts`
4. `lesson_comments`
5. `certificate_requests`

## Campos Novos em Tabelas Existentes

- `profiles`: +`whatsapp_number` (text)
- `lessons`: +`description` (text, opcional), +`duration` (int, minutos)

## Storage Buckets

- `lesson-materials` (ficheiros PDF/imagens)
- `certificates` (PDFs de certificados)
