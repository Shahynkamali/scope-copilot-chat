import OpenAI from "openai";
import { scopeMcpTools } from "./scope-tools";
import { ToolCall, SourceReference } from "./types";

// GitHub Copilot API is OpenAI-compatible
const client = new OpenAI({
  apiKey: process.env.GITHUB_TOKEN,
  baseURL: "https://models.inference.ai.azure.com",
});

const SCOPE_API_URL = process.env.SCOPE_API_URL || "https://app.scope.ink/api";
const SCOPE_API_KEY = process.env.SCOPE_API_KEY || "";

interface ProjectMapping {
  id: string;
  name: string;
}

function buildSystemPrompt(projects: ProjectMapping[]): string {
  const projectList = projects
    .map((p) => `- Project ID: "${p.id}" → Repo: "${p.name}"`)
    .join("\n");

  return `You are a cross-repository code assistant. You have access to ${projects.length} codebases via Scope MCP tools.

Available projects:
${projectList}

When answering questions:
1. Use scope_search to find relevant code across projects
2. Use scope_get_context for high-level understanding
3. Use scope_analyze for dependency and data flow questions
4. Always cite which project/file your information comes from
5. When referencing code, include the file path and project name

Be concise and technical. Reference specific files and line numbers when possible.`;
}

async function callScopeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  try {
    const endpoint = name.replace("scope_", "");
    const res = await fetch(`${SCOPE_API_URL}/mcp/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SCOPE_API_KEY}`,
      },
      body: JSON.stringify(args),
    });

    if (!res.ok) {
      return JSON.stringify({
        error: `Scope API returned ${res.status}`,
        message: await res.text(),
      });
    }

    return await res.text();
  } catch (error) {
    return JSON.stringify({
      error: "Failed to call Scope tool",
      details: String(error),
    });
  }
}

function extractSources(toolResults: { name: string; result: string; args: Record<string, unknown> }[], projects: ProjectMapping[]): SourceReference[] {
  const sources: SourceReference[] = [];

  for (const tr of toolResults) {
    try {
      const data = JSON.parse(tr.result);
      const projectId = tr.args.project_id as string;
      const project = projects.find((p) => p.id === projectId);

      if (Array.isArray(data?.results)) {
        for (const r of data.results.slice(0, 5)) {
          if (r.file_path || r.path) {
            sources.push({
              filePath: r.file_path || r.path,
              snippet: r.snippet || r.content || "",
              projectId,
              projectName: project?.name || projectId,
              language: r.language,
            });
          }
        }
      }
    } catch {
      // Not JSON or no results — skip
    }
  }

  return sources;
}

export async function chat(
  messages: { role: string; content: string }[],
  selectedProjects: ProjectMapping[]
): Promise<{
  message: string;
  toolCalls: ToolCall[];
  sources: SourceReference[];
}> {
  const systemPrompt = buildSystemPrompt(selectedProjects);
  const allToolCalls: ToolCall[] = [];
  const allToolResults: { name: string; result: string; args: Record<string, unknown> }[] = [];

  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Allow up to 5 rounds of tool calling
  for (let round = 0; round < 5; round++) {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      tools: scopeMcpTools,
      tool_choice: round === 0 ? "auto" : "auto",
    });

    const choice = response.choices[0];

    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      // No more tool calls — return the final message
      return {
        message: choice.message.content || "",
        toolCalls: allToolCalls,
        sources: extractSources(allToolResults, selectedProjects),
      };
    }

    // Process tool calls
    chatMessages.push(choice.message);

    for (const tc of choice.message.tool_calls) {
      if (tc.type !== "function") continue;
      const fn = tc.function;
      const args = JSON.parse(fn.arguments);
      const result = await callScopeTool(fn.name, args);

      allToolCalls.push({
        id: tc.id,
        name: fn.name,
        arguments: args,
        projectId: args.project_id,
      });

      allToolResults.push({ name: fn.name, result, args });

      chatMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }

  // If we exhausted rounds, return last content
  const lastResponse = await client.chat.completions.create({
    model: "gpt-4o",
    messages: chatMessages,
  });

  return {
    message: lastResponse.choices[0].message.content || "",
    toolCalls: allToolCalls,
    sources: extractSources(allToolResults, selectedProjects),
  };
}
