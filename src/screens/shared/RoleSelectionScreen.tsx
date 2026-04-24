import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Role } from '../../types';
import { useApp } from '../../context/AppContext';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';

type Props = StackScreenProps<RootStackParamList, 'RoleSelection'>;

type RoleCardData = {
  role: Role;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
};

const ROLE_CARDS: RoleCardData[] = [
  {
    role: 'customer',
    label: LABELS.customer,
    description: LABELS.customerDescription,
    icon: 'person-outline',
    gradient: ['rgba(52, 120, 246, 0.18)', 'rgba(52, 120, 246, 0.06)'],
  },
  {
    role: 'rider',
    label: LABELS.rider,
    description: LABELS.riderDescription,
    icon: 'bicycle-outline',
    gradient: ['rgba(48, 209, 88, 0.18)', 'rgba(48, 209, 88, 0.06)'],
  },
  {
    role: 'shop',
    label: LABELS.shop,
    description: LABELS.shopDescription,
    icon: 'storefront-outline',
    gradient: ['rgba(255, 159, 10, 0.18)', 'rgba(255, 159, 10, 0.06)'],
  },
];

const ROLE_ACCENT: Record<Role, string> = {
  customer: colors.primary,
  rider: colors.success,
  shop: colors.accent,
};

const RoleCard: React.FC<{
  data: RoleCardData;
  onPress: () => void;
}> = ({ data, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const accent = ROLE_ACCENT[data.role];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, shadows.md, { transform: [{ scale }] }]}>
        <GlassBackground intensity={45} />
        <LinearGradient
          colors={data.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardBorder} />

        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${accent}18`, borderColor: `${accent}30` },
          ]}
        >
          <Ionicons name={data.icon} size={32} color={accent} />
        </View>

        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{data.label}</Text>
          <Text style={styles.cardDescription}>{data.description}</Text>
        </View>

        <View style={[styles.arrow, { backgroundColor: `${accent}15` }]}>
          <Ionicons name="arrow-forward" size={18} color={accent} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { dispatch } = useApp();

  const handleSelect = (role: Role) => {
    dispatch({ type: 'SET_ROLE', payload: role });

    if (role === 'customer') {
      navigation.replace('CustomerLogin');
    } else if (role === 'rider') {
      navigation.replace('RiderTabs');
    } else {
      navigation.replace('ShopTabs');
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header block */}
        <View style={styles.header}>
          <View style={styles.logoSmall}>
            <GlassBackground intensity={50} />
            <View style={styles.logoSmallBorder} />
            <Ionicons name="bicycle" size={28} color={colors.primary} />
          </View>
          <Text style={styles.appName}>{LABELS.appName}</Text>
          <Text style={styles.title}>{LABELS.roleSelectionTitle}</Text>
          <Text style={styles.subtitle}>{LABELS.roleSelectionSubtitle}</Text>
        </View>

        {/* Role cards */}
        <View style={styles.cards}>
          {ROLE_CARDS.map((card) => (
            <RoleCard
              key={card.role}
              data={card}
              onPress={() => handleSelect(card.role)}
            />
          ))}
        </View>

        <Text style={styles.footer}>ZoneRide – Local Delivery, Your Way</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.xxxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl + spacing.md,
  },
  logoSmall: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoSmallBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  appName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xl,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xxxl,
  },
});

export default RoleSelectionScreen;
