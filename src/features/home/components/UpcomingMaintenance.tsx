/**
 * Upcoming maintenance list component - Modern light mode
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography } from '@/core/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import type { MaintenanceCategory } from '@/core/types/database';

type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'upcoming' | 'optional';

interface MaintenanceItem {
  id: string;
  title: string;
  category: MaintenanceCategory;
  dueDate?: string;
  dueMileage?: number;
  urgency: UrgencyLevel;
}

interface UpcomingMaintenanceProps {
  items: MaintenanceItem[];
  maxItems?: number;
  onViewAllPress?: () => void;
  onItemPress?: (item: MaintenanceItem) => void;
}

const urgencyConfig: Record<UrgencyLevel, { color: string; label: string }> = {
  overdue: { color: colors.accentDanger, label: 'En retard' },
  urgent: { color: colors.accentDanger, label: 'Urgent' },
  soon: { color: colors.accentWarning, label: 'Bientot' },
  upcoming: { color: colors.accentSuccess, label: 'Planifie' },
  optional: { color: colors.textTertiary, label: 'Optionnel' },
};

const categoryIcons: Record<MaintenanceCategory, keyof typeof Ionicons.glyphMap> = {
  oil_change: 'water',
  brakes: 'disc',
  filters: 'filter',
  tires: 'ellipse',
  mechanical: 'cog',
  revision: 'checkmark-circle',
  ac: 'snow',
  distribution: 'git-network',
  suspension: 'swap-vertical',
  fluids: 'beaker',
  gearbox_oil: 'settings',
  custom: 'build',
};

const MaintenanceRow: React.FC<{
  item: MaintenanceItem;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const config = urgencyConfig[item.urgency];
  const icon = categoryIcons[item.category];

  const formatDueDate = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
        <Ionicons name={icon} size={20} color={config.color} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <View style={styles.rowMeta}>
          {item.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.textTertiary} />
              <Text style={styles.metaText}>{formatDueDate(item.dueDate)}</Text>
            </View>
          )}
          {item.dueMileage && (
            <View style={styles.metaItem}>
              <Ionicons name="speedometer-outline" size={12} color={colors.textTertiary} />
              <Text style={styles.metaText}>{item.dueMileage.toLocaleString()} km</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const UpcomingMaintenance: React.FC<UpcomingMaintenanceProps> = ({
  items,
  maxItems = 3,
  onViewAllPress,
  onItemPress,
}) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prochaines Échéances</Text>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAll}>Voir calendrier</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accentPrimary} />
        </TouchableOpacity>
      </View>

      <GlassCard variant="light" style={styles.card}>
        {displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <MaintenanceRow item={item} onPress={() => onItemPress?.(item)} />
              {index < displayItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Image
              source={require('../../../../assets/check-success.png')}
              style={styles.emptyIcon}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <Text style={styles.emptyText}>Aucune échéance à venir</Text>
            <Text style={styles.emptySubtext}>Votre véhicule est à jour !</Text>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAll: {
    ...typography.link,
    color: colors.accentPrimary,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.cardPadding,
    gap: spacing.m,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  rowMeta: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.small,
    color: colors.textTertiary,
  },
  badge: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadiusSmall,
  },
  badgeText: {
    ...typography.smallMedium,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.cardPadding,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.s,
  },
  emptyIcon: {
    width: 48,
    height: 48,
  },
  emptyText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    marginTop: spacing.s,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
