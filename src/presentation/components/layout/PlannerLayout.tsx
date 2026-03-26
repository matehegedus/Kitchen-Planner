'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Grid3X3, 
  Ruler, 
  Settings,
  Box,
  Home,
  Palette,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { KitchenCanvas } from '../canvas/KitchenCanvas';
import { AssetPanel } from '../panels/AssetPanel';
import { RoomSetupPanel } from '../panels/RoomSetupPanel';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { UserPanel } from '../panels/UserPanel';
import { SaveDialog } from './SaveDialog';
import { LoadDialog } from './LoadDialog';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore, type PanelMode } from '@/src/presentation/stores/uiStore';

const PANEL_TABS: { value: PanelMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'assets', label: 'Assets', icon: Box },
  { value: 'room', label: 'Room', icon: Home },
  { value: 'properties', label: 'Properties', icon: Palette },
  { value: 'user', label: 'User', icon: User },
];

export function PlannerLayout() {
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  const scene = useSceneStore((state) => state.scene);
  const clearScene = useSceneStore((state) => state.clearScene);
  
  const activePanel = useUIStore((state) => state.activePanel);
  const setActivePanel = useUIStore((state) => state.setActivePanel);
  const showGrid = useUIStore((state) => state.showGrid);
  const toggleGrid = useUIStore((state) => state.toggleGrid);
  const showMeasurements = useUIStore((state) => state.showMeasurements);
  const toggleMeasurements = useUIStore((state) => state.toggleMeasurements);
  const showSaveDialog = useUIStore((state) => state.showSaveDialog);
  const setShowSaveDialog = useUIStore((state) => state.setShowSaveDialog);
  const showLoadDialog = useUIStore((state) => state.showLoadDialog);
  const setShowLoadDialog = useUIStore((state) => state.setShowLoadDialog);
  const endDrag = useUIStore((state) => state.endDrag);

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
      // Ctrl/Cmd + O to load
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        setShowLoadDialog(true);
      }
      // G to toggle grid
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        toggleGrid();
      }
      // M to toggle measurements
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
        toggleMeasurements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowSaveDialog, setShowLoadDialog, toggleGrid, toggleMeasurements]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'assets':
        return <AssetPanel />;
      case 'room':
        return <RoomSetupPanel />;
      case 'properties':
        return <PropertiesPanel />;
      case 'user':
        return <UserPanel />;
      default:
        return <AssetPanel />;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary flex items-center justify-center">
              <Box className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">Kitchen Planner</h1>
              {scene && (
                <p className="text-xs text-muted-foreground">
                  {scene.placedAssets.length} items
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggles */}
            <div className="flex items-center gap-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? 'secondary' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={toggleGrid}
                  >
                    <Grid3X3 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Grid (G)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showMeasurements ? 'secondary' : 'ghost'}
                    size="icon"
                    className="size-8"
                    onClick={toggleMeasurements}
                  >
                    <Ruler className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle Measurements (M)</TooltipContent>
              </Tooltip>
            </div>

            {/* Scene actions */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="size-4 mr-2" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Scene (Ctrl+S)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoadDialog(true)}
                >
                  <FolderOpen className="size-4 mr-2" />
                  Load
                </Button>
              </TooltipTrigger>
              <TooltipContent>Load Scene (Ctrl+O)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => setShowClearDialog(true)}
                  disabled={!scene || scene.placedAssets.length === 0}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear All Items</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas */}
          <main
            className="flex-1 relative"
            onDragEnd={handleDragEnd}
          >
            <KitchenCanvas />
          </main>

          {/* Side panel */}
          <aside className="w-72 border-l border-border flex flex-col bg-card shrink-0">
            {/* Panel tabs */}
            <Tabs
              value={activePanel}
              onValueChange={(v) => setActivePanel(v as PanelMode)}
              className="flex flex-col h-full"
            >
              <TabsList className="grid w-full grid-cols-4 h-10 rounded-none border-b border-border bg-transparent p-0">
                {PANEL_TABS.map((tab) => (
                  <Tooltip key={tab.value}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={tab.value}
                        className={cn(
                          'rounded-none border-b-2 border-transparent',
                          'data-[state=active]:border-primary data-[state=active]:bg-transparent',
                          'data-[state=active]:shadow-none'
                        )}
                      >
                        <tab.icon className="size-4" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{tab.label}</TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>

              <div className="flex-1 overflow-hidden">
                {renderPanel()}
              </div>
            </Tabs>
          </aside>
        </div>

        {/* Dialogs */}
        <SaveDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} />
        <LoadDialog open={showLoadDialog} onOpenChange={setShowLoadDialog} />

        {/* Clear confirmation dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all items?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all placed items from your kitchen design.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearScene();
                  setShowClearDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
