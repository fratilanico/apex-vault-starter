# CLAUDE.md — APEX Vault Starter

## Your Role

You have access to the user's Obsidian knowledge vault via the `apex-vault` MCP tools.

## Session Start Protocol (MANDATORY)

At the start of EVERY session:
1. Call `get_context` to see the 10 most recently modified notes
2. Read any relevant notes before starting work
3. This tells you what the user is working on without them having to repeat it

## Tools Available

| Tool | When to use |
|------|-------------|
| `get_context` | Session start — always |
| `search_vault` | Before answering any question that might be in the vault |
| `read_note` | When you need the full content of a specific note |
| `write_note` | After completing any significant task, decision, or learning |
| `list_vault` | When exploring what's in a folder |

## Writing Notes (IMPORTANT)

After EVERY significant session, write a KnowledgeBrief:

```
Tool: write_note
subdir: KnowledgeBriefs
filename: YYYY-MM-DD-topic-slug
content: |
  ---
  type: knowledge-brief
  title: "What we built/decided/learned"
  created: YYYY-MM-DD
  tags: [relevant, tags]
  ---
  
  # Title
  
  ## What Happened
  [1-3 sentences]
  
  ## Key Decisions
  - Decision 1
  - Decision 2
  
  ## How to Use This
  [practical notes for next time]
```

## Rules

- Search the vault BEFORE asking the user for context
- Write notes AFTER completing tasks — never skip this
- Use [[wiki-links]] when referencing other notes
- Keep notes concise and scannable
