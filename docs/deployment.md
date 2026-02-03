# Docker Deployment

## docker-compose.yml

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
      - CORS_ORIGINS=https://claude.ai
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

## .env

```bash
ANTHROPIC_API_KEY=sk-ant-...
DOMAIN=example.com
ACME_EMAIL=you@example.com
MCP_API_KEYS=your-secure-api-key-1,your-secure-api-key-2
```

## Security Checklist

- [ ] HTTPS enabled (via reverse proxy)
- [ ] OAuth/API keys enabled (`OAUTH_ENABLED=true`)
- [ ] CORS restricted to known origins
- [ ] OpenClaw gateway not exposed to internet (internal network only)
- [ ] Secure API keys generated (`openssl rand -hex 32`)
