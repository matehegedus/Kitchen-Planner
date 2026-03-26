'use client';

import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Room } from '@/src/domains/room';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { getAssetById } from '@/src/domains/asset';
import { calculateSnappedPosition } from '@/src/domains/scene/services/SnapService';
import { checkCollision, findNearestValidPosition } from '@/src/domains/scene/services/CollisionService';
import type { Position3D } from '@/src/domains/shared/types';

interface DropZoneProps {
  room: Room;
}

export function DropZone({ room }: DropZoneProps) {
  const planeRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster } = useThree();

  const scene = useSceneStore((state) => state.scene);
  const placeAsset = useSceneStore((state) => state.placeAsset);
  const getAssetLibrary = useSceneStore((state) => state.getAssetLibrary);
  
  const isDragging = useUIStore((state) => state.isDragging);
  const dragAssetType = useUIStore((state) => state.dragAssetType);
  const endDrag = useUIStore((state) => state.endDrag);
  const selectAsset = useUIStore((state) => state.selectAsset);

  const { width, depth } = room.dimensions;

  const handlePointerUp = useCallback(
    (e: THREE.Event & { point?: THREE.Vector3 }) => {
      if (!isDragging || !dragAssetType || !scene) return;

      const asset = getAssetById(dragAssetType);
      if (!asset || !e.point) return;

      // Calculate position from intersection point
      const intersectionPoint: Position3D = {
        x: e.point.x,
        y: asset.dimensions.height / 2, // Place on floor
        z: e.point.z,
      };

      // Apply snapping
      const snapResult = calculateSnappedPosition(
        intersectionPoint,
        asset,
        room
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
          room
        );

        if (!validPosition) {
          // Cannot place asset
          endDrag();
          return;
        }
        finalPosition = validPosition;
      }

      // Place the asset
      const placedAssetId = placeAsset(dragAssetType, finalPosition);
      
      // Select the newly placed asset
      if (placedAssetId) {
        selectAsset(placedAssetId);
      }

      endDrag();
    },
    [isDragging, dragAssetType, scene, room, placeAsset, getAssetLibrary, endDrag, selectAsset]
  );

  return (
    <mesh
      ref={planeRef}
      position={[0, 0.002, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerUp={handlePointerUp}
      visible={false}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
