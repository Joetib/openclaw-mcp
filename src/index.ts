#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { SERVER_NAME, SERVER_VERSION } from './config/constants.js';
import { log, logError } from './utils/logger.js';
import { parseArguments } from './cli.js';
import { OpenClawClient } from './openclaw/client.js';
import * as tools from './mcp/tools/index.js';

// Parse CLI arguments
const args = parseArguments(SERVER_VERSION);

// Create OpenClaw client
const client = new OpenClawClient(args.openclawUrl);

// Tool handler mapping
const toolHandlers = new Map<
  string,
  (input: unknown) => Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }>
>([
  // Sync tools
  ['openclaw_chat', (input) => tools.handleOpenclawChat(client, input)],
  ['openclaw_sessions', (input) => tools.handleOpenclawSessions(client, input)],
  ['openclaw_history', (input) => tools.handleOpenclawHistory(client, input)],
  ['openclaw_status', (input) => tools.handleOpenclawStatus(client, input)],
  ['openclaw_memory', (input) => tools.handleOpenclawMemory(client, input)],
  // Async task tools
  ['openclaw_chat_async', (input) => tools.handleOpenclawChatAsync(client, input)],
  ['openclaw_task_status', (input) => tools.handleOpenclawTaskStatus(client, input)],
  ['openclaw_task_list', (input) => tools.handleOpenclawTaskList(client, input)],
  ['openclaw_task_cancel', (input) => tools.handleOpenclawTaskCancel(client, input)],
]);

// All tool definitions
const allTools = [
  // Sync tools
  tools.openclawChatTool,
  tools.openclawSessionsTool,
  tools.openclawHistoryTool,
  tools.openclawStatusTool,
  tools.openclawMemoryTool,
  // Async task tools
  tools.openclawChatAsyncTool,
  tools.openclawTaskStatusTool,
  tools.openclawTaskListTool,
  tools.openclawTaskCancelTool,
];

async function main() {
  log(`Starting ${SERVER_NAME} v${SERVER_VERSION}`);
  log(`OpenClaw URL: ${args.openclawUrl}`);

  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: allTools };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: toolArgs } = request.params;
    log(`Executing tool: ${name}`);

    const handler = toolHandlers.get(name);
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      return await handler(toolArgs);
    } catch (error) {
      logError(`Error executing tool ${name}`, error);
      throw error;
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  log('OpenClaw MCP server running on stdio');
}

main().catch((error) => {
  logError('Fatal error', error);
  process.exit(1);
});
