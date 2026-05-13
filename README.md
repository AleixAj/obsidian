# OBSIDIAN - FW26 Aurum

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=fff)
![Laravel API](https://img.shields.io/badge/API-Laravel_11-ff2d20?logo=laravel&logoColor=fff)

Full-stack urban streetwear e-commerce built as a portfolio project: a dark,
gold-accented React storefront backed by a Laravel 11 API, deployed with a
production database and real authenticated user flows.

The goal is to demonstrate how a real client-facing commerce app is planned,
implemented and shipped: API-backed catalogue, authenticated account area,
cart and wishlist synchronisation, order creation, production deployment,
and documented technical decisions.

> Status: Etapa 8 complete. Live at
> [`obsidian.aleixaj.com`](https://obsidian.aleixaj.com), backed by a
> Railway Laravel API, managed MySQL database and seeded demo user.

## Project Scope

This repository is the frontend. The backend lives in
[`AleixAj/obsidian-api`](https://github.com/AleixAj/obsidian-api).

Implemented product features:

- Production deployment: [`obsidian.aleixaj.com`](https://obsidian.aleixaj.com).
- Catalogue pages powered by Laravel endpoints (`/api/products`, `/api/categories`).
- Product listing pages with category filtering, size/color filters and sorting.
- Product detail page with gallery, size/color selectors and "complete the look".
- Cart drawer with quantities, totals, free-shipping progress, authenticated backend sync and basic checkout.
- Wishlist persisted for guests and synced to backend for authenticated users.
- Account dashboard with backend-backed overview, orders, address CRUD and profile settings.
- Email/password registration and login with Laravel Sanctum cookie sessions.
- Guest cart/wishlist merge after login or registration.
- Basic checkout flow that converts the authenticated cart into a real order.
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
| Persistence | `localStorage` + backend cart/wishlist | Guest cart/wishlist survive refresh; both sync to Laravel after login. |
| Styling | Plain CSS + tokens | Demonstrates CSS fundamentals without framework lock-in. |
| Backend | Laravel 11 API | Separate repo, REST endpoints, Sanctum auth, MySQL in production. |
| Deploy | Cloudflare Workers + Assets + Railway | SPA on Cloudflare edge, Laravel API with managed MySQL. |

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
  - useAuth()
  - useAccount()
  - useCartSync()
  - useWishlistSync()
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

React Query owns server data (`products`, `categories`, `user`, `account`,
authenticated `cart`, authenticated `wishlist`). React Context owns local
UI state (`toasts`) and exposes cart/wishlist APIs to components.

Guests use `localStorage`, authenticated users use the Laravel API, and both
cart and wishlist merge into the backend account after login/register. That
keeps the browsing experience fast before auth while still making user data
portable across devices after auth.

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
- [`.notes/etapa-8-checkpoint.md`](./.notes/etapa-8-checkpoint.md) - deploy checkpoint.

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

Production frontend uses:

```env
VITE_API_URL=https://obsidian-api-production-8b5e.up.railway.app
```

## Scripts

```bash
npm run dev        # start Vite dev server
npm run typecheck  # TypeScript check, no emit
npm run build      # production build
npm run preview    # preview dist locally
npm run lint       # ESLint
```

Verified after Etapa 8:

- `npm run typecheck` passes.
- `npm run build` passes.
- Production smoke checks pass against Railway/Cloudflare.
- Sanctum auth works from `obsidian.aleixaj.com`.
- Production product images and catalogue data load from the Railway API.

## Production

- Frontend: [`https://obsidian.aleixaj.com`](https://obsidian.aleixaj.com)
- Backend API: [`https://obsidian-api-production-8b5e.up.railway.app`](https://obsidian-api-production-8b5e.up.railway.app)
- Health check: [`/api/health`](https://obsidian-api-production-8b5e.up.railway.app/api/health)
- Demo user: `demo@obsidian.test`

Deployment notes:

- The frontend is deployed through Cloudflare Workers + Assets using `wrangler.jsonc`.
- Cloudflare build command: `npm run build`.
- Cloudflare deploy command: `npx wrangler deploy`.
- SPA routing is handled by Wrangler's `not_found_handling="single-page-application"`.
- The old Pages-style `public/_redirects` file was removed because it caused a redirect loop in Workers + Assets.
- `src/lib/api.ts` guards production builds from accidentally using `localhost:8000`.

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
| `PATCH` | `/api/user` | Update name/email |
| `POST` | `/api/auth/register` | Create account and start session |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Server-side logout |
| `GET` | `/api/account` | Account dashboard summary |
| `GET` | `/api/orders` | User orders |
| `GET` | `/api/addresses` | User addresses |
| `POST` | `/api/addresses` | Create address |
| `PATCH` | `/api/addresses/{id}` | Update address / set default |
| `DELETE` | `/api/addresses/{id}` | Delete address |
| `GET` | `/api/cart` | Authenticated cart |
| `POST` | `/api/cart/items` | Add product to authenticated cart |
| `PATCH` | `/api/cart/items/{id}` | Update cart line quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove cart line |
| `DELETE` | `/api/cart/items` | Clear authenticated cart |
| `POST` | `/api/cart/merge` | Merge guest cart after login/register |
| `POST` | `/api/checkout` | Convert authenticated cart into an order |
| `GET` | `/api/wishlist` | Authenticated wishlist slugs |
| `POST` | `/api/wishlist/items` | Add product to authenticated wishlist |
| `DELETE` | `/api/wishlist/items/{slug}` | Remove product from wishlist |
| `DELETE` | `/api/wishlist/items` | Clear authenticated wishlist |
| `POST` | `/api/wishlist/merge` | Merge guest wishlist after login/register |

Money is stored in the API as integer cents (`price_cents`). The adapter
maps that to the existing UI `Product.price` number before components
render it.

## OAuth Setup (Deferred)

Google and GitHub OAuth routes are wired through the Laravel API, but
provider credentials are intentionally not committed. To enable it, create
OAuth apps with these production callbacks and set Railway variables:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://obsidian-api-production-8b5e.up.railway.app/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=https://obsidian-api-production-8b5e.up.railway.app/auth/github/callback
```

Until those values exist, the social buttons redirect back to `/auth`
with a clear "not configured" error instead of failing with a server error.

## Stripe Setup (Deferred)

Stripe/Cashier dependencies and env placeholders exist in the backend, but
real payment collection is intentionally deferred until Stripe keys/webhook
are created. The current checkout flow already creates real orders without
charging cards.

## Roadmap

- [x] Etapa 0 - Architecture decisions.
- [x] Etapa 1 - Laravel 11 backend, schema, seeders and public API.
- [x] Etapa 2 - React SPA consumes the backend via React Query.
- [x] Etapa 3 - Real auth: email/password + prepared OAuth routes.
- [x] Etapa 4 - Account dashboard connected to real user data.
- [x] Etapa 5 - Guest cart syncs into user cart on login.
- [x] Etapa 6 - Basic checkout: authenticated cart becomes an order.
- [x] Etapa 7 - Wishlist sync across devices.
- [x] Etapa 8 - Deploy: Cloudflare Workers + Assets, Railway and production demo user.
- [ ] Final polish - Activate Stripe payments and OAuth provider credentials.

## Why This Project Matters

Obsidian is deliberately not just a static mockup. It is structured like a
small production project:

- The UI is polished enough to judge product taste.
- The backend boundary is real, typed and isolated.
- Authentication, cart, wishlist, account data and checkout all cross the frontend/backend boundary.
- Data fetching has production concerns: cache, retries, loading states and errors.
- The app is deployed with real environment configuration, managed database and smoke checks.
- Decisions are documented in `PROCESS.md`, including trade-offs and rejected alternatives.
- The roadmap is incremental, so every stage can be reviewed and shipped cleanly.

## Credits

- Imagery: Unsplash placeholders and local brand/editorial assets.
- Typography: Syne, Space Grotesk and JetBrains Mono via Google Fonts.
- Logo and visual direction: Obsidian Studio concept.

---

Portfolio project. Not a real storefront.
