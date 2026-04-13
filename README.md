# FXCalc Pro · Professional Forex Calculator

A full-featured forex calculator web app built with **React + Vite**.
13 calculator tabs, live exchange rates, trade journal, PWA, dark/light theme.

---

## ✅ Complete Feature List

| # | Feature | Tab |
|---|---------|-----|
| 1 | Pip Value Calculator | Pip Value |
| 2 | Pip Difference Calculator | Pip Diff |
| 3 | Position Size (risk-based) | Position Size |
| 4 | Leverage Ratio + risk level | Leverage |
| 5 | Margin Required | Margin |
| 6 | Profit & Loss (long/short) | P&L |
| 7 | Risk/Reward + visual bar + trade quality | Risk/Reward |
| 8 | Swap / Rollover Cost | Swap |
| 9 | Break-Even (spread + commission + slippage) | Break-Even |
| 10 | Multi-Position Exposure Tracker | Exposure |
| 11 | Live Currency Converter + quick reference table | Converter |
| 12 | Trade Journal with stats, win rate, net P&L | Journal |
| 13 | Compound Account Growth Projector + SVG chart | Growth |
| 14 | Dark / Light theme toggle | Header |
| 15 | Keyboard shortcuts 1–9, arrow keys | Global |
| 16 | Click-to-copy on all result rows | Global |
| 17 | Pair Favorites (★ star, localStorage) | All selects |
| 18 | 65 currency pairs in 5 groups | All selects |
| 19 | Live rates — Frankfurter.app (free, no key) | Rates bar |
| 20 | Cross-rate derivation via USD triangulation | All tabs |
| 21 | PWA — installable on phone/desktop | — |
| 22 | Offline support via service worker | — |

---

## 🗂 Project Structure

```
fxcalc-pro/
├── index.html
├── vite.config.js
├── package.json
├── generate-icons.js          ← run to make PWA icons
├── public/
│   ├── favicon.svg
│   ├── manifest.json          ← PWA manifest
│   └── sw.js                 ← Service worker
└── src/
    ├── main.jsx / App.jsx / index.css
    ├── hooks/
    │   ├── useRates.js        ← live FX rates
    │   ├── useJournal.js      ← trade journal (localStorage)
    │   ├── useTheme.js        ← dark/light toggle
    │   └── useFavorites.js    ← starred pairs
    ├── utils/
    │   ├── constants.js       ← 65 pairs, lot sizes, TABS
    │   └── calculations.js    ← all forex math functions
    └── components/
        ├── ForexCalculator.jsx/.css
        ├── RatesBar.jsx/.css
        ├── shared.jsx/.css
        ├── tabs.module.css
        ├── PipValueTab.jsx
        ├── PipDiffTab.jsx
        ├── PositionSizeTab.jsx
        ├── LeverageTab.jsx
        ├── MarginTab.jsx
        ├── PnLTab.jsx
        ├── RiskRewardTab.jsx/.css
        ├── SwapTab.jsx/.css
        ├── BreakEvenTab.jsx
        ├── ExposureTab.jsx/.css
        ├── ConverterTab.jsx/.css
        ├── JournalTab.jsx/.css
        └── CompoundTab.jsx/.css
```

---

## 🚀 Run Locally

```bash
cd fxcalc-pro
npm install
npm run dev
# → http://localhost:5173
```

### Fix Vite v8 warning (one-time)
```bash
npm install @vitejs/plugin-react-oxc --save-dev
npm uninstall @vitejs/plugin-react
```
Update `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc'
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
})
```

### Build for production
```bash
npm run build    # → dist/
npm run preview  # preview locally
```

---

## ⌨ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` – `9` | Jump to tab |
| `←` `→` | Navigate tabs |
| Click any result | Copy to clipboard |

---

## ★ Pair Favorites
Click the **★** button next to any pair dropdown to pin it.
Pinned pairs appear first under **★ Favorites** in every dropdown.
Saved in localStorage — persists across sessions.

---

## 📲 PWA Install
Open the app in Chrome → tap menu → **Add to Home Screen**.

To generate proper PNG icons:
```bash
npm install sharp
node generate-icons.js
```

---

## 🌐 Deploy Free
- **Vercel**: `npm i -g vercel && vercel`
- **Netlify**: build then drag `dist/` to netlify.com

---

## ⚠️ Disclaimer
For educational use only. Swap rates are indicative defaults.
Always verify with your broker. Forex involves substantial risk.
