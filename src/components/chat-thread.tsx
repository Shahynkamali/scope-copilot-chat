"use client";

import { useRef, useEffect } from "react";
import { User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolCallBlock } from "./tool-call-block";
import { SourceCard } from "./source-card";
import { ChatMessage, Project } from "@/lib/types";

interface ChatThreadProps {
  messages: ChatMessage[];
  projects: Project[];
  isLoading: boolean;
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
              className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-[#FF4433] text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5" />
              ) : (
                <span className="text-xs font-bold">+</span>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest">
                {msg.role === "user" ? "You" : "BimmGater"}
              </p>

              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-1">
                  {msg.toolCalls.map((tc) => (
                    <ToolCallBlock key={tc.id} toolCall={tc} projects={projects} />
                  ))}
                </div>
              )}

              <div className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest">
                    Sources
                  </p>
                  {msg.sources.map((src, i) => (
                    <SourceCard key={i} source={src} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-[#FF4433] text-white">
              <span className="text-xs font-bold">+</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-[#888] uppercase tracking-widest mb-3">
                BimmGater
              </p>
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433] animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433]/60 animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4433]/30 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-[#888]">
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
