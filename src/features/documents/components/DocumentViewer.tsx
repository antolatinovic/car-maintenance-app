/**
 * Full-screen document viewer
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/core/theme';
import { getDocumentUrl } from '@/services/documentService';
import type { Document, DocumentType } from '@/core/types/database';

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onDelete: () => void;
}

const typeLabels: Record<DocumentType, string> = {
  insurance: 'Assurance',
  registration: 'Carte grise',
  license: 'Permis',
  inspection: 'Controle technique',
  invoice: 'Facture',
  fuel_receipt: 'Carburant',
  other: 'Autre',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose, onDelete }) => {
  const insets = useSafeAreaInsets();
  const imageUrl = getDocumentUrl(document.file_path);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Non definie';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null): string => {
    if (amount === null || amount === undefined) return 'Non defini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {document.description || typeLabels[document.type]}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={24} color={colors.accentDanger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag-outline" size={18} color={colors.textTertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{typeLabels[document.type]}</Text>
            </View>
          </View>

          {document.vendor && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="storefront-outline" size={18} color={colors.textTertiary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Fournisseur</Text>
                <Text style={styles.detailValue}>{document.vendor}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={18} color={colors.textTertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(document.date)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="cash-outline" size={18} color={colors.textTertiary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Montant</Text>
              <Text style={styles.detailValue}>{formatAmount(document.amount)}</Text>
            </View>
          </View>

          {document.mileage && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="speedometer-outline" size={18} color={colors.textTertiary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Kilometrage</Text>
                <Text style={styles.detailValue}>
                  {document.mileage.toLocaleString('fr-FR')} km
                </Text>
              </View>
            </View>
          )}

          {document.notes && (
            <>
              <View style={styles.separator} />
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notes}>{document.notes}</Text>
            </>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
    backgroundColor: colors.backgroundPrimary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  imageContainer: {
    width: SCREEN_WIDTH - spacing.screenPaddingHorizontal * 2,
    height: SCREEN_WIDTH - spacing.screenPaddingHorizontal * 2,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPaddingLarge,
    ...shadows.small,
  },
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.l,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.l,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.l,
  },
  notes: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: spacing.tabBarHeight + spacing.xxl,
  },
});
