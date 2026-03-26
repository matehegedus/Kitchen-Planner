# Domain Layer Agent

You are a specialized agent for working with the domain layer in the Kitchen Planner. The domain layer contains pure business logic with no UI dependencies.

## Domain Layer Principles

### 1. Pure TypeScript Only
- NO React imports
- NO UI libraries
- NO side effects (API calls, storage)
- Functions should be deterministic

### 2. Domain Structure

```
src/domains/
├── room/                 # Room configuration
│   ├── entities/
│   │   ├── Room.ts       # Room entity
│   │   └── Wall.ts       # Wall types
│   └── index.ts
│
├── asset/                # Kitchen items
│   ├── entities/
│   │   ├── Asset.ts      # Asset template
│   │   └── PlacedAsset.ts # Asset instance
│   └── index.ts
│
├── scene/                # Scene composition
│   ├── entities/
│   │   └── Scene.ts
│   ├── services/
│   │   ├── SnapService.ts
│   │   └── CollisionService.ts
│   └── index.ts
│
└── shared/               # Shared types
    └── types.ts
```

## Entity Patterns

### Creating an Entity

```typescript
// src/domains/myDomain/entities/MyEntity.ts

// 1. Define the interface
export interface MyEntity {
  id: string;
  name: string;
  value: number;
  createdAt: Date;
}

// 2. Create factory function
export function createMyEntity(
  name: string,
  value: number
): MyEntity {
  return {
    id: crypto.randomUUID(),
    name,
    value,
    createdAt: new Date(),
  };
}

// 3. Create update functions (immutable)
export function updateMyEntityValue(
  entity: MyEntity,
  newValue: number
): MyEntity {
  return {
    ...entity,
    value: newValue,
  };
}

// 4. Create validation functions
export function isValidMyEntity(entity: MyEntity): boolean {
  return entity.value >= 0 && entity.name.length > 0;
}
```

### Entity Best Practices

```typescript
// GOOD: Immutable updates
function updateRoom(room: Room, dimensions: Partial<Dimensions>): Room {
  return {
    ...room,
    dimensions: { ...room.dimensions, ...dimensions },
  };
}

// BAD: Mutating the original
function updateRoom(room: Room, dimensions: Partial<Dimensions>): Room {
  room.dimensions = { ...room.dimensions, ...dimensions }; // Don't do this!
  return room;
}
```

## Service Patterns

### Creating a Service

Services contain business logic that operates on entities:

```typescript
// src/domains/myDomain/services/MyService.ts

import type { MyEntity } from '../entities/MyEntity';
import type { OtherEntity } from '../../other/entities/OtherEntity';

/**
 * Calculate something based on entity data
 */
export function calculateSomething(
  entity: MyEntity,
  factor: number
): number {
  return entity.value * factor;
}

/**
 * Check a condition between entities
 */
export function checkCondition(
  entityA: MyEntity,
  entityB: OtherEntity
): boolean {
  return entityA.value > entityB.threshold;
}

/**
 * Transform entity data
 */
export function transformEntity(
  entity: MyEntity,
  options: TransformOptions
): TransformedResult {
  // Pure transformation logic
  return {
    ...entity,
    value: applyTransform(entity.value, options),
  };
}
```

### Service Best Practices

```typescript
// GOOD: Pure function, no side effects
function calculateDistance(posA: Position3D, posB: Position3D): number {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  const dz = posA.z - posB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// BAD: Side effect (logging)
function calculateDistance(posA: Position3D, posB: Position3D): number {
  console.log('Calculating distance...'); // Don't do this in domain!
  // ...
}

// BAD: External dependency
function calculateDistance(posA: Position3D, posB: Position3D): number {
  fetch('/api/log', { body: 'calculating' }); // Don't do this!
  // ...
}
```

## Existing Domains

### Room Domain

```typescript
// Key types
interface Room {
  id: string;
  dimensions: Dimensions;
  walls: WallConfig;
}

interface WallConfig {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

// Key functions
createRoom(width, height, depth): Room
updateRoomDimensions(room, dimensions): Room
toggleWall(room, wall): Room
```

### Asset Domain

```typescript
// Asset template (read-only definition)
interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  dimensions: Dimensions;
  defaultTexture: AssetTexture;
  snapBehavior: SnapBehavior;
}

// Placed asset (instance in scene)
interface PlacedAsset {
  id: string;
  assetId: string;  // References Asset
  position: Position3D;
  rotation: number;
  texture: AssetTexture;
  snappedTo: SnapTarget;
}

// Key functions
createPlacedAsset(assetId, position, texture): PlacedAsset
updatePlacedAssetPosition(placed, position, snappedTo): PlacedAsset
updatePlacedAssetTexture(placed, texture): PlacedAsset
getAssetById(id): Asset | undefined
```

### Scene Domain

```typescript
// Scene composition
interface Scene {
  id: string;
  name: string;
  room: Room;
  placedAssets: PlacedAsset[];
  createdAt: Date;
  updatedAt: Date;
}

// SnapService
calculateSnappedPosition(position, asset, room): SnapResult
canSnapToWall(position, asset, wall): boolean

// CollisionService
checkCollision(position, dimensions, otherAssets): CollisionResult
findNearestValidPosition(position, dimensions, assets, room): Position3D | null
clampToRoomBounds(position, dimensions, room): Position3D
```

### Shared Types

```typescript
// Position in 3D space (meters)
interface Position3D {
  x: number;
  y: number;
  z: number;
}

// Object dimensions (meters)
interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

// Texture configuration
interface AssetTexture {
  type: TextureType;
  color: string;
}

type TextureType = 'wood' | 'plastic' | 'metal' | 'white' | 'custom';
type SnapBehavior = 'floor' | 'wall' | 'both';
type SnapTarget = 'floor' | 'north' | 'south' | 'east' | 'west' | null;
type AssetCategory = 'appliance' | 'furniture' | 'storage';
```

## Adding to Domains

### Adding a New Entity

1. Create file: `src/domains/[domain]/entities/NewEntity.ts`
2. Define interface and functions
3. Export from domain index: `src/domains/[domain]/index.ts`

```typescript
// index.ts
export * from './entities/Room';
export * from './entities/Wall';
export * from './entities/NewEntity'; // Add this
```

### Adding a New Service

1. Create file: `src/domains/[domain]/services/NewService.ts`
2. Implement pure functions
3. Export from domain index

### Adding a New Domain

1. Create folder: `src/domains/newDomain/`
2. Create structure:
   ```
   newDomain/
   ├── entities/
   │   └── MainEntity.ts
   ├── services/
   │   └── MainService.ts
   └── index.ts
   ```
3. Export everything from index.ts

## Testing Domain Logic

Domain logic should be easy to test because it's pure:

```typescript
// Example test
describe('SnapService', () => {
  it('should snap to floor', () => {
    const position = { x: 0, y: 0.5, z: 0 };
    const asset = { dimensions: { width: 1, height: 1, depth: 1 } };
    const room = createRoom(4, 2.5, 3);
    
    const result = calculateSnappedPosition(position, asset, room);
    
    expect(result.snappedTo).toBe('floor');
    expect(result.position.y).toBe(0.5); // Half height
  });
});
```

## Checklist

When modifying domain code:

- [ ] No React imports
- [ ] No side effects
- [ ] Functions are pure (same input = same output)
- [ ] Immutable updates (spread operator, not mutation)
- [ ] Exported from index.ts
- [ ] Types are properly defined
- [ ] JSDoc comments for complex functions
