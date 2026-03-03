# SousChef Brand Guide

> Reference for AI agents and developers building features for SousChef.

---

## Brand Personality & Voice

SousChef is a **warm, skilled kitchen assistant** — think the feeling of a well-loved kitchen with something delicious simmering on the stove.

**Tone:** Warm, encouraging, practical. Never clinical or pretentious.

- Use friendly, approachable language ("Let's make something great" not "Initiating recipe generation")
- Be helpful and specific, like a real sous chef guiding you through a recipe
- Celebrate cooking as an everyday joy, not a chore or a luxury
- Speak with confidence but stay humble — suggest, don't dictate

**Voice examples:**
- "What would you like to cook?" (not "Enter your query")
- "Here's a great recipe I found" (not "Results returned successfully")
- "Save this one for later!" (not "Add to collection")

---

## Color Palette (OKLCH)

The palette anchors on **terracotta/copper** (warmth, hearth, cooking) with **sage green** accents (fresh herbs, ingredients) and **warm neutrals** (cream, warm grays instead of cold zinc).

### Light Mode

| Token                     | Value                       | Purpose                              |
|---------------------------|-----------------------------|--------------------------------------|
| `background`              | `oklch(0.98 0.005 80)`     | Warm cream (not stark white)         |
| `foreground`              | `oklch(0.17 0.012 65)`     | Warm near-black                      |
| `card`                    | `oklch(0.99 0.003 80)`     | Slightly lighter warm cream          |
| `card-foreground`         | `oklch(0.17 0.012 65)`     | Same as foreground                   |
| `popover`                 | `oklch(0.99 0.003 80)`     | Matches card                         |
| `popover-foreground`      | `oklch(0.17 0.012 65)`     | Same as foreground                   |
| `primary`                 | `oklch(0.55 0.14 48)`      | Terracotta — brand anchor            |
| `primary-foreground`      | `oklch(0.98 0.005 80)`     | Cream white for text on primary      |
| `secondary`               | `oklch(0.955 0.01 80)`     | Warm off-white                       |
| `secondary-foreground`    | `oklch(0.25 0.012 65)`     | Warm dark                            |
| `muted`                   | `oklch(0.94 0.01 80)`      | Warm light gray                      |
| `muted-foreground`        | `oklch(0.50 0.015 65)`     | Warm mid-gray                        |
| `accent`                  | `oklch(0.92 0.03 150)`     | Sage green tint                      |
| `accent-foreground`       | `oklch(0.25 0.012 65)`     | Warm dark                            |
| `destructive`             | `oklch(0.577 0.245 27.325)`| Red — distinct from terracotta       |
| `destructive-foreground`  | `oklch(0.577 0.245 27.325)`| Red text on light destructive bg     |
| `border`                  | `oklch(0.90 0.01 75)`      | Warm border                          |
| `input`                   | `oklch(0.90 0.01 75)`      | Matches border                       |
| `ring`                    | `oklch(0.55 0.14 48)`      | Terracotta focus ring                |
| `sidebar`                 | `oklch(0.97 0.007 80)`     | Warm sidebar bg                      |
| `sidebar-foreground`      | `oklch(0.17 0.012 65)`     | Warm near-black                      |
| `sidebar-primary`         | `oklch(0.55 0.14 48)`      | Terracotta                           |
| `sidebar-primary-fg`      | `oklch(0.98 0.005 80)`     | Cream                                |
| `sidebar-accent`          | `oklch(0.92 0.03 150)`     | Sage green                           |
| `sidebar-accent-fg`       | `oklch(0.25 0.012 65)`     | Warm dark                            |
| `sidebar-border`          | `oklch(0.90 0.01 75)`      | Warm border                          |
| `sidebar-ring`            | `oklch(0.55 0.14 48)`      | Terracotta                           |

### Dark Mode

