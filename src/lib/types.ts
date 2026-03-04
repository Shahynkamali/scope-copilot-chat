export interface Project {
  id: string;
  name: string;
  color: string;
  entityCount: number;
  endpointCount: number;
  status: "synced" | "syncing" | "error";
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  projectId?: string;
}

export interface SourceReference {
  filePath: string;
  snippet: string;
  projectId: string;
  projectName: string;
  language?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  sources?: SourceReference[];
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  selectedProjectIds: string[];
  conversationHistory: { role: string; content: string }[];
}

export interface ChatResponse {
  message: string;
  toolCalls: ToolCall[];
  sources: SourceReference[];
}
