-- MP Lubricentro — Supabase schema (Phase 7)
-- Run in Supabase SQL editor, then enable RLS policies per table.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'tecnico', 'user')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  marca TEXT,
  unidad TEXT NOT NULL,
  precio_costo NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
  descripcion TEXT,
  proveedor_id UUID,
  codigo_barras TEXT,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  cantidad NUMERIC(12,2) NOT NULL,
  vencimiento DATE,
  fecha_ingreso TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dni TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  notas TEXT,
  saldo_cuenta_corriente NUMERIC(12,2) DEFAULT 0,
  portal_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clientes_portal_token ON clientes(portal_token) WHERE portal_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS vehiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  patente TEXT NOT NULL,
  marca TEXT,
  modelo TEXT,
  anio INT,
  tipo_motor TEXT,
  aceite_recomendado TEXT,
  km_actual INT,
  km_proximo_service INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base NUMERIC(12,2) NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS plantillas_pm (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  servicio_id UUID REFERENCES servicios(id)
);

CREATE TABLE IF NOT EXISTS plantillas_pm_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plantilla_id UUID NOT NULL REFERENCES plantillas_pm(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero SERIAL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  vehiculo_id UUID NOT NULL REFERENCES vehiculos(id),
  tecnico_id UUID REFERENCES profiles(id),
  fecha TIMESTAMPTZ DEFAULT now(),
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_proceso', 'terminado', 'entregado')),
  km_ingreso INT,
  observaciones TEXT,
  diagnostico TEXT,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  fotos JSONB DEFAULT '[]',
  notas_internas TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ot_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ot_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad NUMERIC(12,2) NOT NULL,
  precio_unitario NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ot_servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ot_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id),
  precio NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS movimientos_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad NUMERIC(12,2) NOT NULL,
  motivo TEXT,
  ot_id UUID REFERENCES ordenes_trabajo(id),
  fecha TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  razon_social TEXT NOT NULL,
  cuit TEXT,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  condicion_pago TEXT
);

CREATE TABLE IF NOT EXISTS caja (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha TIMESTAMPTZ DEFAULT now(),
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  monto NUMERIC(12,2) NOT NULL,
  metodo_pago TEXT,
  descripcion TEXT NOT NULL,
  ot_id UUID REFERENCES ordenes_trabajo(id),
  cliente_id UUID REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  producto_ids UUID[] NOT NULL DEFAULT '{}',
  precio NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id TEXT NOT NULL,
  usuario_id UUID REFERENCES profiles(id),
  detalle TEXT,
  fecha TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS configuracion (
  id TEXT PRIMARY KEY DEFAULT 'config-1',
  nombre_negocio TEXT NOT NULL,
  logo_url TEXT,
  direccion TEXT,
  telefono TEXT,
  cuit TEXT,
  iva NUMERIC(5,2) DEFAULT 21,
  stock_minimo_global INT DEFAULT 5
);

-- RLS: enable on all tables (policies to be added per role)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_pm ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_pm_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Example policy (admin only) — customize per deployment:
-- CREATE POLICY "admin_all" ON productos FOR ALL USING (
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
-- );

-- Storage buckets (run in Supabase dashboard or via API):
-- ot-fotos (public read, authenticated write)
-- productos-imagenes
