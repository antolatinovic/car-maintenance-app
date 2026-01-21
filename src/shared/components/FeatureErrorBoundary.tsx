/**
 * FeatureErrorBoundary - Catch and handle errors in feature modules
 * Isolates errors so one broken feature doesn't crash the entire app
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface FeatureErrorBoundaryProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[${this.props.featureName}] Error:`, error);
    console.error(`[${this.props.featureName}] Error Info:`, errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={48} color={colors.accentDanger} />
            </View>
            <Text style={styles.title}>Oups !</Text>
            <Text style={styles.message}>
              Une erreur s'est produite dans {this.props.featureName}.
            </Text>
            <Text style={styles.submessage}>
              Les autres fonctionnalites de l'application restent accessibles.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={20} color={colors.textOnColor} />
              <Text style={styles.retryText}>Reessayer</Text>
            </TouchableOpacity>
            {/* eslint-disable-next-line no-undef */}
            {typeof __DEV__ !== 'undefined' && __DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug:</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenPaddingHorizontal,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentDanger + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  submessage: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    gap: spacing.s,
  },
  retryText: {
    ...typography.button,
    color: colors.textOnColor,
  },
  debugContainer: {
    marginTop: spacing.xl,
    padding: spacing.m,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    ...typography.bodySemiBold,
    color: colors.accentDanger,
    marginBottom: spacing.xs,
  },
  debugText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
