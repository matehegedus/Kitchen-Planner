import type { WallPosition } from '../../shared/types';

export interface Wall {
  id: string;
  position: WallPosition;
  enabled: boolean;
  thickness: number; // in meters
}
