---
schema_version: 3
template_version: 7
kind: component
id: component:MetadataList
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-31
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/MetadataList/MetadataList.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    .github/visual-baseline/manifest.json,
    scripts/check-knowledge.mjs,
    apps/storybook/rtl-audit/targets.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: [spec:AST-009]
---

# MetadataList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children` (MetadataListItem entries), `columns`, `label` (`position`, `width`), `maxNumOfItems`, `orientation`, `title`, root `BaseProps`, `ref`. |
| Behavior                | A description list of label and value pairs in one column, several columns, or a wrapping row, with an optional show more and show less toggle.    |
| End-user impact         | People scan labelled facts in a predictable grid, and assistive technology reads each label with its value.                                        |
| Builder impact          | None; the record describes shipped behavior.                                                                                                       |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                                                                         |
| Review checks           | Reject a list that is not a `dl`, a toggle without its expanded state or controlled list, an unlocalized toggle label, or overridable reflection.  |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`; WCAG 2.2 SC 1.3.1 and 4.1.2.                              |

This table is a review projection; the body below is authoritative.

## Intent

MetadataList presents read-only key and value facts as a description list. It
owns the arrangement of its entries, the label placement it passes to them, and
the optional disclosure that collapses a long list; callers own the facts.

Consumer syntax and examples belong in `MetadataList.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — one column, vertical, labels at the
  start, no collapse.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: the expanded state of the disclosure is
  uncontrolled.
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The root, its `metadata-list` target, the optional title, the `dl`, and
  the show more and show less toggle.
- Column layout, orientation, and the label position and width its entries
  read.

**Does not own / non-goals**

- Each entry's label and value markup — owned by `component:MetadataListItem`.
- The facts shown and their formatting — owned by the caller.
- Editable fields — owned by form components.

## Public concepts

| Concept        | Closed values or states            | Meaning                                                                                                   | Availability by variant/orientation/state            | Default                                                  | Owner                    | Stability | Invalid-value behavior                                              |
| -------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------------ | --------- | ------------------------------------------------------------------- |
| Columns        | `single`; `multi`; positive number | One column, auto-filling columns, or exactly N columns.                                                   | Vertical only                                        | `single`                                                 | `component:MetadataList` | Stable    | 1 acts as `single`; a number below 1 falls to the `multi` template. |
| Orientation    | `vertical`; `horizontal`           | A grid of entries, or one wrapping row of stacked entries.                                                | Always                                               | `vertical`                                               | `component:MetadataList` | Stable    | Closed union; rejected by types.                                    |
| Label position | `start`; `top`                     | Label beside its value, or stacked above it.                                                              | Vertical only                                        | `top` for `multi` or a number above 1, otherwise `start` | `component:MetadataList` | Stable    | Horizontal always stacks.                                           |
| Label width    | number (px); CSS length string     | The label track's width; on `multi` it replaces the auto-fill grid with one label and value pair per row. | Vertical with start labels, at one column or `multi` | content width                                            | `component:MetadataList` | Stable    | —                                                                   |
| Collapse       | positive number; unset             | Entries shown before a show more toggle.                                                                  | Vertical only                                        | unset                                                    | `component:MetadataList` | Stable    | Ignored when horizontal.                                            |
| Title          | ReactNode; unset                   | Content shown above the list.                                                                             | Always                                               | unset                                                    | `component:MetadataList` | Stable    | —                                                                   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR1 | MetadataList renders a root `div` carrying the `metadata-list` target, which reflects `columns` and `orientation`, holding the optional title, a `dl` of the entries, and, when the list collapses, a toggle button. The title renders above the list with a `--spacing-3` gap as plain content; it is not a heading and does not name the list.                                                                                                                                                                                                                                                                                                                                          | Current source and tests                                                |
| FR2 | Vertical, one column with start labels is a two-track grid (label `auto`, value `minmax(0, 1fr)`) with `--spacing-2` row and `--spacing-4` column gaps and baseline alignment; a label `width` replaces the label track, and on `multi` with start labels a `width` replaces the auto-fill grid with the same two tracks. One column with top labels is a single track with a `--spacing-3` gap. `multi` auto-fills 280px-minimum columns with a `--spacing-4` gap. A number N above 1 makes exactly N columns, each `1fr` with top labels or a label `auto` and value `minmax(0, 1fr)` pair with start labels, ignoring a label `width`; a number below 1 falls to the `multi` template. | Current source and tests                                                |
| FR3 | Label position defaults to `top` for `multi` or a number above 1 and to `start` otherwise (including a number below 1), and a caller `position` wins. Horizontal orientation lays entries in one wrapping row with a `--spacing-4` gap, stacks every label above its value, and ignores `columns` and `maxNumOfItems`.                                                                                                                                                                                                                                                                                                                                                                    | Current source and tests                                                |
| FR4 | When vertical and the entries exceed `maxNumOfItems`, only the first `maxNumOfItems` render, followed by a native button labelled with the localized "Show more", with `aria-expanded="false"` and `aria-controls` naming the `dl`. Activating it renders every entry and switches to "Show less" with `aria-expanded="true"`; activating it again collapses. Focus stays on the button.                                                                                                                                                                                                                                                                                                  | Current source and tests; `architecture:public-component-api`           |
| FR5 | `ref`, DOM, data, ARIA, and event props, `xstyle`, `className`, and `style` reach or compose on the root; the reflected `data-columns` and `data-orientation` replace a caller's values.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Facts.** Any MetadataListItem content may fill the list.
- **AV2 — Title.** Any ReactNode, including a caller's heading, may be the
  title.

