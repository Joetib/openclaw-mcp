# OpenClaw MCP Server

🦞 Model Context Protocol (MCP) server for [OpenClaw](https://github.com/openclaw/openclaw) AI assistant integration.

## Features

- **openclaw_chat** - Send messages to OpenClaw and get responses
- **openclaw_sessions** - List all active sessions
- **openclaw_history** - Get conversation history from a session
- **openclaw_status** - Check OpenClaw gateway health
- **openclaw_memory** - Read, write, and search OpenClaw's memory

## Installation

```bash
npm install -g openclaw-mcp
```

Or run directly with npx:

```bash
npx openclaw-mcp
```

## Usage

### Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

### CLI Options

```bash
openclaw-mcp --help

Options:
  --openclaw-url, -u  OpenClaw gateway URL [default: "http://127.0.0.1:18789"]
  --version           Show version number
  --help              Show help
```

### Environment Variables

- `OPENCLAW_URL` - OpenClaw gateway URL (default: `http://127.0.0.1:18789`)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build

# Test with MCP Inspector
npm run inspector
```

## License

MIT
