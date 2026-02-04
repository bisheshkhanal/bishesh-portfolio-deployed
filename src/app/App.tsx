import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import DNAHelix from '../components/DNAHelix/DNAHelix';
import { MainLayout } from '../layouts/MainLayout';
import './app.css';

export default function App() {
  return (
    <MainLayout dnaSlot={<DNAHelix />}>
      <Hero />
      <Projects />
      <Skills />
      <Contact />
    </MainLayout>
  );
}
