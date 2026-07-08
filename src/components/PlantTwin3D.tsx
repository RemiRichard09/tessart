"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useI18n } from "@/components/LanguageProvider";
import type { PlantInput, SimulationResult } from "@/types/plant";

const COLOR = {
  electricity: "#4c8dff",
  heat: "#f97316",
  wasteHeat: "#ff5f57",
  steel: "#1b2942",
  steelLight: "#243654",
  ground: "#0c1830",
};

interface LabelText {
  title: string;
  detail?: string;
}

/** All human-readable strings, resolved outside the Canvas (React context
 *  does not cross the react-three-fiber renderer boundary). */
interface SceneStrings {
  grid: LabelText;
  tessa: LabelText;
  process: LabelText;
  waste: LabelText;
}

function Label({
  position,
  text,
}: {
  position: [number, number, number];
  text: LabelText;
}) {
  return (
    <Html position={position} center distanceFactor={9} occlude={false}>
      <div className="pointer-events-none w-max rounded-lg border border-[#2a3b5c] bg-[#0d1830]/90 px-3 py-1.5 text-center shadow-lg backdrop-blur-sm">
        <p className="text-[11px] font-semibold whitespace-nowrap text-[#eef2f8]">
          {text.title}
        </p>
        {text.detail ? (
          <p className="text-[10px] whitespace-nowrap text-[#93a0b5]">
            {text.detail}
          </p>
        ) : null}
      </div>
    </Html>
  );
}

/** Animated energy flow: a faint path with particles travelling along it. */
function Flow({
  points,
  color,
  speed = 0.35,
  particles = 5,
  size = 0.09,
}: {
  points: [number, number, number][];
  color: string;
  speed?: number;
  particles?: number;
  size?: number;
}) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    [points],
  );
  const linePoints = useMemo(() => curve.getPoints(40), [curve]);
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const u = (t + i / particles) % 1;
      curve.getPointAt(u, mesh.position);
      const s = 0.75 + 0.5 * Math.sin(u * Math.PI); // swell mid-path
      mesh.scale.setScalar(s);
    });
  });

  return (
    <group>
      <Line
        points={linePoints}
        color={color}
        transparent
        opacity={0.3}
        lineWidth={1.5}
      />
      {Array.from({ length: particles }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
        >
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function GridConnection() {
  return (
    <group position={[-5.2, 0, 1.5]}>
      {/* Mast */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 2.6, 8]} />
        <meshStandardMaterial color={COLOR.steelLight} />
      </mesh>
      {/* Cross arms */}
      {[2.0, 2.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[1.5 - i * 0.4, 0.07, 0.07]} />
          <meshStandardMaterial color={COLOR.steelLight} />
        </mesh>
      ))}
      {/* Insulators */}
      {[-0.6, 0, 0.6].map((x) => (
        <mesh key={x} position={[x * 0.9, 1.93, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={COLOR.electricity}
            emissive={COLOR.electricity}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
      {/* Base pad */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
        <meshStandardMaterial color={COLOR.steel} />
      </mesh>
      <pointLight
        position={[0, 2.2, 0.4]}
        color={COLOR.electricity}
        intensity={2}
        distance={4}
      />
    </group>
  );
}

function TessaBattery({ label }: { label: LabelText }) {
  const core = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (core.current) {
      core.current.emissiveIntensity =
        1.4 + 0.5 * Math.sin(clock.getElapsedTime() * 1.6);
    }
  });

  return (
    <group>
      {/* Containment shell */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.4, 1.7, 1.5]} />
        <meshStandardMaterial
          color={COLOR.steel}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      {/* Glowing thermal core window */}
      <mesh position={[0, 0.85, 0.76]}>
        <boxGeometry args={[1.7, 0.9, 0.02]} />
        <meshStandardMaterial
          ref={core}
          color="#3a1108"
          emissive={COLOR.heat}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Red brand fin */}
      <mesh position={[0, 1.78, 0]}>
        <boxGeometry args={[2.4, 0.1, 0.5]} />
        <meshStandardMaterial
          color="#e0504f"
          emissive="#e0504f"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Foundation */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[2.9, 0.1, 2.0]} />
        <meshStandardMaterial color="#0f1c33" />
      </mesh>
      <pointLight
        position={[0, 1, 1.6]}
        color={COLOR.heat}
        intensity={3}
        distance={5}
      />
      <Label position={[0, 2.55, 0]} text={label} />
    </group>
  );
}

function ProcessUnit({ label }: { label: LabelText }) {
  return (
    <group position={[4.8, 0, -1.6]}>
      {/* Main hall */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2.6, 1.4, 1.9]} />
        <meshStandardMaterial color={COLOR.steelLight} roughness={0.6} />
      </mesh>
      {/* Roof monitor */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.6, 0.25, 1.1]} />
        <meshStandardMaterial color={COLOR.steel} />
      </mesh>
      {/* Stack */}
      <mesh position={[0.9, 1.9, -0.5]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 1.6, 10]} />
        <meshStandardMaterial color={COLOR.steel} />
      </mesh>
      {/* Hot inlet window */}
      <mesh position={[-1.31, 0.7, 0]}>
        <boxGeometry args={[0.02, 0.7, 1.1]} />
        <meshStandardMaterial
          color="#331005"
          emissive={COLOR.heat}
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <Label position={[0, 2.35, 0.9]} text={label} />
    </group>
  );
}

