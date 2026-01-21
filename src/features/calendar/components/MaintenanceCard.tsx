/**
 * Maintenance card component for calendar events
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography } from '@/core/theme';
import type { MaintenanceCategory } from '@/core/types/database';
import type { UrgencyLevel } from '../hooks/useMaintenanceSchedules';

interface MaintenanceCardProps {
  id: string;
  title: string;
  category: MaintenanceCategory;
  dueDate?: string;
  dueMileage?: number;
  urgency: UrgencyLevel;
  estimatedCost?: number;
  location?: string;
  onPress?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const urgencyConfig: Record<UrgencyLevel, { color: string; label: string }> = {
  overdue: { color: colors.accentDanger, label: 'En retard' },
  soon: { color: colors.accentWarning, label: 'Bientot' },
  upcoming: { color: colors.accentSuccess, label: 'Planifie' },
};

const categoryIcons: Record<MaintenanceCategory, keyof typeof Ionicons.glyphMap> = {
  oil_change: 'water',
  brakes: 'disc',
  filters: 'filter',
  tires: 'ellipse',
  mechanical: 'cog',
  revision: 'checkmark-circle',
  ac: 'snow',
  custom: 'build',
};

const categoryLabels: Record<MaintenanceCategory, string> = {
  oil_change: 'Vidange',
  brakes: 'Freins',
  filters: 'Filtres',
  tires: 'Pneus',
  mechanical: 'Mecanique',
  revision: 'Revision',
  ac: 'Climatisation',
  custom: 'Autre',
};

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  title,
  category,
  dueDate,
  dueMileage,
  urgency,
  estimatedCost,
  location,
  onPress,
  onComplete,
  onDelete,
}) => {
  const config = urgencyConfig[urgency];
  const icon = categoryIcons[category];
  const categoryLabel = categoryLabels[category];

  const formatDate = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const displayTitle = title || categoryLabel;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Ionicons name={icon} size={24} color={config.color} />
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
            <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>

          <View style={styles.meta}>
            {dueDate && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.metaText}>{formatDate(dueDate)}</Text>
              </View>
            )}
            {dueMileage && (
              <View style={styles.metaItem}>
                <Ionicons name="speedometer-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.metaText}>{dueMileage.toLocaleString()} km</Text>
              </View>
            )}
          </View>

          {(estimatedCost || location) && (
            <View style={styles.secondaryMeta}>
              {estimatedCost && (
                <Text style={styles.cost}>{estimatedCost.toLocaleString()} EUR</Text>
              )}
              {location && (
                <Text style={styles.location} numberOfLines={1}>
                  {location}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {(onComplete || onDelete) && (
        <View style={styles.actions}>
          {onComplete && (
            <TouchableOpacity
              onPress={onComplete}
              style={[styles.actionButton, styles.completeButton]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="checkmark" size={20} color={colors.accentSuccess} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionButton, styles.deleteButton]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.accentDanger} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    ...shadows.small,
  },
  content: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.s,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadiusSmall,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  secondaryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginTop: spacing.xs,
  },
  cost: {
    ...typography.captionSemiBold,
    color: colors.textPrimary,
  },
  location: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.s,
    marginTop: spacing.m,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: `${colors.accentSuccess}15`,
  },
  deleteButton: {
    backgroundColor: `${colors.accentDanger}10`,
  },
});
