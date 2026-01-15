/**
 * Upcoming maintenance list component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { Card } from '../../../shared/components/Card';
import type { MaintenanceSchedule, MaintenanceCategory } from '../../../core/types/database';

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
  onViewAllPress?: () => void;
  onItemPress?: (item: MaintenanceItem) => void;
}

const urgencyConfig: Record<UrgencyLevel, { color: string; label: string }> = {
  overdue: { color: colors.accentDanger, label: 'En retard' },
  urgent: { color: colors.accentDanger, label: 'Urgent' },
  soon: { color: colors.accentWarning, label: 'Bientot' },
  upcoming: { color: colors.accentSuccess, label: 'Planifie' },
  optional: { color: colors.textSecondary, label: 'Optionnel' },
};

const categoryIcons: Record<MaintenanceCategory, keyof typeof Ionicons.glyphMap> = {
  oil_change: 'water-outline',
  brakes: 'disc-outline',
  filters: 'filter-outline',
  tires: 'ellipse-outline',
  mechanical: 'cog-outline',
  revision: 'checkmark-circle-outline',
  ac: 'snow-outline',
  custom: 'build-outline',
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
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={icon} size={20} color={config.color} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <View style={styles.rowMeta}>
          {item.dueDate && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{formatDueDate(item.dueDate)}</Text>
            </View>
          )}
          {item.dueMileage && (
            <View style={styles.metaItem}>
              <Ionicons name="speedometer-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{item.dueMileage.toLocaleString()} km</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const UpcomingMaintenance: React.FC<UpcomingMaintenanceProps> = ({
  items,
  onViewAllPress,
  onItemPress,
}) => {
  const displayItems = items.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prochaines Echeances</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAll}>Voir calendrier</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        {displayItems.length > 0 ? (
          displayItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <MaintenanceRow item={item} onPress={() => onItemPress?.(item)} />
              {index < displayItems.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={40} color={colors.accentSuccess} />
            <Text style={styles.emptyText}>Aucune echeance a venir</Text>
            <Text style={styles.emptySubtext}>Votre vehicule est a jour!</Text>
          </View>
        )}
      </Card>
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
  viewAll: {
    ...typography.caption,
    color: colors.accentPrimary,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    gap: spacing.m,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTitle: {
    ...typography.bodyMedium,
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
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadius,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.m,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.s,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginTop: spacing.s,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
