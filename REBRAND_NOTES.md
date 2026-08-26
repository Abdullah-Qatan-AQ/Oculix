# Oculix Complete Edition

This release starts from a fresh clone of the original repository and preserves the complete application surface. The map, all layer categories, aviation and maritime feeds, satellite orbit calculations, space broadcast, CCTV, alerts, markets, recon toolkit, search, directions, drawing/AOI tools, ArcGIS, World Remote, SCM, share, token, AI overview, chain brief, keyboard shortcuts, mobile navigation, API routes, and their tests remain in the tree.

Only product identity and presentation assets are changed. The original map module is carried forward as `OculixMap.tsx` with the same implementation and API. The original satellite orbit route and orbit tests are retained. The new OX SVG/PNG assets are used for the splash and header; the former presentation icon is no longer shown. The original MIT license is retained as required.

The PWA layer is additive: `public/site.webmanifest`, `public/sw.js`, the install prompt, and the refreshed icons support installation without removing live network functionality. Dynamic feeds still require connectivity.

## Run

```bash
npm install
npm run dev
```

## Validate

```bash
npm test
npm run build
```

Replace `your-github-account` placeholders in documentation and deployment metadata before publishing.

Made by Abdullah Qatan.
