import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

import type { Room } from '@/src/domains/room';
import type { PlacedAsset } from '@/src/domains/asset';
import type { Scene } from '@/src/domains/scene';
import type { Position3D, AssetTexture, Dimensions, WallPosition } from '@/src/domains/shared/types';
import { createRoom, toggleWall, updateRoomDimensions } from '@/src/domains/room';
import { createPlacedAsset, updatePlacedAssetPosition, updatePlacedAssetTexture } from '@/src/domains/asset';
import { getAssetById, DEFAULT_ASSETS } from '@/src/domains/asset';

interface SceneState {
  // Scene data
  scene: Scene | null;
  
  // Room operations
  initializeRoom: (dimensions: Dimensions) => void;
  updateDimensions: (dimensions: Dimensions) => void;
  toggleRoomWall: (position: WallPosition) => void;
  
  // Asset operations
  placeAsset: (assetId: string, position: Position3D) => string | null;
  moveAsset: (placedAssetId: string, position: Position3D, snappedTo?: PlacedAsset['snappedTo']) => void;
  removeAsset: (placedAssetId: string) => void;
  updateAssetTexture: (placedAssetId: string, texture: AssetTexture) => void;
  
  // Scene operations
  clearScene: () => void;
  loadScene: (scene: Scene) => void;
  
  // Helpers
  getAssetLibrary: () => Map<string, typeof DEFAULT_ASSETS[number]>;
}

const DEFAULT_ROOM_DIMENSIONS: Dimensions = {
  width: 4,
  height: 2.5,
  depth: 3,
};

export const useSceneStore = create<SceneState>()(
  persist(
    (set, get) => ({
      scene: null,

      initializeRoom: (dimensions: Dimensions) => {
        const room = createRoom(uuidv4(), dimensions, ['north', 'west']);
        const scene: Scene = {
          id: uuidv4(),
          name: 'Kitchen Design',
          room,
          placedAssets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ scene });
      },

      updateDimensions: (dimensions: Dimensions) => {
        const { scene } = get();
        if (!scene) return;

        const updatedRoom = updateRoomDimensions(scene.room, dimensions);
        set({
          scene: {
            ...scene,
            room: updatedRoom,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      toggleRoomWall: (position: WallPosition) => {
        const { scene } = get();
        if (!scene) return;

        const updatedRoom = toggleWall(scene.room, position);
        set({
          scene: {
            ...scene,
            room: updatedRoom,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      placeAsset: (assetId: string, position: Position3D) => {
        const { scene } = get();
        if (!scene) return null;

        const asset = getAssetById(assetId);
        if (!asset) return null;

        const placedAsset = createPlacedAsset(asset, position, 'floor');
        
        set({
          scene: {
            ...scene,
            placedAssets: [...scene.placedAssets, placedAsset],
            updatedAt: new Date().toISOString(),
          },
        });

        return placedAsset.id;
      },

      moveAsset: (placedAssetId: string, position: Position3D, snappedTo) => {
        const { scene } = get();
        if (!scene) return;

        set({
          scene: {
            ...scene,
            placedAssets: scene.placedAssets.map((pa) =>
              pa.id === placedAssetId
                ? updatePlacedAssetPosition(pa, position, snappedTo)
                : pa
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      removeAsset: (placedAssetId: string) => {
        const { scene } = get();
        if (!scene) return;

        set({
          scene: {
            ...scene,
            placedAssets: scene.placedAssets.filter((pa) => pa.id !== placedAssetId),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateAssetTexture: (placedAssetId: string, texture: AssetTexture) => {
        const { scene } = get();
        if (!scene) return;

        set({
          scene: {
            ...scene,
            placedAssets: scene.placedAssets.map((pa) =>
              pa.id === placedAssetId
                ? updatePlacedAssetTexture(pa, texture)
                : pa
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      clearScene: () => {
        const { scene } = get();
        if (!scene) return;

        set({
          scene: {
            ...scene,
            placedAssets: [],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      loadScene: (loadedScene: Scene) => {
        set({ scene: loadedScene });
      },

      getAssetLibrary: () => {
        const map = new Map<string, typeof DEFAULT_ASSETS[number]>();
        DEFAULT_ASSETS.forEach((asset) => {
          map.set(asset.id, asset);
        });
        return map;
      },
    }),
    {
      name: 'kitchen-planner-scene',
      partialize: (state) => ({ scene: state.scene }),
    }
  )
);

// Initialize default room if none exists
export function initializeDefaultRoom() {
  const { scene, initializeRoom } = useSceneStore.getState();
  if (!scene) {
    initializeRoom(DEFAULT_ROOM_DIMENSIONS);
  }
}
