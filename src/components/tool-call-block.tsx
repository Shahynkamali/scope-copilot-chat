"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { ProjectBadge } from "./project-badge";
import { ToolCall, Project } from "@/lib/types";

interface ToolCallBlockProps {
  toolCall: ToolCall;
  projects: Project[];
}

export function ToolCallBlock({ toolCall, projects }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const project = projects.find((p) => p.id === toolCall.projectId);

  const displayName = toolCall.name
    .replace("scope_", "")
    .replace(/_/g, " ");

  return (
    <div className="rounded-lg border border-border/50 bg-secondary/50 text-xs overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors"
      >
        <Search className="h-3 w-3 text-[#FF4433] shrink-0" />
        <span className="text-muted-foreground">
          {displayName}
        </span>
        {project && (
          <ProjectBadge name={project.name} color={project.color} />
        )}
        <span className="flex-1" />
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/50 px-3 py-2 bg-background/50">
          <pre className="font-mono text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(toolCall.arguments, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
