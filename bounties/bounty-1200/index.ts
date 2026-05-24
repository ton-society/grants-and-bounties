import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { runTolkCompiler, getTolkCompilerVersion } from "@ton/tolk-js";

/**
 * MCP server for Tolk compiler.
 * Exposes getTolkCompilerVersion and runTolkCompiler as tools.
 */

const server = new Server(
  {
    name: "tolk-compiler",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_tolk_version",
        description: "Get the current version of the Tolk compiler.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "compile_tolk",
        description: "Compile Tolk source code to Fift.",
        inputSchema: {
          type: "object",
          properties: {
            entrypointFileName: {
              type: "string",
              description: "The name of the main Tolk file to compile.",
            },
            sources: {
              type: "object",
              additionalProperties: { type: "string" },
              description: "A map of filename to content for all Tolk files.",
            },
            optimizationLevel: {
              type: "number",
              description: "Optimization level (default 2).",
            },
          },
          required: ["entrypointFileName", "sources"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_tolk_version") {
      const version = await getTolkCompilerVersion();
      return {
        content: [
          {
            type: "text",
            text: `Tolk compiler version: ${version}`,
          },
        ],
      };
    }

    if (name === "compile_tolk") {
      const { entrypointFileName, sources, optimizationLevel = 2 } = args as any;

      const result = await runTolkCompiler({
        entrypointFileName,
        fsReadCallback: (path: string) => {
          if (sources[path]) return sources[path];
          throw new Error(`File not found: ${path}`);
        },
        optimizationLevel,
      });

      if (result.status === "error") {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: result.message,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: error.message || String(error),
        },
      ],
    };
  }
});

/**
 * Start the server using stdio transport.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tolk MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
