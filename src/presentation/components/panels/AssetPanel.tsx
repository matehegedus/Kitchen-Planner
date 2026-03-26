'use client';

import { useState, useCallback } from 'react';
import { 
  Refrigerator, 
  CookingPot, 
  LayoutGrid, 
  Square, 
  Minus, 
  Table2, 
  WashingMachine, 
  Bath,
  ChevronDown,
  GripVertical,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { DEFAULT_ASSETS, type Asset, type AssetCategory, getAssetById } from '@/src/domains/asset';
import { useUIStore } from '@/src/presentation/stores/uiStore';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { calculateSnappedPosition } from '@/src/domains/scene/services/SnapService';
import { checkCollision, findNearestValidPosition } from '@/src/domains/scene/services/CollisionService';
import type { Position3D } from '@/src/domains/shared/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Refrigerator,
  CookingPot,
  LayoutGrid,
  Square,
  Minus,
  Table2,
  WashingMachine,
  Bath,
};

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  appliance: 'Appliances',
  furniture: 'Furniture',
  storage: 'Storage',
};

interface AssetItemProps {
  asset: Asset;
  onDragStart: () => void;
  onClickPlace: (assetId: string) => void;
}

function AssetItem({ asset, onDragStart, onClickPlace }: AssetItemProps) {
  const Icon = asset.icon ? ICON_MAP[asset.icon] : Square;
  const startDrag = useUIStore((state) => state.startDrag);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    startDrag(asset.id);
    onDragStart();
  };

  const handleDragEnd = () => {
    // Drag end is handled by canvas container
  };

  const handleClickPlace = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickPlace(asset.id);
  };

  return (
    <TooltipProvider>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          'flex items-center gap-3 rounded-md border border-border bg-card p-3',
          'cursor-grab active:cursor-grabbing',
          'hover:border-primary/50 hover:bg-accent/50',
          'transition-colors duration-150'
        )}
      >
        <div className="flex size-8 items-center justify-center rounded bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">{asset.name}</p>
            {asset.canMoveY && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center size-4 rounded bg-primary/10">
                    <ArrowUpDown className="size-3 text-primary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Wall-mounted (adjustable height)</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {(asset.dimensions.width * 100).toFixed(0)} x{' '}
            {(asset.dimensions.depth * 100).toFixed(0)} cm
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={handleClickPlace}
            >
              <Plus className="size-4" />
              <span className="sr-only">Add to scene</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Click to add to scene</p>
          </TooltipContent>
        </Tooltip>
        <GripVertical className="size-4 text-muted-foreground/50" />
      </div>
    </TooltipProvider>
  );
}

interface AssetCategoryGroupProps {
  category: AssetCategory;
  assets: Asset[];
  onAssetDragStart: () => void;
  onClickPlace: (assetId: string) => void;
}

function AssetCategoryGroup({ category, assets, onAssetDragStart, onClickPlace }: AssetCategoryGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 py-1.5 h-auto"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {CATEGORY_LABELS[category]}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 py-2">
        {assets.map((asset) => (
          <AssetItem
            key={asset.id}
            asset={asset}
            onDragStart={onAssetDragStart}
            onClickPlace={onClickPlace}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AssetPanel() {
  const scene = useSceneStore((state) => state.scene);
  const placeAsset = useSceneStore((state) => state.placeAsset);
  const getAssetLibrary = useSceneStore((state) => state.getAssetLibrary);
  const selectAsset = useUIStore((state) => state.selectAsset);

  // Handle click-to-place
  const handleClickPlace = useCallback((assetId: string) => {
    if (!scene) return;

    const asset = getAssetById(assetId);
    if (!asset) return;

    // Place at center of room (NW corner origin)
    const initialPosition: Position3D = {
      x: scene.room.dimensions.width / 2,
      y: asset.dimensions.height / 2,
      z: scene.room.dimensions.depth / 2,
    };

    // Apply snapping
    const snapResult = calculateSnappedPosition(
      initialPosition,
      asset,
      scene.room
    );

    // Check collision
    const assetLibrary = getAssetLibrary();
    const collision = checkCollision(
      snapResult.position,
      asset.dimensions,
      scene.placedAssets,
      assetLibrary
    );

    let finalPosition = snapResult.position;

    if (collision.collides) {
      // Try to find a valid position nearby
      const validPosition = findNearestValidPosition(
        snapResult.position,
        asset.dimensions,
        scene.placedAssets,
        assetLibrary,
        scene.room
      );

      if (validPosition) {
        finalPosition = validPosition;
      }
      // Even if no valid position, still place it (user can move it)
    }

    // Place the asset
    const placedAssetId = placeAsset(assetId, finalPosition);
    
    // Select the newly placed asset
    if (placedAssetId) {
      selectAsset(placedAssetId);
    }
  }, [scene, placeAsset, getAssetLibrary, selectAsset]);

  // Group assets by category
  const assetsByCategory = DEFAULT_ASSETS.reduce(
    (acc, asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }
      acc[asset.category].push(asset);
      return acc;
    },
    {} as Record<AssetCategory, Asset[]>
  );

  const categories: AssetCategory[] = ['appliance', 'storage', 'furniture'];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Assets</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag or click + to add items
        </p>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="py-2 space-y-1">
          {categories.map((category) => (
            <AssetCategoryGroup
              key={category}
              category={category}
              assets={assetsByCategory[category] || []}
              onAssetDragStart={() => {}}
              onClickPlace={handleClickPlace}
            />
          ))}
        </div>

        {/* Future: Asset Creator placeholder */}
        <div className="py-4 border-t border-border mt-4">
          <Button
            variant="outline"
            className="w-full opacity-50 cursor-not-allowed"
            disabled
          >
            Create Custom Asset
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Coming soon
          </p>
        </div>
      </ScrollArea>

      
    </div>
  );
}
