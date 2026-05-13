# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-2-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-13 — Etapa 2 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 2**: ✅ cerrada. El SPA consume `/api/products`, `/api/products/{slug}` y `/api/categories` vía `@tanstack/react-query`. UI sin cambios visuales.
- **Próximo paso**: Etapa 3 — autenticación real (email/password + OAuth Google/GitHub) con Sanctum + Socialite.
- **Decisiones congeladas** (no hay que volver a debatir): Laravel 11, SQLite (dev) / MySQL (prod), Sanctum + Socialite + Cashier, Cloudflare Pages para frontend, Railway/Render para backend, dos repos separados, React Query como capa de datos del servidor.

---

## Repos en GitHub

| Repo | URL | Notas |
|---|---|---|
| Frontend | https://github.com/AleixAj/obsidian | Vite 8 + React 19 + TS + React Query · API consumida |
| Backend  | https://github.com/AleixAj/obsidian-api | Laravel 11 · API pública lista |

Todos los commits con autor `AleixAj <aleixauque@gmail.com>` (cuentan para el gráfico de contribuciones).

---

## Layout local

```
C:\Users\Kylen\Desktop\Projects\
├── obsidian\                   frontend Vite/React (repo: AleixAj/obsidian)
├── obsidian-api\               backend Laravel 11 (repo: AleixAj/obsidian-api)
└── obsidian.code-workspace     workspace multi-root para Cursor
```

**Cómo abrir Cursor con ambos**: doble click en `obsidian.code-workspace`. NO abras solo `obsidian/` o solo `obsidian-api/` — pierdes el contexto cruzado.

---

## Stack confirmado

### Backend (`obsidian-api`) — sin cambios desde Etapa 1

| Componente | Versión | Notas |
|---|---|---|
| PHP | 8.3.30 (Laragon Full v8.6.1) | `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\` |
| Composer | 2.9.4 | `C:\laragon\bin\composer\` |
| Laravel | 11.51.0 | |
| Sanctum | ^4.0 | SPA cookie auth + tokens |
| Socialite | ^5.27 | Google + GitHub (env vars listas, sin credenciales aún) |
| Cashier (Stripe) | ^16.5 | Test mode, sin claves aún |
| DB dev | SQLite | `database/database.sqlite` |
| DB prod (futura) | MySQL | |

### Frontend (`obsidian`) — Etapa 2

Nuevo desde Etapa 1:

- `@tanstack/react-query` ^5 + `@tanstack/react-query-devtools` ^5.
- `src/lib/queryClient.ts` — `QueryClient` único (staleTime 60 s, retry 1, sin refetchOnWindowFocus).
- `src/hooks/queries/` — `useProducts`, `useProduct`, `useCategories` + barrel.
- `src/components/product/ProductCardSkeleton.tsx` — skeleton brand-aware con shimmer dorado.
- `src/lib/api.ts` — añadidos `CategoryMeta`, `toCategoryMeta`, `toCategoryMap`. `ApiError` migrado de constructor parameter properties a fields explícitos (TS 6.0 + `erasableSyntaxOnly`).
- `src/data/products.ts` — limpiado: ya solo exporta `IMAGES`, `BRAND`, `TEMPLATES`. Fuera `PRODUCTS` y `CATEGORY_META`.
- `src/styles/pages.css` — añadidas reglas `.product-card-skeleton`, `.data-error` y `@keyframes sk-shimmer`.

Páginas refactorizadas (UI idéntica):

- `Home.tsx` — `FeaturedGrid` usa `useProducts()` con skeleton de 4 cards y bloque de error con retry.
- `Shop.tsx` — `useProducts(cat)` (filtro server-side cuando `cat !== "new"`) + `useCategories()` para el meta header. `headerCount` cae al length real si la API no conoce el slug (p. ej. `/shop/archive`). Filtros de talla/color/orden siguen client-side.
- `Product.tsx` — `useProduct(id)` con 3 ramas: 404 → `<NotFound />`, pending → loading mínimo, error → card con retry. Related uses `useProducts()`.
- `Account.tsx` — `MOCK_ORDERS` ahora indexa productos por **slug** (`["p1","p2"]`, no índices). `Account` raíz crea un `Map<slug, Product>` y lo propaga a `Overview`, `Orders`, `WishlistView` para lookups O(1). Wishlist resuelve productos contra el mismo map.

---

## Endpoints en uso (Etapa 2)

| Método | Path | Consumido por |
|---|---|---|
| GET | `/api/health` | – (manual / monitoring futuro) |
| GET | `/api/products` | `useProducts()` — Home, Product (related), Account |
| GET | `/api/products?category={slug}` | `useProducts(cat)` — Shop |
| GET | `/api/products/{slug}` | `useProduct(slug)` — Product |
| GET | `/api/categories` | `useCategories()` — Shop |
| GET | `/api/user` | – (Etapa 3) |

Precios en `price_cents` (integer). `toProduct` adapter divide por 100.

---

## Cómo arrancar el entorno cada día

```powershell
# Terminal 1 — Backend (Laravel)
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
# → http://localhost:8000

