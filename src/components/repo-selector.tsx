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
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Active Repos
      </h3>
      <div className="space-y-2">
        {projects.map((project) => {
          const isSelected = selected.includes(project.id);
          return (
            <label
              key={project.id}
              className={`flex items-center gap-3 cursor-pointer rounded-lg px-2.5 py-2 -mx-2.5 transition-colors ${
                isSelected ? "bg-secondary/60" : "hover:bg-secondary/30"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(project.id)}
                className="data-[state=checked]:bg-[#FF4433] data-[state=checked]:border-[#FF4433]"
              />
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-offset-1 ring-offset-transparent"
                style={{
                  backgroundColor: project.color,
                  boxShadow: isSelected ? `0 0 6px ${project.color}40` : "none",
                }}
              />
              <span className={`text-sm truncate transition-colors ${
                isSelected ? "text-foreground font-medium" : "text-muted-foreground"
              }`}>
                {project.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
