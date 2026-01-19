/**
 * Hook for document scanning with camera and image picker
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface ScannedImage {
  uri: string;
  fileName: string;
  width: number;
  height: number;
}

interface ScannerState {
  isScanning: boolean;
  scannedImage: ScannedImage | null;
  error: string | null;
}

interface UseDocumentScannerReturn extends ScannerState {
  openCamera: () => Promise<ScannedImage | null>;
  openGallery: () => Promise<ScannedImage | null>;
  clearScannedImage: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useDocumentScanner = (): UseDocumentScannerReturn => {
  const [state, setState] = useState<ScannerState>({
    isScanning: false,
    scannedImage: null,
    error: null,
  });

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    // Request camera permission
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "L'acces a la camera est necessaire pour scanner des documents.",
        [{ text: 'OK' }]
      );
      return false;
    }

    // Request media library permission
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "L'acces a la galerie est necessaire pour importer des documents.",
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  }, []);

  const generateFileName = (): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `document_${timestamp}.jpg`;
  };

  const openCamera = useCallback(async (): Promise<ScannedImage | null> => {
    setState(prev => ({ ...prev, isScanning: true, error: null }));

    try {
      // Check permissions first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          "L'acces a la camera est necessaire pour scanner des documents.",
          [{ text: 'OK' }]
        );
        setState(prev => ({ ...prev, isScanning: false }));
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setState(prev => ({ ...prev, isScanning: false }));
        return null;
      }

      const asset = result.assets[0];
      const scannedImage: ScannedImage = {
        uri: asset.uri,
        fileName: asset.fileName || generateFileName(),
        width: asset.width,
        height: asset.height,
      };

      setState({
        isScanning: false,
        scannedImage,
        error: null,
      });

      return scannedImage;
    } catch (error) {
      const errorMessage = "Erreur lors de la capture de l'image";
      setState({
        isScanning: false,
        scannedImage: null,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  const openGallery = useCallback(async (): Promise<ScannedImage | null> => {
    setState(prev => ({ ...prev, isScanning: true, error: null }));

    try {
      // Check permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          "L'acces a la galerie est necessaire pour importer des documents.",
          [{ text: 'OK' }]
        );
        setState(prev => ({ ...prev, isScanning: false }));
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setState(prev => ({ ...prev, isScanning: false }));
        return null;
      }

      const asset = result.assets[0];
      const scannedImage: ScannedImage = {
        uri: asset.uri,
        fileName: asset.fileName || generateFileName(),
        width: asset.width,
        height: asset.height,
      };

      setState({
        isScanning: false,
        scannedImage,
        error: null,
      });

      return scannedImage;
    } catch (error) {
      const errorMessage = "Erreur lors de la selection de l'image";
      setState({
        isScanning: false,
        scannedImage: null,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  const clearScannedImage = useCallback(() => {
    setState({
      isScanning: false,
      scannedImage: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    openCamera,
    openGallery,
    clearScannedImage,
    requestPermissions,
  };
};
