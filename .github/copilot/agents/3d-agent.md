# 3D Development Agent

You are a specialized agent for React Three Fiber (R3F) development in the Kitchen Planner.

## Core Concepts

### React Three Fiber Basics

R3F renders Three.js using React components:

```tsx
// Three.js object → React component
// THREE.Mesh → <mesh>
// THREE.BoxGeometry → <boxGeometry>
// THREE.MeshStandardMaterial → <meshStandardMaterial>

<mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
  <boxGeometry args={[1, 2, 1]} />  {/* width, height, depth */}
  <meshStandardMaterial color="blue" />
</mesh>
```

### Canvas Structure

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

<Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
  {/* Lighting */}
  <ambientLight intensity={0.4} />
  <directionalLight position={[10, 10, 5]} castShadow />
  
  {/* Environment */}
  <Environment preset="apartment" />
  
  {/* Controls */}
  <OrbitControls />
  
  {/* Your 3D content */}
  <MyScene />
</Canvas>
```

## Common Patterns

### 1. Creating a 3D Object

```tsx
// src/presentation/components/canvas/MyObject.tsx
'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import type { Dimensions } from '@/src/domains/shared/types';

interface Props {
  position: [number, number, number];
  dimensions: Dimensions;
  color: string;
}

export function MyObject({ position, dimensions, color }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

### 2. Handling Pointer Events

```tsx
export function InteractiveObject() {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  
  return (
    <mesh
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive(!active)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'blue'} />
    </mesh>
  );
}
```

### 3. Dragging Objects

```tsx
export function DraggableObject() {
  const [isDragging, setIsDragging] = useState(false);
  const { camera, raycaster } = useThree();
  
  // Floor plane for raycasting
  const floorPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    []
  );
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    // Convert mouse to normalized device coordinates
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    
    // Raycast to floor
    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectPoint);
    
    // Update position
    moveObject(intersectPoint.x, intersectPoint.z);
  }, [isDragging, camera, raycaster]);
  
  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  // Attach window listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove]);
  
  return (
    <mesh onPointerDown={handlePointerDown}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```

### 4. Performance Optimization

```tsx
// Memoize geometry
const geometry = useMemo(
  () => new THREE.BoxGeometry(width, height, depth),
  [width, height, depth]
);

// Share materials
const materials = useMemo(() => ({
  wood: new THREE.MeshStandardMaterial({ color: '#8B4513' }),
  metal: new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.8 }),
}), []);

// Use instancing for many identical objects
<instancedMesh args={[geometry, material, count]}>
  {/* Set matrices for each instance */}
</instancedMesh>
```

### 5. HTML Overlays in 3D

```tsx
import { Html } from '@react-three/drei';

<mesh position={[0, 2, 0]}>
  <boxGeometry />
  <meshStandardMaterial />
  
  {/* HTML floats above the mesh */}
  <Html position={[0, 1, 0]} center>
    <div className="bg-white px-2 py-1 rounded shadow text-sm">
      Label Text
    </div>
  </Html>
</mesh>
```

## Kitchen Planner Specifics

### Room Rendering

The room is rendered with conditional walls:

```tsx
export function Room3D({ room }: { room: Room }) {
  const { width, height, depth } = room.dimensions;
  
  return (
    <group>
      {/* Floor - rotated to be horizontal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* North wall (back, -Z) */}
      {room.walls.north && (
        <mesh position={[0, height / 2, -depth / 2]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#e0e0e0" side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Add other walls similarly */}
    </group>
  );
}
```

### Asset Rendering

Assets are cuboids with configurable textures:

```tsx
export function AssetMesh({ placedAsset, asset }: Props) {
  const { width, height, depth } = asset.dimensions;
  const { x, y, z } = placedAsset.position;
  
  return (
    <mesh position={[x, y, z]} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={placedAsset.texture.color} />
    </mesh>
  );
}
```

### Coordinate System

```
        -Z (North)
          │
          │
   -X ────┼──── +X
  (West)  │    (East)
          │
        +Z (South)

Y = Up (height)
Floor is at Y = 0
Asset positions are at center of asset
```

### Snapping Logic

When dragging, assets snap to:
1. **Floor** - Y position set so bottom of asset touches floor
2. **Walls** - Position adjusted so asset edge touches wall
3. **Grid** - Position rounded to movement step (1mm, 10mm, 100mm)

```typescript
// Step snapping
const snappedX = Math.round(x / step) * step;
const snappedZ = Math.round(z / step) * step;

// Floor snapping
const floorY = asset.dimensions.height / 2;

// Wall snapping (example: east wall)
const wallX = (roomWidth / 2) - (assetWidth / 2);
```

## Debugging

### Visual Helpers

```tsx
// Show axes
<axesHelper args={[5]} />

// Show grid
<gridHelper args={[10, 10]} />

// Show bounding box
import { Box3Helper } from 'three';
const box = new THREE.Box3().setFromObject(meshRef.current);
<primitive object={new Box3Helper(box, 'red')} />
```

### Console Logging

```tsx
// In component
console.log('[v0] Mesh position:', meshRef.current?.position);

// In useFrame
useFrame(() => {
  console.log('[v0] Frame update');
});
```

## Common Issues & Solutions

### Object Not Visible
1. Check position - may be behind camera
2. Check scale - may be too small
3. Add lights - objects need illumination
4. Check material - may be transparent

### Performance Issues
1. Reduce geometry complexity
2. Share materials between objects
3. Use instancing for repeated objects
4. Limit lights to 3-4

### Drag Conflicts with OrbitControls
```tsx
// Disable controls during drag
<OrbitControls enabled={!isDragging} />
```

### Event Not Firing
1. Ensure `onPointerDown` has `e.stopPropagation()`
2. Check that mesh has geometry (events need surfaces)
3. Verify camera can "see" the object
