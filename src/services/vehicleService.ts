/**
 * Vehicle Service - CRUD operations for vehicles
 */

import { supabase } from '@/core/config/supabase';
import type { Vehicle } from '@/core/types/database';

export interface CreateVehicleData {
  brand: string;
  model: string;
  year?: number;
  registration_plate?: string;
  vin?: string;
  purchase_date?: string;
  purchase_price?: number;
  purchase_mileage?: number;
  current_mileage?: number;
  fuel_type?: Vehicle['fuel_type'];
  engine?: string;
  transmission?: Vehicle['transmission'];
  body_type?: string;
  color?: string;
  seats?: number;
  photo_url?: string;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  is_primary?: boolean;
}

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

/**
 * Get all vehicles for the current user
 */
export const getVehicles = async (): Promise<ServiceResult<Vehicle[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Vehicle[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des vehicules' } };
  }
};

/**
 * Get a single vehicle by ID
 */
export const getVehicle = async (vehicleId: string): Promise<ServiceResult<Vehicle>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Vehicle, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation du vehicule' } };
  }
};

/**
 * Get the primary vehicle for the current user
 */
export const getPrimaryVehicle = async (): Promise<ServiceResult<Vehicle>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (error) {
      // No primary vehicle, try to get the first one
      const { data: firstVehicle, error: firstError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstError) {
        return { data: null, error: null }; // No vehicle at all
      }

      return { data: firstVehicle as Vehicle, error: null };
    }

    return { data: data as Vehicle, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation du vehicule' } };
  }
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (
  vehicleData: CreateVehicleData
): Promise<ServiceResult<Vehicle>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Check if this is the first vehicle (make it primary)
    const { data: existingVehicles } = await supabase
      .from('vehicles')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    const isFirstVehicle = !existingVehicles || existingVehicles.length === 0;

    const insertData = {
      ...vehicleData,
      user_id: user.id,
      is_primary: isFirstVehicle,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Vehicle, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation du vehicule' } };
  }
};

/**
 * Update a vehicle
 */
export const updateVehicle = async (
  vehicleId: string,
  updates: UpdateVehicleData
): Promise<ServiceResult<Vehicle>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // If setting as primary, unset other vehicles first
    if (updates.is_primary) {
      await supabase
        .from('vehicles')
        .update({ is_primary: false } as never)
        .eq('user_id', user.id)
        .neq('id', vehicleId);
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update(updates as never)
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Vehicle, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour du vehicule' } };
  }
};

/**
 * Update vehicle mileage
 */
export const updateMileage = async (
  vehicleId: string,
  mileage: number
): Promise<ServiceResult<Vehicle>> => {
  return updateVehicle(vehicleId, { current_mileage: mileage });
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (vehicleId: string): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression du vehicule' } };
  }
};
