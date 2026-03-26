# Getting Started Guide

This guide helps you set up the Kitchen Planner project and understand its basics, even if you're new to Next.js or 3D web development.

---

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 18+** - JavaScript runtime ([download](https://nodejs.org/))
2. **pnpm** - Package manager (`npm install -g pnpm`)
3. **VS Code** (recommended) - Code editor with great TypeScript support
4. **Git** - Version control

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/kitchen-planner.git
cd kitchen-planner

# 2. Install dependencies
pnpm install

# 3. Start the development server
pnpm dev

# 4. Open your browser
# Navigate to http://localhost:3000
```

---

## Understanding the Basics

### What is Next.js?

Next.js is a React framework that adds:
- **File-based routing** - Files in `app/` become pages automatically
- **Server-side rendering** - Pages can render on the server for faster loads
- **API routes** - Backend endpoints alongside frontend code

**Key files:**
- `app/page.tsx` - The main page (what you see at `/`)
- `app/layout.tsx` - Wraps all pages (navbar, providers, etc.)
- `app/globals.css` - Global styles

### What is React Three Fiber (R3F)?

R3F lets you build 3D scenes using React components instead of raw Three.js code.

**Traditional Three.js:**
```javascript
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 'blue' });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
```

**React Three Fiber:**
```jsx
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="blue" />
</mesh>
```

Same result, but using familiar React patterns!

### What is Zustand?

Zustand is a simple state management library. Think of it as a global variable store that React components can subscribe to.

```typescript
// Define a store
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Use in any component
function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

---

## Project Walkthrough

### 1. The Main Page (`app/page.tsx`)

This is the entry point. It renders the `PlannerLayout` component:

```tsx
import { PlannerLayout } from '@/src/presentation/components/layout';

export default function HomePage() {
  return <PlannerLayout />;
}
```

### 2. The Layout (`PlannerLayout.tsx`)

The main UI structure with:
- **Header** - Title, save/load buttons
- **3D Canvas** - Where the kitchen is rendered
- **Side Panels** - Asset browser, properties, settings

### 3. The 3D Canvas (`KitchenCanvas.tsx`)

The Three.js scene containing:
- **Room3D** - Walls and floor
- **PlacedAssets** - All kitchen items
- **OrbitControls** - Camera rotation/zoom

### 4. State Management (`stores/`)

Two Zustand stores:
- **sceneStore** - Kitchen data (room, assets, save/load)
- **uiStore** - UI state (selected item, active panel, settings)

---

## Common Tasks

### Adding a New Asset Type

1. Edit `src/domains/asset/entities/Asset.ts`
2. Add to `DEFAULT_ASSETS` array:

```typescript
{
  id: 'dishwasher',
  name: 'Dishwasher',
  category: 'appliance',
  dimensions: { width: 0.6, height: 0.85, depth: 0.6 },
  defaultTexture: { type: 'metal', color: '#888888' },
  snapBehavior: 'floor',
  icon: 'washingMachine',
},
```

### Changing the Default Room Size

Edit `src/presentation/stores/sceneStore.ts`:

```typescript
export function initializeDefaultRoom() {
  // Change these values:
  room: createRoom(5, 2.5, 4), // width, height, depth in meters
}
```

### Adding a New Texture Option

Edit `src/domains/shared/types.ts` to add the texture type, then update `PropertiesPanel.tsx` to show it.

---

## Debugging Tips

### Browser DevTools

1. **Console** - Check for errors (F12 > Console)
2. **React DevTools** - Inspect component tree
3. **Network Tab** - See API requests

### 3D Scene Debugging

Add helpers to see axes and grid:

```tsx
// In KitchenCanvas.tsx
<axesHelper args={[5]} />
<gridHelper args={[10, 10]} />
```

### Console Logging

Use `[v0]` prefix for debug logs:

```typescript
console.log('[v0] Asset placed:', position);
```

---

## Next Steps

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the code structure
2. Read [3D_DEVELOPMENT.md](./3D_DEVELOPMENT.md) for 3D-specific patterns
3. Try making a small change and see it in action!

---

## Getting Help

- Check existing documentation in `/docs`
- Search GitHub issues
- Ask in team Slack channel
