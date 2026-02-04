export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface RenderPoint extends Point3D {
  scale: number;
  opacity: number;
  id: string;
}

export const generateHelixPoints = (
  height: number,
  radius: number,
  steps: number = 50,
  rotations: number = 4
): { strand1: RenderPoint[]; strand2: RenderPoint[] } => {
  const strand1: RenderPoint[] = [];
  const strand2: RenderPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const y = progress * height;
    const angle = progress * rotations * Math.PI * 2;

    // Strand 1
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    
    // Strand 2 (180 degrees offset)
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    // Calculate depth effects (z is -radius to +radius)
    // Front points (z > 0) are larger and more opaque
    const getDepthProps = (z: number) => {
      const normalizedZ = (z + radius) / (2 * radius); // 0 to 1
      return {
        scale: 0.5 + normalizedZ * 0.5, // 0.5 to 1.0
        opacity: 0.3 + normalizedZ * 0.7, // 0.3 to 1.0
      };
    };

    const props1 = getDepthProps(z1);
    const props2 = getDepthProps(z2);

    strand1.push({
      x: x1,
      y,
      z: z1,
      ...props1,
      id: `s1-${i}`,
    });

    strand2.push({
      x: x2,
      y,
      z: z2,
      ...props2,
      id: `s2-${i}`,
    });
  }

  return { strand1, strand2 };
};

export const getPointOnHelix = (
  progress: number, // 0 to 1
  height: number,
  radius: number,
  rotations: number = 4,
  offsetPhase: number = 0 // 0 for strand 1, Math.PI for strand 2
): RenderPoint => {
  const y = progress * height;
  const angle = progress * rotations * Math.PI * 2 + offsetPhase;
  
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const normalizedZ = (z + radius) / (2 * radius);
  
  return {
    x,
    y,
    z,
    scale: 0.5 + normalizedZ * 0.8, // Slightly emphasized for active marker
    opacity: 0.5 + normalizedZ * 0.5,
    id: 'marker',
  };
};
