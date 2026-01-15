-- ============================================
-- Car Maintenance App - Supabase Database Schema
-- Based on PRD Section 4.1
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic');
CREATE TYPE maintenance_category AS ENUM ('oil_change', 'brakes', 'filters', 'tires', 'mechanical', 'revision', 'ac', 'custom');
CREATE TYPE reminder_type AS ENUM ('date', 'mileage', 'both');
CREATE TYPE recurrence_type AS ENUM ('none', 'monthly', 'yearly', 'km_based');
CREATE TYPE schedule_status AS ENUM ('pending', 'completed', 'overdue');
CREATE TYPE document_type AS ENUM ('invoice', 'fuel_receipt', 'insurance', 'administrative', 'other');
CREATE TYPE expense_type AS ENUM ('fuel', 'maintenance', 'insurance', 'parking', 'tolls', 'fines', 'other');
CREATE TYPE theme_type AS ENUM ('dark', 'light', 'auto');
CREATE TYPE mileage_unit AS ENUM ('km', 'miles');

-- ============================================
-- USERS Table (extends Supabase Auth)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    ai_requests_count INTEGER DEFAULT 0,
    ai_requests_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VEHICLES Table
-- ============================================

CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    registration_plate VARCHAR(20),
    vin VARCHAR(17),
    year INTEGER,
    purchase_date DATE,
    purchase_price DECIMAL(12, 2),
    purchase_mileage INTEGER,
    current_mileage INTEGER,
    fuel_type fuel_type,
    engine VARCHAR(100),
    transmission transmission_type,
    body_type VARCHAR(50),
    color VARCHAR(50),
    seats INTEGER,
    photo_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user vehicle lookup
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);

-- ============================================
-- MAINTENANCE_HISTORY Table
-- ============================================

CREATE TABLE public.maintenance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    category maintenance_category NOT NULL,
    subcategory VARCHAR(100),
    date DATE NOT NULL,
    mileage INTEGER,
    cost DECIMAL(10, 2),
    description TEXT,
    location VARCHAR(200),
    invoice_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster vehicle maintenance lookup
CREATE INDEX idx_maintenance_history_vehicle_id ON public.maintenance_history(vehicle_id);
CREATE INDEX idx_maintenance_history_date ON public.maintenance_history(date DESC);

-- ============================================
-- MAINTENANCE_SCHEDULE Table
-- ============================================

CREATE TABLE public.maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    category maintenance_category NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    reminder_type reminder_type NOT NULL DEFAULT 'date',
    due_date DATE,
    due_mileage INTEGER,
    notification_advance_days INTEGER DEFAULT 7,
    notification_advance_km INTEGER DEFAULT 500,
    recurrence_type recurrence_type DEFAULT 'none',
    recurrence_value INTEGER,
    estimated_cost DECIMAL(10, 2),
    location VARCHAR(200),
    notes TEXT,
    status schedule_status DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster vehicle schedule lookup
CREATE INDEX idx_maintenance_schedule_vehicle_id ON public.maintenance_schedule(vehicle_id);
CREATE INDEX idx_maintenance_schedule_status ON public.maintenance_schedule(status);
CREATE INDEX idx_maintenance_schedule_due_date ON public.maintenance_schedule(due_date);

-- ============================================
-- DOCUMENTS Table
-- ============================================

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type document_type NOT NULL,
    category maintenance_category,
    date DATE,
    amount DECIMAL(10, 2),
    vendor VARCHAR(200),
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    ocr_data JSONB,
    mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster vehicle document lookup
CREATE INDEX idx_documents_vehicle_id ON public.documents(vehicle_id);
CREATE INDEX idx_documents_type ON public.documents(type);
CREATE INDEX idx_documents_date ON public.documents(date DESC);

-- Add foreign key reference from maintenance_history to documents
ALTER TABLE public.maintenance_history
ADD CONSTRAINT fk_maintenance_history_invoice
FOREIGN KEY (invoice_id) REFERENCES public.documents(id) ON DELETE SET NULL;

-- ============================================
-- EXPENSES Table
-- ============================================

CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type expense_type NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mileage INTEGER,
    description TEXT,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster vehicle expense lookup
CREATE INDEX idx_expenses_vehicle_id ON public.expenses(vehicle_id);
CREATE INDEX idx_expenses_type ON public.expenses(type);
CREATE INDEX idx_expenses_date ON public.expenses(date DESC);

-- ============================================
-- AI_CHAT_HISTORY Table
-- ============================================

CREATE TABLE public.ai_chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user chat history lookup
CREATE INDEX idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);

-- ============================================
-- USER_SETTINGS Table
-- ============================================

CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    notification_time_start TIME DEFAULT '08:00:00',
    notification_time_end TIME DEFAULT '20:00:00',
    notification_categories JSONB DEFAULT '["oil_change", "brakes", "revision"]'::jsonb,
    mileage_unit mileage_unit DEFAULT 'km',
    currency VARCHAR(3) DEFAULT 'EUR',
    language VARCHAR(5) DEFAULT 'fr',
    theme theme_type DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can view own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles" ON public.vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- Maintenance history policies
CREATE POLICY "Users can view own maintenance history" ON public.maintenance_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_history.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own maintenance history" ON public.maintenance_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_history.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own maintenance history" ON public.maintenance_history
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_history.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own maintenance history" ON public.maintenance_history
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_history.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

-- Maintenance schedule policies
CREATE POLICY "Users can view own maintenance schedule" ON public.maintenance_schedule
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_schedule.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own maintenance schedule" ON public.maintenance_schedule
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_schedule.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own maintenance schedule" ON public.maintenance_schedule
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_schedule.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own maintenance schedule" ON public.maintenance_schedule
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = maintenance_schedule.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = documents.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = documents.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = documents.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = documents.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = expenses.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = expenses.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = expenses.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vehicles
            WHERE vehicles.id = expenses.vehicle_id
            AND vehicles.user_id = auth.uid()
        )
    );

-- AI chat history policies
CREATE POLICY "Users can view own chat history" ON public.ai_chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.ai_chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_history_updated_at
    BEFORE UPDATE ON public.maintenance_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_schedule_updated_at
    BEFORE UPDATE ON public.maintenance_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to ensure only one primary vehicle per user (for free tier)
CREATE OR REPLACE FUNCTION ensure_single_primary_vehicle()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE public.vehicles
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_vehicle_trigger
    BEFORE INSERT OR UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_vehicle();

-- Function to calculate budget summaries
CREATE OR REPLACE FUNCTION get_budget_summary(p_vehicle_id UUID, p_start_date DATE DEFAULT NULL, p_end_date DATE DEFAULT NULL)
RETURNS TABLE (
    expense_type expense_type,
    total_amount DECIMAL(12, 2),
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.type,
        COALESCE(SUM(e.amount), 0)::DECIMAL(12, 2),
        COUNT(*)
    FROM public.expenses e
    WHERE e.vehicle_id = p_vehicle_id
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
    GROUP BY e.type;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Storage Buckets Configuration
-- ============================================

-- Note: Run these in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('vehicle-photos', 'vehicle-photos', true);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false);

-- Storage policies would be:
-- CREATE POLICY "Users can upload own vehicle photos" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'vehicle-photos' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );
