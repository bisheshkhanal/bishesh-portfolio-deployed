import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import type { RefObject } from 'react';
import type { TopologyScrollState } from './topologyTypes';
import type { PerspectiveCamera } from 'three';

interface TopologyCameraRigProps {
  scrollStateRef: RefObject<TopologyScrollState>;
}

// Camera positions per beat (from plan)
const CAM_POSITIONS = {
  beat1Start: new Vector3(8, 5, 12),
  beat1End:   new Vector3(8, -5, 12),
  beat2:      new Vector3(15, 0, 15),
  beat3Start: new Vector3(0, 0, 20),
  beat3End:   new Vector3(0, 0, 2),
  beat4:      new Vector3(0, 1.5, 8),
} as const;

const CAM_TARGETS = {
  beat1: new Vector3(0, 0, 0),
  beat2: new Vector3(0, 0, 0),
  beat3: new Vector3(0, 0, -10),
  beat4: new Vector3(0, 0, 0),
} as const;

function easeInExpo(t: number): number {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function TopologyCameraRig({ scrollStateRef }: TopologyCameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef(new Vector3(8, 5, 12));
  const targetLookAt = useRef(new Vector3(0, 0, 0));

  useFrame(() => {
    const state = scrollStateRef.current;
    if (!state) return;

    const s = state.scroll;
    const { x: hw, y: lw, z: cw, w: pw } = state.beatWeights;

    // Beat 1: pan from (8,5,12) → (8,-5,12), look at origin
    const b1Local = smoothstep(0, 0.25, s);
    const beat1Pos = new Vector3().lerpVectors(CAM_POSITIONS.beat1Start, CAM_POSITIONS.beat1End, b1Local);

    // Beat 2: isometric snap to (15,0,15)
    const beat2Pos = CAM_POSITIONS.beat2.clone();

    // Beat 3: plunge from (0,0,20) → (0,0,2) with easeInExpo
    const b3Local = smoothstep(0.5, 0.75, s);
    const beat3Pos = new Vector3().lerpVectors(CAM_POSITIONS.beat3Start, CAM_POSITIONS.beat3End, easeInExpo(b3Local));

    // Beat 4: decelerate to (0,1.5,8) with easeOutCubic
    const b4Local = smoothstep(0.75, 1.0, s);
    const beat4Pos = new Vector3().lerpVectors(CAM_POSITIONS.beat3End, CAM_POSITIONS.beat4, easeOutCubic(b4Local));

    // Blend camera position using beat weights
    const desiredPos = new Vector3()
      .addScaledVector(beat1Pos, hw)
      .addScaledVector(beat2Pos, lw)
      .addScaledVector(beat3Pos, cw)
      .addScaledVector(beat4Pos, pw);

    // Blend look-at target
    const desiredTarget = new Vector3()
      .addScaledVector(CAM_TARGETS.beat1, hw)
      .addScaledVector(CAM_TARGETS.beat2, lw)
      .addScaledVector(CAM_TARGETS.beat3, cw)
      .addScaledVector(CAM_TARGETS.beat4, pw);

    // Smooth camera movement (lerp factor controls responsiveness)
    targetPos.current.lerp(desiredPos, 0.05);
    targetLookAt.current.lerp(desiredTarget, 0.05);

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLookAt.current);

    // FOV: 50° → 65° during chaos, back to 50°
    const desiredFov = 50 + cw * 15;
    (camera as PerspectiveCamera).fov = MathUtils.lerp(
      (camera as PerspectiveCamera).fov,
      desiredFov,
      0.05
    );
    (camera as PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}
