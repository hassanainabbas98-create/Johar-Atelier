# Tailwind to CSS Modules Protocol
**Skill:** `premium-artist-ui`  

This document details the conversion strategy for adapting community open-source primitives (from *Magic UI*, *Motion Primitives*, and *React Bits*) into strictly scoped, high-contrast **CSS Modules** for *The Archival Sanctuary*.

---

## 1. Core Conversion Table

| Tailwind Utility Class | CSS Modules Replacement | Archival Sanctuary Rule |
|---|---|---|
| `bg-white` / `bg-neutral-50` | `background-color: var(--color-canvas);` | Enforces Museum Alabaster (`#FBFBF9`). |
| `bg-neutral-100` / `bg-stone-100` | `background-color: var(--color-surface);` | Enforces Raw Linen (`#F4F1EA`). |
| `text-neutral-900` / `text-black` | `color: var(--color-text-primary);` | Enforces Obsidian Charcoal (`#181716`). |
| `text-neutral-500` / `text-stone-500` | `color: var(--color-text-caption);` | Enforces Deep Archival Slate (`#55524C`). |
| `border-neutral-200` | `border-color: var(--color-border-hairline);` | Hairline dividers (`#EAE5DC`). |
| `border-neutral-400` | `border-color: var(--color-border-control);` | Resting control borders (`#948E84`, WCAG 3:1). |
| `bg-amber-600` / `text-amber-700` | `background-color: var(--color-brand-mocha);` / `color: var(--color-accent-amber);` | Mocha Brown (`#5B4632`) or Burnt Amber (`#C8792C`). |
| `rounded-2xl` / `rounded-3xl` | `border-radius: 2px;` or `0px;` | Architectural, crisp museum framing. |
| `p-4` / `p-8` | `padding: var(--space-4);` / `padding: var(--space-8);` | Consistent 8pt archival rhythm. |
| `font-serif` | `font-family: var(--font-display);` | Cormorant Garamond. |
| `font-sans` | `font-family: var(--font-sans);` | Plus Jakarta Sans. |

---

## 2. Step-by-Step Porting Guide

1. **Extract State & Hooks:** Extract React states (`isOpen`, `activeTab`, `isHovered`) and `framer-motion` props.
2. **Remove Class Utilities:** Strip helper libraries like `clsx`, `twMerge`, and `cva`.
3. **Declare Scoped Module:**
   - Create `<ComponentName>.module.css`.
   - Write standard BEM-like or camelCase selectors: `.container`, `.cardHeader`, `.artworkMatte`.
4. **Enforce Motion Imports:**
   - Ensure imports use `from 'framer-motion'`, never `from 'motion/react'`.
5. **Enforce Accessibility Ring:**
   - Add `:focus-visible` using `outline: 2px solid var(--color-accent-amber); outline-offset: 2px;`.
