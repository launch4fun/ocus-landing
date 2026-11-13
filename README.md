# Ocus — Web3 Compliance & Operations Infrastructure

Hyper-minimalist B2B SaaS landing page for Ocus: EU MiCA, DORA, DAC8 compliance, licensing roadmaps, token status, and operational vendor orchestration.

## Features
- Pure HTML5 Canvas 3D ASCII Globe & Morphing Network animation
- Interactive 40-node SVG Operations DAG with pan/zoom and telemetry filters
- Clean, unstyled luxury minimalist aesthetic following [DESIGN.md](DESIGN.md)
- Zero external build step required — static HTML/CSS/JS ready for deployment (Vercel, Cloudflare Pages, GitHub Pages)

## Quick Start
Open `index.html` in any modern web browser or serve locally:

```bash
npx serve .
# or
python -m http.server 8000
```

## Structure
- `index.html` — Semantic landing page structure
- `landing.css` — Warm minimalist canvas stylesheet
- `landing-dag.css` — Interactive SVG DAG stylesheet
- `landing.js` — Client runtime controller & graph interactions
- `hero-ascii.js` — Procedural ASCII canvas render engine
- `assets/platform/` — High-resolution platform preview screens
