# Problemas de Design Detectados

## 1. Logo Partido (404 - 3 ocorrências)

**Ficheiro fonte:** `src/assets/ondjango-logo.png.asset.json`
**Referenciado em:** `src/components/Logo.tsx`

O ficheiro `.asset.json` contém uma URL de asset da Lovable Cloud que **não existe localmente**:

```json
{
  "url": "/__l5e/assets-v1/3c0e3f90-4eab-4bcc-846d-a0323df34c1c/ondjango-logo.png",
  "r2_key": "a/v1/.../ondjango-logo.png"
}
```

O PNG real (891 KB) não está incluído no repositório.

**Ocorre em 3 locais:**

- Header (logo `h-9`)
- Card do preço na hero (logo `h-24`)
- Footer (logo `h-8`)

## 2. Estado Actual do Dev Server

- **CSS**: Carrega correctamente (Tailwind v4 + tema com cores OKLCH)
- **Fontes**: Hanken Grotesk carrega da Google Fonts
- **Conteúdo**: Todo o texto renderiza (hero, benefícios, preço, FAQ)
- **Botões/Componentes**: shadcn/ui a funcionar

---

## Opções de Correção

### Opção A — Colocar o PNG original no projecto (recomendado)

1. Obter o ficheiro `ondjango-logo.png` original
2. Colocar em `src/assets/ondjango-logo.png`
3. Alterar `src/components/Logo.tsx` para importar o PNG directamente

### Opção B — Placeholder SVG temporário

Criar um logo SVG inline baseado nas iniciais "OC" com as cores do tema (gold #B8860B / brown primário). O site fica funcional imediatamente sem depender de assets externos.

### Opção C — Fazer download do asset via Lovable Cloud

Se o projecto ainda estiver conectado à Lovable Cloud, fazer download do PNG via `https://[project].lovable.app/__l5e/assets-v1/3c0e3f90-.../ondjango-logo.png`.
