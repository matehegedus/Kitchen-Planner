// Shared domain types used across bounded contexts

export interface Dimensions {
  width: number;   // in meters
  height: number;  // in meters
  depth: number;   // in meters
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export type WallPosition = 'north' | 'south' | 'east' | 'west';

export type SnapBehavior = 'floor' | 'wall' | 'both';

export type AssetCategory = 'appliance' | 'furniture' | 'storage';

export type TextureType = 'wood' | 'plastic' | 'metal' | 'white' | 'stainless' | 'custom';

export interface AssetTexture {
  type: TextureType;
  color: string;
  roughness?: number;
  metalness?: number;
}

// Bounding box for collision detection
export interface BoundingBox {
  min: Position3D;
  max: Position3D;
}
