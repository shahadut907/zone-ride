import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, NotificationItem as NotificationItemType } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import NotificationItem from '../../components/common/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize, fontWeight } from '../../theme/tokens';
import { LABELS } from '../../constants/labels';
import notificationsData from '../../data/notifications.json';

type Props = StackScreenProps<RootStackParamList, 'Notifications'>;

const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.notifications.length === 0) {
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: notificationsData as NotificationItemType[],
      });
    }
  }, [state.notifications.length, dispatch]);

  // Filter notifications by current role
  const filteredNotifications = React.useMemo(() => {
    const role = state.currentRole;
    if (!role) return state.notifications;
    return state.notifications.filter(
      (n) => n.role === role || n.role === 'all'
    );
  }, [state.notifications, state.currentRole]);

  const handleMarkAll = useCallback(() => {
    filteredNotifications.forEach((n) => {
      if (!n.isRead) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: n.id });
      }
    });
  }, [filteredNotifications, dispatch]);

  const handlePress = useCallback(
    (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    },
    [dispatch],
  );

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  const renderItem: ListRenderItem<NotificationItemType> = useCallback(
    ({ item }) => <NotificationItem item={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: NotificationItemType) => item.id, []);

  const ListHeader = (
    <View style={styles.listHeader}>
      {unreadCount > 0 ? (
        <TouchableOpacity onPress={handleMarkAll} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>{LABELS.markAllRead}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={LABELS.notificationsTitle}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title={LABELS.noNotifications}
            subtitle="You are all caught up"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
  listHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  markAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});

export default NotificationsScreen;
