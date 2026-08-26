# Oculix 5.0

This distribution is branded as **Oculix** with the premium **OX** mark and a calm signal-grid visual system. The main screen is intentionally map-first: secondary layers and reconnaissance tools are hidden at startup and can be enabled from the Control Center.

The Control Center provides Arabic RTL and English modes, four visual themes (Zenith, Aurora, Ember, and Soft Paper), automatic preference persistence, advanced tool visibility, live ticker visibility, field-grid visibility, reduced-motion mode, one-click map recentering, refreshed transitions, glow treatments, and responsive settings layout. The product credit is **Made by Abdullah Qatan**.

## Local run

```bash
npm install
npm run dev
```

## Production check

```bash
npm run build
npm run start
```

Docker users can run `docker compose up --build` after copying `.env.example` to `.env` when optional integrations are needed.

Before publishing, replace placeholder URLs such as `oculix.example` and `your-github-account` with the final domain and GitHub owner.

## License note

The original MIT license notice is intentionally retained because the MIT license requires the copyright notice and permission notice to remain in copies or substantial portions of the software.
