import type { Dimensions, WallPosition } from '../../shared/types';
import type { Wall } from './Wall';

export interface Room {
  id: string;
  dimensions: Dimensions;
  walls: Wall[];
  floorColor: string;
}

export function createRoom(
  id: string,
  dimensions: Dimensions,
  enabledWalls: WallPosition[] = ['north', 'east', 'west']
): Room {
  const walls: Wall[] = [
    { 
      id: `${id}-north`, 
      position: 'north', 
      enabled: enabledWalls.includes('north'),
      thickness: 0.1 
    },
    { 
      id: `${id}-south`, 
      position: 'south', 
      enabled: enabledWalls.includes('south'),
      thickness: 0.1 
    },
    { 
      id: `${id}-east`, 
      position: 'east', 
      enabled: enabledWalls.includes('east'),
      thickness: 0.1 
    },
    { 
      id: `${id}-west`, 
      position: 'west', 
      enabled: enabledWalls.includes('west'),
      thickness: 0.1 
    },
  ];

  return {
    id,
    dimensions,
    walls,
    floorColor: '#e8e0d5', // warm neutral floor
  };
}

export function updateRoomDimensions(room: Room, dimensions: Dimensions): Room {
  return { ...room, dimensions };
}

export function toggleWall(room: Room, wallPosition: WallPosition): Room {
  return {
    ...room,
    walls: room.walls.map((wall) =>
      wall.position === wallPosition
        ? { ...wall, enabled: !wall.enabled }
        : wall
    ),
  };
}

export function setWallEnabled(
  room: Room,
  wallPosition: WallPosition,
  enabled: boolean
): Room {
  return {
    ...room,
    walls: room.walls.map((wall) =>
      wall.position === wallPosition ? { ...wall, enabled } : wall
    ),
  };
}
