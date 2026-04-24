import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Dimensions,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CustomerStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';

type Props = StackScreenProps<CustomerStackParamList, 'ShopMenuView'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 2 - spacing.md) / 2;

const PLACEHOLDER_COLORS = [
  'rgba(52, 120, 246, 0.12)',
  'rgba(48, 209, 88, 0.12)',
  'rgba(255, 159, 10, 0.12)',
  'rgba(100, 210, 255, 0.12)',
  'rgba(175, 82, 222, 0.12)',
];

type ProductItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  icon: keyof typeof Ionicons.glyphMap;
};

const MOCK_PRODUCTS: ProductItem[] = [
  { id: 1, name: 'Fresh Apples (1kg)', category: 'Grocery', price: 250, icon: 'nutrition-outline' },
  { id: 2, name: 'Miniket Rice (5kg)', category: 'Grocery', price: 380, icon: 'leaf-outline' },
  { id: 3, name: 'Napa Extend 500mg', category: 'Pharmacy', price: 20, icon: 'medkit-outline' },
  { id: 4, name: 'Chicken Biryani', category: 'Food', price: 220, icon: 'restaurant-outline' },
  { id: 5, name: 'Fresh Eggs (1 Dozen)', category: 'Grocery', price: 140, icon: 'egg-outline' },
  { id: 6, name: 'Rupchanda Oil (1L)', category: 'Grocery', price: 180, icon: 'water-outline' },
  { id: 7, name: 'Savlon Antiseptic (100ml)', category: 'Pharmacy', price: 60, icon: 'bandage-outline' },
  { id: 8, name: 'Special Beef Burger', category: 'Food', price: 180, icon: 'fast-food-outline' },
];

const ProductCard: React.FC<{ item: ProductItem; onBuy: (item: ProductItem) => void }> = ({ item, onBuy }) => {
  const bgColor = PLACEHOLDER_COLORS[item.id % PLACEHOLDER_COLORS.length];

  return (
    <View style={[styles.imageCard, shadows.sm, { backgroundColor: bgColor }]}>
      <GlassBackground intensity={20} />
      <View style={styles.imageCardBorder} />
      <View style={styles.imageCardInner}>
        <View style={styles.imageIconWrapper}>
          <Ionicons name={item.icon} size={28} color={colors.textPrimary} />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.imageFilename} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.imagePill}>{item.category}</Text>
          <Text style={styles.productPrice}>৳{item.price}</Text>
        </View>
        <TouchableOpacity style={styles.buyButton} onPress={() => onBuy(item)}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ShopMenuViewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { shopId, shopName } = route.params;
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const shop = state.shops.find((s) => s.id === shopId);
  const menuItems = MOCK_PRODUCTS;

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = (item: ProductItem) => {
    dispatch({ type: 'SHOW_TOAST', payload: `Added ${item.name} to cart` });
  };

  const renderItem: ListRenderItem<ProductItem> = ({ item }) => (
    <ProductCard item={item} onBuy={handleBuy} />
  );

  const keyExtractor = (item: ProductItem) => item.id.toString();

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={shopName}
        onBack={() => navigation.goBack()}
      />

      {shop ? (
        <View style={styles.shopMeta}>
          <View style={styles.shopMetaCard}>
            <GlassBackground intensity={35} />
            <View style={styles.shopMetaBorder} />
            <View style={styles.shopMetaRow}>
              <Ionicons
                name={'images-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.primary}
              />
              <Text style={styles.shopMetaText}>
                {filteredItems.length} menu {filteredItems.length === 1 ? 'item' : 'items'} available
              </Text>
              <View style={styles.shopMetaDot} />
              <Ionicons
                name={'time-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.shopMetaText}>{shop.workingHours}</Text>
            </View>
          </View>
          
          <View style={styles.searchContainer}>
            <GlassBackground intensity={35} />
            <View style={styles.searchBorder} />
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="image-outline"
            title={LABELS.noMenuItems}
            subtitle="This shop has not added menu images yet"
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
  shopMeta: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  shopMetaCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  shopMetaBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shopMetaText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  shopMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    height: 48,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  searchBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  imageCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imageCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  imageCardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  imageIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glassBg,
    borderWidth: 0,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  imageFilename: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: fontWeight.bold,
  },
  imagePill: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  productPrice: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.extraBold,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  buyButtonText: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.sm,
  },
});

export default ShopMenuViewScreen;
