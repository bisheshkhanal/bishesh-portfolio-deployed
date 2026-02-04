import { useRef, useMemo, useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateHelixPoints, RenderPoint } from './dnaMath';

interface HelixProps {
  scrollProgress: any;
  onNavigate?: (sectionId: string) => void;
  activeSection?: string;
  isE2E?: boolean;
}

// Colors from design spec - light, visible against #0a0a0a
const COLORS = {
  base: '#e0e0e0',      // Light gray for strand particles (from spec)
  strand: '#cccccc',    // Slightly dimmer for depth
  hero: '#4ea2ff',      // Blue (Top - scroll-to-top)
  projects: '#ff9500',  // Orange (Middle - Projects section)
  skills: '#00d9ff',    // Cyan (Bottom - Skills section)
  contact: '#00ff88',   // Green (Bottom - Contact section)
  glow: '#ffffff'       // White for progress indicator
} as const;

// Refined parameters for delicate point-cloud aesthetic
const PARAMS = {
  baseScale: 0.24,      // 3x larger for visibility (was 0.08)
  clusterScale: 0.45,   // Section markers prominent
  glowScale: 0.55,      // Halo around clusters
  latticeColor: '#cfcfcf',    // Light gray bonds (avoid black-on-black)
  latticeOpacity: 0.10,
  revealRange: 12,      // Height of progressive reveal window
  revealFade: 4         // Soft fade edges for gradient
} as const;

type SectionId = 'hero' | 'projects' | 'skills' | 'contact';

const HEIGHT = 40;
const RADIUS = 3;
const STEPS = 60;
const ROTATIONS = 5;

// Glowing halo for section markers
function SectionMarkerGlow({
  position,
  color,
  isActive,
  isE2E,
  onClick,
  onPointerDown
}: {
  position: [number, number, number];
  color: string;
  isActive?: boolean;
  isE2E?: boolean;
  onClick?: () => void;
  onPointerDown?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { gl, events } = useThree();

  useEffect(() => {
    const target = (events?.connected ?? gl.domElement) as HTMLElement | null;
    if (!target) return;
    target.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      target.style.cursor = 'auto';
    };
  }, [events?.connected, gl, hovered]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = isE2E ? 0 : state.clock.elapsedTime;
    const baseScale = isActive ? 1.5 : 1.0;
    const pulseSpeed = isActive ? 3.0 : 2.0;
    
    const pulse = 1 + Math.sin(time * pulseSpeed) * 0.1;
    meshRef.current.scale.setScalar(pulse * baseScale);

    if (outerRef.current) {
      const outerPulse = 1 + Math.sin(time * (pulseSpeed * 0.75) + 0.5) * 0.15;
      outerRef.current.scale.setScalar(outerPulse * baseScale);
    }
  });

  return (
    <group position={position}>
      {/* Larger invisible hit target for reliable clicking */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          setHovered(false);
          onClick?.();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setHovered(false);
          onPointerDown?.();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => {
          setHovered(false);
        }}
      >
        <sphereGeometry args={[5.0, 12, 12]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[PARAMS.glowScale, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.9 : 0.25} />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[PARAMS.glowScale * 1.6, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.5 : 0.08} />
      </mesh>
    </group>
  );
}

