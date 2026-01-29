/**
 * Chat input component with send button
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, spacing, typography, shadows, glass } from '@/core/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = 'Posez votre question...',
}) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  }, [message, onSend, disabled, isLoading]);

  const canSend = message.trim().length > 0 && !disabled && !isLoading;

  const renderContent = () => (
    <View
      style={[
        styles.innerContainer,
        { paddingBottom: Math.max(insets.bottom, spacing.m) + spacing.tabBarHeight },
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={2000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
        >
          {canSend ? (
            <LinearGradient
              colors={gradients.violet}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textOnColor} />
              ) : (
                <Ionicons name="send" size={20} color={colors.textOnColor} />
              )}
            </LinearGradient>
          ) : (
            <View style={styles.sendButtonDisabled}>
              <Ionicons name="send" size={20} color={colors.textTertiary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={glass.blurIntensity}
            tint={glass.blurTint}
            style={styles.blurContainer}
          >
            {renderContent()}
          </BlurView>
        ) : (
          <View style={styles.androidContainer}>
            {renderContent()}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  blurContainer: {
    width: '100%',
  },
  androidContainer: {
    width: '100%',
    backgroundColor: glass.dark.backgroundColor,
  },
  innerContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: spacing.cardRadius,
    paddingLeft: spacing.l,
    paddingRight: spacing.s,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...shadows.small,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.s,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: spacing.s,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
  },
});
