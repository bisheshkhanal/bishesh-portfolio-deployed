import { useState, useEffect, useCallback } from 'react';
import { AboutExperience } from './AboutExperience';

interface IntroOverlayProps {
  onExit: () => void;
}

export function IntroOverlay({ onExit }: IntroOverlayProps) {
  const [exiting, setExiting] = useState(false);

  const handleExit = useCallback(() => {
    if (exiting) return;
    setExiting(true);
  }, [exiting]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && exiting) {
        onExit();
      }
    },
    [exiting, onExit],
  );

  useEffect(() => {
    document.body.classList.add('intro-active');
    return () => {
      document.body.classList.remove('intro-active');
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);

  return (
    <div
      data-testid="intro-overlay"
      className={`intro-overlay${exiting ? ' intro-exiting' : ''}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <AboutExperience
        onComplete={handleExit}
        frameloop="always"
      />
      <button
        data-testid="skip-intro"
        onClick={handleExit}
        aria-label="Skip intro"
        className="absolute bottom-6 right-6 z-10 px-5 py-3 min-h-[44px] rounded-lg text-sm text-white/90 tracking-wide transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)] cursor-pointer"
        style={{
          pointerEvents: 'auto',
          background: 'rgba(10,10,10,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        Skip Intro
      </button>
    </div>
  );
}
