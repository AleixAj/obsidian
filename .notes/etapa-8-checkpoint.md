# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-8-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-14 — Etapa 8 cerrada: deploy Cloudflare + Railway operativo.

---

## TL;DR

- **Frontend producción**: https://obsidian.aleixaj.com
- **Backend producción**: https://obsidian-api-production-8b5e.up.railway.app
- **Health**: https://obsidian-api-production-8b5e.up.railway.app/api/health
- **DB producción**: MySQL gestionado en Railway.
- **Auth producción**: Sanctum cookies validado desde `obsidian.aleixaj.com`.
- **Demo user**: `demo@obsidian.test` creado por seed en Railway.
- **Pendiente final**: credenciales reales de OAuth Google/GitHub y Stripe.

---

## Backend — Railway

Archivos nuevos/relevantes:

- `Procfile`
- `.env.example`
- `composer.json`
- `database/seeders/DemoUserSeeder.php`
- `database/seeders/DatabaseSeeder.php`

Railway:

- Project: `obsidian-api`
- Service: `obsidian-api`
- Database: MySQL
- Public domain: `https://obsidian-api-production-8b5e.up.railway.app`

Variables clave:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://obsidian-api-production-8b5e.up.railway.app`
- `FRONTEND_URL=https://obsidian.aleixaj.com`
- `FRONTEND_URL_PROD=https://obsidian.aleixaj.com`
- `SANCTUM_STATEFUL_DOMAINS=obsidian.aleixaj.com`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_SAME_SITE=none`
- `DB_CONNECTION=mysql`
- `DB_URL=${{MySQL.MYSQL_URL}}`

Nota técnica:

- `ext-bcmath` se declaró en `composer.json` porque Cashier/moneyphp lo requiere y Railway necesitaba instalarlo en build.
- `Procfile` ejecuta `php artisan migrate --force && php artisan db:seed --force` antes de arrancar `php artisan serve`.

---

## Frontend — Cloudflare Pages

Cloudflare Pages:

- URL final: `https://obsidian.aleixaj.com`
- Repo: `AleixAj/obsidian`
- Branch: `main`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_URL=https://obsidian-api-production-8b5e.up.railway.app`

Archivo nuevo/relevante:

- `public/_redirects` para soportar rutas SPA (`/account/orders`, `/shop/new`, etc.) en Cloudflare Pages.

---

## Validación realizada en Etapa 8

- Frontend público carga en `https://obsidian.aleixaj.com` ✅
- Backend health responde `status=ok`, `env=production`, `db=true` ✅
- Registro producción desde Origin `https://obsidian.aleixaj.com` ✅
- `/api/account` producción devuelve usuario, 3 orders y 2 addresses ✅
- Login demo `demo@obsidian.test` funciona ✅

---

## Demo User

Credenciales:

- Email: `demo@obsidian.test`
- Password: guardada en Railway como `DEMO_USER_PASSWORD`

El seeder crea:

- usuario demo;
- direcciones demo;
- pedidos demo.

---

## Pendiente Final — OAuth + Stripe

OAuth callbacks definitivos:

- Google: `https://obsidian-api-production-8b5e.up.railway.app/auth/google/callback`
- GitHub: `https://obsidian-api-production-8b5e.up.railway.app/auth/github/callback`

Stripe:

- crear test keys;
- crear webhook apuntando al backend cuando se implemente/active checkout Stripe real;
- setear variables en Railway:
  - `STRIPE_KEY`
  - `STRIPE_SECRET`
  - `STRIPE_WEBHOOK_SECRET`

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
| 8 | Deploy Cloudflare + Railway + demo user | ✅ |
| 9 | Stripe + OAuth real | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`
- Etapa 3 cerrada → `.notes/etapa-3-checkpoint.md`
- Etapa 4 cerrada → `.notes/etapa-4-checkpoint.md`
- Etapa 5 cerrada → `.notes/etapa-5-checkpoint.md`
- Etapa 6 cerrada → `.notes/etapa-6-checkpoint.md`
- Etapa 7 cerrada → `.notes/etapa-7-checkpoint.md`
- Tutorial de decisiones → `PROCESS.md`
