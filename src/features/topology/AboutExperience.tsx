import { useTopologyQuality } from './useTopologyQuality';
import { TopologyScene } from './TopologyScene';
import { ReducedMotionTopology } from './ReducedMotionTopology';

export function AboutExperience() {
  const { prefersReducedMotion, particleCount } = useTopologyQuality();

  if (prefersReducedMotion) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <ReducedMotionTopology />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <TopologyScene particleCount={particleCount} />
    </div>
  );
}
