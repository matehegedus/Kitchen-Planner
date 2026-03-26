# Kitchen Planner - Copilot Instructions

You are helping develop a 3D Kitchen Planner application. Follow these guidelines for all code generation.

## Project Overview

- **Framework**: Next.js 16 with App Router
- **3D Engine**: React Three Fiber (Three.js)
- **State**: Zustand stores
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript (strict mode)

## Architecture

This project follows Domain-Driven Design:

```
src/
├── domains/           # Pure business logic (NO React)
│   ├── room/          # Room entity, dimensions, walls
│   ├── asset/         # Asset definitions, PlacedAsset
│   ├── scene/         # Scene composition, services
│   └── shared/        # Shared types
│
└── presentation/      # React/UI layer
    ├── components/    # React components
    │   ├── canvas/    # 3D components (R3F)
    │   ├── panels/    # UI panels
    │   └── layout/    # App layout
    └── stores/        # Zustand stores
```

## Key Principles

### 1. Domain Layer (src/domains/)
- Pure TypeScript, NO React imports
- Business logic only
- Export through index.ts files

### 2. Presentation Layer (src/presentation/)
- React components
- Use Zustand selectors for state
- 3D components use React Three Fiber

### 3. State Management
- `sceneStore` - Kitchen data (room, assets, persistence)
- `uiStore` - UI state (selection, panels, settings)
- Use selectors: `useStore((state) => state.value)`

## Code Patterns

### Domain Entities
```typescript
// src/domains/asset/entities/Asset.ts
export interface Asset {
  id: string;
  name: string;
  dimensions: Dimensions;
}

export function createAsset(name: string, dimensions: Dimensions): Asset {
  return { id: crypto.randomUUID(), name, dimensions };
}
```

### React Components
```tsx
// src/presentation/components/panels/MyPanel.tsx
'use client';

import { useSceneStore } from '@/src/presentation/stores';

export function MyPanel() {
  const scene = useSceneStore((state) => state.scene);
  
  return (
    <div className="p-4">
      {/* Content */}
    </div>
  );
}
```

### 3D Components
```tsx
// src/presentation/components/canvas/MyMesh.tsx
'use client';

import { useRef } from 'react';
import * as THREE from 'three';

export function MyMesh({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}
```

### Zustand Actions
```typescript
// In store
placeAsset: (assetId, position) => {
  set((state) => ({
    scene: {
      ...state.scene,
      placedAssets: [...state.scene.placedAssets, newAsset],
    },
  }));
}
```

## File Naming

- Entities/Components: `PascalCase.ts(x)` - Room.ts, AssetPanel.tsx
- Stores/Hooks: `camelCase.ts` - sceneStore.ts
- Services: `PascalCase.ts` - SnapService.ts

## Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { useSceneStore } from '@/src/presentation/stores';

// 3. Relative imports
import { MyComponent } from './MyComponent';
```

## Common Tasks

### Adding an Asset
1. Add to `DEFAULT_ASSETS` in `src/domains/asset/entities/Asset.ts`
2. Add icon mapping in `AssetPanel.tsx` if needed

### Adding State
1. Update interface in store file
2. Add initial value
3. Add action function

### Adding 3D Component
1. Create in `src/presentation/components/canvas/`
2. Use `'use client'` directive
3. Import in KitchenCanvas.tsx

## Do NOT

- Import React in domain layer files
- Use `require()` - always use `import`
- Create files outside the established structure
- Use inline styles - use Tailwind classes
- Mutate state directly - use Zustand set()

## Debugging

Use `[v0]` prefix for debug logs:
```typescript
console.log('[v0] Asset placed:', position);
```

## Documentation

- See `docs/ARCHITECTURE.md` for detailed architecture
- See `docs/3D_DEVELOPMENT.md` for R3F patterns
- See `docs/STATE_MANAGEMENT.md` for Zustand usage
