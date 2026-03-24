import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

function ParticleSystem({ count = 3000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 15 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (prefersReducedMotion || !pointsRef.current) return;

    pointsRef.current.rotation.y -= delta * 0.02;
    pointsRef.current.rotation.x -= delta * 0.01;

    const mouseX = (state.pointer.x * Math.PI) / 10;
    const mouseY = (state.pointer.y * Math.PI) / 10;
    
    pointsRef.current.rotation.y += (mouseX - pointsRef.current.rotation.y) * 0.02;
    pointsRef.current.rotation.x += (-mouseY - pointsRef.current.rotation.x) * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00d9ff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

export function BackgroundEffects() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] z-10" />
      
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 5, 15]} />
        <ParticleSystem count={prefersReducedMotion ? 500 : 3000} />
      </Canvas>
    </div>
  );
}
