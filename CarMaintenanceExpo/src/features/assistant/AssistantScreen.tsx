/**
 * Assistant Screen - AI chat interface
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Alert, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/core/theme';
import {
  AssistantHeader,
  ChatMessageBubble,
  ChatInput,
  QuotaDisplay,
  EmptyChat,
} from './components';
import { useChat, useQuota, useConversations, useVehicleContext } from './hooks';
import type { ChatMessage } from './types';

export const AssistantScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Hooks
  const { quota, refresh: refreshQuota, canSendMessage } = useQuota();
  const { vehicleContext, vehicle } = useVehicleContext();
  const { currentConversation, getOrCreate, createNew } = useConversations();
  const {
    messages,
    isSending,
    error,
    sendMessage,
    loadMessages,
    clearMessages,
    setConversationId,
    setVehicleContext,
  } = useChat();

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      const conversation = await getOrCreate(vehicle?.id);
      if (conversation) {
        setConversationId(conversation.id);
        await loadMessages(conversation.id);
      }
    };

    initConversation();
  }, [vehicle?.id]);

  // Update vehicle context in chat hook
  useEffect(() => {
    setVehicleContext(vehicleContext);
  }, [vehicleContext, setVehicleContext]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
    }
  }, [error]);

  // Handlers
  const handleNewConversation = useCallback(async () => {
    clearMessages();
    const conversation = await createNew({ vehicle_id: vehicle?.id });
    if (conversation) {
      setConversationId(conversation.id);
    }
  }, [clearMessages, createNew, vehicle?.id, setConversationId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!canSendMessage) {
        Alert.alert(
          'Quota atteint',
          'Vous avez atteint votre limite de messages ce mois-ci. Passez Premium pour continuer.'
        );
        return;
      }

      if (!currentConversation) {
        // Create conversation if needed
        const conversation = await getOrCreate(vehicle?.id);
        if (conversation) {
          setConversationId(conversation.id);
        } else {
          Alert.alert('Erreur', 'Impossible de creer une conversation');
          return;
        }
      }

      await sendMessage(content);
      refreshQuota();
    },
    [
      canSendMessage,
      currentConversation,
      getOrCreate,
      vehicle?.id,
      setConversationId,
      sendMessage,
      refreshQuota,
    ]
  );

  const handleSuggestionPress = useCallback(
    (text: string) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  // Render
  const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : null;

  const renderMessage: ListRenderItem<ChatMessage> = useCallback(
    ({ item }) => <ChatMessageBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const renderEmptyComponent = useCallback(
    () => <EmptyChat onSuggestionPress={handleSuggestionPress} vehicleName={vehicleName} />,
    [handleSuggestionPress, vehicleName]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <AssistantHeader onNewConversation={handleNewConversation} vehicleName={vehicleName} />
        <QuotaDisplay quota={quota} />
      </View>

      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        contentContainerStyle={[
          styles.messageListContent,
          messages.length === 0 && styles.emptyListContent,
        ]}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <ChatInput
        onSend={handleSendMessage}
        disabled={!canSendMessage || !currentConversation}
        isLoading={isSending}
        placeholder={!canSendMessage ? 'Quota atteint...' : 'Posez votre question...'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    backgroundColor: colors.backgroundPrimary,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: spacing.m,
    paddingBottom: 180, // Space for input + tabbar
  },
  emptyListContent: {
    flex: 1,
  },
});