# Terminal 2 — Frontend (Vite)
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm run dev
# → http://localhost:5173
```

React Query Devtools: botón circular en la esquina inferior-izquierda del SPA en dev.

---

## 🛣️ Etapa 3 — Próximo paso

**Objetivo**: autenticación real. Email + password (registro/login) y OAuth con Google + GitHub vía Socialite. Sesión persistente vía Sanctum (cookies SPA).

**Tareas (en orden previsto)**:

1. Backend:
   - Migración `users` ya existe (Laravel default). Añadir campos `provider`, `provider_id`, `avatar`.
   - `AuthController` con `register`, `login`, `logout`.
   - `SocialiteController` con `redirect/{provider}` y `callback/{provider}`.
   - Rutas: `/api/auth/register`, `/login`, `/logout`; `/auth/{provider}/redirect`, `/callback`.
   - Probar `/api/user` con sesión real.
2. Frontend:
   - Cliente API: añadir credenciales para login/logout/register.
   - Hook `useUser()` con `useQuery(['user'])` + `useMutation` para login/logout.
   - Página `/auth` ya existe — cablear sus forms.
   - Botones "Sign in with Google / GitHub" en `/auth`.
   - Guardar sesión vía cookie (Sanctum SPA — no localStorage).
   - Redirect post-login a `/account`.
3. Smoke test: register → cerrar pestaña → reabrir → seguir logueado.

**Definition of done de Etapa 3**: `useUser()` devuelve el usuario logueado en toda la SPA, `/account` muestra el nombre real, `/auth` permite OAuth con Google y GitHub, y el logout limpia la sesión server-side.

---

## ⏸️ Pendientes opcionales (sin bloquear nada)

- [ ] `gh auth login` (CLI de GitHub instalado pero sin autenticar). Hace falta solo si quieres usar `gh pr create`, `gh issue create`, etc. Para push de git no es necesario — Git Credential Manager ya tiene las credenciales cacheadas.
- [ ] Pinear ambos repos en https://github.com/AleixAj.
- [ ] Añadir description + topics a cada repo en GitHub (sugerencias en el chat anterior).
- [ ] Configurar branch protection para `main` cuando empiece a haber PRs reales (Etapa 3+).

---

## 🛠️ Cosas que pueden romperse y cómo arreglarlas

| Problema | Solución |
|---|---|
| `php --version` no se reconoce | El PATH del usuario tiene `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64`. Cierra/reabre Cursor o lanza `[Environment]::GetEnvironmentVariable("Path","User")` para verificar. |
| Migraciones desordenadas | `php artisan migrate:fresh --seed --no-interaction` recrea la DB desde cero. SQLite, no hay riesgo. |
| CORS bloquea al frontend | `config/cors.php` lee `FRONTEND_URL` del `.env`. Si cambias el puerto del Vite, actualiza ambos lados. |
| Composer protesta por `zip` | Ya activado en `php.ini` (línea ~975, `extension=zip`). |
| El SPA muestra "Couldn't load the drop" | El backend está caído. `php artisan serve` en `:8000`. |
| `npm run lint` saca 6 errores pre-existentes | Son de Etapa 1 (setState en useEffect + react-refresh en contexts). No bloquean. Limpiar en Etapa 3 si toca tocar esos archivos. |

---

## 🗺️ Roadmap completo

| # | Etapa | Estado |
|---|---|---|
| 0 | Decisiones arquitectónicas | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | ✅ |
| 2 | SPA consume `/api/products` con react-query | ✅ |
| **3** | **Auth real: email/password + OAuth Google/GitHub** | **⏳ próximo** |
| 4 | Account dashboard conectado | ⏸ |
| 5 | Cart sync (guest ↔ user) | ⏸ |
| 6 | Checkout + Stripe sandbox | ⏸ |
| 7 | Wishlist sincronizada | ⏸ |
| 8 | Deploy (Cloudflare Pages + Railway/Render) + usuario demo | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md` (mantenido como histórico).
- Detalle del proceso (qué/por qué de cada decisión) → `PROCESS.md` en la raíz.
