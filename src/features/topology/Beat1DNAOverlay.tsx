import { useRef, useLayoutEffect, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TopologyScrollState } from './topologyTypes';

// Sidebar-derived constants — match Helix.tsx exactly
const STEPS = 60;
const ROTATIONS = 5;
const RADIUS = 4.5;   // scaled up from sidebar's BASE_RADIUS=3 to match particle cloud visual size
const HEIGHT = 42;    // slightly less than topology HEIGHT=45 to sit inside the cloud
const BEAD_RADIUS = 0.24; // sidebar baseScale
const LINE_BASE_OPACITY = 0.10; // sidebar latticeOpacity

interface BeadPoint {
  x: number;
  y: number;
  z: number;
  depthFactor: number; // (z + RADIUS) / (2 * RADIUS) — for color brightness
}

export interface Beat1DNAOverlayProps {
  scrollStateRef: RefObject<TopologyScrollState>;
}

export function Beat1DNAOverlay({ scrollStateRef }: Beat1DNAOverlayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const scratchObj = useRef(new THREE.Object3D()).current;

  // Sidebar math convention: cos(angle) for X, sin(angle) for Z
  // Y is the long axis — vertical, no Z rotation
  const basePoints = useMemo<{ a: BeadPoint[]; b: BeadPoint[] }>(() => {
    const a: BeadPoint[] = [];
    const b: BeadPoint[] = [];
    for (let i = 0; i < STEPS; i++) {
      const progress = i / (STEPS - 1);
      const angle = progress * ROTATIONS * 2 * Math.PI;
      const y = THREE.MathUtils.lerp(-HEIGHT / 2, HEIGHT / 2, progress);

      const xA = Math.cos(angle) * RADIUS;
      const zA = Math.sin(angle) * RADIUS;
      const xB = Math.cos(angle + Math.PI) * RADIUS;
      const zB = Math.sin(angle + Math.PI) * RADIUS;

      a.push({ x: xA, y, z: zA, depthFactor: (zA + RADIUS) / (2 * RADIUS) });
      b.push({ x: xB, y, z: zB, depthFactor: (zB + RADIUS) / (2 * RADIUS) });
    }
    return { a, b };
  }, []);

  const totalInstances = basePoints.a.length + basePoints.b.length;

  // Build line geometry (backbone + rungs) once — deterministic, no Math.random
  const lineGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];

    // Strand A backbone
    for (let i = 0; i < basePoints.a.length - 1; i++) {
      const p0 = basePoints.a[i];
      const p1 = basePoints.a[i + 1];
      pts.push(new THREE.Vector3(p0.x, p0.y, p0.z));
      pts.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    }
    // Strand B backbone
    for (let i = 0; i < basePoints.b.length - 1; i++) {
      const p0 = basePoints.b[i];
      const p1 = basePoints.b[i + 1];
      pts.push(new THREE.Vector3(p0.x, p0.y, p0.z));
      pts.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    }
    // Rungs (strand A ↔ strand B at each step)
    for (let i = 0; i < basePoints.a.length; i++) {
      const pa = basePoints.a[i];
      const pb = basePoints.b[i];
      pts.push(new THREE.Vector3(pa.x, pa.y, pa.z));
      pts.push(new THREE.Vector3(pb.x, pb.y, pb.z));
    }

    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [basePoints]);

  // Set instance matrices and colors once — positions are static, only group.rotation.y animates
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const color = new THREE.Color();
    let index = 0;

    const applyBead = (p: BeadPoint) => {
      scratchObj.position.set(p.x, p.y, p.z);
      scratchObj.scale.setScalar(1);
      scratchObj.updateMatrix();
      mesh.setMatrixAt(index, scratchObj.matrix);

      // White-ish with depth variation — matches Helix.tsx: 0.90 + depthFactor * 0.10
      const brightness = 0.90 + p.depthFactor * 0.10;
      color.setRGB(brightness, brightness, brightness);
      mesh.setColorAt(index, color);
      index++;
    };

    basePoints.a.forEach(applyBead);
    basePoints.b.forEach(applyBead);

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [basePoints, scratchObj]);

  // useFrame: ONLY update opacity + slow Y rotation — no per-bead position writes
  useFrame((state) => {
    const mesh = meshRef.current;
    const line = lineRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;

    const beatWeight = scrollStateRef.current?.beatWeights.x ?? 0;

    const meshMat = mesh.material as THREE.MeshBasicMaterial;
    meshMat.opacity = beatWeight;

    if (line) {
      const lineMat = line.material as THREE.LineBasicMaterial;
      lineMat.opacity = beatWeight * LINE_BASE_OPACITY;
    }

    if (beatWeight <= 0.001) return;

    const isE2E =
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { __DNA_E2E__?: boolean }).__DNA_E2E__);
    const time = isE2E ? 0 : state.clock.elapsedTime;

    // Slow Y rotation matching sidebar's time * 0.15
    group.rotation.y = time * 0.15;
  });

  return (
    // NO Z rotation — vertical orientation, group rotation.y handled in useFrame
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalInstances]}
        raycast={() => null}
        frustumCulled={false}
      >
        <sphereGeometry args={[BEAD_RADIUS, 12, 12]} />
        <meshBasicMaterial vertexColors transparent depthWrite={false} />
      </instancedMesh>
      <lineSegments
        ref={lineRef}
        geometry={lineGeometry}
        raycast={() => null}
        frustumCulled={false}
      >
        <lineBasicMaterial color="#cfcfcf" transparent depthWrite={false} opacity={0} />
      </lineSegments>
    </group>
  );
}