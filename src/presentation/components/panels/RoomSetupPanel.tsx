'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import type { WallPosition, Dimensions } from '@/src/domains/shared/types';

const WALL_LABELS: Record<WallPosition, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
};

export function RoomSetupPanel() {
  const scene = useSceneStore((state) => state.scene);
  const updateDimensions = useSceneStore((state) => state.updateDimensions);
  const toggleRoomWall = useSceneStore((state) => state.toggleRoomWall);

  const [localDimensions, setLocalDimensions] = useState<Dimensions>({
    width: 4,
    height: 2.5,
    depth: 3,
  });

  useEffect(() => {
    if (scene) {
      setLocalDimensions(scene.room.dimensions);
    }
  }, [scene]);

  if (!scene) return null;

  const handleDimensionChange = (key: keyof Dimensions, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 20) {
      const newDimensions = { ...localDimensions, [key]: numValue };
      setLocalDimensions(newDimensions);
      updateDimensions(newDimensions);
    }
  };

  const walls: WallPosition[] = ['north', 'east', 'south', 'west'];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Room Setup</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure dimensions and walls
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dimensions
          </h4>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-xs">
                Width (meters)
              </Label>
              <Input
                id="width"
                type="number"
                min={1}
                max={20}
                step={0.1}
                value={localDimensions.width}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth" className="text-xs">
                Depth (meters)
              </Label>
              <Input
                id="depth"
                type="number"
                min={1}
                max={20}
                step={0.1}
                value={localDimensions.depth}
                onChange={(e) => handleDimensionChange('depth', e.target.value)}
                className="h-8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-xs">
                Height (meters)
              </Label>
              <Input
                id="height"
                type="number"
                min={2}
                max={5}
                step={0.1}
                value={localDimensions.height}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Walls */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Walls
          </h4>
          
          {/* Visual wall toggle */}
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded-sm" />
            
            {/* Wall indicators */}
            {walls.map((wallPos) => {
              const wall = scene.room.walls.find((w) => w.position === wallPos);
              const isEnabled = wall?.enabled ?? false;

              let positionClass = '';
              switch (wallPos) {
                case 'north':
                  positionClass = 'top-0 left-4 right-4 h-4';
                  break;
                case 'south':
                  positionClass = 'bottom-0 left-4 right-4 h-4';
                  break;
                case 'east':
                  positionClass = 'right-0 top-4 bottom-4 w-4';
                  break;
                case 'west':
                  positionClass = 'left-0 top-4 bottom-4 w-4';
                  break;
              }

              return (
                <button
                  key={wallPos}
                  onClick={() => toggleRoomWall(wallPos)}
                  className={cn(
                    'absolute rounded-sm transition-colors',
                    positionClass,
                    isEnabled
                      ? 'bg-primary hover:bg-primary/80'
                      : 'bg-muted hover:bg-muted-foreground/20'
                  )}
                  title={`${WALL_LABELS[wallPos]} wall: ${isEnabled ? 'Enabled' : 'Disabled'}`}
                />
              );
            })}

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                Click walls to toggle
              </span>
            </div>
          </div>

          {/* Wall toggles list */}
          <div className="space-y-2">
            {walls.map((wallPos) => {
              const wall = scene.room.walls.find((w) => w.position === wallPos);
              const isEnabled = wall?.enabled ?? false;

              return (
                <div
                  key={wallPos}
                  className="flex items-center justify-between py-2"
                >
                  <Label htmlFor={`wall-${wallPos}`} className="text-sm">
                    {WALL_LABELS[wallPos]} Wall
                  </Label>
                  <Switch
                    id={`wall-${wallPos}`}
                    checked={isEnabled}
                    onCheckedChange={() => toggleRoomWall(wallPos)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
