import OpenAI from "openai";
import {
  searchAcrossProjects,
  getSummaries,
  TaggedSearchResult,
  ScopeSummaryResponse,
} from "./scope-client";
import { ToolCall, SourceReference } from "./types";

const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com",
});

interface ProjectMapping {
  id: string;
  name: string;
}

function buildSystemPrompt(
  projects: ProjectMapping[],
  summaries: Map<string, ScopeSummaryResponse>,
  searchResults: TaggedSearchResult[]
): string {
  // Build per-project context blocks
  let contextBlock = "";

  for (const project of projects) {
    contextBlock += `\n### [${project.name}]\n`;

    // Include summary if available
    const summary = summaries.get(project.id);
    if (summary?.data) {
      const d = summary.data;
      if (d.problem_statement) contextBlock += `**About:** ${d.problem_statement}\n`;
      if (d.project_type) contextBlock += `**Type:** ${d.project_type}\n`;
      if (d.tech_stack?.length) {
        contextBlock += `**Tech stack:** ${d.tech_stack.map((t) => `${t.category}: ${t.choice}`).join(", ")}\n`;
      }
      if (d.entities?.length) {
        contextBlock += `**Entities:** ${d.entities.map((e) => e.name).join(", ")}\n`;
      }
      if (d.business_rules?.length) {
        contextBlock += `**Conventions:**\n${d.business_rules.map((r) => `- ${r}`).join("\n")}\n`;
      }
    }

    // Include search results for this project
    const projectResults = searchResults.filter((r) => r.projectId === project.id);
    if (projectResults.length > 0) {
      contextBlock += `\n**Search results:**\n`;
      for (const r of projectResults) {
        contextBlock += `- [${r.content_type}] ${r.text}\n`;
      }
    }
  }

  return `You are BimmGater, a codebase assistant. You answer questions about codebases using real context from Scope.

## Available Projects
${projects.map((p) => `- "${p.name}" (ID: ${p.id})`).join("\n")}

## Codebase Context
${contextBlock || "\n(No context found.)"}

## Instructions
1. Answer based on the context provided above
2. Be concise and technical
3. If the context doesn't contain enough information, say what you do know and what's missing
4. Reference specific details from the context when possible`;
}

function toSourceReferences(
  results: TaggedSearchResult[]
): SourceReference[] {
  return results
    .slice(0, 10)
    .map((r) => ({
      filePath: r.reference_id || r.content_type,
      snippet: r.text,
      projectId: r.projectId,
      projectName: r.projectName,
      language: undefined,
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

  // Step 1: Fetch summaries + search in parallel
  const [searchResults, summaries] = await Promise.all([
    searchAcrossProjects(selectedProjects, userMessage),
    getSummaries(selectedProjects),
  ]);

  // Step 2: Build system prompt with real context
  const systemPrompt = buildSystemPrompt(
    selectedProjects,
    summaries,
    searchResults
  );

  // Step 3: Call GitHub Models API
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
