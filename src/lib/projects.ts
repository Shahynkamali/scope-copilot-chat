import { Project } from "./types";

export function getProjects(): Project[] {
  return [1, 2, 3].map((i) => ({
    id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
    name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
    color: "#FF4433",
    description: "",
    projectType: "",
    techStack: [],
    entityCount: 0,
    entityNames: [],
    serviceCount: 0,
    status: "synced" as const,
  }));
}