function WasteHeatSource({ label }: { label: LabelText }) {
  const fan = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (fan.current) fan.current.rotation.y += delta * 2.2;
  });

  return (
    <group position={[1.2, 0, 3.6]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.5, 1.0, 1.2]} />
        <meshStandardMaterial color={COLOR.steelLight} roughness={0.6} />
      </mesh>
      {/* Exhaust collar + spinning fan */}
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.24, 16]} />
        <meshStandardMaterial color={COLOR.steel} />
      </mesh>
      <mesh ref={fan} position={[0, 1.26, 0]}>
        <boxGeometry args={[0.72, 0.03, 0.1]} />
        <meshStandardMaterial
          color={COLOR.wasteHeat}
          emissive={COLOR.wasteHeat}
          emissiveIntensity={0.7}
        />
      </mesh>
      <Label position={[0.4, 1.75, 0.4]} text={label} />
    </group>
  );
}

function Ground() {
  return (
    <group>
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[15, 0.18, 11]} />
        <meshStandardMaterial color={COLOR.ground} roughness={0.9} />
      </mesh>
      <gridHelper
        args={[14.6, 20, "#22345a", "#16264a"]}
        position={[0, 0.005, 0]}
      />
    </group>
  );
}

function Scene({ strings }: { strings: SceneStrings }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 9, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Ground />
      <GridConnection />
      <Label position={[-5.2, 3.15, 1.5]} text={strings.grid} />
      <TessaBattery label={strings.tessa} />
      <ProcessUnit label={strings.process} />
      <WasteHeatSource label={strings.waste} />

      {/* Electricity: grid → TESSA (charging) */}
      <Flow
        points={[
          [-5.0, 1.9, 1.4],
          [-3.2, 1.5, 0.8],
          [-1.3, 1.0, 0],
        ]}
        color={COLOR.electricity}
        speed={0.4}
      />
      {/* Heat: TESSA → process */}
      <Flow
        points={[
          [1.3, 0.9, 0],
          [2.7, 1.1, -0.8],
          [3.4, 0.9, -1.3],
        ]}
        color={COLOR.heat}
        speed={0.32}
      />
      {/* Waste heat: process exhaust → TESSA */}
      <Flow
        points={[
          [1.2, 1.5, 3.3],
          [0.9, 1.2, 2.1],
          [0.4, 0.9, 0.9],
        ]}
        color={COLOR.wasteHeat}
        speed={0.26}
        particles={4}
        size={0.075}
      />

      <OrbitControls
        target={[0, 0.8, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={24}
        minPolarAngle={0.5}
        maxPolarAngle={1.35}
      />
    </>
  );
}

interface Props {
  input: PlantInput;
  result: SimulationResult;
}

export default function PlantTwin3D({ input, result }: Props) {
  const { t, fmt } = useI18n();

  const strings: SceneStrings = {
    grid: {
      title: t.twin.grid,
      detail: t.twin.gridDetail(fmt.number(input.availableCapacityKW)),
    },
    tessa: {
      title: t.twin.tessa,
      detail: t.twin.tessaDetail(fmt.number(result.sizeMWh, 1)),
    },
    process: {
      title: t.options.process[input.process],
      detail: t.twin.processDetail(fmt.number(input.processTempC)),
    },
    waste: { title: t.twin.waste, detail: t.twin.wasteDetail },
  };

  const legend = [
    { color: COLOR.electricity, label: t.twin.legendElec },
    { color: COLOR.heat, label: t.twin.legendHeat },
    { color: COLOR.wasteHeat, label: t.twin.legendWaste },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-edge bg-card">
      <div className="h-[440px] sm:h-[520px]">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [11.5, 8.5, 11.5], fov: 30 }}
        >
          <color attach="background" args={["#0a1424"]} />
          <fog attach="fog" args={["#0a1424", 24, 44]} />
          <Scene strings={strings} />
        </Canvas>
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-edge px-5 py-3.5">
        {legend.map((l) => (
          <span
            key={l.label}
            className="flex items-center gap-2 text-xs text-txt-2"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
        <span className="ml-auto hidden text-xs text-txt-3 sm:block">
          {t.twin.hint}
        </span>
      </div>
    </div>
  );
}
