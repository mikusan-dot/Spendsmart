# SpendSmart

Gamified offline-first expense tracker built with React + Vite + Firebase Firestore + Tailwind CSS.

Track expenses, set budgets, earn XP, unlock achievements, and get AI-powered insights about your spending habits. Works offline with localStorage fallback, syncs across devices via sync codes. Available as an Android app via Capacitor.

## Dev commands

```
npm run dev        Vite dev server
npm run build      production build → dist/
npm run lint       ESLint (flat config)
npm run preview    preview production build
```

## Android build

```bash
npm run build
npx cap sync
npx cap open android
```
