import { bio } from '../../data/bioData';
import { ScenePortal } from '../ScenePortal/ScenePortal';

export default function AboutSection() {
  return (
    <section id="about-section" className="w-full py-24 lg:py-32">
      <h2 className="text-[48px] font-normal mb-12 tracking-tight">
        About
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-6">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {bio.greeting}
          </h3>
          <div className="text-[var(--gray)] text-lg leading-relaxed space-y-6">
            {bio.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <ScenePortal />
      </div>
    </section>
  );
}
