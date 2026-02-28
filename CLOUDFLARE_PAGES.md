# Cloudflare Pages Deployment (Static Export)

This project is configured for static deployment to Cloudflare Pages.

## 1) One-time setup

1. Push this repository to GitHub.
2. In Cloudflare dashboard: `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select this repository.

## 2) Build configuration (in Cloudflare)

- Framework preset: `Next.js` (or `None` if you set custom command manually)
- Build command: `npm run pages:build`
- Build output directory: `out`
- Root directory: (leave empty unless your app is in a subfolder)

## 3) Local verification

```bash
npm install
npm run pages:build
```

If build succeeds, static files are generated in `out/`.

## 4) Optional CLI deploy

Login once:

```bash
npx wrangler login
```

Deploy:

```bash
npm run pages:deploy
```

On first deploy, Wrangler may ask for `project name`.

## Notes

- `next.config.mjs` uses:
  - `output: 'export'`
  - `images.unoptimized: true`
- This setup targets static hosting. If you later need server-side rendering or API routes on Cloudflare, migrate to a Worker adapter flow.
