import { z } from 'zod';

export const productoSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  categoria: z.enum(['aceites', 'filtros', 'liquidos', 'aditivos', 'repuestos', 'otros']),
  marca: z.string().optional(),
  unidad: z.enum(['litros', 'latas', 'baldes', 'galones', 'unidades', 'kg']),
  precioCosto: z.number().min(0),
  precioVenta: z.number().min(0),
  stock: z.number().min(0),
  stockMinimo: z.number().min(0),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});

export const clienteSchema = z.object({
  nombre: z.string().min(1),
  dni: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  direccion: z.string().optional(),
  notas: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
