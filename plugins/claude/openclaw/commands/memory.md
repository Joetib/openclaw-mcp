---
description: Access OpenClaw's memory
argument-hint: <get|search> <key|query>
---

# /claw:memory

Read, write, or search OpenClaw's persistent memory.

## Usage

```
/claw:memory get <key>
/claw:memory set <key> <value>
/claw:memory search <query>
```

## Examples

```
/claw:memory get user_preferences
/claw:memory set reminder "Call mom at 5pm"
/claw:memory search "project deadlines"
```

## What Happens

Calls `openclaw_memory` with the specified operation (get, set, or search).
