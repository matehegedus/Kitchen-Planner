'use client';

import { Suspense, useEffect, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import { useSceneStore, initializeDefaultRoom } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { getAssetById } from '@/src/domains/asset';
import { calculateSnappedPosition } from '@/src/domains/scene/services/SnapService';
import { checkCollision, findNearestValidPosition } from '@/src/domains/scene/services/CollisionService';
import type { Position3D } from '@/src/domains/shared/types';
import { Room3D } from './Room3D';
import { PlacedAssets } from './PlacedAssets';
import { MeasurementOverlay } from './MeasurementOverlay';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-8" />
        <span className="text-sm text-muted-foreground">Loading scene...</span>
      </div>
    </Html>
  );
}

export function KitchenCanvas() {
  const scene = useSceneStore((state) => state.scene);
  const placeAsset = useSceneStore((state) => state.placeAsset);
  const getAssetLibrary = useSceneStore((state) => state.getAssetLibrary);
  const showGrid = useUIStore((state) => state.showGrid);
  const showMeasurements = useUIStore((state) => state.showMeasurements);
  const isDragging = useUIStore((state) => state.isDragging);
  const dragAssetType = useUIStore((state) => state.dragAssetType);
  const isDraggingSceneAsset = useUIStore((state) => state.isDraggingSceneAsset);
  const endDrag = useUIStore((state) => state.endDrag);
  const selectAsset = useUIStore((state) => state.selectAsset);
  
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize room on mount if needed
  useEffect(() => {
    initializeDefaultRoom();
  }, []);

  // Handle HTML5 drop event on the canvas container
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const assetId = e.dataTransfer.getData('assetId') || dragAssetType;
      if (!assetId || !scene) {
        endDrag();
        return;
      }

      const asset = getAssetById(assetId);
      if (!asset) {
        endDrag();
        return;
      }

      // Place at center of room initially (NW corner origin)
      const initialPosition: Position3D = {
        x: scene.room.dimensions.width / 2,
        y: asset.dimensions.height / 2,
        z: scene.room.dimensions.depth / 2,
      };

      // Apply snapping
      const snapResult = calculateSnappedPosition(
        initialPosition,
        asset,
        scene.room
      );

      // Check collision
      const assetLibrary = getAssetLibrary();
      const collision = checkCollision(
        snapResult.position,
        asset.dimensions,
        scene.placedAssets,
        assetLibrary
      );

      let finalPosition = snapResult.position;

      if (collision.collides) {
        // Try to find a valid position nearby
        const validPosition = findNearestValidPosition(
          snapResult.position,
          asset.dimensions,
          scene.placedAssets,
          assetLibrary,
          scene.room
        );

        if (validPosition) {
          finalPosition = validPosition;
        }
        // Even if no valid position, still place it (user can move it)
      }

      // Place the asset
      const placedAssetId = placeAsset(assetId, finalPosition);
      
      // Select the newly placed asset
      if (placedAssetId) {
        selectAsset(placedAssetId);
      }

      endDrag();
    },
    [scene, dragAssetType, placeAsset, getAssetLibrary, endDrag, selectAsset]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <Spinner className="size-8" />
      </div>
    );
  }

  const { width, depth } = scene.room.dimensions;
  const cameraDistance = Math.max(width, depth) * 1.5;
  // Camera target: center of room (NW corner origin)
  const cameraTarget: [number, number, number] = [width / 2, 0, depth / 2];

  return (
    <div 
      className="relative h-full w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drop overlay */}
      {(isDragging || isDragOver) && (
        <div className={cn(
          "absolute inset-0 z-10 pointer-events-none",
          "flex items-center justify-center",
          "bg-primary/10 border-2 border-dashed border-primary rounded-lg",
          "transition-opacity duration-200"
        )}>
          <div className="bg-background/90 px-6 py-3 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-primary">Drop to place in scene</p>
          </div>
        </div>
      )}
      
      <Canvas
        camera={{
          position: [width / 2 + cameraDistance, cameraDistance * 0.8, depth / 2 + cameraDistance],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#f5f5f5' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          {/* Environment for reflections */}
          <Environment preset="apartment" />

          {/* Room */}
          <Room3D room={scene.room} />

          {/* Placed assets */}
          <PlacedAssets />

          {/* Grid helper - centered on room */}
          {showGrid && (
            <Grid
              args={[width * 2, depth * 2]}
              position={[width / 2, 0.001, depth / 2]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#a0a0a0"
              sectionSize={1}
              sectionThickness={1}
              sectionColor="#808080"
              fadeDistance={Math.max(width, depth) * 2}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />
          )}

          {/* Camera controls - disabled when dragging assets in scene */}
          <OrbitControls
            makeDefault
            enabled={!isDraggingSceneAsset}
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={1}
            maxDistance={Math.max(width, depth) * 3}
            target={cameraTarget}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Measurement overlay */}
      {showMeasurements && <MeasurementOverlay room={scene.room} />}
    </div>
  );
}
