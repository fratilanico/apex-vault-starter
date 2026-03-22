---
type: knowledge-brief
date: 2026-03-22
project: Leerspoor
tags: [accessibility, aria, screen-reader, progress-bar]
severity: serious
---

# Progress Bars Need aria-label

## Discovery

All 7 progress bars across 3 pages had `role="progressbar"` and `aria-valuenow` but NO `aria-label`. Screen readers would announce "progressbar 33%" with no context — users don't know WHAT is at 33%.

Is it lesson completion? Quiz score? Upload progress? Loading? Without an `aria-label`, a screen reader user has to guess.

## Pages Affected

| Page | Progress Bars | Context Missing |
|------|--------------|----------------|
| Student Dashboard | 3 | Goal completion, lesson progress, overall progress |
| Lesson Detail | 2 | Exercise completion, time remaining |
| Teacher Overview | 2 | Class average, student progress |

## Rule (permanent)

**Every `role="progressbar"` element MUST have `aria-label` describing what it measures.** The label should be in the application's language (Dutch for Leerspoor) and describe the metric, not the value.

Good: `aria-label="Voortgang leerdoel"` (Goal progress)
Bad: `aria-label="33%"` (this is what `aria-valuenow` already provides)
Worst: no `aria-label` at all

## Component Pattern

```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  ariaLabel: string;  // REQUIRED — no default, force developer to think
  className?: string;
}

export function ProgressBar({ value, max = 100, ariaLabel, className }: ProgressBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={className}
    >
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

// Usage:
<ProgressBar value={33} ariaLabel="Voortgang leerdoel" />
<ProgressBar value={7} max={10} ariaLabel="Voltooide oefeningen" />
```

## Common Dutch Labels

| Context | aria-label |
|---------|-----------|
| Goal progress | "Voortgang leerdoel" |
| Lesson completion | "Voortgang les" |
| Exercise completion | "Voltooide oefeningen" |
| Overall progress | "Totale voortgang" |
| Class average | "Gemiddelde van de klas" |
| Upload progress | "Upload voortgang" |
| Loading | "Laden" |

## Verification Pattern

```javascript
// Playwright check
const progressBars = await page.$$('[role="progressbar"]');
const violations = [];

for (const bar of progressBars) {
  const label = await bar.getAttribute("aria-label");
  if (!label || label.trim() === "") {
    const value = await bar.getAttribute("aria-valuenow");
    violations.push(`Progress bar with value=${value} has no aria-label`);
  }
}

if (violations.length > 0) {
  throw new Error(`Missing aria-labels:\n${violations.join("\n")}`);
}
```

## 4D QA Plane

This is a **Plane 3B: Accessibility** issue (check P3B-05: All progress bars / sliders have aria-label).

## Prevention

- Make `ariaLabel` a required prop in the ProgressBar component (no default)
- TypeScript will catch missing labels at compile time
- axe-core will flag missing labels at runtime (Plane 3B check)
- Run accessibility audit at every wave:complete
