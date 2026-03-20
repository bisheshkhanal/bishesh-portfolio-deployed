import { useMemo, useRef } from 'react';
import { ShaderMaterial, AdditiveBlending } from 'three';
import { useFrame } from '@react-three/fiber';
import { createTopologyUniforms } from './shaderUniforms';
import type { TopologyUniforms } from './shaderUniforms';

// Import GLSL shaders — vite-plugin-glsl handles these imports
import vertexShader from './shaders/topology.vert.glsl';
import fragShader from './shaders/topology.frag.glsl';

interface TopologyMaterialProps {
  uniforms?: Partial<TopologyUniforms>;
}

export function useTopologyMaterial(externalUniforms?: Partial<TopologyUniforms>) {
  const uniformsRef = useRef(createTopologyUniforms());

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader: fragShader,
      uniforms: uniformsRef.current,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  }, []);

  // Sync external uniform overrides each frame
  useFrame(({ clock }) => {
    uniformsRef.current.uTime.value = clock.elapsedTime;
    if (externalUniforms) {
      for (const key of Object.keys(externalUniforms) as Array<keyof TopologyUniforms>) {
        if (key in uniformsRef.current && externalUniforms[key] !== undefined) {
          (uniformsRef.current[key] as { value: unknown }).value = (externalUniforms[key] as { value: unknown }).value;
        }
      }
    }
  });

  return { material, uniforms: uniformsRef.current };
}