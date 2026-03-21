#!/usr/bin/env node
/**
 * APEX Vault MCP Server
 *
 * Gives Claude Code / Claude Desktop full read/write access to your Obsidian vault.
 * Transport: stdio (Claude launches this as a subprocess — no ports, no auth needed)
 *
 * Tools exposed:
 *   search_vault    — find notes by keyword
 *   read_note       — read a specific note by name or path
 *   write_note      — create or update a note
 *   list_vault      — list directories and recent files
 *   get_context     — get 10 most recently modified notes (daily orientation)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadVault,
  searchVault,
  getRecentNotes,
  writeNote,
  listDirectory,
} from './vault.js';

// ── Vault path ────────────────────────────────────────────────────────────────
// Priority: VAULT_PATH env var → sibling "vault" folder → error
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_PATH = process.env.VAULT_PATH
  || path.join(__dirname, '..', 'vault');

// ── Load vault ────────────────────────────────────────────────────────────────
let vault = loadVault(VAULT_PATH);
// Reload every 2 minutes to pick up new notes
setInterval(() => {
  try { vault = loadVault(VAULT_PATH); } catch { /* ignore */ }
}, 120_000);

// ── MCP Server ────────────────────────────────────────────────────────────────
const server = new Server(
  { name: 'apex-vault', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_vault',
      description: 'Search your Obsidian vault for notes matching keywords. Returns title, excerpt, and frontmatter.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Keywords to search for' },
          limit: { type: 'number', description: 'Max results (default 8)', default: 8 },
        },
        required: ['query'],
      },
    },
    {
      name: 'read_note',
      description: 'Read the full content of a specific vault note by name.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Note name (without .md extension)' },
        },
        required: ['name'],
      },
    },
    {
      name: 'write_note',
      description: 'Create or update a note in the vault. Specify the subdirectory (e.g. KnowledgeBriefs, Decisions, DailyNotes).',
      inputSchema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Filename without .md (e.g. 2026-03-21-my-note)' },
          subdir: { type: 'string', description: 'Vault subdirectory (e.g. KnowledgeBriefs, Decisions, DailyNotes, Tasks)' },
          content: { type: 'string', description: 'Full markdown content including YAML frontmatter if needed' },
        },
        required: ['filename', 'subdir', 'content'],
      },
    },
    {
      name: 'list_vault',
      description: 'List the top-level directories or contents of a specific subdirectory in the vault.',
      inputSchema: {
        type: 'object',
        properties: {
          subdir: { type: 'string', description: 'Subdirectory to list (leave empty for root)', default: '' },
        },
      },
    },
    {
      name: 'get_context',
      description: 'Get the 10 most recently modified notes — use this at the start of any session to orient yourself on what Nico is working on.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Number of recent notes (default 10)', default: 10 },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'search_vault') {
      const results = searchVault(vault, args.query, args.limit || 8);
      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No notes found for: "${args.query}"` }] };
      }
      const text = results.map(r =>
        `## ${r.name}\n**Path:** ${r.path}\n${r.excerpt}\n`
      ).join('\n---\n');
      return { content: [{ type: 'text', text }] };
    }

    if (name === 'read_note') {
      const note = vault.notes.get(args.name);
      if (!note) {
        // Try fuzzy match
        const matches = [...vault.notes.keys()].filter(k =>
          k.toLowerCase().includes(args.name.toLowerCase())
        );
        if (matches.length === 0) {
          return { content: [{ type: 'text', text: `Note not found: "${args.name}". Try search_vault first.` }] };
        }
        if (matches.length === 1) {
          const m = vault.notes.get(matches[0]);
          return { content: [{ type: 'text', text: m.content }] };
        }
        return { content: [{ type: 'text', text: `Multiple matches: ${matches.slice(0,5).join(', ')}. Be more specific.` }] };
      }
      return { content: [{ type: 'text', text: note.content }] };
    }

    if (name === 'write_note') {
      const filepath = writeNote(VAULT_PATH, args.subdir, args.filename, args.content);
      // Reload vault after write
      try { vault = loadVault(VAULT_PATH); } catch { /* ignore */ }
      return { content: [{ type: 'text', text: `Written: ${filepath}` }] };
    }

    if (name === 'list_vault') {
      const entries = listDirectory(VAULT_PATH, args.subdir || '');
      const text = entries.map(e => `${e.type === 'dir' ? '📁' : '📄'} ${e.name}`).join('\n');
      return { content: [{ type: 'text', text: text || 'Empty directory' }] };
    }

    if (name === 'get_context') {
      const recent = getRecentNotes(vault, args.limit || 10);
      const text = recent.map(n => `- **${n.name}** (${n.mtime.slice(0,10)})`).join('\n');
      return { content: [{ type: 'text', text: `## Recently Modified Notes\n\n${text}` }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };

  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
// stderr only — stdout is reserved for MCP protocol
process.stderr.write(`[apex-vault-mcp] Started. Vault: ${VAULT_PATH} (${vault.notes.size} notes)\n`);
