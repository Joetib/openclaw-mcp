/**
 * OAuth2 Authentication for OpenClaw MCP
 *
 * Supports:
 * - Bearer token validation
 * - Token introspection
 * - Configurable OAuth providers (Auth0, Keycloak, custom)
 */

export interface OAuthConfig {
  /** Enable OAuth authentication */
  enabled: boolean;
  /** OAuth issuer URL (e.g., https://auth.example.com) */
  issuer?: string;
  /** Token introspection endpoint */
  introspectionEndpoint?: string;
  /** Client ID for introspection */
  clientId?: string;
  /** Client secret for introspection */
  clientSecret?: string;
  /** Required scopes for access */
  requiredScopes?: string[];
  /** Static API keys (for simple deployments) */
  apiKeys?: string[];
}

export interface TokenInfo {
  active: boolean;
  sub?: string;
  scope?: string;
  exp?: number;
  client_id?: string;
}

export class OAuthValidator {
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Validate a bearer token
   */
  async validateToken(
    token: string
  ): Promise<{ valid: boolean; info?: TokenInfo; error?: string }> {
    // If OAuth is disabled, always allow
    if (!this.config.enabled) {
      return { valid: true };
    }

    // Check static API keys first
    if (this.config.apiKeys?.includes(token)) {
      return {
        valid: true,
        info: { active: true, sub: 'api-key-user', scope: 'full' },
      };
    }

    // If no introspection endpoint, reject
    if (!this.config.introspectionEndpoint) {
      return { valid: false, error: 'No introspection endpoint configured' };
    }

    try {
      const response = await this.introspectToken(token);

      if (!response.active) {
        return { valid: false, error: 'Token is not active' };
      }

      // Check required scopes
      if (this.config.requiredScopes?.length) {
        const tokenScopes = (response.scope || '').split(' ');
        const hasAllScopes = this.config.requiredScopes.every((scope) =>
          tokenScopes.includes(scope)
        );
        if (!hasAllScopes) {
          return { valid: false, error: 'Insufficient scopes' };
        }
      }

      // Check expiration
      if (response.exp && response.exp < Date.now() / 1000) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true, info: response };
    } catch (error) {
      return {
        valid: false,
        error: `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Introspect token with OAuth provider
   */
  private async introspectToken(token: string): Promise<TokenInfo> {
    const endpoint = this.config.introspectionEndpoint!;

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Add client credentials if configured
    if (this.config.clientId && this.config.clientSecret) {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: `token=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      throw new Error(`Introspection failed: ${response.status}`);
    }

    return response.json() as Promise<TokenInfo>;
  }

  /**
   * Extract bearer token from Authorization header
   */
  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
  }
}

/**
 * Load OAuth config from environment
 */
export function loadOAuthConfig(): OAuthConfig {
  const enabled = process.env.OAUTH_ENABLED === 'true';

  return {
    enabled,
    issuer: process.env.OAUTH_ISSUER,
    introspectionEndpoint: process.env.OAUTH_INTROSPECTION_ENDPOINT,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    requiredScopes: process.env.OAUTH_REQUIRED_SCOPES?.split(',').map((s) => s.trim()),
    apiKeys: process.env.API_KEYS?.split(',').map((s) => s.trim()),
  };
}
