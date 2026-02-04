import { bio } from '../data/bioData';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export default function Hero() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const resumeUrl = baseUrl.endsWith('/') 
    ? baseUrl + 'Bishesh_Khanal_Resume.pdf'
    : baseUrl + '/' + 'Bishesh_Khanal_Resume.pdf';
  
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <header id="hero" className="relative flex flex-col justify-center min-h-[80vh] mb-24">
      <h1 className="text-[80px] lg:text-[100px] font-bold leading-[0.9] tracking-tighter mb-4 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
        {bio.name.toUpperCase()}
      </h1>
      <p className="text-[var(--cyan)] text-2xl lg:text-3xl tracking-[0.2em] font-light mb-8 uppercase drop-shadow-[0_0_10px_rgba(0,217,255,0.4)]">
        Computer Science <span className="mx-2 text-white/50">×</span> Biology
      </p>
      <div className="max-w-2xl">
        <p className="text-xl text-[var(--gray)] leading-relaxed font-light">
          {bio.tagline}
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[var(--cyan)] text-black font-medium rounded hover:bg-[var(--cyan)]/90 transition-colors duration-200"
          >
            Download Resume
          </a>
        </div>
      </div>

      <section id="about" className="mt-32 max-w-3xl">
         <div className="space-y-4 mb-12">
             {bio.subheaders.map((sub, idx) => (
               <h2 key={idx} className="text-3xl lg:text-4xl font-light text-white/90 tracking-tight">
                 {sub}
               </h2>
             ))}
         </div>
         <div className="space-y-6 text-lg text-[var(--gray)] leading-relaxed">
            {bio.paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
         </div>
      </section>

      <div
        data-testid="hero-ladder"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 p-4 opacity-50 select-none pointer-events-none"
      >
        <div className="flex flex-col gap-1.5 items-center">
            <div className="w-8 h-0.5 bg-[var(--cyan)]/50" />
            <div className="w-6 h-0.5 bg-[var(--cyan)]/50" />
            <div className="w-4 h-0.5 bg-[var(--cyan)]/50" />
        </div>
        
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-[var(--cyan)] mt-1"
        >
          <path d="M7 13l5 5 5-5" />
          <path d="M7 6l5 5 5-5" />
        </svg>
      </div>
    </header>
  );
}
