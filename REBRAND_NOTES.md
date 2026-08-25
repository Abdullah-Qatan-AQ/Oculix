# Oculix rebrand

This distribution is branded as **Oculix** with the **OX** mark and a violet/cyan signal-grid visual system.

The application package, Docker services, runtime identifiers, metadata, documentation, icons, favicon, and social preview assets use the Oculix identity. The original MIT license notice is intentionally retained because the MIT license requires the copyright notice and permission notice to remain in copies or substantial portions of the software.

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
