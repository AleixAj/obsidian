import monoFont from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff?url";
import { ContactShadows, Edges, OrbitControls, Text } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from "three";
import type { Warehouse, WarehouseLocation } from "../api";
import { fillRatio, STATE_COLORS } from "./states";

/**
 * The 3D view of the warehouse, made with react-three-fiber
 * (React components that draw with Three.js / WebGL).
 *
 * How the positions work (x, y, z):
 *   - x: each aisle (A, B, C...) is a rack, one next to the other
 *   - z: the bays (1–8) go along each rack
 *   - y: the levels (1–4) go up
 *
 * Every location is drawn as an outline (the space on the shelf) with a
 * pallet and a box on it. The box is as tall as the stock is full, and its
 * colour is the stock state (green, amber, red).
 */

// Sizes in "3D units". Changing them changes the whole layout.
const CELL = 1; // width and depth of one location
const LEVEL_HEIGHT = 0.8; // height between shelves
const BAY_GAP = 0.1; // space between two bays
const AISLE_GAP = 2.4; // space between two racks (the corridor)
const BOX_HEIGHT = LEVEL_HEIGHT * 0.85; // height of one location box
const BAY_PITCH = CELL + BAY_GAP; // from the start of one bay to the next
const AISLE_PITCH = CELL + AISLE_GAP; // from one rack to the next
const FLOOR_Y = -LEVEL_HEIGHT / 2; // the floor is under the first level
const PALLET_HEIGHT = 0.06;

// Colours of the scene (the stock colours come from states.ts). The racks are
// grey steel on purpose: amber and red already mean "low" and "out of stock".
const COLORS = {
  background: "#0b0a08",
  floor: "#11100d",
  rackBase: "#17150f",
  gridLine: "#2b2720",
  gold: "#d4af37",
  steel: "#8b939e",
  beam: "#5c6573",
  board: "#24211b",
  pallet: "#6b4f2a",
};

// Every location uses the same shapes, so we create them once and share
// them, instead of one copy per location (hundreds of them).
const outlineGeometry = new BoxGeometry(CELL * 0.92, BOX_HEIGHT, CELL * 0.92);
const stockGeometry = new BoxGeometry(CELL * 0.78, BOX_HEIGHT - PALLET_HEIGHT, CELL * 0.78);
const palletGeometry = new BoxGeometry(CELL * 0.86, PALLET_HEIGHT, CELL * 0.86);

interface SceneProps {
  warehouse: Warehouse;
  selectedId: number | null;
  onSelect: (location: WarehouseLocation | null) => void;
  /** Locations that don't match the search are drawn faded. */
  isMatch: (location: WarehouseLocation) => boolean;
  /** True when a filter chip or a search is active. */
  filtering: boolean;
}

/** Where a location sits in 3D space (the centre of its cell). */
function positionOf(location: WarehouseLocation, aisles: string[]): [number, number, number] {
  const x = aisles.indexOf(location.aisle) * AISLE_PITCH;
  const y = (location.level - 1) * LEVEL_HEIGHT;
  const z = (location.bay - 1) * BAY_PITCH;
  return [x, y, z];
}

