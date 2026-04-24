import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ChatThread, CustomerChatsStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { formatTimestamp } from '../../utils/statusHelpers';
import { LABELS } from '../../constants/labels';
import chatsData from '../../data/chats.json';

type Props = StackScreenProps<CustomerChatsStackParamList, 'ChatsList'>;

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  rider: 'bicycle-outline',
  shop: 'storefront-outline',
  customer: 'person-outline',
};

const ROLE_COLORS: Record<string, string> = {
  rider: colors.success,
  shop: colors.accent,
  customer: colors.primary,
};

const ThreadRow: React.FC<{
  thread: ChatThread;
  onPress: (thread: ChatThread) => void;
}> = ({ thread, onPress }) => {
  const iconColor = ROLE_COLORS[thread.participantRole] ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={() => onPress(thread)}
      activeOpacity={0.85}
      style={[styles.threadWrapper, shadows.sm]}
    >
      <GlassBackground intensity={40} />
      <View style={styles.threadBorder} />
      <View style={styles.threadRow}>
        <View style={[styles.avatarCircle, { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}25` }]}>
          <Ionicons
            name={ROLE_ICONS[thread.participantRole] ?? 'person-outline'}
            size={22}
            color={iconColor}
          />
        </View>
        <View style={styles.threadText}>
          <View style={styles.threadTopRow}>
            <Text style={styles.participantName} numberOfLines={1}>
              {thread.participantName}
            </Text>
            <Text style={styles.threadTime}>
              {formatTimestamp(thread.lastTimestamp)}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {thread.lastMessage}
          </Text>
        </View>
        <Ionicons
          name={'chevron-forward' as keyof typeof Ionicons.glyphMap}
          size={16}
          color={colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
};

const ChatsListScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.chats.length === 0) {
      dispatch({
        type: 'SET_CHATS',
        payload: chatsData as ChatThread[],
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePress = useCallback(
    (thread: ChatThread) => {
      navigation.navigate('ChatDetail', {
        threadId: thread.id,
        participantName: thread.participantName,
      });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<ChatThread> = useCallback(
    ({ item }) => <ThreadRow thread={item} onPress={handlePress} />,
    [handlePress]
  );

  const keyExtractor = useCallback((item: ChatThread) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader title={LABELS.chatsTitle} />
      <FlatList
        data={state.chats}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title={LABELS.noChats}
            subtitle="Start a conversation with a rider or shop"
          />
        }
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
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    flexGrow: 1,
  },
  threadWrapper: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  threadBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  threadText: {
    flex: 1,
    gap: spacing.xs,
  },
  threadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  threadTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  lastMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default ChatsListScreen;
