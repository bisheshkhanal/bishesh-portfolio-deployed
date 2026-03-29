import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { experienceData } from '../../data/experienceData';

export default function ExperienceSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.5, 1, 0.5, 1] as [number, number, number, number],
      },
    },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.5, 1, 0.5, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section id="experience" className="w-full py-24 lg:py-32">
      <motion.h2
        className="text-[48px] font-normal mb-12 tracking-tight"
        variants={headingVariants}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        animate="visible"
      >
        Experience
      </motion.h2>

      <motion.div
        className="flex flex-col gap-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {experienceData.map((entry) => (
          <motion.article
            key={entry.id}
            className="bg-[#1a1a1a] rounded-xl p-8"
            variants={itemVariants}
          >
            <div className="flex flex-col">
              <span className="text-sm font-mono text-white/40 mb-2">
                {entry.period}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                {entry.role}
              </h3>
              <span className="text-base text-[var(--cyan)]">
                {entry.organization}
              </span>
              <p className="text-[var(--gray)] leading-relaxed mt-2">
                {entry.description}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
