// Scope REST API client — https://api.within-scope.com

const SCOPE_API_URL =
  process.env.SCOPE_API_URL || "https://api.within-scope.com";
const SCOPE_API_KEY = process.env.SCOPE_API_KEY || "";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SCOPE_API_KEY}`,
  };
}

// ---------- Types ----------

export interface ScopeSearchResult {
  type: "entity" | "endpoint" | "pattern" | "convention" | string;
  name: string;
  description?: string;
  filePath?: string;
  snippet?: string;
  score: number;
  language?: string;
}

export interface ScopeSearchResponse {
  results: ScopeSearchResult[];
}

export interface ScopeProjectSummary {
  entityCount: number;
  endpointCount: number;
  techStack?: string[];
  conventions?: string[];
  summary?: string;
}

export interface ScopeAskResponse {
  answer: string;
  sources?: { filePath: string; snippet: string }[];
  conversationId?: string;
}

// ---------- Endpoints ----------

/** Semantic search over a project's codebase context */
export async function searchProject(
  projectId: string,
  query: string
): Promise<ScopeSearchResponse> {
  const res = await fetch(
    `${SCOPE_API_URL}/api/projects/${projectId}/context/search`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    console.error(`Scope search failed for ${projectId}:`, res.status);
    return { results: [] };
  }

  return res.json();
}

/** Get structured summary of everything Scope knows about a project */
export async function getProjectSummary(
  projectId: string
): Promise<ScopeProjectSummary> {
  const res = await fetch(
    `${SCOPE_API_URL}/api/projects/${projectId}/context/summary`,
    { headers: headers() }
  );

  if (!res.ok) {
    console.error(`Scope summary failed for ${projectId}:`, res.status);
    return { entityCount: 0, endpointCount: 0 };
  }

  return res.json();
}

/** Ask a question grounded in a single project's code */
export async function askProject(
  projectId: string,
  question: string,
  conversationId?: string
): Promise<ScopeAskResponse> {
  const res = await fetch(
    `${SCOPE_API_URL}/api/projects/${projectId}/ask`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ question, conversation_id: conversationId }),
    }
  );

  if (!res.ok) {
    console.error(`Scope ask failed for ${projectId}:`, res.status);
    return { answer: "" };
  }

  return res.json();
}

// ---------- Cross-project search ----------

export interface TaggedSearchResult extends ScopeSearchResult {
  projectId: string;
  projectName: string;
}

/** Fan out a search query to multiple projects in parallel, tag results */
export async function searchAcrossProjects(
  projects: { id: string; name: string }[],
  query: string
): Promise<TaggedSearchResult[]> {
  const results = await Promise.all(
    projects.map(async (project) => {
      const response = await searchProject(project.id, query);
      return response.results.map((r) => ({
        ...r,
        projectId: project.id,
        projectName: project.name,
      }));
    })
  );

  // Flatten and sort by score descending
  return results.flat().sort((a, b) => b.score - a.score);
}
