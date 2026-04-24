import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme/tokens';

type StatusBadgeProps = {
  status: string;
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  // Delivery statuses
  POSTED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Posted' },
  ACCEPTED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: 'Accepted' },
  PICKED_UP: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Picked Up' },
  ON_THE_WAY: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', label: 'On Way' },
  DELIVERED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: 'Delivered' },
  COMPLETED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: 'Completed' },
  REJECTED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Rejected' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Cancelled' },
  // Order statuses
  PENDING: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: 'Pending' },
  ASSIGNED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Assigned' },
  // Rider subscription
  subscribed: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: 'Subscribed' },
  unsubscribed: { bg: 'rgba(142, 142, 147, 0.1)', text: '#8E8E93', label: 'Unsubscribed' },
  blocked: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Blocked' },
  // Active/inactive
  active: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: 'Active' },
  inactive: { bg: 'rgba(142, 142, 147, 0.1)', text: '#8E8E93', label: 'Inactive' },
  // Open/Closed
  open: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: 'Open' },
  closed: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'Closed' },
};

const DEFAULT_CONFIG = { bg: 'rgba(142, 142, 147, 0.1)', text: '#8E8E93', label: '' };

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  const label = config.label || status.replace(/_/g, ' ');

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
});

export default StatusBadge;
