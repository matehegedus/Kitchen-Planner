import type { Position3D, BoundingBox, Dimensions } from '../../shared/types';
import type { PlacedAsset } from '../../asset';
import type { Asset } from '../../asset';
import type { Room } from '../../room';

const COLLISION_PADDING = 0.01; // 1cm padding for collision checks

export function getBoundingBox(
  position: Position3D,
  dimensions: Dimensions
): BoundingBox {
  const halfWidth = dimensions.width / 2;
  const halfHeight = dimensions.height / 2;
  const halfDepth = dimensions.depth / 2;

  return {
    min: {
      x: position.x - halfWidth,
      y: position.y - halfHeight,
      z: position.z - halfDepth,
    },
    max: {
      x: position.x + halfWidth,
      y: position.y + halfHeight,
      z: position.z + halfDepth,
    },
  };
}

export function checkAABBCollision(
  boxA: BoundingBox,
  boxB: BoundingBox
): boolean {
  return (
    boxA.min.x < boxB.max.x + COLLISION_PADDING &&
    boxA.max.x > boxB.min.x - COLLISION_PADDING &&
    boxA.min.y < boxB.max.y + COLLISION_PADDING &&
    boxA.max.y > boxB.min.y - COLLISION_PADDING &&
    boxA.min.z < boxB.max.z + COLLISION_PADDING &&
    boxA.max.z > boxB.min.z - COLLISION_PADDING
  );
}

export function checkCollision(
  newPosition: Position3D,
  assetDimensions: Dimensions,
  placedAssets: PlacedAsset[],
  assetLibrary: Map<string, Asset>,
  excludeId?: string
): { collides: boolean; collidingWith?: PlacedAsset } {
  const newBox = getBoundingBox(newPosition, assetDimensions);

  for (const placed of placedAssets) {
    if (placed.id === excludeId) continue;

    const placedAsset = assetLibrary.get(placed.assetId);
    if (!placedAsset) continue;

    const placedBox = getBoundingBox(placed.position, placedAsset.dimensions);

    if (checkAABBCollision(newBox, placedBox)) {
      return { collides: true, collidingWith: placed };
    }
  }

  return { collides: false };
}

export function checkRoomBounds(
  position: Position3D,
  dimensions: Dimensions,
  room: Room
): boolean {
  const { width, depth, height } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const assetHalfWidth = dimensions.width / 2;
  const assetHalfHeight = dimensions.height / 2;
  const assetHalfDepth = dimensions.depth / 2;

  // Check if asset fits within room bounds
  return (
    position.x - assetHalfWidth >= -halfWidth &&
    position.x + assetHalfWidth <= halfWidth &&
    position.z - assetHalfDepth >= -halfDepth &&
    position.z + assetHalfDepth <= halfDepth &&
    position.y - assetHalfHeight >= 0 &&
    position.y + assetHalfHeight <= height
  );
}

export function clampToRoomBounds(
  position: Position3D,
  dimensions: Dimensions,
  room: Room
): Position3D {
  const { width, depth, height } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const assetHalfWidth = dimensions.width / 2;
  const assetHalfHeight = dimensions.height / 2;
  const assetHalfDepth = dimensions.depth / 2;

  return {
    x: Math.max(
      -halfWidth + assetHalfWidth,
      Math.min(halfWidth - assetHalfWidth, position.x)
    ),
    y: Math.max(
      assetHalfHeight,
      Math.min(height - assetHalfHeight, position.y)
    ),
    z: Math.max(
      -halfDepth + assetHalfDepth,
      Math.min(halfDepth - assetHalfDepth, position.z)
    ),
  };
}

export function findNearestValidPosition(
  desiredPosition: Position3D,
  assetDimensions: Dimensions,
  placedAssets: PlacedAsset[],
  assetLibrary: Map<string, Asset>,
  room: Room,
  excludeId?: string,
  maxIterations: number = 20
): Position3D | null {
  // First clamp to room bounds
  let position = clampToRoomBounds(desiredPosition, assetDimensions, room);

  // Check if initial position is valid
  const collision = checkCollision(
    position,
    assetDimensions,
    placedAssets,
    assetLibrary,
    excludeId
  );

  if (!collision.collides) {
    return position;
  }

  // Try moving in small increments to find valid position
  const stepSize = 0.1;
  const directions = [
    { x: 1, z: 0 },
    { x: -1, z: 0 },
    { x: 0, z: 1 },
    { x: 0, z: -1 },
    { x: 1, z: 1 },
    { x: -1, z: -1 },
    { x: 1, z: -1 },
    { x: -1, z: 1 },
  ];

  for (let i = 1; i <= maxIterations; i++) {
    for (const dir of directions) {
      const testPosition: Position3D = {
        x: position.x + dir.x * stepSize * i,
        y: position.y,
        z: position.z + dir.z * stepSize * i,
      };

      const clampedPosition = clampToRoomBounds(
        testPosition,
        assetDimensions,
        room
      );

      const testCollision = checkCollision(
        clampedPosition,
        assetDimensions,
        placedAssets,
        assetLibrary,
        excludeId
      );

      if (!testCollision.collides) {
        return clampedPosition;
      }
    }
  }

  // Could not find valid position
  return null;
}
