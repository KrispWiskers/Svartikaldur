# Dice Roller

A polished, accessible dice roller for tabletop games. Built with Vite and vanilla TypeScript.

## Features

- Die types: **d4, d6, d8, d10, d12, d20, d100**
- Roll **1–20** dice at once
- Big **Roll** button; **Space** / **Enter** also roll
- Clear per-die faces plus a multi-dice **total**
- Snappy CSS roll animation (respects `prefers-reduced-motion`)
- Recent roll history (~10 entries) with clear
- Mobile + desktop layout, dark-friendly theme, keyboard accessible

## Quick start

```bash
cd dice-app
npm install
npm run dev
```

Then open the local URL  Vite prints (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview   # optional local preview of dist/
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Preview the production build |

## Accessibility notes

- Die type uses a radiogroup with `aria-checked`
- Count controls are labeled; Roll is a clear primary action
- Results region uses `aria-live="polite"`
- Focus rings on interactive controls
