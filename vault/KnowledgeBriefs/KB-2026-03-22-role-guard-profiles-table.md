---
type: knowledge-brief
date: 2026-03-22
project: Leerspoor
tags: [security, middleware, role-guard, supabase, rbac]
severity: critical
---

# Role Guards Must Query Profiles Table

## Discovery

Supabase `user_metadata.role` was EMPTY for all users. Role was stored in the `profiles` table. The middleware checked `user.user_metadata.role` — always undefined — so no role guard ever fired. Any logged-in user could access any dashboard.

A student could navigate to `/teacher/dashboard` and see all teacher data. A parent could see IB'er (counselor) data. This is a privacy violation in an education app handling minor students.

## Root Cause

Supabase auth stores only authentication-related metadata in `user_metadata`:
- `email_verified: true`
- `provider: "email"`
- `sub: "uuid"`

Custom application fields like `role` are NOT stored in auth metadata. Role was set during user seeding in the `profiles` table, not in the auth system. The middleware assumed role lived in `user_metadata` — a common Supabase misconception.

## Rule (permanent)

**Never assume role is in `user_metadata`. Always query the canonical source (profiles table).** The Supabase client is already instantiated in middleware — use it.

## Correct Pattern

```typescript
// middleware.ts — role guard

import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const supabase = createServerClient(/* ... */);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // WRONG — will be undefined
  // const role = user.user_metadata?.role;

  // RIGHT — query profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const role = (profile as Record<string, unknown>)?.role as string;

  // Guard: /teacher/* requires role === "teacher"
  if (req.nextUrl.pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Guard: /iber/* requires role === "iber"
  if (req.nextUrl.pathname.startsWith("/iber") && role !== "iber") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}
```

## Impact

- Student could see teacher dashboard (all student data visible)
- Parent could see IB'er dashboard (counseling notes visible)
- Any logged-in user had full access to every role's data
- Privacy violation in a minor-student education app
- Fixed by querying `profiles.role` in middleware

## 4D QA Plane

This is a **Plane 4: Governance** issue (check P4-01: Cross-role access denied).

## Detection

```bash
# Playwright security check
# Login as student → navigate to /teacher/dashboard → verify redirect/403
await page.goto("/teacher/dashboard");
expect(page.url()).not.toContain("/teacher");  // Should redirect away
```

## Prevention

- Plane 4 check P4-01 at every wave:complete
- Never trust `user_metadata` for authorization decisions
- Always verify role source during Supabase project setup
