import { Project } from "./types";

// Bimm brand colors
const COLORS = ["#FF4433", "#4D74FB", "#6ECA09", "#7639e2"];

export function getProjects(): Project[] {
  return [1, 2, 3, 4].map((i, idx) => ({
    id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
    name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
    color: COLORS[idx],
    entityCount: 0,
    endpointCount: 0,
    status: "synced" as const,
  }));
}

export const PROJECT_COLORS: Record<string, string> = {};
getProjects().forEach((p) => {
  PROJECT_COLORS[p.id] = p.color;
});
