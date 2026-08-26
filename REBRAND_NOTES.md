# Oculix 5.0 — Nexus Edition

Oculix Nexus is a rebuilt presentation layer for the original MIT-licensed application. The application now opens with a new cinematic boot sequence and a map-first command surface rather than the former HUD arrangement. The new shell uses a premium OX monogram, Manrope and Noto Sans Arabic typography, editorial hero copy, a left navigation rail, live metric cards, and a subdued teal/violet visual language.

Secondary tools are hidden from the opening view and are exposed through the Nexus rail or the Control Center. The Control Center supports Arabic RTL and English, four themes, preference persistence, advanced tool visibility, live ticker visibility, field-grid visibility, reduced-motion mode, and map recentering. The Arabic surface also translates common labels rendered by dynamically opened legacy panels through `LocaleSurface`.

The Nexus shell and boot sequence include motion-rich orbiting elements, animated grid/noise, glowing status indicators, hover transitions, metric-card lift effects, and optional Web Audio API interface tones. Browsers may require a user click before audio can play; both the splash and the top bar provide explicit audio controls.

The product credit is **Made by Abdullah Qatan**. Before publishing, update placeholder URLs such as `oculix.example` and `your-github-account` with the final domain and GitHub owner.

## Local run

```bash
npm install
npm run dev
```

## Production check

```bash
npm test
npm run build
npm run start
```

## License note

The original MIT license notice is intentionally retained because the MIT license requires the copyright notice and permission notice to remain in copies or substantial portions of the software.