### Representative states

| State      | Required invariant                                                   | Allowed variation |
| ---------- | -------------------------------------------------------------------- | ----------------- |
| One column | Label and value tracks; labels at the start.                         | Label width.      |
| N columns  | Exactly N columns; labels on top by default.                         | N.                |
| Horizontal | One wrapping row; labels stacked; no toggle.                         | —                 |
| Collapsed  | First `maxNumOfItems` entries; "Show more"; `aria-expanded="false"`. | Locale.           |
| Expanded   | Every entry; "Show less"; `aria-expanded="true"`.                    | Locale.           |

### Transformation and precedence order

- **ORD1 — Label position.** Horizontal → top; otherwise caller `position` →
  `top` for `multi` or a number above 1 → `start`.
- **ORD2 — Columns.** Horizontal → no grid; N above 1 → exactly N columns (N tracks with top labels, N label and value pairs with start labels); a
  start-label `width` → that label track; otherwise the static template.

### Performance and resources

- **PR1 — Local state only.** MetadataList holds one expanded flag and one
  generated id, and adds no listener, observer, timer, or measurement.

## Accessibility contract

- **AR1 — Description list semantics.** Entries are `dt` and `dd` pairs inside
  one `dl`, so assistive technology reads each label with its value
  (WCAG 2.2 SC 1.3.1).
- **AR2 — Disclosure state.** The toggle is a native button exposing its
  expanded state and the list it controls (WCAG 2.2 SC 4.1.2).
- **AR3 — Localized labels.** The toggle's text comes from the translation
  catalog, never assembled in the component.

## Design relationships

| Anatomy or state | Design requirement                          | Representation authority     | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------- | ---------------------------- | -------------- | ------------------ |
| Title            | Optional content above the list.            | Current source and docs      | Supporting     | FR1                |
| Label            | The key of each entry.                      | `component:MetadataListItem` | Supporting     | FR2, FR3           |
| Metadata         | The value of each entry.                    | `component:MetadataListItem` | Prominent      | FR2, FR3           |
| Disclosure       | Show more or show less in the accent color. | Current source and docs      | Supporting     | FR4                |

Theming: the root carries the `metadata-list` target, which reflects `columns`
and `orientation`, and each entry carries the `metadata-list-item` target
(`component:MetadataListItem`). `MetadataList.doc.mjs` names no root anatomy
part for the `metadata-list` target, so no anatomy-theming block is declared
here; the Title, value cell, and Disclosure carry no target.

## Family and system relationships

- `component:MetadataListItem` owns entry markup and reads the label position
  this record resolves.
- `architecture:component-theming-surface` owns target and anatomy mapping.
- `architecture:public-component-api` owns caller-input routing; FR5 applies
  it.
- `spec:AST-009` owns accessibility-tree evidence; the verification map names
  its gap.

## Verification map

