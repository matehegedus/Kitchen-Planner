'use client';

import { useMemo } from 'react';
import type { Room } from '@/src/domains/room';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { getAssetById } from '@/src/domains/asset';

interface MeasurementOverlayProps {
  room: Room;
}

export function MeasurementOverlay({ room }: MeasurementOverlayProps) {
  const scene = useSceneStore((state) => state.scene);
  const selectedAssetId = useUIStore((state) => state.selectedAssetId);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId || !scene) return null;
    const placed = scene.placedAssets.find((a) => a.id === selectedAssetId);
    if (!placed) return null;
    const asset = getAssetById(placed.assetId);
    return asset ? { placed, asset } : null;
  }, [selectedAssetId, scene]);

  const formatMeasurement = (value: number) => {
    if (value >= 1) {
      return `${value.toFixed(2)}m`;
    }
    return `${(value * 100).toFixed(0)}cm`;
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 rounded-lg bg-background/90 p-3 shadow-lg backdrop-blur-sm border border-border">
      {/* Room dimensions */}
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-sm bg-primary" />
        <span className="text-xs font-medium text-foreground">Room</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {formatMeasurement(room.dimensions.width)}
          </span>
          <span>Width</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {formatMeasurement(room.dimensions.depth)}
          </span>
          <span>Depth</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {formatMeasurement(room.dimensions.height)}
          </span>
          <span>Height</span>
        </div>
      </div>

      {/* Selected asset dimensions */}
      {selectedAsset && (
        <>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-sm bg-green-500" />
            <span className="text-xs font-medium text-foreground">
              {selectedAsset.asset.name}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {formatMeasurement(selectedAsset.asset.dimensions.width)}
              </span>
              <span>W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {formatMeasurement(selectedAsset.asset.dimensions.depth)}
              </span>
              <span>D</span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {formatMeasurement(selectedAsset.asset.dimensions.height)}
              </span>
              <span>H</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Position: ({selectedAsset.placed.position.x.toFixed(2)},{' '}
            {selectedAsset.placed.position.z.toFixed(2)})
          </div>
        </>
      )}

      {/* Asset count */}
      <div className="h-px bg-border my-1" />
      <div className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {scene?.placedAssets.length ?? 0}
        </span>{' '}
        items placed
      </div>
    </div>
  );
}
