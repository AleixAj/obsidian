# OBSIDIAN

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=fff)
![Laravel API](https://img.shields.io/badge/API-Laravel_11-ff2d20?logo=laravel&logoColor=fff)

<p>
  <a href="README.md"><img src="docs/readme/lang-es.svg" alt="Español" width="170"></a>
  <a href="README.en.md"><img src="docs/readme/lang-en.svg" alt="English" width="170"></a>
  <img src="docs/readme/lang-ca-active.svg" alt="Català" width="170">
</p>

E-commerce full-stack d'una botiga de roba urbana creat com a projecte de portfolio: una botiga React amb estètica fosca i accents daurats, connectada a una API Laravel 11, desplegada amb base de dades de producció i fluxos reals d'usuari autenticat.

L'objectiu és demostrar com es planifica, s'implementa i es desplega una aplicació de comerç amb un enfocament real: catàleg servit per l'API, àrea de compte autenticada, cistella i wishlist sincronitzades, creació de comandes, desplegament a producció i decisions tècniques documentades.

## Captures

![Hero de la pàgina d'inici](./docs/screenshots/home-hero.png)

![Secció lookbook](./docs/screenshots/home-lookbook.png)

![Categories](./docs/screenshots/home-categories.png)

![Col·lecció women](./docs/screenshots/shop-women.png)

![Pàgina de producte](./docs/screenshots/product-detail.png)

## Abast del projecte

Aquest repositori conté el frontend. El backend és a
[`AleixAj/obsidian-api`](https://github.com/AleixAj/obsidian-api).

Funcionalitats implementades:

- CI de portfolio amb lint, typecheck, tests unitaris i build a GitHub Actions.
- Desplegament de producció: [`obsidian.aleixaj.com`](https://obsidian.aleixaj.com).
- Catàleg servit per endpoints de Laravel (`/api/products`, `/api/categories`).
- Pàgines de llistat amb filtres per categoria, talla, color i preu, i ordenació.
- Pàgina de producte amb galeria, selector de talla/color i secció "complete the look".
- Calaix (drawer) de la cistella amb quantitats, totals, progrés cap a l'enviament gratuït, sincronització amb el backend i checkout bàsic.
- Wishlist persistent per als convidats i sincronitzada amb el backend per als usuaris autenticats.
- Tauler (dashboard) del compte amb resum, comandes, CRUD d'adreces i ajustos del perfil.
- Registre/inici de sessió amb correu electrònic i contrasenya mitjançant sessions de cookie de Laravel Sanctum.
- Fusió de la cistella/wishlist de convidat després d'iniciar sessió o registrar-se.
- Checkout bàsic que converteix la cistella autenticada en una comanda real.
- Disseny responsive fins a mòbil.
- Skeletons de càrrega i estats d'error amb opció de reintentar.
- React Query Devtools en desenvolupament.

## Stack tècnic

| Capa | Elecció | Motiu |
|---|---|---|
| Build | Vite 8 | Desenvolupament SPA ràpid i desplegament estàtic senzill. |
| UI | React 19 | Model de components, hooks i bona rellevància professional. |
| Llenguatge | TypeScript 6 | Refactoritzacions més segures i models de domini compartits. |
| Routing | React Router 7 | Pàgines i seccions del compte guiades per URL. |
| Estat del servidor | TanStack React Query 5 | Memòria cau, estats de càrrega/error, reintents i deduplicació de peticions. |
| Estat del client | React Context | Cistella, wishlist i toasts sense afegir Redux. |
| Persistència | `localStorage` + cistella/wishlist al backend | Els convidats conserven les dades; els usuaris se sincronitzen amb Laravel en autenticar-se. |
| Estils | CSS pla + tokens | Demostra els fonaments de CSS sense dependre d'un framework. |
| Backend | API Laravel 11 | Repositori separat, endpoints REST, autenticació Sanctum i MySQL a producció. |
| Desplegament | Cloudflare Workers + Assets + Railway | SPA a l'edge de Cloudflare, API Laravel amb MySQL gestionat. |

## Arquitectura

El frontend manté clara la frontera amb l'API:

```txt
DTOs de l'API Laravel
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
Pàgines i components reben objectes Product llestos per a la UI
```

Això evita que la UI renderitzi directament camps del backend com `price_cents` o `img_alt`. Si canvia la forma de l'API, l'adaptador s'actualitza en un únic punt.

### Configuració de QueryClient

`src/lib/queryClient.ts` defineix un client compartit:

- `staleTime: 60_000`, perquè el catàleg canvia poc durant una sessió.
- `retry: 1`, per recuperar-se de fallades transitòries sense endarrerir massa l'usuari.
- `refetchOnWindowFocus: false`, per evitar recàrregues sorolloses en canviar de pestanya.

### Estat local i estat del servidor

React Query gestiona les dades del servidor (`products`, `categories`, `user`, `account`, `cart` autenticat, `wishlist` autenticada). React Context gestiona l'estat local de la UI (`toasts`) i exposa les API de cistella/wishlist als components.

Els convidats fan servir `localStorage`, els usuaris autenticats fan servir l'API Laravel, i tots dos estats es fusionen després d'iniciar sessió o registrar-se. Així la navegació com a convidat és ràpida sense perdre la portabilitat entre dispositius.

## Estructura del projecte

```txt
src/
├── components/
│   ├── cart/          # CartDrawer
│   ├── layout/        # Header, Footer, AnnounceBar, Layout
│   ├── product/       # ProductCard, ProductCardSkeleton
│   └── ui/            # Logo, Icon, Marquee, Placeholder, Reveal
├── context/           # CartContext, WishlistContext, ToastContext
├── data/              # Recursos visuals/editorials de marca
├── hooks/
│   ├── queries/       # Hooks de React Query
│   ├── useLocalStorage.ts
│   └── useReveal.ts
├── lib/               # Client de l'API + QueryClient
├── pages/             # Home, Shop, Product, Lookbook, Auth, Account, Legal, NotFound
├── styles/            # Tokens CSS, estils globals i estils per pàgina
├── types/             # Product, CartItem, Category
└── utils/             # formatPrice, pad
```

## Configuració local full-stack

### 1. Arrencar el backend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
```

Laravel hauria d'estar disponible a `http://localhost:8000`.

Comprovacions útils:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
Invoke-RestMethod http://localhost:8000/api/products
Invoke-RestMethod http://localhost:8000/api/categories
```

### 2. Arrencar el frontend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm install
npm run dev
```

Vite hauria d'estar disponible a `http://localhost:5173`.

El frontend llegeix la URL base de l'API de:

```env
VITE_API_URL=http://localhost:8000
```

A producció fa servir:

```env
VITE_API_URL=https://obsidian-api-production-8b5e.up.railway.app
```

## Scripts

```bash
npm run dev        # arrenca Vite en mode desenvolupament
npm run typecheck  # comprova TypeScript sense emetre fitxers
npm run test:ci    # executa els tests unitaris amb Vitest
npm run build      # build de producció
npm run preview    # previsualitza dist en local
npm run lint       # ESLint
```

Verificat:

- `npm run typecheck` passa.
- `npm run test:ci` passa.
- `npm run build` passa.
- GitHub Actions executa lint, typecheck, tests i build a cada push/PR.
- Smoke checks de producció contra Railway/Cloudflare.
- L'autenticació Sanctum funciona des de `obsidian.aleixaj.com`.
- Les imatges i les dades del catàleg es carreguen des de l'API de Railway.

## Producció

- Frontend: [`https://obsidian.aleixaj.com`](https://obsidian.aleixaj.com)
- API del backend: [`https://obsidian-api-production-8b5e.up.railway.app`](https://obsidian-api-production-8b5e.up.railway.app)
- Health check: [`/api/health`](https://obsidian-api-production-8b5e.up.railway.app/api/health)
- Usuari de demostració: `demo@obsidian.test`

Notes de desplegament:

- El frontend es desplega amb Cloudflare Workers + Assets mitjançant `wrangler.jsonc`.
- Ordre de build a Cloudflare: `npm run build`.
- Ordre de desplegament: `npx wrangler deploy`.
- El fallback de la SPA es gestiona amb `not_found_handling="single-page-application"`.
- Es va eliminar l'antic `_redirects` perquè provocava un bucle de redireccions a Workers + Assets.
- `src/lib/api.ts` evita que els builds de producció facin servir `localhost:8000` per error.

## Contracte amb el backend

Actualment el frontend consumeix:

| Mètode | Endpoint | Ús |
|---|---|---|
| `GET` | `/api/products` | Home, recomanacions, Account |
| `GET` | `/api/products?category={slug}` | Pàgines Shop per categoria |
| `GET` | `/api/products/{slug}` | Detall del producte |
| `GET` | `/api/categories` | Metadades de la capçalera de Shop |
| `GET` | `/api/health` | Smoke checks / monitoratge manual |
| `GET` | `/api/user` | Usuari autenticat actual |
| `PATCH` | `/api/user` | Actualitzar nom/correu electrònic |
| `POST` | `/api/auth/register` | Crear un compte i iniciar sessió |
| `POST` | `/api/auth/login` | Inici de sessió amb correu i contrasenya |
| `POST` | `/api/auth/logout` | Tancament de sessió al servidor |
| `GET` | `/api/account` | Resum del tauler del compte |
| `GET` | `/api/orders` | Comandes de l'usuari |
| `GET` | `/api/addresses` | Adreces de l'usuari |
| `POST` | `/api/addresses` | Crear una adreça |
| `PATCH` | `/api/addresses/{id}` | Editar una adreça / marcar-la com a predeterminada |
| `DELETE` | `/api/addresses/{id}` | Esborrar una adreça |
| `GET` | `/api/cart` | Cistella autenticada |
| `POST` | `/api/cart/items` | Afegir un producte a la cistella |
| `PATCH` | `/api/cart/items/{id}` | Canviar la quantitat |
| `DELETE` | `/api/cart/items/{id}` | Eliminar una línia |
| `DELETE` | `/api/cart/items` | Buidar la cistella |
| `POST` | `/api/cart/merge` | Fusionar la cistella de convidat després d'iniciar sessió o registrar-se |
| `POST` | `/api/checkout` | Convertir la cistella en una comanda |
| `GET` | `/api/wishlist` | Slugs de la wishlist autenticada |
| `POST` | `/api/wishlist/items` | Afegir un producte a la wishlist |
| `DELETE` | `/api/wishlist/items/{slug}` | Treure un producte de la wishlist |
| `DELETE` | `/api/wishlist/items` | Buidar la wishlist |
| `POST` | `/api/wishlist/merge` | Fusionar la wishlist de convidat després d'iniciar sessió o registrar-se |

Els diners es desen a l'API com a cèntims enters (`price_cents`). L'adaptador els transforma en el `Product.price` que renderitzen els components.

## Configuració d'OAuth

Les rutes d'OAuth amb Google/GitHub estan implementades a Laravel
(`SocialiteController`). Només falten les credencials, que s'afegeixen com a
variables a Railway:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://obsidian.aleixaj.com/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=https://obsidian.aleixaj.com/auth/github/callback
```

**El `redirect_uri` ha d'apuntar al domini públic, no al de Railway.** El
Worker fa de proxy de `/auth/` cap al backend (vegeu `worker.js`), de manera
que la callback arriba igualment a Laravel, però aleshores la cookie de sessió
s'emet sobre `obsidian.aleixaj.com`, que és el domini des del qual la SPA fa
les peticions. Si la callback apunta a `*.up.railway.app`, l'inici de sessió
sembla completar-se i l'usuari torna sense sessió iniciada, perquè la cookie
queda en un altre domini i Sanctum no la rep mai.

Per publicar la pantalla de consentiment de Google en mode producció (sense
llista d'usuaris de prova) calen una URL de política de privadesa i una de
condicions del servei servides des del domini autoritzat: són les rutes `/privacy` i
`/terms` (`src/pages/Legal.tsx`).

Mentre no existeixin aquests valors, els botons socials redirigeixen de nou a
`/auth` amb un error clar de "not configured".

## Configuració de Stripe (pendent)

Les dependències i els placeholders d'entorn de Stripe/Cashier existeixen al backend, però el cobrament real queda ajornat fins que es configurin les claus i el webhook. El checkout actual ja crea comandes reals sense cobrar la targeta.

## Full de ruta

- [x] Etapa 0 - Decisions d'arquitectura.
- [x] Etapa 1 - Backend Laravel 11, esquema, seeders i API pública.
- [x] Etapa 2 - SPA React que consumeix el backend amb React Query.
- [x] Etapa 3 - Autenticació real: correu/contrasenya + rutes OAuth preparades.
- [x] Etapa 4 - Tauler del compte connectat a dades reals.
- [x] Etapa 5 - Cistella de convidat sincronitzada amb l'usuari en iniciar sessió.
- [x] Etapa 6 - Checkout bàsic: cistella autenticada -> comanda.
- [x] Etapa 7 - Wishlist sincronitzada entre dispositius.
- [x] Etapa 8 - Desplegament: Cloudflare Workers + Assets, Railway i usuari de demostració.
- [x] Etapa 9 - Pàgines legals (`/privacy`, `/terms`) requerides per la pantalla de consentiment de Google.
- [ ] Últims retocs - Activar els pagaments amb Stripe i les credencials d'OAuth.

## Per què és important aquest projecte

Obsidian no és només un mockup estàtic. Està estructurat com un petit projecte de producció:

- La UI està prou acabada per poder-hi avaluar el criteri visual.
- La frontera amb el backend és real, tipada i aïllada.
- L'autenticació, la cistella, la wishlist, el compte i el checkout travessen frontend i backend.
- La càrrega de dades té en compte la memòria cau, els reintents, els estats de càrrega i els errors.
- L'aplicació està desplegada amb configuració real, base de dades gestionada i smoke checks.
- Les decisions estan documentades a `PROCESS.md`, incloent-hi els trade-offs (compromisos).
- El full de ruta és incremental per poder revisar i desplegar per etapes.

## Crèdits

- Imatges: Unsplash i recursos locals/editorials de marca.
- Tipografia: Syne, Space Grotesk i JetBrains Mono a través de Google Fonts.
- Logotip i direcció visual: concepte Obsidian Studio.

---

Projecte de portfolio. No és una botiga real.
