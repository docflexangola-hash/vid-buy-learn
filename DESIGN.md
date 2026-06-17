# Design System: Ondjango Capital — Costura do Zero ao Profissional

## 1. Visual Theme & Atmosphere

Warm, artisanal, and tactile. The interface rests on a soft cream canvas (oklch 0.985 0.012 70) with a subtle dot-pattern texture (18px radial gradient) that evokes handcrafted fabric — a nod to the sewing theme. The overall mood is **welcoming and professional**, balancing editorial refinement with the warmth of a local atelier.

**Key Characteristics:**

- Warm cream foundation with subtle texture, avoiding sterile white
- Deep coffee brown as the anchoring brand colour
- Burnished gold as a prestige accent (badges, highlights, rings)
- Hanken Grotesk typography — clean, modern sans-serif with character
- Generous whitespace with comfortable card-based layouts
- Sticky header with glassmorphism (backdrop-blur)

## 2. Color Palette

### Surfaces

- **Warm Artisan Cream** (#background, oklch 0.985 0.012 70) — Page background. A warm, inviting off-white that grounds the experience.
- **Pure White** (#card, oklch 1 0 0) — Card and container surfaces. Crisp contrast against the cream background.
- **Soft Muted Sand** (#muted, oklch 0.94 0.018 70) — Secondary surfaces, subtle section backgrounds.

### Brand & Interaction

- **Deep Coffee Brown** (#primary, oklch 0.24 0.035 45) — Primary actions, button backgrounds, key headings. The brand's anchoring colour — substantial and trustworthy.
- **Burnished Gold** (#gold, oklch 0.7 0.12 70) — Accent colour for badges, icons, highlights, focus rings. Evokes premium quality and accomplishment.
- **Warm Clay** (#accent, oklch 0.92 0.05 70) — Hover states, subtle interactive feedback.

### Text

- **Dark Roast Brown** (#foreground, oklch 0.22 0.03 50) — Primary text. Soft near-black with warmth.
- **Warm Stone Gray** (#muted-foreground, oklch 0.48 0.025 55) — Secondary text, descriptions, metadata.

### Strokes & Borders

- **Gentle Border Sand** (#border, oklch 0.88 0.02 65) — Card borders, dividers, structural lines.
- **Soft Input Sand** (#input, oklch 0.9 0.02 65) — Form input borders.

### Functional States

- **Alert Red** (#destructive, oklch 0.58 0.22 25) — Destructive actions, errors, deletions.

## 3. Typography

**Primary Font:** Hanken Grotesk, ui-sans-serif, system-ui, sans-serif

### Hierarchy

- **Headings (h1-h4):** Weight 700, letter-spacing -0.01em. Bold and confident.
- **Body:** Weight 400, antialiased, comfortable line-height.
- **UI Labels / Buttons:** Weight 500-600, text-sm (0.875rem). Compact and readable.
- **Small / Meta:** Weight 400, text-xs to text-sm (0.75-0.875rem). Recessive but legible.

### Principles

- Headings use tight letter-spacing for a modern, editorial feel
- All text is antialiased for sharp rendering on retina displays
- Consistent vertical rhythm through Tailwind's spacing scale

## 4. Component Stylings

### Buttons

- **Shape:** rounded-md (6-8px radius) — subtle but defined
- **Default variant:** Deep Coffee Brown background with white text, h-9, px-4
- **Hover:** opacity 90% darkening, smooth transition-colors
- **Focus-visible:** ring-1 in Burnished Gold
- **Disabled:** opacity-50, cursor-not-allowed
- **Outline variant:** 1px border-input, transparent bg, hover fills with Warm Clay
- **Ghost variant:** transparent, hover fills with Warm Clay
- **Size variants:** default (h-9), sm (h-8), lg (h-10), icon (h-9 w-9)

### Cards

- **Shape:** rounded-xl (12px radius) — generously rounded
- **Background:** Pure White
- **Border:** 1px solid Gentle Border Sand
- **Shadow:** subtle shadow utility (shadow on default card)
- **Padding:** p-6 (1.5rem) — comfortable internal spacing
- **Header/Content/Footer:** consistent spacing with pt-0 on content

### Inputs & Forms

- **Shape:** rounded-md (6-8px radius)
- **Border:** 1px solid Soft Input Sand
- **Background:** transparent (bg-transparent)
- **Shadow:** shadow-sm for subtle depth
- **Focus:** ring-1 in Burnished Gold
- **Padding:** px-3 py-1 (text-base), md:text-sm
- **Disabled:** cursor-not-allowed, opacity-50
- **Labels:** text-sm font-medium (via Label component)

### Badges

- **Shape:** rounded-md (6-8px radius), px-2.5 py-0.5
- **Typography:** text-xs, font-semibold
- **Default variant:** Deep Coffee Brown bg with white text
- **Secondary variant:** Soft Muted Sand bg with Dark Roast Brown text
- **Destructive variant:** Alert Red bg with white text
- **Outline variant:** transparent, text-foreground, border

### Tabs

- **TabsList:** horizontal row of triggers
- **Trigger (active):** Burnished Gold bg with dark text
- **Trigger (inactive):** transparent with muted text
- **Content:** pt-4 spacing below tabs

### Dialogs

- **Shape:** rounded-xl (12px radius) on content
- **Background:** Pure White
- **Shadow:** large shadow overlay
- **Header:** DialogTitle in font-semibold
- **Overlay:** semi-transparent black backdrop

## 5. Layout Principles

### Container & Width

- **Max content width:** max-w-6xl (1152px) with px-4 edge padding
- **Admin area:** max-w-5xl (1024px) — slightly narrower for management interfaces

### Spacing Rhythm

- **Section padding:** py-8 to py-20 depending on importance
- **Component spacing:** space-y-4 to space-y-6 between related blocks
- **Card internal padding:** consistent p-6 (1.5rem)
- **Form spacing:** space-y-2 between label + input, space-y-3 between fields

### Navigation

- **Header:** sticky top-0, z-40, full-width, border-b, backdrop-blur
- **Height:** h-16 (64px) — compact but touch-friendly
- **Nav items:** flex with gap-2, Button variants (ghost, outline)

### Grid & Alignment

- **Landing page:** md:grid-cols-2 for hero sections
- **Cards:** flex wrap with gap, or single-column stacked
- **Admin lists:** divide-y divide-border inside cards
- **Text alignment:** left-aligned body, centered hero headlines where appropriate

### Responsive Strategy

- Mobile-first via Tailwind's breakpoint prefix system
- Cards stack vertically on mobile, grid on desktop
- Padding scales down on mobile (px-4)
- Header collapses navigation to essential links

## 6. Dot Pattern Texture

A signature visual element — a subtle dot pattern applied to the page background:

```
background-image:
  radial-gradient(rgba(140, 120, 85, 0.35) 1px, transparent 1px),
  radial-gradient(var(--dot-color) 1px, transparent 1px);
background-size: 18px 18px;
```

- Colour: warm brown at low opacity (0.45)
- Scale: 18px grid — noticeable but not distracting
- Available as utility class `.bg-dots` for reuse
- Evokes fabric weave / sewing pattern — thematically aligned with the brand