export function Helix({ scrollProgress, onNavigate, activeSection, isE2E }: HelixProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const prevHoveredRef = useRef<number | null>(null);
  const pointYPositionsRef = useRef<Float32Array | null>(null);
  const baseColorsRef = useRef<THREE.Color[] | null>(null);
  const markerScreenPositionsRef = useRef<Record<SectionId, { x: number; y: number; visible: boolean }>>({
    hero: { x: 0, y: 0, visible: false },
    projects: { x: 0, y: 0, visible: false },
    skills: { x: 0, y: 0, visible: false },
    contact: { x: 0, y: 0, visible: false }
  });
  const lastRaycastClickRef = useRef<number>(0);
  const { gl, camera, size, events, viewport } = useThree();

  // Expose debug info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__DNA_DEBUG__ = (window as any).__DNA_DEBUG__ || {};
      (window as any).__DNA_DEBUG__.markerColors = COLORS;
      (window as any).__DNA_DEBUG__.markerColorsOk = 
        COLORS.hero === '#4ea2ff' &&
        COLORS.projects === '#ff9500' &&
        COLORS.skills === '#00d9ff' &&
        COLORS.contact === '#00ff88';
    }
  }, []);

  const toWorldY = (y: number) => (HEIGHT / 2) - y;

  const { strand1, strand2 } = useMemo(() => {
    return generateHelixPoints(HEIGHT, RADIUS, STEPS, ROTATIONS);
  }, []);

  const totalPoints = strand1.length + strand2.length;

  // Section marker positions - matching spec distribution
  const clusterIndices = useMemo(() => {
    const p1Idx = Math.floor(STEPS * 0.15);  // Top - scroll-to-top
    const p2Idx = Math.floor(STEPS * 0.50);  // Middle - Projects
    const p3Idx = Math.floor(STEPS * 0.85);  // Bottom - Skills
    const p4Idx = Math.floor(STEPS * 0.95);  // Bottom - Contact
    const indices: Record<number, SectionId> = {
      [p1Idx]: 'hero',
      [p2Idx]: 'projects',
      [p3Idx]: 'skills',
      [p4Idx]: 'contact'
    };
    return indices;
  }, []);

  const markerPositions = useMemo(() => {
    const positions: Array<{ position: [number, number, number]; color: string; sectionId: SectionId }> = [];
    Object.entries(clusterIndices).forEach(([idxStr, sectionId]) => {
      const idx = parseInt(idxStr);
      const p1 = strand1[idx];
      const p2 = strand2[idx];
      if (p1 && p2) {
        positions.push({
          // Place markers on the midpoint between strands ("in the middle")
          position: [
            (p1.x + p2.x) / 2,
            toWorldY(p1.y),
            (p1.z + p2.z) / 2
          ] as [number, number, number],
          color: COLORS[sectionId],
          sectionId
        });
      }
    });
    return positions;
  }, [strand1, strand2, clusterIndices]);

  // Set up instanced mesh with proper colors
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const tempObject = new THREE.Object3D();
    const color = new THREE.Color();
    const geometry = meshRef.current.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.getAttribute('position');

    if (positionAttribute && !geometry.getAttribute('color')) {
      const colors = new Float32Array(positionAttribute.count * 3);
      colors.fill(1);
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    let index = 0;

    // Store Y positions and base colors for progressive reveal
    const yPositions = new Float32Array(totalPoints);
    const baseColors: THREE.Color[] = [];

    const setPoint = (point: RenderPoint, sectionId?: SectionId) => {
      const yPos = toWorldY(point.y);
      tempObject.position.set(point.x, yPos, point.z);

      const isCluster = !!sectionId;
      tempObject.scale.setScalar(isCluster ? PARAMS.clusterScale : PARAMS.baseScale);
      tempObject.updateMatrix();

      meshRef.current!.setMatrixAt(index, tempObject.matrix);

      // Store Y position for progressive reveal
      yPositions[index] = yPos;

      // Set color - CRITICAL FIX for black nucleotides
      if (isCluster && sectionId) {
        color.set(COLORS[sectionId]);
      } else {
        // Base particles - light gray with depth variation
        const depthFactor = (point.z + RADIUS) / (2 * RADIUS);
        color.setRGB(
          0.90 + depthFactor * 0.10,  // Slightly brighter base
          0.90 + depthFactor * 0.10,
          0.90 + depthFactor * 0.10
        );
      }
      meshRef.current!.setColorAt(index, color);

      // Store base color for progressive reveal
      baseColors.push(color.clone());

      index++;
    };

    strand1.forEach((p, i) => {
      const sectionId = clusterIndices[i];
      setPoint(p, sectionId);
    });

    strand2.forEach((p, i) => {
      // Mirror cluster coloring/scaling on both strands
      const sectionId = clusterIndices[i];
      setPoint(p, sectionId);
    });

    // Store refs for animation loop
    pointYPositionsRef.current = yPositions;
    baseColorsRef.current = baseColors;

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [strand1, strand2, clusterIndices, totalPoints]);

  // Handle hover states
  useEffect(() => {
    if (!meshRef.current || !baseColorsRef.current) return;

    const instanceId = hovered;
    const prevInstanceId = prevHoveredRef.current;

    const tempObject = new THREE.Object3D();
    const color = new THREE.Color();

    const updateInstance = (instanceId: number, isHovering: boolean) => {
      const isStrand1 = instanceId < strand1.length;
      const localIdx = isStrand1 ? instanceId : instanceId - strand1.length;
      const point = isStrand1 ? strand1[localIdx] : strand2[localIdx];
      const sectionId = clusterIndices[localIdx];
      if (!point || !sectionId) return;

      tempObject.position.set(point.x, toWorldY(point.y), point.z);
      tempObject.scale.setScalar(isHovering ? PARAMS.clusterScale * 1.3 : PARAMS.clusterScale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(instanceId, tempObject.matrix);

      color.set(COLORS[sectionId]);
      if (isHovering) color.multiplyScalar(1.2);
      meshRef.current!.setColorAt(instanceId, color);
    };

    if (prevInstanceId !== null) {
      updateInstance(prevInstanceId, false);
    }

    if (instanceId !== null) {
      updateInstance(instanceId, true);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    prevHoveredRef.current = instanceId;
  }, [hovered, strand1, clusterIndices]);

  const debugStateRef = useRef({
    lastUpdate: 0,
    hasComputedE2E: false,
    lastSize: { width: 0, height: 0 }
  });

  const triggerNavigate = useCallback((sectionId: SectionId) => {
    if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
      (window as any).__DNA_DEBUG__.lastMarkerClick = sectionId;
    }
    onNavigate?.(sectionId);
  }, [onNavigate]);

  useEffect(() => {
    if (!isE2E || typeof window === 'undefined') return;
    const debug = (window as any).__DNA_DEBUG__ ?? ((window as any).__DNA_DEBUG__ = {});
    debug.triggerMarkerClick = (sectionId: SectionId) => {
      triggerNavigate(sectionId);
    };
  }, [isE2E, triggerNavigate]);

  useEffect(() => {
    const eventSourceEl = (events?.connected ?? null) as HTMLElement | null;
    const canvasEl = gl.domElement as HTMLElement | null;
    const rectTarget = eventSourceEl ?? canvasEl ?? (typeof window !== 'undefined' ? document.documentElement : null);
    if (!rectTarget) return;

    const fallbackRadius = isE2E ? 200 : 80;

    const handlePointerDown = (event: Event) => {
      const pointerEvent = event as PointerEvent;
      if (performance.now() - lastRaycastClickRef.current < 150) return;

      const rect = rectTarget.getBoundingClientRect();
      const x = pointerEvent.clientX - rect.left;
      const y = pointerEvent.clientY - rect.top;

      const markers = markerScreenPositionsRef.current;
      let closestSection: SectionId | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      (Object.keys(markers) as SectionId[]).forEach((sectionId) => {
        const marker = markers[sectionId];
        if (!marker?.visible) return;
        const dx = marker.x - x;
        const dy = marker.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = sectionId;
        }
      });

      if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
        (window as any).__DNA_DEBUG__.fallbackLastPointer = {
          x,
          y,
          closestSection,
          closestDistance
        };
      }

      if (closestSection && closestDistance <= fallbackRadius) {
        triggerNavigate(closestSection);
      }
    };

    const targets = new Set<EventTarget>();
    if (eventSourceEl) targets.add(eventSourceEl);
    if (canvasEl) targets.add(canvasEl);
    if (typeof window !== 'undefined') targets.add(window);

    targets.forEach((target) => {
      target.addEventListener('pointerdown', handlePointerDown);
      target.addEventListener('mousedown', handlePointerDown);
      target.addEventListener('click', handlePointerDown);
    });
    if (typeof window !== 'undefined' && (window as any).__DNA_DEBUG__) {
      (window as any).__DNA_DEBUG__.fallbackListenerAttached = true;
    }
    return () => {
      targets.forEach((target) => {
        target.removeEventListener('pointerdown', handlePointerDown);
        target.removeEventListener('mousedown', handlePointerDown);
        target.removeEventListener('click', handlePointerDown);
      });
    };
  }, [events?.connected, gl, isE2E, triggerNavigate]);

  // Animation loop with progressive reveal and marker projection
  useFrame((state) => {
    if (!meshRef.current || !pointYPositionsRef.current || !baseColorsRef.current || !groupRef.current) return;

    const group = groupRef.current;

    // E2E Freeze: freeze motion to ensure deterministic snapshots
    if (isE2E) {
      if (typeof window !== 'undefined' && window.__DNA_DEBUG__) {
        window.__DNA_DEBUG__.motionFrozen = true;
      }
    }
    
    // Use fixed time for E2E to ensure consistent screenshots
    const time = isE2E ? 0 : state.clock.elapsedTime;
    
    const scroll = scrollProgress.get();

    // Gentle rotation + scroll-linked rotation
    const baseRotation = time * 0.15;
    const scrollRotation = isE2E ? 0 : scroll * Math.PI * 2;

    // Apply geometric transforms to GROUP, not mesh
    group.rotation.y = baseRotation + scrollRotation;
    group.position.y = 0;

    // Marker Projection & Luma Debug (throttled)
    const now = state.clock.elapsedTime;
    const { width, height } = size;
    const { height: viewportWorldHeight } = viewport;
    const ref = debugStateRef.current;
    const sizeChanged = width !== ref.lastSize.width || height !== ref.lastSize.height;

    let shouldUpdate = false;

    if (isE2E) {
      // E2E: Compute once or on resize
      if (!ref.hasComputedE2E || sizeChanged) {
        shouldUpdate = true;
        ref.hasComputedE2E = true;
      }
    } else {
      // Normal: Throttle to ~10Hz
      if (now - ref.lastUpdate > 0.1 || sizeChanged) {
        shouldUpdate = true;
        ref.lastUpdate = now;
      }
    }

    if (sizeChanged) {
      ref.lastSize = { width, height };
    }

    if (shouldUpdate) {
      const box = new THREE.Box3().setFromObject(group);
      const helixWorldHeight = box.max.y - box.min.y;
      
      const maxAllowedHeight = viewportWorldHeight * 0.95;
      const fitsViewport = helixWorldHeight <= maxAllowedHeight + 0.01;
      
      if (helixWorldHeight > 0.1) {
        const currentScale = group.scale.y;
        const unscaledHeight = helixWorldHeight / currentScale;
        const targetScale = maxAllowedHeight / unscaledHeight;
        
        if (!fitsViewport || Math.abs(helixWorldHeight - maxAllowedHeight) > 0.1) {
             group.scale.setScalar(targetScale);
        }
      }

      {
        const markers: Record<SectionId, { x: number; y: number; visible: boolean }> = {
          hero: { x: 0, y: 0, visible: false },
          projects: { x: 0, y: 0, visible: false },
          skills: { x: 0, y: 0, visible: false },
          contact: { x: 0, y: 0, visible: false }
        };
        const vector = new THREE.Vector3();

        const connectedEl = (events?.connected ?? gl.domElement) as HTMLElement;
        const rect = connectedEl.getBoundingClientRect();
        const cssWidth = rect.width || width;
        const cssHeight = rect.height || height;

        markerPositions.forEach(({ sectionId, position }) => {
          vector.set(position[0], position[1], position[2]);
          group.localToWorld(vector);
          vector.project(camera);

          const x = (vector.x * 0.5 + 0.5) * cssWidth;
          const y = (-(vector.y * 0.5) + 0.5) * cssHeight;
          const visible = Math.abs(vector.z) < 1;

          markers[sectionId] = { x, y, visible };
        });

        markerScreenPositionsRef.current = markers;

        if (window.__DNA_DEBUG__) {
          (window as any).__DNA_DEBUG__.markers = markers;
        }
      }

      if (window.__DNA_DEBUG__) {
        // Luma Validation
        let minBaseLuma = 1.0;
        let minCurrentLuma = 1.0;
        const color = new THREE.Color();

        for (let i = 0; i < totalPoints; i++) {
          // Sample every 5th instance AND all cluster instances
          const localIdx = i < strand1.length ? i : i - strand1.length;
          if (i % 5 === 0 || clusterIndices[localIdx]) {
            // Base Luma
            const base = baseColorsRef.current[i];
            const bLuma = 0.2126 * base.r + 0.7152 * base.g + 0.0722 * base.b;
            if (bLuma < minBaseLuma) minBaseLuma = bLuma;

            // Current Luma
            meshRef.current.getColorAt(i, color);
            const cLuma = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
            if (cLuma < minCurrentLuma) minCurrentLuma = cLuma;
          }
        }

        const debugObj = (window as any).__DNA_DEBUG__;
        debugObj.minBaseLuma = minBaseLuma;
        debugObj.minCurrentLuma = minCurrentLuma;
        debugObj.minLumaOk = minCurrentLuma >= minBaseLuma * 0.95;
        debugObj.revealMode = 'none';
        debugObj.fallbackListenerAttached = true;
        debugObj.interactionCount = (state as any).internal?.interaction?.length;
        debugObj.groupScale = group.scale.x;
        debugObj.cameraPos = [camera.position.x, camera.position.y, camera.position.z];

        // Task 8 Metrics
        debugObj.helixWorldHeight = helixWorldHeight;
        debugObj.viewportWorldHeight = viewportWorldHeight;
        debugObj.fitsViewport = fitsViewport;
      }
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId === undefined) return;

    const localIdx = instanceId < strand1.length ? instanceId : instanceId - strand1.length;
    const sectionId = clusterIndices[localIdx];
    if (sectionId && onNavigate) {
      onNavigate(sectionId);
    }
  };

  const handlePointerOver = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId === undefined) return;
    const localIdx = instanceId < strand1.length ? instanceId : instanceId - strand1.length;
    if (clusterIndices[localIdx]) {
      setHovered(instanceId);
    }
  };

  const handlePointerOut = () => {
    setHovered(null);
  };

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalPoints]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        // Markers are the primary navigation target; disable raycasting here
        // so invisible marker hit areas don't get occluded by instanced points.
        raycast={() => null}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          vertexColors={true}
          transparent={false}
          opacity={1.0}
        />
      </instancedMesh>

      {markerPositions.map(({ position, color, sectionId }) => (
        <SectionMarkerGlow
          key={sectionId}
          position={position}
          color={color}
          isActive={activeSection === sectionId}
          isE2E={isE2E}
          onClick={() => {
            lastRaycastClickRef.current = performance.now();
            triggerNavigate(sectionId);
          }}
          onPointerDown={() => {
            lastRaycastClickRef.current = performance.now();
          }}
        />
       ))}

       <Lattice strand1={strand1} strand2={strand2} height={HEIGHT} />
     </group>
  );
}

