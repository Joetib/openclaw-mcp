# OpenClaw MCP Server

[![npm version](https://badge.fury.io/js/openclaw-mcp.svg)](https://www.npmjs.com/package/openclaw-mcp)
[![CI](https://github.com/freema/openclaw-mcp/workflows/CI/badge.svg)](https://github.com/freema/openclaw-mcp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🦞 Model Context Protocol (MCP) server for [OpenClaw](https://github.com/openclaw/openclaw) AI assistant integration.

## Why I Built This

Hey! I created this MCP server because I didn't want to rely solely on messaging channels to communicate with OpenClaw. What really excites me is the ability to connect OpenClaw to the Claude web UI. Essentially, my chat can delegate tasks to my Claw bot, which then handles everything else — like spinning up Claude Code to fix issues for me.

Think of it as an AI assistant orchestrating another AI assistant. Pretty cool, right?

## Quick Start

### Local (Claude Desktop)

```bash
npx openclaw-mcp
```

Add to your Claude Desktop config:

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

### Remote (Claude.ai)

```bash
OAUTH_ENABLED=true API_KEYS=your-key CORS_ORIGINS=https://claude.ai \
  npx openclaw-mcp --transport sse --port 3000
```

See [Installation Guide](docs/installation.md) for details.

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

## Available Tools

| Tool | Description |
|------|-------------|
| `openclaw_chat` | Send messages to OpenClaw and get responses |
| `openclaw_sessions` | List all active sessions |
| `openclaw_history` | Get conversation history from a session |
| `openclaw_status` | Check OpenClaw gateway health |
| `openclaw_memory` | Read, write, and search OpenClaw's memory |

## Documentation

- [Installation](docs/installation.md) — Setup for Claude Desktop & Claude.ai
- [Configuration](docs/configuration.md) — Environment variables & options
- [Deployment](docs/deployment.md) — Docker & production setup
- [Development](docs/development.md) — Contributing & adding tools
- [Security](SECURITY.md) — Security policy & best practices

## Security

⚠️ **Always enable authentication in production!**

```bash
# Generate secure API key
openssl rand -hex 32

# Run with auth enabled
OAUTH_ENABLED=true API_KEYS=your-key openclaw-mcp --transport sse
```

Configure CORS to restrict access:

```bash
CORS_ORIGINS=https://claude.ai,https://your-app.com
```

See [Configuration](docs/configuration.md) for all security options.

## Requirements

- Node.js ≥ 20
- OpenClaw gateway running

## License

MIT

## Author

Created by [Tomáš Grasl](https://www.tomasgrasl.cz/)

## Related Projects

- [OpenClaw](https://github.com/openclaw/openclaw) — The AI assistant this MCP connects to
- [MCP Specification](https://spec.modelcontextprotocol.io/) — Model Context Protocol docs
