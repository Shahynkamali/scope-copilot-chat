import { NextRequest, NextResponse } from "next/server";

const SCOPE_API_URL = process.env.SCOPE_API_URL || "https://api.within-scope.com";
const SCOPE_API_KEY = process.env.SCOPE_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { projectId, description } = await req.json();

    const res = await fetch(
      `${SCOPE_API_URL}/api/projects/${projectId}/generate-feature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SCOPE_API_KEY}`,
        },
        body: JSON.stringify({ description }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Scope generate-feature error:", res.status, text);
      return NextResponse.json(
        { error: `Scope API returned ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generate feature error:", error);
    return NextResponse.json(
      { error: "Failed to generate feature" },
      { status: 500 }
    );
  }
}
