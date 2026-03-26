import type { 
  Dimensions, 
  SnapBehavior, 
  AssetCategory, 
  AssetTexture 
} from '../../shared/types';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  dimensions: Dimensions;
  defaultTexture: AssetTexture;
  snapBehavior: SnapBehavior;
  icon?: string; // Lucide icon name
}

// Pre-filled asset library
export const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'fridge',
    name: 'Refrigerator',
    category: 'appliance',
    dimensions: { width: 0.8, height: 1.8, depth: 0.7 },
    defaultTexture: { type: 'stainless', color: '#a8a8a8', metalness: 0.8, roughness: 0.3 },
    snapBehavior: 'floor',
    icon: 'Refrigerator',
  },
  {
    id: 'oven',
    name: 'Oven',
    category: 'appliance',
    dimensions: { width: 0.6, height: 0.9, depth: 0.6 },
    defaultTexture: { type: 'stainless', color: '#b0b0b0', metalness: 0.7, roughness: 0.35 },
    snapBehavior: 'floor',
    icon: 'CookingPot',
  },
  {
    id: 'cabinet-base',
    name: 'Base Cabinet',
    category: 'storage',
    dimensions: { width: 0.6, height: 0.9, depth: 0.6 },
    defaultTexture: { type: 'wood', color: '#8b6914', roughness: 0.7 },
    snapBehavior: 'floor',
    icon: 'LayoutGrid',
  },
  {
    id: 'cabinet-wall',
    name: 'Wall Cabinet',
    category: 'storage',
    dimensions: { width: 0.6, height: 0.6, depth: 0.35 },
    defaultTexture: { type: 'wood', color: '#8b6914', roughness: 0.7 },
    snapBehavior: 'wall',
    icon: 'Square',
  },
  {
    id: 'shelf',
    name: 'Shelf',
    category: 'storage',
    dimensions: { width: 0.8, height: 0.03, depth: 0.25 },
    defaultTexture: { type: 'wood', color: '#a67c52', roughness: 0.6 },
    snapBehavior: 'wall',
    icon: 'Minus',
  },
  {
    id: 'kitchen-island',
    name: 'Kitchen Island',
    category: 'furniture',
    dimensions: { width: 1.2, height: 0.9, depth: 0.8 },
    defaultTexture: { type: 'wood', color: '#6b4423', roughness: 0.65 },
    snapBehavior: 'floor',
    icon: 'Table2',
  },
  {
    id: 'dishwasher',
    name: 'Dishwasher',
    category: 'appliance',
    dimensions: { width: 0.6, height: 0.85, depth: 0.6 },
    defaultTexture: { type: 'stainless', color: '#c0c0c0', metalness: 0.75, roughness: 0.3 },
    snapBehavior: 'floor',
    icon: 'WashingMachine',
  },
  {
    id: 'sink-unit',
    name: 'Sink Unit',
    category: 'furniture',
    dimensions: { width: 0.8, height: 0.9, depth: 0.6 },
    defaultTexture: { type: 'white', color: '#f5f5f5', roughness: 0.4 },
    snapBehavior: 'floor',
    icon: 'Bath',
  },
];

export function getAssetById(id: string): Asset | undefined {
  return DEFAULT_ASSETS.find((asset) => asset.id === id);
}

export function getAssetsByCategory(category: AssetCategory): Asset[] {
  return DEFAULT_ASSETS.filter((asset) => asset.category === category);
}
