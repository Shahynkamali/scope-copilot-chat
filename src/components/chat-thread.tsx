"use client";

import { useRef, useEffect } from "react";
import { User, Bot } from "lucide-react";
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
          <div key={msg.id} className="flex gap-3">
            <div
              className={`mt-1 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <Bot className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {msg.role === "user" ? "You" : "Copilot"}
              </p>

              {/* Tool calls */}
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
                <div className="space-y-2 pt-1">
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
          <div className="flex gap-3">
            <div className="mt-1 h-7 w-7 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-pink-500 text-white">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Copilot
              </p>
              <div className="flex gap-1.5 py-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
