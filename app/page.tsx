'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/components/ui/spinner';

// Dynamic import to avoid SSR issues with Three.js
const PlannerLayout = dynamic(
  () =>
    import('@/src/presentation/components/layout/PlannerLayout').then(
      (mod) => mod.PlannerLayout
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading Kitchen Planner...</p>
        </div>
      </div>
    ),
  }
);

export default function KitchenPlannerPage() {
  return <PlannerLayout />;
}
