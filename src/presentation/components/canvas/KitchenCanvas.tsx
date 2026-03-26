'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import { useSceneStore, initializeDefaultRoom } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { Room3D } from './Room3D';
import { PlacedAssets } from './PlacedAssets';
import { MeasurementOverlay } from './MeasurementOverlay';
import { DropZone } from './DropZone';
import { Spinner } from '@/components/ui/spinner';

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Spinner className="size-8" />
        <span className="text-sm text-muted-foreground">Loading scene...</span>
      </div>
    </Html>
  );
}

export function KitchenCanvas() {
  const scene = useSceneStore((state) => state.scene);
  const showGrid = useUIStore((state) => state.showGrid);
  const showMeasurements = useUIStore((state) => state.showMeasurements);

  // Initialize room on mount if needed
  useEffect(() => {
    initializeDefaultRoom();
  }, []);

  if (!scene) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <Spinner className="size-8" />
      </div>
    );
  }

  const { width, depth } = scene.room.dimensions;
  const cameraDistance = Math.max(width, depth) * 1.5;

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance * 0.8, cameraDistance],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#f5f5f5' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          {/* Environment for reflections */}
          <Environment preset="apartment" />

          {/* Room */}
          <Room3D room={scene.room} />

          {/* Placed assets */}
          <PlacedAssets />

          {/* Drop zone for drag and drop */}
          <DropZone room={scene.room} />

          {/* Grid helper */}
          {showGrid && (
            <Grid
              args={[width * 2, depth * 2]}
              position={[0, 0.001, 0]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#a0a0a0"
              sectionSize={1}
              sectionThickness={1}
              sectionColor="#808080"
              fadeDistance={Math.max(width, depth) * 2}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={false}
            />
          )}

          {/* Camera controls */}
          <OrbitControls
            makeDefault
            maxPolarAngle={Math.PI / 2 - 0.1}
            minDistance={1}
            maxDistance={Math.max(width, depth) * 3}
            target={[0, 0, 0]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Measurement overlay */}
      {showMeasurements && <MeasurementOverlay room={scene.room} />}
    </div>
  );
}
