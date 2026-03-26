'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { Room } from '@/src/domains/room';

interface Room3DProps {
  room: Room;
}

export function Room3D({ room }: Room3DProps) {
  const { width, height, depth } = room.dimensions;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

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
      {/* Floor */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Walls */}
      {enabledWalls.map((wall) => {
        const thickness = wall.thickness;
        let position: [number, number, number] = [0, 0, 0];
        let size: [number, number, number] = [0, 0, 0];

        switch (wall.position) {
          case 'north':
            position = [0, height / 2, -halfDepth + thickness / 2];
            size = [width, height, thickness];
            break;
          case 'south':
            position = [0, height / 2, halfDepth - thickness / 2];
            size = [width, height, thickness];
            break;
          case 'east':
            position = [halfWidth - thickness / 2, height / 2, 0];
            size = [thickness, height, depth];
            break;
          case 'west':
            position = [-halfWidth + thickness / 2, height / 2, 0];
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
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const postSize = 0.02;

  const positions: [number, number, number][] = [
    [-halfWidth, height / 2, -halfDepth],
    [halfWidth, height / 2, -halfDepth],
    [-halfWidth, height / 2, halfDepth],
    [halfWidth, height / 2, halfDepth],
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
