"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Database,
  Globe,
  RefreshCw,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/types";

const STATUS_ICON = {
  synced: CheckCircle2,
  syncing: Loader2,
  error: RefreshCw,
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(() => {
        // Fallback demo data
        setProjects([
          { id: "project-1", name: "payments-service", color: "#3b82f6", entityCount: 12, endpointCount: 8, status: "synced" },
          { id: "project-2", name: "order-platform", color: "#10b981", entityCount: 18, endpointCount: 14, status: "synced" },
          { id: "project-3", name: "storefront-web", color: "#f59e0b", entityCount: 9, endpointCount: 6, status: "synced" },
          { id: "project-4", name: "notification-hub", color: "#ef4444", entityCount: 7, endpointCount: 5, status: "synced" },
        ]);
      });
  }, []);

  const handleSync = (id: string) => {
    setSyncing((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      setSyncing((s) => ({ ...s, [id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Scope x Copilot</h1>
              <p className="text-xs text-muted-foreground">
                Cross-repo intelligence
              </p>
            </div>
          </div>
          <Link href="/chat">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </div>
      </header>

      {/* Project Grid */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Connected Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} repos connected to Scope. Chat across all of them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => {
            const StatusIcon = STATUS_ICON[project.status];
            const isSyncing = syncing[project.id];

            return (
              <Card key={project.id} className="overflow-hidden">
                <div
                  className="h-1"
                  style={{ backgroundColor: project.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant={
                        project.status === "synced" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <StatusIcon className="h-3 w-3 mr-1" />
                      )}
                      {isSyncing ? "Syncing" : project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5" />
                      {project.entityCount} entities
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {project.endpointCount} endpoints
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isSyncing}
                    onClick={() => handleSync(project.id)}
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    )}
                    {isSyncing ? "Syncing..." : "Sync"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
