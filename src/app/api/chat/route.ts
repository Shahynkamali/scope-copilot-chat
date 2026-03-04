import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/copilot-client";
import { ChatRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, selectedProjectIds, conversationHistory } = body;

    // Build project mappings from env
    const projects = [1, 2, 3]
      .map((i) => ({
        id: process.env[`SCOPE_PROJECT_${i}_ID`] || `project-${i}`,
        name: process.env[`SCOPE_PROJECT_${i}_NAME`] || `repo-${i}`,
      }))
      .filter((p) => selectedProjectIds.includes(p.id));

    const result = await chat(
      [
        ...conversationHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: message },
      ],
      projects
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message: "Failed to get response. Check your API keys and try again.",
        toolCalls: [],
        sources: [],
      },
      { status: 500 }
    );
  }
}
