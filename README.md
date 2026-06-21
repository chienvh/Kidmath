# Kidmath — Developer Guide

This README explains how to clone the repository, run the project locally for editing, push changes back to GitHub, and deploy the production build to Netlify.

Prerequisites
- Git installed
- Node.js 18+ (or the version in `package.json` engines if present)
- npm (comes with Node)
- (Optional) `netlify-cli` for CLI deployments

1) Clone the repo

Replace the URL with your fork or the original repository URL.

```bash
# clone
git clone https://github.com/chienvh/Kidmath.git
cd Kidmath
```

2) Install dependencies and run development server

```bash
# install deps
npm install

# run dev server (Vite)
npm run dev
```

Open `http://localhost:5173` (or the URL printed by Vite) and edit `src/App.jsx` or other files. The dev server supports hot reload.

3) Build production assets

```bash
npm run build

# production output will be in `dist/`
ls -la dist
```

4) Commit & push changes to GitHub

```bash
# check status
git status

# stage changed files
git add .

# commit
git commit -m "Describe your changes"

# push to your fork or origin
git push origin main
```

If you work on a feature branch, create and push the branch instead:

```bash
git checkout -b feature/my-change
git push -u origin feature/my-change
```

5) Deploy to Netlify

Option A — Connect repository on Netlify (recommended)
- Go to https://app.netlify.com and sign in.
- Click "New site from Git" → choose Git provider (GitHub) → select the `Kidmath` repo → set build command `npm run build` and publish directory `dist` → Deploy site.

Option B — Use Netlify CLI (deploy directly from your machine)

```bash
# install netlify-cli once globally
npm install -g netlify-cli

# login (opens browser)
netlify login

# link/init the site (runs interactively)
netlify init

# or deploy a one-off draft (useful for testing)
netlify deploy --dir=dist

# to publish the draft to production
netlify deploy --prod --dir=dist
```

Notes & tips
- `manifest.webmanifest` references `icons/icon-192.png` and `icons/icon-512.png`. If you replace icons, re-run `npm run build`.
- If Netlify build fails due to large JS chunks, consider code-splitting in your app (dynamic import) or increase chunk size limits in Vite config.
- For CI-based deploys, set Node version in Netlify build settings or add `.nvmrc` specifying the Node version.

Troubleshooting
- If `npm install` fails, delete `node_modules` and `package-lock.json` then `npm install` again.
- If the dev server URL is different (Vite chooses a different port), follow the terminal output.

Contact
- If you need me to automate any step (create release, CI, Netlify connect), tell me and I will proceed.
