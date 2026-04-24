import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryStatus } from '../../types';
import { getDeliveryStatusIndex } from '../../utils/statusHelpers';
import { colors, spacing, fontSize, fontWeight } from '../../theme/tokens';
import { DELIVERY_STATUS_STEPS } from '../../constants/labels';

type StatusStepperProps = {
  status: DeliveryStatus;
};

const StatusStepper: React.FC<StatusStepperProps> = ({ status }) => {
  const isRejected = status === 'REJECTED';
  const activeIndex = isRejected ? -1 : getDeliveryStatusIndex(status);

  if (isRejected) {
    return (
      <View style={styles.rejectedContainer}>
        <View style={styles.rejectedIcon}>
          <Ionicons
            name={'close-circle' as keyof typeof Ionicons.glyphMap}
            size={32}
            color={colors.danger}
          />
        </View>
        <Text style={styles.rejectedText}>Request Rejected</Text>
        <Text style={styles.rejectedSub}>This delivery request was not accepted</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {DELIVERY_STATUS_STEPS.map((label, index) => {
        const isCompleted = index < activeIndex;
        const isActive = index === activeIndex;
        const isPending = index > activeIndex;

        return (
          <View key={label} style={styles.stepWrapper}>
            {/* Connector line before */}
            {index > 0 ? (
              <View
                style={[
                  styles.connector,
                  isCompleted || isActive ? styles.connectorActive : styles.connectorPending,
                ]}
              />
            ) : null}

            {/* Step node */}
            <View style={styles.stepCol}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isActive && styles.stepCircleActive,
                  isPending && styles.stepCirclePending,
                ]}
              >
                {isCompleted ? (
                  <Ionicons
                    name={'checkmark' as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={colors.white}
                  />
                ) : isActive ? (
                  <View style={styles.activePulse} />
                ) : (
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isCompleted && styles.stepLabelCompleted,
                  isPending && styles.stepLabelPending,
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const STEP_SIZE = 32;
const CONNECTOR_WIDTH = 28;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'flex-start',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: STEP_SIZE / 2,
  },
  connector: {
    width: CONNECTOR_WIDTH,
    height: 2,
    marginTop: 0,
  },
  connectorActive: {
    backgroundColor: colors.primary,
  },
  connectorPending: {
    backgroundColor: colors.divider,
  },
  stepCol: {
    alignItems: 'center',
    width: 64,
    gap: spacing.xs,
  },
  stepCircle: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderRadius: STEP_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  stepCirclePending: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 0,
  },
  activePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  stepNumber: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
    maxWidth: 60,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  stepLabelCompleted: {
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  stepLabelPending: {
    color: colors.textMuted,
  },
  rejectedContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  rejectedIcon: {
    marginBottom: spacing.xs,
  },
  rejectedText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.danger,
  },
  rejectedSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default StatusStepper;
