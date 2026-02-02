import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenClawClient } from '../../openclaw/client.js';
import { jsonResponse, errorResponse, type ToolResponse } from '../../utils/response-helpers.js';

export const openclawSessionsTool: Tool = {
  name: 'openclaw_sessions',
  description: 'List all active OpenClaw sessions',
  inputSchema: {
    type: 'object',
    properties: {
      channel: {
        type: 'string',
        description: 'Filter sessions by channel (e.g., whatsapp, telegram, discord)',
      },
    },
  },
};

interface SessionsInput {
  channel?: string;
}

export async function handleOpenclawSessions(
  client: OpenClawClient,
  input: unknown
): Promise<ToolResponse> {
  const { channel } = (input as SessionsInput) || {};

  try {
    const response = await client.getSessions(channel);
    return jsonResponse(response.sessions);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get sessions from OpenClaw'
    );
  }
}