| Contract        | Verification                                                                                                                                   | Representative states                                      | Mutation or failure expectation                                                                                                                                                                                                                                                                                                   | Audit section                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FR1, AR1        | `MetadataList.test.tsx` description-list, `dl`, and title tests; stable visual baselines `core-metadatalist--basic` (neutral and probe themes) | Items; title                                               | A missing `dl`, `dt`, or `dd`, or a missing title, fails; a changed default layout comes back changed for review. Gap: no accessibility-tree check proves the term and definition pairing (`spec:AST-009` FR3).                                                                                                                   | `audit:MetadataList/a11y`     |
| FR2, ORD2       | `MetadataList.test.tsx` numeric-column and label-width tests                                                                                   | N columns with top and start labels; `multi`; custom width | A wrong inline grid template for N columns or a label width, or a `repeat(` inline template for `multi`, fails. Gap: the static one-column and `multi` templates and the gaps have no unit check beyond the default baseline. No test covers a width beside N columns with start labels, a width on `multi`, or a number below 1. | `audit:MetadataList/layout`   |
| FR3, ORD1       | `MetadataList.test.tsx` orientation and default-position tests                                                                                 | Horizontal; omitted position; `columns={2}`                | A horizontal list without stacked labels or with a toggle, or a wrong default position, fails. No test covers `multi`'s top-label default or a number below 1's start-label default.                                                                                                                                              | `audit:MetadataList/layout`   |
| FR4, AR2, AR3   | `MetadataList.test.tsx` show more, toggle, and localization tests                                                                              | Collapsed; expanded; French catalog                        | A missing toggle, hidden entries that render, a toggle that does not expand and collapse, or English text under a French catalog fails. Gap: no test asserts `aria-expanded`, `aria-controls`, or that focus stays on the button.                                                                                                 | `audit:MetadataList/behavior` |
| FR5             | `MetadataList.test.tsx` root pass-through, event, and owned-metadata tests                                                                     | `aria-label`, `id`, data; click; colliding reflection      | A dropped attribute or handler, or a caller `data-columns` or `data-orientation` that wins, fails. Gap: no test covers `ref`, `className`, `style`, or the `xstyle` merge order.                                                                                                                                                  | `audit:MetadataList/api`      |
| PR1             | Source review                                                                                                                                  | Every state                                                | Gap: no automated check fails if MetadataList adds a listener, timer, or measurement.                                                                                                                                                                                                                                             | `audit:MetadataList/behavior` |
| Theming targets | `themingTargets.test.ts`                                                                                                                       | Root and item targets                                      | A renamed or undocumented target fails. Gap: no check fails if the side-by-side `dt` loses the `metadata-list-item` target.                                                                                                                                                                                                       | `audit:MetadataList/theming`  |
| RTL relation    | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `MetadataList / Basic`                                                | Side labels; LTR and RTL                                   | A label column that is not at the inline start of the value column fails D2.                                                                                                                                                                                                                                                      | `audit:MetadataList/i18n-rtl` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or entry markup. It links to their owners.

---

<!-- source: docs/specs/components/MetadataList/MetadataListItem.spec.md -->


# MetadataListItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `label` (a string), `children` (the value), optional `icon`, root `BaseProps`, and a `ref`.                                                |
| Behavior                | One label and value pair, rendered as a `dt` and `dd` either side by side in the list's grid or stacked inside a wrapper.                  |
| End-user impact         | People read each fact's label next to or above its value, and assistive technology pairs them.                                             |
| Builder impact          | None; the record describes shipped behavior.                                                                                               |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                                                                 |
| Review checks           | Reject a pair that is not `dt` and `dd`, a wrapper in the side-by-side layout, or caller props that move off the element carrying the ref. |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`; WCAG 2.2 SC 1.3.1.                                |

This table is a review projection; the body below is authoritative.

## Intent

MetadataListItem is one key and value entry inside a MetadataList. It owns the
entry's term and definition markup and their type; the caller owns the label,
icon, and value.

Consumer syntax and examples belong in `MetadataListItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — side by side outside a stacked list.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The entry's `dt` and `dd`, the stacked wrapper, and the `metadata-list-item`
  target that `component:MetadataList` maps.
- Label and value type, the icon slot, and where caller inputs land.

**Does not own / non-goals**

- Label position, columns, and orientation — owned by
  `component:MetadataList`.
- The label, icon, and value content — owned by the caller.

## Public concepts

| Concept | Closed values or states | Meaning                                  | Availability by variant/orientation/state | Default      | Owner                    | Stability | Invalid-value behavior |
| ------- | ----------------------- | ---------------------------------------- | ----------------------------------------- | ------------ | ------------------------ | --------- | ---------------------- |
| Label   | string                  | The entry's key.                         | Always                                    | —            | caller                   | Stable    | —                      |
| Value   | ReactNode (`children`)  | The entry's value.                       | Always                                    | —            | caller                   | Stable    | —                      |
| Icon    | ReactNode; unset        | Content shown before the label.          | Always                                    | unset        | caller                   | Stable    | —                      |
| Layout  | side by side; stacked   | Set by the parent list, not by the item. | Always                                    | side by side | `component:MetadataList` | Stable    | —                      |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR1 | Side by side (labels at the start, or outside a MetadataList), the item renders a `dt` holding the icon and label, then a `dd` holding the value, as direct children of the list's grid. The `dt` carries the `metadata-list-item` target, the `ref`, and the caller's props and styling inputs; a `data-testid` becomes `<id>-label` on the `dt` and `<id>-value` on the `dd`. Both cells are at least 24px tall and break long words. | Current source and tests                                                |
| FR2 | Stacked (labels on top, or a horizontal list), the item renders a `div` wrapper carrying the `metadata-list-item` target, the `ref`, `data-testid`, and the caller's props and styling inputs, holding the `dt` above the `dd` with a `--spacing-0-5` gap.                                                                                                                                                                              | Current source and tests                                                |
| FR3 | The label uses medium-weight body type in secondary text color; the value uses body type in primary text color. An icon sits before the label with a `--spacing-2` gap.                                                                                                                                                                                                                                                                 | Current source and docs                                                 |
| FR4 | `xstyle`, `className`, and `style` compose after component styles on the element carrying the target, and caller props reach that element after the component's own attributes.                                                                                                                                                                                                                                                         | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Content.** Any string may be the label; any ReactNode may be the
  icon or value.