// Subtle lattice connections
function Lattice({ strand1, strand2, height }: { strand1: RenderPoint[], strand2: RenderPoint[], height: number }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const toWorldY = (y: number) => (height / 2) - y;

    // Connect strand1 sequential points
    for (let i = 0; i < strand1.length - 1; i++) {
      points.push(new THREE.Vector3(strand1[i].x, toWorldY(strand1[i].y), strand1[i].z));
      points.push(new THREE.Vector3(strand1[i + 1].x, toWorldY(strand1[i + 1].y), strand1[i + 1].z));
    }

    // Connect strand2 sequential points
    for (let i = 0; i < strand2.length - 1; i++) {
      points.push(new THREE.Vector3(strand2[i].x, toWorldY(strand2[i].y), strand2[i].z));
      points.push(new THREE.Vector3(strand2[i + 1].x, toWorldY(strand2[i + 1].y), strand2[i + 1].z));
    }

    // Connect rungs (base pairs)
    for (let i = 0; i < strand1.length; i++) {
      points.push(new THREE.Vector3(strand1[i].x, toWorldY(strand1[i].y), strand1[i].z));
      points.push(new THREE.Vector3(strand2[i].x, toWorldY(strand2[i].y), strand2[i].z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [strand1, strand2, height]);

  return (
    <lineSegments geometry={geometry} raycast={() => null}>
      <lineBasicMaterial
        color={PARAMS.latticeColor}
        transparent
        opacity={PARAMS.latticeOpacity}
      />
    </lineSegments>
  );
}
