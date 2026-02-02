# OpenClaw MCP Server

🦞 Model Context Protocol (MCP) server for [OpenClaw](https://github.com/openclaw/openclaw) AI assistant integration.

Connect Claude.ai or Claude Desktop to your self-hosted OpenClaw instance securely.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Server                             │
│                                                                 │
│  ┌─────────────────┐      ┌─────────────────────────┐          │
│  │   OpenClaw      │      │    OpenClaw MCP         │          │
│  │   Gateway       │◄────►│    Bridge Server        │          │
│  │   :18789        │      │    :3000                │          │
│  │                 │      │                         │          │
│  │  (your AI)      │      │  - OAuth2 auth          │          │
│  └─────────────────┘      │  - Rate limiting        │          │
│                           │  - Audit logging        │          │
│                           └──────────┬──────────────┘          │
│                                      │                          │
└──────────────────────────────────────┼──────────────────────────┘
                                       │ HTTPS + OAuth2
                                       ▼
                              ┌─────────────────┐
                              │   Claude.ai     │
                              │   (MCP Client)  │
                              └─────────────────┘
```

## Features

| Tool | Description |
|------|-------------|
| `openclaw_chat` | Send messages to OpenClaw and get responses |
| `openclaw_sessions` | List all active sessions |
| `openclaw_history` | Get conversation history from a session |
| `openclaw_status` | Check OpenClaw gateway health |
| `openclaw_memory` | Read, write, and search OpenClaw's memory |

## Installation

```bash
npm install -g openclaw-mcp
```

Or run directly with npx:

```bash
npx openclaw-mcp
```

## Usage

### Option 1: Local (Claude Desktop) - Stdio Transport

For local use with Claude Desktop, use stdio transport (default):

```json
{
  "mcpServers": {
    "openclaw": {
      "command": "npx",
      "args": ["openclaw-mcp"],
      "env": {
        "OPENCLAW_URL": "http://127.0.0.1:18789"
      }
    }
  }
}
```

**Config location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### Option 2: Remote (Claude.ai) - SSE Transport with OAuth

For remote access via Claude.ai, deploy with SSE transport and OAuth:

```bash
# Start server with OAuth enabled
OAUTH_ENABLED=true \
OAUTH_INTROSPECTION_ENDPOINT=https://auth.example.com/oauth/introspect \
OAUTH_CLIENT_ID=openclaw-mcp \
OAUTH_CLIENT_SECRET=your-secret \
openclaw-mcp --transport sse --port 3000
```

Then add to Claude.ai MCP settings:

```json
{
  "mcpServers": {
    "openclaw": {
      "url": "https://mcp.your-domain.com/sse",
      "transport": "sse"
    }
  }
}
```

## 🔐 Security

### OAuth2 Authentication

For production deployments, **always enable OAuth**:

| Environment Variable | Description | Required |
|---------------------|-------------|----------|
| `OAUTH_ENABLED` | Enable OAuth (`true`/`false`) | Yes |
| `OAUTH_ISSUER` | OAuth issuer URL | No |
| `OAUTH_INTROSPECTION_ENDPOINT` | Token introspection URL | Yes* |
| `OAUTH_CLIENT_ID` | Client ID for introspection | Yes* |
| `OAUTH_CLIENT_SECRET` | Client secret | Yes* |
| `OAUTH_REQUIRED_SCOPES` | Comma-separated required scopes | No |
| `API_KEYS` | Comma-separated static API keys | No |

*Required when `OAUTH_ENABLED=true` and not using API keys.

### Simple API Key Authentication

For simpler deployments, use static API keys:

```bash
OAUTH_ENABLED=true \
API_KEYS=key1,key2,key3 \
openclaw-mcp --transport sse
```

### Security Recommendations

1. **Always use HTTPS** - Deploy behind a reverse proxy (nginx, Caddy, Traefik)
2. **Enable OAuth** - Never expose MCP server without authentication
3. **Use short-lived tokens** - Configure your OAuth provider appropriately
4. **Restrict CORS** - Set allowed origins in production
5. **Rate limiting** - Use your reverse proxy for rate limiting
6. **Audit logging** - Monitor access to your OpenClaw instance

## Docker Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-gateway
    restart: unless-stopped
    volumes:
      - ./openclaw-config:/root/.openclaw
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - internal
    # Internal only - not exposed
    expose:
      - "18789"

  mcp-bridge:
    image: node:20-slim
    container_name: openclaw-mcp
    working_dir: /app
    command: npx openclaw-mcp --transport sse --port 3000
    environment:
      - OPENCLAW_URL=http://openclaw:18789
      - OAUTH_ENABLED=true
      - API_KEYS=${MCP_API_KEYS}
    networks:
      - internal
      - web
    expose:
      - "3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mcp.rule=Host(`mcp.${DOMAIN}`)"
      - "traefik.http.routers.mcp.tls=true"
      - "traefik.http.routers.mcp.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - web

networks:
  internal:
  web:
```

### .env

```bash
ANTHROPIC_API_KEY=sk-ant-...
DOMAIN=example.com
ACME_EMAIL=you@example.com
MCP_API_KEYS=your-secure-api-key-1,your-secure-api-key-2
```

## CLI Options

```bash
openclaw-mcp --help

Options:
  --openclaw-url, -u  OpenClaw gateway URL     [default: "http://127.0.0.1:18789"]
  --transport, -t     Transport mode           [choices: "stdio", "sse"] [default: "stdio"]
  --port, -p          Port for SSE server      [default: 3000]
  --host              Host for SSE server      [default: "0.0.0.0"]
  --oauth             Enable OAuth             [default: false]
  --version           Show version number
  --help              Show help
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_URL` | OpenClaw gateway URL | `http://127.0.0.1:18789` |
| `PORT` | SSE server port | `3000` |
| `HOST` | SSE server host | `0.0.0.0` |
| `DEBUG` | Enable debug logging | `false` |

## Development

```bash
# Clone the repository
git clone https://github.com/freema/openclaw-mcp
cd openclaw-mcp

# Install dependencies
npm install

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format

# Build
npm run build

# Test with MCP Inspector
npm run inspector
```

## License

MIT

## Related Projects

- [OpenClaw](https://github.com/openclaw/openclaw) - The AI assistant this MCP connects to
- [MCP Specification](https://spec.modelcontextprotocol.io/) - Model Context Protocol docs
