/**
 * Hook for managing chat with streaming support
 */

import { useState, useCallback, useRef } from 'react';
import { sendMessageStream } from '../services';
import { getMessages } from '../services/conversationService';
import type { ChatMessage, VehicleContext } from '../types';
import type { Message } from '@/core/types/database';

interface UseChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

interface UseChatReturn extends UseChatState {
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  setVehicleContext: (context: VehicleContext | null) => void;
}

const mapMessageToChat = (message: Message): ChatMessage => ({
  id: message.id,
  role: message.role,
  content: message.content,
  createdAt: new Date(message.created_at),
});

export const useChat = (): UseChatReturn => {
  const [state, setState] = useState<UseChatState>({
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
  });

  const conversationIdRef = useRef<string | null>(null);
  const vehicleContextRef = useRef<VehicleContext | null>(null);
  const streamingMessageRef = useRef<string>('');

  const setConversationId = useCallback((id: string | null) => {
    conversationIdRef.current = id;
  }, []);

  const setVehicleContext = useCallback((context: VehicleContext | null) => {
    vehicleContextRef.current = context;
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    conversationIdRef.current = conversationId;

    try {
      const result = await getMessages(conversationId);

      if (result.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || 'Erreur de chargement',
        }));
        return;
      }

      const chatMessages = (result.data || []).map(mapMessageToChat);
      setState(prev => ({
        ...prev,
        messages: chatMessages,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du chargement des messages',
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [], error: null }));
    conversationIdRef.current = null;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const conversationId = conversationIdRef.current;
    if (!conversationId || !content.trim()) {
      setState(prev => ({ ...prev, error: 'Message vide ou conversation non selectionnee' }));
      return;
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      createdAt: new Date(),
    };

    // Add placeholder for assistant response
    const assistantPlaceholder: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      isStreaming: true,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantPlaceholder],
      isSending: true,
      error: null,
    }));

    streamingMessageRef.current = '';

    try {
      await sendMessageStream(
        {
          conversationId,
          message: content.trim(),
          vehicleContext: vehicleContextRef.current,
        },
        // onChunk - stream content
        (chunk: string) => {
          streamingMessageRef.current += chunk;
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(m =>
              m.isStreaming ? { ...m, content: streamingMessageRef.current } : m
            ),
          }));
        },
        // onError
        (error: string) => {
          setState(prev => ({
            ...prev,
            messages: prev.messages.filter(m => !m.isStreaming),
            isSending: false,
            error,
          }));
        },
        // onDone
        (fullResponse: string) => {
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(m =>
              m.isStreaming ? { ...m, content: fullResponse, isStreaming: false } : m
            ),
            isSending: false,
          }));
        }
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => !m.isStreaming),
        isSending: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
    }
  }, []);

  return {
    ...state,
    sendMessage,
    loadMessages,
    clearMessages,
    setConversationId,
    setVehicleContext,
  };
};
