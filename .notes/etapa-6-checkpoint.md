# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-6-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-14 — Etapa 6 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 6**: ✅ cerrada. Checkout básico sin Stripe: carrito autenticado → pedido real → carrito vacío → order visible en Account.
- **Stripe**: aplazado al final/deploy junto con OAuth, porque no hay claves test ni dominio definitivo.
- **Cart drawer**: el botón Checkout ahora crea pedido si hay sesión; si no, pide login.
- **Próximo paso**: Etapa 7 — Wishlist sincronizada.

---

## Backend — Etapa 6

Archivos nuevos/relevantes:

- `app/Http/Controllers/Api/CheckoutController.php`
- `routes/api.php`

Endpoint autenticado:

| Método | Path | Uso |
|---|---|---|
| POST | `/api/checkout` | convertir carrito backend del usuario en pedido |

Reglas:

- exige usuario autenticado;
- exige carrito con items;
- exige dirección default o primera dirección del usuario;
- crea `orders`;
- copia líneas del carrito a `order_items`;
- copia dirección a `order_addresses` como snapshot;
- aplica shipping simple: 8 EUR si subtotal < 200 EUR, gratis si llega a 200 EUR;
- vacía el carrito al completar la transacción;
- devuelve `OrderResource`.

---

## Frontend — Etapa 6

Archivos clave:

- `src/components/cart/CartDrawer.tsx`
- `src/hooks/queries/useCheckout.ts`
- `src/lib/api.ts`
- `src/styles/globals.css`

Lo conectado:

- guest checkout:
  - muestra toast;
  - cierra drawer;
  - redirige a `/auth`;
  - tras login/register se mantiene el merge guest → backend de Etapa 5.
- authenticated checkout:
  - llama a `POST /api/checkout`;
  - deshabilita botón mientras crea pedido;
  - invalida `cart`, `orders` y `account`;
  - muestra toast con número de pedido;
  - navega a `/account/orders`.

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

## Validación realizada en Etapa 6

- `vendor\bin\pint --dirty` ✅
- `php artisan route:list --path=checkout` ✅
- `php artisan test` ✅
- `npm.cmd run typecheck` ✅
- `npm.cmd run build` ✅
- Lints de archivos tocados ✅
- Smoke real con cookie:
  - register nuevo usuario ✅
  - `POST /api/cart/merge` con producto guest ✅
  - `POST /api/checkout` crea pedido ✅
  - `GET /api/orders` devuelve el pedido ✅
  - `GET /api/cart` queda vacío ✅

---

## Etapa 7 — Próximo paso

**Objetivo**: sincronizar wishlist.

Tareas previstas:

1. Backend:
   - endpoints para wishlist autenticada;
   - merge de wishlist local al iniciar sesión.
2. Frontend:
   - adaptar `WishlistContext` para guest localStorage + user backend;
   - invalidar cache al cambiar wishlist.
3. Smoke:
   - añadir favoritos como guest;
   - login/register;
   - confirmar favoritos sincronizados.

**Definition of done Etapa 7**: la wishlist del invitado no se pierde al iniciar sesión y el usuario autenticado tiene wishlist server-side.

---

## Stripe/OAuth — aplazado al final

No tocar ahora. Dejar para Etapa 8/deploy cuando existan:

- Cloudflare Pages frontend URL.
- Railway/Render backend URL.
- Google/GitHub OAuth apps con callbacks finales.
- Stripe test/live keys y webhook URL definitiva.

---

## Roadmap

| # | Etapa | Estado |
|---|---|---|
| 0 | Decisiones arquitectónicas | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | ✅ |
| 2 | SPA consume `/api/products` con React Query | ✅ |
| 3 | Auth real email/password + OAuth preparado | ✅ |
| 4 | Account dashboard conectado | ✅ |
| 5 | Cart sync guest ↔ user | ✅ |
| 6 | Checkout básico sin Stripe | ✅ |
| **7** | **Wishlist sincronizada** | **⏳ próximo** |
| 8 | Deploy + Stripe + usuario demo + OAuth real | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`
- Etapa 3 cerrada → `.notes/etapa-3-checkpoint.md`
- Etapa 4 cerrada → `.notes/etapa-4-checkpoint.md`
- Etapa 5 cerrada → `.notes/etapa-5-checkpoint.md`
- Tutorial de decisiones → `PROCESS.md`
