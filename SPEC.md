# OpenClaw MCP Bridge

MCP server pro OpenClaw AI assistant. Stdio transport pro Claude Desktop.

## Tools

1. **openclaw_chat** - Pošle zprávu do OpenClaw, vrátí odpověď
2. **openclaw_sessions** - Seznam aktivních sessions  
3. **openclaw_history** - Historie konverzace
4. **openclaw_status** - Health check OpenClaw gateway
5. **openclaw_memory** - Čtení/zápis paměti (get/set/search)

## OpenClaw API

```
GET  /health           - Health check
GET  /api/sessions     - List sessions
POST /api/message      - Send message
GET  /api/sessions/:id/history - Get history
```

## Tech Stack

- TypeScript, ESM, Node.js 20+
- @modelcontextprotocol/sdk
- yargs pro CLI (--openclaw-url, --help, --version)

## Struktura (jako firefox-devtools-mcp)

```
src/
├── index.ts           # Entry point + MCP server
├── cli.ts             # CLI args
├── config/constants.ts
├── types/common.ts
├── utils/logger.ts, errors.ts, response-helpers.ts
├── openclaw/client.ts, types.ts
└── mcp/tools/index.ts, chat.ts, sessions.ts, history.ts, status.ts, memory.ts
```
