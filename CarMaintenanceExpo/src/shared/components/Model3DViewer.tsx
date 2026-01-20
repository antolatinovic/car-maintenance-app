/**
 * Model3DViewer - Composant pour afficher et manipuler un modèle 3D GLB
 */

import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, PanResponder, ActivityIndicator, Text } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer, THREE, loadAsync } from 'expo-three';
import { colors, spacing, typography } from '@/core/theme';

interface Model3DViewerProps {
  modelSource: number | { uri: string };
  height?: number;
  backgroundColor?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
  modelScale?: number;
  touchSensitivity?: number;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelSource,
  height = 250,
  backgroundColor = 'transparent',
  autoRotate = true,
  rotationSpeed = 0.005,
  modelScale = 3.5,
  touchSensitivity = 0.003,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const modelRef = useRef<THREE.Object3D | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        rotationRef.current.y += gestureState.dx * touchSensitivity;
        rotationRef.current.x += gestureState.dy * touchSensitivity;
      },
    })
  ).current;

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    try {
      // Renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, backgroundColor === 'transparent' ? 0 : 1);
      // Enable sRGB color space for proper texture colors
      if ('outputColorSpace' in renderer) {
        (renderer as unknown as { outputColorSpace: string }).outputColorSpace = THREE.SRGBColorSpace;
      }
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(
        50,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 4;
      cameraRef.current = camera;

      // Lights - increased intensity for better texture visibility
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight2.position.set(-5, -5, -5);
      scene.add(directionalLight2);

      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
      directionalLight3.position.set(0, 5, -5);
      scene.add(directionalLight3);

      // Load model
      await loadModel(scene);

      setIsLoading(false);

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        if (modelRef.current) {
          if (autoRotate) {
            modelRef.current.rotation.y += rotationSpeed;
          }
          modelRef.current.rotation.y = rotationRef.current.y;
          modelRef.current.rotation.x = rotationRef.current.x;
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    } catch (err) {
      console.error('Error creating GL context:', err);
      setError('Erreur lors du chargement de la scène 3D');
      setIsLoading(false);
    }
  };

  const loadModel = async (scene: THREE.Scene) => {
    try {
      // Use expo-three's loadAsync which properly handles textures
      const gltf = await loadAsync(modelSource);
      console.log('GLTF loaded:', gltf);

      // Get the model from the loaded GLTF
      const model = gltf.scene || gltf;
      console.log('Model:', model);

      // Process materials to ensure proper rendering
      let meshCount = 0;
      let textureCount = 0;
      model.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          meshCount++;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material: THREE.MeshStandardMaterial) => {
            console.log('Material:', material.type, 'map:', !!material.map);
            // Ensure textures use correct color space
            if (material.map) {
              textureCount++;
              material.map.colorSpace = THREE.SRGBColorSpace;
              material.map.needsUpdate = true;
            }
            if (material.emissiveMap) {
              material.emissiveMap.colorSpace = THREE.SRGBColorSpace;
              material.emissiveMap.needsUpdate = true;
            }
            // Force material update
            material.needsUpdate = true;
          });
        }
      });
      console.log(`Found ${meshCount} meshes, ${textureCount} textures`);

      // Centrer et mettre à l'échelle le modèle
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = modelScale / maxDim;
      model.scale.setScalar(scale);

      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale;
      model.position.z = -center.z * scale;

      scene.add(model);
      modelRef.current = model;
      rotationRef.current = { x: model.rotation.x, y: model.rotation.y };
    } catch (err) {
      console.error('Error loading model:', err);
      throw err;
    }
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { height, backgroundColor }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height, backgroundColor }]} {...panResponder.panHandlers}>
      {isLoading && (
        <View style={[styles.loadingOverlay, StyleSheet.absoluteFill]}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
          <Text style={styles.loadingText}>Chargement du modèle 3D...</Text>
        </View>
      )}
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glView: {
    flex: 1,
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  errorText: {
    ...typography.body,
    color: colors.accentDanger,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
});
