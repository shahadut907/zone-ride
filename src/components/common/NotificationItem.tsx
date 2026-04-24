import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import GlassBackground from './GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem as NotificationItemType } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { formatTimestamp } from '../../utils/statusHelpers';

type NotificationItemProps = {
  item: NotificationItemType;
  onPress: (id: string) => void;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
      style={styles.wrapper}
    >
      <GlassBackground intensity={35} />
      <View style={[styles.border, !item.isRead && styles.unreadBorder]} />
      <View style={styles.row}>
        <View style={[styles.dot, item.isRead && styles.dotRead]} />
        <View style={styles.content}>
          <Text style={[styles.title, item.isRead && styles.titleRead]}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.lg,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  unreadBorder: {
    borderColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  dotRead: {
    backgroundColor: colors.textMuted,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  titleRead: {
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  },
  body: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default NotificationItem;
