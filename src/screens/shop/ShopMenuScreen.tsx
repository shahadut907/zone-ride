import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { MenuItem, MenuCategory, ShopMenuStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import menuData from '../../data/menu.json';

type Props = StackScreenProps<ShopMenuStackParamList, 'ShopMenu'>;

const DEMO_SHOP_ID = 'shop-1';

const MENU_IMAGES: Record<string, any> = {
  // Commenting these out until the assets exist to prevent Metro crashes
  // 'menu-1': require('../../../assets/menu/kacchi_biryani.png'),
  // 'menu-2': require('../../../assets/menu/chicken_biryani.png'),
  // 'menu-3': require('../../../assets/menu/rice_chicken_curry.png'),
  // 'menu-4': require('../../../assets/menu/beef_tehari.png'),
  // 'menu-5': require('../../../assets/menu/chicken_fry.png'),
  // 'menu-6': require('../../../assets/menu/samosa.png'),
  // 'menu-7': require('../../../assets/menu/chicken_nuggets.png'),
  // 'menu-8': require('../../../assets/menu/french_fries.png'),
  // 'menu-9': require('../../../assets/menu/mango_lassi.png'),
  // 'menu-11': require('../../../assets/menu/borhani.png'),
  // 'menu-12': require('../../../assets/menu/firni.png'),
  // 'menu-13': require('../../../assets/menu/gulab_jamun.png'),
  // 'menu-14': require('../../../assets/menu/family_biryani.png'),
  // 'menu-15': require('../../../assets/menu/lunch_box.png'),
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Specials': 'star-outline',
  'Rice & Biryani': 'restaurant-outline',
  'Traditional': 'flower-outline',
  'Burgers & Fast Food': 'fast-food-outline',
  'Pizza': 'pie-chart-outline',
  'Snacks': 'cafe-outline',
  'Bakery': 'basket-outline',
  'Drinks': 'water-outline',
  'Desserts': 'ice-cream-outline',
  'Combo Deals': 'gift-outline',
  'Sides': 'clipboard-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Specials': '#FF5722',
  'Rice & Biryani': '#FF6B35',
  'Traditional': '#D84315',
  'Burgers & Fast Food': '#FF5252',
  'Pizza': '#FF9800',
  'Snacks': '#FFB800',
  'Bakery': '#8D6E63',
  'Drinks': '#00BCD4',
  'Desserts': '#E91E8B',
  'Combo Deals': '#4CAF50',
  'Sides': '#9C27B0',
};

const CATEGORY_ORDER: MenuCategory[] = [
  'Specials',
  'Rice & Biryani',
  'Traditional',
  'Burgers & Fast Food',
  'Pizza',
  'Snacks',
  'Bakery',
  'Drinks',
  'Desserts',
  'Combo Deals',
  'Sides',
];

type SectionData = {
  title: MenuCategory;
  data: MenuItem[];
};

const MenuItemCard: React.FC<{
  item: MenuItem;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}> = ({ item, onToggle, onEdit, onDelete }) => {
  const catColor = CATEGORY_COLORS[item.category] ?? colors.primary;

  return (
    <View style={[styles.itemCard, shadows.sm, !item.isAvailable && styles.itemCardUnavailable]}>
      <GlassBackground intensity={35} />
      <View style={styles.itemRow}>
        <View style={styles.itemImageContainer}>
          {MENU_IMAGES[item.id] ? (
            <Image source={MENU_IMAGES[item.id]} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImagePlaceholder, { backgroundColor: catColor + '15' }]}>
              <Ionicons name="fast-food-outline" size={24} color={catColor} />
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemNameRow}>
            <Text style={[styles.itemName, !item.isAvailable && styles.itemNameUnavailable]} numberOfLines={1}>
              {item.name}
            </Text>
            {!item.isAvailable && (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableBadgeText}>Sold Out</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.itemBottom}>
            <Text style={styles.itemPrice}>৳{item.price}</Text>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconBtn} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.toggleCol}>
          <Switch
            value={item.isAvailable}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: '#E0E0E0', true: colors.success }}
            thumbColor={colors.white}
            style={styles.miniSwitch}
          />
        </View>
      </View>
    </View>
  );
};

const ShopMenuScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const [activeFilter, setActiveFilter] = useState<MenuCategory | 'All'>('All');

  // Load menu items on mount
  useEffect(() => {
    if (state.menuItems.length === 0) {
      dispatch({ type: 'SET_MENU_ITEMS', payload: menuData as MenuItem[] });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shopItems = useMemo(
    () => state.menuItems.filter((i) => i.shopId === DEMO_SHOP_ID),
    [state.menuItems]
  );

  const sections: SectionData[] = useMemo(() => {
    const filtered = activeFilter === 'All'
      ? shopItems
      : shopItems.filter((i) => i.category === activeFilter);

    const grouped = new Map<MenuCategory, MenuItem[]>();
    for (const item of filtered) {
      const existing = grouped.get(item.category) ?? [];
      existing.push(item);
      grouped.set(item.category, existing);
    }

    return CATEGORY_ORDER
      .filter((cat) => grouped.has(cat))
      .map((cat) => ({
        title: cat,
        data: grouped.get(cat) ?? [],
      }));
  }, [shopItems, activeFilter]);

  const stats = useMemo(() => {
    const total = shopItems.length;
    const available = shopItems.filter((i) => i.isAvailable).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [shopItems]);

  const categories = useMemo(() => {
    const cats = new Set(shopItems.map((i) => i.category));
    return ['All' as const, ...CATEGORY_ORDER.filter((c) => cats.has(c))];
  }, [shopItems]);

  const handleToggle = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_MENU_ITEM_AVAILABLE', payload: id });
  }, [dispatch]);

  const handleEdit = useCallback((item: MenuItem) => {
    navigation.navigate('AddMenuItem', { editItem: item });
  }, [navigation]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from the menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
            dispatch({ type: 'SHOW_TOAST', payload: 'Item deleted' });
            setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2000);
          },
        },
      ]
    );
  }, [dispatch]);

  const handleAddNew = useCallback(() => {
    navigation.navigate('AddMenuItem', {});
  }, [navigation]);

  const showToast = useCallback((msg: string) => {
    dispatch({ type: 'SHOW_TOAST', payload: msg });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2000);
  }, [dispatch]);

  const renderSectionHeader = useCallback(({ section }: { section: SectionData }) => {
    const catColor = CATEGORY_COLORS[section.title] ?? colors.primary;
    const catIcon = CATEGORY_ICONS[section.title] ?? 'restaurant-outline';
    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: `${catColor}18` }]}>
          <Ionicons name={catIcon as keyof typeof Ionicons.glyphMap} size={16} color={catColor} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>{section.data.length} items</Text>
      </View>
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: MenuItem }) => (
    <MenuItemCard
      item={item}
      onToggle={handleToggle}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ), [handleToggle, handleEdit, handleDelete]);

  const keyExtractor = useCallback((item: MenuItem) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader title="Menu Management" />

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={[styles.statPill, shadows.sm]}>
          <GlassBackground intensity={30} />
          <Text style={styles.statNum}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statPill, shadows.sm]}>
          <GlassBackground intensity={30} />
          <Text style={[styles.statNum, { color: colors.success }]}>{stats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statPill, shadows.sm]}>
          <GlassBackground intensity={30} />
          <Text style={[styles.statNum, { color: colors.danger }]}>{stats.unavailable}</Text>
          <Text style={styles.statLabel}>Sold Out</Text>
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterRow}>
        {categories.map((cat) => {
          const isActive = activeFilter === cat;
          const chipColor = cat === 'All' ? colors.primary : (CATEGORY_COLORS[cat] ?? colors.primary);
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveFilter(cat)}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: chipColor },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Menu Items */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No items in this category</Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.fab, shadows.lg]}
        onPress={handleAddNew}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.primary, '#3A5FE5']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  statNum: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 0,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 160,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  itemCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 2,
  },
  itemCardUnavailable: {
    opacity: 0.6,
  },
  itemRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  itemImageContainer: {
    width: 68,
    height: 68,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
  },
  itemNameUnavailable: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  unavailableBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unavailableBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShopMenuScreen;
