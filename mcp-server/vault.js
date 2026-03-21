/**
 * vault.js — Obsidian vault reader/writer for the APEX Vault MCP server
 */

import fs from 'fs';
import path from 'path';

const WIKI_LINK_RE = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export function collectMarkdownFiles(dir) {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return results; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

export function parseNote(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf-8'); }
  catch { return null; }

  const name = path.basename(filePath, '.md');
  const links = [];
  let m;
  const re = new RegExp(WIKI_LINK_RE.source, 'g');
  while ((m = re.exec(content)) !== null) links.push(m[1].trim());

  const frontmatter = {};
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const kv = line.match(/^(\w[\w-]*):\s*(.+)$/);
      if (kv) frontmatter[kv[1]] = kv[2].trim();
    }
  }

  const stat = fs.statSync(filePath);
  return { name, path: filePath, content, links, frontmatter, mtime: stat.mtimeMs };
}

export function loadVault(vaultPath) {
  const files = collectMarkdownFiles(vaultPath);
  const notes = new Map();
  const backlinks = new Map();

  for (const f of files) {
    const note = parseNote(f);
    if (!note) continue;
    notes.set(note.name, note);
    if (!backlinks.has(note.name)) backlinks.set(note.name, new Set());
  }

  for (const [, note] of notes) {
    for (const link of note.links) {
      if (!backlinks.has(link)) backlinks.set(link, new Set());
      backlinks.get(link).add(note.name);
    }
  }

  return { notes, backlinks, vaultPath };
}

export function searchVault(vault, query, limit = 10) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = [];

  for (const [, note] of vault.notes) {
    let score = 0;
    const nameLower = note.name.toLowerCase();
    const contentLower = note.content.slice(0, 2000).toLowerCase();

    for (const w of words) {
      if (nameLower.includes(w)) score += 8;
      if (contentLower.includes(w)) score += 3;
      for (const val of Object.values(note.frontmatter)) {
        if (String(val).toLowerCase().includes(w)) score += 5;
      }
    }

    if (score > 0) scored.push({ note, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ note }) => ({
      name: note.name,
      path: note.path,
      excerpt: note.content.slice(0, 400),
      frontmatter: note.frontmatter,
      links: note.links.slice(0, 5),
    }));
}

export function getRecentNotes(vault, limit = 10) {
  return [...vault.notes.values()]
    .sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
    .slice(0, limit)
    .map(n => ({ name: n.name, path: n.path, mtime: new Date(n.mtime).toISOString() }));
}

export function writeNote(vaultPath, subdir, filename, content) {
  const dir = path.join(vaultPath, subdir);
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename.endsWith('.md') ? filename : filename + '.md');
  // Atomic write
  const tmp = filepath + '.tmp';
  fs.writeFileSync(tmp, content, 'utf-8');
  fs.renameSync(tmp, filepath);
  return filepath;
}

export function listDirectory(vaultPath, subdir = '') {
  const dir = subdir ? path.join(vaultPath, subdir) : vaultPath;
  try {
    return fs.readdirSync(dir)
      .filter(f => !f.startsWith('.'))
      .map(f => {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        return { name: f, type: stat.isDirectory() ? 'dir' : 'file', mtime: stat.mtime.toISOString() };
      });
  } catch {
    return [];
  }
}
