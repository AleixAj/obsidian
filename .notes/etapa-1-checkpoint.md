# OBSIDIAN — Estado tras Etapa 1

> Si abres Cursor en otro día, pasa este archivo al chat (`@etapa-1-checkpoint.md`) y arrancamos Etapa 2 sin preguntar dos veces.

## ✅ Etapa 1 cerrada

Backend Laravel 11 levantado, schema completo, 11 productos seedeados y los endpoints públicos respondiendo 200. La UI sigue intacta usando el array estático: la conexión real se hace en Etapa 2.

### Lo que existe ahora

```
C:\Users\Kylen\Desktop\Projects\
├── obsidian\                 frontend Vite/React (sin cambios visibles, +api.ts +.env)
├── obsidian-api\             backend Laravel 11 (NUEVO, ya en git con 7 commits)
└── obsidian.code-workspace   workspace multi-root para Cursor
```

### Stack final del backend

| Componente | Versión |
|---|---|
| PHP | 8.3.30 (Laragon) |
| Composer | 2.9.4 |
| Laravel | 11.51.0 |
| Sanctum | ^4.0 (tokens + SPA cookies) |
| Socialite | ^5.27 (Google, GitHub) |
| Cashier (Stripe) | ^16.5 |
| DB dev | SQLite (`database/database.sqlite`) |

### Endpoints listos (Etapa 1)

| Método | Path | Estado |
|---|---|---|
| GET | `/api/health` | 200 + ping a SQLite |
| GET | `/api/products` | Lista (11) |
| GET | `/api/products?category=men` | Filtro por slug |
| GET | `/api/products/{slug}` | Detalle por slug (p1..p11) |
| GET | `/api/categories` | 6 categorías con `count` |
| GET | `/api/user` (auth:sanctum) | Placeholder hasta Etapa 3 |

Respuesta usa **API Resources**: precios en `price_cents`, `colors` con hex+name, `sizes` con `is_sold_out`, `categories` como array de slugs.

### Schema en SQLite

- `categories`, `products`, `category_product`, `product_colors`, `product_sizes` (catálogo, ya con datos)
- `users` (+ columnas `oauth_provider`, `oauth_provider_id`, `avatar_url`, `stripe_id`...), `personal_access_tokens`
- `addresses`, `carts`, `cart_items`, `wishlists`, `orders`, `order_items`, `order_addresses` (vacías hasta Etapas 3–6)
- Cashier: `subscriptions`, `subscription_items`

### Frontend tocado (mínimo)

- `obsidian/.env` con `VITE_API_URL=http://localhost:8000` (gitignored)
- `obsidian/.env.example` (versionable)
- `obsidian/src/lib/api.ts` — cliente tipado con DTOs + adapter `toProduct(dto): Product`. **No se usa todavía**; se enchufa en Etapa 2.
- `obsidian/src/vite-env.d.ts` — tipa `import.meta.env.VITE_API_URL`
- `obsidian/.gitignore` — ignora `.env` y `.env.*` excepto `.env.example`

## 🔧 Cómo arrancar el entorno cada día

Dos terminales (o usa `Run Task` en VS Code/Cursor):

```powershell
# Backend
cd C:\Users\Kylen\Desktop\Projects\obsidian-api
php artisan serve

# Frontend
cd C:\Users\Kylen\Desktop\Projects\obsidian
npm run dev
```

Frontend en `http://localhost:5173`, backend en `http://localhost:8000`. CORS ya configurado para que se hablen.

Para abrir Cursor con ambos proyectos a la vez: doble click en `Projects\obsidian.code-workspace` (o `File → Open Workspace from File...`).

## ⚠️ Pendientes de tu decisión

1. **Git en `obsidian/` (frontend)** — La carpeta NO está en git todavía. Cuando quieras subirlo a GitHub: `cd obsidian; git init -b main; git add .; git commit -m "feat: initial frontend (Vite + React)"`.
2. **GitHub remoto** — Crea dos repos vacíos en GitHub (`obsidian` y `obsidian-api`) y luego para cada uno:
   ```powershell
   git remote add origin https://github.com/<tu-user>/<repo>.git
   git push -u origin main
   ```
3. **Bug menor detectado** — `CATEGORY_META.knitwear.count` dice `3` en `src/data/products.ts` pero los productos con `knitwear` en su `cats` son solo **2** (p4 y p11). El backend devuelve el dato correcto (2). En Etapa 2 esto se autocorrige al consumir `/api/categories`.

## 🛣️ Etapa 2 — Próximo paso

**Objetivo**: el frontend deja de usar `src/data/products.ts` y consume el backend en su lugar. UI exactamente igual.

Tareas:
1. Crear `src/hooks/useProducts.ts` y `src/hooks/useProduct.ts` (fetch + cache simple, sin react-query todavía a menos que decidamos meterlo).
2. Sustituir `import { PRODUCTS } from "@/data/products"` por llamadas a `fetchProducts()` + `toProduct()`.
3. Reemplazar el `CATEGORY_META` por `fetchCategories()`.
4. Mantener `IMAGES`, `BRAND`, `TEMPLATES` como están (son assets del frontend, no del catálogo).
5. Manejar estados loading/error con un esqueleto de skeleton ya existente o uno nuevo.
6. Smoke test: cada PLP (`/shop/new`, `/shop/men`, etc.) renderiza los productos correctos.

**Decisión pendiente para Etapa 2**: ¿metemos `@tanstack/react-query` para caching/loading? Mi recomendación es **sí** — añade 4KB pero quita 90% del boilerplate y queda muy bien en el portfolio. Si prefieres "vanilla fetch", también funciona pero hay que gestionar loading/error a mano en cada hook.
