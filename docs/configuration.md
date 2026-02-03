# Configuration

All configuration can be done via environment variables. Copy `.env.example` to `.env` for local development.

## Environment Variables

### OpenClaw Connection

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENCLAW_URL` | OpenClaw gateway URL | `http://127.0.0.1:18789` |

### Server Settings (SSE transport)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | SSE server port | `3000` |
| `HOST` | SSE server host | `0.0.0.0` |
| `DEBUG` | Enable debug logging | `false` |

### CORS Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `*` |

**CORS_ORIGINS examples:**
- `*` — Allow all origins (not recommended for production)
- `none` — Disable CORS entirely
- `https://claude.ai` — Single origin
- `https://claude.ai,https://your-app.com` — Multiple origins
- `*.example.com` — Wildcard subdomain

### Authentication

| Variable | Description | Required |
|----------|-------------|----------|
| `OAUTH_ENABLED` | Enable OAuth (`true`/`false`) | Yes for production |
| `API_KEYS` | Comma-separated static API keys | No |
| `OAUTH_ISSUER` | OAuth issuer URL | No |
| `OAUTH_INTROSPECTION_ENDPOINT` | Token introspection URL | When using OAuth |
| `OAUTH_CLIENT_ID` | Client ID for introspection | When using OAuth |
| `OAUTH_CLIENT_SECRET` | Client secret | When using OAuth |
| `OAUTH_REQUIRED_SCOPES` | Comma-separated required scopes | No |
