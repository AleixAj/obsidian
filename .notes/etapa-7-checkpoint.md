# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-7-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-14 — Etapa 7 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 7**: ✅ cerrada. Wishlist guest en `localStorage` se mergea al backend al iniciar sesión/registrarse.
- **Wishlist UI**: Header count, PDP heart y Account wishlist siguen usando `useWishlist()` sin cambios visuales.
- **Stripe/OAuth**: siguen aplazados al deploy.
- **Próximo paso**: Etapa 8 — deploy + usuario demo + activar Stripe/OAuth reales.

---

## Backend — Etapa 7

Archivos nuevos/relevantes:

- `app/Http/Controllers/Api/WishlistController.php`
- `routes/api.php`
- tabla existente `wishlists`

Endpoints autenticados:

| Método | Path | Uso |
|---|---|---|
| GET | `/api/wishlist` | leer slugs favoritos del usuario |
| POST | `/api/wishlist/items` | añadir producto por slug |
| DELETE | `/api/wishlist/items/{slug}` | borrar producto |
| DELETE | `/api/wishlist/items` | vaciar wishlist |
| POST | `/api/wishlist/merge` | absorber wishlist guest tras login/register |

Reglas:

- la respuesta es `data: string[]` con slugs;
- el merge es idempotente;
- `wishlists` mantiene unique `user_id + product_id`;
- no duplicamos nombre/precio/imagen porque eso ya vive en `products`.

---

## Frontend — Etapa 7

Archivos clave:

- `src/context/WishlistContext.tsx`
- `src/hooks/queries/useWishlistSync.ts`
- `src/hooks/queries/useAuth.ts`
- `src/lib/api.ts`

Lo conectado:

- Guest:
  - sigue usando `localStorage` (`obsidian:wishlist`);
  - conserva favoritos al refrescar sin login.
- Authenticated:
  - lee ids desde `/api/wishlist`;
  - añade/borra/vacía con mutations;
  - al detectar sesión + favoritos guest, llama a `/api/wishlist/merge`;
  - limpia `localStorage` solo si el merge funciona.

La API pública de `useWishlist()` no cambia:

- `ids`
- `count`
- `has(id)`
- `toggle(id)`
- `remove(id)`
- `clear()`

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

## Validación realizada en Etapa 7

- `vendor\bin\pint --dirty` ✅
- `php artisan route:list --path=wishlist` ✅
- `php artisan test` ✅
- `npm.cmd run typecheck` ✅
- `npm.cmd run build` ✅
- Lints de archivos tocados ✅
- Smoke real con cookie:
  - register nuevo usuario ✅
  - `POST /api/wishlist/merge` con `p2`, `p4` ✅
  - `GET /api/wishlist` devuelve ambos ✅
  - `DELETE /api/wishlist/items/p2` borra uno ✅
  - `DELETE /api/wishlist/items` vacía todo ✅

---

## Etapa 8 — Próximo paso

**Objetivo**: deploy + usuario demo + activar integraciones reales.

Tareas previstas:

1. Frontend:
   - deploy Cloudflare Pages;
   - configurar `VITE_API_URL` de producción.
2. Backend:
   - deploy Railway/Render;
   - MySQL o PostgreSQL gestionado;
   - migraciones/seed;
   - variables de entorno productivas.
3. Integraciones:
   - OAuth Google/GitHub con callbacks finales;
   - Stripe sandbox con webhook final;
   - usuario demo estable para entrevistas.

**Definition of done Etapa 8**: proyecto navegable desde internet con frontend/backend desplegados y demo lista.

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
| 7 | Wishlist sincronizada | ✅ |
| **8** | **Deploy + Stripe + usuario demo + OAuth real** | **⏳ próximo** |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`
- Etapa 3 cerrada → `.notes/etapa-3-checkpoint.md`
- Etapa 4 cerrada → `.notes/etapa-4-checkpoint.md`
- Etapa 5 cerrada → `.notes/etapa-5-checkpoint.md`
- Etapa 6 cerrada → `.notes/etapa-6-checkpoint.md`
- Tutorial de decisiones → `PROCESS.md`
