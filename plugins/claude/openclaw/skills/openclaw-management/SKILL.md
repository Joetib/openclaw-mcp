---
name: openclaw-management
description: This skill should be used when the user wants to interact with OpenClaw, delegate tasks to their AI assistant, check sessions, or access OpenClaw's memory. Activates for AI assistant delegation and orchestration.
---

When the user wants to interact with OpenClaw or delegate tasks, use the OpenClaw MCP tools.

## When to Use This Skill

Activate when the user:

- Wants to chat with OpenClaw ("Ask Claw to...", "Tell my assistant...")
- Delegates tasks ("Have OpenClaw research...", "Let Claw handle...")
- Checks status ("Is OpenClaw running?", "Show active sessions")
- Accesses memory ("What does Claw remember about...", "Store this in memory")
- Manages tasks ("Check task progress", "Cancel that task")

## Tools Reference

| Task | Tool |
|------|------|
| Chat (sync) | `openclaw_chat` |
| Chat (async) | `openclaw_chat_async` |
| Task status | `openclaw_task_status` |
| List tasks | `openclaw_task_list` |
| Cancel task | `openclaw_task_cancel` |
| List sessions | `openclaw_sessions` |
| Get history | `openclaw_history` |
| Gateway health | `openclaw_status` |
| Memory ops | `openclaw_memory` |

## Sync vs Async

**Use sync (`openclaw_chat`):**
- Quick questions
- Simple commands
- When you need immediate response

**Use async (`openclaw_chat_async`):**
- Research tasks
- Long-running operations
- Tasks that might timeout

## Example Workflows

**Quick question:**
```
openclaw_chat message="What's the weather?"
```

**Long task:**
```
openclaw_chat_async message="Research competitors and write a report"
→ { task_id: "task_abc123" }

openclaw_task_status task_id="task_abc123"
→ { status: "running" }

# ... poll until complete ...

openclaw_task_status task_id="task_abc123"
→ { status: "completed", result: "..." }
```
