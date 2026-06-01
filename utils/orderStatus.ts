export type CustomerStatus = 'received' | 'delivered';

const DELIVERED_STATES = new Set(['delivered', 'completed', 'done', 'مُسلَّم', 'مكتمل']);

export function toCustomerStatus(backendStatus: string): CustomerStatus {
  const normalized = (backendStatus ?? '').toLowerCase().trim();
  return DELIVERED_STATES.has(normalized) ? 'delivered' : 'received';
}

export function customerStatusLabel(status: CustomerStatus): string {
  return status === 'delivered' ? 'تم التوصيل' : 'تم استلام طلبك';
}

export function customerStatusColor(status: CustomerStatus): string {
  return status === 'delivered' ? 'text-green-600' : 'text-blue-600';
}

export function customerStatusBg(status: CustomerStatus): string {
  return status === 'delivered' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';
}
