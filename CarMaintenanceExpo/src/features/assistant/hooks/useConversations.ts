/**
 * Hook for managing conversations CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getConversations,
  createConversation,
  deleteConversation,
  getOrCreateConversation,
  CreateConversationData,
} from '../services';
import type { Conversation } from '@/core/types/database';

interface ConversationsState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
}

interface UseConversationsReturn extends ConversationsState {
  refresh: () => Promise<void>;
  createNew: (data?: CreateConversationData) => Promise<Conversation | null>;
  remove: (conversationId: string) => Promise<boolean>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  getOrCreate: (vehicleId?: string | null) => Promise<Conversation | null>;
}

export const useConversations = (): UseConversationsReturn => {
  const [state, setState] = useState<ConversationsState>({
    conversations: [],
    currentConversation: null,
    isLoading: true,
    error: null,
  });

  const fetchConversations = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getConversations();

      if (result.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || 'Erreur inconnue',
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        conversations: result.data || [],
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du chargement des conversations',
      }));
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refresh = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  const createNew = useCallback(
    async (data?: CreateConversationData): Promise<Conversation | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await createConversation(data || {});

        if (result.error || !result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || 'Erreur lors de la creation',
          }));
          return null;
        }

        setState(prev => ({
          ...prev,
          conversations: [result.data!, ...prev.conversations],
          currentConversation: result.data,
          isLoading: false,
          error: null,
        }));

        return result.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la creation de la conversation',
        }));
        return null;
      }
    },
    []
  );

  const remove = useCallback(async (conversationId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await deleteConversation(conversationId);

      if (result.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || 'Erreur lors de la suppression',
        }));
        return false;
      }

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== conversationId),
        currentConversation:
          prev.currentConversation?.id === conversationId ? null : prev.currentConversation,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la suppression de la conversation',
      }));
      return false;
    }
  }, []);

  const setCurrentConversation = useCallback((conversation: Conversation | null) => {
    setState(prev => ({ ...prev, currentConversation: conversation }));
  }, []);

  const getOrCreate = useCallback(
    async (vehicleId?: string | null): Promise<Conversation | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await getOrCreateConversation(vehicleId);

        if (result.error || !result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || 'Erreur lors de la creation',
          }));
          return null;
        }

        // Check if conversation is already in the list
        const exists = state.conversations.some(c => c.id === result.data!.id);

        setState(prev => ({
          ...prev,
          conversations: exists ? prev.conversations : [result.data!, ...prev.conversations],
          currentConversation: result.data,
          isLoading: false,
          error: null,
        }));

        return result.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la creation de la conversation',
        }));
        return null;
      }
    },
    [state.conversations]
  );

  return {
    ...state,
    refresh,
    createNew,
    remove,
    setCurrentConversation,
    getOrCreate,
  };
};
