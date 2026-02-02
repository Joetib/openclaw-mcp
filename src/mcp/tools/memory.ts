import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenClawClient } from '../../openclaw/client.js';
import { jsonResponse, errorResponse, type ToolResponse } from '../../utils/response-helpers.js';

export const openclawMemoryTool: Tool = {
  name: 'openclaw_memory',
  description: "Read, write, or search OpenClaw's persistent memory",
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'set', 'search'],
        description: 'Action to perform: get, set, or search',
      },
      key: {
        type: 'string',
        description: 'Memory key (required for get and set)',
      },
      value: {
        type: 'string',
        description: 'Value to store (required for set)',
      },
      query: {
        type: 'string',
        description: 'Search query (required for search)',
      },
    },
    required: ['action'],
  },
};

interface MemoryInput {
  action: 'get' | 'set' | 'search';
  key?: string;
  value?: string;
  query?: string;
}

export async function handleOpenclawMemory(
  client: OpenClawClient,
  input: unknown
): Promise<ToolResponse> {
  const { action, key, value, query } = input as MemoryInput;

  if (!action || !['get', 'set', 'search'].includes(action)) {
    return errorResponse('action must be one of: get, set, search');
  }

  try {
    switch (action) {
      case 'get': {
        if (!key) {
          return errorResponse('key is required for get action');
        }
        const response = await client.memoryGet(key);
        return jsonResponse(response);
      }
      case 'set': {
        if (!key || !value) {
          return errorResponse('key and value are required for set action');
        }
        const response = await client.memorySet(key, value);
        return jsonResponse(response);
      }
      case 'search': {
        if (!query) {
          return errorResponse('query is required for search action');
        }
        const response = await client.memorySearch(query);
        return jsonResponse(response);
      }
      default:
        return errorResponse(`Unknown action: ${action}`);
    }
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to access OpenClaw memory'
    );
  }
}
