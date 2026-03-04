import { NextResponse } from "next/server";
import { getProjectSummary } from "@/lib/scope-client";

export async function GET() {
  const projects = [1, 2, 3].map((i) => ({
    id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
    name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
    color: "#FF4433",
    description: "",
    projectType: "",
    techStack: [] as string[],
    entityCount: 0,
    entityNames: [] as string[],
    serviceCount: 0,
    status: "synced" as const,
  }));

  await Promise.all(
    projects.map(async (project) => {
      try {
        const summary = await getProjectSummary(project.id);
        if (summary?.data) {
          const d = summary.data;
          project.description = d.problem_statement || "";
          project.projectType = d.project_type || "";
          project.techStack = (d.tech_stack || [])
            .filter((t) => t.choice !== "None" && t.choice !== "custom")
            .map((t) => t.choice);
          project.entityCount = d.entities?.length ?? 0;
          project.entityNames = (d.entities || []).map((e) => e.name);
          project.serviceCount = d.services?.length ?? 0;
        }
      } catch {
        // Keep defaults
      }
    })
  );

  return NextResponse.json(projects);
}
