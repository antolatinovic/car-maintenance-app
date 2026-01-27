/**
 * Document card component - displays a single document
 * Glassmorphism design aligned with home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { GlassCard } from '@/shared/components';
import { getDocumentUrl } from '@/services/documentService';
import type { Document, DocumentType } from '@/core/types/database';

interface DocumentCardProps {
  document: Document;
  onPress: (document: Document) => void;
  onLongPress?: (document: Document) => void;
}

const typeConfig: Record<
  DocumentType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }
> = {
  insurance: {
    label: 'Assurance',
    icon: 'shield-checkmark-outline',
    color: colors.accentSecondary,
  },
  registration: {
    label: 'Carte grise',
    icon: 'car-outline',
    color: colors.accentSuccess,
  },
  license: {
    label: 'Permis',
    icon: 'id-card-outline',
    color: '#8B5CF6',
  },
  inspection: {
    label: 'Controle technique',
    icon: 'clipboard-outline',
    color: colors.accentWarning,
  },
  invoice: {
    label: 'Facture',
    icon: 'receipt-outline',
    color: colors.accentPrimary,
  },
  fuel_receipt: {
    label: 'Carburant',
    icon: 'water-outline',
    color: colors.accentSecondary,
  },
  maintenance: {
    label: 'Entretien',
    icon: 'construct-outline',
    color: colors.accentSecondary,
  },
  other: {
    label: 'Autre',
    icon: 'folder-outline',
    color: colors.textSecondary,
  },
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onPress, onLongPress }) => {
  const config = typeConfig[document.type];
  const imageUrl = getDocumentUrl(document.file_path);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Date non definie';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null): string => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => onPress(document)}
      onLongPress={() => onLongPress?.(document)}
      activeOpacity={0.7}
    >
      <GlassCard variant="light" style={styles.container}>
        <View style={styles.cardContent}>
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: imageUrl }} style={styles.thumbnail} resizeMode="cover" />
            <View style={[styles.typeOverlay, { backgroundColor: config.color }]}>
              <Ionicons name={config.icon} size={14} color={colors.textOnColor} />
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {document.description || config.label}
              </Text>
              {document.amount !== null && (
                <Text style={styles.amount}>{formatAmount(document.amount)}</Text>
              )}
            </View>

            <View style={styles.details}>
              {document.vendor && (
                <View style={styles.detailRow}>
                  <Ionicons name="storefront-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {document.vendor}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                <Text style={styles.detailText}>{formatDate(document.date)}</Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
            style={styles.chevron}
          />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.m,
  },
  container: {
    borderRadius: spacing.cardRadius,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.m,
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: spacing.cardRadiusSmall,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTertiary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  typeOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  amount: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
    marginLeft: spacing.s,
  },
  details: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
  },
  badge: {
    marginTop: spacing.s,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.cardRadiusSmall,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: spacing.s,
  },
});
