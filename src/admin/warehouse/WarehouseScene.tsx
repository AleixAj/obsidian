import monoFont from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url";
import { Edges, OrbitControls, Text } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useState } from "react";
import type { Warehouse, WarehouseLocation } from "../api";
import { fillRatio, STATE_COLORS } from "./states";

/**
 * The 3D view of the warehouse, made with react-three-fiber
 * (React components that draw with Three.js / WebGL).
 *
 * How the positions work (x, y, z):
 *   - x: each aisle (A, B, C...) is a row of shelves, one next to the other
 *   - z: the bays (1–8) go along each aisle
 *   - y: the levels (1–4) go up
 *
 * Every location is drawn as an outline (the space on the shelf)
 * with a solid box inside. The box is as tall as the stock is full,
 * and its colour is the stock state (green, amber, red).
 */

// Sizes in "3D units". Changing them changes the whole layout.
const CELL = 1; // width and depth of one location
const LEVEL_HEIGHT = 0.8; // height between shelves
const BAY_GAP = 0.1; // space between two bays
const AISLE_GAP = 2.4; // space between two aisles (the corridor)

interface SceneProps {
  warehouse: Warehouse;
  selectedId: number | null;
  onSelect: (location: WarehouseLocation | null) => void;
  /** Locations that don't match the search are drawn faded. */
  isMatch: (location: WarehouseLocation) => boolean;
}

/** Where a location sits in 3D space (the centre of its cell). */
function positionOf(location: WarehouseLocation, aisles: string[]): [number, number, number] {
  const x = aisles.indexOf(location.aisle) * (CELL + AISLE_GAP);
  const y = (location.level - 1) * LEVEL_HEIGHT;
  const z = (location.bay - 1) * (CELL + BAY_GAP);
  return [x, y, z];
}

export default function WarehouseScene({ warehouse, selectedId, onSelect, isMatch }: SceneProps) {
  const { aisles, bays, levels } = warehouse.layout;

  // The middle of the warehouse, so the camera looks at the centre.
  const width = (aisles.length - 1) * (CELL + AISLE_GAP);
  const depth = (bays - 1) * (CELL + BAY_GAP);
  const center: [number, number, number] = [width / 2, -0.5, depth / 2];

  return (
    <Canvas
      // The camera starts in front of the warehouse, a bit to the right and above.
      camera={{ position: [width / 2 + 10, 13, depth + 13], fov: 45 }}
      // Clicking the background (not a box) closes the details.
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} />

      {/* The floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -LEVEL_HEIGHT / 2 - 0.01, depth / 2]}>
        <planeGeometry args={[width + 8, depth + 8]} />
        <meshStandardMaterial color="#141210" />
      </mesh>
      <gridHelper
        args={[Math.max(width, depth) + 8, Math.max(width, depth) + 8, "#2e2a23", "#1f1c17"]}
        position={[width / 2, -LEVEL_HEIGHT / 2, depth / 2]}
      />

      {/* The aisle letter painted on the floor, in front of each aisle */}
      {aisles.map((aisle, index) => (
        <Text
          key={aisle}
          font={monoFont}
          fontSize={0.9}
          color="#d4af37"
          position={[index * (CELL + AISLE_GAP), -LEVEL_HEIGHT / 2 + 0.01, depth + 1.6]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {aisle}
        </Text>
      ))}

      {/* The metal shelves: one rack per aisle */}
      {aisles.map((aisle, index) => (
        <Rack key={aisle} x={index * (CELL + AISLE_GAP)} depth={depth} levels={levels} />
      ))}

      {warehouse.locations.map((location) => (
        <LocationBox
          key={location.id}
          location={location}
          position={positionOf(location, aisles)}
          selected={location.id === selectedId}
          faded={!isMatch(location)}
          onSelect={onSelect}
        />
      ))}

      {/* Drag to turn, scroll to zoom, right-click drag to move. */}
      <OrbitControls
        target={center}
        maxPolarAngle={Math.PI / 2.2} // never look from under the floor
        minDistance={6}
        maxDistance={45}
      />
    </Canvas>
  );
}

/**
 * One rack: a thin board under each level and four posts at the corners.
 * It's only decoration, so it can't be clicked.
 */
function Rack({ x, depth, levels }: { x: number; depth: number; levels: number }) {
  const length = depth + CELL;
  const height = levels * LEVEL_HEIGHT;
  const halfCell = CELL / 2;

  return (
    <group position={[x, 0, depth / 2]}>
      {Array.from({ length: levels }, (_, level) => (
        <mesh key={level} position={[0, level * LEVEL_HEIGHT - LEVEL_HEIGHT / 2 + 0.02, 0]}>
          <boxGeometry args={[CELL, 0.04, length]} />
          <meshStandardMaterial color="#2a2620" />
        </mesh>
      ))}
      {[
        [-halfCell, -length / 2],
        [halfCell, -length / 2],
        [-halfCell, length / 2],
        [halfCell, length / 2],
      ].map(([postX, postZ], i) => (
        <mesh key={i} position={[postX, height / 2 - LEVEL_HEIGHT / 2, postZ]}>
          <boxGeometry args={[0.05, height, 0.05]} />
          <meshStandardMaterial color="#806331" />
        </mesh>
      ))}
    </group>
  );
}

interface BoxProps {
  location: WarehouseLocation;
  position: [number, number, number];
  selected: boolean;
  faded: boolean;
  onSelect: (location: WarehouseLocation) => void;
}

/** One shelf position: an outline, plus a coloured box as full as the stock. */
function LocationBox({ location, position, selected, faded, onSelect }: BoxProps) {
  const [hovered, setHovered] = useState(false);
  const size = LEVEL_HEIGHT * 0.85;
  // Empty or out of stock locations still show a thin slice, so you can click them.
  const fill = Math.max(0.08, fillRatio(location));
  const color = STATE_COLORS[location.state];
  const opacity = faded ? 0.12 : 1;

  function handleClick(event: ThreeEvent<MouseEvent>) {
    // Without this, the click would also reach the boxes behind this one.
    event.stopPropagation();
    onSelect(location);
  }

  return (
    <group position={position}>
      {/* The space on the shelf (outline). Gold when selected. */}
      <mesh
        onClick={handleClick}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <boxGeometry args={[CELL * 0.92, size, CELL * 0.92]} />
        {/* Invisible, but still clickable. Only its outline (Edges) is drawn. */}
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges
          color={selected ? "#d4af37" : hovered ? "#e8c87a" : "#4a4439"}
          transparent
          opacity={faded && !selected ? 0.2 : 1}
        />
      </mesh>

      {/* The stock: a box that grows from the bottom of the shelf. */}
      {location.state !== "empty" && (
        <mesh position={[0, -size / 2 + (size * fill) / 2, 0]} scale={[1, fill, 1]}>
          <boxGeometry args={[CELL * 0.8, size, CELL * 0.8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            emissive={selected || hovered ? color : "#000000"}
            emissiveIntensity={selected ? 0.5 : 0.25}
          />
        </mesh>
      )}
    </group>
  );
}
