import Hero from '../components/Hero';
import ExperienceSection from '../components/ExperienceSection/ExperienceSection';
import Projects from '../components/Projects';
import AboutSection from '../components/AboutSection/AboutSection';
import Contact from '../components/Contact';

export default function HomeRoute() {
  return (
    <>
      <Hero />
      <ExperienceSection />
      <Projects featured />
      <AboutSection />
      <Contact />
    </>
  );
}
