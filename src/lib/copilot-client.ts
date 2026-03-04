import OpenAI from "openai";
import { searchAcrossProjects, TaggedSearchResult } from "./scope-client";
import { ToolCall, SourceReference } from "./types";

// GitHub Copilot API is OpenAI-compatible via GitHub Models
const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com",
});

interface ProjectMapping {
  id: string;
  name: string;
  color?: string;
}

/** Build the system prompt with project context injected */
function buildSystemPrompt(
  projects: ProjectMapping[],
  contextResults: TaggedSearchResult[]
): string {
  const projectList = projects
    .map((p) => `- "${p.name}" (ID: ${p.id})`)
    .join("\n");

  // Format search results grouped by project
  const contextByProject = new Map<string, TaggedSearchResult[]>();
  for (const r of contextResults) {
    const existing = contextByProject.get(r.projectName) || [];
    existing.push(r);
    contextByProject.set(r.projectName, existing);
  }

  let contextBlock = "";
  for (const [projectName, results] of contextByProject) {
    contextBlock += `\n### [${projectName}]\n`;
    for (const r of results.slice(0, 8)) {
      contextBlock += `- **${r.type}**: ${r.name}`;
      if (r.description) contextBlock += ` — ${r.description}`;
      if (r.filePath) contextBlock += ` (${r.filePath})`;
      contextBlock += "\n";
      if (r.snippet) {
        contextBlock += `  \`\`\`\n  ${r.snippet.slice(0, 500)}\n  \`\`\`\n`;
      }
    }
  }

  return `You are a cross-repository code assistant. You answer questions about codebases using real context from Scope.

## Available Projects
${projectList}

## Codebase Context
The following context was retrieved from Scope's semantic search across the selected repositories. Use this to ground your answers in real code.
${contextBlock || "\n(No relevant context found — answer based on general knowledge and note that no specific code references were found.)"}

## Instructions
1. Always cite which project and file your information comes from using [project-name] tags
2. When referencing code, include the file path
3. If the context doesn't contain enough information to fully answer, say so
4. Be concise and technical
5. When comparing across repos, clearly label which repo each piece comes from`;
}

/** Convert search results to source references for the frontend */
function toSourceReferences(results: TaggedSearchResult[]): SourceReference[] {
  return results
    .filter((r) => r.filePath)
    .slice(0, 10)
    .map((r) => ({
      filePath: r.filePath!,
      snippet: r.snippet || "",
      projectId: r.projectId,
      projectName: r.projectName,
      language: r.language,
    }));
}

export async function chat(
  messages: { role: string; content: string }[],
  selectedProjects: ProjectMapping[]
): Promise<{
  message: string;
  toolCalls: ToolCall[];
  sources: SourceReference[];
}> {
  const userMessage = messages[messages.length - 1]?.content || "";

  // Step 1: Fan out search to all selected Scope projects
  const searchResults = await searchAcrossProjects(
    selectedProjects,
    userMessage
  );

  // Step 2: Build system prompt with injected context
  const systemPrompt = buildSystemPrompt(selectedProjects, searchResults);

  // Step 3: Call GitHub Copilot API (via GitHub Models)
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: chatMessages,
    temperature: 0.3,
  });

  const answer = response.choices[0]?.message?.content || "";

  // Build tool call records for the frontend to display what searches were made
  const toolCalls: ToolCall[] = selectedProjects.map((p) => ({
    id: `search-${p.id}`,
    name: "scope_search",
    arguments: { project_id: p.id, query: userMessage },
    projectId: p.id,
  }));

  return {
    message: answer,
    toolCalls,
    sources: toSourceReferences(searchResults),
  };
}
