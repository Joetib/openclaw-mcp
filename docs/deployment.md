# Docker Deployment

## docker-compose.yml

The provided `docker-compose.yml` runs the MCP bridge server in a hardened container.
The OpenClaw gateway runs on your host machine (or elsewhere) — the bridge connects to it
via `host.docker.internal`.

```yaml
services:
  mcp-bridge:
    build: .
    container_name: openclaw-mcp
    restart: unless-stopped
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - OPENCLAW_URL=${OPENCLAW_URL:-http://host.docker.internal:18789}
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN:-}
      - AUTH_ENABLED=${AUTH_ENABLED:-true}
      - MCP_CLIENT_ID=${MCP_CLIENT_ID:-openclaw}
      - MCP_CLIENT_SECRET=${MCP_CLIENT_SECRET:-}
      - CORS_ORIGINS=${CORS_ORIGINS:-https://claude.ai}
      - NODE_ENV=production
    extra_hosts:
      - "host.docker.internal:host-gateway"
    read_only: true
    tmpfs:
      - /tmp
    deploy:
      resources:
        limits:
          memory: 256M
    security_opt:
      - no-new-privileges
```

## .env

```bash
# Token for OpenClaw gateway authentication
OPENCLAW_GATEWAY_TOKEN=your-gateway-token

# MCP OAuth client credentials
# Generate secret with: openssl rand -hex 32
MCP_CLIENT_ID=openclaw
MCP_CLIENT_SECRET=your-client-secret

# Enable OAuth (required for production SSE)
AUTH_ENABLED=true

# Allowed CORS origins
CORS_ORIGINS=https://claude.ai
```

## Quick Start

```bash
# Copy and edit environment
cp .env.example .env
# Edit .env with your settings

# Start the MCP bridge
docker compose up -d
```

## Security Checklist

- [ ] HTTPS enabled (via reverse proxy in front of the MCP bridge)
- [ ] OAuth enabled (`AUTH_ENABLED=true`)
- [ ] `MCP_CLIENT_ID` is valid (3–64 chars, alphanumeric/dashes/underscores)
- [ ] `MCP_CLIENT_SECRET` generated securely (`openssl rand -hex 32`, min 32 chars)
- [ ] `MCP_ISSUER_URL` set to public HTTPS URL (when behind reverse proxy)
- [ ] `MCP_REDIRECT_URIS` restricted to known callback URLs
- [ ] CORS restricted to known origins (`CORS_ORIGINS=https://claude.ai`)
- [ ] `OPENCLAW_GATEWAY_TOKEN` set for gateway authentication
- [ ] Dynamic client registration is disabled (default — no `/register` endpoint)
- [ ] Container runs read-only with no-new-privileges
