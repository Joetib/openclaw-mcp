import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenClawClient } from '../../openclaw/client.js';
import { jsonResponse, errorResponse, type ToolResponse } from '../../utils/response-helpers.js';

export const openclawHistoryTool: Tool = {
  name: 'openclaw_history',
  description: 'Get conversation history from an OpenClaw session',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: {
        type: 'string',
        description: 'The session ID to get history from',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of messages to return (default: 50)',
      },
    },
    required: ['session_id'],
  },
};

interface HistoryInput {
  session_id: string;
  limit?: number;
}

export async function handleOpenclawHistory(
  client: OpenClawClient,
  input: unknown
): Promise<ToolResponse> {
  const { session_id, limit } = input as HistoryInput;

  if (!session_id || typeof session_id !== 'string') {
    return errorResponse('session_id is required and must be a string');
  }

  try {
    const response = await client.getHistory(session_id, limit);
    return jsonResponse(response.messages);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get history from OpenClaw'
    );
  }
}
