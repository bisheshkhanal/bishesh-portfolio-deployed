import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import ExperienceSection from '../components/ExperienceSection/ExperienceSection';
import Contact from '../components/Contact';

export default function HomeRoute() {
  return (
    <>
      <Hero />
      <Projects featured />
      <Skills />
      <ExperienceSection />
      <Contact />
    </>
  );
}
