# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-1-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-13 — Etapa 1 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 1**: ✅ cerrada y pusheada a GitHub bajo `AleixAj`.
- **Próximo paso**: Etapa 2 — conectar la SPA al backend usando `@tanstack/react-query`. UI no cambia.
- **Decisiones bloqueadas que ya no hay que volver a tomar**: Laravel 11, SQLite (dev) / MySQL (prod), Sanctum + Socialite + Cashier, Cloudflare Pages para frontend, Railway/Render para backend, dos repos separados.

---

## Repos en GitHub

| Repo | URL | Commits | Notas |
|---|---|---|---|
| Frontend | https://github.com/AleixAj/obsidian | 1 (`chore: initial commit`) | Vite 8 + React 19 + TS · UI completa |
| Backend  | https://github.com/AleixAj/obsidian-api | 7 (Conventional Commits) | Laravel 11 · API pública lista |

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

### Backend (`obsidian-api`)

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

### Frontend (`obsidian`)

Igual que estaba antes + 3 archivos nuevos:
- `src/lib/api.ts` — cliente tipado (DTOs + adapter `toProduct`), **aún no usado por la UI**
- `src/vite-env.d.ts` — tipa `VITE_API_URL`
- `.env` / `.env.example` — `VITE_API_URL=http://localhost:8000`

---

## Endpoints listos (Etapa 1)

| Método | Path | Respuesta |
|---|---|---|
| GET | `/api/health` | `{status, service, env, time, db}` |
| GET | `/api/products` | 11 productos, `?category=slug` opcional |
| GET | `/api/products/{slug}` | Detalle por slug (`p1`–`p11`) |
| GET | `/api/categories` | 6 categorías con `count` |
| GET | `/api/user` | Auth Sanctum (placeholder hasta Etapa 3) |

Precios siempre en `price_cents` (integer). El adapter del frontend divide por 100.

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

PHP/Composer ya están en el PATH del usuario (persistentes). Si abren un Cursor nuevo y `php --version` falla, basta cerrar/reabrir Cursor — el PATH se hereda al arrancar el proceso.

---

## 🛣️ Etapa 2 — Próximo paso (DECISIÓN YA TOMADA)

**Objetivo**: la SPA deja de leer `src/data/products.ts` y consume el backend. UI sin cambios.

**Stack añadido**: `@tanstack/react-query` (decidido por el user). Razones:
- Cache + loading/error/refetch out-of-the-box
- ~4 KB extra, mucho menos boilerplate
- Estándar en empresas → vendible en entrevistas

**Tareas (en orden)**:
1. `cd obsidian; npm i @tanstack/react-query @tanstack/react-query-devtools`
2. Envolver `<App>` con `<QueryClientProvider>` en `src/main.tsx`.
3. Crear `src/hooks/queries/`:
   - `useProducts(category?: string)` → `useQuery(['products', category], fetchProducts)`
   - `useProduct(slug)` → `useQuery(['product', slug], fetchProduct)`
   - `useCategories()` → `useQuery(['categories'], fetchCategories)`
   - Todos aplican `toProduct()` en `select` para devolver `Product[]` listos para la UI.
4. Sustituir en cada página/componente: `import { PRODUCTS } from "@/data/products"` → `const { data: products } = useProducts(...)`.
5. Reemplazar el `CATEGORY_META` por la respuesta de `useCategories()`.
6. Estados loading/error: usar el placeholder/skeleton existente del frontend (o crear uno simple si no hay).
7. Smoke test manual:
   - Cada PLP (`/shop/new`, `/shop/men`, etc.) renderiza productos correctos.
   - PDP por slug funciona (`/product/p1`).
   - Cart/wishlist siguen funcionando (siguen siendo localStorage).
8. Mantener `IMAGES`, `BRAND`, `TEMPLATES` en `products.ts` (son assets, no catálogo).
9. Opcional: borrar el array `PRODUCTS` de `products.ts` al final (o dejarlo como fallback de tipo).

**Definition of done de Etapa 2**: el frontend con backend caído muestra estados de error legibles; con backend levantado todo se ve igual que antes; `git grep PRODUCTS` solo aparece en `products.ts`.

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
| Composer protesta por `zip` | Ya activado en `php.ini` (línea ~975, `extension=zip`). Si vuelve a desactivarse: `Select-String -Path "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.ini" -Pattern "extension=zip"`. |

---

## 🗺️ Roadmap completo (sin cambios desde la decisión inicial)

| # | Etapa | Estado |
|---|---|---|
| 0 | Decisiones arquitectónicas | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | ✅ |
| **2** | **SPA consume `/api/products` con react-query** | **⏳ próximo** |
| 3 | Auth real: email/password + OAuth Google/GitHub | ⏸ |
| 4 | Account dashboard conectado | ⏸ |
| 5 | Cart sync (guest ↔ user) | ⏸ |
| 6 | Checkout + Stripe sandbox | ⏸ |
| 7 | Wishlist sincronizada | ⏸ |
| 8 | Deploy (Cloudflare Pages + Railway/Render) + usuario demo | ⏸ |
