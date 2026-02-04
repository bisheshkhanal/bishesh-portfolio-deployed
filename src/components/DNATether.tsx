import { useActiveSection } from '../hooks/useActiveSection';

const SECTION_CONFIG = [
  { id: 'hero', color: '#4ea2ff', top: '15%' },
  { id: 'projects', color: '#ff9500', top: '50%' },
  { id: 'skills', color: '#00d9ff', top: '85%' },
  { id: 'contact', color: '#00ff88', top: '95%' }
] as const;

export default function DNATether() {
  const activeSection = useActiveSection(SECTION_CONFIG.map(s => s.id));

  return (
    <div 
      className="fixed top-0 right-0 h-screen pointer-events-none z-40 hidden md:block"
      style={{ width: 'clamp(50px, 20vw, 384px)' }}
      data-testid="dna-tether"
      data-active-section={activeSection}
    >
      {SECTION_CONFIG.map((section) => {
        const isActive = activeSection === section.id;
        
        return (
          <div 
            key={section.id}
            className="absolute left-0 flex items-center justify-end"
            style={{
              top: section.top,
              width: isActive ? '60px' : '40px',
              transform: 'translate(-100%, -50%)',
            }}
          >
            <div
                className="h-[2px] w-full rounded-l-full transition-all duration-500 ease-out"
                style={{
                    backgroundColor: section.color,
                    opacity: isActive ? 1 : 0.3,
                    boxShadow: isActive ? `0 0 12px ${section.color}` : 'none',
                }}
            />
          </div>
        );
      })}
    </div>
  );
}
