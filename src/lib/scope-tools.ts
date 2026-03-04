// Scope MCP tool definitions for the GitHub Copilot API
// These are the tools Copilot can call to query Scope projects

export const scopeMcpTools = [
  {
    type: "function" as const,
    function: {
      name: "scope_get_context",
      description:
        "Get full codebase context for a Scope project including entities, endpoints, and architecture overview.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID to query",
          },
          query: {
            type: "string",
            description: "Optional natural language query to focus the context",
          },
        },
        required: ["project_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scope_search",
      description:
        "Search across a Scope project's codebase for code, entities, endpoints, or patterns.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID to search",
          },
          query: {
            type: "string",
            description: "Search query",
          },
          type: {
            type: "string",
            enum: ["code", "entity", "endpoint", "all"],
            description: "Type of search to perform",
          },
        },
        required: ["project_id", "query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scope_analyze",
      description:
        "Analyze relationships, dependencies, or data flow within or across Scope projects.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID to analyze",
          },
          analysis_type: {
            type: "string",
            enum: ["dependencies", "data_flow", "relationships", "architecture"],
            description: "Type of analysis to perform",
          },
          entity: {
            type: "string",
            description: "Optional specific entity or endpoint to analyze",
          },
        },
        required: ["project_id", "analysis_type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scope_get_entities",
      description: "List all entities (models, classes, types) in a Scope project.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID",
          },
        },
        required: ["project_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scope_get_endpoints",
      description: "List all API endpoints in a Scope project.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID",
          },
        },
        required: ["project_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scope_get_file",
      description: "Get the contents of a specific file from a Scope project.",
      parameters: {
        type: "object",
        properties: {
          project_id: {
            type: "string",
            description: "The Scope project ID",
          },
          file_path: {
            type: "string",
            description: "Path to the file within the project",
          },
        },
        required: ["project_id", "file_path"],
      },
    },
  },
];
