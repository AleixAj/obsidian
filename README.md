# OBSIDIAN

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=111)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=fff)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-ff4154?logo=reactquery&logoColor=fff)
![Laravel API](https://img.shields.io/badge/API-Laravel_11-ff2d20?logo=laravel&logoColor=fff)

<p>
  <img src="docs/readme/lang-es-active.svg" alt="Español" width="170">
  <a href="README.en.md"><img src="docs/readme/lang-en.svg" alt="English" width="170"></a>
  <a href="README.ca.md"><img src="docs/readme/lang-ca.svg" alt="Català" width="170"></a>
</p>

E-commerce full-stack de tienda de ropa urbana creado como proyecto de portfolio: una tienda React con estética oscura y acentos dorados, conectada a una API Laravel 11, desplegada con base de datos de producción y flujos reales de usuario autenticado.

El objetivo es demostrar cómo se planifica, implementa y despliega una app de comercio con enfoque real: catálogo servido por API, área de cuenta autenticada, carrito y wishlist sincronizados, creación de pedidos, despliegue en producción y decisiones técnicas documentadas.

## Capturas

![Hero de la home](./docs/screenshots/home-hero.png)

![Sección lookbook](./docs/screenshots/home-lookbook.png)

![Categorías](./docs/screenshots/home-categories.png)

![Colección women](./docs/screenshots/shop-women.png)

![Página de producto](./docs/screenshots/product-detail.png)

![Panel de administración: resumen](./docs/screenshots/admin-overview.png)

![Panel: devoluciones](./docs/screenshots/admin-returns.png)

## Alcance del Proyecto

Este repositorio contiene el frontend. El backend vive en
[`AleixAj/obsidian-api`](https://github.com/AleixAj/obsidian-api).

Funcionalidades implementadas:

- CI de portfolio con lint, typecheck, tests unitarios y build en GitHub Actions.
- Despliegue de producción: [`obsidian.aleixaj.com`](https://obsidian.aleixaj.com).
- Catálogo servido por endpoints Laravel (`/api/products`, `/api/categories`).
- Páginas de listado con filtros por categoría, talla, color, precio y ordenación.
- Página de producto con galería, selector de talla/color y sección "complete the look".
- Drawer de carrito con cantidades, totales, progreso de envío gratis, sincronización backend y checkout básico.
- Wishlist persistente para invitados y sincronizada con backend para usuarios autenticados.
- Dashboard de cuenta con resumen, pedidos, CRUD de direcciones y ajustes de perfil.
- Registro/login con email y contraseña usando sesiones cookie de Laravel Sanctum.
- Merge de carrito/wishlist invitado después de login o registro.
- Checkout básico que convierte el carrito autenticado en un pedido real.
- Layout responsive hasta móvil.
- Skeletons de carga y estados de error reintentables.
- React Query Devtools en desarrollo.
- Panel de administración en `/admin` con roles, pedidos, stock, clientes, devoluciones y equipo ([ver sección](#panel-de-administración-admin)).
- Acceso demo con un clic (tienda y panel) para revisar el proyecto sin registrarse.
- Test de extremo a extremo con Playwright del flujo principal.

## Panel de administración (`/admin`)

Una herramienta interna como la de una tienda real, en el mismo SPA pero cargada aparte
(los visitantes de la tienda no descargan su código).

**Pruébalo sin registrarte:** entra en [`/admin/login`](https://obsidian.aleixaj.com/admin/login)
y elige un rol con los botones de demo. En el login de la tienda también hay un acceso de
"cliente demo". Los datos de ejemplo (unos 900 pedidos de 90 días, 60 clientes, stock y
devoluciones) se reinician solos cada 24 horas.

![Ficha de producto con la tabla de stock](./docs/screenshots/admin-product-stock.png)

| Sección | Qué hace |
|---|---|
| Resumen | Ventas, pedidos, ticket medio y tasa de devoluciones (hoy / 7 / 30 días) comparados con el periodo anterior, gráfica, más vendidos, últimos pedidos y avisos de stock bajo. |
| Pedidos | Filtros, búsqueda, detalle y cambio de estado paso a paso (pagado → preparando → enviado → entregado) con historial de quién lo hizo. |
| Productos y stock | Crear y editar productos, colores, tallas y fotos (subida desde el ordenador). Stock por color y talla con historial de movimientos. La compra descuenta stock. |
| Clientes | Listado con total gastado y ficha con direcciones e historial de pedidos. |
| Devoluciones | El cliente la pide desde su cuenta (30 días); atención al cliente la aprueba o rechaza y hace el reembolso (simulado, sin Stripe todavía). El stock vuelve solo. |
| Usuarios y roles | Equipo, tabla de permisos, añadir personas y cambiar su rol. |
| Exportar | Cada listado se descarga en CSV o Excel. |

**Roles** (se comprueban en la API en cada petición, no solo en la interfaz):

| | Administración | Almacén | Atención al cliente |
|---|:---:|:---:|:---:|
| Resumen y pedidos | ✓ | ✓ | ✓ |
| Stock | ✓ | ✓ | |
| Editar productos | ✓ | | |
| Clientes y devoluciones | ✓ | | ✓ |
| Usuarios y roles | ✓ | | |

**Decisiones:**

- Permisos en un solo sitio (`App\Enums\Role` en la API) y Gates de Laravel en las rutas.
- Las cuentas demo son compartidas: no pueden subir archivos ni cambiar el equipo (si no,
  cualquiera podría darse acceso de administrador), y el catálogo se restaura cada día.
- Las fotos se reducen y se guardan en WebP con GD, en un volumen de Railway.
- Gráficas con Recharts; Excel con OpenSpout.

**Tests:** 65 tests de la API (sobre todo permisos por rol) y un test de extremo a extremo
con Playwright (`e2e/main-flow.e2e.ts`): un cliente pide una devolución, atención al cliente
la aprueba y la reembolsa, el cliente ve el reembolso, almacén prepara un pedido y no puede
ver clientes, y administración revisa el resumen y el equipo. Se ejecuta en la CI de la API
en cada push y cada noche.

![El panel en móvil](./docs/screenshots/admin-mobile.png)

## Stack Técnico

| Capa | Elección | Motivo |
|---|---|---|
| Build | Vite 8 | Desarrollo SPA rápido y despliegue estático sencillo. |
| UI | React 19 | Modelo de componentes, hooks y buena relevancia profesional. |
| Lenguaje | TypeScript 6 | Refactors más seguros y modelos de dominio compartidos. |
| Routing | React Router 7 | Páginas y secciones de cuenta guiadas por URL. |
| Server state | TanStack React Query 5 | Caché, estados de carga/error, retries y deduplicación de peticiones. |
| Client state | React Context | Carrito, wishlist y toasts sin añadir Redux. |
| Persistencia | `localStorage` + backend cart/wishlist | Invitados conservan datos; usuarios sincronizan con Laravel al autenticarse. |
| Estilos | CSS plano + tokens | Demuestra fundamentos de CSS sin depender de un framework. |
| Backend | Laravel 11 API | Repositorio separado, endpoints REST, Sanctum auth y MySQL en producción. |
| Deploy | Cloudflare Workers + Assets + Railway | SPA en Cloudflare edge, API Laravel con MySQL gestionado. |

## Arquitectura

El frontend mantiene clara la frontera con la API:

```txt
DTOs de Laravel API
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
Pages y componentes reciben objetos Product listos para UI
```

Esto evita que la UI renderice directamente campos de backend como `price_cents` o `img_alt`. Si cambia la forma de la API, el adapter se actualiza en un único punto.

### Configuración de QueryClient

`src/lib/queryClient.ts` define un cliente compartido:

- `staleTime: 60_000`, porque el catálogo cambia poco durante una sesión.
- `retry: 1`, para recuperarse de fallos transitorios sin retrasar demasiado al usuario.
- `refetchOnWindowFocus: false`, para evitar refetches ruidosos al cambiar de pestaña.

### Estado local vs estado servidor

React Query gestiona datos de servidor (`products`, `categories`, `user`, `account`, `cart` autenticado, `wishlist` autenticada). React Context gestiona estado local de UI (`toasts`) y expone las APIs de carrito/wishlist a los componentes.

Los invitados usan `localStorage`, los usuarios autenticados usan la API Laravel, y ambos estados se fusionan después de login/registro. Así la navegación como invitado es rápida sin perder portabilidad entre dispositivos.

## Estructura del Proyecto

```txt
src/
├── admin/             # Panel /admin: páginas, componentes, API y hooks propios
├── components/
│   ├── cart/          # CartDrawer
│   ├── layout/        # Header, Footer, AnnounceBar, Layout
│   ├── product/       # ProductCard, ProductCardSkeleton
│   └── ui/            # Logo, Icon, Marquee, Placeholder, Reveal
├── context/           # CartContext, WishlistContext, ToastContext
├── data/              # Assets visuales/editoriales de marca
├── hooks/
│   ├── queries/       # Hooks React Query
│   ├── useLocalStorage.ts
│   └── useReveal.ts
├── lib/               # Cliente API + QueryClient
├── pages/             # Home, Shop, Product, Lookbook, Auth, Account, Legal, NotFound
├── styles/            # Tokens CSS, globales y estilos por página
├── types/             # Product, CartItem, Category
└── utils/             # formatPrice, pad
```

## Setup Local Full-Stack

### 1. Arrancar el backend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve
```

Laravel debería estar disponible en `http://localhost:8000`.

Comprobaciones útiles:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
Invoke-RestMethod http://localhost:8000/api/products
Invoke-RestMethod http://localhost:8000/api/categories
```

### 2. Arrancar el frontend

```powershell
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm install
npm run dev
```

Vite debería estar disponible en `http://localhost:5173`.

El frontend lee la URL base de la API desde:

```env
VITE_API_URL=http://localhost:8000
```

En producción usa:

```env
VITE_API_URL=https://obsidian-api-production-8b5e.up.railway.app
```

## Scripts

```bash
npm run dev        # arranca Vite en desarrollo
npm run typecheck  # comprueba TypeScript sin emitir archivos
npm run test:ci    # ejecuta tests unitarios con Vitest
npm run build      # build de producción
npm run preview    # previsualiza dist localmente
npm run lint       # ESLint
npm run e2e        # test de extremo a extremo (arranca la API y la tienda)
```

Verificado:

- `npm run typecheck` pasa.
- `npm run test:ci` pasa.
- `npm run build` pasa.
- GitHub Actions ejecuta lint, typecheck, tests y build en cada push/PR.
- Smoke checks de producción contra Railway/Cloudflare.
- Auth Sanctum funciona desde `obsidian.aleixaj.com`.
- Las imágenes y datos de catálogo cargan desde la API de Railway.

## Producción

- Frontend: [`https://obsidian.aleixaj.com`](https://obsidian.aleixaj.com)
- Backend API: [`https://obsidian-api-production-8b5e.up.railway.app`](https://obsidian-api-production-8b5e.up.railway.app)
- Health check: [`/api/health`](https://obsidian-api-production-8b5e.up.railway.app/api/health)
- Demo sin contraseña: botón "Reviewing this project?" en `/auth` y botones de rol en `/admin/login`

Notas de despliegue:

- El frontend se despliega con Cloudflare Workers + Assets usando `wrangler.jsonc`.
- Comando de build en Cloudflare: `npm run build`.
- Comando de deploy: `npx wrangler deploy`.
- El fallback SPA se gestiona con `not_found_handling="single-page-application"`.
- Se eliminó el antiguo `_redirects` porque provocaba un bucle de redirecciones en Workers + Assets.
- `src/lib/api.ts` evita que builds de producción usen `localhost:8000` por error.

## Contrato con el Backend

El frontend consume actualmente:

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/products` | Home, recomendaciones, Account |
| `GET` | `/api/products?category={slug}` | Páginas Shop por categoría |
| `GET` | `/api/products/{slug}` | Detalle de producto |
| `GET` | `/api/categories` | Metadata del header de Shop |
| `GET` | `/api/health` | Smoke checks/manual monitoring |
| `GET` | `/api/user` | Usuario autenticado actual |
| `PATCH` | `/api/user` | Actualizar nombre/email |
| `POST` | `/api/auth/register` | Crear cuenta e iniciar sesión |
| `POST` | `/api/auth/login` | Login email/password |
| `POST` | `/api/auth/logout` | Logout servidor |
| `GET` | `/api/account` | Resumen dashboard cuenta |
| `GET` | `/api/orders` | Pedidos del usuario |
| `GET` | `/api/addresses` | Direcciones del usuario |
| `POST` | `/api/addresses` | Crear dirección |
| `PATCH` | `/api/addresses/{id}` | Editar dirección / marcar default |
| `DELETE` | `/api/addresses/{id}` | Borrar dirección |
| `GET` | `/api/cart` | Carrito autenticado |
| `POST` | `/api/cart/items` | Añadir producto al carrito |
| `PATCH` | `/api/cart/items/{id}` | Cambiar cantidad |
| `DELETE` | `/api/cart/items/{id}` | Eliminar línea |
| `DELETE` | `/api/cart/items` | Vaciar carrito |
| `POST` | `/api/cart/merge` | Fusionar carrito guest tras login/register |
| `POST` | `/api/checkout` | Convertir carrito en pedido |
| `GET` | `/api/wishlist` | Slugs de wishlist autenticada |
| `POST` | `/api/wishlist/items` | Añadir producto a wishlist |
| `DELETE` | `/api/wishlist/items/{slug}` | Quitar producto de wishlist |
| `DELETE` | `/api/wishlist/items` | Vaciar wishlist |
| `POST` | `/api/wishlist/merge` | Fusionar wishlist guest tras login/register |

El dinero se almacena en la API como céntimos enteros (`price_cents`). El adapter lo transforma al `Product.price` que renderizan los componentes.

## OAuth Setup

Las rutas de OAuth con Google/GitHub están implementadas en Laravel
(`SocialiteController`). Google ya está configurado en producción; las credenciales
son variables de Railway:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://obsidian.aleixaj.com/auth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=https://obsidian.aleixaj.com/auth/github/callback
```

**El `redirect_uri` debe apuntar al dominio público, no al de Railway.** El
Worker proxya `/auth/` hacia el backend (ver `worker.js`), así que la
callback llega igual a Laravel — pero la cookie de sesión se emite entonces
sobre `obsidian.aleixaj.com`, que es el dominio desde el que el SPA hace las
peticiones. Apuntando la callback a `*.up.railway.app` el login parece
completarse y el usuario vuelve deslogueado, porque la cookie queda en otro
dominio y Sanctum nunca la recibe.

Para publicar la pantalla de consentimiento de Google en modo producción
(sin lista de usuarios de prueba) hacen falta una URL de política de privacidad y
otra de condiciones del servicio servidas desde el dominio autorizado: son las
rutas `/privacy` y `/terms` (`src/pages/Legal.tsx`).

Mientras no existan esos valores, los botones sociales redirigen de vuelta a
`/auth` con un error claro de "not configured".

## Stripe Setup (Pendiente)

Las dependencias/env placeholders de Stripe/Cashier existen en el backend, pero el cobro real queda aplazado hasta configurar claves y webhook. El checkout actual ya crea pedidos reales sin cobrar tarjeta.

## Roadmap

- [x] Etapa 0 - Decisiones de arquitectura.
- [x] Etapa 1 - Backend Laravel 11, esquema, seeders y API pública.
- [x] Etapa 2 - SPA React consumiendo backend con React Query.
- [x] Etapa 3 - Auth real: email/password + rutas OAuth preparadas.
- [x] Etapa 4 - Dashboard de cuenta conectado a datos reales.
- [x] Etapa 5 - Carrito guest sincronizado con usuario al hacer login.
- [x] Etapa 6 - Checkout básico: carrito autenticado -> pedido.
- [x] Etapa 7 - Wishlist sincronizada entre dispositivos.
- [x] Etapa 8 - Deploy: Cloudflare Workers + Assets, Railway y usuario demo.
- [x] Etapa 9 - Páginas legales (`/privacy`, `/terms`) requeridas por el consentimiento de Google.
- [x] Etapa 10 - Panel de administración: roles, pedidos, stock, clientes, devoluciones, equipo y exportación.
- [ ] Siguiente - Almacén en 3D (ubicaciones por variante) y pagos reales con Stripe.

## Por Qué Importa Este Proyecto

Obsidian no es solo un mockup estático. Está estructurado como un proyecto pequeño de producción:

- La UI tiene suficiente acabado para evaluar criterio visual.
- La frontera con backend es real, tipada y aislada.
- Auth, carrito, wishlist, cuenta y checkout cruzan frontend/backend.
- El fetching contempla caché, retries, loading states y errores.
- La app está desplegada con configuración real, base de datos gestionada y smoke checks.
- Las decisiones están documentadas en `PROCESS.md`, incluyendo trade-offs.
- El roadmap es incremental para poder revisar y desplegar por etapas.

## Créditos

- Imágenes: Unsplash y assets locales/editoriales de marca.
- Tipografía: Syne, Space Grotesk y JetBrains Mono vía Google Fonts.
- Logo y dirección visual: concepto Obsidian Studio.

---

Proyecto de portfolio. No es una tienda real.
