/**
 * Quick Access Cards - Horizontal carousel for important official documents
 * Shows: Insurance, Registration (Carte grise), License (Permis), Inspection (CT)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { Document, DocumentType } from '@/core/types/database';

interface QuickAccessConfig {
  type: DocumentType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const quickAccessTypes: QuickAccessConfig[] = [
  { type: 'registration', label: 'Carte grise', icon: 'car', color: colors.accentSuccess },
  { type: 'inspection', label: 'Controle tech.', icon: 'clipboard', color: colors.accentWarning },
];

interface QuickAccessCardsProps {
  documents: Record<DocumentType, Document[]>;
  onDocumentPress: (document: Document) => void;
  onAddPress: (type: DocumentType) => void;
}

export const QuickAccessCards: React.FC<QuickAccessCardsProps> = ({
  documents,
  onDocumentPress,
  onAddPress,
}) => {
  const getDocumentStatus = (type: DocumentType): { status: 'ok' | 'warning' | 'missing'; document?: Document } => {
    const docs = documents[type] || [];
    if (docs.length === 0) {
      return { status: 'missing' };
    }

    const latestDoc = docs[0];
    // Check if document has a date and if it might be expiring soon (within 30 days)
    if (latestDoc.date) {
      const docDate = new Date(latestDoc.date);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((docDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // For insurance and inspection, check if expiring within 30 days
      if ((type === 'insurance' || type === 'inspection') && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        return { status: 'warning', document: latestDoc };
      }
    }

    return { status: 'ok', document: latestDoc };
  };

  const renderStatusIcon = (status: 'ok' | 'warning' | 'missing') => {
    switch (status) {
      case 'ok':
        return (
          <View style={[styles.statusBadge, styles.statusOk]}>
            <Ionicons name="checkmark" size={12} color={colors.textOnColor} />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.statusBadge, styles.statusWarning]}>
            <Ionicons name="alert" size={12} color={colors.textOnColor} />
          </View>
        );
      case 'missing':
        return (
          <View style={[styles.statusBadge, styles.statusMissing]}>
            <Ionicons name="add" size={12} color={colors.textOnColor} />
          </View>
        );
    }
  };

  const renderCard = (config: QuickAccessConfig) => {
    const { status, document } = getDocumentStatus(config.type);

    const handlePress = () => {
      if (document) {
        onDocumentPress(document);
      } else {
        onAddPress(config.type);
      }
    };

    const cardContent = (
      <View style={styles.cardInner}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>
        {renderStatusIcon(status)}
        <Text style={styles.cardLabel} numberOfLines={1}>
          {config.label}
        </Text>
        <Text style={styles.cardStatus}>
          {status === 'ok' ? 'OK' : status === 'warning' ? 'Expire bientot' : 'Manquant'}
        </Text>
      </View>
    );

    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          key={config.type}
          style={styles.cardWrapper}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <BlurView intensity={20} tint="light" style={styles.cardBlur}>
            {cardContent}
          </BlurView>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={config.type}
        style={[styles.cardWrapper, styles.cardAndroid]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {cardContent}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Acces rapide</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {quickAccessTypes.map(renderCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.m,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    gap: spacing.m,
  },
  cardWrapper: {
    width: 100,
    height: 120,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  cardAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOk: {
    backgroundColor: colors.accentSuccess,
  },
  statusWarning: {
    backgroundColor: colors.accentWarning,
  },
  statusMissing: {
    backgroundColor: colors.textTertiary,
  },
  cardLabel: {
    ...typography.captionSemiBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardStatus: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
