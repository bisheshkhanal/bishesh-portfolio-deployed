import { useTopologyQuality } from './useTopologyQuality';
import { TopologyScene } from './TopologyScene';
import { ReducedMotionTopology } from './ReducedMotionTopology';

export interface AboutExperienceProps {
  className?: string;
  style?: React.CSSProperties;
  frameloop?: 'always' | 'demand';
}

export function AboutExperience({ className, style, frameloop = 'always' }: AboutExperienceProps = {}) {
  const { prefersReducedMotion, particleCount } = useTopologyQuality();

  if (prefersReducedMotion) {
    return (
      <div className={className} style={{ width: '100%', height: '100%', ...style }}>
        <ReducedMotionTopology />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <TopologyScene particleCount={particleCount} frameloop={frameloop} />
    </div>
  );
}
