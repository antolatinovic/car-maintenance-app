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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows } from '@/core/theme';

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View
        style={[
          styles.container,
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
            style={[
              styles.sendButton,
              canSend ? styles.sendButtonActive : styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textOnColor} />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color={canSend ? colors.textOnColor : colors.textTertiary}
              />
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    paddingLeft: spacing.l,
    paddingRight: spacing.s,
    paddingVertical: spacing.s,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  sendButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
});
