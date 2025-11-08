# Inagiffy

Hi — this is my small interactive mindmap app. I built it to sketch learning roadmaps and experiment with a simple, friendly UI: hover tooltips, a tiny minimap, expand/collapse controls, and quick export to SVG/PNG.

I prefer short notes, so here’s what matters if you want to run, modify, or share this project.

---

## What you get

- A React frontend (in `frontend/`) that renders an SVG mindmap. You can pan, zoom, hover nodes for details, and export the diagram.
- An optional Express backend (in `backend/`) that provides a `/generate` endpoint. The frontend falls back to a local generator if the backend isn’t running.

---

## Run it (PowerShell-friendly)

Two terminals is easiest: one for the backend and one for the frontend.

Backend (optional):

```powershell
cd .\backend
npm install
# run the server (or use npm start if set up)
node server.js
```

Frontend:

```powershell
cd .\frontend
npm install
npm start
```

Open the front-end in your browser (usually http://localhost:3000). If you don’t run the backend, the app will still generate maps locally.

---

## Quick tour

- Hover any node to see a tooltip (the tooltip shows `description` when available, otherwise the node label).
- Click the expand/collapse handle on a node to hide or show its children. The sidebar also has an Expand/Collapse all toggle.
- Use the minimap in the left sidebar to jump around the diagram (click or drag to pan).
- Select a node to open the details panel — here you’ll find resources and an "Explore" button that auto-generates deeper subtopics.
- Export to SVG or PNG from the sidebar.

---

## Where the important files live

- `frontend/src/App.js` — app state and the main SVG canvas.
- `frontend/src/App.css` — styles (including tooltip and minimap styles).
- `frontend/src/components/TreeNodes.js` — recursive node renderer and per-node interactions.
- `frontend/src/components/Minimap.js` — minimap logic and events.
- `frontend/src/components/Sidebar.js`, `Topbar.js`, `DetailsPanel.js` — UI pieces.
- `backend/server.js` — simple generator endpoint (optional).

If you want a quick map of where to edit things, start in `TreeNodes.js` (node layout/interaction) and `App.js` (pan/zoom state & data generation).

---

## Implementation notes (brief)

- The main SVG uses a fixed `VIEWBOX` and the app applies `translate/scale` on a `<g>` element for pan/zoom.
- The minimap reports normalized ratios (0..1) for a point; `App.js` converts those ratios back into diagram coordinates and recenters the view.
- Tooltips are DOM elements positioned using the mouse `clientX/clientY` values and `pointer-events: none` so they don’t block SVG events.
- The frontend will try `POST http://localhost:4000/generate` first; if that fails it falls back to a small local generator.

---

## Screenshots & GIFs

If you want images here, drop them in `assets/screenshots/` (PNGs) or `assets/gifs/` and reference them from the README. I added an `assets/` folder to keep things tidy.

Small markdown examples:

```markdown
![Overview](assets/screenshots/screenshot-home-1200x720.png)
```

```markdown
![pan demo](assets/gifs/demo-pan-zoom.gif)
```

---

## Common troubleshooting

- Backend 4000 error: make sure the backend is running or rely on the frontend fallback.
- Tooltip not showing: check that `showTooltips` is enabled in the sidebar and that `TreeNodes` emits hover events.
- Minimap feels off: the minimap uses `nodesLayout` bounds — if your data has very large coordinates, tweak the padding in `App.js`.

If something looks broken, open an issue or ping me with a screenshot and I’ll take a look.

---

## Contributing

If you want to help, small PRs are welcome. A few suggestions:

- Add useful tests for any new logic you add.
- Keep UI changes focused and include a screenshot in the PR description.
- Add or update the README when adding notable features.

License: none in this repo yet — add `LICENSE` (MIT is a good default) if you want others to reuse the code.

---

If you want me to tweak tone, add screenshots, or write a short release note for the repo, tell me which style you prefer (short and punchy, or longer and detailed) and I’ll update this file.

---

## Adding screenshots & animated GIFs

Visuals make the README much easier to scan. Below are recommended practices and ready-to-copy Markdown examples you can use when adding screenshots or short animated GIFs to this project.

Where to put files

- Place images under `assets/screenshots/` and animated GIFs under `assets/gifs/` at the repository root. This keeps the repo organized and makes paths predictable in the README.

Recommended filenames

- Use short, descriptive names and include size hints if useful, e.g.:
  - `screenshot-home-1200x720.png`
  - `screenshot-minimap-800x360.png`
  - `demo-pan-zoom.gif`

Image size and format suggestions

- Screenshots: PNG or WebP for clarity. Aim for 1200×720 (16:9) for wide screenshots or 800×600 for smaller sections.
- GIFs: Keep them short (3–6s) and small in file size. Prefer MP4/WebM for longer demos — markdown viewers on GitHub will not autoplay videos, but GIFs are widely supported.
- Consider using an online optimization tool (TinyPNG / Squoosh) to reduce repo size.

Markdown examples

Inline image (centered using plain markdown):

```markdown
![Mindmap overview](assets/screenshots/screenshot-home-1200x720.png)
```

Side-by-side small screenshots (two images):

```markdown
| Minimap | Details panel |
|---:|:---|
| ![minimap](assets/screenshots/screenshot-minimap-400x240.png) | ![details](assets/screenshots/screenshot-details-400x240.png) |
```

Animated GIF (small demo):

```markdown
![pan and zoom demo](assets/gifs/demo-pan-zoom.gif)
```

Tips for a clean README

- Keep screenshots focused: crop to the UI region you want to highlight.
- Add short captions or a one-line explanation under each image to provide context.
- Commit images in a single PR with the README update to keep history tidy.

If you'd like, I can create sample placeholder images (PNG/GIF) with simple annotated screenshots and add them to `assets/` for you to replace with higher-quality captures — tell me which screens you want (e.g., full canvas, minimap, tooltip example, export flow) and I'll add placeholders.