export default function WarehouseScene({ warehouse, selectedId, onSelect, isMatch, filtering }: SceneProps) {
  const { aisles, bays, levels } = warehouse.layout;

  // The boxes change the mouse to a hand. If the view closes while the
  // mouse is over one, put the normal cursor back.
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  // The size of the racks area, so the camera looks at the centre.
  const width = (aisles.length - 1) * AISLE_PITCH;
  const depth = (bays - 1) * BAY_PITCH;
  const center: [number, number, number] = [width / 2, 0, depth / 2];

  const selected = warehouse.locations.find((location) => location.id === selectedId);

  return (
    <Canvas
      // Only draw a new frame when something changes (hover, click, camera
      // move...) instead of 60 times per second. Saves battery and CPU.
      frameloop="demand"
      // Sharp enough on retina screens without drawing 3x the pixels.
      dpr={[1, 1.5]}
      // The camera starts in front of the warehouse, a bit to the right and above.
      camera={{ position: [width / 2 + 9, 11, depth + 12], fov: 42 }}
      // Clicking the background (not a box) closes the details.
      onPointerMissed={() => onSelect(null)}
    >
      {/* A dark background that fades into fog far away: gives depth. */}
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 28, 60]} />

      {/* Lights: soft light from above, a warm main light, and a gold light
          from behind that outlines the racks. */}
      <hemisphereLight args={["#fff3dc", "#1a1712", 1.1]} />
      <directionalLight position={[width + 8, 18, depth + 12]} intensity={2} color="#fff1d6" />
      <directionalLight position={[-6, 8, -10]} intensity={0.7} color={COLORS.gold} />

      <Floor aisles={aisles} bays={bays} width={width} depth={depth} />

      {/* Soft shadows under the racks, calculated once (frames={1}). */}
      <ContactShadows
        position={[width / 2, FLOOR_Y + 0.005, depth / 2]}
        scale={[width + 6, depth + 6]}
        opacity={0.55}
        blur={2.4}
        far={levels * LEVEL_HEIGHT}
        frames={1}
      />

      {/* The metal racks: one per aisle */}
      {aisles.map((aisle, index) => (
        <Rack key={aisle} x={index * AISLE_PITCH} bays={bays} levels={levels} seeThrough={filtering} />
      ))}

      {warehouse.locations.map((location) => (
        <LocationBox
          key={location.id}
          location={location}
          position={positionOf(location, aisles)}
          selected={location.id === selectedId}
          faded={!isMatch(location)}
          highlighted={filtering && isMatch(location)}
          onSelect={onSelect}
        />
      ))}

      {selected && <SelectedMarker position={positionOf(selected, aisles)} levels={levels} />}

      {/* Drag to turn, scroll to zoom, right-click drag to move. */}
      <OrbitControls
        target={center}
        maxPolarAngle={Math.PI / 2.25} // never look from under the floor
        minDistance={5}
        maxDistance={40}
      />
    </Canvas>
  );
}

interface FloorProps {
  aisles: string[];
  bays: number;
  width: number;
  depth: number;
}

/**
 * The floor, with markings that follow the racks: a base under each rack
 * with a gold safety line around it, a line at every bay, a dashed line in
 * the middle of each corridor, and the aisle letters and bay numbers.
 */