| Token                     | Value                       | Purpose                              |
|---------------------------|-----------------------------|--------------------------------------|
| `background`              | `oklch(0.17 0.012 65)`     | Warm dark                            |
| `foreground`              | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `card`                    | `oklch(0.20 0.012 65)`     | Slightly lighter dark                |
| `card-foreground`         | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `popover`                 | `oklch(0.20 0.012 65)`     | Matches card                         |
| `popover-foreground`      | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `primary`                 | `oklch(0.70 0.14 48)`      | Brighter terracotta for dark bg      |
| `primary-foreground`      | `oklch(0.17 0.012 65)`     | Warm dark text on primary            |
| `secondary`               | `oklch(0.26 0.015 65)`     | Warm dark surface                    |
| `secondary-foreground`    | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `muted`                   | `oklch(0.26 0.015 65)`     | Warm dark surface                    |
| `muted-foreground`        | `oklch(0.65 0.015 75)`     | Warm mid-gray                        |
| `accent`                  | `oklch(0.28 0.025 150)`    | Dark sage green                      |
| `accent-foreground`       | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `destructive`             | `oklch(0.396 0.141 25.723)`| Dark destructive                     |
| `destructive-foreground`  | `oklch(0.637 0.237 25.331)`| Bright destructive text              |
| `border`                  | `oklch(0.30 0.015 65)`     | Warm dark border                     |
| `input`                   | `oklch(0.30 0.015 65)`     | Matches border                       |
| `ring`                    | `oklch(0.70 0.14 48)`      | Terracotta focus ring                |
| `sidebar`                 | `oklch(0.20 0.012 65)`     | Warm dark sidebar                    |
| `sidebar-foreground`      | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `sidebar-primary`         | `oklch(0.70 0.14 48)`      | Terracotta                           |
| `sidebar-primary-fg`      | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `sidebar-accent`          | `oklch(0.28 0.025 150)`    | Dark sage green                      |
| `sidebar-accent-fg`       | `oklch(0.96 0.007 80)`     | Warm off-white                       |
| `sidebar-border`          | `oklch(0.30 0.015 65)`     | Warm dark border                     |
| `sidebar-ring`            | `oklch(0.70 0.14 48)`      | Terracotta                           |

### Chart Colors (Food-Inspired)

| Token     | Light                          | Dark                           | Inspiration     |
|-----------|--------------------------------|--------------------------------|-----------------|
| `chart-1` | `oklch(0.55 0.14 48)`         | `oklch(0.70 0.14 48)`         | Terracotta      |
| `chart-2` | `oklch(0.60 0.10 150)`        | `oklch(0.55 0.10 150)`        | Sage            |
| `chart-3` | `oklch(0.70 0.14 85)`         | `oklch(0.65 0.14 85)`         | Golden amber    |
| `chart-4` | `oklch(0.55 0.18 30)`         | `oklch(0.60 0.18 30)`         | Paprika         |
| `chart-5` | `oklch(0.60 0.08 240)`        | `oklch(0.55 0.08 240)`        | Muted blue      |

---

## Typography

| Use Case              | Font               | CSS Class / Variable    |
|-----------------------|--------------------|-------------------------|
| All UI text           | Inter              | `font-sans` / `--font-sans` |
| "SousChef" brand name | DM Serif Display   | `font-serif` / `--font-serif` |

**Rules:**
- DM Serif Display is **only** for the "SousChef" brand name — never for body text, headings, or UI labels
- Inter is the default for everything else
- The brand name uses: `font-serif text-primary` (+ appropriate size class)

---

## Iconography

- **Icon library:** `lucide-react` — use only Lucide icons for consistency
- **Brand icon:** `ChefHatIcon` — used in headers, empty states, and the login page
- **Brand icon color:** `text-primary` (terracotta) for prominent placements, `text-primary/40` for subtle empty states
- **General icons:** Use `text-muted-foreground` for decorative/secondary icons, `text-foreground` for actionable icons

---

## Component Styling Conventions

### Colors
- Use semantic tokens (`primary`, `muted`, `accent`, etc.) — never hardcode OKLCH values in components
- Primary actions (buttons, links, focus rings) use terracotta `primary`
- Subtle backgrounds use `muted` or `accent` (sage green for highlighting)
- Destructive actions stay red (`destructive`) — visually distinct from terracotta

### Focus States
- Focus rings are terracotta: the `ring` token maps to primary terracotta
- All interactive elements should show the terracotta focus ring

### Code Blocks (in chat)
- Inline code: `bg-primary/10` (terracotta tint)
- Code blocks: `bg-muted` (warm gray)

### Cards & Surfaces
- Cards use `bg-card` explicitly when they need to stand out from background
- Sidebar uses `bg-muted/30` for subtle depth

### Hover States
- Nav links: `hover:text-primary` (terracotta hover, not generic foreground)
- Destructive: `hover:text-destructive` (stays red)

---

## Do's and Don'ts

### Do
- Use warm cream backgrounds instead of pure white
- Apply `font-serif text-primary` to the "SousChef" brand name
- Use `ChefHatIcon` with `text-primary` for brand presence
- Keep the warm undertone in all neutral colors (hue 60-80)
- Use sage green (`accent`) for highlighting and active states
- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keep destructive red visually distinct from terracotta primary

### Don't
- Use pure gray (chroma 0) for any neutral — always add warm undertone
- Use DM Serif Display for anything other than "SousChef"
- Use cold blues or purples as primary or accent colors
- Hardcode color values in components — always use semantic tokens
- Mix icon libraries — stick to lucide-react
- Make the UI feel pretentious or clinical — keep it warm and approachable
