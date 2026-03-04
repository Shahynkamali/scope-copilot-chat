"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { SourceReference } from "@/lib/types";

interface SourceCardProps {
  source: SourceReference;
}

export function SourceCard({ source }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-[#222] overflow-hidden bg-[#111]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-[#555] shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-[#555] shrink-0" />
        )}
        <FileCode className="h-3.5 w-3.5 text-[#FF4433] shrink-0" />
        <span className="text-xs font-mono text-white truncate flex-1">
          {source.filePath}
        </span>
        <span className="text-[10px] text-[#FF4433] font-medium shrink-0">
          {source.projectName}
        </span>
      </button>
      {expanded && source.snippet && (
        <div className="border-t border-[#222] bg-black p-3">
          <pre className="text-xs font-mono text-[#888] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {source.snippet}
          </pre>
        </div>
      )}
    </div>
  );
}
