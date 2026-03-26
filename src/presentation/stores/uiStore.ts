import { create } from 'zustand';

export type PanelMode = 'assets' | 'room' | 'properties' | 'user';
export type ViewMode = '3d' | 'topdown';

interface UIState {
  // Selection
  selectedAssetId: string | null;
  hoveredAssetId: string | null;
  
  // Dragging
  isDragging: boolean;
  dragAssetType: string | null; // Asset ID being dragged from panel
  
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
  activePanel: 'assets',
  showMeasurements: true,
  viewMode: '3d',
  showGrid: true,
  showSaveDialog: false,
  showLoadDialog: false,
  showRoomSetup: false,

  // Actions
  selectAsset: (id) => set({ selectedAssetId: id }),
  
  setHoveredAsset: (id) => set({ hoveredAssetId: id }),
  
  startDrag: (assetType) => set({ isDragging: true, dragAssetType: assetType }),
  
  endDrag: () => set({ isDragging: false, dragAssetType: null }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  toggleMeasurements: () => set((state) => ({ showMeasurements: !state.showMeasurements })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  setShowSaveDialog: (show) => set({ showSaveDialog: show }),
  
  setShowLoadDialog: (show) => set({ showLoadDialog: show }),
  
  setShowRoomSetup: (show) => set({ showRoomSetup: show }),
}));
