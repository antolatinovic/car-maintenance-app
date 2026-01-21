/**
 * Database types for Supabase
 * Auto-generated types based on database schema
 */

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';
export type MaintenanceCategory =
  | 'oil_change'
  | 'brakes'
  | 'filters'
  | 'tires'
  | 'mechanical'
  | 'revision'
  | 'ac'
  | 'custom';
export type ReminderType = 'date' | 'mileage' | 'both';
export type RecurrenceType = 'none' | 'monthly' | 'yearly' | 'km_based';
export type ScheduleStatus = 'pending' | 'completed' | 'overdue';
export type DocumentType = 'invoice' | 'fuel_receipt' | 'insurance' | 'administrative' | 'other';
export type ExpenseType =
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'parking'
  | 'tolls'
  | 'fines'
  | 'other';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_premium: boolean;
  premium_expires_at: string | null;
  ai_requests_count: number;
  ai_requests_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  registration_plate: string | null;
  vin: string | null;
  year: number | null;
  purchase_date: string | null;
  purchase_price: number | null;
  purchase_mileage: number | null;
  current_mileage: number | null;
  fuel_type: FuelType | null;
  engine: string | null;
  transmission: TransmissionType | null;
  body_type: string | null;
  color: string | null;
  seats: number | null;
  photo_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceHistory {
  id: string;
  vehicle_id: string;
  category: MaintenanceCategory;
  subcategory: string | null;
  date: string;
  mileage: number | null;
  cost: number | null;
  description: string | null;
  location: string | null;
  invoice_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  category: MaintenanceCategory;
  subcategory: string | null;
  description: string | null;
  reminder_type: ReminderType;
  due_date: string | null;
  due_mileage: number | null;
  notification_advance_days: number;
  notification_advance_km: number;
  recurrence_type: RecurrenceType;
  recurrence_value: number | null;
  estimated_cost: number | null;
  location: string | null;
  notes: string | null;
  status: ScheduleStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  vehicle_id: string;
  type: DocumentType;
  category: MaintenanceCategory | null;
  date: string | null;
  amount: number | null;
  vendor: string | null;
  description: string | null;
  file_path: string;
  thumbnail_path: string | null;
  ocr_data: Record<string, unknown> | null;
  mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  vehicle_id: string;
  type: ExpenseType;
  date: string;
  amount: number;
  mileage: number | null;
  description: string | null;
  document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notification_enabled: boolean;
  notification_time_start: string;
  notification_time_end: string;
  notification_categories: string[];
  mileage_unit: 'km' | 'miles';
  currency: string;
  language: string;
  theme: 'dark' | 'light' | 'auto';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  document_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Partial<Vehicle> & { user_id: string; brand: string; model: string };
        Update: Partial<Vehicle>;
      };
      maintenance_history: {
        Row: MaintenanceHistory;
        Insert: Partial<MaintenanceHistory> & {
          vehicle_id: string;
          category: MaintenanceCategory;
          date: string;
        };
        Update: Partial<MaintenanceHistory>;
      };
      maintenance_schedule: {
        Row: MaintenanceSchedule;
        Insert: Partial<MaintenanceSchedule> & {
          vehicle_id: string;
          category: MaintenanceCategory;
        };
        Update: Partial<MaintenanceSchedule>;
      };
      documents: {
        Row: Document;
        Insert: Partial<Document> & { vehicle_id: string; type: DocumentType; file_path: string };
        Update: Partial<Document>;
      };
      expenses: {
        Row: Expense;
        Insert: Partial<Expense> & {
          vehicle_id: string;
          type: ExpenseType;
          date: string;
          amount: number;
        };
        Update: Partial<Expense>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings> & { user_id: string };
        Update: Partial<UserSettings>;
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & { user_id: string };
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & { conversation_id: string; role: MessageRole; content: string };
        Update: Partial<Message>;
      };
    };
  };
}
