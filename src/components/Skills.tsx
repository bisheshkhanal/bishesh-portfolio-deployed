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
  return (
    <section id="skills" className="w-full py-24">
       <h2 className="text-[48px] font-normal mb-12 tracking-wide">Skills</h2>

       <div className="bg-[#1a1a1a] rounded-xl p-8 lg:p-12">
          {skillsData.map((group) => (
            <div key={group.label} className="mb-12 last:mb-0">
              <h3 className="text-sm uppercase tracking-widest text-white/50 mb-8 border-b border-white/5 pb-2">
                {group.label}
              </h3>

              <div className="grid grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
                {group.skills.map((skill) => {
                  const Icon = iconMap[skill.id];
                  return (
                    <div
                      key={skill.id}
                      className="flex flex-col items-center"
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
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
       </div>
    </section>
  );
}
