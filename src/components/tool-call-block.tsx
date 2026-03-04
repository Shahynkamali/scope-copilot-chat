"use client";

import { useState } from "react";
import { Wrench, ChevronDown, ChevronRight } from "lucide-react";
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
    <div className="border border-border/50 rounded-md bg-accent/30 text-xs my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-accent/50 transition-colors"
      >
        <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground font-medium">
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
        <div className="border-t border-border/50 px-3 py-2 bg-black/10">
          <pre className="font-mono text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(toolCall.arguments, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
