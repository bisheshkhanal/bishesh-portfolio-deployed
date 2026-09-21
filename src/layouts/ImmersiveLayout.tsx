import { ReactNode } from 'react';

interface ImmersiveLayoutProps {
  children: ReactNode;
}

export const ImmersiveLayout = ({ children }: ImmersiveLayoutProps) => {
  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-black"
      data-testid="immersive-shell"
    >
      {children}
    </div>
  );
};
