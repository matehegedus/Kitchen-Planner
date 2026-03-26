'use client';

import { useState, useEffect } from 'react';
import { FileJson, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import type { Scene } from '@/src/domains/scene';

interface SavedScene {
  id: string;
  name: string;
  updatedAt: string;
  itemCount: number;
}

interface LoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoadDialog({ open, onOpenChange }: LoadDialogProps) {
  const scene = useSceneStore((state) => state.scene);
  const loadScene = useSceneStore((state) => state.loadScene);
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);

  useEffect(() => {
    if (open) {
      // Load saved scenes from localStorage
      const scenes: SavedScene[] = [];
      
      // Check for the main persisted scene
      try {
        const stored = localStorage.getItem('kitchen-planner-scene');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.state?.scene) {
            const s = parsed.state.scene as Scene;
            scenes.push({
              id: s.id,
              name: s.name,
              updatedAt: s.updatedAt,
              itemCount: s.placedAssets.length,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load saved scenes', e);
      }

      // Check for additional saved scenes
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('kitchen-design-')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const s = JSON.parse(stored) as Scene;
              if (!scenes.find((sc) => sc.id === s.id)) {
                scenes.push({
                  id: s.id,
                  name: s.name,
                  updatedAt: s.updatedAt,
                  itemCount: s.placedAssets.length,
                });
              }
            }
          } catch (e) {
            // Skip invalid entries
          }
        }
      }

      setSavedScenes(scenes);
    }
  }, [open]);

  const handleLoad = (sceneId: string) => {
    // Try to load from localStorage
    try {
      // Check main store
      const stored = localStorage.getItem('kitchen-planner-scene');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state?.scene?.id === sceneId) {
          loadScene(parsed.state.scene);
          onOpenChange(false);
          return;
        }
      }

      // Check additional saves
      const saved = localStorage.getItem(`kitchen-design-${sceneId}`);
      if (saved) {
        loadScene(JSON.parse(saved));
        onOpenChange(false);
      }
    } catch (e) {
      console.error('Failed to load scene', e);
    }
  };

  const handleDelete = (sceneId: string) => {
    try {
      localStorage.removeItem(`kitchen-design-${sceneId}`);
      setSavedScenes((prev) => prev.filter((s) => s.id !== sceneId));
    } catch (e) {
      console.error('Failed to delete scene', e);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text) as Scene;
        
        // Validate structure
        if (imported.id && imported.room && Array.isArray(imported.placedAssets)) {
          loadScene(imported);
          onOpenChange(false);
        } else {
          alert('Invalid scene file format');
        }
      } catch (err) {
        alert('Failed to import file');
      }
    };

    input.click();
  };

  const handleExport = () => {
    if (!scene) return;

    const blob = new Blob([JSON.stringify(scene, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scene.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Load Design</DialogTitle>
          <DialogDescription>
            Load a previously saved kitchen design or import from a file.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {savedScenes.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {savedScenes.map((savedScene) => (
                  <div
                    key={savedScene.id}
                    className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-accent/50 transition-colors"
                  >
                    <FileJson className="size-8 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {savedScene.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {savedScene.itemCount} items |{' '}
                        {new Date(savedScene.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoad(savedScene.id)}
                      >
                        Load
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(savedScene.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileJson className="size-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No saved designs</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your designs will appear here after you save them
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleImport}>
            <Upload className="size-4 mr-2" />
            Import JSON
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleExport}
            disabled={!scene}
          >
            Export Current
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
