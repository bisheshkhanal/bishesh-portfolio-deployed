import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/projectsData';
import { projectDetails } from '../data/projectDetailsData';

// Tech badge color-coding per design spec
const getBadgeColor = (tech: string) => {
  const languages = ['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'];
  const frameworks = ['react', 'django', 'node', 'express', 'vue', 'angular', 'spring', 'flask', 'fastapi', 'next', 'svelte'];
  const tools = ['docker', 'aws', 'git', 'postgres', 'postgresql', 'mongodb', 'redis', 'kubernetes', 'azure', 'gcp', 'firebase', 'mysql', 'sqlite'];

  const t = tech.toLowerCase();
  if (languages.some(l => t.includes(l))) return 'bg-[#00d9ff]/20 text-[#00d9ff]';
  if (frameworks.some(f => t.includes(f))) return 'bg-[#00ff88]/20 text-[#00ff88]';
  if (tools.some(tl => t.includes(tl))) return 'bg-[#ff9500]/20 text-[#ff9500]';
  return 'bg-white/10 text-white/70';
};

export default function Projects() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <section id="projects" className="w-full py-24">
      <h2 className="text-[48px] font-normal mb-12 tracking-wide">PROJECTS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((p) => {
          const detail: any = (projectDetails as any)[p.id];
          const isOpen = expanded === p.id;
          
          return (
            <motion.article
              key={p.id}
              layout
              data-testid="project-card"
              data-project-id={p.id}
              className={`
                relative overflow-hidden rounded-xl p-8 cursor-pointer transition-colors duration-200
                bg-[#1a1a1a] hover:bg-[#222222]
                ${isOpen ? 'lg:col-span-2 z-10' : ''}
              `}
              onClick={() => toggle(p.id)}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{p.title}</h3>
                    <motion.div 
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        className="text-white/50 text-2xl"
                    >
                        +
                    </motion.div>
                </div>
                
                <p className="text-[var(--gray)] mb-6 text-lg leading-relaxed">{p.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {(p.technologies || []).slice(0, isOpen ? undefined : 3).map((t: string) => (
                    <span
                        key={t}
                        className={`px-3 py-1 rounded-md text-xs font-medium ${getBadgeColor(t)}`}
                    >
                      {t}
                    </span>
                  ))}
                  {!isOpen && (p.technologies || []).length > 3 && (
                      <span className="px-3 py-1 rounded-md text-xs font-medium text-white/40">
                          +{(p.technologies || []).length - 3}
                      </span>
                  )}
                </div>

                <AnimatePresence>
                  {isOpen && detail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 border-t border-white/5 pt-8"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="lg:col-span-2">
                                <h4 className="text-white/80 uppercase tracking-widest text-sm mb-4">Overview</h4>
                                <p className="text-[var(--gray)] leading-relaxed mb-6">
                                    {detail.overview}
                                </p>
                                
                                {detail.features && (
                                  <>
                                    <h4 className="text-white/80 uppercase tracking-widest text-sm mb-4">Key Features</h4>
                                    <ul className="space-y-3">
                                        {detail.features.map((f: any, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 text-[var(--gray)]">
                                            <span className="text-[var(--cyan)] mt-1.5 text-[10px]">●</span>
                                            <span>
                                                <strong className="text-white/90">{f.title}:</strong> {f.description}
                                            </span>
                                        </li>
                                        ))}
                                    </ul>
                                  </>
                                )}
                             </div>
                             
                             <div className="flex flex-col gap-4">
                                <h4 className="text-white/80 uppercase tracking-widest text-sm">Links</h4>
                                <div className="flex flex-col gap-3">
                                    {p.demoLink && (
                                        <a 
                                            href={p.demoLink} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex items-center gap-2 text-[var(--cyan)] hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>Live Demo</span>
                                            <span>→</span>
                                        </a>
                                    )}
                                    {p.repoLink && (
                                        <a 
                                            href={p.repoLink} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex items-center gap-2 text-white hover:text-[var(--cyan)] transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>GitHub Repo</span>
                                            <span>↗</span>
                                        </a>
                                    )}
                                </div>
                             </div>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
