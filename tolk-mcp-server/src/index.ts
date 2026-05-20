#!/usr/bin/env node
/**
 * Tolk MCP Server - Model Context Protocol server for Tolk compiler
 * 
 * Enables LLMs to:
 * - Check Tolk compiler version
 * - Compile Tolk code and get bytecode
 * - Access compiler changelog
 * 
 * 版权声明：MIT License | Copyright (c) 2026 思捷娅科技 (SJYKJ)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TolkCompiler, type TolkCompilerConfig, type TolkResult } from './compiler.js';

// MCP Tools definition
const compileTool: Tool = {
  name: 'compile_tolk',
  description: 'Compile Tolk code and return bytecode. Use this to verify Tolk smart contract code before deployment.',
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'Tolk source code to compile',
      },
      optimize: {
        type: 'boolean',
        description: 'Enable optimization (default: true)',
        default: true,
      },
      debug: {
        type: 'boolean',
        description: 'Include debug information (default: false)',
        default: false,
      },
    },
    required: ['code'],
  },
};

const versionTool: Tool = {
  name: 'get_tolk_version',
  description: 'Get the Tolk compiler version and build information',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

const changelogTool: Tool = {
  name: 'get_tolk_changelog',
  description: 'Get the Tolk compiler changelog with recent changes and version history',
  inputSchema: {
    type: 'object',
    properties: {
      version: {
        type: 'string',
        description: 'Specific version to get changelog for (optional)',
      },
    },
  },
};

// MCP Server implementation
async function main() {
  const compiler = new TolkCompiler();

  const server = new Server(
    {
      name: 'tolk-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [compileTool, versionTool, changelogTool],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'compile_tolk': {
          const config: TolkCompilerConfig = {
            code: args?.code as string,
            optimize: args?.optimize as boolean ?? true,
            debug: args?.debug as boolean ?? false,
          };

          const result = await compiler.compile(config);

          if (result.success) {
            return {
              content: [
                {
                  type: 'text',
                  text: `✅ Compilation successful!\n\nBytecode (base64): ${result.bytecode}\n\n${result.warnings?.length ? `Warnings:\n${result.warnings.join('\n')}` : ''}`,
                },
              ],
            };
          } else {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ Compilation failed!\n\nError: ${result.error}${result.line ? ` (line ${result.line})` : ''}`,
                  isError: true,
                },
              ],
            };
          }
        }

        case 'get_tolk_version': {
          const version = await compiler.getVersion();
          return {
            content: [
              {
                type: 'text',
                text: `Tolk Compiler Version: ${version}`,
              },
            ],
          };
        }

        case 'get_tolk_changelog': {
          const version = args?.version as string | undefined;
          const changelog = await compiler.getChangelog(version);
          return {
            content: [
              {
                type: 'text',
                text: changelog,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
            isError: true,
          },
        ],
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Tolk MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
