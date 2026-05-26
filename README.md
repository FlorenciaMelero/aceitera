# MP Lubricentro — Sistema de Gestión

Aplicación Next.js 14 fullstack para gestión integral de lubricentro automotor.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Excel**: SheetJS (xlsx)
- **Datos (Fase 1)**: Mock store JSON en `data/store.json`
- **Auth (Fase 1)**: JWT en cookie httpOnly
- **Supabase (Fase 7)**: Stubs listos en `lib/repositories/supabase/`

## Instalación

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública MP Lubricentro |
| `/admin/login` | Login admin (modal 10s auto-cierre) |
| `/admin/dashboard` | Dashboard con KPIs y gráficos |
| `/admin/productos` | CRUD productos + import/export Excel |
| `/admin/stock` | Inventario, alertas, movimientos |
| `/admin/clientes` | CRUD clientes |
| `/admin/vehiculos` | CRUD vehículos |
| `/admin/ordenes` | Órdenes de trabajo + descuento stock |
| `/admin/servicios` | Plantillas PM |
| `/admin/proveedores` | Proveedores + sugerencias compra |
| `/admin/caja` | Caja, balance, cuentas corrientes |
| `/admin/reportes` | Reportes y audit log |
| `/admin/configuracion` | Config negocio, usuarios, categorías |

## Credenciales demo

- **Admin**: `admin@lubricentro.local` / `Admin123!`
- **Técnico**: `tecnico@lubricentro.local` / `Tecnico123!`

## Funcionalidades

- Sesión admin con cierre por inactividad (30 s)
- Inventario con alertas de stock bajo/excesivo
- Importación Excel con validación por fila
- OT con plantillas PM y descuento automático de stock
- Caja, proveedores, cuentas corrientes
- Dashboard con 8 gráficos
- Buscador global en header admin
- Combos/paquetes y plantillas PM
- Galería fotos OT (URLs mock)
- Alertas vencimiento por lote
- Import one-time desde IndexedDB legacy
- Arquitectura repository preparada para Supabase

## Cliente

MP Lubricentro — Eduardo Sosa 2188, Barrio Santa Isabel 1ª Sección, Córdoba, Argentina.
