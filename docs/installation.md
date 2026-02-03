# Installation

## NPM Install

```bash
npm install -g openclaw-mcp
```

Or run directly with npx:

```bash
npx openclaw-mcp
```

## Claude Desktop Configuration

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

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## Claude.ai (Remote Access)

For remote access via Claude.ai, deploy with SSE transport and OAuth:

```bash
# Start server with OAuth enabled
OAUTH_ENABLED=true \
API_KEYS=your-secure-key \
CORS_ORIGINS=https://claude.ai \
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
