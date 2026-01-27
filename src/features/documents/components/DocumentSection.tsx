/**
 * Document Section - Collapsible section for documents by type
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { DocumentCardCompact } from './DocumentCardCompact';
import type { Document, DocumentType } from '@/core/types/database';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SectionConfig {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const sectionConfig: Record<DocumentType, SectionConfig> = {
  invoice: {
    label: 'Factures',
    icon: 'receipt-outline',
    color: colors.accentPrimary,
  },
  fuel_receipt: {
    label: 'Carburant',
    icon: 'water-outline',
    color: colors.accentSecondary,
  },
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
  maintenance: {
    label: 'Entretien',
    icon: 'construct-outline',
    color: colors.accentSecondary,
  },
  other: {
    label: 'Autres',
    icon: 'folder-outline',
    color: colors.textSecondary,
  },
};

interface DocumentSectionProps {
  type: DocumentType;
  documents: Document[];
  onDocumentPress: (document: Document) => void;
  onDocumentLongPress?: (document: Document) => void;
  defaultExpanded?: boolean;
  maxVisibleItems?: number;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  type,
  documents,
  onDocumentPress,
  onDocumentLongPress,
  defaultExpanded = true,
  maxVisibleItems = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const config = sectionConfig[type];
  const count = documents.length;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const toggleShowAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAll(!showAll);
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const visibleDocuments = showAll ? documents : documents.slice(0, maxVisibleItems);
  const hasMore = documents.length > maxVisibleItems;

  if (count === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>
        <Text style={styles.title}>{config.label}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {visibleDocuments.map(document => (
            <DocumentCardCompact
              key={document.id}
              document={document}
              onPress={onDocumentPress}
              onLongPress={onDocumentLongPress}
            />
          ))}

          {hasMore && (
            <TouchableOpacity style={styles.showMoreButton} onPress={toggleShowAll}>
              <Text style={styles.showMoreText}>
                {showAll ? 'Voir moins' : `Voir tout (${count})`}
              </Text>
              <Ionicons
                name={showAll ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.accentPrimary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.m,
    marginHorizontal: spacing.screenPaddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadiusSmall,
    marginRight: spacing.s,
  },
  countText: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
  },
  content: {
    marginTop: spacing.s,
    gap: spacing.s,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    gap: spacing.xs,
  },
  showMoreText: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
  },
});
