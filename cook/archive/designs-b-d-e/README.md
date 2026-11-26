# Archived design proposals

On 2026-11-26 the owner picked A ("Próbnik") and C ("Lagom"). C was renamed to B.
The old B ("Salon"), D ("Riviera") and E ("Bottega") were removed from the site.

- `src/**`: full copies of every CSS module, `global.css`, `Document.tsx` and `DesignSwitch.tsx` as of commit `402e297`, with all five designs.
- `removed-rules.css`: only the rules that were deleted or trimmed (selectors still use the old letters).
- `../prune-designs.mjs`: the script that did the removal.

To restore one: copy its `[data-design="x"]` rules back from `src/**` (they're grouped by design banners) and re-add the letter to `Document.tsx`, `DesignSwitch.tsx` and `cook/stills.mjs`. Simplest full restore: `git checkout 402e297 -- site/src`.
