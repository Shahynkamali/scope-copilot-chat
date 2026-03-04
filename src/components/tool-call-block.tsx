"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { ToolCall, Project } from "@/lib/types";

interface ToolCallBlockProps {
  toolCall: ToolCall;
  projects: Project[];
}

export function ToolCallBlock({ toolCall, projects }: ToolCallBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const project = projects.find((p) => p.id === toolCall.projectId);

  const displayName = toolCall.name.replace("scope_", "").replace(/_/g, " ");

  return (
    <div className="rounded-lg border border-[#222] bg-[#111] text-xs overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        <Search className="h-3 w-3 text-[#FF4433] shrink-0" />
        <span className="text-[#888]">{displayName}</span>
        {project && (
          <span className="text-[10px] text-[#FF4433] font-medium">
            {project.name}
          </span>
        )}
        <span className="flex-1" />
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-[#555]" />
        ) : (
          <ChevronRight className="h-3 w-3 text-[#555]" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-[#222] px-3 py-2 bg-black">
          <pre className="font-mono text-[#888] whitespace-pre-wrap">
            {JSON.stringify(toolCall.arguments, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
