import { v4 as uuidv4 } from 'uuid';
import type { 
  Position3D, 
  Rotation3D, 
  AssetTexture,
  WallPosition 
} from '../../shared/types';
import type { Asset } from './Asset';

export interface PlacedAsset {
  id: string;
  assetId: string;
  position: Position3D;
  rotation: Rotation3D;
  texture: AssetTexture;
  snappedTo: 'floor' | WallPosition | null;
}

export function createPlacedAsset(
  asset: Asset,
  position: Position3D,
  snappedTo: PlacedAsset['snappedTo'] = 'floor'
): PlacedAsset {
  return {
    id: uuidv4(),
    assetId: asset.id,
    position,
    rotation: { x: 0, y: 0, z: 0 },
    texture: { ...asset.defaultTexture },
    snappedTo,
  };
}

export function updatePlacedAssetPosition(
  placedAsset: PlacedAsset,
  position: Position3D,
  snappedTo?: PlacedAsset['snappedTo']
): PlacedAsset {
  return {
    ...placedAsset,
    position,
    snappedTo: snappedTo ?? placedAsset.snappedTo,
  };
}

export function updatePlacedAssetTexture(
  placedAsset: PlacedAsset,
  texture: AssetTexture
): PlacedAsset {
  return {
    ...placedAsset,
    texture,
  };
}

export function updatePlacedAssetRotation(
  placedAsset: PlacedAsset,
  rotation: Rotation3D
): PlacedAsset {
  return {
    ...placedAsset,
    rotation,
  };
}
