# Design Source Files

Drop your AI Studio Vite projects here. Each subfolder = one design.

```
designs-src/
├── swiss-echo/       ← AI Studio project
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── raw-form/         ← Another design
│   ├── index.html
│   ├── package.json
│   └── src/
└── ...
```

## Build & Deploy

```bash
# Build all designs
npm run build:designs

# Build one specific design
npm run build:designs swiss-echo

# Then push
git add -A && git commit -m "update designs" && git push
```

The script will:
1. Run `npm install` + `npm run build` on each project
2. Copy the built output to `/public/designs/{slug}/`
3. Auto-inject the shared toolbar (viewport toggle + "I WANT THIS" button)
