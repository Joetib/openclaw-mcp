/**
 * SSE (Server-Sent Events) Transport for remote MCP access
 * 
 * This enables Claude.ai and other remote clients to connect
 * to the MCP server over HTTPS with OAuth authentication.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { OAuthValidator, loadOAuthConfig } from '../auth/oauth.js';
import { log, logError } from '../utils/logger.js';

export interface SSEServerConfig {
  port: number;
  host: string;
  corsOrigins?: string[];
}

/**
 * Create HTTP server with SSE transport for MCP
 */
export async function createSSEServer(
  mcpServer: Server,
  config: SSEServerConfig
): Promise<void> {
  const oauthConfig = loadOAuthConfig();
  const oauthValidator = new OAuthValidator(oauthConfig);

  // We need to use express or similar for the HTTP server
  // For now, this is a placeholder showing the architecture
  
  log(`SSE server would start on ${config.host}:${config.port}`);
  log(`OAuth enabled: ${oauthConfig.enabled}`);
  
  if (oauthConfig.enabled) {
    log('OAuth authentication is REQUIRED for all connections');
    if (oauthConfig.apiKeys?.length) {
      log(`${oauthConfig.apiKeys.length} API keys configured`);
    }
    if (oauthConfig.introspectionEndpoint) {
      log(`Token introspection: ${oauthConfig.introspectionEndpoint}`);
    }
  } else {
    log('⚠️  WARNING: OAuth is DISABLED - server is open to anyone!');
  }

  // TODO: Implement full SSE server with express
  // This requires additional dependencies (express, cors)
  // For now, use stdio transport for local Claude Desktop
}

/**
 * Middleware to validate OAuth tokens
 */
export async function validateRequest(
  authHeader: string | undefined,
  validator: OAuthValidator
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const token = OAuthValidator.extractBearerToken(authHeader);
  
  if (!token) {
    return { authorized: false, error: 'Missing Authorization header' };
  }

  const result = await validator.validateToken(token);
  
  if (!result.valid) {
    return { authorized: false, error: result.error };
  }

  return { authorized: true, userId: result.info?.sub };
}
