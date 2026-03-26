'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlacedAsset } from '@/src/domains/asset';
import { getAssetById } from '@/src/domains/asset';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { calculateSnappedPosition } from '@/src/domains/scene/services/SnapService';
import { checkCollision, clampToRoomBounds } from '@/src/domains/scene/services/CollisionService';
import type { Position3D } from '@/src/domains/shared/types';

// Round a value to the nearest step
function snapToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

interface DraggableAssetProps {
  placedAsset: PlacedAsset;
}

export function DraggableAsset({ placedAsset }: DraggableAssetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasCollision, setHasCollision] = useState(false);
  
  const { camera, gl, raycaster } = useThree();
  
  const scene = useSceneStore((state) => state.scene);
  const moveAsset = useSceneStore((state) => state.moveAsset);
  const removeAsset = useSceneStore((state) => state.removeAsset);
  const getAssetLibrary = useSceneStore((state) => state.getAssetLibrary);
  
  const selectedAssetId = useUIStore((state) => state.selectedAssetId);
  const selectAsset = useUIStore((state) => state.selectAsset);
  const movementStep = useUIStore((state) => state.movementStep);
  const startSceneDrag = useUIStore((state) => state.startSceneDrag);
  const endSceneDrag = useUIStore((state) => state.endSceneDrag);

  const asset = useMemo(() => getAssetById(placedAsset.assetId), [placedAsset.assetId]);
  
  const isSelected = selectedAssetId === placedAsset.id;

  // Create material based on texture
  const material = useMemo(() => {
    const { texture } = placedAsset;
    return new THREE.MeshStandardMaterial({
      color: texture.color,
      roughness: texture.roughness ?? 0.5,
      metalness: texture.metalness ?? 0,
    });
  }, [placedAsset.texture]);

  // Highlight material for selection/hover
  const highlightColor = useMemo(() => {
    if (hasCollision) return '#ff4444';
    if (isDragging) return '#4488ff';
    if (isSelected) return '#44ff88';
    if (isHovered) return '#88aaff';
    return null;
  }, [hasCollision, isDragging, isSelected, isHovered]);

  // Store original position for reverting on collision
  const originalPositionRef = useRef<Position3D | null>(null);

  const handlePointerDown = useCallback(
    (e: THREE.Event & { stopPropagation: () => void }) => {
      e.stopPropagation();
      selectAsset(placedAsset.id);
      setIsDragging(true);
      startSceneDrag(); // Signal that we're dragging in the scene (disables camera)
      originalPositionRef.current = { ...placedAsset.position };
      gl.domElement.style.cursor = 'grabbing';
    },
    [placedAsset.id, placedAsset.position, selectAsset, startSceneDrag, gl.domElement]
  );

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      // If there's a collision, revert to original position
      if (hasCollision && originalPositionRef.current) {
        moveAsset(placedAsset.id, originalPositionRef.current, placedAsset.snappedTo);
        setHasCollision(false);
      }
      setIsDragging(false);
      endSceneDrag(); // Signal that dragging ended (re-enables camera)
      originalPositionRef.current = null;
      gl.domElement.style.cursor = 'grab';
    }
  }, [isDragging, hasCollision, placedAsset.id, placedAsset.snappedTo, moveAsset, endSceneDrag, gl.domElement]);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging || !scene || !asset) return;

      // Create a plane at the current Y level for dragging
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -placedAsset.position.y);
      const mouse = new THREE.Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);

      if (intersectPoint) {
        // Apply step-based movement snapping
        const steppedX = snapToStep(intersectPoint.x, movementStep);
        const steppedZ = snapToStep(intersectPoint.z, movementStep);

        // Calculate snapped position with step-based values
        const desiredPosition: Position3D = {
          x: steppedX,
          y: placedAsset.position.y,
          z: steppedZ,
        };

        // Clamp to room bounds
        const clampedPosition = clampToRoomBounds(
          desiredPosition,
          asset.dimensions,
          scene.room
        );

        // Apply wall/floor snapping (this will override step snapping when near walls)
        const snapResult = calculateSnappedPosition(
          clampedPosition,
          asset,
          scene.room
        );

        // Check collision
        const assetLibrary = getAssetLibrary();
        const collision = checkCollision(
          snapResult.position,
          asset.dimensions,
          scene.placedAssets,
          assetLibrary,
          placedAsset.id
        );

        setHasCollision(collision.collides);

        if (!collision.collides) {
          moveAsset(placedAsset.id, snapResult.position, snapResult.snappedTo);
        }
      }
    },
    [
      isDragging,
      scene,
      asset,
      placedAsset,
      camera,
      gl,
      raycaster,
      getAssetLibrary,
      moveAsset,
      movementStep,
    ]
  );

  // Attach/detach pointer move listener
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Handle delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected) {
        removeAsset(placedAsset.id);
        selectAsset(null);
      }
    };

    if (isSelected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSelected, placedAsset.id, removeAsset, selectAsset]);

  if (!asset) return null;

  const { width, height, depth } = asset.dimensions;

  return (
    <mesh
      ref={meshRef}
      position={[placedAsset.position.x, placedAsset.position.y, placedAsset.position.z]}
      rotation={[placedAsset.rotation.x, placedAsset.rotation.y, placedAsset.rotation.z]}
      castShadow
      receiveShadow
      onPointerDown={handlePointerDown}
      onPointerEnter={() => {
        setIsHovered(true);
        if (!isDragging) gl.domElement.style.cursor = 'grab';
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        if (!isDragging) gl.domElement.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[width, height, depth]} />
      <primitive object={material} attach="material" />
      
      {/* Selection/hover highlight */}
      {highlightColor && (
        <mesh scale={[1.02, 1.02, 1.02]}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial
            color={highlightColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Wireframe for selected */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width * 1.01, height * 1.01, depth * 1.01)]} />
          <lineBasicMaterial color="#44ff88" linewidth={2} />
        </lineSegments>
      )}
    </mesh>
  );
}
