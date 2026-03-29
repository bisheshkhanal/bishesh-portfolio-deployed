import Skills from '../components/Skills';
import Projects from '../components/Projects';
import { projects } from '../data/projectsData';

const experimentProjects = projects.filter(p => p.isExperiment);

export default function WorkRoute() {
  return (
    <>
      <Skills />
      <Projects />
      {experimentProjects.length > 0 && (
        <section id="experiments" className="w-full py-24 lg:py-32">
          <h2 className="text-[48px] font-normal mb-12 tracking-tight">Experiments</h2>
          {/* Experiment projects would render here when isExperiment projects exist */}
        </section>
      )}
    </>
  );
}
