/**
 * Document Service - CRUD operations for documents
 */

import { File as ExpoFile } from 'expo-file-system';
import { supabase } from '@/core/config/supabase';
import { getSignedStorageUrl } from '@/core/utils/storageUtils';
import type { Document, DocumentType, MaintenanceCategory } from '@/core/types/database';

export interface CreateDocumentData {
  vehicle_id: string;
  type: DocumentType;
  category?: MaintenanceCategory;
  date?: string;
  amount?: number;
  vendor?: string;
  description?: string;
  file_path: string;
  thumbnail_path?: string;
  mileage?: number;
  notes?: string;
}

export interface UpdateDocumentData {
  type?: DocumentType;
  category?: MaintenanceCategory;
  date?: string;
  amount?: number;
  vendor?: string;
  description?: string;
  mileage?: number;
  notes?: string;
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
 * Get all documents for a vehicle
 */
export const getDocuments = async (vehicleId: string): Promise<ServiceResult<Document[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des documents' } };
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (documentId: string): Promise<ServiceResult<Document>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation du document' } };
  }
};

/**
 * Get documents by type
 */
export const getDocumentsByType = async (
  vehicleId: string,
  type: DocumentType
): Promise<ServiceResult<Document[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('type', type)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des documents' } };
  }
};

/**
 * Create a new document
 */
export const createDocument = async (
  documentData: CreateDocumentData
): Promise<ServiceResult<Document>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(documentData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation du document' } };
  }
};

/**
 * Update a document
 */
export const updateDocument = async (
  documentId: string,
  updates: UpdateDocumentData
): Promise<ServiceResult<Document>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .update(updates as never)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour du document' } };
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Get the document first to delete the file
    const { data: documentData } = await supabase
      .from('documents')
      .select('file_path, thumbnail_path')
      .eq('id', documentId)
      .single();

    const doc = documentData as { file_path: string; thumbnail_path: string | null } | null;

    // Delete from database
    const { error } = await supabase.from('documents').delete().eq('id', documentId);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    // Try to delete files from storage (non-blocking)
    if (doc) {
      const filesToDelete = [doc.file_path];
      if (doc.thumbnail_path) {
        filesToDelete.push(doc.thumbnail_path);
      }
      supabase.storage.from('documents').remove(filesToDelete).catch(console.error);
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression du document' } };
  }
};

/**
 * Upload a document file to storage
 */
export const uploadDocumentFile = async (
  vehicleId: string,
  fileUri: string,
  fileName: string
): Promise<ServiceResult<string>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Create unique file path
    const timestamp = Date.now();
    const filePath = `${user.id}/${vehicleId}/${timestamp}_${fileName}`;

    // Read file as ArrayBuffer using expo-file-system (reliable in React Native)
    const file = new ExpoFile(fileUri);
    const arrayBuffer = await file.arrayBuffer();

    // Detect content type from file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentType =
      ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: { message: uploadError.message } };
    }

    return { data: filePath, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors du telechargement du fichier' } };
  }
};

/**
 * Get signed URL for a document file (private bucket)
 */
export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  return getSignedStorageUrl('documents', filePath);
};

/**
 * Get documents grouped by type
 */
export const getDocumentsGroupedByType = async (
  vehicleId: string
): Promise<ServiceResult<Record<DocumentType, Document[]>>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    // Group documents by type
    const grouped: Record<DocumentType, Document[]> = {
      insurance: [],
      registration: [],
      license: [],
      inspection: [],
      invoice: [],
      fuel_receipt: [],
      maintenance: [],
      other: [],
    };

    (data as Document[]).forEach(doc => {
      if (grouped[doc.type]) {
        grouped[doc.type].push(doc);
      } else {
        grouped.other.push(doc);
      }
    });

    return { data: grouped, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des documents' } };
  }
};

/**
 * Search documents by description or vendor
 */
export const searchDocuments = async (
  vehicleId: string,
  query: string
): Promise<ServiceResult<Document[]>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const searchTerm = `%${query.toLowerCase()}%`;

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .or(`description.ilike.${searchTerm},vendor.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      .order('date', { ascending: false, nullsFirst: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Document[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recherche' } };
  }
};
