-- MP Lubricentro — datos de prueba para portal QR
-- Ejecutar DESPUÉS de schema.sql en Supabase SQL Editor

INSERT INTO configuracion (id, nombre_negocio, direccion, telefono, iva, stock_minimo_global)
VALUES (
  'config-1',
  'MP Lubricentro',
  'Eduardo Sosa 2188, Barrio Santa Isabel 1ª Sección, Córdoba',
  '351 207 9348',
  21,
  5
)
ON CONFLICT (id) DO UPDATE SET
  nombre_negocio = EXCLUDED.nombre_negocio,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono;

-- Cliente demo con token fijo para probar el QR
INSERT INTO clientes (id, nombre, dni, telefono, email, direccion, portal_token)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  'Juan Pérez',
  '30123456',
  '3511234567',
  'juan@email.com',
  'Córdoba',
  'demo-juan-perez-portal-token-prueba1234567890abcd'
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  portal_token = EXCLUDED.portal_token;

INSERT INTO clientes (id, nombre, dni, telefono, saldo_cuenta_corriente)
VALUES (
  '11111111-1111-1111-1111-111111111102',
  'María López',
  '28987654',
  '3517654321',
  15000
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehiculos (id, cliente_id, patente, marca, modelo, anio, tipo_motor, aceite_recomendado, km_actual, km_proximo_service)
VALUES (
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'ABC123',
  'Toyota',
  'Corolla',
  2018,
  '1.8 Nafta',
  '10W40',
  56000,
  61000
)
ON CONFLICT (id) DO UPDATE SET
  km_actual = EXCLUDED.km_actual,
  km_proximo_service = EXCLUDED.km_proximo_service;

INSERT INTO vehiculos (id, cliente_id, patente, marca, modelo, anio, km_actual, km_proximo_service)
VALUES (
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111102',
  'DEF456',
  'Volkswagen',
  'Amarok',
  2021,
  82000,
  87000
)
ON CONFLICT (id) DO NOTHING;

-- Historial de service para Juan
INSERT INTO ordenes_trabajo (id, cliente_id, vehiculo_id, estado, km_ingreso, observaciones, total, fecha)
VALUES (
  '33333333-3333-3333-3333-333333333301',
  '11111111-1111-1111-1111-111111111101',
  '22222222-2222-2222-2222-222222222201',
  'entregado',
  51000,
  'Cambio de aceite y filtro',
  25000,
  NOW() - INTERVAL '90 days'
)
ON CONFLICT (id) DO NOTHING;
