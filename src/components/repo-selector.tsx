"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/lib/types";

interface RepoSelectorProps {
  projects: Project[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function RepoSelector({ projects, selected, onToggle }: RepoSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Active Repos
      </h3>
      {projects.map((project) => (
        <label
          key={project.id}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Checkbox
            checked={selected.includes(project.id)}
            onCheckedChange={() => onToggle(project.id)}
          />
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {project.name}
          </span>
        </label>
      ))}
    </div>
  );
}
