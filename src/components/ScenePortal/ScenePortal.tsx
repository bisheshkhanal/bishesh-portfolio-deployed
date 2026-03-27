import { Component, ReactNode, useState, useRef, useEffect } from 'react';
import { TopologyScene } from '../../features/topology/TopologyScene';
import { useTopologyQuality } from '../../features/topology/useTopologyQuality';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SceneErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return <>{this.props.children}</>;
  }
}

export interface ScenePortalProps {
  onExpand?: () => void;
  className?: string;
}

export function ScenePortal({ onExpand, className = '' }: ScenePortalProps) {
  const { particleCount } = useTopologyQuality();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  const handleExpand = () => {
    if (isOpen || isTransitioning.current) return;
    isTransitioning.current = true;
    if (placeholderRef.current) {
      setRect(placeholderRef.current.getBoundingClientRect());
      setIsOpen(true);
      onExpand?.();
      
      // Wait for React to render the fixed position at the original rect
      // before triggering the transition to fullscreen
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsFullscreen(true);
        });
      });
    }
  };

  const handleCollapse = () => {
    if (!isOpen || isTransitioning.current) return;
    isTransitioning.current = true;
    if (placeholderRef.current) {
      // Re-measure in case window resized while expanded
      setRect(placeholderRef.current.getBoundingClientRect());
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target === portalRef.current && !isFullscreen) {
      setIsOpen(false);
    }
    if (e.target === portalRef.current) {
      isTransitioning.current = false;
    }
  };

  const portalStyle: React.CSSProperties = {
    transition: prefersReducedMotion ? 'none' : 'all 400ms ease-in-out',
  };

  if (isOpen) {
    portalStyle.position = 'fixed';
    portalStyle.zIndex = 9999;
    portalStyle.margin = 0;
    
    if (isFullscreen) {
      portalStyle.top = 0;
      portalStyle.left = 0;
      portalStyle.width = '100vw';
      portalStyle.height = '100vh';
      portalStyle.borderRadius = 0;
    } else if (rect) {
      portalStyle.top = rect.top;
      portalStyle.left = rect.left;
      portalStyle.width = rect.width;
      portalStyle.height = rect.height;
      portalStyle.borderRadius = '0.5rem';
    }
  } else {
    portalStyle.position = 'relative';
    portalStyle.width = '100%';
    portalStyle.height = '100%';
    portalStyle.borderRadius = '0.5rem';
  }

  return (
    <div 
      ref={placeholderRef}
      className={`relative w-full h-[400px] md:h-[450px] ${className}`}
    >
      <div
        ref={portalRef}
        className={`overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center ${!isOpen ? 'cursor-pointer' : ''}`}
        style={portalStyle}
        onClick={!isOpen ? handleExpand : undefined}
        onTransitionEnd={handleTransitionEnd}
        role={!isOpen ? "button" : "dialog"}
        tabIndex={!isOpen ? 0 : -1}
        onKeyDown={(e) => {
          if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleExpand();
          }
        }}
        aria-label={!isOpen ? "Expand interactive 3D scene" : "Interactive 3D scene"}
        aria-modal={isOpen ? true : undefined}
      >
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCollapse();
            }}
            aria-label="Return to page"
            className="absolute top-6 px-4 py-2 text-sm text-[var(--gray)] border border-[var(--border)] bg-[var(--bg-black)] rounded-md"
            style={{
              right: 'calc(var(--sidebar-width) + 1.5rem)',
              zIndex: 10001,
              pointerEvents: 'auto',
            }}
          >
            Return
          </button>
        )}
        <SceneErrorBoundary
          fallback={
            <div className="p-4 text-sm text-[var(--gray)] text-center">
              Interactive scene unavailable.
            </div>
          }
        >
          <TopologyScene
            particleCount={particleCount}
            frameloop="always"
            previewMode={!isOpen}
          />
        </SceneErrorBoundary>
      </div>
    </div>
  );
}
