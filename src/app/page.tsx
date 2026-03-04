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
import { Project } from "@/lib/types";

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
          { id: "project-2", name: "order-platform", color: "#FF4433", entityCount: 18, endpointCount: 14, status: "synced" },
          { id: "project-3", name: "storefront-web", color: "#FF4433", entityCount: 9, endpointCount: 6, status: "synced" },
          { id: "project-4", name: "notification-hub", color: "#FF4433", entityCount: 7, endpointCount: 5, status: "synced" },
        ]);
        setLoaded(true);
      });
  }, []);

  const handleSync = (id: string) => {
    setSyncing((s) => ({ ...s, [id]: true }));
    setTimeout(() => setSyncing((s) => ({ ...s, [id]: false })), 2000);
  };

  const totalEntities = projects.reduce((s, p) => s + p.entityCount, 0);
  const totalEndpoints = projects.reduce((s, p) => s + p.endpointCount, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] sticky top-0 z-10 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[#888]">[</span>
              <span className="text-[#FF4433]">+</span>
              <span className="text-white">bimm</span>
              <span className="text-[#888]">]</span>
            </span>
            <span className="text-[#888] text-sm">/ BimmGater</span>
          </div>
          <Link href="/chat">
            <button className="flex items-center gap-2 bg-[#FF4433] hover:bg-[#e63d2e] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Connected Projects</h2>
          <p className="text-[#888] mt-2">
            {projects.length} repos connected to Scope. Chat across all of them.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: GitBranch, value: projects.length, label: "Repositories" },
            { icon: Database, value: totalEntities, label: "Entities" },
            { icon: Globe, value: totalEndpoints, label: "Endpoints" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#FF4433]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#FF4433]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-[#888]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, idx) => {
            const isSyncing = syncing[project.id];
            return (
              <div
                key={project.id}
                className={`bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4433]/30 ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Orange top accent */}
                <div className="h-0.5 bg-[#FF4433]" />

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF4433]" />
                      {project.name}
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs text-[#888] bg-[#1a1a1a] px-2.5 py-1 rounded-full">
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#FF4433]" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-[#FF4433]" />
                      )}
                      {isSyncing ? "Syncing" : "Synced"}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-[#888] mb-5">
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5" />
                      <span className="font-medium text-white">{project.entityCount}</span> entities
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      <span className="font-medium text-white">{project.endpointCount}</span> endpoints
                    </span>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 border border-[#222] hover:border-[#FF4433]/40 hover:text-[#FF4433] text-[#888] rounded-lg py-2 text-sm transition-colors disabled:opacity-50"
                    disabled={isSyncing}
                    onClick={() => handleSync(project.id)}
                  >
                    {isSyncing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {isSyncing ? "Syncing..." : "Sync"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
