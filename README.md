# APEX Vault Starter

> Give Claude a permanent memory. Your Obsidian vault becomes your AI's second brain.

## What This Is

A ready-to-run setup that connects your [Obsidian](https://obsidian.md) vault to Claude via MCP (Model Context Protocol). After setup, Claude can:

- **Search** your vault for relevant notes before answering
- **Read** any note by name
- **Write** new notes automatically after sessions
- **Track** your most recently modified files to stay oriented

## Requirements

- Windows 10 or 11
- [Obsidian](https://obsidian.md/download) (free, download separately)
- [Claude Desktop](https://claude.ai/download) (free tier works)
- Internet connection for setup

Node.js is installed automatically by the setup script.

## Setup (5 minutes)

### Step 1 — Download this repo

Click the green **Code** button → **Download ZIP** → extract to a folder you'll keep (e.g. `C:\Tools\apex-vault-starter`)

### Step 2 — Run the installer

Right-click `setup.ps1` → **Run with PowerShell**

> If you see a security warning, click **More info** → **Run anyway**

The script will:
- Install Node.js if needed
- Create your vault at `C:\Users\YourName\apex-vault`
- Install the MCP server
- Configure Claude Desktop automatically

### Step 3 — Open your vault in Obsidian

1. Open Obsidian
2. Click **Open folder as vault**
3. Navigate to `C:\Users\YourName\apex-vault`
4. Click **Select Folder**

### Step 4 — Restart Claude Desktop

Close and reopen Claude Desktop. The vault MCP will load automatically.

### Step 5 — Test it

In Claude Desktop, type:
```
What are my most recent vault notes?
```

Claude should respond with your recently modified notes.

## Your Vault Structure

```
apex-vault/
├── Tasks/           ← Active work items
├── KnowledgeBriefs/ ← Things you've learned (auto-written by Claude)
├── Agents/          ← AI agent notes
├── Skills/          ← Reusable patterns
├── Decisions/       ← Key decisions
├── Incidents/       ← Problems + fixes
├── Repos/           ← Codebase notes
├── DailyNotes/      ← Daily logs
├── WeeklyReviews/   ← Weekly summaries
├── Signals/         ← Ideas and research
├── Governance/      ← Rules and protocols
├── Leads/           ← Business notes
├── AgentLogs/       ← AI session logs
└── PRs/             ← Pull request notes
```

## Using It

Tell Claude to write notes after important sessions:
> *"Write a KnowledgeBrief about what we just built"*

Ask Claude to search before you explain context:
> *"Search the vault for anything about [topic] before I explain"*

Get your daily orientation:
> *"What have I been working on recently?"*

## Troubleshooting

**Claude doesn't see the vault tools:**
- Make sure Claude Desktop is fully restarted (not just minimized)
- Check `%APPDATA%\Claude\claude_desktop_config.json` has an `apex-vault` entry
- Run `start-mcp-debug.ps1` to test the MCP server directly

**Setup script blocked by PowerShell:**
- Open PowerShell as Administrator
- Run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- Run the setup script again

**Vault path is wrong:**
- Edit `.env` in the repo folder
- Change `VAULT_PATH=` to your vault folder path

## Advanced

To use with Claude Code (CLI) instead of Claude Desktop, add to your project's `.mcp.json`:
```json
{
  "mcpServers": {
    "apex-vault": {
      "command": "node",
      "args": ["C:/path/to/apex-vault-starter/mcp-server/index.js"],
      "env": { "VAULT_PATH": "C:/Users/YourName/apex-vault" }
    }
  }
}
```

---

Built on the APEX OS stack. Based on the same vault system powering [InfoAcademy](https://infoacademy.uk).
