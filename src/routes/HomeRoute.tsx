import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import AboutSection from '../components/AboutSection/AboutSection';

export default function HomeRoute() {
  return (
    <>
      <Hero />
      <Projects />
      <Skills />
      <AboutSection />
      <Contact />
    </>
  );
}
