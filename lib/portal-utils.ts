import type { PortalServiceStatus } from '@/types';

const ALERTA_KM = 500;

export function getServiceStatus(
  kmActual?: number,
  kmProximoService?: number
): { status: PortalServiceStatus; kmRestantes?: number } {
  if (kmActual == null || kmProximoService == null) {
    return { status: 'ok' };
  }
  const kmRestantes = kmProximoService - kmActual;
  if (kmRestantes <= 0) return { status: 'vencido', kmRestantes };
  if (kmRestantes <= ALERTA_KM) return { status: 'proximo', kmRestantes };
  return { status: 'ok', kmRestantes };
}

export const SERVICE_STATUS_LABELS: Record<PortalServiceStatus, string> = {
  ok: 'Al día',
  proximo: 'Service próximo',
  vencido: 'Service vencido',
};

export const ESTADO_OT_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En taller',
  terminado: 'Terminado',
  entregado: 'Entregado',
};
