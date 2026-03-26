import type { Position3D, Dimensions, WallPosition } from '../../shared/types';
import type { Room, Wall } from '../../room';
import type { Asset } from '../../asset';

/**
 * Coordinate system: NW corner is at origin (0,0,0)
 * - X: 0 to width (west to east)
 * - Y: 0 to height (floor to ceiling)
 * - Z: 0 to depth (north to south)
 */

const WALL_SNAP_THRESHOLD = 0.25; // meters - how close to wall before snapping
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

  return room.walls
    .filter((w) => w.enabled)
    .map((wall) => {
      switch (wall.position) {
        case 'north':
          return { wall, snapX: width / 2, snapZ: 0 };
        case 'south':
          return { wall, snapX: width / 2, snapZ: depth };
        case 'east':
          return { wall, snapX: width, snapZ: depth / 2 };
        case 'west':
          return { wall, snapX: 0, snapZ: depth / 2 };
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
  const assetHalfDepth = asset.dimensions.depth / 2;

  // Check each enabled wall (NW corner origin)
  for (const wall of room.walls.filter((w) => w.enabled)) {
    switch (wall.position) {
      case 'north': {
        // North wall at Z = wall.thickness
        const wallZ = wall.thickness;
        if (position.z < wallZ + WALL_SNAP_THRESHOLD) {
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
        // South wall at Z = depth - wall.thickness
        const wallZ = depth - wall.thickness;
        if (position.z > wallZ - WALL_SNAP_THRESHOLD) {
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
        // East wall at X = width - wall.thickness
        const wallX = width - wall.thickness;
        if (position.x > wallX - WALL_SNAP_THRESHOLD) {
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
        // West wall at X = wall.thickness
        const wallX = wall.thickness;
        if (position.x < wallX + WALL_SNAP_THRESHOLD) {
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
  const assetHalfDepth = asset.dimensions.depth / 2;
  const assetHalfWidth = asset.dimensions.width / 2;

  // Check proximity to each wall and snap (NW corner origin)
  for (const wall of room.walls.filter((w) => w.enabled)) {
    switch (wall.position) {
      case 'north': {
        // North wall inner edge at Z = wall.thickness
        const wallZ = wall.thickness;
        if (position.z - assetHalfDepth < wallZ + WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: clampToRoom(position.x, assetHalfWidth, width - assetHalfWidth),
              y: asset.dimensions.height / 2,
              z: wallZ + assetHalfDepth,
            },
            snappedTo: 'north',
          };
        }
        break;
      }
      case 'south': {
        // South wall inner edge at Z = depth - wall.thickness
        const wallZ = depth - wall.thickness;
        if (position.z + assetHalfDepth > wallZ - WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: clampToRoom(position.x, assetHalfWidth, width - assetHalfWidth),
              y: asset.dimensions.height / 2,
              z: wallZ - assetHalfDepth,
            },
            snappedTo: 'south',
          };
        }
        break;
      }
      case 'east': {
        // East wall inner edge at X = width - wall.thickness
        const wallX = width - wall.thickness;
        if (position.x + assetHalfWidth > wallX - WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX - assetHalfWidth,
              y: asset.dimensions.height / 2,
              z: clampToRoom(position.z, assetHalfDepth, depth - assetHalfDepth),
            },
            snappedTo: 'east',
          };
        }
        break;
      }
      case 'west': {
        // West wall inner edge at X = wall.thickness
        const wallX = wall.thickness;
        if (position.x - assetHalfWidth < wallX + WALL_SNAP_THRESHOLD) {
          return {
            position: {
              x: wallX + assetHalfWidth,
              y: asset.dimensions.height / 2,
              z: clampToRoom(position.z, assetHalfDepth, depth - assetHalfDepth),
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

function clampToRoom(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, snapToGrid(value)));
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
