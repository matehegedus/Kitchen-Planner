'use client';

import { User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Placeholder for future user management
// Will be moved to backend

export function UserPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Account</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sign in to save designs
        </p>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <div className="flex flex-col items-center py-6">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <User className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">Guest User</p>
          <p className="text-xs text-muted-foreground">
            Designs saved locally
          </p>
        </div>

        {/* Placeholder login form */}
        <div className="space-y-3 opacity-50 pointer-events-none">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com"
              className="h-8"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              className="h-8"
              disabled
            />
          </div>
          <Button className="w-full" size="sm" disabled>
            <LogIn className="size-4 mr-2" />
            Sign In
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground pt-4">
          User accounts coming soon
        </p>
      </div>
    </div>
  );
}
