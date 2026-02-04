/**
 * SSE (Server-Sent Events) Transport for remote MCP access
 *
 * This enables Claude.ai and other remote clients to connect
 * to the MCP server over HTTPS with OAuth authentication.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { OAuthValidator, loadOAuthConfig } from '../auth/oauth.js';
import { log } from '../utils/logger.js';

export interface SSEServerConfig {
  port: number;
  host: string;
  corsOrigins?: string[];
}

/**
 * Load CORS configuration from environment
 */
export function loadCorsConfig(): { origins: string[]; enabled: boolean } {
  const corsOrigins = process.env.CORS_ORIGINS;

  if (!corsOrigins || corsOrigins === '*') {
    return { origins: ['*'], enabled: true };
  }

  if (corsOrigins.toLowerCase() === 'none' || corsOrigins === '') {
    return { origins: [], enabled: false };
  }

  return {
    origins: corsOrigins
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    enabled: true,
  };
}

/**
 * Check if origin is allowed by CORS config
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith('*.')) {
      // Wildcard subdomain match (e.g., *.example.com)
      const domain = allowed.slice(2);
      return origin.endsWith(domain) || origin.endsWith('.' + domain);
    }
    return origin === allowed || origin === `https://${allowed}` || origin === `http://${allowed}`;
  });
}

/**
 * Create HTTP server with SSE transport for MCP
 */
export async function createSSEServer(mcpServer: Server, config: SSEServerConfig): Promise<void> {
  const oauthConfig = loadOAuthConfig();
  // const oauthValidator = new OAuthValidator(oauthConfig);
  const corsConfig = loadCorsConfig();

  // We need to use express or similar for the HTTP server
  // For now, this is a placeholder showing the architecture

  log(`SSE server would start on ${config.host}:${config.port}`);
  log(`OAuth enabled: ${oauthConfig.enabled}`);
  log(`CORS origins: ${corsConfig.enabled ? corsConfig.origins.join(', ') : 'disabled'}`);

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

  if (corsConfig.origins.includes('*')) {
    log('⚠️  WARNING: CORS allows all origins - consider restricting in production!');
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
