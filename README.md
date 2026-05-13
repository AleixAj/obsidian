# OBSIDIAN — FW26 Aurum

An urban streetwear e-commerce front-end. Heavyweight aesthetic, gold-cast hardware, designed in black-on-black with `#d4af37` accents. Built as a portfolio piece to showcase production-grade React architecture.

> **Status** — Storefront fully functional (browse, filter, PDP, cart, wishlist). Auth & account exist as UI mocks. Real auth/backend are next.

---

## Stack

| Layer        | Tool                                                      |
| ------------ | --------------------------------------------------------- |
| Build / Dev  | [Vite 8](https://vitejs.dev) + native ES modules          |
| UI           | [React 19](https://react.dev)                             |
| Language     | [TypeScript 6](https://www.typescriptlang.org)            |
| Routing      | [React Router 7](https://reactrouter.com) (`BrowserRouter`) |
| State        | React Context (`Cart`, `Wishlist`, `Toast`)               |
| Persistence  | `localStorage` (cart + wishlist survive refresh)          |
| Linting      | ESLint + `typescript-eslint`                              |
| Styling      | Plain CSS with design tokens (`variables.css`)            |
| Fonts        | Syne (display) ✦ Space Grotesk (body) ✦ JetBrains Mono    |

No CSS framework. No state library. The goal is to demonstrate that strong **fundamentals** can carry a polished UI without piling on dependencies.

---

## Features

- **Catalogue** — 11 demo products, multiple categories, sizes & colours.
- **Listing page** — sort + filter by size, colour, price range.
- **Detail page** — image gallery, colour & size selectors, accordion, "complete the look".
- **Cart drawer** — quantity controls, free-shipping progress bar, totals.
- **Wishlist** — toggleable from the PDP, persisted across reloads.
- **Toast system** — non-blocking confirmations for small actions.
- **Responsive** — tested down to ~360 px; hamburger menu, filter drawer, single-column grids.
- **Persistence** — cart & wishlist survive a hard refresh via `localStorage`.
- **Page transitions** — subtle fade-in, scroll-up on route change.
- **Reveal-on-scroll** — `IntersectionObserver` staggers cards into view.
- **Cursor blob** — gold light follows the cursor on pointer-fine devices.
- **Live countdown** — drop release timer recomputed every second.

---

## Project structure

```
src/
├── components/
│   ├── cart/        → CartDrawer
│   ├── layout/      → Header, Footer, AnnounceBar, Layout (site shell)
│   ├── product/     → ProductCard
│   └── ui/          → Logo, Icon, Marquee, Placeholder, Reveal, CursorBlob
├── context/         → CartContext, WishlistContext, ToastContext
├── data/            → products.ts (static catalogue + IMAGES + CATEGORY_META)
├── hooks/           → useLocalStorage, useReveal
├── pages/           → Home, Shop, Product, Lookbook, Auth, Account, NotFound
├── styles/          → variables.css, globals.css, pages.css
├── types/           → Domain models (Product, CartItem, Category)
├── utils/           → format.ts (formatPrice, pad)
├── App.tsx          → Providers + Router + Layout composition
└── main.tsx         → Mount + style imports
```

Two folders sit next to `src/` for reference and history:

- `public/` — `obsidian-logo.png`, `favicon.png` (the brand mark).
- `_prototype/` — the original Claude Design HTML/JSX prototype this project was rebuilt from. Useful side-by-side to show the "before → after" upgrade.

---

## Architecture highlights

### 1. Strong typing across the boundary

A single `Product` interface in `src/types/index.ts` flows through the catalogue, cart, wishlist and pages. Refactor a field once and TypeScript catches every dependent.

### 2. State lives in context, not props

Cart and wishlist are global. Pages and components consume them via `useCart()` / `useWishlist()`, never via prop drilling. The contexts internally use a `useLocalStorage` hook so the persistence is invisible to the rest of the app.

### 3. Derived values are memoised

`totalCount`, `subtotal`, filtered product lists — anything that's a function of state — uses `useMemo` so unrelated state updates don't trigger heavy recomputations.

### 4. Routing-driven UI state

The active account section lives in the URL (`/account/orders`, `/account/wishlist`, …) instead of in component state. Means the user can refresh, share, or bookmark a section.

### 5. CSS tokens, not magic numbers

Every colour, font and spacing value comes from CSS custom properties declared in `variables.css`. Changing the brand colour is a one-line edit.

```css
:root {
  --gold: #d4af37;
  --font-display: "Syne", sans-serif;
  --font-body: "Space Grotesk", sans-serif;
}
```

### 6. Accessibility-aware

- `aria-label` on icon-only buttons.
- `aria-pressed` for toggle buttons (e.g. wishlist).
- `Escape` closes the cart drawer.
- Mobile menu is focus-aware and locks body scroll when open.
- Color contrast and font sizes respect WCAG AA on dark backgrounds.

---

## Getting started

```bash
# install dependencies
npm install

# start the dev server (default: http://localhost:5173)
npm run dev

# type-check without emitting
npm run typecheck

# production build
npm run build

# preview the production bundle locally
npm run preview

# lint
npm run lint
```

Requires Node ≥ 20.

---

## Backend

A companion **Laravel 11** API lives in [`obsidian-api`](../obsidian-api) (separate repo on deploy). The frontend talks to it via `src/lib/api.ts`, configured with `VITE_API_URL`. See `.env.example`.

Etapa 1 (current): the SPA still ships with the static catalogue in `src/data/products.ts`; the backend is live but the screens have not been wired to it yet. Etapa 2 swaps the static array for `fetchProducts()`.

## Roadmap

- [x] Production-grade UI, cart, wishlist, persistence.
- [x] Laravel 11 backend (`obsidian-api`) with `/api/products`, `/api/categories`, Sanctum.
- [ ] Wire the SPA to `/api/products` (Etapa 2).
- [ ] Real authentication — email/password + OAuth Google/GitHub (Etapa 3).
- [ ] Account dashboard wired to the backend (Etapa 4).
- [ ] Cart sync — guest cart merges into the user cart on login (Etapa 5).
- [ ] Checkout flow with Stripe (Etapa 6).
- [ ] Wishlist sync (Etapa 7).
- [ ] Deploy: Cloudflare Pages (frontend) + Railway/Render (backend) (Etapa 8).
- [ ] Search modal with keyboard shortcuts.
- [ ] Internationalisation (es, en).
- [ ] Unit tests (Vitest + Testing Library).

---

## Credits

- Imagery — [Unsplash](https://unsplash.com) (placeholder only, not for commercial use).
- Logo — designed by the brand owner.
- Type — [Syne](https://gitlab.com/bonjour-monde/fonderie/syne-typeface) + [Space Grotesk](https://github.com/floriankarsten/space-grotesk) via Google Fonts.

---

© 2026 Obsidian Studio. Portfolio project — not a real storefront.
