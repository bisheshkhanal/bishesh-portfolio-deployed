import { useRef } from 'react';
import { Scroll, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { BEAT_CONFIGS } from './topologyConfig';

// Individual beat panel — updates opacity via ref to avoid React re-renders
function BeatPanel({ beat, index }: { beat: typeof BEAT_CONFIGS[0]; index: number; key?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (!ref.current) return;
    const s = scroll.offset;
    const { scrollStart, scrollEnd } = beat;
    const range = scrollEnd - scrollStart;
    const fadeIn = 0.06;   // fraction of beat range used for fade-in
    const fadeOut = 0.06;  // fraction of beat range used for fade-out

    let opacity = 0;
    if (index === 0 && s < scrollStart) {
      opacity = 1;
    } else if (index === BEAT_CONFIGS.length - 1 && s > scrollEnd) {
      opacity = 1;
    } else if (s >= scrollStart && s <= scrollEnd) {
      const local = (s - scrollStart) / range;
      if (local < fadeIn) {
        opacity = index === 0 ? 1 : local / fadeIn;
      } else if (local > 1 - fadeOut) {
        opacity = (1 - local) / fadeOut;
      } else {
        opacity = 1;
      }
    }
    ref.current.style.opacity = String(opacity);
  });

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isEven ? 'flex-start' : 'flex-end',
        padding: '0 8vw',
        pointerEvents: 'none',
        opacity: 0,
        willChange: 'opacity',
      }}
    >
      <div style={{ maxWidth: '520px' }}>
        {/* Beat number + label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <span style={{
            color: 'rgba(0, 217, 255, 0.5)',
            fontSize: '10px',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            width: '32px',
            height: '1px',
            background: 'rgba(0, 217, 255, 0.3)',
            display: 'inline-block',
          }} />
          <span style={{
            color: 'rgba(255, 255, 255, 0.35)',
            fontSize: '10px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}>
            {beat.label}
          </span>
        </div>

        {/* Body copy */}
        <p style={{
          color: 'rgba(255, 255, 255, 0.92)',
          fontSize: 'clamp(15px, 1.6vw, 20px)',
          lineHeight: 1.8,
          fontWeight: 300,
          letterSpacing: '0.01em',
          margin: 0,
        }}>
          {beat.copy}
        </p>
      </div>
    </div>
  );
}

export function TopologyOverlay() {
  return (
    <Scroll html>
      <div style={{ width: '100vw' }}>
        {BEAT_CONFIGS.map((beat, i) => (
          <BeatPanel key={beat.label} beat={beat} index={i} />
        ))}
      </div>
    </Scroll>
  );
}
