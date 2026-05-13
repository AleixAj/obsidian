# PROCESS — Obsidian, paso a paso (modo dummies)

> Este archivo es para **ti, dentro de seis meses**, cuando alguien te pregunte
> *"¿por qué usaste X en vez de Y?"* y necesites una respuesta sólida en 30
> segundos. Cada sección dice **qué** hicimos, **por qué**, y **qué alternativa
> descartamos**. Si quieres el contexto operativo (URLs, comandos del día a
> día), salta a [Comandos diarios](#-comandos-diarios) o al checkpoint vigente
> en `.notes/etapa-N-checkpoint.md`.

---

## Índice

1. [¿Qué es Obsidian?](#qué-es-obsidian)
2. [Lectura express de 60 segundos](#lectura-express-de-60-segundos)
3. [Stack final y por qué](#stack-final-y-por-qué)
4. [Etapa 0 — Decisiones de arquitectura](#etapa-0--decisiones-de-arquitectura)
5. [Etapa 1 — Backend operativo](#etapa-1--backend-operativo)
6. [Etapa 2 — Frontend hablando con el backend](#etapa-2--frontend-hablando-con-el-backend)
7. [Comandos diarios](#-comandos-diarios)
8. [FAQ "si te preguntan en una entrevista…"](#faq-si-te-preguntan-en-una-entrevista)
9. [Roadmap restante](#roadmap-restante)

---

## ¿Qué es Obsidian?

Una tienda online ficticia de ropa urban-luxury. Es un **proyecto de
portfolio** pensado para enseñar en entrevistas el flujo completo:
catálogo → carrito → autenticación → checkout con Stripe → cuenta de
usuario → despliegue. La marca y la UI son fake, pero el código y la
arquitectura son los que pondrías en producción en una empresa real.

**Dos repos separados** en `github.com/AleixAj`:

- `obsidian` — frontend SPA (Vite + React + TS).
- `obsidian-api` — backend Laravel 11 con la API.

---

## Lectura express de 60 segundos

```
Navegador  ── HTTP/JSON ──► Laravel 11
   (SPA React)                (API REST)
       │                          │
       ├── localStorage           ├── SQLite (dev) / MySQL (prod)
       │   (cart, wishlist)       ├── Sanctum (auth, futuro)
       │                          ├── Socialite (Google/GitHub, futuro)
       └── react-query            └── Cashier (Stripe, futuro)
           (cache + loading)
```

- El SPA pide JSON a `http://localhost:8000/api/*`.
- React Query cachea las respuestas y pinta skeletons mientras espera.
- Carrito y wishlist siguen viviendo en `localStorage` (no necesitan
  backend hasta que haya cuentas de usuario).

---

## Stack final y por qué

### Frontend (`obsidian`)

| Pieza | Para qué sirve | Por qué esto y no otro |
|---|---|---|
| **Vite 8** | Bundler + dev server | Es lo que reemplazó a Create React App (oficialmente deprecado por React). Arranca el dev en <500 ms gracias a esbuild. Alternativa: Next.js — descartada porque no necesitamos SSR/SEO crítico ni server components, y queríamos algo desplegable como SPA estática en Cloudflare Pages. |
| **React 19** | UI declarativa basada en componentes | Es el estándar de la industria. Sabe hacer todo lo que necesitamos (hooks, suspense, lazy). |
| **TypeScript** | Tipado encima de JavaScript | Detecta errores antes de ejecutar (faltó un campo, te equivocaste de tipo, una función no devuelve lo que dices). En entrevistas vale doble: implica que sabes el "lenguaje + sistema de tipos". |
| **React Router 7** | Navegación SPA (URLs sin recargar) | Es el de toda la vida; cualquier dev React lo lee a la primera. Alternativa moderna: TanStack Router — descartada para no introducir dos librerías de TanStack y mantener la curva baja. |
| **@tanstack/react-query** | Capa de datos del servidor (fetch + cache + loading/error/refetch) | Cambia totalmente cómo escribes peticiones: en vez de `useEffect + useState + try/catch` (5-7 líneas por pantalla), pones `useQuery(...)` (1 línea). Se ha vuelto estándar en empresas — pregunta esperable en entrevistas. Alternativa: SWR (Vercel) — similar pero con ecosistema más pequeño. Otra: Redux Toolkit Query — descartado, demasiada ceremonia para un catálogo de 11 productos. |
| **localStorage** | Persistencia local (cart, wishlist) | Cero infraestructura, sobrevive al refresh. Cuando exista login, Etapa 5 sincroniza con el backend. |
| **CSS plano + variables CSS** | Estilos | Sin Tailwind ni styled-components a propósito: queríamos demostrar que sabemos escribir CSS desde cero, con tokens (`--gold`, `--bg`) y BEM-ligero. |

### Backend (`obsidian-api`)

| Pieza | Para qué sirve | Por qué esto y no otro |
|---|---|---|
| **PHP 8.3 + Laravel 11** | Framework full-stack para la API | Es **el** framework PHP del mercado español. Eloquent (ORM) + migrations + auth + queues vienen de fábrica. Alternativa: Node.js + NestJS — descartada por estratégico (queríamos que el portfolio cubriera ambos mundos: TS en front, PHP en back). |
| **Laragon** | Stack local (Apache + PHP + MySQL) para Windows | Más sencillo de instalar que XAMPP, instala PHP, Composer y la CLI en un solo paso. Solo aplica a desarrollo local; en prod no existe. |
| **Composer 2.9** | Gestor de paquetes PHP (equivalente a npm) | Estándar único en PHP. |
| **SQLite (dev) → MySQL (prod)** | Base de datos | SQLite vive en un fichero (`database/database.sqlite`), cero setup. MySQL es lo que ofrecen casi todos los hosts económicos (Railway, Render, Hostinger) cuando el proyecto va a producción. Eloquent abstrae las diferencias. |
| **Sanctum 4** | Autenticación para SPA + tokens API | Es la solución oficial de Laravel para nuestro caso (SPA en otro dominio que ataca a la API con cookies). Alternativa: Passport (OAuth2 completo) — descartado por overkill para un e-commerce de marca propia. |
| **Socialite 5** | Login social con Google + GitHub | Una línea por proveedor; Laravel hace el handshake OAuth por ti. |
| **Cashier (Stripe) 16** | Suscripciones / pagos vía Stripe | Wrapper oficial de Stripe para Laravel. Permite gestionar customers, métodos de pago y webhooks sin tocar la API REST de Stripe directamente. |

### Infraestructura (futura)

| Capa | Servicio | Por qué |
|---|---|---|
| Frontend deploy | **Cloudflare Pages** | Gratis, CDN global, build desde Git, SSL incluido. |
| Backend deploy | **Railway / Render** | Hosts modernos pensados para frameworks como Laravel (DB + worker + cron en un panel). |
| Repos | **GitHub** | Estándar absoluto. Necesario para que las commits cuenten en el perfil. |

---

## Etapa 0 — Decisiones de arquitectura

Esta es la etapa "papel y boli" antes de escribir una línea de código.

### Decisión 1 — ¿Monorepo o dos repos?

**Elegido**: dos repos separados.

- ✅ Frontend y backend tienen ciclos de vida diferentes (un fix en CSS
  no toca migraciones; una migración no toca el bundler).
- ✅ Despliegues distintos (Cloudflare Pages vs Railway), CI distinto.
- ✅ Visualmente el perfil de GitHub queda con dos repos activos en
  lugar de uno solo.
- ❌ Hay que cambiar de carpeta para tocar el otro lado. Resuelto con
  `obsidian.code-workspace` (workspace multi-root de Cursor).

### Decisión 2 — ¿SSR o SPA?

**Elegido**: SPA pura (sin Next.js).

- ✅ Tipo "tienda de portfolio": SEO no es crítico (no compite con
  Zalando).
- ✅ Se sirve como ficheros estáticos en CDN → barato y rápido.
- ✅ Lógica de auth/checkout en cliente vía API REST.
- ❌ Crawlers no leen JS — irrelevante aquí.

### Decisión 3 — Stack auth

**Elegido**: Sanctum + Socialite + Cashier (todo Laravel oficial).

- ✅ Cero glue code: cookies SPA + tokens API funcionan out-of-the-box.
- ✅ Mismo equipo (Laravel) los mantiene → versiones compatibles.
- ✅ Vendible en entrevista como "domino el ecosistema Laravel
  end-to-end".

### Decisión 4 — Base de datos

**Elegido**: SQLite en dev, MySQL en prod.

- ✅ SQLite: levantar el repo es `git clone && composer install &&
  php artisan migrate --seed`. Cero servicios externos en local.
- ✅ MySQL en prod: cualquier host económico lo soporta.
- ✅ Eloquent oculta las diferencias (mismas migraciones funcionan).

---

## Etapa 1 — Backend operativo

**Objetivo**: tener una API pública que devuelva el catálogo. El
frontend todavía no la consume; solo queremos endpoints sólidos.

### Paso 1.1 — Crear el proyecto Laravel

```bash
composer create-project laravel/laravel obsidian-api
cd obsidian-api
```

**Por qué**: arranca un esqueleto Laravel limpio con todas las
dependencias mínimas.

### Paso 1.2 — Instalar Sanctum, Socialite y Cashier

```bash
composer require laravel/sanctum laravel/socialite laravel/cashier-stripe
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan vendor:publish --tag="cashier-config"
```

**Por qué ahora y no más adelante**: cada uno publica migraciones
(tabla de tokens, tabla de subscriptions…). Es más limpio incluirlas en
la primera tanda que mezclar migraciones de auth con migraciones de
producto seis meses después.

### Paso 1.3 — Configurar SQLite

```bash
# .env
DB_CONNECTION=sqlite
# y crear el fichero vacío
New-Item database\database.sqlite
```

**Por qué**: cero configuración para entrar al proyecto. El día que
queramos MySQL local, basta cambiar `DB_CONNECTION=mysql` y reiniciar.

### Paso 1.4 — Modelo de datos

Tablas:

- `categories` — slug, nombre, eyebrow, título, gold_word, posición.
- `products` — slug, nombre, sub-label, precio en céntimos (entero,
  nunca float para dinero), tag, paleta, imagen, etc.
- `category_product` (pivote) — relación M:N entre categorías y
  productos.
- `product_colors` — hex, nombre, posición.
- `product_sizes` — label, posición, `is_sold_out`.

**Por qué precios en céntimos**: las operaciones en float pueden
producir errores tipo `0.1 + 0.2 = 0.30000000000000004`. Guardarlos
como `int cents` (24000 = 240,00 €) elimina ese problema. El frontend
divide por 100 al pintar.

### Paso 1.5 — Seed con 11 productos y 6 categorías

`database/seeders/CatalogueSeeder.php` carga los mismos productos que
ya tenía el SPA (`p1`–`p11`). Mantener los slugs iguales evita que
cualquier link previo se rompa.

```bash
php artisan migrate:fresh --seed
```

### Paso 1.6 — Endpoints públicos

`routes/api.php`:

```php
Route::get('/health', HealthController::class);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::middleware('auth:sanctum')->get('/user', UserController::class);
```

**Por qué `/health`**: cualquier servicio en prod necesita un endpoint
que diga "estoy vivo y mi DB responde". Es lo primero que mira Railway
o un load balancer.

### Paso 1.7 — CORS

`config/cors.php` permite que el SPA (`localhost:5173` en dev) hable
con la API (`localhost:8000`). Sin esto, el navegador bloquea las
peticiones cross-origin.

### Paso 1.8 — Subir a GitHub

```bash
gh repo create AleixAj/obsidian-api --public --source=.
git push -u origin main
```

7 commits siguiendo Conventional Commits (`feat:`, `chore:`, `docs:`).

---

## Etapa 2 — Frontend hablando con el backend

**Objetivo**: el SPA deja de leer el catálogo desde un array hardcoded
y empieza a pedirlo a Laravel. La UI no cambia visualmente.

### Paso 2.1 — Instalar React Query

```bash
npm i @tanstack/react-query @tanstack/react-query-devtools
```

**Por qué React Query y no `useEffect + fetch`**:

Antes (sin React Query) escribíamos esto en cada pantalla:

```ts
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/products')
    .then(r => r.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

Ahora:

```ts
const { data, isPending, isError } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});
```

Y además **gratis**: caché compartida entre componentes, refetch al
volver a la pestaña, reintentos automáticos, deduplicación de
peticiones simultáneas.

### Paso 2.2 — `QueryClient` global

`src/lib/queryClient.ts` crea **una sola** instancia con la
configuración por defecto que queremos:

- `staleTime: 60s` → el catálogo se considera fresco un minuto. Mientras
  tanto, ningún componente refetches al montarse.
- `retry: 1` → un reintento es suficiente para recuperarse de un hipo
  del backend sin marear al usuario con 3 esperas exponenciales.
- `refetchOnWindowFocus: false` → no refetch al volver a la pestaña
  (los productos no cambian cada vez que el usuario mira el chat).

`src/main.tsx` envuelve `<App />` con `<QueryClientProvider>` para que
cualquier componente del árbol pueda usar `useQuery`.

### Paso 2.3 — Hooks de datos

`src/hooks/queries/`:

- `useProducts(category?)` — lista de productos, filtrada server-side.
- `useProduct(slug)` — un producto. Se desactiva con `enabled` si el
  slug aún no llegó del router.
- `useCategories()` — devuelve un `Record<slug, CategoryMeta>` para
  lookups O(1) en la PLP.

Los tres usan `select` para aplicar el **adapter** `toProduct` /
`toCategoryMap` (transforma el DTO de la API en el tipo `Product` que
ya consumían los componentes). **Por qué el adapter**: si un día el
backend renombra `price_cents` a `priceCents`, solo se toca una
función, no 30 componentes.

### Paso 2.4 — Refactor de las páginas

- `Home.tsx` (FeaturedGrid) → `useProducts()` + skeleton + bloque de
  error con botón Retry.
- `Shop.tsx` (PLP) → `useProducts(cat)` para filtro server-side +
  `useCategories()` para el header. Los filtros de talla/color/orden
  siguen siendo client-side (mejor UX que ir al servidor por cada
  click en un chip).
- `Product.tsx` (PDP) → `useProduct(id)`. Si el backend devuelve 404 →
  render `<NotFound />`. Si error de red → card de retry.
- `Account.tsx` → `MOCK_ORDERS` ahora referencia productos por **slug**
  (`["p1","p2"]` en lugar de índices `[0,1]`). El `Account` raíz crea
  un `Map<slug, Product>` con todos los productos y lo pasa a las
  subsecciones — cada thumbnail del pedido se resuelve en O(1).

### Paso 2.5 — Skeletons y estados de error

Nuevo componente `ProductCardSkeleton`:

- Mismo footprint que el `ProductCard` real → cero saltos de layout
  cuando llegan los datos.
- Shimmer dorado sutil vía gradiente animado (`@keyframes sk-shimmer`)
  → señala "estoy cargando" sin distraer.

Clase `.data-error` para errores graves: borde dashed warm, botón
Retry, hint indicando si el backend está caído.

### Paso 2.6 — Limpieza

`src/data/products.ts` ahora solo exporta `IMAGES`, `BRAND` y
`TEMPLATES` (assets visuales). Fuera `PRODUCTS` y `CATEGORY_META`,
que ahora vienen de la API.

**Verificación**:

- `npm run typecheck` → ✅
- `npm run build` → ✅ (331 KB JS · 55 KB CSS · gzip 100/9.5)
- `curl /api/health`, `/api/products`, `/api/products/p1`,
  `/api/categories` → todos 200.

---

## Etapa 3 — Autenticación real

**Objetivo**: dejar de navegar a `/account` como demo y usar una sesión
real de Laravel Sanctum. El navegador guarda una cookie de sesión; el
frontend solo pregunta `GET /api/user` para saber si hay usuario.

### Paso 3.1 — Sanctum stateful API

En Laravel 11 se activa en `bootstrap/app.php`:

```php
$middleware->statefulApi();
```

**Por qué**: sin esto, Sanctum trata las peticiones `/api/*` como API
stateless de tokens. Con esto, las peticiones desde `localhost:5173`
pueden usar cookies de sesión como una SPA first-party.

### Paso 3.2 — Register / login / logout

Backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user`

Frontend:

- `useUser()`
- `useLogin()`
- `useRegister()`
- `useLogout()`

**Detalle importante**: usamos `fetch`, no Axios. Axios copia
automáticamente la cookie `XSRF-TOKEN` al header `X-XSRF-TOKEN`.
`fetch` no lo hace, así que `src/lib/api.ts` lo implementa a mano.
Si falta, Laravel devuelve `419` o `401`.

### Paso 3.3 — `/account` protegido

`ProtectedRoute` comprueba `useUser()` antes de renderizar Account:

- si está cargando → loading branded;
- si hay usuario → deja pasar;
- si no hay sesión → redirige a `/auth?returnTo=/account/...`.

Así evitamos enseñar datos mockeados como si fueran reales.

### Paso 3.4 — OAuth Google/GitHub (preparado, activación al final)

Backend preparado con Socialite:

```text
/auth/google/redirect
/auth/google/callback
/auth/github/redirect
/auth/github/callback
```

Decisión actual: dejar la activación para el final (deploy). Motivo:
Google/GitHub necesitan callback URLs exactas, y es mejor configurarlas
una vez con los dominios reales de Cloudflare/Railway que rehacerlas en
cada etapa.

Para activarlo al final hay que crear apps OAuth y rellenar `.env`:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/auth/github/callback
```

Si faltan credenciales, el backend redirige a
`/auth?error=oauth_not_configured` en vez de romper con error 500.

---

## 🟢 Comandos diarios

Abrir Cursor con **`obsidian.code-workspace`** (ambos repos a la vez).

```powershell
# Terminal 1 — Backend
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
# → http://localhost:8000

# Terminal 2 — Frontend
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm run dev
# → http://localhost:5173
```

Para resetear datos del backend:

```powershell
php artisan migrate:fresh --seed --no-interaction
```

Para abrir las React Query Devtools en el navegador: botón con el logo
de react-query en la esquina inferior-izquierda del SPA en modo dev.

---

## FAQ "si te preguntan en una entrevista…"

> **"¿Por qué dos repos en lugar de un monorepo con turborepo/nx?"**
> Porque frontend y backend se despliegan en sitios distintos
> (Cloudflare Pages vs Railway), tienen pipelines de CI distintos y
> versionan de forma independiente. Turborepo aporta valor cuando
> compartes mucho código entre paquetes — aquí solo se comparte un
> contrato HTTP/JSON, que vive en el adapter `toProduct`.

> **"¿Por qué Vite y no Next.js?"**
> Porque es un SPA de portfolio sin requerimientos de SEO ni SSR.
> Servir el bundle estático en una CDN (Cloudflare Pages) es más
> barato, más simple y más rápido. Next.js sería overkill — añadiría
> un runtime Node en producción para nada.

> **"¿Por qué React Query y no Redux?"**
> Redux gestiona **estado de cliente** (toggles, formularios, UI).
> React Query gestiona **estado de servidor** (datos que viven en una
> API y necesitan caché, refetch, invalidaciones). Son problemas
> distintos. En este proyecto el estado de cliente es trivial
> (`useState` + Context para cart/wishlist) y todo lo complejo es
> servidor → React Query encaja perfecto.

> **"¿Por qué Sanctum y no Passport?"**
> Sanctum cubre el 99% de los casos para SPA + API (cookies + tokens).
> Passport implementa OAuth2 completo, lo cual es necesario si
> Obsidian fuera **proveedor de identidad** para terceros (tipo "Sign
> in with Obsidian"). No es el caso → Passport sobra.

> **"¿Por qué SQLite en dev?"**
> Para que cualquier persona pueda clonar el repo y correr el
> proyecto sin instalar MySQL ni Docker. La DB vive en un fichero del
> propio repo (en `.gitignore`, claro). En producción usamos MySQL.

> **"¿Por qué precios en céntimos y no en euros decimales?"**
> Para evitar errores de coma flotante (`0.1 + 0.2 ≠ 0.3` en
> JavaScript). El backend guarda enteros (`price_cents = 24000`), el
> adapter del frontend divide por 100 al pintar (`€240`).

> **"¿Cómo manejas errores de red?"**
> Cada pantalla con datos remotos tiene tres estados explícitos:
> `isPending` → skeleton; `isError` → card con botón Retry; éxito →
> render normal. React Query reintenta una vez automáticamente, así
> que el usuario solo ve el error si realmente hay un problema.

---

## Roadmap restante

| # | Etapa | Qué añade | Estado |
|---|---|---|---|
| 0 | Decisiones arquitectónicas | – | ✅ |
| 1 | Setup Laravel + schema + seed + endpoints públicos | Backend operativo | ✅ |
| 2 | SPA consume `/api/products` con react-query | UI viva contra el backend | ✅ |
| 3 | Auth real (email/password + OAuth preparado) | Login funcional, sesión persistente | ✅ |
| 4 | Account dashboard conectado | Pedidos/direcciones/ajustes reales | ⏸ |
| 5 | Cart sync (guest ↔ user) | El carrito sobrevive al login | ⏸ |
| 6 | Checkout + Stripe sandbox | Pagar de verdad en modo test | ⏸ |
| 7 | Wishlist sincronizada | Wishlist multi-dispositivo | ⏸ |
| 8 | Deploy (Cloudflare Pages + Railway) + demo user + OAuth real | Proyecto navegable desde internet | ⏸ |

---

**Cuando termine una etapa**, este archivo gana una sección "Etapa N",
el checkpoint vivo (`.notes/etapa-N-checkpoint.md`) se cierra, y se
abre el de la etapa siguiente.
