"use client";

import { Project } from "@/lib/types";

interface RepoSelectorProps {
  projects: Project[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function RepoSelector({ projects, selected, onToggle }: RepoSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-semibold text-[#888] uppercase tracking-widest">
        Active Repos
      </h3>
      <div className="space-y-1">
        {projects.map((project) => {
          const isSelected = selected.includes(project.id);
          return (
            <button
              key={project.id}
              onClick={() => onToggle(project.id)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                isSelected
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#555] hover:text-[#888] hover:bg-[#111]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  isSelected ? "bg-[#FF4433]" : "bg-[#333]"
                }`}
              />
              <span className="text-sm truncate">{project.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
