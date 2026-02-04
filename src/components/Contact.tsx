import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { socialLinks } from '../data/socialData';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { IconType } from 'react-icons';

// Map social types to icons
const iconMap: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: FaEnvelope,
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

export default function Contact() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section id="contact" className="w-full py-24 lg:py-32">
       <motion.h2
         className="text-[48px] font-normal leading-tight mb-8 tracking-tight"
         variants={headingVariants}
         initial={prefersReducedMotion ? "visible" : "hidden"}
         animate="visible"
       >
         Contact
       </motion.h2>
      <div className="flex gap-8 flex-wrap">
        {socialLinks.map((link, idx) => {
          const Icon = iconMap[link.type];
          return (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-[var(--gray)] hover:text-[var(--cyan)] transition-all duration-200 ease-[cubic-bezier(0.5,1,0.5,1)] hover:brightness-110"
            >
              {Icon && <Icon className="w-6 h-6" />}
              <span className="text-base">{link.name}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
