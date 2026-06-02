# Rock Paper Scissors

Rock Paper Scissors with Firebase Realtime Database high scores. The **2022 vanilla JS delivery** is preserved under `/legacy/`; the **modern rebuild** uses Vite and TypeScript at the site root.


Rock Paper Scissors with Firebase Realtime Database high scores. The **2022 vanilla JS delivery** is preserved under `/legacy/`; the **modern rebuild** uses Vite and TypeScript at the site root.

[![GitHub](https://img.shields.io/github/stars/Elli2022/rock-paper-scissors?style=social)](https://github.com/Elli2022/rock-paper-scissors)

## Live (Netlify)

| Version | URL |
|--------|-----|
| **Modern** (Vite + TypeScript) | https://rock-paper-scissors-elli2022.netlify.app/ |
| **Original** on same site | https://rock-paper-scissors-elli2022.netlify.app/legacy/index.html |
| **Original** (standalone deploy) | https://gleaming-churros-1af9d1.netlify.app/ |

GitHub Pages has been removed; hosting is on Netlify only.

**Continuous deploy:** the site is linked to `Elli2022/rock-paper-scissors` on branch `main` (`npm run build` → `dist`, see `netlify.toml`). Every push to `main` triggers a production build on [Netlify](https://app.netlify.com/projects/rock-paper-scissors-elli2022).

## What is included

- **`src/`** — Modern game UI, typed round logic, Firebase high-score sync.
- **`public/legacy/`** — Original 2022 delivery (`index.html`, `script.js`, `style.css`, `images/`) so you can compare behavior and styling.
- **Firebase** — Same Realtime Database endpoint as the original project (`stensaxpase-d3b57`).

## Stack (modern)

| Layer | Choice |
|-------|--------|
| Build | [Vite](https://vitejs.dev/) 6 |
| Language | TypeScript (strict) |
| UI | Vanilla DOM + CSS (no framework overhead for a small game) |
| Hosting | [Netlify](https://www.netlify.com/) |

### Game rules (modern)

- Enter your name and start a match.
- First player to **3** round wins takes the match.
- Beating your stored high score updates Firebase (same `scores/{name}` shape as the original).

## Local development

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The legacy site is available at `http://localhost:5173/legacy/index.html`.

## Build & preview

```bash
npm run build
npm run preview
```

## Deploy (Netlify)

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

Or connect the GitHub repo in the Netlify UI with:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 (see `netlify.toml`)

## Repository

https://github.com/Elli2022/rock-paper-scissors

## Course context

School miniproject for **JavaScript 2** (FE22): Rock Paper Scissors (“Sten Sax Påse”) with Firebase high scores.
