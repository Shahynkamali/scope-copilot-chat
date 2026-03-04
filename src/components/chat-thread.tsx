"use client";

import { useRef, useEffect } from "react";
import { User, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolCallBlock } from "./tool-call-block";
import { SourceCard } from "./source-card";
import { ChatMessage, Project } from "@/lib/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  projects: Project[];
  isLoading: boolean;
}

function getProjectColor(projectId: string, projects: Project[]): string {
  return projects.find((p) => p.id === projectId)?.color || "#6b7280";
}

export function ChatThread({ messages, projects, isLoading }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div
              className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-[#FF4433] text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {msg.role === "user" ? "You" : "Scope AI"}
              </p>

              {/* Tool calls — show what was searched */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-1">
                  {msg.toolCalls.map((tc) => (
                    <ToolCallBlock
                      key={tc.id}
                      toolCall={tc}
                      projects={projects}
                    />
                  ))}
                </div>
              )}

              {/* Message content */}
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {/* Source cards */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sources
                  </p>
                  {msg.sources.map((src, i) => (
                    <SourceCard
                      key={i}
                      source={src}
                      color={getProjectColor(src.projectId, projects)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-[#FF4433] text-white">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Scope AI
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#FF4433] animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#FF4433]/70 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-[#FF4433]/40 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-muted-foreground">
                  Searching across repos...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
