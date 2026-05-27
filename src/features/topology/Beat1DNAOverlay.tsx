import { useRef, useLayoutEffect, useMemo, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HELIX_CONFIG } from './topologyConfig';
import type { TopologyScrollState } from './topologyTypes';

const { ROTATIONS, RADIUS, HEIGHT } = HELIX_CONFIG;
const STEPS = 60;
const DIAG_ANGLE = -0.785; // matches vertex shader diagAngle (rotation around Z)
const BEAD_RADIUS = 0.14;
const LINE_BASE_OPACITY = 0.10;

interface BasePoint {
  x: number;
  y: number;
  z: number;
  progress: number;
  delay: number;
}

export interface Beat1DNAOverlayProps {
  scrollStateRef: RefObject<TopologyScrollState>;
}

export function Beat1DNAOverlay({ scrollStateRef }: Beat1DNAOverlayProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const scratchObj = useRef(new THREE.Object3D()).current;

  // Pre-rotation strand positions (rotation applied via parent <group>).
  const basePoints = useMemo<{ a: BasePoint[]; b: BasePoint[] }>(() => {
    const a: BasePoint[] = [];
    const b: BasePoint[] = [];
    for (let i = 0; i < STEPS; i++) {
      const progress = i / (STEPS - 1);
      const baseAngle = progress * ROTATIONS * 2 * Math.PI;
      const baseY = THREE.MathUtils.lerp(-HEIGHT / 2, HEIGHT / 2, progress);
      const delay = (i / STEPS) * Math.PI * 2;
      // sin for X, cos for Z — matches topology.vert.glsl convention
      a.push({
        x: Math.sin(baseAngle) * RADIUS,
        y: baseY,
        z: Math.cos(baseAngle) * RADIUS,
        progress,
        delay,
      });
      b.push({
        x: Math.sin(baseAngle + Math.PI) * RADIUS,
        y: baseY,
        z: Math.cos(baseAngle + Math.PI) * RADIUS,
        progress,
        delay: delay + Math.PI,
      });
    }
    return { a, b };
  }, []);

  const totalInstances = basePoints.a.length + basePoints.b.length;

  // Build line geometry (backbone + rungs) once, deterministic.
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Strand A backbone
    for (let i = 0; i < basePoints.a.length - 1; i++) {
      const p0 = basePoints.a[i];
      const p1 = basePoints.a[i + 1];
      points.push(new THREE.Vector3(p0.x, p0.y, p0.z));
      points.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    }
    // Strand B backbone
    for (let i = 0; i < basePoints.b.length - 1; i++) {
      const p0 = basePoints.b[i];
      const p1 = basePoints.b[i + 1];
      points.push(new THREE.Vector3(p0.x, p0.y, p0.z));
      points.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    }
    // Rungs
    for (let i = 0; i < basePoints.a.length; i++) {
      const pa = basePoints.a[i];
      const pb = basePoints.b[i];
      points.push(new THREE.Vector3(pa.x, pa.y, pa.z));
      points.push(new THREE.Vector3(pb.x, pb.y, pb.z));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [basePoints]);

  // Initial matrix + color setup. Matrices get overwritten by useFrame each tick.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new THREE.Color();
    let index = 0;
    const apply = (p: BasePoint) => {
      scratchObj.position.set(p.x, p.y, p.z);
      scratchObj.scale.setScalar(1);
      scratchObj.updateMatrix();
      mesh.setMatrixAt(index, scratchObj.matrix);
      const depthFactor = (p.z + RADIUS) / (2 * RADIUS);
      const brightness = 0.90 + depthFactor * 0.10;
      color.setRGB(brightness, brightness, brightness);
      mesh.setColorAt(index, color);
      index++;
    };
    basePoints.a.forEach(apply);
    basePoints.b.forEach(apply);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [basePoints, scratchObj]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const line = lineRef.current;
    if (!mesh) return;

    const beatWeight = scrollStateRef.current?.beatWeights.x ?? 0;
    const meshMaterial = mesh.material as THREE.MeshBasicMaterial;
    meshMaterial.opacity = beatWeight;
    if (line) {
      const lineMaterial = line.material as THREE.LineBasicMaterial;
      lineMaterial.opacity = beatWeight * LINE_BASE_OPACITY;
    }

    if (beatWeight <= 0.001) return;

    const isE2E =
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { __DNA_E2E__?: boolean }).__DNA_E2E__);
    const time = isE2E ? 0 : state.clock.elapsedTime;

    let index = 0;
    const updateOne = (p: BasePoint) => {
      const yVib = Math.sin(time * 4.0 + p.delay) * 0.3;
      const peristaltic = Math.sin(time * 3.0 + p.progress * 20.0) * 0.15;
      scratchObj.position.set(p.x, p.y + yVib + peristaltic, p.z);
      scratchObj.scale.setScalar(1);
      scratchObj.updateMatrix();
      mesh.setMatrixAt(index, scratchObj.matrix);
      index++;
    };
    basePoints.a.forEach(updateOne);
    basePoints.b.forEach(updateOne);
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group rotation={[0, 0, DIAG_ANGLE]}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalInstances]}
        raycast={() => null}
        frustumCulled={false}
      >
        <sphereGeometry args={[BEAD_RADIUS, 8, 8]} />
        <meshBasicMaterial vertexColors transparent depthWrite={false} />
      </instancedMesh>
      <lineSegments ref={lineRef} geometry={lineGeometry} raycast={() => null} frustumCulled={false}>
        <lineBasicMaterial color="#cfcfcf" transparent depthWrite={false} opacity={0} />
      </lineSegments>
    </group>
  );
}