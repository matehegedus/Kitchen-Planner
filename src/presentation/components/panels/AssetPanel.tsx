'use client';

import { useState } from 'react';
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
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DEFAULT_ASSETS, type Asset, type AssetCategory } from '@/src/domains/asset';
import { useUIStore } from '@/src/presentation/stores/uiStore';

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
}

function AssetItem({ asset, onDragStart }: AssetItemProps) {
  const Icon = asset.icon ? ICON_MAP[asset.icon] : Square;
  const startDrag = useUIStore((state) => state.startDrag);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
    startDrag(asset.id);
    onDragStart();
  };

  const handleDragEnd = () => {
    // Drag end is handled by DropZone
  };

  return (
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
        <p className="text-sm font-medium truncate">{asset.name}</p>
        <p className="text-xs text-muted-foreground">
          {(asset.dimensions.width * 100).toFixed(0)} x{' '}
          {(asset.dimensions.depth * 100).toFixed(0)} cm
        </p>
      </div>
      <GripVertical className="size-4 text-muted-foreground/50" />
    </div>
  );
}

interface AssetCategoryGroupProps {
  category: AssetCategory;
  assets: Asset[];
  onAssetDragStart: () => void;
}

function AssetCategoryGroup({ category, assets, onAssetDragStart }: AssetCategoryGroupProps) {
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
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AssetPanel() {
  const [isDraggingFromPanel, setIsDraggingFromPanel] = useState(false);

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
          Drag items to the canvas
        </p>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="py-2 space-y-1">
          {categories.map((category) => (
            <AssetCategoryGroup
              key={category}
              category={category}
              assets={assetsByCategory[category] || []}
              onAssetDragStart={() => setIsDraggingFromPanel(true)}
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

      {isDraggingFromPanel && (
        <div
          className="fixed inset-0 z-50"
          onDragEnd={() => setIsDraggingFromPanel(false)}
          onDrop={() => setIsDraggingFromPanel(false)}
        />
      )}
    </div>
  );
}