function Floor({ aisles, bays, width, depth }: FloorProps) {
  // How far the grid lines go past the racks.
  const margin = 3;
  const rackLength = bays * BAY_PITCH;

  // All the thin grid lines in one object: two points (start, end) per line.
  const gridLines = useMemo(() => {
    const points: number[] = [];
    const left = -CELL / 2 - margin;
    const right = width + CELL / 2 + margin;
    const front = depth + BAY_PITCH / 2;
    const back = -BAY_PITCH / 2;

    // One line across the whole floor at the start and end of every bay.
    for (let i = 0; i <= bays; i++) {
      const z = back + i * BAY_PITCH;
      points.push(left, 0, z, right, 0, z);
    }
    // One line along each side of every rack.
    aisles.forEach((_, index) => {
      for (const side of [-CELL / 2, CELL / 2]) {
        const x = index * AISLE_PITCH + side;
        points.push(x, 0, back - margin, x, 0, front + margin);
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    return geometry;
  }, [aisles, bays, width, depth]);

  // Dashes in the middle of each corridor (between two racks).
  const corridorDashes = useMemo(() => {
    const dashes: [number, number][] = [];
    for (let index = 0; index < aisles.length - 1; index++) {
      const x = index * AISLE_PITCH + AISLE_PITCH / 2;
      for (let z = -BAY_PITCH / 2 + 0.3; z < depth + BAY_PITCH / 2; z += 0.9) {
        dashes.push([x, z + 0.25]);
      }
    }
    return dashes;
  }, [aisles, depth]);

  return (
    <group>
      {/* The concrete: much bigger than the racks, so its edges disappear in the fog. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, FLOOR_Y - 0.01, depth / 2]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.95} />
      </mesh>

      <lineSegments geometry={gridLines} position={[0, FLOOR_Y, 0]}>
        <lineBasicMaterial color={COLORS.gridLine} />
      </lineSegments>

      {aisles.map((aisle, index) => {
        const x = index * AISLE_PITCH;
        return (
          <group key={aisle}>
            {/* A slightly lighter base under the rack, with a gold line around it. */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.001, depth / 2]}>
              <planeGeometry args={[CELL + 0.3, rackLength + 0.3]} />
              <meshStandardMaterial color={COLORS.rackBase} roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.002, depth / 2]}>
              <planeGeometry args={[CELL + 0.42, rackLength + 0.42]} />
              <meshBasicMaterial color={COLORS.gold} transparent opacity={0.28} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.003, depth / 2]}>
              <planeGeometry args={[CELL + 0.36, rackLength + 0.36]} />
              <meshStandardMaterial color={COLORS.rackBase} roughness={0.9} />
            </mesh>

            {/* The aisle letter, painted in front of the rack */}
            <Text
              font={monoFont}
              fontSize={0.85}
              color={COLORS.gold}
              position={[x, FLOOR_Y + 0.01, depth + BAY_PITCH / 2 + 1.1]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              {aisle}
            </Text>
          </group>
        );
      })}

      {corridorDashes.map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.002, z]}>
          <planeGeometry args={[0.06, 0.45]} />
          <meshBasicMaterial color={COLORS.gold} transparent opacity={0.35} />
        </mesh>
      ))}

      {/* The bay numbers (01–08), painted next to the last rack, on the camera's side */}
      {Array.from({ length: bays }, (_, bay) => (
        <Text
          key={bay}
          font={monoFont}
          fontSize={0.32}
          color="#9a8f7c"
          position={[width + CELL / 2 + 0.85, FLOOR_Y + 0.01, bay * BAY_PITCH]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {String(bay + 1).padStart(2, "0")}
        </Text>
      ))}
    </group>
  );
}

interface RackProps {
  x: number;
  bays: number;
  levels: number;
  /** While filtering, the boards are see-through so they don't hide the boxes below them. */
  seeThrough: boolean;
}

/**
 * One rack, like real pallet racking: steel posts at every bay, beams on
 * the front and the back of each level, and a board to put pallets on.
 * It's only decoration, so it can't be clicked.
 */
