/**
 * About Modal - App info and legal mentions
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      // Handle error silently
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.l }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>A propos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <Ionicons name="car-sport" size={40} color={colors.accentPrimary} />
              </View>
              <Text style={styles.appName}>CarMaintenance</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionText}>
                CarMaintenance est votre assistant personnel pour gerer l'entretien de vos
                vehicules. Suivez vos maintenances, planifiez vos rendez-vous et gardez un
                historique complet de vos depenses automobiles.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mentions legales</Text>
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => handleLinkPress('https://example.com/privacy')}
              >
                <Text style={styles.linkText}>Politique de confidentialite</Text>
                <Ionicons name="open-outline" size={16} color={colors.accentPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => handleLinkPress('https://example.com/terms')}
              >
                <Text style={styles.linkText}>Conditions d'utilisation</Text>
                <Ionicons name="open-outline" size={16} color={colors.accentPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => handleLinkPress('mailto:support@carmaintenance.app')}
              >
                <Text style={styles.linkText}>support@carmaintenance.app</Text>
                <Ionicons name="mail-outline" size={16} color={colors.accentPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.copyright}>© 2024 CarMaintenance. Tous droits reserves.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    paddingTop: spacing.m,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.accentPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  appName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  appVersion: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.m,
  },
  sectionText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  linkText: {
    ...typography.body,
    color: colors.accentPrimary,
  },
  copyright: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.l,
    marginBottom: spacing.xxl,
  },
});
