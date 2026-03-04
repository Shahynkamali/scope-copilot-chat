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
  Zap,
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        setLoaded(true);
      })
      .catch(() => {
        setProjects([
          { id: "project-1", name: "payments-service", color: "#FF4433", entityCount: 12, endpointCount: 8, status: "synced" },
          { id: "project-2", name: "order-platform", color: "#4D74FB", entityCount: 18, endpointCount: 14, status: "synced" },
          { id: "project-3", name: "storefront-web", color: "#6ECA09", entityCount: 9, endpointCount: 6, status: "synced" },
          { id: "project-4", name: "notification-hub", color: "#7639e2", entityCount: 7, endpointCount: 5, status: "synced" },
        ]);
        setLoaded(true);
      });
  }, []);

  const handleSync = (id: string) => {
    setSyncing((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      setSyncing((s) => ({ ...s, [id]: false }));
    }, 2000);
  };

  const totalEntities = projects.reduce((s, p) => s + p.entityCount, 0);
  const totalEndpoints = projects.reduce((s, p) => s + p.endpointCount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#FF4433] flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Scope</h1>
              <p className="text-xs text-muted-foreground">
                Cross-repo intelligence
              </p>
            </div>
          </div>
          <Link href="/chat">
            <Button className="bg-[#FF4433] hover:bg-[#e63d2e] text-white shadow-lg shadow-[#FF4433]/20 transition-all hover:shadow-[#FF4433]/30">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Connected Projects</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {projects.length} repos connected to Scope. Ask questions across all of them.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/60">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#FF4433]/10 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-[#FF4433]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Repositories</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#4D74FB]/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-[#4D74FB]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEntities}</p>
                <p className="text-xs text-muted-foreground">Entities</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#6ECA09]/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-[#6ECA09]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEndpoints}</p>
                <p className="text-xs text-muted-foreground">Endpoints</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, idx) => {
            const StatusIcon = STATUS_ICON[project.status];
            const isSyncing = syncing[project.id];

            return (
              <Card
                key={project.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                  borderColor: `${project.color}20`,
                }}
              >
                <div
                  className="h-1"
                  style={{ backgroundColor: project.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: project.color,
                          boxShadow: `0 0 0 2px var(--card), 0 0 0 4px ${project.color}40`,
                        }}
                      />
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <StatusIcon className="h-3 w-3 mr-1 text-[#6ECA09]" />
                      )}
                      {isSyncing ? "Syncing" : project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{project.entityCount}</span> entities
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="font-medium text-foreground">{project.endpointCount}</span> endpoints
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full hover:border-[#FF4433]/30 hover:text-[#FF4433] transition-colors"
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
