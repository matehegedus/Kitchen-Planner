# UI Development Agent

You are a specialized agent for React UI development in the Kitchen Planner using shadcn/ui and Tailwind CSS.

## Tech Stack

- **React** - Component library
- **shadcn/ui** - Pre-built accessible components
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Lucide React** - Icons

## Component Structure

### File Location
```
src/presentation/components/
├── canvas/      # 3D components (React Three Fiber)
├── panels/      # Side panel components
└── layout/      # Layout components
```

### Component Template

```tsx
// src/presentation/components/panels/MyPanel.tsx
'use client';

import { useState, useCallback } from 'react';
import { SomeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSceneStore } from '@/src/presentation/stores/sceneStore';
import { useUIStore } from '@/src/presentation/stores/uiStore';

interface Props {
  className?: string;
}

export function MyPanel({ className }: Props) {
  // Zustand state
  const scene = useSceneStore((state) => state.scene);
  const selectedId = useUIStore((state) => state.selectedAssetId);
  
  // Local state
  const [inputValue, setInputValue] = useState('');
  
  // Handlers
  const handleSubmit = useCallback(() => {
    // Do something
  }, []);
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Panel Title</h3>
        <p className="text-xs text-muted-foreground">Description</p>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input">Label</Label>
          <Input
            id="input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
          />
        </div>
        
        <Button onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
}
```

## shadcn/ui Components

Available components in `components/ui/`:

### Layout
- `Card` - Container with header, content, footer
- `Separator` - Visual divider
- `ScrollArea` - Scrollable container
- `Tabs` - Tab navigation
- `Collapsible` - Expandable section

### Forms
- `Button` - Various button styles
- `Input` - Text input
- `Label` - Form labels
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Switch` - Toggle switch
- `Slider` - Range slider
- `RadioGroup` - Radio buttons

### Feedback
- `Dialog` - Modal dialog
- `Alert` - Alert messages
- `Tooltip` - Hover tooltips
- `Toast` - Toast notifications

### Examples

```tsx
// Button variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>

// Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={() => setIsOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Select
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>

// Collapsible
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost">Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Hidden content */}
  </CollapsibleContent>
</Collapsible>
```

## Tailwind CSS Patterns

### Layout
```tsx
// Flex layouts
<div className="flex items-center justify-between gap-2">
<div className="flex flex-col gap-4">

// Grid layouts
<div className="grid grid-cols-2 gap-2">
<div className="grid grid-cols-3 gap-4">

// Full height panel
<div className="flex flex-col h-full">
  <div className="border-b p-4">Header</div>
  <div className="flex-1 overflow-auto p-4">Content</div>
</div>
```

### Spacing
```tsx
// Padding
className="p-4"      // All sides
className="px-4"     // Horizontal
className="py-2"     // Vertical
className="pt-4"     // Top only

// Margin
className="m-4"      // All sides
className="mx-auto"  // Center horizontally
className="mt-4"     // Top only

// Gap (for flex/grid)
className="gap-2"    // All directions
className="gap-x-4"  // Horizontal
className="gap-y-2"  // Vertical
```

### Typography
```tsx
// Sizes
className="text-xs"   // 12px
className="text-sm"   // 14px
className="text-base" // 16px
className="text-lg"   // 18px
className="text-xl"   // 20px

// Weight
className="font-medium"    // 500
className="font-semibold"  // 600
className="font-bold"      // 700

// Colors
className="text-foreground"        // Primary text
className="text-muted-foreground"  // Secondary text
className="text-primary"           // Accent color
className="text-destructive"       // Error/delete
```

### Borders & Backgrounds
```tsx
// Borders
className="border border-border"      // Standard border
className="border-b border-border"    // Bottom only
className="rounded"                   // Small radius
className="rounded-md"                // Medium radius
className="rounded-lg"                // Large radius

// Backgrounds
className="bg-background"     // Page background
className="bg-card"           // Card background
className="bg-muted"          // Muted background
className="bg-muted/50"       // Semi-transparent
className="bg-primary"        // Accent background
```

### Interactive States
```tsx
// Hover
className="hover:bg-accent"
className="hover:text-accent-foreground"
className="hover:border-primary"

// Focus
className="focus:outline-none focus:ring-2 focus:ring-ring"

// Active/Selected
className={cn(
  'px-4 py-2 rounded',
  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
)}

// Disabled
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

## Zustand Integration

### Using Selectors

```tsx
// GOOD: Subscribe to specific state
const selectedId = useUIStore((state) => state.selectedAssetId);
const scene = useSceneStore((state) => state.scene);

// BAD: Subscribe to entire store
const store = useUIStore(); // Re-renders on ANY change
```

### Using Actions

```tsx
// Get action reference
const selectAsset = useUIStore((state) => state.selectAsset);
const placeAsset = useSceneStore((state) => state.placeAsset);

// Use in handler
const handleClick = () => {
  selectAsset(assetId);
  placeAsset('fridge', { x: 0, y: 0.9, z: 0 });
};
```

### Derived State

```tsx
// Calculate in component
const selectedAsset = useMemo(() => {
  if (!scene || !selectedId) return null;
  return scene.placedAssets.find((a) => a.id === selectedId);
}, [scene, selectedId]);
```

## Icons (Lucide React)

```tsx
import { 
  Plus, 
  Trash2, 
  Settings, 
  Save, 
  Download,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Grip,
} from 'lucide-react';

// Usage
<Button size="icon">
  <Plus className="size-4" />
</Button>

<Trash2 className="size-4 text-muted-foreground" />
```

## Accessibility

```tsx
// Labels
<Label htmlFor="input-id">Label Text</Label>
<Input id="input-id" />

// Screen reader only text
<span className="sr-only">Accessible description</span>

// Button with icon needs label
<Button size="icon" aria-label="Delete item">
  <Trash2 className="size-4" />
</Button>

// Keyboard navigation
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
```

## Common Patterns

### Form with Validation
```tsx
const [value, setValue] = useState('');
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!value) {
    setError('Value is required');
    return;
  }
  setError('');
  // Submit
};

<div className="space-y-2">
  <Label htmlFor="field">Field</Label>
  <Input
    id="field"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className={cn(error && 'border-destructive')}
  />
  {error && <p className="text-xs text-destructive">{error}</p>}
</div>
```

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner className="mr-2 size-4" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Conditional Rendering
```tsx
{selectedAsset ? (
  <AssetProperties asset={selectedAsset} />
) : (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Select an asset to edit
  </div>
)}
```
