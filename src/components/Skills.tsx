import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { skillsData } from '../data/skillsData';
import {
  SiPython,
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiDjango,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiDocker,
  SiAmazonwebservices,
  SiGithub,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { IconType } from 'react-icons';

// Map skill IDs to their react-icons components
const iconMap: Record<string, IconType> = {
  python: SiPython,
  java: FaJava,
  javascript: SiJavascript,
  react: SiReact,
  react2: SiReact,
  node: SiNodedotjs,
  django: SiDjango,
  html: SiHtml5,
  css: SiCss3,
  tailwind: SiTailwindcss,
  postgres: SiPostgresql,
  mongodb: SiMongodb,
  docker: SiDocker,
  aws: SiAmazonwebservices,
  github: SiGithub,
};

export default function Skills() {
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
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.5, 1, 0.5, 1],
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
        ease: [0.5, 1, 0.5, 1],
      },
    },
  };

  return (
    <section id="skills" className="w-full py-24 lg:py-32">
        <motion.h2
          className="text-[48px] font-normal mb-12 tracking-tight"
          variants={headingVariants}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
        >
          Skills
        </motion.h2>

       <div className="bg-[#1a1a1a] rounded-xl p-8 lg:p-12">
          {(() => {
            let globalSkillIndex = 0;
            return skillsData.map((group) => (
              <div key={group.label} className="mb-12 last:mb-0">
                <h3 className="text-sm uppercase tracking-widest text-white/50 mb-8 border-b border-white/5 pb-2">
                  {group.label}
                </h3>

                <motion.div
                  className="grid grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10"
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  {group.skills.map((skill) => {
                    const Icon = iconMap[skill.id];
                    const currentIndex = globalSkillIndex++;
                    const shouldStagger = currentIndex < 5;

                    return (
                      <motion.div
                        key={skill.id}
                        className="flex flex-col items-center hover:brightness-110 transition-all duration-200 ease-[cubic-bezier(0.5,1,0.5,1)]"
                        variants={itemVariants}
                        transition={
                          shouldStagger
                            ? undefined
                            : { duration: 0.4, ease: [0.5, 1, 0.5, 1], delay: 0 }
                        }
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-3">
                          {Icon ? (
                            <Icon className="w-10 h-10 text-white" />
                          ) : (
                            <span className="text-3xl font-bold text-white">
                              {skill.iconKey[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-white/60 text-center">
                          {skill.name}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            ));
          })()}
       </div>
    </section>
  );
}
