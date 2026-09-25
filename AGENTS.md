# SpendSmart — Agent Instructions

## Dev commands
```bash
npm run dev      # Vite dev server
npm run build    # production build → dist/
npm run lint     # ESLint (flat config)
npm run preview  # preview production build
```

No test framework exists. No TypeScript — pure JSX.

## Architecture

- **SPA, no router** — tab-based navigation via `activeTab` state in `App.jsx`. Tabs: dashboard, expenses, budget, ai, progress. "More" menu: charts, export, settings.
- **Providers** (in order at `src/main.jsx:8-15`): `ThemeProvider` > `CurrencyProvider` > `App`.
- **Backend**: Firebase Firestore (real-time listeners via `onSnapshot`). Firebase config is public (committed).
- **Offline**: localStorage fallback in `src/utils/localStorage.js`. OfflineIndicator shows connectivity status.
- **Device-to-device sync**: localStorage-based UID sharing via SyncSetup component (not auth).
- **Gamification**: XP, levels, achievements stored in localStorage. Triggered on expense add, AI use, PDF export.
- **Gestures**: custom `useGesture` hook — no gesture library.
- **Themes**: 7 built-in dark themes. CSS variables applied dynamically via `ThemeContext`. `darkMode: 'class'` in Tailwind but all themes are dark.

## Android (Capacitor)
```bash
npm run build                   # build web assets → dist/
npx cap sync                    # copy to android/
npx cap open android            # open Android Studio
```
Capacitor config: `capacitor.config.json` — appId `com.spendsmart.app`.

## File layout
```
src/
  main.jsx              → entry (mounts App with providers)
  App.jsx               → root component, tab routing, FAB, bottom nav
  firebase.js           → Firebase init (auth, firestore)
  context/              → ThemeContext, CurrencyContext
  hooks/                → useUser, useGamification, useGesture, useOfflineExpenses
  components/           → 19 components (no nested directories)
  utils/                → localStorage, currencies, gamification, haptics, transitions
  index.css             → Tailwind directives + global styles + animations
```

## Conventions

- All files are `.jsx` or `.js` — never `.ts`/`.tsx`.
- CSS: Tailwind utility classes + CSS variables (`var(--bg)`, `var(--accent)`, etc.).
- Styling pattern: `style={{ backgroundColor: theme.bg }}` for dynamic theme values.
- Categories: `Food`, `Travel`, `Shopping`, `Bills`, `Other` — hardcoded in multiple components.
- Currency: `format(amount)` from `useCurrency()` returns symbol-prefixed localized string.
- localStorage keys are prefixed: `spendsmart_*` and `ss_*`.

## ECC (Enhanced Code Capabilities)

ECC is installed as a global OpenCode plugin (`~/.config/opencode/` provides hooks, custom tools, events) and as a project-level config (`opencode.json` + `.opencode/` dir provides agents, commands, skills).

**Slash commands**: `/plan`, `/tdd`, `/code-review`, `/security`, `/build-fix`, `/refactor-clean`, `/orchestrate`, `/learn`, `/checkpoint`, `/verify`, `/eval`, `/test-coverage`, `/setup-pm`, `/skill-create`