function Rack({ x, bays, levels, seeThrough }: RackProps) {
  const length = bays * BAY_PITCH;
  const height = levels * LEVEL_HEIGHT + 0.1;
  const halfCell = CELL / 2;
  const middleZ = ((bays - 1) * BAY_PITCH) / 2;

  return (
    <group position={[x, 0, 0]}>
      {/* Posts: one pair (front side and back side) at the start of every bay and at the end. */}
      {Array.from({ length: bays + 1 }, (_, i) =>
        [-halfCell, halfCell].map((side) => (
          <mesh key={`${i}${side}`} position={[side, FLOOR_Y + height / 2, -BAY_PITCH / 2 + i * BAY_PITCH]}>
            <boxGeometry args={[0.045, height, 0.045]} />
            <meshStandardMaterial color={COLORS.steel} metalness={0.6} roughness={0.4} />
          </mesh>
        )),
      )}

      {Array.from({ length: levels }, (_, level) => {
        const y = FLOOR_Y + level * LEVEL_HEIGHT + 0.03;
        return (
          <group key={level}>
            {/* The two beams that hold this level */}
            {[-halfCell, halfCell].map((side) => (
              <mesh key={side} position={[side, y, middleZ]}>
                <boxGeometry args={[0.05, 0.07, length]} />
                <meshStandardMaterial color={COLORS.beam} metalness={0.3} roughness={0.5} />
              </mesh>
            ))}
            {/* The board, see-through while filtering */}
            <mesh position={[0, y, middleZ]}>
              <boxGeometry args={[CELL - 0.04, 0.02, length]} />
              <meshStandardMaterial
                color={COLORS.board}
                transparent={seeThrough}
                opacity={seeThrough ? 0.12 : 1}
                depthWrite={!seeThrough}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

interface BoxProps {
  location: WarehouseLocation;
  position: [number, number, number];
  selected: boolean;
  faded: boolean;
  /** It matches the active filter or search: make it easy to spot. */
  highlighted: boolean;
  onSelect: (location: WarehouseLocation) => void;
}

/** One shelf position: an outline, a pallet, and a coloured box as full as the stock. */
function LocationBox({ location, position, selected, faded, highlighted, onSelect }: BoxProps) {
  const [hovered, setHovered] = useState(false);
  // Out of stock locations still show a thin slice, so you can see and click them.
  const fill = Math.max(0.08, fillRatio(location));
  const color = STATE_COLORS[location.state];
  const stockHeight = BOX_HEIGHT - PALLET_HEIGHT;
  // The pallet sits on the board; the box sits on the pallet.
  const palletY = -BOX_HEIGHT / 2 + PALLET_HEIGHT / 2;
  const boxY = -BOX_HEIGHT / 2 + PALLET_HEIGHT + (stockHeight * fill) / 2;

  function handleClick(event: ThreeEvent<MouseEvent>) {
    // Without this, the click would also reach the boxes behind this one.
    event.stopPropagation();
    onSelect(location);
  }

  return (
    <group position={position}>
      {/* The space on the shelf. Its outline turns gold when selected. */}
      <mesh
        geometry={outlineGeometry}
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
        {/* Not drawn at all, but still clickable (clicks test the shape,
            not the material). Only its outline (Edges) is drawn, and only
            when it matters, so the racks look clean. */}
        <meshBasicMaterial visible={false} />
        {(selected || hovered || highlighted) && (
          <Edges color={selected ? COLORS.gold : hovered ? "#e8c87a" : STATE_COLORS.empty} />
        )}
      </mesh>

      {/* A free location has no pallet. When it's what you're looking for
          (e.g. the "Free" filter), show a solid box in the "free" colour. */}
      {location.state === "empty" && highlighted && (
        <mesh geometry={stockGeometry}>
          <meshStandardMaterial color={STATE_COLORS.empty} emissive={STATE_COLORS.empty} emissiveIntensity={0.35} />
        </mesh>
      )}

      {location.state !== "empty" && (
        <>
          <mesh geometry={palletGeometry} position={[0, palletY, 0]}>
            <meshStandardMaterial color={COLORS.pallet} roughness={0.9} transparent opacity={faded ? 0.12 : 1} depthWrite={!faded} />
          </mesh>
          {/* The stock: a box that grows up from the pallet. */}
          <mesh geometry={stockGeometry} position={[0, boxY, 0]} scale={[1, fill, 1]}>
            <meshStandardMaterial
              color={color}
              roughness={0.55}
              transparent
              opacity={faded ? 0.12 : 1}
              // A faded box must not hide the highlighted boxes behind it.
              depthWrite={!faded}
              emissive={color}
              emissiveIntensity={selected ? 0.45 : hovered ? 0.3 : 0.06}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/** A gold marker floating over the selected location, and a glow on the floor under it. */
function SelectedMarker({ position, levels }: { position: [number, number, number]; levels: number }) {
  const [x, , z] = position;
  const top = FLOOR_Y + levels * LEVEL_HEIGHT + 0.8;

  return (
    <group>
      {/* An upside-down cone pointing at the location */}
      <mesh position={[x, top, z]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.24, 0.5, 4]} />
        <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, FLOOR_Y + 0.004, z]}>
        <ringGeometry args={[0.55, 0.75, 32]} />
        <meshBasicMaterial color={COLORS.gold} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
