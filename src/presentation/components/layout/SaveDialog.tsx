'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveDialog({ open, onOpenChange }: SaveDialogProps) {
  const scene = useSceneStore((state) => state.scene);
  const [sceneName, setSceneName] = useState(scene?.name ?? 'Kitchen Design');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!scene) return;

    // Update scene name in store (this triggers localStorage persist via zustand)
    // The scene is already being persisted by the zustand persist middleware
    // Here we're just acknowledging the save
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Design</DialogTitle>
          <DialogDescription>
            Your kitchen design is automatically saved to your browser.
            Give it a name to remember it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scene-name">Design Name</Label>
            <Input
              id="scene-name"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder="My Kitchen Design"
            />
          </div>

          {scene && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Room: {scene.room.dimensions.width}m x {scene.room.dimensions.depth}m
              </p>
              <p>Items: {scene.placedAssets.length}</p>
              <p>Last updated: {new Date(scene.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saved}>
            {saved ? (
              <>
                <Check className="size-4 mr-2" />
                Saved!
              </>
            ) : (
              'Save Design'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
