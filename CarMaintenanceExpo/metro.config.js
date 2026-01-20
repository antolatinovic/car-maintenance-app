const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support des fichiers GLB/GLTF pour les modèles 3D
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;
