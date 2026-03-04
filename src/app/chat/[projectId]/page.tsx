"use client";

import { useState, useEffect, KeyboardEvent, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Database,
  Boxes,
  Sparkles,
} from "lucide-react";
import { ChatThread } from "@/components/chat-thread";
import { ChatMessage, Project } from "@/lib/types";

const EXAMPLE_QUERIES = [
  "What does this project do?",
  "Show me the main entities",
  "How is the codebase structured?",
  "What tech stack is used?",
];

export default function ChatPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: Project[]) => {
        const found = data.find((p) => p.id === projectId);
        if (found) setProject(found);
      });
  }, [projectId]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading || !project) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          selectedProjectIds: [projectId],
          conversationHistory,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          toolCalls: data.toolCalls,
          sources: data.sources,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong. Check your API configuration and try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] bg-black/90 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] text-[#888] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <span className="text-sm font-bold tracking-tight">
          <span className="text-[#888]">[</span>
          <span className="text-[#FF4433]">+</span>
          <span className="text-white">bimm</span>
          <span className="text-[#888]">]</span>
        </span>
        <span className="text-[#333]">|</span>
        {project && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF4433]" />
            <span className="text-sm font-semibold">{project.name}</span>
            <div className="flex items-center gap-3 ml-3 text-xs text-[#888]">
              {project.techStack?.length > 0 && (
                <span className="text-[#FF4433]">{project.techStack.join(", ")}</span>
              )}
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {project.entityCount}
              </span>
              {project.serviceCount > 0 && (
                <span className="flex items-center gap-1">
                  <Boxes className="h-3 w-3" />
                  {project.serviceCount}
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Empty state or messages */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="h-16 w-16 rounded-2xl bg-[#FF4433] flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {project ? `Ask about ${project.name}` : "Loading..."}
          </h2>
          <p className="text-sm text-[#888] mb-8 text-center max-w-md">
            Ask questions about this codebase. Scope provides real code context to ground every answer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
            {EXAMPLE_QUERIES.map((query) => (
              <button
                key={query}
                onClick={() => sendMessage(query)}
                disabled={isLoading || !project}
                className="text-left text-sm px-4 py-3 rounded-xl border border-[#222] bg-[#111] hover:border-[#FF4433]/40 hover:text-white text-[#888] transition-all disabled:opacity-50"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ChatThread
          messages={messages}
          projects={project ? [project] : []}
          isLoading={isLoading}
        />
      )}

      {/* Input */}
      <div className="border-t border-[#222] bg-black/90 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={project ? `Ask about ${project.name}...` : "Loading..."}
            disabled={isLoading || !project}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[#222] bg-[#111] px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#FF4433]/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim() || !project}
            className="h-10 w-10 shrink-0 rounded-xl bg-[#FF4433] hover:bg-[#e63d2e] text-white flex items-center justify-center disabled:bg-[#1a1a1a] disabled:text-[#555] transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
