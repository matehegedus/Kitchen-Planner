'use client';

import { useMemo, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore, type MovementStep } from '@/src/presentation/stores/uiStore';
import { getAssetById } from '@/src/domains/asset';
import { calculateSnappedPosition } from '@/src/domains/scene/services/SnapService';
import { checkCollision, clampToRoomBounds } from '@/src/domains/scene/services/CollisionService';
import type { TextureType, AssetTexture, Position3D } from '@/src/domains/shared/types';

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

const MOVEMENT_STEP_OPTIONS: { value: MovementStep; label: string }[] = [
  { value: 0.001, label: '1mm' },
  { value: 0.01, label: '10mm' },
  { value: 0.1, label: '100mm' },
];

export function PropertiesPanel() {
  const scene = useSceneStore((state) => state.scene);
  const updateAssetTexture = useSceneStore((state) => state.updateAssetTexture);
  const removeAsset = useSceneStore((state) => state.removeAsset);
  const moveAsset = useSceneStore((state) => state.moveAsset);
  const getAssetLibrary = useSceneStore((state) => state.getAssetLibrary);
  
  const selectedAssetId = useUIStore((state) => state.selectedAssetId);
  const selectAsset = useUIStore((state) => state.selectAsset);
  const movementStep = useUIStore((state) => state.movementStep);
  const setMovementStep = useUIStore((state) => state.setMovementStep);

  // Local state for position inputs (to allow typing before committing)
  const [positionInputs, setPositionInputs] = useState({ x: '', y: '', z: '' });

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

  // Handle position input change
  const handlePositionChange = useCallback((axis: 'x' | 'y' | 'z', value: string) => {
    setPositionInputs(prev => ({ ...prev, [axis]: value }));
  }, []);

  // Commit position change on blur or Enter
  const handlePositionCommit = useCallback((axis: 'x' | 'y' | 'z') => {
    if (!scene || !selectedAsset) return;
    
    const inputValue = positionInputs[axis];
    if (!inputValue) {
      setPositionInputs(prev => ({ ...prev, [axis]: '' }));
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setPositionInputs(prev => ({ ...prev, [axis]: '' }));
      return;
    }

    const { placed, asset } = selectedAsset;
    
    // Create new position
    const newPosition: Position3D = {
      x: axis === 'x' ? numValue : placed.position.x,
      y: axis === 'y' ? numValue : placed.position.y,
      z: axis === 'z' ? numValue : placed.position.z,
    };

    // Clamp to room bounds
    const clampedPosition = clampToRoomBounds(newPosition, asset.dimensions, scene.room);

    // Apply snapping only for X/Z, preserve Y for wall-mounted items
    let finalPosition = clampedPosition;
    let snappedTo = placed.snappedTo;
    
    if (axis !== 'y') {
      const snapResult = calculateSnappedPosition(clampedPosition, asset, scene.room);
      finalPosition = snapResult.position;
      snappedTo = snapResult.snappedTo;
      // Preserve Y position if asset can move Y
      if (asset.canMoveY && axis === 'x') {
        finalPosition.y = clampedPosition.y;
      }
    }

    // Check collision
    const assetLibrary = getAssetLibrary();
    const collision = checkCollision(
      finalPosition,
      asset.dimensions,
      scene.placedAssets,
      assetLibrary,
      placed.id
    );

    // Only move if no collision
    if (!collision.collides) {
      moveAsset(placed.id, finalPosition, snappedTo);
    }

    // Clear input
    setPositionInputs(prev => ({ ...prev, [axis]: '' }));
  }, [scene, selectedAsset, positionInputs, getAssetLibrary, moveAsset]);

  const handlePositionKeyDown = useCallback((e: React.KeyboardEvent, axis: 'x' | 'y' | 'z') => {
    if (e.key === 'Enter') {
      handlePositionCommit(axis);
    }
  }, [handlePositionCommit]);

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
          <div className={cn("grid gap-2", asset.canMoveY ? "grid-cols-3" : "grid-cols-2")}>
            <div className="space-y-1">
              <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X (m)</Label>
              <Input
                id="pos-x"
                type="number"
                step={movementStep}
                defaultValue={placed.position.x.toFixed(3)}
                key={`x-${placed.position.x}`}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                onBlur={() => handlePositionCommit('x')}
                onKeyDown={(e) => handlePositionKeyDown(e, 'x')}
                className="h-8 text-sm"
              />
            </div>
            {asset.canMoveY && (
              <div className="space-y-1">
                <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y (m)</Label>
                <Input
                  id="pos-y"
                  type="number"
                  step={movementStep}
                  defaultValue={placed.position.y.toFixed(3)}
                  key={`y-${placed.position.y}`}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  onBlur={() => handlePositionCommit('y')}
                  onKeyDown={(e) => handlePositionKeyDown(e, 'y')}
                  className="h-8 text-sm"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="pos-z" className="text-xs text-muted-foreground">Z (m)</Label>
              <Input
                id="pos-z"
                type="number"
                step={movementStep}
                defaultValue={placed.position.z.toFixed(3)}
                key={`z-${placed.position.z}`}
                onChange={(e) => handlePositionChange('z', e.target.value)}
                onBlur={() => handlePositionCommit('z')}
                onKeyDown={(e) => handlePositionKeyDown(e, 'z')}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Origin (0,0,0) is at NW corner
          </p>
          {placed.snappedTo && (
            <p className="text-xs text-muted-foreground">
              Snapped to: <span className="capitalize">{placed.snappedTo}</span>
            </p>
          )}
        </div>

        {/* Movement Step */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Movement Precision
          </h4>
          <div className="flex gap-2">
            {MOVEMENT_STEP_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMovementStep(option.value)}
                className={cn(
                  'flex-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                  movementStep === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Controls drag movement step size
          </p>
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
