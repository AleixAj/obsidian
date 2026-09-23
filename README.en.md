# OBSIDIAN

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=fff)
![Laravel API](https://img.shields.io/badge/API-Laravel_11-ff2d20?logo=laravel&logoColor=fff)

<p>
  <a href="README.md"><img src="docs/readme/lang-es.svg" alt="Español" width="170"></a>
  <img src="docs/readme/lang-en-active.svg" alt="English" width="170">
  <a href="README.ca.md"><img src="docs/readme/lang-ca.svg" alt="Català" width="170"></a>
</p>

Full-stack e-commerce for a streetwear clothing store, built as a portfolio project: a React storefront with a dark aesthetic and gold accents, connected to a Laravel 11 API, deployed with a production database and real authenticated user flows.

The goal is to show how a commerce app is planned, built and deployed with a real-world approach: an API-driven catalog, an authenticated account area, synced cart and wishlist, order creation, production deployment and documented technical decisions.

## Screenshots

![Home hero](./docs/screenshots/home-hero.png)

![Lookbook section](./docs/screenshots/home-lookbook.png)

![Categories](./docs/screenshots/home-categories.png)

![Women collection](./docs/screenshots/shop-women.png)

![Product page](./docs/screenshots/product-detail.png)

## Project Scope

This repository contains the frontend. The backend lives in
[`AleixAj/obsidian-api`](https://github.com/AleixAj/obsidian-api).

Implemented features:

- Portfolio CI with lint, typecheck, unit tests and build on GitHub Actions.
- Production deployment: [`obsidian.aleixaj.com`](https://obsidian.aleixaj.com).
- Catalog served by Laravel endpoints (`/api/products`, `/api/categories`).
- Listing pages with filters by category, size, color and price, plus sorting.
- Product page with gallery, size/color picker and a "complete the look" section.
- Cart drawer with quantities, totals, free-shipping progress, backend sync and basic checkout.
- Wishlist that persists for guests and syncs with the backend for authenticated users.
- Account dashboard with overview, orders, address CRUD and profile settings.
- Email and password sign-up/login using Laravel Sanctum cookie sessions.
- Guest cart/wishlist merge after login or sign-up.
- Basic checkout that turns the authenticated cart into a real order.
- Responsive layout down to mobile.
- Loading skeletons and retryable error states.
- React Query Devtools in development.

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Build | Vite 8 | Fast SPA development and simple static deployment. |
| UI | React 19 | Component model, hooks and strong industry relevance. |
| Language | TypeScript 6 | Safer refactors and shared domain models. |
| Routing | React Router 7 | URL-driven pages and account sections. |
| Server state | TanStack React Query 5 | Caching, loading/error states, retries and request deduplication. |
| Client state | React Context | Cart, wishlist and toasts without adding Redux. |
| Persistence | `localStorage` + backend cart/wishlist | Guests keep their data; users sync with Laravel once authenticated. |
| Styling | Plain CSS + tokens | Shows CSS fundamentals without relying on a framework. |
| Backend | Laravel 11 API | Separate repository, REST endpoints, Sanctum auth and MySQL in production. |
| Deploy | Cloudflare Workers + Assets + Railway | SPA on the Cloudflare edge, Laravel API with managed MySQL. |

## Architecture

The frontend keeps a clear boundary with the API:

```txt
Laravel API DTOs
      |
src/lib/api.ts
  - fetchProducts()
  - fetchProduct()
  - fetchCategories()
  - toProduct()
  - toCategoryMap()
      |
src/hooks/queries/
  - useProducts()
  - useProduct()
  - useCategories()
  - useAuth()
  - useAccount()
  - useCartSync()
  - useWishlistSync()
      |
Pages and components receive UI-ready Product objects
```

This keeps the UI from rendering backend fields such as `price_cents` or `img_alt` directly. If the API shape changes, the adapter is updated in a single place.

### QueryClient Configuration

`src/lib/queryClient.ts` defines a shared client:

- `staleTime: 60_000`, because the catalog rarely changes during a session.
- `retry: 1`, to recover from transient failures without delaying the user too much.
- `refetchOnWindowFocus: false`, to avoid noisy refetches when switching tabs.

### Local State vs Server State

React Query manages server data (`products`, `categories`, `user`, `account`, authenticated `cart`, authenticated `wishlist`). React Context manages local UI state (`toasts`) and exposes the cart/wishlist APIs to components.

Guests use `localStorage`, authenticated users use the Laravel API, and both states are merged after login/sign-up. This keeps guest browsing fast without losing portability across devices.

## Project Structure

```txt
src/
├── components/
│   ├── cart/          # CartDrawer
│   ├── layout/        # Header, Footer, AnnounceBar, Layout
│   ├── product/       # ProductCard, ProductCardSkeleton
│   └── ui/            # Logo, Icon, Marquee, Placeholder, Reveal
├── context/           # CartContext, WishlistContext, ToastContext
├── data/              # Brand visual/editorial assets
├── hooks/
│   ├── queries/       # React Query hooks
│   ├── useLocalStorage.ts
│   └── useReveal.ts
├── lib/               # API client + QueryClient
├── pages/             # Home, Shop, Product, Lookbook, Auth, Account, Legal, NotFound
├── styles/            # CSS tokens, globals and per-page styles
├── types/             # Product, CartItem, Category
└── utils/             # formatPrice, pad
```

## Local Full-Stack Setup

### 1. Start the Backend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
```

Laravel should be available at `http://localhost:8000`.

Useful checks:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
Invoke-RestMethod http://localhost:8000/api/products
Invoke-RestMethod http://localhost:8000/api/categories
```

### 2. Start the Frontend

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

In production it uses:

```env
VITE_API_URL=https://obsidian-api-production-8b5e.up.railway.app
```

## Scripts

```bash
npm run dev        # starts Vite in development mode
npm run typecheck  # checks TypeScript without emitting files
npm run test:ci    # runs unit tests with Vitest
npm run build      # production build
npm run preview    # previews dist locally
npm run lint       # ESLint
```

Verified:

- `npm run typecheck` passes.
- `npm run test:ci` passes.
- `npm run build` passes.
- GitHub Actions runs lint, typecheck, tests and build on every push/PR.
- Production smoke checks against Railway/Cloudflare.
- Sanctum auth works from `obsidian.aleixaj.com`.
- Catalog images and data load from the Railway API.

## Production

- Frontend: [`https://obsidian.aleixaj.com`](https://obsidian.aleixaj.com)
- Backend API: [`https://obsidian-api-production-8b5e.up.railway.app`](https://obsidian-api-production-8b5e.up.railway.app)
- Health check: [`/api/health`](https://obsidian-api-production-8b5e.up.railway.app/api/health)
- Demo user: `demo@obsidian.test`

Deployment notes:

- The frontend is deployed with Cloudflare Workers + Assets using `wrangler.jsonc`.
- Cloudflare build command: `npm run build`.
- Deploy command: `npx wrangler deploy`.
- The SPA fallback is handled with `not_found_handling="single-page-application"`.
- The old `_redirects` file was removed because it caused a redirect loop on Workers + Assets.
- `src/lib/api.ts` prevents production builds from using `localhost:8000` by mistake.

## Backend Contract

The frontend currently consumes:

| Method | Endpoint | Usage |
|---|---|---|
| `GET` | `/api/products` | Home, recommendations, Account |
| `GET` | `/api/products?category={slug}` | Shop pages by category |
| `GET` | `/api/products/{slug}` | Product detail |
| `GET` | `/api/categories` | Shop header metadata |
| `GET` | `/api/health` | Smoke checks/manual monitoring |
| `GET` | `/api/user` | Current authenticated user |
| `PATCH` | `/api/user` | Update name/email |
| `POST` | `/api/auth/register` | Create account and sign in |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/logout` | Server-side logout |
| `GET` | `/api/account` | Account dashboard overview |
| `GET` | `/api/orders` | User orders |
| `GET` | `/api/addresses` | User addresses |
| `POST` | `/api/addresses` | Create address |
| `PATCH` | `/api/addresses/{id}` | Edit address / set as default |
| `DELETE` | `/api/addresses/{id}` | Delete address |
| `GET` | `/api/cart` | Authenticated cart |
| `POST` | `/api/cart/items` | Add product to cart |
| `PATCH` | `/api/cart/items/{id}` | Change quantity |
| `DELETE` | `/api/cart/items/{id}` | Remove line item |
| `DELETE` | `/api/cart/items` | Empty cart |
| `POST` | `/api/cart/merge` | Merge guest cart after login/sign-up |
| `POST` | `/api/checkout` | Turn cart into an order |
| `GET` | `/api/wishlist` | Authenticated wishlist slugs |
| `POST` | `/api/wishlist/items` | Add product to wishlist |
| `DELETE` | `/api/wishlist/items/{slug}` | Remove product from wishlist |
| `DELETE` | `/api/wishlist/items` | Empty wishlist |
| `POST` | `/api/wishlist/merge` | Merge guest wishlist after login/sign-up |

Money is stored in the API as integer cents (`price_cents`). The adapter converts it into the `Product.price` that components render.

## OAuth Setup

The Google/GitHub OAuth routes are implemented in Laravel
(`SocialiteController`). Only the credentials are missing, and they are added as
variables in Railway:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://obsidian.aleixaj.com/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=https://obsidian.aleixaj.com/auth/github/callback
```

**The `redirect_uri` must point to the public domain, not the Railway one.** The
Worker proxies `/auth/` to the backend (see `worker.js`), so the callback still
reaches Laravel — but the session cookie is then issued on
`obsidian.aleixaj.com`, which is the domain the SPA makes its requests from.
If the callback points to `*.up.railway.app`, the login appears to complete and
the user comes back logged out, because the cookie ends up on a different
domain and Sanctum never receives it.

To publish the Google consent screen in production mode (without a list of
test users), you need a home page URL and a privacy policy URL served from the
authorized domain: these are the `/privacy` and `/terms` routes
(`src/pages/Legal.tsx`).

Until those values exist, the social buttons redirect back to `/auth` with a
clear "not configured" error.

## Stripe Setup (Pending)

The Stripe/Cashier dependencies and env placeholders exist in the backend, but real payments are postponed until the keys and webhook are configured. The current checkout already creates real orders without charging a card.

## Roadmap

- [x] Stage 0 - Architecture decisions.
- [x] Stage 1 - Laravel 11 backend, schema, seeders and public API.
- [x] Stage 2 - React SPA consuming the backend with React Query.
- [x] Stage 3 - Real auth: email/password + OAuth routes ready.
- [x] Stage 4 - Account dashboard connected to real data.
- [x] Stage 5 - Guest cart synced to the user on login.
- [x] Stage 6 - Basic checkout: authenticated cart -> order.
- [x] Stage 7 - Wishlist synced across devices.
- [x] Stage 8 - Deploy: Cloudflare Workers + Assets, Railway and demo user.
- [x] Stage 9 - Legal pages (`/privacy`, `/terms`) required by the Google consent screen.
- [ ] Final polish - Enable Stripe payments and OAuth credentials.

## Why This Project Matters

Obsidian is not just a static mockup. It is structured as a small production project:

- The UI is polished enough to assess visual judgment.
- The backend boundary is real, typed and isolated.
- Auth, cart, wishlist, account and checkout span frontend and backend.
- Data fetching accounts for caching, retries, loading states and errors.
- The app is deployed with real configuration, a managed database and smoke checks.
- Decisions are documented in `PROCESS.md`, including trade-offs.
- The roadmap is incremental so it can be reviewed and deployed in stages.

## Credits

- Images: Unsplash and local/editorial brand assets.
- Typography: Syne, Space Grotesk and JetBrains Mono via Google Fonts.
- Logo and visual direction: Obsidian Studio concept.

---

Portfolio project. Not a real store.
