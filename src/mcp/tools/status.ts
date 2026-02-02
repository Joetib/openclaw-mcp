import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenClawClient } from '../../openclaw/client.js';
import { jsonResponse, errorResponse, type ToolResponse } from '../../utils/response-helpers.js';

export const openclawStatusTool: Tool = {
  name: 'openclaw_status',
  description: 'Get OpenClaw gateway status and health information',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleOpenclawStatus(
  client: OpenClawClient,
  _input: unknown
): Promise<ToolResponse> {
  try {
    const response = await client.health();
    return jsonResponse(response);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to get status from OpenClaw'
    );
  }
}
