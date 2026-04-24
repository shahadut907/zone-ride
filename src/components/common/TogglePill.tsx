import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../theme/tokens';
import { glassValues } from '../../theme/glass';

type Option = {
  label: string;
  value: string;
};

type TogglePillProps = {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
};

const TogglePill: React.FC<TogglePillProps> = ({
  options,
  selected,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt.value === selected;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.85}
            style={[styles.segment, isActive && styles.segmentActive]}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: glassValues.segmentBg,
    borderRadius: 22,
    height: 44,
    padding: 3,
    gap: 2,
    borderWidth: 0,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  segmentActive: {
    backgroundColor: glassValues.segmentActiveBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.segmentInactiveText,
  },
  segmentTextActive: {
    fontWeight: fontWeight.bold,
    color: colors.segmentActiveText,
  },
});

export default TogglePill;
