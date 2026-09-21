import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ObsidianSphere = () => {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const targetDistortion = useRef(0);
  const lastMousePos = useRef(new THREE.Vector2());

  useFrame((state, delta) => {
    const mouse = state.pointer;
    const velocity = mouse.distanceTo(lastMousePos.current) / Math.max(delta, 0.001);
    lastMousePos.current.copy(mouse);
    
    if (velocity > 0.1) {
      targetDistortion.current = Math.min(targetDistortion.current + delta * 3.0, 1.5);
    } else {
      targetDistortion.current = Math.max(targetDistortion.current - delta * 1.0, 0.0);
    }
    
    if (materialRef.current) {
      materialRef.current.distortion = THREE.MathUtils.lerp(
        materialRef.current.distortion || 0, 
        targetDistortion.current, 
        0.05
      );
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[2, 128]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          color="#020202"
          metalness={0.8}
          roughness={0.0}
          ior={2.5}
          transmission={0.9}
          thickness={1.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          distortionScale={0.5}
          temporalDistortion={0.2}
        />
      </mesh>
    </Float>
  );
};
