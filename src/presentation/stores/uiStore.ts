import { create } from 'zustand';

export type PanelMode = 'assets' | 'room' | 'properties' | 'user';
export type ViewMode = '3d' | 'topdown';

// Movement step sizes in meters
export type MovementStep = 0.001 | 0.01 | 0.1; // 1mm, 10mm, 100mm

interface UIState {
  // Selection
  selectedAssetId: string | null;
  hoveredAssetId: string | null;
  
  // Dragging from asset panel (HTML5 drag)
  isDragging: boolean;
  dragAssetType: string | null; // Asset ID being dragged from panel
  
  // Dragging asset in scene (Three.js pointer events)
  isDraggingSceneAsset: boolean;
  
  // Movement settings
  movementStep: MovementStep; // Step size for movement snapping
  
  // Panels
  activePanel: PanelMode;
  showMeasurements: boolean;
  
  // View
  viewMode: ViewMode;
  showGrid: boolean;
  
  // Modals
  showSaveDialog: boolean;
  showLoadDialog: boolean;
  showRoomSetup: boolean;
  
  // Actions
  selectAsset: (id: string | null) => void;
  setHoveredAsset: (id: string | null) => void;
  startDrag: (assetType: string) => void;
  endDrag: () => void;
  startSceneDrag: () => void;
  endSceneDrag: () => void;
  setMovementStep: (step: MovementStep) => void;
  setActivePanel: (panel: PanelMode) => void;
  toggleMeasurements: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  setShowSaveDialog: (show: boolean) => void;
  setShowLoadDialog: (show: boolean) => void;
  setShowRoomSetup: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  selectedAssetId: null,
  hoveredAssetId: null,
  isDragging: false,
  dragAssetType: null,
  isDraggingSceneAsset: false,
  movementStep: 0.001, // Default: 1mm
  activePanel: 'assets',
  showMeasurements: true,
  viewMode: '3d',
  showGrid: true,
  showSaveDialog: false,
  showLoadDialog: false,
  showRoomSetup: false,

  // Actions
  selectAsset: (id) => set({ 
    selectedAssetId: id,
    // Auto-switch to properties panel when selecting an asset
    activePanel: id ? 'properties' : 'assets',
  }),
  
  setHoveredAsset: (id) => set({ hoveredAssetId: id }),
  
  startDrag: (assetType) => set({ isDragging: true, dragAssetType: assetType }),
  
  endDrag: () => set({ isDragging: false, dragAssetType: null }),
  
  startSceneDrag: () => set({ isDraggingSceneAsset: true }),
  
  endSceneDrag: () => set({ isDraggingSceneAsset: false }),
  
  setMovementStep: (step) => set({ movementStep: step }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  toggleMeasurements: () => set((state) => ({ showMeasurements: !state.showMeasurements })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  setShowSaveDialog: (show) => set({ showSaveDialog: show }),
  
  setShowLoadDialog: (show) => set({ showLoadDialog: show }),
  
  setShowRoomSetup: (show) => set({ showRoomSetup: show }),
}));
