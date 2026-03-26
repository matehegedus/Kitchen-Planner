# Feature Development Agent

You are a specialized agent for adding new features to the Kitchen Planner. Follow this systematic approach.

## Before Starting

1. **Understand the request** - What feature is being added?
2. **Identify affected layers** - Domain? Presentation? Both?
3. **Check existing patterns** - Similar features already exist?

## Feature Addition Workflow

```
1. Domain Changes (if needed)
   └── Add entities, types, services
   
2. Store Changes (if needed)
   └── Add state and actions
   
3. UI Components
   └── Create/modify components
   
4. Integration
   └── Wire everything together
```

## Step-by-Step Guide

### Step 1: Analyze Requirements

Ask yourself:
- Does this need new domain logic?
- Does this need new state?
- Does this need new UI?
- Does this need 3D changes?

### Step 2: Domain Layer Changes

Location: `src/domains/`

```typescript
// For new entity
// src/domains/[domain]/entities/NewEntity.ts
export interface NewEntity {
  id: string;
  // ... properties
}

export function createNewEntity(): NewEntity {
  return { id: crypto.randomUUID() };
}
```

```typescript
// For new service
// src/domains/[domain]/services/NewService.ts
export function doSomething(input: Input): Output {
  // Pure business logic
  return result;
}
```

Don't forget to export from `index.ts`:
```typescript
export * from './entities/NewEntity';
export * from './services/NewService';
```

### Step 3: Store Changes

Location: `src/presentation/stores/`

```typescript
// Add to interface
interface SceneState {
  // ... existing
  newValue: string;
  setNewValue: (value: string) => void;
}

// Add to store
const useSceneStore = create<SceneState>((set) => ({
  // ... existing
  newValue: '',
  setNewValue: (value) => set({ newValue: value }),
}));
```

### Step 4: UI Components

Location: `src/presentation/components/`

```tsx
// New panel component
// src/presentation/components/panels/NewPanel.tsx
'use client';

import { useSceneStore } from '@/src/presentation/stores';

export function NewPanel() {
  const value = useSceneStore((state) => state.newValue);
  const setValue = useSceneStore((state) => state.setNewValue);
  
  return (
    <div className="p-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-2 py-1"
      />
    </div>
  );
}
```

Export from index:
```typescript
// src/presentation/components/panels/index.ts
export * from './NewPanel';
```

### Step 5: Integration

Wire the new component into the layout:

```tsx
// In PlannerLayout.tsx or appropriate parent
import { NewPanel } from '../panels';

// Add to render
{showNewPanel && <NewPanel />}
```

## Examples

### Example: Adding "Duplicate Asset" Feature

**1. Domain (not needed - reuses existing)**

**2. Store - Add action:**
```typescript
// sceneStore.ts
duplicateAsset: (id: string) => {
  const { scene } = get();
  if (!scene) return;
  
  const original = scene.placedAssets.find((a) => a.id === id);
  if (!original) return;
  
  const duplicate = createPlacedAsset(
    original.assetId,
    { ...original.position, x: original.position.x + 0.5 },
    original.texture
  );
  
  set((state) => ({
    scene: {
      ...state.scene!,
      placedAssets: [...state.scene!.placedAssets, duplicate],
    },
  }));
}
```

**3. UI - Add button:**
```tsx
// In PropertiesPanel.tsx
const duplicateAsset = useSceneStore((state) => state.duplicateAsset);

<Button onClick={() => duplicateAsset(selectedAssetId)}>
  Duplicate
</Button>
```

### Example: Adding "Room Templates" Feature

**1. Domain - Add templates:**
```typescript
// src/domains/room/templates.ts
export const ROOM_TEMPLATES = [
  {
    id: 'small-kitchen',
    name: 'Small Kitchen',
    dimensions: { width: 3, height: 2.5, depth: 2.5 },
    walls: { north: true, south: false, east: true, west: true },
  },
  // ... more templates
];
```

**2. Store - Add action:**
```typescript
applyRoomTemplate: (templateId: string) => {
  const template = ROOM_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return;
  
  set((state) => ({
    scene: {
      ...state.scene!,
      room: createRoom(
        template.dimensions.width,
        template.dimensions.height,
        template.dimensions.depth,
        template.walls
      ),
      placedAssets: [], // Clear assets when changing room
    },
  }));
}
```

**3. UI - Add selector:**
```tsx
// In RoomSetupPanel.tsx
<Select onValueChange={(id) => applyRoomTemplate(id)}>
  <SelectTrigger>
    <SelectValue placeholder="Choose template" />
  </SelectTrigger>
  <SelectContent>
    {ROOM_TEMPLATES.map((template) => (
      <SelectItem key={template.id} value={template.id}>
        {template.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## Checklist Before Completing

- [ ] Domain logic is pure TypeScript (no React)
- [ ] Store actions use immutable updates
- [ ] Components use Zustand selectors
- [ ] Files are exported from index.ts
- [ ] No TypeScript errors
- [ ] Feature works in UI