### Representative states

| State        | Required invariant                                                   | Allowed variation |
| ------------ | -------------------------------------------------------------------- | ----------------- |
| Side by side | `dt` and `dd` as grid siblings; target, ref, and props on the `dt`.  | Content.          |
| Stacked      | One wrapper with the target, ref, and props, holding `dt` over `dd`. | Content.          |
| With icon    | The icon precedes the label inside the `dt`.                         | Icon.             |

### Transformation and precedence order

- **ORD1 — Layout.** The parent list's horizontal orientation or `top` label
  position → stacked; otherwise side by side.

### Performance and resources

- **PR1 — No resources.** MetadataListItem reads its parent list's label
  position and orientation and holds no state.

## Accessibility contract

- **AR1 — Term and definition.** The label is a `dt` and the value its `dd`,
  so assistive technology pairs them (WCAG 2.2 SC 1.3.1). The icon adds no
  semantics of its own.

## Design relationships

| Anatomy or state | Design requirement          | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------- | ------------------------ | -------------- | ------------------ |
| Label            | Secondary-color medium key. | Current source and docs  | Supporting     | FR1–FR3            |
| Metadata         | Primary-color value.        | Current source and docs  | Prominent      | FR1–FR3            |

Theming: the `dt` (side by side) or the wrapper (stacked) carries the
`metadata-list-item` target, which `MetadataList.doc.mjs` declares and
`component:MetadataList` maps. `MetadataListItem.doc.mjs` declares no anatomy of
its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:MetadataList` owns layout, label position, and the target
  mapping.
- `architecture:public-component-api` owns caller-input routing; FR4 applies
  it.
- `spec:AST-009` owns accessibility-tree evidence; the verification map names
  its gap.

## Verification map

| Contract     | Verification                                                                                    | Representative states             | Mutation or failure expectation                                                                                                                                                                                                                                                                                                       | Audit section                     |
| ------------ | ----------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1          | `MetadataList.test.tsx` item, label-width, and pass-through-target tests                        | Side by side                      | A missing label or value, a `dt` or `dd` that is not a direct child of the `dl`, wrong `-label` and `-value` test ids, or props or click handling that leave the `dt`, fails. Gap: no test attaches a `ref`, and the 24px minimum height has no check. No check fails if the side-by-side `dt` loses the `metadata-list-item` target. | `audit:MetadataListItem/layout`   |
| FR2          | `MetadataList.test.tsx` stacked and stacked pass-through tests                                  | Stacked                           | A missing wrapper, `dt`, or `dd`, or props that leave the wrapper, fails. Gap: the stacked gap has no check. No test attaches a `ref` to the stacked wrapper.                                                                                                                                                                         | `audit:MetadataListItem/layout`   |
| FR3          | `MetadataList.test.tsx` icon test                                                               | With icon                         | A missing icon fails. Gap: label and value type and color and the icon gap have no automated check.                                                                                                                                                                                                                                   | `audit:MetadataListItem/design`   |
| FR4          | `MetadataList.test.tsx` pass-through tests                                                      | `aria-label`, `id`, data; click   | A dropped attribute or handler fails. Gap: no test covers `className`, `style`, or the `xstyle` merge order.                                                                                                                                                                                                                          | `audit:MetadataListItem/api`      |
| AR1          | `MetadataList.test.tsx` role queries                                                            | Term and definition               | A missing `term` or `definition` role in the DOM fails. Gap: no accessibility-tree check proves the pairing (`spec:AST-009` FR3).                                                                                                                                                                                                     | `audit:MetadataListItem/a11y`     |
| PR1          | Source review                                                                                   | Every state                       | Gap: no automated check fails if MetadataListItem adds state.                                                                                                                                                                                                                                                                         | `audit:MetadataListItem/behavior` |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `MetadataList / Basic` | Side label and value; LTR and RTL | A label that is not at the inline start of its value fails D2.                                                                                                                                                                                                                                                                        | `audit:MetadataListItem/i18n-rtl` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or list layout rules. It links to their owners.
