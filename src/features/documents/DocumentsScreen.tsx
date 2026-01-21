/**
 * Documents screen - main entry point for document management
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { getPrimaryVehicle } from '@/services/vehicleService';
import { useDocuments, useDocumentScanner, useDocumentSearch } from './hooks';
import {
  DocumentsHeader,
  DocumentFilters,
  DocumentList,
  DocumentScanner,
  DocumentForm,
  DocumentViewer,
} from './components';
import type { Document } from '@/core/types/database';
import type { ScannedImage } from './hooks/useDocumentScanner';
import type { CreateDocumentData } from '@/services/documentService';

type ScreenMode = 'list' | 'scanner' | 'form' | 'viewer';

export const DocumentsScreen: React.FC = () => {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);

  // Fetch primary vehicle on mount
  useEffect(() => {
    const fetchVehicle = async () => {
      setVehicleLoading(true);
      const result = await getPrimaryVehicle();
      if (result.data) {
        setVehicleId(result.data.id);
      }
      setVehicleLoading(false);
    };
    fetchVehicle();
  }, []);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [scannedImage, setScannedImage] = useState<ScannedImage | null>(null);

  const { documents, isLoading, refresh, addDocument, removeDocument } = useDocuments(vehicleId);

  const {
    filters,
    setSearchQuery,
    setTypeFilter,
    clearFilters,
    filterDocuments,
    hasActiveFilters,
  } = useDocumentSearch();

  const scanner = useDocumentScanner();

  const filteredDocuments = useMemo(() => filterDocuments(documents), [documents, filterDocuments]);

  const handleAddPress = useCallback(() => {
    setMode('scanner');
  }, []);

  const handleScanComplete = useCallback((image: ScannedImage) => {
    setScannedImage(image);
    setMode('form');
  }, []);

  const handleScanCancel = useCallback(() => {
    setMode('list');
    scanner.clearScannedImage();
  }, [scanner]);

  const handleFormSubmit = useCallback(
    async (data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'>) => {
      if (!scannedImage) return;

      const result = await addDocument(scannedImage.uri, scannedImage.fileName, data);

      if (result) {
        setScannedImage(null);
        setMode('list');
        scanner.clearScannedImage();
      }
    },
    [scannedImage, addDocument, scanner]
  );

  const handleFormCancel = useCallback(() => {
    setScannedImage(null);
    setMode('list');
    scanner.clearScannedImage();
  }, [scanner]);

  const handleDocumentPress = useCallback((document: Document) => {
    setSelectedDocument(document);
    setMode('viewer');
  }, []);

  const handleDocumentLongPress = useCallback(
    (document: Document) => {
      Alert.alert('Supprimer le document', 'Etes-vous sur de vouloir supprimer ce document ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await removeDocument(document.id);
          },
        },
      ]);
    },
    [removeDocument]
  );

  const handleViewerClose = useCallback(() => {
    setSelectedDocument(null);
    setMode('list');
  }, []);

  const handleViewerDelete = useCallback(async () => {
    if (!selectedDocument) return;

    Alert.alert('Supprimer le document', 'Etes-vous sur de vouloir supprimer ce document ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeDocument(selectedDocument.id);
          setSelectedDocument(null);
          setMode('list');
        },
      },
    ]);
  }, [selectedDocument, removeDocument]);

  // Loading vehicle
  if (vehicleLoading) {
    return (
      <View style={styles.container}>
        <DocumentsHeader
          searchQuery=""
          onSearchChange={() => {}}
          onAddPress={() => {}}
          documentCount={0}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </View>
    );
  }

  // No vehicle - show message
  if (!vehicleId) {
    return (
      <View style={styles.container}>
        <DocumentsHeader
          searchQuery=""
          onSearchChange={() => {}}
          onAddPress={() => {}}
          documentCount={0}
        />
        <View style={styles.centerContent}>
          <View style={styles.noVehicleIcon}>
            <Ionicons name="car-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.noVehicleTitle}>Aucun vehicule</Text>
          <Text style={styles.noVehicleText}>
            Ajoutez un vehicule depuis l'ecran d'accueil pour gerer vos documents
          </Text>
        </View>
      </View>
    );
  }

  // Scanner mode
  if (mode === 'scanner') {
    return <DocumentScanner onScanComplete={handleScanComplete} onCancel={handleScanCancel} />;
  }

  // Form mode
  if (mode === 'form' && scannedImage) {
    return (
      <DocumentForm
        imageUri={scannedImage.uri}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  // Viewer mode
  if (mode === 'viewer' && selectedDocument) {
    return (
      <DocumentViewer
        document={selectedDocument}
        onClose={handleViewerClose}
        onDelete={handleViewerDelete}
      />
    );
  }

  // List mode (default)
  return (
    <View style={styles.container}>
      <DocumentsHeader
        searchQuery={filters.query}
        onSearchChange={setSearchQuery}
        onAddPress={handleAddPress}
        documentCount={filteredDocuments.length}
      />

      <DocumentList
        documents={filteredDocuments}
        isLoading={isLoading}
        hasFilters={hasActiveFilters}
        onDocumentPress={handleDocumentPress}
        onDocumentLongPress={handleDocumentLongPress}
        onRefresh={refresh}
        onAddDocument={handleAddPress}
        onClearFilters={clearFilters}
        ListHeaderComponent={
          <DocumentFilters selectedType={filters.type} onSelectType={setTypeFilter} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  noVehicleIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  noVehicleTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  noVehicleText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
