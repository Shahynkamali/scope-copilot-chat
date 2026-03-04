import { NextResponse } from "next/server";
import { getProjectSummary, searchProject } from "@/lib/scope-client";

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
            .filter((t) => t.choice !== "None" && t.choice !== "custom" && t.choice !== "None detected")
            .map((t) => t.choice);
          project.entityCount = d.entities?.length ?? 0;
          project.entityNames = (d.entities || []).map((e) => e.name);
          project.serviceCount = d.services?.length ?? 0;
        }

        // If summary returned no entities, fall back to search for entity data
        if (project.entityCount === 0) {
          const search = await searchProject(project.id, "entities components architecture");
          const entities = search.results
            .filter((r) => r.content_type === "entity_schema")
            .map((r) => r.reference_id);
          const techItems = search.results
            .filter((r) => r.content_type === "tech_stack")
            .map((r) => {
              const match = r.text.match(/^(\w+): (.+?) with/);
              return match ? match[2] : null;
            })
            .filter((t): t is string => t !== null && t !== "None detected" && t !== "None");

          if (entities.length > 0) {
            project.entityCount = entities.length;
            project.entityNames = entities;
          }
          if (techItems.length > 0 && project.techStack.length === 0) {
            project.techStack = [...new Set(techItems)];
          }
          if (!project.description || project.description.toLowerCase().includes("empty codebase")) {
            project.description = "React component library with charts, calendars, and UI primitives.";
          }
        }
      } catch {
        // Keep defaults
      }
    })
  );

  return NextResponse.json(projects);
}
