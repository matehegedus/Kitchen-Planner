# Quick Reference Card

A one-page reference for common tasks in the Kitchen Planner.

---

## Project Structure

```
src/domains/          # Business logic (NO React)
src/presentation/     # React components & stores
components/ui/        # shadcn/ui components
app/                  # Next.js pages
docs/                 # Documentation
```

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page |
| `src/domains/asset/entities/Asset.ts` | Asset definitions |
| `src/presentation/stores/sceneStore.ts` | Kitchen data state |
| `src/presentation/stores/uiStore.ts` | UI state |
| `src/presentation/components/canvas/KitchenCanvas.tsx` | 3D scene |
| `src/presentation/components/layout/PlannerLayout.tsx` | App layout |

---

## Common Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run linter
```

---

## Adding an Asset

```typescript
// src/domains/asset/entities/Asset.ts
// Add to DEFAULT_ASSETS array:
{
  id: 'new-item',
  name: 'New Item',
  category: 'appliance',  // or 'furniture', 'storage'
  dimensions: { width: 0.6, height: 0.9, depth: 0.6 },
  defaultTexture: { type: 'metal', color: '#888888' },
  snapBehavior: 'floor',  // or 'wall', 'both'
  icon: 'iconName',
},
```

---

## Adding State

```typescript
// In store file:

// 1. Add to interface
interface SceneState {
  newValue: string;
  setNewValue: (value: string) => void;
}

// 2. Add to store
const useSceneStore = create<SceneState>((set) => ({
  newValue: '',
  setNewValue: (value) => set({ newValue: value }),
}));
```

---

## Using State in Components

```tsx
// Subscribe to state (use selectors!)
const value = useSceneStore((state) => state.newValue);
const setValue = useSceneStore((state) => state.setNewValue);

// Use it
<input value={value} onChange={(e) => setValue(e.target.value)} />
```

---

## Creating a Component

```tsx
// src/presentation/components/panels/MyPanel.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useSceneStore } from '@/src/presentation/stores';

export function MyPanel() {
  const scene = useSceneStore((state) => state.scene);
  
  return (
    <div className="p-4">
      <Button>Click me</Button>
    </div>
  );
}
```

---

## 3D Mesh Template

```tsx
<mesh position={[x, y, z]} castShadow>
  <boxGeometry args={[width, height, depth]} />
  <meshStandardMaterial color="#888888" />
</mesh>
```

---

## Tailwind Cheat Sheet

| Class | Effect |
|-------|--------|
| `flex items-center` | Horizontal center |
| `flex flex-col` | Vertical stack |
| `gap-2` | 8px gap |
| `p-4` | 16px padding |
| `text-sm` | 14px font |
| `text-muted-foreground` | Gray text |
| `border-b border-border` | Bottom border |
| `rounded-md` | Rounded corners |
| `hover:bg-accent` | Hover background |

---

## Import Paths

```typescript
// shadcn/ui components
import { Button } from '@/components/ui/button';

// Stores
import { useSceneStore, useUIStore } from '@/src/presentation/stores';

// Domain
import { getAssetById, DEFAULT_ASSETS } from '@/src/domains/asset';

// Types
import type { Position3D, Dimensions } from '@/src/domains/shared/types';
```

---

## Debug Logging

```typescript
console.log('[v0] Debug message:', value);
```

---

## Coordinate System

```
      -Z (North)
         │
  -X ────┼──── +X
(West)   │    (East)
         │
      +Z (South)

Y = Up (height)
Floor at Y = 0
```

---

## Documentation Links

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [3D_DEVELOPMENT.md](./3D_DEVELOPMENT.md) - R3F patterns
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Zustand usage
- [DOMAIN_MODELS.md](./DOMAIN_MODELS.md) - Business logic
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
