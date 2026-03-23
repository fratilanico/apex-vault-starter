---
type: knowledge-brief
date: 2026-03-22
project: Leerspoor + APEX OS
tags: [index, session-summary, qa, tdd, wave-formation, leerspoor, 4d-qa]
---

# Leerspoor Session Index — 2026-03-22

Master reference for all artifacts produced during the Leerspoor W4–W7 sprint
and 4D QA methodology creation session.

---

## Skills Created

| Skill | Repo | Path | Lines | Triggers on |
|-------|------|------|-------|-------------|
| [[4D QA Gate]] | apex-os-core | `.agents/skills/4d-qa-gate/SKILL.md` | 561 | QA, testing, TDD, wave:complete, UAT, "ready to ship" |
| Professional QA Gate | leerspoor | `.agents/skills/professional-qa-gate/SKILL.md` | 171 | Same triggers, project-specific |

## Knowledge Briefs (this session)

| Brief | Tags | Severity |
|-------|------|----------|
| [[KB-2026-03-22-4d-qa-methodology]] | qa, methodology, wave-formation | critical |
| [[KB-2026-03-22-arasaac-id-verification]] | qa, arasaac, data-integrity | critical |
| [[KB-2026-03-22-role-guard-profiles-table]] | security, middleware, rbac | critical |
| [[KB-2026-03-22-touch-targets-zml]] | accessibility, zml, wcag | serious |
| [[KB-2026-03-22-placeholder-labels-pipeline]] | content-pipeline, labels | serious |
| [[KB-2026-03-22-progress-bar-aria]] | accessibility, aria, screen-reader | serious |

## Tools Created

| Tool | Path (leerspoor repo) | Purpose |
|------|-----------------------|---------|
| `qa-gate.py` | `scripts/qa-gate.py` | 4-plane QA runner (20 checks) |
| `generate-explanations.py` | `scripts/generate-explanations.py` | Content pipeline (3,723 goals) |
| `import-goals.py` | `scripts/import-goals.py` | CED goal importer |
| `wave-formation.sh` | `scripts/wave-formation.sh` | Wave delivery hooks (W0–W7) |
| `arasaac_cache.json` | `scripts/arasaac_cache.json` | 1,293 keyword→pictogram cache |

## Wave History

| Wave | Goal | Status | Tests at end |
|------|------|--------|-------------|
| W0–W3 | Foundation → Parent + Iber | complete ✓ | 291 |
| W4 | Bingo + Counting + 3,712 goals | complete ✓ | 380 |
| W5 | Lesson content pipeline | complete ✓ | 470 |
| W6 | Quality + production | complete ✓ | 901 |
| W7 | ARASAAC enrichment | complete ✓ | 911 |

## FDRP Reports

| Run | Date | PDF | Key findings |
|-----|------|-----|-------------|
| #3 | 2026-03-17 | `docs/papers/2026-03-17-leerspoor-fdrp-run-3.pdf` | W4 93.7% complete, migration needed |
| #4 | 2026-03-22 | `docs/papers/2026-03-22-leerspoor-fdrp-run-4.pdf` | All FDRP items closed except DEC-016 |

## BDD Specifications

10 feature files, 75 Gherkin scenarios:
- `leerspoor-auth.feature` (8) — login, guards, password reset
- `leerspoor-navigation.feature` (13) — sidebar per role, active state
- `leerspoor-header.feature` (4) — role-specific headers
- `leerspoor-overview-panel.feature` (5) — dashboard metrics
- `leerspoor-students-panel.feature` (8) — Alle Leerlingen, bundles
- `leerspoor-goals-panel.feature` (8) — Leerdoelen Browser, game picker
- `leerspoor-progress-panel.feature` (4) — voortgang, badges, Spellen
- `leerspoor-responsive-a11y.feature` (9) — ZML touch targets, ARIA
- `leerspoor-error-states.feature` (8) — empty states, Dutch 404
- `leerspoor-lesson-schema.feature` (8) — game loading, route adaptation

## QA Blockers Found + Fixed

| # | Issue | Fix | Plane |
|---|-------|-----|-------|
| 1 | 10 broken ARASAAC IDs (32%) | Replaced with verified IDs | Data |
| 2 | No role-based route guards | Middleware queries profiles.role | Governance |
| 3 | Memory back button < 44px | min-h-[44px] | UX |
| 4 | Sidebar + filter pills < 44px | min-h-[44px] | UX |
| 5 | Progress bars no aria-label | ariaLabel prop | UX |
| 6 | Teal text low contrast | Changed to --color-text | UX |

## Key Learnings (for all future projects)

1. **900 passing tests ≠ ready to ship** — need 4 planes, not 1
2. **Never HEAD an API** — ARASAAC returns 405 for HEAD, use GET
3. **Never assume user_metadata.role** — query the canonical profiles table
4. **ZML students need ≥ 44px touch targets** — WCAG AAA, not optional
5. **Pipeline labels must be real Dutch words** — never "Afbeelding 1/2/3"
6. **Every progress bar needs aria-label** — "33%" means nothing without context
7. **Test against LIVE data, not mocks** — mocks hide broken IDs
8. **Content quality is a QA gate** — not just code quality

---

## How to reuse

```bash
# Copy 4D QA gate to any new project:
cp /Users/nico/leerspoor/scripts/qa-gate.py /new-project/scripts/
# Edit SUPABASE_URL, BASE_URL, APP at the top
# Run: python3 scripts/qa-gate.py
```

The 4D QA skill at `apex-os-core/.agents/skills/4d-qa-gate/SKILL.md`
auto-triggers for all agents in all projects when QA/testing is mentioned.
