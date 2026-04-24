import { DeliveryStatus, OrderStatus } from '../types';

const DELIVERY_STATUS_ORDER: DeliveryStatus[] = [
  'POSTED',
  'ACCEPTED',
  'PICKED',
  'ON_THE_WAY',
  'DELIVERED',
  'COMPLETED',
];

export const getDeliveryStatusIndex = (status: DeliveryStatus): number => {
  if (status === 'REJECTED') return -1;
  return DELIVERY_STATUS_ORDER.indexOf(status);
};

export const isDeliveryTerminal = (status: DeliveryStatus): boolean => {
  return status === 'COMPLETED' || status === 'REJECTED';
};

export const getNextDeliveryStatus = (
  current: DeliveryStatus
): DeliveryStatus | null => {
  if (isDeliveryTerminal(current)) return null;
  const idx = DELIVERY_STATUS_ORDER.indexOf(current);
  if (idx < 0 || idx >= DELIVERY_STATUS_ORDER.length - 1) return null;
  return DELIVERY_STATUS_ORDER[idx + 1];
};

export const formatDeliveryStatus = (status: DeliveryStatus): string => {
  const map: Record<DeliveryStatus, string> = {
    POSTED: 'Posted',
    ACCEPTED: 'Accepted',
    PICKED: 'Picked Up',
    ON_THE_WAY: 'On The Way',
    DELIVERED: 'Delivered',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
  };
  return map[status];
};

export const formatOrderStatus = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    ASSIGNED: 'Assigned',
    DELIVERED: 'Delivered',
  };
  return map[status];
};

export const formatTimestamp = (isoString: string): string => {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
