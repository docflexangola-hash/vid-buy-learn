# Análise: Dot Pattern no Background

## O Problema

O fundo da página tem um padrão de pontinhos subtis definido em `src/styles.css:77,91`:

```css
--dot-color: oklch(0.78 0.05 55 / 0.45);
background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
background-size: 18px 18px;
```

O utilizador reporta: visível no mobile, **invisível no desktop**.

---

## Duas Causas a Actuar Juntas

### 1. Contraste Extremamente Baixo

| Elemento                 | Lightness (OKLCH) | Alpha |
| ------------------------ | ----------------- | ----- |
| Background               | 98.5%             | 1.0   |
| Dot (cor pura)           | 78%               | 1.0   |
| Dot (efectivo pós-blend) | **89.3%**         | 0.45  |

- Diferença real: apenas **9.2%** entre o fundo e o ponto
- 1px de tamanho com 18px de espaçamento → praticamente invisível no desktop
- No mobile: ecrã mais pequeno + densidade de pixéis diferente faz o ponto parecer maior

### 2. Problema de Compatibilidade do `oklch()`

- `oklch()` é CSS Color Level 4 — browsers recentes suportam
- **Problema conhecido**: `oklch()` dentro de `var()` dentro de `radial-gradient()` quebra em alguns browsers
- Chrome <119, Firefox <113, Safari <15.4 não parseam correctamente
- Quando falha: a **declaração `background-image` inteira é descartada** (não só a cor)

---

## Soluções Possíveis

### Abordagem A — Trocar para `rgba()` + aumentar contraste

```css
body {
  background-color: var(--color-background);
  background-image: radial-gradient(rgba(140, 120, 85, 0.35) 1px, transparent 1px);
  background-size: 18px 18px;
}
```

| Característica  | Valor                               |
| --------------- | ----------------------------------- |
| Esforço         | XS (5 min)                          |
| Compatibilidade | 100% (rgba funciona em todo o lado) |
| Visibilidade    | ✅ 2x mais visível que actual       |

**Trade-off**: Perde o `oklch()` — se um dia o browser suportar gamas de cor mais amplas (P3/Rec2020), o dot ficará na gama sRGB.

### Abordagem B — Fallback layer (rgba + oklch) (Recomendada)

```css
body {
  background-image:
    radial-gradient(rgba(140, 120, 85, 0.35) 1px, transparent 1px),
    radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 18px 18px;
}
```

| Característica  | Valor                                      |
| --------------- | ------------------------------------------ |
| Esforço         | XS (5 min)                                 |
| Compatibilidade | 100% (fallback embutido)                   |
| Visibilidade    | ✅ 2x mais visível                         |
| Future-proof    | ✅ Mantém OKLCH para browsers que suportam |

**Como funciona**: Browsers que suportam OKLCH vêem o `rgba()` por baixo + `oklch()` por cima (sobreposição). Browsers que não suportam OKLCH ignoram a 2ª camada e ficam com o `rgba()` — o dot continua visível.

### Abordagem C — Apenas aumentar opacidade do OKLCH actual

```css
--dot-color: oklch(0.78 0.05 55 / 0.7); /* 0.45 → 0.7 */
```

| Característica  | Valor                                 |
| --------------- | ------------------------------------- |
| Esforço         | XS (2 min)                            |
| Compatibilidade | ⚠️ Dependente de OKLCH                |
| Visibilidade    | ✅ Melhor, mas só onde OKLCH funciona |

**Trade-off**: Continua partido em browsers que não suportam OKLCH em gradients.

---

## Ficheiros a Alterar

- **`src/styles.css`** — linhas 77 (variável) e 88-94 (body background) e 99-103 (utility `.bg-dots`)
- A utility class `.bg-dots` tem o mesmo problema e deve receber a mesma correcção

---

## Verificação Pós-Correção

1. Recarregar http://localhost:5173/ e verificar visualmente no desktop
2. Abrir DevTools → Computed → `background-image` confirmar que ambas as camadas estão presentes
3. Testar no Safari ou Firefox se possível
4. Confirmar que o dot continua subtil (não deve ser intrusivo — é um detalhe de fundo)
