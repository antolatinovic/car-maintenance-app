/**
 * Chat message bubble component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/core/theme';
import type { ChatMessage } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="sparkles" size={16} color={colors.accentPrimary} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isStreaming && styles.streamingBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content || (isStreaming ? '...' : '')}
        </Text>

        {isStreaming && (
          <View style={styles.cursorContainer}>
            <View style={styles.cursor} />
          </View>
        )}
      </View>

      {isUser && (
        <View style={[styles.avatarContainer, styles.userAvatar]}>
          <Ionicons name="person" size={16} color={colors.textOnColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.s,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.s,
  },
  userAvatar: {
    backgroundColor: colors.accentPrimary,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: spacing.cardRadiusSmall,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    ...shadows.small,
  },
  userBubble: {
    backgroundColor: colors.accentPrimary,
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: colors.cardBackground,
    borderBottomLeftRadius: spacing.xs,
  },
  streamingBubble: {
    opacity: 0.95,
  },
  messageText: {
    ...typography.body,
  },
  userText: {
    color: colors.textOnColor,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  cursorContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  cursor: {
    width: 8,
    height: 16,
    backgroundColor: colors.accentPrimary,
    opacity: 0.7,
  },
});
