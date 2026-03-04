"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Database,
  Globe,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChatThread } from "@/components/chat-thread";
import { RepoSelector } from "@/components/repo-selector";
import { ChatMessage, Project } from "@/lib/types";

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I can help you explore and understand your connected codebases. Select the repos you want to query, then ask me anything — from architecture questions to cross-repo data flows.",
      timestamp: Date.now(),
    },
  ]);
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
          { id: "project-1", name: "payments-service", color: "#3b82f6", entityCount: 12, endpointCount: 8, status: "synced" },
          { id: "project-2", name: "order-platform", color: "#10b981", entityCount: 18, endpointCount: 14, status: "synced" },
          { id: "project-3", name: "storefront-web", color: "#f59e0b", entityCount: 9, endpointCount: 6, status: "synced" },
          { id: "project-4", name: "notification-hub", color: "#ef4444", entityCount: 7, endpointCount: 5, status: "synced" },
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

  const handleSend = async () => {
    const trimmed = input.trim();
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
        .filter((m) => m.id !== "welcome")
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
          content: "Something went wrong. Please check your API keys and try again.",
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
      handleSend();
    }
  };

  const selectedProjects = projects.filter((p) => selectedIds.includes(p.id));
  const totalEntities = selectedProjects.reduce((s, p) => s + p.entityCount, 0);
  const totalEndpoints = selectedProjects.reduce((s, p) => s + p.endpointCount, 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-semibold">Cross-Repo Chat</h1>
            <p className="text-xs text-muted-foreground">
              {selectedIds.length} of {projects.length} repos active
            </p>
          </div>
        </header>

        {/* Messages */}
        <ChatThread
          messages={messages}
          projects={projects}
          isLoading={isLoading}
        />

        {/* Input */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
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
              className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || selectedIds.length === 0}
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-l border-border bg-card/30 p-4 hidden md:flex flex-col gap-6">
        <RepoSelector
          projects={projects}
          selected={selectedIds}
          onToggle={toggleProject}
        />

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Context
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              {totalEntities} entities
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              {totalEndpoints} endpoints
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" />
              {selectedIds.length} repos
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
