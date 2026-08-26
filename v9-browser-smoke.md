# Oculix v9 browser smoke notes

- Local v9 served successfully on `http://localhost:3001` because port 3000 was occupied by an unrelated old process.
- Home route rendered the live MapLibre canvas, existing 3D/2D and MAP/SAT controls, token panel `$OCULIX`, layer groups, right tool rail, status ticker, and docs/support links.
- Splash/header visibly used `/oculix-icon.png`, derived from the uploaded reference image.
- Settings button opened a left-side control deck over the map without unmounting the map or removing the original rail.
- Arabic settings state rendered with RTL direction and Arabic labels. English toggle returned the settings surface and static labels to English.
- Settings surface exposed language, themes, sound, reduced motion, grid, scanlines, ticker, per-panel visibility, reset, PWA status, and `Made by Abdullah Qatan`.
- Dynamic/live payloads such as market values and earthquake feed were left untouched by the locale layer.

The scanline control changed the visual treatment while the map remained rendered. The served `site.webmanifest` now reports `Oculix`, `short_name: Oculix`, `display: standalone`, Arabic RTL metadata, and the derived 192/512 PNG icons.

Returning to the home route restored the complete v9 surface. The original 2D map control was clickable and changed the map view while the desktop header, status, tool rail, and bottom ticker remained present.

The original Space panel opened and showed its local controls and external-source state; the provider displayed YouTube's own sign-in/bot message, so only the provider playback is limited. The original Markets panel then opened with live market categories, space weather, AI overview, and defense instruments while the map and rail stayed active.

The original Live Alerts panel opened with its feed filters and source links. The original Drawing Tools panel opened with AREA, BOX, RADIUS, and PATH modes and its tracked-area/AOI readouts. Both were tested without changing the underlying page structure.
