'use client';

import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { DraggableAsset } from './DraggableAsset';

export function PlacedAssets() {
  const scene = useSceneStore((state) => state.scene);

  if (!scene) return null;

  return (
    <group>
      {scene.placedAssets.map((placedAsset) => (
        <DraggableAsset key={placedAsset.id} placedAsset={placedAsset} />
      ))}
    </group>
  );
}
