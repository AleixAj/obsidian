# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-4-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-14 — Etapa 4 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 4**: ✅ cerrada. Account dashboard conectado a backend autenticado: resumen, orders, addresses CRUD y profile settings (`PATCH /api/user`).
- **OAuth Google/GitHub**: preparado pero aplazado al final/deploy. Email/password es la auth real activa.
- **Próximo paso**: Etapa 5 — Cart sync (guest cart localStorage → user cart backend al iniciar sesión).
- **Repos**: frontend y backend limpios, sincronizados con `origin/main`.

---

## Repos en GitHub

| Repo | URL | Últimos commits relevantes |
|---|---|---|
| Frontend | https://github.com/AleixAj/obsidian | `2e16e04 feat(account): connect dashboard data to backend API`; `082471e feat(account): add real address form and defer OAuth setup`; `b379214 feat(account): connect profile settings form` |
| Backend  | https://github.com/AleixAj/obsidian-api | `95f79fc feat(account): expose account dashboard API endpoints`; `264defa feat(account): allow authenticated profile updates` |

---

## Layout local

```
C:\Users\Kylen\Desktop\Projects\
├── obsidian\                   frontend Vite/React (repo: AleixAj/obsidian)
├── obsidian-api\               backend Laravel 11 (repo: AleixAj/obsidian-api)
└── obsidian.code-workspace     workspace multi-root para Cursor
```

---

## Backend — Etapa 4

Archivos nuevos/relevantes:

- `app/Http/Controllers/Api/AccountController.php`
- `app/Http/Controllers/Api/AddressController.php`
- `app/Http/Controllers/Api/OrderController.php`
- `app/Http/Resources/AccountResource.php`
- `app/Http/Resources/AddressResource.php`
- `app/Http/Resources/OrderResource.php`
- `app/Http/Resources/OrderItemResource.php`
- `app/Services/DemoAccountService.php`
- `app/Http/Controllers/Api/AuthController.php` — ahora incluye `PATCH /api/user`
- `routes/api.php` — account/orders/addresses/user update routes.

Endpoints autenticados:

| Método | Path | Uso |
|---|---|---|
| GET | `/api/account` | resumen dashboard: user, stats, addresses, orders |
| GET | `/api/orders` | pedidos del usuario |
| GET | `/api/addresses` | direcciones del usuario |
| POST | `/api/addresses` | crear dirección |
| PATCH | `/api/addresses/{id}` | editar dirección / marcar default |
| DELETE | `/api/addresses/{id}` | borrar dirección |
| PATCH | `/api/user` | actualizar nombre/email |

`DemoAccountService` asegura que cada usuario nuevo tenga datos reales mínimos:

- 2 direcciones (`Home`, `Studio`)
- 3 pedidos ligados a productos reales

Esto evita que Account parezca vacío mientras Checkout/Orders reales llegan en etapas posteriores.

---

## Frontend — Etapa 4

Archivos clave:

- `src/hooks/queries/useAccount.ts`
- `src/hooks/queries/useAuth.ts`
- `src/lib/api.ts`
- `src/pages/Account.tsx`

Lo conectado:

- Overview:
  - nombre real del usuario;
  - stats desde backend (`orders_count`, `lifetime_spend_cents`, `reward_points`, `tier`);
  - recent orders desde API.
- Orders:
  - lista real de `/api/orders`;
  - filtros `all`, `transit`, `delivered`, `cancelled`;
  - thumbnails desde productos reales.
- Addresses:
  - lista real de `/api/addresses`;
  - crear dirección con formulario;
  - editar dirección con formulario;
  - marcar default;
  - borrar.
- Settings/Profile:
  - nombre/email reales;
  - guardar con `PATCH /api/user`;
  - cache de `useUser` y `useAccount` se refresca.

Sigue mock/local por ahora:

- Notifications toggles (solo estado local).
- Rewards/Inner Circle copy.
- Wishlist sigue localStorage (Etapa 7).
- Cart sigue localStorage (Etapa 5).

---

## Cómo arrancar el entorno cada día

```powershell
# Terminal 1 — Backend
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve

# Terminal 2 — Frontend
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm.cmd run dev
```

---

## Validación realizada en Etapa 4

- `vendor\bin\pint --dirty` ✅
- `php artisan route:list --path=account` ✅
- `php artisan route:list --path=addresses` ✅
- `php artisan route:list --path=user` ✅
- `php artisan test` ✅
- `npm.cmd run typecheck` ✅
- `npm.cmd run build` ✅
- Lints de archivos tocados ✅
- Smoke real con cookie:
  - register nuevo usuario ✅
  - `/api/account` devuelve usuario ✅
  - `/api/orders` devuelve 3 pedidos ✅
  - `/api/addresses` devuelve 2 direcciones ✅
  - `PATCH /api/user` actualiza perfil ✅
- Prueba manual del user:
  - address create/edit/default/delete funciona ✅
  - settings/profile save funciona ✅

---

## 🛣️ Etapa 5 — Próximo paso

**Objetivo**: sincronizar carrito invitado ↔ usuario.

Ahora mismo:

- cart vive en `localStorage` vía `CartContext`;
- backend ya tiene tablas `carts` y `cart_items`;
- al hacer login, el carrito local todavía no se sube al servidor.

Tareas previstas:

1. Backend:
   - `GET /api/cart`
   - `POST /api/cart/items`
   - `PATCH /api/cart/items/{id}`
   - `DELETE /api/cart/items/{id}`
   - `POST /api/cart/merge` para absorber carrito guest.
2. Frontend:
   - añadir DTO/cart API client;
   - `useCartQuery` / mutations;
   - al login/register, mergear `localStorage` hacia backend;
   - cart drawer lee backend si hay sesión, localStorage si guest.
3. Smoke:
   - añadir productos como guest;
   - login;
   - carrito aparece en cuenta/sesión;
   - logout mantiene guest behavior.

**Definition of done Etapa 5**: el carrito del invitado no se pierde al hacer login y el usuario autenticado tiene carrito server-side.

---

## OAuth Google/GitHub — aplazado al final

No tocar ahora. Dejar para Etapa 8/deploy cuando existan callbacks definitivos:

- Cloudflare Pages frontend URL.
- Railway/Render backend URL.
- Google/GitHub OAuth apps con callbacks finales.

---

## Roadmap

| # | Etapa | Estado |
|---|---|---|
| 0 | Decisiones arquitectónicas | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | ✅ |
| 2 | SPA consume `/api/products` con React Query | ✅ |
| 3 | Auth real email/password + OAuth preparado | ✅ |
| 4 | Account dashboard conectado | ✅ |
| **5** | **Cart sync guest ↔ user** | **⏳ próximo** |
| 6 | Checkout + Stripe sandbox | ⏸ |
| 7 | Wishlist sincronizada | ⏸ |
| 8 | Deploy + usuario demo + OAuth real | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`
- Etapa 3 cerrada → `.notes/etapa-3-checkpoint.md`
- Tutorial de decisiones → `PROCESS.md`
