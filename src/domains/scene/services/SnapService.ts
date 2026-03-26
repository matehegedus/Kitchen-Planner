import type { Position3D, Dimensions, WallPosition } from '../../shared/types';
import type { Room, Wall } from '../../room';
import type { Asset } from '../../asset';

const WALL_SNAP_THRESHOLD = 0.15; // meters - how close to wall before snapping
const GRID_SIZE = 0.05; // 5cm grid for smoother placement

export interface SnapResult {
  position: Position3D;
  snappedTo: 'floor' | WallPosition | null;
}

export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPositionToGrid(position: Position3D): Position3D {
  return {
    x: snapToGrid(position.x),
    y: snapToGrid(position.y),
    z: snapToGrid(position.z),
  };
}

export function getWallPositions(
  room: Room
): { wall: Wall; snapX: number; snapZ: number }[] {
  const { width, depth } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  return room.walls
    .filter((w) => w.enabled)
    .map((wall) => {
      switch (wall.position) {
        case 'north':
          return { wall, snapX: 0, snapZ: -halfDepth };
        case 'south':
          return { wall, snapX: 0, snapZ: halfDepth };
        case 'east':
          return { wall, snapX: halfWidth, snapZ: 0 };
        case 'west':
          return { wall, snapX: -halfWidth, snapZ: 0 };
        default:
          return { wall, snapX: 0, snapZ: 0 };
      }
    });
}

export function snapToFloor(
  position: Position3D,
  asset: Asset
): Position3D {
  return {
    x: snapToGrid(position.x),
    y: asset.dimensions.height / 2, // Place on floor
    z: snapToGrid(position.z),
  };
}

export function snapToWall(
  position: Position3D,
  asset: Asset,
  room: Room,
  wallHeight: number = 1.5 // Default wall mount height
): SnapResult {
  const { width, depth } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const assetHalfDepth = asset.dimensions.depth / 2;

  // Check each enabled wall
  for (const wall of room.walls.filter((w) => w.enabled)) {
    switch (wall.position) {
      case 'north': {
        const wallZ = -halfDepth + wall.thickness / 2;
        if (Math.abs(position.z - wallZ) < WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: snapToGrid(position.x),
              y: wallHeight,
              z: wallZ + assetHalfDepth,
            },
            snappedTo: 'north',
          };
        }
        break;
      }
      case 'south': {
        const wallZ = halfDepth - wall.thickness / 2;
        if (Math.abs(position.z - wallZ) < WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: snapToGrid(position.x),
              y: wallHeight,
              z: wallZ - assetHalfDepth,
            },
            snappedTo: 'south',
          };
        }
        break;
      }
      case 'east': {
        const wallX = halfWidth - wall.thickness / 2;
        if (Math.abs(position.x - wallX) < WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX - assetHalfDepth,
              y: wallHeight,
              z: snapToGrid(position.z),
            },
            snappedTo: 'east',
          };
        }
        break;
      }
      case 'west': {
        const wallX = -halfWidth + wall.thickness / 2;
        if (Math.abs(position.x - wallX) < WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX + assetHalfDepth,
              y: wallHeight,
              z: snapToGrid(position.z),
            },
            snappedTo: 'west',
          };
        }
        break;
      }
    }
  }

  return { position, snappedTo: null };
}

export function snapFloorAssetToWall(
  position: Position3D,
  asset: Asset,
  room: Room
): SnapResult {
  const { width, depth } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const assetHalfDepth = asset.dimensions.depth / 2;
  const assetHalfWidth = asset.dimensions.width / 2;

  // Check proximity to each wall and snap
  for (const wall of room.walls.filter((w) => w.enabled)) {
    switch (wall.position) {
      case 'north': {
        const wallZ = -halfDepth + wall.thickness;
        if (position.z - assetHalfDepth < wallZ + WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: clampToRoom(position.x, halfWidth - assetHalfWidth),
              y: asset.dimensions.height / 2,
              z: wallZ + assetHalfDepth,
            },
            snappedTo: 'north',
          };
        }
        break;
      }
      case 'south': {
        const wallZ = halfDepth - wall.thickness;
        if (position.z + assetHalfDepth > wallZ - WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: clampToRoom(position.x, halfWidth - assetHalfWidth),
              y: asset.dimensions.height / 2,
              z: wallZ - assetHalfDepth,
            },
            snappedTo: 'south',
          };
        }
        break;
      }
      case 'east': {
        const wallX = halfWidth - wall.thickness;
        if (position.x + assetHalfWidth > wallX - WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX - assetHalfWidth,
              y: asset.dimensions.height / 2,
              z: clampToRoom(position.z, halfDepth - assetHalfDepth),
            },
            snappedTo: 'east',
          };
        }
        break;
      }
      case 'west': {
        const wallX = -halfWidth + wall.thickness;
        if (position.x - assetHalfWidth < wallX + WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX + assetHalfWidth,
              y: asset.dimensions.height / 2,
              z: clampToRoom(position.z, halfDepth - assetHalfDepth),
            },
            snappedTo: 'west',
          };
        }
        break;
      }
    }
  }

  // No wall snap, just floor
  return {
    position: snapToFloor(position, asset),
    snappedTo: 'floor',
  };
}

function clampToRoom(value: number, max: number): number {
  return Math.max(-max, Math.min(max, snapToGrid(value)));
}

export function calculateSnappedPosition(
  position: Position3D,
  asset: Asset,
  room: Room
): SnapResult {
  if (asset.snapBehavior === 'wall') {
    return snapToWall(position, asset, room);
  } else if (asset.snapBehavior === 'floor') {
    return snapFloorAssetToWall(position, asset, room);
  } else {
    // 'both' - try wall first, then floor
    const wallResult = snapToWall(position, asset, room);
    if (wallResult.snappedTo) {
      return wallResult;
    }
    return snapFloorAssetToWall(position, asset, room);
  }
}
