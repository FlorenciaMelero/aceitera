# Supabase — Fase 7

Cuando conectes el backend real:

## 1. Crear proyecto Supabase

1. [supabase.com](https://supabase.com) → nuevo proyecto
2. Copiar `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a `.env.local`

## 2. Ejecutar schema

Pegar y ejecutar `schema.sql` en el SQL Editor de Supabase.

## 3. Auth

- Habilitar Email auth en Supabase
- Crear usuario admin y vincular fila en `profiles` con `rol = 'admin'`
- Reemplazar `lib/auth.ts` mock por `@supabase/ssr`

## 4. Repositories

Implementar en `lib/repositories/supabase/` los mismos contratos que `lib/repositories/mock/`:

- `products.ts`, `clientes.ts`, `ordenes.ts`, `caja.ts`, `dashboard.ts`

Luego en `lib/data-provider.ts`:

```typescript
export * from './repositories/supabase/products';
// ... etc
```

## 5. Storage

- Bucket `ot-fotos` para galería de órdenes
- Bucket `productos-imagenes` para catálogo

## 6. Deploy Vercel

```bash
vercel --prod
```

Variables de entorno en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (solo si mantienes auth mock temporalmente)

## Estado actual

`supabaseRepositoriesReady = false` en `stubs.ts` — la app usa mock JSON en `data/store.json`.
