/**
 * Login Screen - User authentication (Modern Light Mode)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadows, spacing, typography } from '@/core/theme';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ message: string } | null>;
  onNavigateToSignup: () => void;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToSignup,
  isLoading,
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    const result = await onLogin(email.trim(), password);
    if (result) {
      setError(result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={gradients.violet}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="car-sport" size={40} color={colors.textOnColor} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Car Maintenance</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.accentDanger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
            <LinearGradient
              colors={isLoading ? [colors.textTertiary, colors.textTertiary] : gradients.violet}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textOnColor} />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={onNavigateToSignup} disabled={isLoading}>
            <Text style={styles.footerLink}>Creer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    marginBottom: spacing.l,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: spacing.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.xxxl,
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    height: spacing.inputHeight,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    marginLeft: spacing.m,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accentDanger}10`,
    borderRadius: spacing.cardRadiusSmall,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  errorText: {
    ...typography.caption,
    color: colors.accentDanger,
    marginLeft: spacing.s,
    flex: 1,
  },
  button: {
    borderRadius: spacing.buttonRadius,
    height: spacing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
    ...shadows.medium,
  },
  buttonText: {
    ...typography.button,
    color: colors.textOnColor,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodySemiBold,
    color: colors.accentPrimary,
  },
});
