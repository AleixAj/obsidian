# OBSIDIAN — Estado del proyecto

> **Cómo usar este archivo**: si abres una conversación nueva en Cursor, pásamelo con `@etapa-3-checkpoint.md` y arrancamos sin re-explicar nada.

> **Última actualización**: 2026-05-13 — Etapa 3 cerrada y publicada en GitHub.

---

## TL;DR

- **Etapa 3**: ✅ cerrada. Auth real funcionando con Laravel Sanctum (email/password), sesión persistente vía cookie, `/account` protegido y logout server-side.
- **OAuth Google/GitHub**: rutas y frontend cableados con Socialite, pero faltan credenciales reales (`GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, etc.). Si se pulsan sin credenciales, vuelve a `/auth?error=oauth_not_configured`.
- **Próximo paso**: Etapa 4 — conectar Account dashboard a datos reales del backend (profile/account endpoint, orders, addresses, settings básicos).
- **Decisiones congeladas**: Laravel 11, Sanctum SPA cookie auth, Socialite para OAuth, React Query para server state, dos repos separados.

---

## Repos en GitHub

| Repo | URL | Últimos commits relevantes |
|---|---|---|
| Frontend | https://github.com/AleixAj/obsidian | `531cd83 feat(auth): wire account auth to Laravel Sanctum`; `f8fc04d feat(auth): protect account routes and document OAuth setup` |
| Backend  | https://github.com/AleixAj/obsidian-api | `0633db0 feat(auth): add Sanctum session auth and OAuth routes` |

Ambos repos están limpios y sincronizados con `origin/main` al cierre de Etapa 3.

---

## Layout local

```
C:\Users\Kylen\Desktop\Projects\
├── obsidian\                   frontend Vite/React (repo: AleixAj/obsidian)
├── obsidian-api\               backend Laravel 11 (repo: AleixAj/obsidian-api)
└── obsidian.code-workspace     workspace multi-root para Cursor
```

Abrir siempre `obsidian.code-workspace` para tener ambos repos en Cursor.

---

## Stack confirmado

### Backend (`obsidian-api`)

| Componente | Estado |
|---|---|
| Laravel 11 | API REST pública + auth real |
| Sanctum 4 | SPA cookie auth activada con `$middleware->statefulApi()` |
| Socialite 5 | Google/GitHub routes listas, pendientes credenciales |
| Cashier 16 | Instalado, se usará en Etapa 6 |
| DB dev | SQLite |

Archivos clave de auth:

- `bootstrap/app.php` — `statefulApi()` activado para Sanctum SPA cookies.
- `app/Http/Controllers/Api/AuthController.php` — `register`, `login`, `logout`, `user`.
- `app/Http/Controllers/Auth/SocialiteController.php` — `redirect`, `callback` para Google/GitHub.
- `routes/api.php` — endpoints JSON de auth.
- `routes/web.php` — endpoints browser redirect de OAuth.
- `config/app.php` — `frontend_url` para redirects.
- `config/services.php` + `.env.example` — credenciales OAuth.

### Frontend (`obsidian`)

Archivos clave de auth:

- `src/lib/api.ts` — `fetchUser`, `login`, `register`, `logout`, `oauthRedirectUrl`.
- `src/hooks/queries/useAuth.ts` — `useUser`, `useLogin`, `useRegister`, `useLogout`.
- `src/components/auth/ProtectedRoute.tsx` — protege `/account` y preserva `returnTo`.
- `src/pages/Auth.tsx` — formulario real + OAuth buttons + errores visibles.
- `src/pages/Account.tsx` — usuario real + logout server-side.
- `src/components/layout/Header.tsx` — muestra `Sign in` o `Account` según sesión.
- `README.md` y `PROCESS.md` — documentan OAuth/Sanctum.

---

## Endpoints en uso tras Etapa 3

### Catálogo

| Método | Path | Consumido por |
|---|---|---|
| GET | `/api/health` | manual / monitoring futuro |
| GET | `/api/products` | `useProducts()` — Home, Product related, Account wishlist |
| GET | `/api/products?category={slug}` | `useProducts(cat)` — Shop |
| GET | `/api/products/{slug}` | `useProduct(slug)` — Product |
| GET | `/api/categories` | `useCategories()` — Shop |

### Auth

| Método | Path | Consumido por |
|---|---|---|
| GET | `/sanctum/csrf-cookie` | `login`, `register`, `logout` antes de POST |
| POST | `/api/auth/register` | `useRegister()` |
| POST | `/api/auth/login` | `useLogin()` |
| POST | `/api/auth/logout` | `useLogout()` |
| GET | `/api/user` | `useUser()` |
| GET | `/auth/google/redirect` | botón Google |
| GET | `/auth/github/redirect` | botón GitHub |
| GET | `/auth/{provider}/callback` | callback OAuth |

Nota importante: como usamos `fetch`, `src/lib/api.ts` copia manualmente la cookie `XSRF-TOKEN` al header `X-XSRF-TOKEN`. Axios lo haría solo; fetch no.

---

## Cómo arrancar el entorno cada día

```powershell
# Terminal 1 — Backend (Laravel)
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
# → http://localhost:8000

# Terminal 2 — Frontend (Vite)
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm.cmd run dev
# → http://localhost:5173
```

En PowerShell, usar `npm.cmd` si sale el error de execution policy con `npm.ps1`.

---

## Validación realizada en Etapa 3

- `php artisan route:list --path=auth` ✅
- `vendor\bin\pint --dirty` ✅
- `php artisan test` ✅
- `php artisan migrate:status` ✅
- `npm.cmd run typecheck` ✅
- `npm.cmd run build` ✅
- Smoke Sanctum manual:
  - register → sesión creada ✅
  - `/api/user` devuelve el usuario ✅
  - logout con CSRF fresco ✅
- Prueba manual del user:
  - registro desde `/auth?mode=signup` ✅
  - redirección a `/account` ✅
  - usuario real mostrado en Account ✅
  - logout → `/account` redirige a `/auth` ✅

---

## OAuth Google/GitHub — pendiente de credenciales

Para activar OAuth real:

1. Crear app OAuth en Google Cloud Console.
2. Callback local:
   - `http://localhost:8000/auth/google/callback`
3. Crear OAuth App en GitHub Developer Settings.
4. Callback local:
   - `http://localhost:8000/auth/github/callback`
5. Rellenar backend `.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
```

No bloquear Etapa 4 por esto; email/password ya cumple auth real.

---

## 🛣️ Etapa 4 — Próximo paso

**Objetivo**: Account dashboard deja de ser principalmente mock y empieza a leer/escribir datos reales del backend.

**Tareas previstas**:

1. Backend:
   - Crear endpoint `GET /api/account` o expandir `/api/user` con profile summary.
   - Endpoints de addresses:
     - `GET /api/addresses`
     - `POST /api/addresses`
     - `PATCH /api/addresses/{id}`
     - `DELETE /api/addresses/{id}`
   - Endpoint de orders:
     - `GET /api/orders`
     - Por ahora puede devolver seed/demo ligado al usuario real.
   - Opcional: endpoint `PATCH /api/user` para profile/settings básicos.
2. Frontend:
   - Hooks `useAccount`, `useOrders`, `useAddresses`.
   - Sustituir `MOCK_ORDERS` y `MOCK_ADDRESSES` por API.
   - Mantener diseño actual, solo cambiar fuente de datos.
   - Estados loading/error en Account.
3. Smoke test:
   - login → `/account` muestra user real;
   - addresses cargan desde API;
   - crear/editar/borrar address funciona;
   - orders se listan desde API.

**Definition of done de Etapa 4**: `/account` no depende de mocks para usuario/direcciones/orders básicos; todo sale del backend autenticado.

---

## ⏸️ Pendientes opcionales

- [ ] Credenciales OAuth Google/GitHub.
- [ ] Pinear ambos repos en GitHub.
- [ ] Añadir description + topics en ambos repos.
- [ ] Branch protection cuando empiecen PRs reales.
- [ ] Limpiar errores históricos de `npm run lint` si vuelven a aparecer en archivos no tocados.

---

## 🛠️ Cosas que pueden romperse y cómo arreglarlas

| Problema | Solución |
|---|---|
| `npm` bloqueado por PowerShell | Usar `npm.cmd run dev` o `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`. |
| Registro/login da 419 | Falta CSRF/XSRF. Asegurarse de pedir `/sanctum/csrf-cookie` y mandar `X-XSRF-TOKEN`. Ya implementado en `src/lib/api.ts`. |
| Registro/login da 401 | Sesión no stateful o cookies no viajan. Revisar `SANCTUM_STATEFUL_DOMAINS=localhost:5173`, `FRONTEND_URL=http://localhost:5173`, CORS credentials y `statefulApi()`. |
| Google/GitHub vuelven a auth con error | Normal si faltan credenciales OAuth. |
| `/account` redirige a `/auth` | No hay sesión Laravel válida. Hacer login de nuevo. |
| Backend caído | `cd obsidian-api; php artisan serve`. |
| Frontend caído | `cd obsidian; npm.cmd run dev`. |

---

## Roadmap completo

| # | Etapa | Estado |
|---|---|---|
| 0 | Decisiones arquitectónicas | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | ✅ |
| 2 | SPA consume `/api/products` con react-query | ✅ |
| 3 | Auth real: email/password + OAuth routes | ✅ |
| **4** | **Account dashboard conectado** | **⏳ próximo** |
| 5 | Cart sync (guest ↔ user) | ⏸ |
| 6 | Checkout + Stripe sandbox | ⏸ |
| 7 | Wishlist sincronizada | ⏸ |
| 8 | Deploy (Cloudflare Pages + Railway/Render) + usuario demo | ⏸ |

---

## Histórico

- Etapa 1 cerrada → `.notes/etapa-1-checkpoint.md`.
- Etapa 2 cerrada → `.notes/etapa-2-checkpoint.md`.
- Detalle tutorial del proceso → `PROCESS.md`.
