import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  dnaSlot: ReactNode;
}

export const MainLayout = ({ children, dnaSlot }: MainLayoutProps) => {
  return (
    <div 
      data-testid="app-shell"
      className="relative min-h-screen bg-[#0a0a0a] text-[var(--white)] overflow-x-hidden selection:bg-[var(--cyan)] selection:text-[var(--bg-black)] before:content-[''] before:absolute before:inset-0 before:z-0 before:pointer-events-none before:bg-diagonal-grid"
    >
      <aside
        data-testid="dna-rail"
        className="fixed top-0 right-0 h-screen z-20 flex items-stretch justify-stretch"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className="w-full h-full">
            {dnaSlot}
        </div>
      </aside>

      <main 
        className="relative z-10 min-h-screen w-full box-border flex flex-col"
        style={{ paddingRight: 'var(--sidebar-width)' }}
      >
        <div className="w-full h-full p-5 lg:p-14">
           <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]"> 
              {children}
           </div>
        </div>
      </main>
    </div>
  );
};
