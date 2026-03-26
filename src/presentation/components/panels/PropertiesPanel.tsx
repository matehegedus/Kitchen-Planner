'use client';

import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { getAssetById } from '@/src/domains/asset';
import type { TextureType, AssetTexture } from '@/src/domains/shared/types';

const TEXTURE_OPTIONS: { type: TextureType; label: string; color: string; props: Partial<AssetTexture> }[] = [
  { type: 'wood', label: 'Wood', color: '#8b6914', props: { roughness: 0.7 } },
  { type: 'white', label: 'White', color: '#f5f5f5', props: { roughness: 0.4 } },
  { type: 'stainless', label: 'Stainless', color: '#a8a8a8', props: { metalness: 0.8, roughness: 0.3 } },
  { type: 'plastic', label: 'Plastic', color: '#e0e0e0', props: { roughness: 0.3 } },
  { type: 'metal', label: 'Dark Metal', color: '#4a4a4a', props: { metalness: 0.9, roughness: 0.2 } },
];

const COLOR_OPTIONS = [
  { label: 'Natural', color: '#8b6914' },
  { label: 'Oak', color: '#a67c52' },
  { label: 'Walnut', color: '#6b4423' },
  { label: 'White', color: '#f5f5f5' },
  { label: 'Gray', color: '#808080' },
  { label: 'Black', color: '#2a2a2a' },
];

export function PropertiesPanel() {
  const scene = useSceneStore((state) => state.scene);
  const updateAssetTexture = useSceneStore((state) => state.updateAssetTexture);
  const removeAsset = useSceneStore((state) => state.removeAsset);
  
  const selectedAssetId = useUIStore((state) => state.selectedAssetId);
  const selectAsset = useUIStore((state) => state.selectAsset);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId || !scene) return null;
    const placed = scene.placedAssets.find((a) => a.id === selectedAssetId);
    if (!placed) return null;
    const asset = getAssetById(placed.assetId);
    return asset ? { placed, asset } : null;
  }, [selectedAssetId, scene]);

  if (!selectedAsset) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Properties</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select an item to edit
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Click on a placed item in the canvas to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  const { placed, asset } = selectedAsset;

  const handleTextureChange = (texture: typeof TEXTURE_OPTIONS[number]) => {
    updateAssetTexture(placed.id, {
      type: texture.type,
      color: texture.color,
      ...texture.props,
    });
  };

  const handleColorChange = (color: string) => {
    updateAssetTexture(placed.id, {
      ...placed.texture,
      color,
    });
  };

  const handleDelete = () => {
    removeAsset(placed.id);
    selectAsset(null);
  };

  const formatMeasurement = (value: number) => {
    if (value >= 1) {
      return `${value.toFixed(2)}m`;
    }
    return `${(value * 100).toFixed(0)}cm`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Properties</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{asset.name}</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Dimensions (read-only) */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dimensions
          </h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
              <span className="font-medium">{formatMeasurement(asset.dimensions.width)}</span>
              <span className="text-xs text-muted-foreground">Width</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
              <span className="font-medium">{formatMeasurement(asset.dimensions.depth)}</span>
              <span className="text-xs text-muted-foreground">Depth</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded">
              <span className="font-medium">{formatMeasurement(asset.dimensions.height)}</span>
              <span className="text-xs text-muted-foreground">Height</span>
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Position
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-xs text-muted-foreground">X:</span>
              <span className="font-medium">{placed.position.x.toFixed(2)}m</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <span className="text-xs text-muted-foreground">Z:</span>
              <span className="font-medium">{placed.position.z.toFixed(2)}m</span>
            </div>
          </div>
          {placed.snappedTo && (
            <p className="text-xs text-muted-foreground">
              Snapped to: <span className="capitalize">{placed.snappedTo}</span>
            </p>
          )}
        </div>

        {/* Material */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Material
          </h4>
          <div className="flex flex-wrap gap-2">
            {TEXTURE_OPTIONS.map((texture) => (
              <button
                key={texture.type}
                onClick={() => handleTextureChange(texture)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded border transition-colors',
                  placed.texture.type === texture.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className="size-6 rounded"
                  style={{ backgroundColor: texture.color }}
                />
                <span className="text-xs">{texture.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Color
          </h4>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.color}
                onClick={() => handleColorChange(option.color)}
                className={cn(
                  'size-8 rounded border-2 transition-all',
                  placed.texture.color === option.color
                    ? 'border-primary scale-110'
                    : 'border-transparent hover:border-primary/50'
                )}
                style={{ backgroundColor: option.color }}
                title={option.label}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleDelete}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Item
          </Button>
        </div>
      </div>
    </div>
  );
}
