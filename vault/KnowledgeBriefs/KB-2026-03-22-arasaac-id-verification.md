---
type: knowledge-brief
date: 2026-03-22
project: Leerspoor
tags: [qa, arasaac, pictograms, data-integrity, api-verification]
severity: critical
---

# ARASAAC Pictogram ID Verification

## Discovery

32% of ARASAAC pictogram IDs in the Leerspoor database returned HTTP 500. These were fabricated round numbers (3456, 4521, 5154, etc.) that don't exist in ARASAAC's catalog.

## Root Cause

IDs were guessed/generated without API verification. HEAD requests return 405 from ARASAAC, so naive verification appeared to fail for ALL IDs — masking the real broken ones.

The failure mode was subtle: a developer writing a verification script would try HEAD (the "correct" way to check if a resource exists), see 405 for every ID, assume the API doesn't support verification, and give up. Meanwhile the actual broken IDs silently passed through.

## Rule (permanent)

**Every external API ID stored in any database MUST be verified with an actual GET request before storage.** Never HEAD. Never assume. Never use round numbers as "probably valid" IDs.

## Verification Pattern

```python
import requests

def verify_arasaac_id(pid: int) -> bool:
    """Verify a single ARASAAC pictogram ID exists."""
    try:
        r = requests.get(
            f"https://api.arasaac.org/v1/pictograms/{pid}?download=false",
            stream=True,
            timeout=10
        )
        valid = r.status_code == 200 and "image" in r.headers.get("content-type", "")
        r.close()
        return valid
    except requests.RequestException:
        return False

# Batch verification
def audit_all_ids(ids: list[int]) -> dict:
    broken = []
    for pid in ids:
        if not verify_arasaac_id(pid):
            broken.append(pid)
    return {
        "total": len(ids),
        "broken": broken,
        "broken_pct": len(broken) / len(ids) * 100 if ids else 0,
    }
```

## Impact

- Students saw broken images in lessons and games
- 10 IDs replaced with verified alternatives
- 3,723 lesson schemas regenerated with correct IDs
- Verification script added to CI pipeline (Plane 2 check P2-02)

## 4D QA Plane

This is a **Plane 2: Data Integrity** issue (check P2-02: All external API references resolve).

## Prevention

- Run `scripts/db-integrity-audit.py` before every wave:complete
- Add new IDs only through the verified insertion pipeline
- Never seed databases with unverified external IDs
