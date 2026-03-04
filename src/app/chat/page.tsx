"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Database,
  Globe,
  Layers,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChatThread } from "@/components/chat-thread";
import { RepoSelector } from "@/components/repo-selector";
import { ChatMessage, Project } from "@/lib/types";

const EXAMPLE_QUERIES = [
  "How does the payment flow work across services?",
  "What entities are shared between repos?",
  "Show me the API endpoints for order management",
  "How are notifications triggered from payments?",
];

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: Project[]) => {
        setProjects(data);
        setSelectedIds(data.map((p) => p.id));
      })
      .catch(() => {
        const fallback: Project[] = [
          { id: "project-1", name: "payments-service", color: "#FF4433", entityCount: 12, endpointCount: 8, status: "synced" },
          { id: "project-2", name: "order-platform", color: "#4D74FB", entityCount: 18, endpointCount: 14, status: "synced" },
          { id: "project-3", name: "storefront-web", color: "#6ECA09", entityCount: 9, endpointCount: 6, status: "synced" },
          { id: "project-4", name: "notification-hub", color: "#7639e2", entityCount: 7, endpointCount: 5, status: "synced" },
        ];
        setProjects(fallback);
        setSelectedIds(fallback.map((p) => p.id));
      });
  }, []);

  const toggleProject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading || selectedIds.length === 0) return;

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
      const conversationHistory = messages
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          selectedProjectIds: selectedIds,
          conversationHistory,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        toolCalls: data.toolCalls,
        sources: data.sources,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Something went wrong. Please check your API configuration and try again.",
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

  const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));
  const totalEntities = selectedProjects.reduce((s, p) => s + p.entityCount, 0);
  const totalEndpoints = selectedProjects.reduce((s, p) => s + p.endpointCount, 0);
  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-[#FF4433]">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-7 w-7 rounded-md bg-[#FF4433] flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Cross-Repo Chat</h1>
            <p className="text-xs text-muted-foreground">
              {selectedIds.length} of {projects.length} repos active
            </p>
          </div>
        </header>

        {/* Empty state or messages */}
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF4433] to-[#FF4433]/60 flex items-center justify-center mb-6 shadow-lg shadow-[#FF4433]/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask about your codebases</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
              Ask questions that span across your connected repositories.
              Scope provides real code context to ground every answer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {EXAMPLE_QUERIES.map((query) => (
                <button
                  key={query}
                  onClick={() => sendMessage(query)}
                  disabled={isLoading || selectedIds.length === 0}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-accent hover:border-[#FF4433]/20 transition-all text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatThread
            messages={messages}
            projects={projects}
            isLoading={isLoading}
          />
        )}

        {/* Input */}
        <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedIds.length === 0
                  ? "Select at least one repo to start chatting..."
                  : "Ask about your codebase..."
              }
              disabled={isLoading || selectedIds.length === 0}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FF4433]/40 focus:border-[#FF4433]/40 disabled:opacity-50 transition-all"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim() || selectedIds.length === 0}
              size="icon"
              className="h-10 w-10 shrink-0 bg-[#FF4433] hover:bg-[#e63d2e] text-white shadow-md shadow-[#FF4433]/20 disabled:shadow-none transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-card/30 backdrop-blur-sm p-5 hidden md:flex flex-col gap-6">
        <RepoSelector
          projects={projects}
          selected={selectedIds}
          onToggle={toggleProject}
        />

        <Separator />

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Context
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-3.5 w-3.5" />
                Entities
              </div>
              <span className="font-semibold text-foreground">{totalEntities}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Endpoints
              </div>
              <span className="font-semibold text-foreground">{totalEndpoints}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                Repos
              </div>
              <span className="font-semibold text-foreground">{selectedIds.length}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="mt-auto text-xs text-muted-foreground/60 text-center">
          Powered by Scope + GitHub Copilot
        </div>
      </aside>
    </div>
  );
}
