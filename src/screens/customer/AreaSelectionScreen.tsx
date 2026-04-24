import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { mockPost } from '../../services/mockApi';
import AppButton from '../../components/common/AppButton';
import { getAreaPricing } from '../../utils/areaPricing';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import { AREAS } from '../../constants/areas';

type Props = StackScreenProps<RootStackParamList, 'AreaSelection'>;

type AreaItem = {
  name: string;
  pricingLabel: string;
  pricingDetail: string;
};

const buildAreaItems = (): AreaItem[] =>
  AREAS.map((name) => {
    const pricing = getAreaPricing(name);
    const pricingLabel =
      pricing.commissionPercent > 0
        ? `${pricing.commissionPercent}% platform commission`
        : pricing.fixedDeliveryCharge === 0
        ? 'Free delivery'
        : `Fixed ${pricing.fixedDeliveryCharge} BDT delivery`;
    const pricingDetail =
      pricing.commissionPercent > 0
        ? 'Commission applies to rider earnings'
        : pricing.fixedDeliveryCharge === 0
        ? 'No delivery charge in this zone'
        : 'Fixed delivery fee applies';
    return { name, pricingLabel, pricingDetail };
  });

const AREA_ITEMS = buildAreaItems();

const AreaCard: React.FC<{
  item: AreaItem;
  selected: boolean;
  onPress: (name: string) => void;
}> = ({ item, selected, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(item.name)}
    activeOpacity={0.85}
    style={[styles.card, shadows.sm, selected && styles.cardSelected]}
  >
    <GlassBackground intensity={38} />
    <View style={[styles.cardBorder, selected && styles.cardBorderSelected]} />
    <View style={styles.cardRow}>
      <View style={[styles.areaIcon, selected && styles.areaIconSelected]}>
        <Ionicons
          name={'location-outline' as keyof typeof Ionicons.glyphMap}
          size={20}
          color={selected ? colors.white : colors.primary}
        />
      </View>
      <View style={styles.cardText}>
        <Text style={[styles.areaName, selected && styles.areaNameSelected]}>
          {item.name}
        </Text>
        <Text style={styles.pricingLabel}>{item.pricingLabel}</Text>
        <Text style={styles.pricingDetail}>{item.pricingDetail}</Text>
      </View>
      {selected ? (
        <View style={styles.checkCircle}>
          <Ionicons
            name={'checkmark' as keyof typeof Ionicons.glyphMap}
            size={16}
            color={colors.white}
          />
        </View>
      ) : (
        <View style={styles.uncheckedCircle} />
      )}
    </View>
  </TouchableOpacity>
);

const AreaSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { dispatch } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = useCallback((name: string) => {
    setSelected(name);
  }, []);

  const handleContinue = async () => {
    if (!selected) return;
    setIsLoading(true);
    await mockPost({ area: selected });
    dispatch({ type: 'SET_AREA', payload: selected });
    setIsLoading(false);
    navigation.replace('CustomerTabs');
  };

  const renderItem: ListRenderItem<AreaItem> = useCallback(
    ({ item }) => (
      <AreaCard item={item} selected={selected === item.name} onPress={handleSelect} />
    ),
    [selected, handleSelect],
  );

  const keyExtractor = useCallback((item: AreaItem) => item.name, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header block */}
      <View style={styles.header}>
        <Text style={styles.title}>{LABELS.areaSelectionTitle}</Text>
        <Text style={styles.subtitle}>{LABELS.areaSelectionSubtitle}</Text>
      </View>

      {/* Area list */}
      <FlatList
        data={AREA_ITEMS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Continue button - fixed at bottom */}
      <View style={[styles.footer, shadows.lg]}>
        <GlassBackground intensity={50} />
        <View style={styles.footerBorder} />
        <AppButton
          label={LABELS.continueButton}
          onPress={handleContinue}
          disabled={!selected}
          isLoading={isLoading}
          fullWidth
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardSelected: {},
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  cardBorderSelected: {
    borderColor: 'transparent',
    borderWidth: 0,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  areaIconSelected: {
    backgroundColor: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  areaName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  areaNameSelected: {
    color: colors.primary,
  },
  pricingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  pricingDetail: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  footerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderColor: 'transparent',
  },
});

export default AreaSelectionScreen;
