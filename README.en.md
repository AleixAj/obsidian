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

![Home hero](./docs/screenshots/home-hero.jpg)

![Lookbook section](./docs/screenshots/home-lookbook.jpg)

![Categories](./docs/screenshots/home-categories.jpg)

![Women collection](./docs/screenshots/shop-women.jpg)

![Product page](./docs/screenshots/product-detail.jpg)

![Admin panel: overview](./docs/screenshots/admin-overview.png)

![Admin panel: returns](./docs/screenshots/admin-returns.png)

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
- Admin panel at `/admin` with roles, orders, stock, customers, returns, team and a 3D warehouse ([see section](#admin-panel-admin)).
- One-click demo access (shop and panel) to review the project without signing up.
- End-to-end Playwright test of the main flow.
- Shop and panel in Spanish and English, demo data included ([see section](#languages-es--en)).

## Admin panel (`/admin`)

An internal tool like a real shop would have, in the same SPA but loaded separately
(shop visitors never download its code).

**Try it without signing up:** open [`/admin/login`](https://obsidian.aleixaj.com/admin/login)
and pick a role with the demo buttons: Aleix Auqué (admin), Javier Molina (warehouse) or
Lucía Fernández (customer support). The shop login also has a "demo customer" shortcut.
The sample data (about 900 orders over 90 days, 60 customers, stock and returns) resets
itself every 24 hours and is consistent: every return comment matches its reason and every
address belongs to its city.

Team accounts (the demo ones too) see an **Admin** button in the shop header to go straight
to the panel; customers don't see it.

![Shop header with the admin button](./docs/screenshots/shop-header-admin.png)

![Product page with the stock grid](./docs/screenshots/admin-product-stock.png)

| Section | What it does |
|---|---|
| Overview | Sales, orders, average ticket and return rate (today / 7 / 30 days) compared with the previous period, chart, best sellers, latest orders and low stock alerts. |
| Orders | Filters, search, detail and step-by-step status changes (paid → preparing → shipped → delivered) with a history of who did what. |
| Products & stock | Create and edit products, colours, sizes and photos (uploaded from the computer). Stock per colour and size with a movement history. Checkout takes units out of stock. |
| Customers | List with total spent, and a profile with addresses and order history. |
| Returns | The customer asks from their account (30 days); support approves or rejects it and refunds (simulated, no Stripe yet). Stock comes back automatically. |
| Users & roles | Team, permissions table, adding people and changing their role. |
| Warehouse 3D | 192 locations (aisle, bay and level) drawn in 3D: each box has the colour of its stock and the height of how full it is. Plan and List views for phones, search by SKU or location, restock and move products. |
| Export | Every list downloads as CSV or Excel. |

**3D warehouse** (`/admin/warehouse`): made with react-three-fiber (Three.js written as React
components). It uses the same data as the rest of the panel: each location holds a variant and
its stock, and a restock creates a normal stock movement. The 3D code only downloads when that
page opens, and phones or browsers without WebGL open the Plan view.

![3D warehouse](./docs/screenshots/admin-warehouse-3d.png)

**Roles** (checked by the API on every request, not only in the UI):

| | Admin | Warehouse | Customer support |
|---|:---:|:---:|:---:|
| Overview and orders | ✓ | ✓ | ✓ |
| Stock | ✓ | ✓ | |
| Edit products | ✓ | | |
| Customers and returns | ✓ | | ✓ |
| Users and roles | ✓ | | |

**Decisions:**

- Permissions live in one place (`App\Enums\Role` in the API), with Laravel Gates on the routes.
- Demo accounts are shared: they only see demo data and can't upload files, change the
  public catalogue or the team (otherwise anyone could give themselves admin access). Demo
  data is restored every day.
- Photos are resized and saved as WebP with GD, on a Railway volume.
- Charts with Recharts; Excel with OpenSpout.

**Tests:** 125 API tests (role permissions, demo accounts, stock, returns, checkout and security) and an end-to-end Playwright test
(`e2e/main-flow.e2e.ts`): a customer asks for a return, support approves and refunds it,
the customer sees the refund, the warehouse prepares an order, restocks a location and can't open customers,
and the admin checks the overview and the team. It runs in the API CI on every push and
every night.

![The panel on a phone](./docs/screenshots/admin-mobile.png)

## Languages (ES / EN)

The whole site (shop, account, legal pages and panel) is in Spanish and English.

- **Default language:** the one chosen last time (saved in the browser) or, if none, the
  browser's: Spanish if it's set to Spanish, English otherwise. Switch it with the flags in
  the header and in the panel.
- **Site texts:** with i18next. They live in `src/i18n/locales/{en,es}/`, split by area
  (`common`, `shop`, `account`, `legal`, `admin`). A test (`locales.test.ts`) checks that both
  languages have the same keys.
- **Prices, dates and percentages** use each language's format ("€1,485.00" / "1.485,00 €").
- **Catalogue words** the API stores in English (tags like "NEW", garment types, colours, the
  "ONE" size…) are translated in `src/i18n/catalog.ts`. Product names stay in English, like
  brand names. Search understands both versions ("hoodie" and "sudadera").
- **API:** the site sends `Accept-Language` with every request and Laravel answers in that
  language (validation errors, messages, statuses, roles and export headers).
- **Demo data:** saved once, in English, and translated by the API when it's sent (stock
  notes, return comments, order history…). Anything a real person types is shown as it is.

![The panel in Spanish](./docs/screenshots/admin-overview-es.png)

## Security and protection

The site is open to the public (with shared demo accounts), so both the API and the UI are
protected against abuse and mistakes:

- **Rate limits** per real visitor: login (by email and IP), sign-up, demo access, checkout,
  returns, photo uploads and exports have their own limit, and the rest of the API a general one.
- **Only through Cloudflare:** the Worker adds a shared secret and the visitor's real IP.
  Laravel rejects requests that reach Railway directly without that secret.
- **Security headers** on the site and the API (HSTS, `nosniff`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`) and a Content-Security-Policy that blocks scripts from other sites.
- **Isolated demo accounts:** they only see and change demo data (made-up customers and
  orders) and can't change the public catalogue, upload files or manage the team.
- **Accounts:** signing in with Google to an account created earlier with a password
  cancels that password (stops someone registering your email before you). Only accounts
  that have signed in with Google/GitHub can join the team, and the owner's account becomes
  admin through the `OWNER_EMAIL` variable, only when signing in with Google.
- **Orders and stock:** prices are always calculated by the server, you can't sell or
  return more than there is, cancelling an order puts the stock back, important actions lock
  the record so a double click can't repeat them, and the panel warns you if the stock
  changed while you were editing it.
- **Exports** to CSV/Excel without dangerous formulas in customer texts.
- **Errors:** if part of a page fails, a message is shown instead of a blank screen, and
  after a deploy the site reloads itself to get the new version.

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
| 3D | react-three-fiber + drei | Three.js as React components, for the panel's warehouse. |
| Languages | i18next + react-i18next | Shop and panel in Spanish and English. Picked from the browser, switchable with the flags. The API answers in the same language. |
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
├── admin/             # /admin panel: its own pages, components, API and hooks
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
├── i18n/              # ES/EN translations (i18next) and catalogue words
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
npm run e2e        # end-to-end test (starts the API and the shop)
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
- Passwordless demo: "Reviewing this project?" button on `/auth` and role buttons on `/admin/login`

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
(`SocialiteController`). Google is already configured in production; the credentials
are Railway variables:

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
test users), you need a privacy policy URL and a terms of service URL served from the
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
- [x] Stage 10 - Admin panel: roles, orders, stock, customers, returns, team and exports.
- [x] Stage 11 - 3D warehouse: locations per variant, restocking and 3D, plan and list views.
- [x] Stage 12 - Spanish and English for the site, the panel, the API and the demo.
- [x] Stage 13 - Security and bug review: rate limits, secret-protected proxy, isolated demo accounts and order/stock integrity.
- [ ] Next - Real Stripe payments.

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
