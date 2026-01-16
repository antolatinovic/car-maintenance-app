/**
 * Assistant Service - AI chat with streaming via Edge Function
 */

/* global TextDecoder */

import { supabase } from '@/core/config/supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import type { VehicleContext, QuotaInfo } from '../types';

interface ProfileQuotaData {
  ai_requests_count: number;
  ai_requests_reset_at: string;
  is_premium?: boolean;
}

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  vehicleContext?: VehicleContext | null;
}

export type StreamCallback = (chunk: string) => void;
export type ErrorCallback = (error: string) => void;
export type DoneCallback = (fullResponse: string) => void;

/**
 * Send a message and stream the response
 */
export const sendMessageStream = async (
  request: ChatRequest,
  onChunk: StreamCallback,
  onError: ErrorCallback,
  onDone: DoneCallback
): Promise<void> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      onError('Non authentifie');
      return;
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        conversationId: request.conversationId,
        message: request.message,
        vehicleContext: request.vehicleContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError(errorData.error || `Erreur HTTP ${response.status}`);
      return;
    }

    // Check if response is streaming
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('text/event-stream')) {
      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        onError('Impossible de lire la reponse');
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onDone(fullResponse);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                onChunk(parsed.content);
              }
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
            } catch {
              // Not JSON, treat as plain text
              fullResponse += data;
              onChunk(data);
            }
          }
        }
      }

      onDone(fullResponse);
    } else {
      // Handle non-streaming JSON response
      const data = await response.json();
      if (data.error) {
        onError(data.error);
        return;
      }
      if (data.content) {
        onChunk(data.content);
        onDone(data.content);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    onError(message);
  }
};

/**
 * Get user quota information
 */
export const getQuotaInfo = async (): Promise<ServiceResult<QuotaInfo>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('ai_requests_count, ai_requests_reset_at, is_premium')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      return { data: null, error: { message: error?.message || 'Profil non trouve' } };
    }

    const profile = data as unknown as ProfileQuotaData;
    const isPremium = profile.is_premium || false;
    const limit = isPremium ? 100 : 10;
    const used = profile.ai_requests_count || 0;
    const resetAt = new Date(profile.ai_requests_reset_at);

    // Check if reset is needed
    const now = new Date();
    const actualUsed = resetAt < now ? 0 : used;

    return {
      data: {
        used: actualUsed,
        limit,
        resetAt,
        isPremium,
        isExceeded: actualUsed >= limit,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la verification du quota' } };
  }
};

/**
 * Increment the AI request count
 */
export const incrementQuota = async (): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Get current profile
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('ai_requests_count, ai_requests_reset_at')
      .eq('id', user.id)
      .single();

    if (fetchError || !profileData) {
      return { data: null, error: { message: fetchError?.message || 'Profil non trouve' } };
    }

    const profile = profileData as unknown as ProfileQuotaData;
    const now = new Date();
    const resetAt = new Date(profile.ai_requests_reset_at);

    let newCount: number;
    let newResetAt: string;

    if (resetAt < now) {
      // Reset is needed
      newCount = 1;
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      newResetAt = nextMonth.toISOString();
    } else {
      newCount = (profile.ai_requests_count || 0) + 1;
      newResetAt = profile.ai_requests_reset_at;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ai_requests_count: newCount,
        ai_requests_reset_at: newResetAt,
      } as never)
      .eq('id', user.id);

    if (updateError) {
      return { data: null, error: { message: updateError.message } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour du quota' } };
  }
};

/**
 * Check if user has available quota
 */
export const checkQuota = async (): Promise<ServiceResult<boolean>> => {
  const quotaResult = await getQuotaInfo();
  if (quotaResult.error || !quotaResult.data) {
    return { data: null, error: quotaResult.error };
  }

  return { data: !quotaResult.data.isExceeded, error: null };
};
