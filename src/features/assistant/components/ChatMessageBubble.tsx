/**
 * Chat message bubble component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography, shadows } from '@/core/theme';
import type { ChatMessage } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  const renderUserBubble = () => (
    <LinearGradient
      colors={gradients.violet}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.bubble,
        styles.userBubble,
        isStreaming && styles.streamingBubble,
      ]}
    >
      <Text style={[styles.messageText, styles.userText]}>
        {message.content || (isStreaming ? '...' : '')}
      </Text>

      {isStreaming && (
        <View style={styles.cursorContainer}>
          <View style={styles.cursor} />
        </View>
      )}
    </LinearGradient>
  );

  const renderAssistantBubble = () => (
    <View
      style={[
        styles.bubble,
        styles.assistantBubble,
        isStreaming && styles.streamingBubble,
      ]}
    >
      <Text style={[styles.messageText, styles.assistantText]}>
        {message.content || (isStreaming ? '...' : '')}
      </Text>

      {isStreaming && (
        <View style={styles.cursorContainer}>
          <View style={styles.cursor} />
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Ionicons name="sparkles" size={16} color={colors.accentPrimary} />
        </View>
      )}

      {isUser ? renderUserBubble() : renderAssistantBubble()}

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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.s,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  userAvatar: {
    backgroundColor: colors.accentPrimary,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: spacing.cardRadiusSmall,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    ...shadows.small,
  },
  userBubble: {
    borderBottomRightRadius: spacing.xs,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
