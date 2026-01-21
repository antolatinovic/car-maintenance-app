/**
 * CarQuery API Types
 * Types for vehicle makes and models from CarQuery API
 */

/**
 * Vehicle make (brand) from CarQuery API
 */
export interface CarMake {
  make_id: string;
  make_display: string;
  make_country: string;
}

/**
 * Vehicle model from CarQuery API
 */
export interface CarModel {
  model_name: string;
  model_make_id: string;
}

/**
 * API response for getMakes endpoint
 */
export interface CarMakesResponse {
  Makes: CarMake[];
}

/**
 * API response for getModels endpoint
 */
export interface CarModelsResponse {
  Models: CarModel[];
}
