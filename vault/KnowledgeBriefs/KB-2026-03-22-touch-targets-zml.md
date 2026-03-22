---
type: knowledge-brief
date: 2026-03-22
project: Leerspoor
tags: [accessibility, zml, touch-targets, wcag, education]
severity: serious
---

# ZML Touch Targets Must Be >= 44px

## Discovery

Sidebar nav links were 40px tall. Back links were 20px. Filter pills were 36px. For motor-impaired ZML (special-needs) students, these are too small to tap reliably.

ZML stands for "Zeer Moeilijk Lerend" — students with severe learning disabilities who often have co-occurring motor impairments. An education app designed for this population with undersized touch targets is fundamentally inaccessible.

## WCAG Basis

WCAG 2.1 Success Criterion 2.5.5 (AAA): Target Size — the size of the target for pointer inputs is at least 44 by 44 CSS pixels. While AAA is typically aspirational, for ZML/SBO education apps it is a hard requirement given the user population.

## Rule (permanent)

**Every interactive element in a ZML/SBO education app MUST have min-height AND min-width of 44px.** This is not optional. This is not "nice to have." This is the minimum for your users to physically use the app.

## Specific Violations Found

| Element | Actual Size | Required | Status |
|---------|-------------|----------|--------|
| Sidebar nav links | 40px tall | 44px | FIXED |
| Back link (< Terug) | 20px tall | 44px | FIXED |
| Filter pills | 36px tall | 44px | FIXED |
| Icon-only buttons | 32x32px | 44x44px | FIXED |

## CSS Pattern

```css
/* For text links / nav items */
.nav-link {
  @apply min-h-[44px] min-w-[44px] px-4 py-3;
}

/* For icon-only buttons */
.icon-btn {
  @apply min-h-[44px] min-w-[44px] flex items-center justify-center;
}

/* For pill/tag filters */
.filter-pill {
  @apply min-h-[44px] px-4 py-2 flex items-center;
}

/* For inline back links */
.back-link {
  @apply min-h-[44px] inline-flex items-center py-2;
}
```

## Verification Pattern

```javascript
// Playwright check for all interactive elements
const selectors = 'button, a, [role="button"], input, select, [tabindex="0"]';
const elements = await page.$$(selectors);

const violations = [];
for (const el of elements) {
  const box = await el.boundingBox();
  if (box) {
    if (box.height < 44) {
      const text = await el.textContent();
      violations.push(`Height ${box.height}px < 44px: "${text?.trim()}"`);
    }
    if (box.width < 44) {
      const text = await el.textContent();
      violations.push(`Width ${box.width}px < 44px: "${text?.trim()}"`);
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Touch target violations:\n${violations.join("\n")}`);
}
```

## 4D QA Plane

This is a **Plane 3B: Accessibility** issue (check P3B-02: Touch targets >= 44x44px).

## Prevention

- Add `min-h-[44px] min-w-[44px]` to component library defaults
- Run touch target audit at every wave:complete
- Design system should enforce 44px minimum in Figma/design tokens
