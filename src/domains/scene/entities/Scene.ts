import { v4 as uuidv4 } from 'uuid';
import type { Room } from '../../room';
import type { PlacedAsset } from '../../asset';

export interface Scene {
  id: string;
  name: string;
  room: Room;
  placedAssets: PlacedAsset[];
  createdAt: string;
  updatedAt: string;
}

export function createScene(name: string, room: Room): Scene {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name,
    room,
    placedAssets: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addAssetToScene(scene: Scene, asset: PlacedAsset): Scene {
  return {
    ...scene,
    placedAssets: [...scene.placedAssets, asset],
    updatedAt: new Date().toISOString(),
  };
}

export function removeAssetFromScene(scene: Scene, assetId: string): Scene {
  return {
    ...scene,
    placedAssets: scene.placedAssets.filter((a) => a.id !== assetId),
    updatedAt: new Date().toISOString(),
  };
}

export function updateAssetInScene(scene: Scene, asset: PlacedAsset): Scene {
  return {
    ...scene,
    placedAssets: scene.placedAssets.map((a) =>
      a.id === asset.id ? asset : a
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function updateSceneRoom(scene: Scene, room: Room): Scene {
  return {
    ...scene,
    room,
    updatedAt: new Date().toISOString(),
  };
}
