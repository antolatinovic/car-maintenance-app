/**
 * Types for the AI Assistant feature
 */

import type { Conversation, Message, Vehicle, MessageRole } from '@/core/types/database';

export type { Conversation, Message, MessageRole };

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  createdAt: Date;
}

export interface VehicleContext {
  vehicle: Vehicle | null;
  maintenanceHistory: MaintenanceSummary[];
  upcomingMaintenance: MaintenanceSummary[];
}

export interface MaintenanceSummary {
  category: string;
  date: string;
  mileage?: number;
  description?: string;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  resetAt: Date;
  isPremium: boolean;
  isExceeded: boolean;
}

export interface SendMessageRequest {
  conversationId: string;
  message: string;
  vehicleContext?: VehicleContext;
}

export interface SendMessageResponse {
  messageId: string;
  content: string;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content?: string;
  error?: string;
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessagePreview?: string;
}

export interface SuggestionItem {
  id: string;
  text: string;
  icon: string;
}

export const SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'maintenance',
    text: 'Quand dois-je faire ma prochaine vidange ?',
    icon: 'water-outline',
  },
  {
    id: 'troubleshoot',
    text: 'Mon moteur fait un bruit anormal, que faire ?',
    icon: 'warning-outline',
  },
  {
    id: 'budget',
    text: "Comment reduire mes frais d'entretien ?",
    icon: 'wallet-outline',
  },
  {
    id: 'advice',
    text: 'Conseils pour preparer un long trajet',
    icon: 'car-outline',
  },
];

export const QUOTA_LIMITS = {
  FREE: 10,
  PREMIUM: 100,
} as const;
