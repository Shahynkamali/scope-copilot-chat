"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { ProjectBadge } from "./project-badge";
import { SourceReference } from "@/lib/types";

interface SourceCardProps {
  source: SourceReference;
  color: string;
}

export function SourceCard({ source, color }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border overflow-hidden bg-card/50 transition-colors hover:bg-card"
      style={{ borderColor: `${color}20` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <FileCode className="h-3.5 w-3.5 shrink-0" style={{ color }} />
        <span className="text-xs font-mono text-foreground truncate flex-1">
          {source.filePath}
        </span>
        <ProjectBadge name={source.projectName} color={color} />
      </button>
      {expanded && source.snippet && (
        <div className="border-t px-3 py-3" style={{ borderColor: `${color}15`, backgroundColor: `${color}05` }}>
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {source.snippet}
          </pre>
        </div>
      )}
    </div>
  );
}
