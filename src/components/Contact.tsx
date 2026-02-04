import { socialLinks } from '../data/socialData';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { IconType } from 'react-icons';

// Map social types to icons
const iconMap: Record<string, IconType> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  email: FaEnvelope,
};

export default function Contact() {
  return (
    <section id="contact" className="w-full py-24">
      <h2 className="text-[48px] font-normal leading-tight mb-8">Contact</h2>
      <div className="flex gap-8 flex-wrap">
        {socialLinks.map((link, idx) => {
          const Icon = iconMap[link.type];
          return (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-[var(--gray)] hover:text-[var(--cyan)] transition-colors"
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
