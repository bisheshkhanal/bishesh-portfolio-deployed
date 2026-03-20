import { BEAT_CONFIGS } from './topologyConfig';

export function ReducedMotionTopology() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        background: '#080808',
        color: 'rgba(255,255,255,0.85)',
      }}
      aria-label="About — Topology of Potential"
    >
      {BEAT_CONFIGS.map((beat, i) => (
        <section
          key={beat.label}
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            padding: '10vh 10vw',
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            <p style={{
              color: 'rgba(0, 217, 255, 0.5)',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              fontFamily: 'monospace',
            }}>
              {String(i + 1).padStart(2, '0')} / {beat.label}
            </p>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 22px)',
              lineHeight: 1.8,
              fontWeight: 300,
              margin: 0,
            }}>
              {beat.copy}
            </p>
          </div>
        </section>
      ))}
    </div>
  );
}
