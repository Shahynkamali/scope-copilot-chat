"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Database,
  RefreshCw,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ArrowRight,
  Code,
  Boxes,
} from "lucide-react";
import { GenerateFeatureDialog } from "@/components/generate-feature-dialog";
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
      .catch(() => setLoaded(true));
  }, []);

  const handleSync = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSyncing((s) => ({ ...s, [id]: true }));
    setTimeout(() => setSyncing((s) => ({ ...s, [id]: false })), 2000);
  };

  const totalEntities = projects.reduce((s, p) => s + p.entityCount, 0);
  const totalServices = projects.reduce((s, p) => s + p.serviceCount, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#222] sticky top-0 z-10 bg-black/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-[#888]">[</span>
            <span className="text-[#FF4433]">+</span>
            <span className="text-white">bimm</span>
            <span className="text-[#888]">]</span>
          </span>
          <span className="text-[#888] text-sm ml-3">/ BimmGater</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-[#888] mt-2">
            Select a project to start chatting about its codebase.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: GitBranch, value: projects.length, label: "Repositories" },
            { icon: Database, value: totalEntities, label: "Entities" },
            { icon: Boxes, value: totalServices, label: "Services" },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((project, idx) => {
            const isSyncing = syncing[project.id];
            return (
              <Link
                key={project.id}
                href={`/chat/${project.id}`}
                className={`group bg-[#111] border border-[#222] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4433]/50 flex flex-col ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <div className="h-0.5 bg-[#FF4433]" />

                <div className="p-5 flex flex-col flex-1">
                  {/* Name + status */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF4433]" />
                      {project.name}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                      {isSyncing ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-[#FF4433]" />
                      ) : (
                        <CheckCircle2 className="h-2.5 w-2.5 text-[#FF4433]" />
                      )}
                      {isSyncing ? "Syncing" : "Synced"}
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs text-[#888] leading-relaxed mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Tech stack + type */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.projectType && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF4433]/10 text-[#FF4433] font-medium">
                        {project.projectType}
                      </span>
                    )}
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white font-medium flex items-center gap-1"
                      >
                        <Code className="h-2.5 w-2.5" />
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-[#888] mb-4">
                    <span className="flex items-center gap-1.5">
                      <Database className="h-3 w-3" />
                      <span className="font-medium text-white">{project.entityCount}</span> entities
                    </span>
                    {project.serviceCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Boxes className="h-3 w-3" />
                        <span className="font-medium text-white">{project.serviceCount}</span> services
                      </span>
                    )}
                  </div>

                  {/* Entity pills */}
                  {project.entityNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.entityNames.slice(0, 5).map((name) => (
                        <span
                          key={name}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#888] font-mono"
                        >
                          {name}
                        </span>
                      ))}
                      {project.entityNames.length > 5 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#555] font-mono">
                          +{project.entityNames.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <div className="flex-1 flex items-center justify-center gap-2 bg-[#FF4433] group-hover:bg-[#e63d2e] text-white rounded-lg py-2 text-sm font-medium transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                    <div onClick={(e) => e.preventDefault()}>
                      <GenerateFeatureDialog projectId={project.id} projectName={project.name} />
                    </div>
                    <button
                      className="flex items-center justify-center border border-[#222] hover:border-[#FF4433]/40 hover:text-[#FF4433] text-[#888] rounded-lg p-2 transition-colors disabled:opacity-50"
                      disabled={isSyncing}
                      onClick={(e) => handleSync(e, project.id)}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
