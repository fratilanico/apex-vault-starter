---
type: knowledge-brief
date: 2026-03-22
project: APEX OS (system-wide)
tags: [qa, methodology, 4d-qa, wave-formation, testing, production-readiness]
severity: critical
---

# 4D QA — Multi-Plane Quality Assurance

## Discovery

Linear QA ("tests pass -> ship") missed 6 critical and serious issues in the Leerspoor app despite 900 passing unit tests. The issues existed in 3 different planes that unit tests cannot reach:

- **Data plane:** 32% of ARASAAC IDs broken (never tested against live API)
- **Governance plane:** No role guards (never tested cross-role access)
- **UX plane:** Touch targets too small (never measured element sizes)
- **UX plane:** Missing aria-labels on progress bars (never ran accessibility audit)
- **Data plane:** Placeholder labels "Afbeelding 1/2/3" in 3,723 goals (never audited content)
- **UX plane:** Broken error handling on invalid URLs (never tested sad paths)

All 900 unit tests passed. The app rendered. Screenshots looked fine. But it was not shippable.

## The 4D Framework

Quality exists in 4 simultaneous planes. ALL must be GREEN. Not sequentially — simultaneously. Like a holographic quality check where a defect in any dimension blocks the whole.

```
                  PLANE 4: GOVERNANCE
                  (security, RLS, roles, keys, compliance)
                        |
                        |
        PLANE 1 <-------+-------> PLANE 3
        CODE QUALITY    |         USER EXPERIENCE
        (tests, types,  |         (flows, a11y,
         lint, build)   |          perf, mobile)
                        |
                        |
                  PLANE 2: DATA INTEGRITY
                  (live DB, external APIs, schemas, references)
```

| Plane | What | Example Tools | Check Count |
|-------|------|---------------|-------------|
| 1. Code Quality | Tests, types, lint, build | vitest, tsc, eslint | 7 |
| 2. Data Integrity | Live DB, external APIs, schemas, content | Python audit scripts | 10 |
| 3. User Experience | Flows, a11y, errors, performance | Playwright, axe-core | 22 |
| 4. Governance | Security, RLS, roles, secrets, XSS | Playwright security suite | 7 |
| **Total** | | | **46** |

## Wave Formation Integration

The 4D gate activates at specific wave hooks:

| Wave Hook | Planes Checked | Purpose |
|-----------|---------------|---------|
| wave:init | 1 | Baseline — tests pass before work starts |
| wave:plan | None | Planning — nothing to test |
| wave:tdd-red | 1 (RED) | New tests written, deliberately failing |
| wave:execute | 1 | Tests going GREEN as code is written |
| wave:checkpoint | 1, 2, 3D | Mid-wave health: code + data + performance |
| wave:complete | 1, 2, 3, 4 | Full gate: ALL 46 checks, blocks on failure |

## Key Anti-Patterns Exposed

| Anti-Pattern | What We Thought | What Actually Happened |
|---|---|---|
| "900 tests pass" | Ready to ship | 6 blockers in planes 2-4 |
| HEAD requests | Standard API check | ARASAAC returns 405, masking real failures |
| `user_metadata.role` | Has the user's role | Empty for all users — role in profiles table |
| "Does it render?" | Visual QA is sufficient | Broken images, wrong data, no access control |
| Mocking everything | Fast, reliable tests | Hid 32% broken IDs in production DB |
| "Afbeelding 1" labels | Placeholder, will fix later | Shipped to 3,723 goals, teachers rejected |
| Linear QA | Test then ship | Missed 3 entire planes |

## Implementation

The 4D QA gate is implemented as:

1. **SKILL.md** — `4d-qa-gate` skill in APEX OS skills engine
2. **qa-gate.py** — Unified runner script per project
3. **Playwright suites** — E2E for planes 3 and 4
4. **DB audit scripts** — Python for plane 2
5. **QA-REPORT.md** — Generated per wave:complete

## Impact on APEX OS

This methodology applies to ALL APEX OS projects, not just Leerspoor:

- **Lead-gen pipeline:** Plane 2 (data integrity of scraped candidates)
- **WhatsApp gateway:** Plane 4 (admin/customer boundary enforcement)
- **Mission Control:** Plane 3 (accessibility of ops dashboard)
- **CFO-as-a-Service:** All 4 planes (financial data = maximum scrutiny)

## Permanent Rules

1. **No ship without 4 GREEN planes.** Not 3. Not "3 and a plan for 4." All 4.
2. **Test against LIVE data.** Mocks hide production reality.
3. **GET, never HEAD.** For API verification.
4. **Query the canonical source.** For roles, permissions, any authorization data.
5. **44px minimum.** For any education/accessibility-critical app.
6. **No placeholders in production.** Audit generated content before commit.
7. **aria-label on every progressbar.** Screen readers need context.
