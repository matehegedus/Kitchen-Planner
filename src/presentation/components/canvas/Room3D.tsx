'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Room } from '@/src/domains/room';

interface Room3DProps {
  room: Room;
}

/**
 * Room3D renders the room with NW corner (North-West) at origin (0, 0, 0).
 * 
 * Coordinate system:
 * - Origin (0,0,0) is at NW corner (where north and west walls meet)
 * - X increases eastward (towards east wall)
 * - Y increases upward (floor is at Y=0)
 * - Z increases southward (towards south wall)
 * 
 * This means:
 * - North wall is at Z = 0
 * - West wall is at X = 0
 * - South wall is at Z = depth
 * - East wall is at X = width
 */
export function Room3D({ room }: Room3DProps) {
  const { width, height, depth } = room.dimensions;

  // Memoize materials
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: room.floorColor,
        roughness: 0.8,
        metalness: 0.1,
      }),
    [room.floorColor]
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Get enabled walls
  const enabledWalls = room.walls.filter((w) => w.enabled);

  return (
    <group>
      {/* Floor - centered at (width/2, 0, depth/2) so it spans from 0 to width/depth */}
      <mesh
        position={[width / 2, 0, depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Walls - positioned relative to NW corner origin */}
      {enabledWalls.map((wall) => {
        const thickness = wall.thickness;
        let position: [number, number, number] = [0, 0, 0];
        let size: [number, number, number] = [0, 0, 0];

        switch (wall.position) {
          case 'north':
            // North wall at Z = thickness/2, spans full width
            position = [width / 2, height / 2, thickness / 2];
            size = [width, height, thickness];
            break;
          case 'south':
            // South wall at Z = depth - thickness/2
            position = [width / 2, height / 2, depth - thickness / 2];
            size = [width, height, thickness];
            break;
          case 'east':
            // East wall at X = width - thickness/2
            position = [width - thickness / 2, height / 2, depth / 2];
            size = [thickness, height, depth];
            break;
          case 'west':
            // West wall at X = thickness/2
            position = [thickness / 2, height / 2, depth / 2];
            size = [thickness, height, depth];
            break;
        }

        return (
          <mesh
            key={wall.id}
            position={position}
            castShadow
            receiveShadow
          >
            <boxGeometry args={size} />
            <primitive object={wallMaterial} attach="material" />
          </mesh>
        );
      })}

      {/* Corner posts for visual reference */}
      <CornerPosts width={width} depth={depth} height={height} />
    </group>
  );
}

function CornerPosts({
  width,
  depth,
  height,
}: {
  width: number;
  depth: number;
  height: number;
}) {
  const postSize = 0.02;

  // Positions at corners: NW (origin), NE, SW, SE
  const positions: [number, number, number][] = [
    [0, height / 2, 0],           // NW corner (origin)
    [width, height / 2, 0],       // NE corner
    [0, height / 2, depth],       // SW corner
    [width, height / 2, depth],   // SE corner
  ];

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#666666',
        transparent: true,
        opacity: 0.5,
      }),
    []
  );

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[postSize, height, postSize]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
