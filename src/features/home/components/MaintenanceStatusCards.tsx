/**
 * Maintenance status cards grid - Shows overview of maintenance health per category
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { MaintenanceStatusCard, MaintenanceStatusType } from '../hooks/useMaintenanceStatus';

interface MaintenanceStatusCardsProps {
  cards: MaintenanceStatusCard[];
}

const statusConfig: Record<
  MaintenanceStatusType,
  {
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
    statusIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  ok: {
    backgroundColor: `${colors.accentSuccess}12`,
    borderColor: `${colors.accentSuccess}30`,
    iconColor: colors.accentSuccess,
    statusIcon: 'checkmark-circle',
  },
  attention: {
    backgroundColor: `${colors.accentDanger}12`,
    borderColor: `${colors.accentDanger}30`,
    iconColor: colors.accentDanger,
    statusIcon: 'alert-circle',
  },
  unknown: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    iconColor: colors.textTertiary,
    statusIcon: 'help-circle',
  },
};

const StatusCard: React.FC<{ card: MaintenanceStatusCard }> = ({ card }) => {
  const config = statusConfig[card.status];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <Ionicons name={card.icon} size={22} color={config.iconColor} />
        <Ionicons name={config.statusIcon} size={18} color={config.iconColor} />
      </View>
      <Text style={[styles.cardLabel, { color: config.iconColor }]} numberOfLines={2}>
        {card.label}
      </Text>
    </View>
  );
};

export const MaintenanceStatusCards: React.FC<MaintenanceStatusCardsProps> = ({ cards }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Etat de l'entretien</Text>
      <View style={styles.grid}>
        {cards.map(card => (
          <StatusCard key={card.id} card={card} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.s,
  },
  card: {
    flexBasis: '47%',
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    padding: spacing.m,
    gap: spacing.s,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    ...typography.smallMedium,
  },
});
