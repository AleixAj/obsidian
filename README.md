# OBSIDIAN - FW26 Aurum

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=fff)
![Laravel API](https://img.shields.io/badge/API-Laravel_11-ff2d20?logo=laravel&logoColor=fff)

Urban streetwear e-commerce built as a portfolio project: a dark,
gold-accented React storefront backed by a Laravel 11 API.

The goal is to show the full product journey an employer expects in a
real commerce app: browsable catalogue, product detail pages, cart,
wishlist, account area, API integration, and a roadmap toward auth,
checkout and deployment.

> Status: Etapa 2 complete. The SPA now consumes the Laravel catalogue
> through `@tanstack/react-query`. Auth and checkout are the next stages.

## Live Scope

This repository is the frontend. The backend lives in
[`AleixAj/obsidian-api`](https://github.com/AleixAj/obsidian-api).

Current user-facing features:

- Catalogue pages powered by `/api/products` and `/api/categories`.
- Product listing pages with category filtering, size/color filters and sorting.
- Product detail page with gallery, size/color selectors and "complete the look".
- Cart drawer with quantities, totals and free-shipping progress.
- Wishlist persisted in `localStorage`.
- Account dashboard UI with overview, orders, wishlist, addresses, settings and rewards.
- Responsive layout down to mobile widths.
- Loading skeletons and retryable API error states.
- React Query Devtools in development.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite 8 | Fast SPA development, simple static deployment. |
| UI | React 19 | Component model, hooks, broad hiring-market relevance. |
| Language | TypeScript 6 | Safer refactors and shared domain models. |
| Routing | React Router 7 | URL-driven pages and account sections. |
| Server state | TanStack React Query 5 | Cache, loading/error states, retries and request dedupe. |
| Client state | React Context | Cart, wishlist and toast state without Redux overhead. |
| Persistence | `localStorage` | Guest cart/wishlist survive refresh before auth exists. |
| Styling | Plain CSS + tokens | Demonstrates CSS fundamentals without framework lock-in. |
| Backend | Laravel 11 API | Separate repo, REST endpoints, SQLite dev DB, Sanctum-ready. |

## Architecture

The frontend keeps the API boundary explicit:

```txt
Laravel API DTOs
      |
      v
src/lib/api.ts
  - fetchProducts()
  - fetchProduct()
  - fetchCategories()
  - toProduct()
  - toCategoryMap()
      |
      v
src/hooks/queries/
  - useProducts()
  - useProduct()
  - useCategories()
      |
      v
Pages and components receive UI-ready Product objects
```

This means the UI never renders directly from backend fields like
`price_cents` or `img_alt`. If the API shape changes later, the adapter
changes in one place.

### QueryClient defaults

`src/lib/queryClient.ts` defines one shared client:

- `staleTime: 60_000` because catalogue data rarely changes during a session.
- `retry: 1` to recover from a transient backend hiccup without delaying users.
- `refetchOnWindowFocus: false` to avoid noisy refetches on every tab switch.

### Local vs server state

React Query owns server data (`products`, `categories`, later `user`).
React Context owns local UI state (`cart`, `wishlist`, `toasts`). This
keeps the app small while still separating the two kinds of state cleanly.

## Project Structure

```txt
src/
├── components/
│   ├── cart/          # CartDrawer
│   ├── layout/        # Header, Footer, AnnounceBar, Layout
│   ├── product/       # ProductCard, ProductCardSkeleton
│   └── ui/            # Logo, Icon, Marquee, Placeholder, Reveal
├── context/           # CartContext, WishlistContext, ToastContext
├── data/              # Brand/editorial assets only
├── hooks/
│   ├── queries/       # React Query hooks
│   ├── useLocalStorage.ts
│   └── useReveal.ts
├── lib/               # API client + QueryClient
├── pages/             # Home, Shop, Product, Lookbook, Auth, Account
├── styles/            # CSS tokens, globals, page styles
├── types/             # Product, CartItem, Category
└── utils/             # formatPrice, pad
```

Docs worth reading:

- [`PROCESS.md`](./PROCESS.md) - step-by-step "why we chose this" notes.
- [`.notes/etapa-2-checkpoint.md`](./.notes/etapa-2-checkpoint.md) - latest checkpoint before auth work started.

## Full-Stack Local Setup

### 1. Start the backend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
```

Laravel should be available at `http://localhost:8000`.

Useful endpoint checks:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
Invoke-RestMethod http://localhost:8000/api/products
Invoke-RestMethod http://localhost:8000/api/categories
```

### 2. Start the frontend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm install
npm run dev
```

Vite should be available at `http://localhost:5173`.

The frontend reads the API base URL from:

```env
VITE_API_URL=http://localhost:8000
```

## Scripts

```bash
npm run dev        # start Vite dev server
npm run typecheck  # TypeScript check, no emit
npm run build      # production build
npm run preview    # preview dist locally
npm run lint       # ESLint
```

Verified after Etapa 2:

- `npm run typecheck` passes.
- `npm run build` passes.
- API smoke checks pass against local Laravel (`/health`, `/products`, `/categories`, `/products/p1`).

## Backend Contract

The frontend currently consumes:

| Method | Endpoint | Used by |
|---|---|---|
| `GET` | `/api/products` | Home, Product related rail, Account |
| `GET` | `/api/products?category={slug}` | Shop category pages |
| `GET` | `/api/products/{slug}` | Product detail page |
| `GET` | `/api/categories` | Shop page header metadata |
| `GET` | `/api/health` | Manual smoke checks / future monitoring |
| `GET` | `/api/user` | Current authenticated user |
| `POST` | `/api/auth/register` | Create account and start session |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Server-side logout |

Money is stored in the API as integer cents (`price_cents`). The adapter
maps that to the existing UI `Product.price` number before components
render it.

## OAuth Setup (Deferred)

Google and GitHub OAuth routes are wired through the Laravel API, but
provider credentials are intentionally not committed. We keep this as a
final deployment task so callback URLs only need to be configured once,
after Cloudflare/Railway domains exist. To enable it later, create OAuth
apps and fill the backend `.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
```

Until those values exist, the social buttons redirect back to `/auth`
with a clear "not configured" error instead of failing with a server error.

## Roadmap

- [x] Etapa 0 - Architecture decisions.
- [x] Etapa 1 - Laravel 11 backend, schema, seeders and public API.
- [x] Etapa 2 - React SPA consumes the backend via React Query.
- [x] Etapa 3 - Real auth: email/password + prepared OAuth routes.
- [ ] Etapa 4 - Account dashboard connected to real user data.
- [ ] Etapa 5 - Guest cart syncs into user cart on login.
- [ ] Etapa 6 - Stripe checkout in sandbox mode.
- [ ] Etapa 7 - Wishlist sync across devices.
- [ ] Etapa 8 - Deploy: Cloudflare Pages + Railway/Render + activate OAuth callbacks.

## Why This Project Matters

Obsidian is deliberately not just a static mockup. It is structured like
a real client project:

- The UI is polished enough to judge product taste.
- The backend boundary is real, typed and isolated.
- Data fetching has production concerns: cache, retries, loading states and errors.
- Decisions are documented in `PROCESS.md`, including trade-offs and rejected alternatives.
- The roadmap is incremental, so every stage can be reviewed and shipped cleanly.

## Credits

- Imagery: Unsplash placeholders and local brand/editorial assets.
- Typography: Syne, Space Grotesk and JetBrains Mono via Google Fonts.
- Logo and visual direction: Obsidian Studio concept.

---

Portfolio project. Not a real storefront.
