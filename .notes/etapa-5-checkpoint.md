# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-5-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-14 — Etapa 5 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 5**: ✅ cerrada. El carrito guest en `localStorage` se mergea al carrito backend del usuario al iniciar sesión/registrarse.
- **Cart drawer**: mantiene la misma UI y API (`useCart`), pero usa `/api/cart` cuando hay sesión.
- **OAuth Google/GitHub**: sigue aplazado al final/deploy.
- **Próximo paso**: Etapa 6 — Checkout + Stripe sandbox.

---

## Repos en GitHub

| Repo | URL | Últimos commits relevantes |
|---|---|---|
| Frontend | https://github.com/AleixAj/obsidian | Etapa 5 cart sync |
| Backend  | https://github.com/AleixAj/obsidian-api | Etapa 5 cart API |

---

## Backend — Etapa 5

Archivos nuevos/relevantes:

- `app/Http/Controllers/Api/CartController.php`
- `app/Http/Resources/CartResource.php`
- `app/Http/Resources/CartItemResource.php`
- `routes/api.php`

Endpoints autenticados:

| Método | Path | Uso |
|---|---|---|
| GET | `/api/cart` | leer carrito del usuario |
| POST | `/api/cart/items` | añadir producto |
| PATCH | `/api/cart/items/{id}` | actualizar cantidad |
| DELETE | `/api/cart/items/{id}` | borrar línea |
| DELETE | `/api/cart/items` | vaciar carrito |
| POST | `/api/cart/merge` | absorber carrito guest tras login/register |

Regla de merge:

- si coincide `product + size + color`, suma cantidades;
- si no coincide, crea una línea nueva;
- guarda `unit_price_cents` en la línea para congelar el precio del momento.

---

## Frontend — Etapa 5

Archivos clave:

- `src/context/CartContext.tsx`
- `src/hooks/queries/useCartSync.ts`
- `src/hooks/queries/useAuth.ts`
- `src/lib/api.ts`

Lo conectado:

- Guest:
  - sigue usando `localStorage` (`obsidian:cart`);
  - no necesita login ni backend.
- Authenticated:
  - lee carrito desde `/api/cart`;
  - añade/actualiza/borra/vacía con mutations;
  - al detectar sesión + carrito guest, llama a `/api/cart/merge`;
  - limpia `localStorage` solo si el merge funciona.

Sigue local por ahora:

- Wishlist (`localStorage`) → Etapa 7.
- Checkout/pago real → Etapa 6.

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

## Validación realizada en Etapa 5

- `vendor\bin\pint --dirty` ✅
- `php artisan route:list --path=cart` ✅
- `php artisan test` ✅
- `npm.cmd run typecheck` ✅
- `npm.cmd run build` ✅
- Lints de archivos tocados ✅
- Smoke real con cookie:
  - register nuevo usuario ✅
  - `POST /api/cart/merge` con producto guest ✅
  - `GET /api/cart` devuelve 1 item, qty 2 ✅

---

## Etapa 6 — Próximo paso

**Objetivo**: checkout + Stripe sandbox.

Tareas previstas:

1. Backend:
   - endpoint para crear checkout/session/payment intent de Stripe sandbox;
   - convertir carrito en orden pendiente;
   - webhook básico para marcar pago completado.
2. Frontend:
   - botón Checkout real desde `CartDrawer`;
   - pantalla/estado success/cancel;
   - manejar carrito vacío tras pago correcto.
3. Smoke:
   - usar tarjeta test de Stripe;
   - confirmar que se crea order real;
   - confirmar que cart queda vacío tras pago.

**Definition of done Etapa 6**: el usuario autenticado puede pagar en modo test y ver el pedido en Account.

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
| 5 | Cart sync guest ↔ user | ✅ |
| **6** | **Checkout + Stripe sandbox** | **⏳ próximo** |
| 7 | Wishlist sincronizada | ⏸ |
| 8 | Deploy + usuario demo + OAuth real | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`
- Etapa 3 cerrada → `.notes/etapa-3-checkpoint.md`
- Etapa 4 cerrada → `.notes/etapa-4-checkpoint.md`
- Tutorial de decisiones → `PROCESS.md`
