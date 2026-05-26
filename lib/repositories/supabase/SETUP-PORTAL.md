# Supabase — Portal QR (listo para usar)

Seguí estos pasos **en orden**. Toma ~10 minutos.

---

## Paso 1 — Crear proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) e iniciá sesión
2. **New project**
3. Elegí nombre (ej. `mp-lubricentro`), contraseña de DB, región (South America si está)
4. Esperá a que termine de crearse (~2 min)

---

## Paso 2 — Copiar las claves

En el proyecto: **Project Settings** (engranaje) → **API**

Copiá estos 3 valores:

| Campo en Supabase | Variable en `.env.local` |
|-------------------|--------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

> La **service_role** es secreta — nunca la subas a GitHub ni la uses en el navegador.

---

## Paso 3 — Pegar en `.env.local`

Abrí `c:\Projects\aceitera\.env.local` y dejalo así (con tus valores reales):

```env
JWT_SECRET=mp-lubricentro-dev-secret-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Paso 4 — Crear las tablas (SQL)

1. En Supabase: **SQL Editor** → **New query**
2. Copiá **todo** el contenido de `lib/repositories/supabase/schema.sql`
3. Clic **Run**

Debería decir "Success".

---

## Paso 5 — Cargar datos de prueba (SQL)

1. Otra query en SQL Editor
2. Copiá **todo** `lib/repositories/supabase/seed-portal.sql`
3. **Run**

Esto crea:
- Configuración del negocio
- Cliente **Juan Pérez** con token de portal
- Vehículo Toyota Corolla ABC123
- Un service en el historial

---

## Paso 6 — Reiniciar la app

```bash
# Parar el servidor (Ctrl+C) y:
npm run dev
```

La app detecta Supabase automáticamente y usa la DB real para **clientes + portal QR**.

---

## Paso 7 — Probar el QR

### Portal directo (cliente)
```
http://localhost:3000/portal/demo-juan-perez-portal-token-prueba1234567890abcd
```

### Desde el admin
1. `http://localhost:3000/admin/login` → `admin@lubricentro.local` / `Admin123!`
2. **Clientes** → botón **QR** en Juan Pérez
3. Escaneá o copiá el link

---

## Qué usa Supabase hoy vs mock

| Módulo | Con Supabase configurado |
|--------|--------------------------|
| Clientes + vehículos | ✅ Supabase |
| Portal QR | ✅ Supabase |
| Productos, órdenes, caja, dashboard | Mock JSON (Fase 7 completa) |
| Login admin | Mock JWT (sin cambios) |

---

## Problemas comunes

**"Enlace no válido"** → Corré `seed-portal.sql` o generá QR desde admin.

**Clientes vacíos en admin** → Los clientes ahora están en Supabase, no en `data/store.json`. Corré el seed.

**Error de conexión** → Revisá las 3 variables en `.env.local` y reiniciá `npm run dev`.

**QR apunta mal en celular** → Cambiá `NEXT_PUBLIC_APP_URL` por tu IP local, ej. `http://192.168.1.10:3000`

---

## Producción (Vercel)

Agregá las mismas variables en Vercel → Settings → Environment Variables y usá tu dominio en `NEXT_PUBLIC_APP_URL`.
