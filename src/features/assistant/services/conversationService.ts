/**
 * Conversation Service - CRUD operations for conversations and messages
 */

import { supabase } from '@/core/config/supabase';
import type { Conversation, Message, MessageRole } from '@/core/types/database';

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

export interface CreateConversationData {
  vehicle_id?: string | null;
  title?: string;
}

export interface CreateMessageData {
  conversation_id: string;
  role: MessageRole;
  content: string;
  document_id?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<ServiceResult<Conversation[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Conversation[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des conversations' } };
  }
};

/**
 * Get a single conversation by ID
 */
export const getConversation = async (
  conversationId: string
): Promise<ServiceResult<Conversation>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Conversation, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation de la conversation' } };
  }
};

/**
 * Create a new conversation
 */
export const createConversation = async (
  conversationData: CreateConversationData
): Promise<ServiceResult<Conversation>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const insertData = {
      ...conversationData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Conversation, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation de la conversation' } };
  }
};

/**
 * Update a conversation
 */
export const updateConversation = async (
  conversationId: string,
  updates: Partial<CreateConversationData>
): Promise<ServiceResult<Conversation>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updates as never)
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Conversation, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour de la conversation' } };
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (
  conversationId: string
): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression de la conversation' } };
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (
  conversationId: string,
  limit = 50
): Promise<ServiceResult<Message[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // First verify the conversation belongs to the user
    const conversationResult = await getConversation(conversationId);
    if (conversationResult.error || !conversationResult.data) {
      return { data: null, error: { message: 'Conversation non trouvee' } };
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Message[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des messages' } };
  }
};

/**
 * Create a new message
 */
export const createMessage = async (
  messageData: CreateMessageData
): Promise<ServiceResult<Message>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Verify the conversation belongs to the user
    const conversationResult = await getConversation(messageData.conversation_id);
    if (conversationResult.error || !conversationResult.data) {
      return { data: null, error: { message: 'Conversation non trouvee' } };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Message, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation du message' } };
  }
};

/**
 * Get conversation with messages
 */
export const getConversationWithMessages = async (
  conversationId: string
): Promise<ServiceResult<{ conversation: Conversation; messages: Message[] }>> => {
  try {
    const conversationResult = await getConversation(conversationId);
    if (conversationResult.error || !conversationResult.data) {
      return { data: null, error: conversationResult.error };
    }

    const messagesResult = await getMessages(conversationId);
    if (messagesResult.error) {
      return { data: null, error: messagesResult.error };
    }

    return {
      data: {
        conversation: conversationResult.data,
        messages: messagesResult.data || [],
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation de la conversation' } };
  }
};

/**
 * Get or create a conversation for a vehicle
 */
export const getOrCreateConversation = async (
  vehicleId?: string | null
): Promise<ServiceResult<Conversation>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Try to find an existing recent conversation
    const query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(1);

    if (vehicleId) {
      query.eq('vehicle_id', vehicleId);
    }

    const { data: existing } = await query;

    if (existing && existing.length > 0) {
      return { data: existing[0] as Conversation, error: null };
    }

    // Create a new conversation
    return createConversation({ vehicle_id: vehicleId });
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation de la conversation' } };
  }
};
