import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { OpenClawClient } from '../../openclaw/client.js';
import { successResponse, errorResponse, type ToolResponse } from '../../utils/response-helpers.js';

export const openclawChatTool: Tool = {
  name: 'openclaw_chat',
  description: 'Send a message to OpenClaw and get a response',
  inputSchema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The message to send to OpenClaw',
      },
      session_id: {
        type: 'string',
        description: 'Optional session ID for conversation context',
      },
    },
    required: ['message'],
  },
};

interface ChatInput {
  message: string;
  session_id?: string;
}

export async function handleOpenclawChat(
  client: OpenClawClient,
  input: unknown
): Promise<ToolResponse> {
  const { message, session_id } = input as ChatInput;

  if (!message || typeof message !== 'string') {
    return errorResponse('Message is required and must be a string');
  }

  try {
    const response = await client.chat(message, session_id);
    return successResponse(response.response);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Failed to chat with OpenClaw');
  }
}
