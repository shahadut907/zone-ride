import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { MenuItem, MenuCategory, ShopMenuStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';

type Props = StackScreenProps<ShopMenuStackParamList, 'AddMenuItem'>;

const DEMO_SHOP_ID = 'shop-1';

const CATEGORIES: MenuCategory[] = [
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

const CATEGORY_COLORS: Record<MenuCategory, string> = {
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
  'Specials': '#FF5722',
};

const AddMenuItemScreen: React.FC<Props> = ({ navigation, route }) => {
  const editItem = route.params?.editItem;
  const isEditing = !!editItem;
  const { dispatch } = useApp();

  const [name, setName] = useState(editItem?.name ?? '');
  const [description, setDescription] = useState(editItem?.description ?? '');
  const [price, setPrice] = useState(editItem?.price?.toString() ?? '');
  const [category, setCategory] = useState<MenuCategory>(editItem?.category ?? 'Snacks');

  const isValid = useMemo(() => {
    return name.trim().length > 0 && price.trim().length > 0 && parseFloat(price) > 0;
  }, [name, price]);

  const handleSave = useCallback(() => {
    if (!isValid) return;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return;

    if (isEditing && editItem) {
      dispatch({
        type: 'UPDATE_MENU_ITEM',
        payload: {
          id: editItem.id,
          updates: {
            name: name.trim(),
            description: description.trim(),
            price: priceNum,
            category,
          },
        },
      });
      dispatch({ type: 'SHOW_TOAST', payload: 'Item updated successfully!' });
    } else {
      const newItem: MenuItem = {
        id: 'menu_' + Date.now(),
        shopId: DEMO_SHOP_ID,
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        category,
        isAvailable: true,
      };
      dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
      dispatch({ type: 'SHOW_TOAST', payload: 'Item added to menu!' });
    }

    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2000);
    navigation.goBack();
  }, [isValid, name, description, price, category, isEditing, editItem, dispatch, navigation]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={isEditing ? 'Edit Item' : 'Add New Item'}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Item Details Card */}
          <View style={[styles.card, shadows.sm]}>
            <GlassBackground intensity={40} />
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Item Details</Text>

              <AppTextInput
                label="Item Name *"
                placeholder="e.g. Kacchi Biryani"
                value={name}
                onChangeText={setName}
              />

              {/* Image Upload Area */}
              <View style={styles.imageUploadWrapper}>
                <TouchableOpacity style={[styles.imageUploadContainer, shadows.sm]} activeOpacity={0.8}>
                  <GlassBackground intensity={30} />
                  <View style={styles.imageUploadInner}>
                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                    <Text style={styles.imageUploadText}>Add Item Image</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <AppTextInput
                label="Description"
                placeholder="Describe your item..."
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <AppTextInput
                label="Price (৳) *"
                placeholder="e.g. 250"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Category Selection Card */}
          <View style={[styles.card, shadows.sm]}>
            <GlassBackground intensity={40} />
            <View style={styles.cardInner}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isActive = category === cat;
                  const catColor = CATEGORY_COLORS[cat] ?? colors.primary;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip,
                        isActive && { backgroundColor: catColor, borderColor: catColor },
                      ]}
                      activeOpacity={0.8}
                    >
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={14} color={colors.white} />
                      )}
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Preview Card */}
          {name.trim() ? (
            <View style={[styles.card, shadows.sm]}>
              <GlassBackground intensity={40} />
              <View style={styles.cardInner}>
                <Text style={styles.sectionTitle}>Preview</Text>
                <View style={styles.previewItem}>
                  <View style={[styles.previewDot, { backgroundColor: CATEGORY_COLORS[category] ?? colors.primary }]} />
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewName}>{name.trim()}</Text>
                    {description.trim() ? (
                      <Text style={styles.previewDesc} numberOfLines={2}>{description.trim()}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.previewPrice}>
                    ৳{price ? parseFloat(price) || 0 : 0}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Save Button */}
          <View style={styles.btnContainer}>
            <AppButton
              label={isEditing ? 'Update Item' : 'Add to Menu'}
              onPress={handleSave}
              disabled={!isValid}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 160,
    gap: spacing.md,
  },
  imageUploadWrapper: {
    marginBottom: spacing.xs,
  },
  imageUploadContainer: {
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(43, 95, 224, 0.2)',
    borderStyle: 'dashed',
  },
  imageUploadInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  imageUploadText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  inputCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  cardInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(200, 200, 200, 0.3)',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewInfo: {
    flex: 1,
    gap: 2,
  },
  previewName: {
    fontSize: 15,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  previewDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  previewPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  btnContainer: {
    marginTop: spacing.sm,
  },
});

export default AddMenuItemScreen;
