import { NextResponse } from "next/server";
import { getProjectSummary } from "@/lib/scope-client";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export async function GET() {
  const projects = [1, 2, 3, 4].map((i, idx) => ({
    id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
    name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
    color: COLORS[idx],
    entityCount: 0,
    endpointCount: 0,
    status: "synced" as const,
  }));

  // Fetch real counts from Scope API in parallel
  await Promise.all(
    projects.map(async (project) => {
      try {
        const summary = await getProjectSummary(project.id);
        project.entityCount = summary.entityCount ?? 0;
        project.endpointCount = summary.endpointCount ?? 0;
      } catch {
        // Keep defaults — Scope may not be configured yet
      }
    })
  );

  return NextResponse.json(projects);
}
