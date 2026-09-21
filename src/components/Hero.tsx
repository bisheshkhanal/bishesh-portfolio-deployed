import { bio } from '../data/bioData';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export default function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ladderWidths = ['w-[252px]', 'w-[144px]', 'w-[90px]', 'w-[54px]', 'w-[36px]', 'w-[27px]', 'w-[18px]', 'w-[9px]'] as const;

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <header id="hero" className="relative flex flex-col justify-center min-h-[80vh] mb-24">
      <h1 className="text-[80px] lg:text-[100px] font-bold leading-[0.9] tracking-tighter mb-4 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
        {bio.name.toUpperCase()}
      </h1>
       <div className="max-w-2xl">
         <p className="text-xl text-[var(--gray)] leading-relaxed font-light">
           {bio.tagline}
         </p>
       </div>

      <button
        data-testid="hero-scroll-cue"
        onClick={scrollToProjects}
        className="mt-16 flex items-start py-2 text-white/55 hover:text-white/85 transition-colors cursor-pointer group"
        aria-label="Scroll to projects"
      >
        <span className="sr-only">Scroll to projects</span>
        <div className="flex flex-col items-start gap-[18px]" aria-hidden="true">
          {ladderWidths.map((widthClass, index) => (
            <span
              key={widthClass}
              className={`${widthClass} h-[1.5px] rounded-full bg-current ${prefersReducedMotion ? '' : 'hero-ladder-bar'}`}
              style={prefersReducedMotion ? undefined : { animationDelay: `${index * 120}ms` }}
            />
          ))}
        </div>
      </button>
    </header>
  );
}
