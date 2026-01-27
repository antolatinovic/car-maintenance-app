/**
 * Documents screen - Complete redesign with quick access and sections
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

const documentsIcon = require('../../../assets/documents-icon.png');
import { getPrimaryVehicle } from '@/services/vehicleService';
import { useDocuments, useDocumentScanner } from './hooks';
import {
  DocumentScanner,
  DocumentForm,
  DocumentViewer,
  QuickAccessCards,
  DocumentSection,
} from './components';
import type { Document, DocumentType } from '@/core/types/database';
import type { ScannedImage } from './hooks/useDocumentScanner';
import type { CreateDocumentData } from '@/services/documentService';

type ScreenMode = 'list' | 'scanner' | 'form' | 'viewer';

// Document types to show in sections (in order)
const sectionTypes: DocumentType[] = [
  'invoice',
  'fuel_receipt',
  'insurance',
  'registration',
  'license',
  'inspection',
  'maintenance',
  'other',
];

const typeLabels: Record<DocumentType, string> = {
  insurance: 'assurance',
  registration: 'carte grise',
  license: 'permis',
  inspection: 'controle technique',
  invoice: 'facture',
  fuel_receipt: 'carburant',
  maintenance: 'entretien',
  other: 'autre',
};

const formatDateForSearch = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const monthIndex = date.getMonth();
  const year = date.getFullYear().toString();
  const monthNames = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
  ];
  const monthNum = (monthIndex + 1).toString().padStart(2, '0');
  return `${day}/${monthNum}/${year} ${day} ${monthNames[monthIndex]} ${year}`;
};

export const DocumentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [scannedImage, setScannedImage] = useState<ScannedImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [preselectedType, setPreselectedType] = useState<DocumentType | undefined>();

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

  const { documents, isLoading, refresh, addDocument, removeDocument } = useDocuments(vehicleId);
  const scanner = useDocumentScanner();

  // Group documents by type
  const groupedDocuments = useMemo(() => {
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

    const query = searchQuery.toLowerCase().trim();

    documents.forEach(doc => {
      // Apply search filter
      if (query) {
        const matchesSearch =
          doc.description?.toLowerCase().includes(query) ||
          doc.vendor?.toLowerCase().includes(query) ||
          doc.notes?.toLowerCase().includes(query) ||
          typeLabels[doc.type]?.includes(query) ||
          doc.amount?.toString().includes(query) ||
          (doc.date && formatDateForSearch(doc.date).includes(query));
        if (!matchesSearch) return;
      }

      if (grouped[doc.type]) {
        grouped[doc.type].push(doc);
      } else {
        grouped.other.push(doc);
      }
    });

    return grouped;
  }, [documents, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return Object.values(groupedDocuments).reduce((sum, docs) => sum + docs.length, 0);
  }, [groupedDocuments]);

  const handleAddPress = useCallback(() => {
    setPreselectedType(undefined);
    setMode('scanner');
  }, []);

  const handleAddWithType = useCallback((type: DocumentType) => {
    setPreselectedType(type);
    setMode('scanner');
  }, []);

  const handleScanComplete = useCallback((image: ScannedImage) => {
    setScannedImage(image);
    setMode('form');
  }, []);

  const handleScanCancel = useCallback(() => {
    setMode('list');
    setPreselectedType(undefined);
    scanner.clearScannedImage();
  }, [scanner]);

  const handleFormSubmit = useCallback(
    async (data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'>) => {
      if (!scannedImage) return;

      const result = await addDocument(scannedImage.uri, scannedImage.fileName, data);

      if (result.document) {
        setScannedImage(null);
        setPreselectedType(undefined);
        setMode('list');
        scanner.clearScannedImage();
      } else {
        Alert.alert('Erreur', result.error || "Impossible d'enregistrer le document.");
      }
    },
    [scannedImage, addDocument, scanner]
  );

  const handleFormCancel = useCallback(() => {
    setScannedImage(null);
    setPreselectedType(undefined);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  // Loading vehicle
  if (vehicleLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <Text style={styles.title}>Documents</Text>
        </View>
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
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <Text style={styles.title}>Documents</Text>
        </View>
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
        defaultType={preselectedType}
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
  const renderSearchBar = () => {
    const searchContent = (
      <>
        <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un document..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </>
    );

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.searchWrapper}>
          <BlurView intensity={20} tint="light" style={styles.searchBlur}>
            <View style={styles.searchContent}>{searchContent}</View>
          </BlurView>
        </View>
      );
    }

    return <View style={[styles.searchWrapper, styles.searchAndroid]}>{searchContent}</View>;
  };

  const hasAnyDocuments = documents.length > 0;
  const hasFilteredDocuments = totalFilteredCount > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Documents</Text>
              <Text style={styles.subtitle}>
                {searchQuery.trim()
                  ? `${totalFilteredCount} resultat${totalFilteredCount !== 1 ? 's' : ''}`
                  : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButtonWrapper}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={25} tint="light" style={styles.addButtonBlur}>
                  <Ionicons name="add" size={24} color={colors.accentPrimary} />
                </BlurView>
              ) : (
                <View style={styles.addButtonAndroid}>
                  <Ionicons name="add" size={24} color={colors.accentPrimary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Access Cards */}
        <QuickAccessCards
          documents={groupedDocuments}
          onDocumentPress={handleDocumentPress}
          onAddPress={handleAddWithType}
        />

        {/* Search Bar */}
        <View style={styles.searchSection}>{renderSearchBar()}</View>

        {/* Document Sections or Empty State */}
        {hasAnyDocuments ? (
          hasFilteredDocuments ? (
            <View style={styles.sectionsContainer}>
              {sectionTypes.map(type => (
                <DocumentSection
                  key={type}
                  type={type}
                  documents={groupedDocuments[type]}
                  onDocumentPress={handleDocumentPress}
                  onDocumentLongPress={handleDocumentLongPress}
                  defaultExpanded={groupedDocuments[type].length > 0}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptySearchContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptySearchTitle}>Aucun resultat</Text>
              <Text style={styles.emptySearchText}>
                Aucun document ne correspond a "{searchQuery}"
              </Text>
              <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>Effacer la recherche</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Scannez vos factures, cartes grises et autres documents pour les conserver
            </Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={handleAddPress}>
              <Ionicons name="add" size={20} color={colors.textOnColor} />
              <Text style={styles.addFirstText}>Ajouter un document</Text>
            </TouchableOpacity>
            <View style={styles.emptyIconContainer}>
              <Image
                source={documentsIcon}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
            </View>
          </View>
        )}

        {/* Bottom padding for tab bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.l,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButtonAndroid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
  searchSection: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.l,
  },
  searchWrapper: {
    borderRadius: spacing.inputRadius,
    overflow: 'hidden',
  },
  searchBlur: {
    borderRadius: spacing.inputRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    gap: spacing.s,
  },
  searchAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: spacing.s,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  sectionsContainer: {
    paddingTop: spacing.s,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
    gap: spacing.s,
  },
  addFirstText: {
    ...typography.bodySemiBold,
    color: colors.textOnColor,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.accentPrimary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  emptyIcon: {
    width: 52,
    height: 52,
  },
  emptySearchContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl,
  },
  emptySearchTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  emptySearchText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  clearSearchText: {
    ...typography.bodySemiBold,
    color: colors.accentPrimary,
  },
  bottomPadding: {
    height: spacing.tabBarHeight + spacing.xl,
  },
});
