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

// ---------- Types (matching actual API responses) ----------

export interface ScopeSearchResult {
  id: string;
  score: number;
  content_type: string;
  reference_id: string;
  text: string;
  token_count: number;
}

export interface ScopeSearchResponse {
  results: ScopeSearchResult[];
  total_tokens: number;
}

export interface ScopeSummaryData {
  problem_statement?: string;
  target_audience?: string;
  project_type?: string;
  tech_stack?: { category: string; choice: string; reasoning: string }[];
  entities?: { name: string; description?: string }[];
  business_rules?: string[];
  patterns?: string[];
  conventions?: string[];
  services?: string[];
}

export interface ScopeSummaryResponse {
  markdown: string;
  data: ScopeSummaryData;
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
    return { results: [], total_tokens: 0 };
  }

  return res.json();
}

/** Get structured summary of everything Scope knows about a project */
export async function getProjectSummary(
  projectId: string
): Promise<ScopeSummaryResponse | null> {
  const res = await fetch(
    `${SCOPE_API_URL}/api/projects/${projectId}/context/summary`,
    { headers: headers() }
  );

  if (!res.ok) {
    console.error(`Scope summary failed for ${projectId}:`, res.status);
    return null;
  }

  return res.json();
}

// ---------- Cross-project helpers ----------

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

  return results.flat().sort((a, b) => b.score - a.score);
}

/** Get summaries for multiple projects */
export async function getSummaries(
  projects: { id: string; name: string }[]
): Promise<Map<string, ScopeSummaryResponse>> {
  const map = new Map<string, ScopeSummaryResponse>();

  await Promise.all(
    projects.map(async (p) => {
      const summary = await getProjectSummary(p.id);
      if (summary) map.set(p.id, summary);
    })
  );

  return map;
}
