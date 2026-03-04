import { NextResponse } from "next/server";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export async function GET() {
  const projects = [1, 2, 3, 4].map((i, idx) => ({
    id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
    name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
    color: COLORS[idx],
    entityCount: 0,
    endpointCount: 0,
    status: "synced",
  }));

  // Try to fetch real counts from Scope API if configured
  const scopeUrl = process.env.SCOPE_API_URL;
  const scopeKey = process.env.SCOPE_API_KEY;

  if (scopeUrl && scopeKey) {
    for (const project of projects) {
      try {
        const res = await fetch(`${scopeUrl}/projects/${project.id}/stats`, {
          headers: { Authorization: `Bearer ${scopeKey}` },
        });
        if (res.ok) {
          const stats = await res.json();
          project.entityCount = stats.entityCount ?? 0;
          project.endpointCount = stats.endpointCount ?? 0;
        }
      } catch {
        // Keep defaults
      }
    }
  }

  return NextResponse.json(projects);
}
