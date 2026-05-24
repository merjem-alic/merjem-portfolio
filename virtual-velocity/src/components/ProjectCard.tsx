import { useState } from 'react';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-surface0 border rounded-lg p-5 flex flex-col gap-3 transition-all duration-200 cursor-default ${
        isHovered ? 'border-blue' : 'border-surface1'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span
          className={`text-blue text-sm font-bold transition-all duration-150 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          &gt;
        </span>
        <h3 className="font-bold text-sm md:text-base" style={{ color: '#eff1f5' }}>{project.title}</h3>
        {project.status === 'ongoing' && (
          <span className="ml-auto text-green text-xs border border-green px-1.5 py-0.5 rounded opacity-70">
            ongoing
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-subtext text-xs md:text-sm leading-relaxed flex-1">
        {project.summary}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-blue text-xs bg-surface1 px-1.5 py-0.5 rounded font-mono"
          >
            [{tag}]
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex items-center gap-4 pt-1 border-t border-surface1">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-subtext hover:text-blue text-xs transition-colors duration-150 flex items-center gap-1"
          >
            GitHub <span>→</span>
          </a>
        )}
        {project.caseStudyUrl && (
          <a
            href={project.caseStudyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-subtext hover:text-blue text-xs transition-colors duration-150 flex items-center gap-1"
          >
            Case Study <span>→</span>
          </a>
        )}
      </div>
    </div>
  );
}
