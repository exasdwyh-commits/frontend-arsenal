---
schema_version: 3
template_version: 7
kind: component
id: component:SideNav
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-16
owners: [cixzhang]
review_triggers: [layout, behavior, accessibility]
verified_by:
  [
    packages/core/src/SideNav/SideNav.test.tsx,
    apps/storybook/stories/SideNav.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:internationalization,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-017/FR3]
---

# SideNav component contract

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

This record governs how nested SideNavItem rows are drawn: their width, where
their nesting indent sits, and what the indent area does. It covers SideNav,
SideNavSection, and SideNavItem only as far as that geometry depends on them. It
also governs the rail's own collapse motion (FR6).
SideNavItem's link and destination safety is governed by
`family:navigation-destinations`; other SideNav behavior remains described by
its source, tests, and consumer docs until a record claims it.

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `resizable` also takes useResizable's output, beside `true` and its config object (FR7); no other prop, value, or theme target changes, and omitted props behave as before.                                                                                                                                                                                             |
| Behavior                | Every SideNavItem row spans the full width of its nav list at any depth. Depth shows as inline-start indent inside the row: one `--spacing-6` step per level, added to the row's own padding. Collapsing or expanding the rail snaps the layout to its final width and clips the labels in or out; a collapse ends icons-only and an expand ends with its labels (FR6). |
| End-user impact         | A person scanning a nested nav sees hover, pressed, selected, and focus fills that line up with the top-level rows, and can click a nested row's indent to activate it, as they would its label. Collapsing the rail moves no layout frame by frame (FR6).                                                                                                              |
| Builder impact          | No new prop; `resizable` also takes useResizable's output (FR7). Icons and labels keep their per-depth position. Content placed directly inside a SideNavItem that is not itself a SideNavItem sits at the nav list edge, because the nested group adds no inset; no supported setting insets it.                                                                       |
| Compatibility/readiness | Nonbreaking change of visual direction (`spec:AST-017/FR3`). The collapsed rail and top-level rows are unchanged. Authority is current; implementation may be staged.                                                                                                                                                                                                   |
| Review checks           | Reject a nested row narrower than a top-level row, an indent drawn outside the row, an indent area that shows feedback but does not activate, a clipped focus ring, or an indent in the flyout's top level. Also reject an animated rail width (FR6).                                                                                                                   |
| Governing rules         | DD1 and FR3–FR6 below; `component:AppShell` FR17 for the content; `family:navigation-destinations` for destinations; `architecture:internationalization` for logical direction.                                                                                                                                                                                         |

This table is a review projection; the body below is authoritative.

## Intent

SideNav is the vertical navigation region of an app. SideNavItem rows can nest
to show a hierarchy of destinations. Nesting must read as one list of equal
rows, so the eye compares labels and states across depths rather than seeing a
second, narrower kind of row. SideNav owns this because only SideNavItem knows
a row's depth and its row padding.

## Compatibility and migration

- Released default preserved: `no`; nested rows change from inset to full width.
  Top-level rows and the collapsed rail are unchanged. The rail's
  collapse and expand gain FR6's motion.
- Compatibility class: nonbreaking appearance change of visual direction under
  `spec:AST-017/FR3`. `resizable` also takes useResizable's output (FR7), a
  patch `[feat]`; no other public API, accepted input, or accessibility
  semantic changes.
- Controlled/uncontrolled behavior: unchanged.
- Migration decision: none; there is no supported way to keep the inset look.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The width of every expanded SideNavItem row, at every depth.
- Where a nested row's indent sits, its step, and how it adds to the row's
  padding.
- What the indent area paints and what a click on it does.
- Whether the nested group clips its rows.
- The rail's collapse and expand motion: the snap to the final width and the
  clip that reveals or covers the labels (FR6).

**Does not own / non-goals**

- Destination acceptance, blocking, and router handoff — owned by
  `family:navigation-destinations`.
- The collapsed item's tooltip and how it attaches — owned by
  `component:SideNavItem`.
- Exact fill colors, radius, minimum row height, and row padding per size —
  owned by the shared nav item styles and the `side-nav-item` theme target;
  the shared styles take the height as a minimum, so a row grows with a
  larger text size (`spec:AST-102` FR4).
- Layout of caller content placed directly inside a SideNavItem that is not a
  SideNavItem — owned by the product callsite.
- SideNavHeading — owned by `component:SideNavHeading`; SideNavCollapseButton —
  owned by `component:SideNavCollapseButton`.
- The layout of the SideNav header, footer, and resize zones (their focus
  across a collapse is AR3).

## Public concepts

| Concept       | Closed values or states                        | Meaning                                                                                                                                                | Availability by variant/orientation/state | Default | Owner               | Stability | Invalid-value behavior |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------- | ------------------- | --------- | ---------------------- |
| Nesting depth | `0`, `1`, `2`, … (derived, not a prop)         | The number of SideNavItem ancestors of a row within the same list. A collapsed rail's flyout restarts at 0.                                            | Expanded rail; mobile drawer; flyout      | `0`     | `component:SideNav` | stable    | Not caller-settable    |
| Row size      | `sm`, `md`, `lg` (existing SideNavItem `size`) | Sets an expanded row's minimum height and every row's base inline padding; the indent adds to that padding. A collapsed rail row keeps a fixed square. | Every row                                 | `md`    | `component:SideNav` | stable    | Rejected by the type   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                                                                         | Draft review state                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1 | SideNav renders its navigation children in a scrollable list, which may be grouped by SideNavSection. A SideNavItem with children renders them, after its own row, in a group labelled by the parent's label; unless `collapsible` is `false`, the group expands and collapses and is hidden from assistive technology and inert while collapsed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source, docs, and tests                                               | Current behavior                                                                                                                               |
| FR2 | In a collapsed rail, a SideNavItem without an icon is not rendered; a leaf item renders icon-only, named by a non-blank caller `aria-label` or else its label; an item with children renders an icon-only trigger that opens a flyout listing its children as the flyout's top level.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current source, docs, and tests                                               | Current behavior                                                                                                                               |
| FR3 | In an expanded rail, in a flyout, and in the mobile navigation drawer, every SideNavItem row MUST span the full inline size of its list at any depth. A row at depth `n` MUST start its content `n` × `--spacing-6` beyond the row's own inline-start padding for its size, inside the row; the nested group MUST add no inset. A flyout's top level is depth 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `component:SideNav/DEC-1`                                                     | Settled intent; implementation may be staged                                                                                                   |
| FR4 | The indent area MUST be part of the row's target: a click there, including a modified or middle click on a link row, does what the same click on the row's primary element does. When the row also carries an independent expand toggle or `actions`, the indent belongs to the primary link or button, and the toggle and actions keep their own activation at the row's trailing edge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `component:SideNav/DEC-1`; `family:navigation-destinations`                   | Settled intent; implementation may be staged                                                                                                   |
| FR5 | An expanded nested group MUST NOT clip its rows once it has finished opening, so a nested row's focus ring paints in full. The group MAY clip while collapsed and while it opens or closes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `component:SideNav/DEC-1`                                                     | Settled intent; implementation may be staged                                                                                                   |
| FR6 | Collapsing or expanding the rail plays one motion on one clock, `spec:AST-105` FR4's one shared motion, the theme's curve tokens, never a spring: layout snaps to the final rail width at once, with no width animation, and the rail reveals or covers its labels by a clip, its edge riding the main content's glide and its labels and collapsed icons fading on the same clock (`spec:AST-105` FR9's inline two-state form; the clip and the ride are the shared edge reveal's, and SideNav's own code keeps only the fades; the rail lends no pane to its resize controller, so a collapse plays once; implementation gap: the clip and the ride still run in SideNav's own rail motion code, not in the shared edge reveal): a collapse ends in the real collapsed state, icons only, and an expand ends in the real expanded state, with its labels. On a collapse or an expand the rail's old state is one transient copy, inert and hidden from assistive technology, removed when the motion ends. On a collapse, the transient copy paints at the rail's own level, just below the rail and with no `z-index` of its own (`spec:AST-027` FR1, FR6); page content positioned above the nav also covers the leaving copy. The main content moves on the same clock, as `component:AppShell` FR17 states. A change made before the rail first paints lands at once, unless the rail's own toggle made it, so the initial state never animates. Under reduced motion the rail follows `design:reduced-motion` DR2 under a coarse primary pointer and DR3 otherwise. Collapsing or expanding keeps the nav and its items mounted, a `resizable` rail included, so item state such as an open nested group, and focus, persist (AR3 governs focus on what the collapsed rail does not render). | `component:SideNav/DEC-2`; `component:AppShell` FR17; `spec:AST-105` FR8, FR9 | Verified by `SideNavRailMotion.test.tsx` and `SideNavRailMotion.interaction.browser.spec.ts`; the `reducedMotion: 'always'` theme case pending |
| FR7 | `resizable` also takes useResizable's output, beside `true` and its config object (owner decision, 2026-11-04); the region's `autoSaveId` then saves the width. When `resizable` is the hook's output and `collapsible` sets its own collapsed state, the region wins: the rail follows the region's `isCollapsed`, the toggle calls its `collapse` and `expand`, and SideNav warns in development, as `resizable`'s keys already override `collapsible`'s. When `resizable` is the hook's output, the region's own `collapsible` option also decides whether the rail collapses; a collapsible prop that disagrees is ignored, with the same warning.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `component:Resizable` FR9                                                     | Verified by `resizableSlot.test.tsx`                                                                                                           |

### Allowed variation

- **AV1 — Depth and size.** Any depth and any row size may appear; FR3 holds for
  each row from its own size's padding.
- **AV2 — Theme tokens.** A theme that changes `--spacing-6` or the row padding
  tokens changes the step or the base with them.
- **AV3 — Row implementation.** The element that carries the indent may change
  while the painted row stays full width and the indent stays clickable.

### Representative states

| State                                 | Required invariant                                                                        | Allowed variation               |
| ------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| Depth 1–3, `md`                       | Row width equals a top-level row's; content starts one step further in per level.         | Labels, icons, selection.       |
| `sm` and `lg` nested rows             | Indent adds to that size's base padding.                                                  | Row height by size.             |
| Nested row with own link and children | Full-width row; indent is part of the link; the expand toggle stays at the trailing edge. | Collapsed or expanded children. |
| Nested row with `actions`             | Full-width row; indent is part of the primary element; actions stay at the trailing edge. | Action content.                 |
| Keyboard focus on a nested row        | The focus ring paints in full around the row.                                             | Ring style by theme.            |
| Right-to-left                         | Indent sits at the inline start (right); same widths.                                     | Writing direction.              |
| Collapsed rail                        | Icon-only items; the flyout's top level has no indent; deeper flyout levels indent.       | Flyout content.                 |

### Transformation and precedence order

- **ORD1 — Row inline-start padding.** The row's size padding, then plus depth ×
  `--spacing-6`. A caller's `style` on a nested item composes after the indent in the
  shared order (`architecture:public-component-api`): properties the caller does
  not set keep the indent, and a caller-set inline-start padding replaces it.

### Performance and resources

- **PR1 — No measurement.** Depth and indent come from composition; no
  measurement, observer, or extra render pass is added.

## Accessibility contract

- **AR1 — Presentation only.** Width and indent MUST NOT change any row's role,
  accessible name, state, DOM order, or tab order.
- **AR2 — Visible focus.** A nested row's focus indicator MUST paint in full at
  every depth (FR5).
- **AR3 — Focus leaves what the collapsed rail removes.** When the rail
  collapses and the focused element goes with it, focus moves. On a row the
  rail keeps (its link replaced, its expand toggle or row actions gone), it
  moves to that row's control. From a row the rail does not render (a row
  without an icon or a nested row, FR2), it moves to the collapse toggle
  rendered inside the SideNav, or, with none, to the nearest row the rail
  keeps, the preceding one first. A header or footer control the collapse
  re-renders under the same accessible name keeps focus. From a header or
  footer control the collapse removes or replaces under another name, or the
  resize handle, focus moves to the collapse toggle, or, with none, to the
  first row the rail keeps. Focus the collapse does not take is not moved (WCAG 2.2
  SC 2.4.3).

## Design relationships

| Anatomy or state | Design requirement                                                 | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| Navigation items | Nested rows read as equal rows of one list; depth reads as indent. | Owner choice (DD1)       | Prominent      | FR3–FR5            |

### Design decisions

<!-- design-decisions:v1 -->

| ID  | Decision                                                                                                                                                                                                         | Intent or reason                                                                                                                                                                                            | Applies to                                                                                         | Allowed variation                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| DD1 | Every SideNavItem row spans the full width of its nav list at any depth; nesting shows as indent inside the row, ahead of its content. Hover, pressed, selected, and focus paint the whole row, indent included. | Fills line up across depths, so the nav reads as one list of equal rows while labels keep their per-level alignment; the indent belongs to the row's primary target rather than sitting beside it as a gap. | SideNavItem rows at every depth, at rest and through hover, pressed, selected, disabled, and focus | Themes restyle fill, radius, and padding through the `side-nav-item` target; the step follows `--spacing-6`. |

## Family and system relationships

- `family:navigation-destinations` owns the accept/block result for a
  SideNavItem `href`; the indent area activates the same destination the primary
  element does (FR4).
- `architecture:internationalization` owns logical direction; the indent is
  inline-start and mirrors under right-to-left.
- `architecture:interaction-modality` owns shared focus-visible behavior; FR5
  keeps the ring visible at every depth.
- `architecture:component-theming-surface` owns the `side-nav-item` target;
  this record adds no target or state.
- `architecture:public-component-api` owns how caller styling inputs compose;
  ORD1 places the indent before a caller's `style`.
- `spec:AST-017/FR3` classifies the change as a nonbreaking change of visual
  direction.
- `component:TreeList` DD1–DD3 record the same row geometry for TreeList. They
  are precedent, not authority here; each component owns its own rows.

## Verification map

| Contract  | Verification                                                                                                                                                                                                                                                                                                  | Representative states                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Audit section            |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1, FR2  | `SideNav.test.tsx` nesting, collapsible, and collapsed-rail suites                                                                                                                                                                                                                                            | Nested, collapsible, collapsed rail, flyout                                                                                                                                                                                                                                                                                                                                                                                                                              | Removing the labelled group, its collapsed inert state, or the collapsed icon-only and flyout paths fails.                                                                                                                                                                                                                                                                                                                                                                                                                                    | `audit:SideNav/anatomy`  |
| FR3, ORD1 | Focused `SideNav.test.tsx` indent coverage, required with implementation                                                                                                                                                                                                                                      | Depth 1 and 2; `sm` and `md`; split and actions rows; caller `style`; flyout                                                                                                                                                                                                                                                                                                                                                                                             | A group inset, a missing or wrong indent, a dropped caller `style`, an indent that overrides a caller-set inline-start padding, or an indented flyout top level fails.                                                                                                                                                                                                                                                                                                                                                                        | `audit:SideNav/layout`   |
| FR3, DD1  | Real-browser geometry over the SideNav nested stories                                                                                                                                                                                                                                                         | Depths 1–3; `sm`, `md`, `lg`; light and dark; right-to-left; mobile drawer                                                                                                                                                                                                                                                                                                                                                                                               | A nested row's box narrower than a top-level row's, or a label moved from its per-depth position, fails.                                                                                                                                                                                                                                                                                                                                                                                                                                      | `audit:SideNav/layout`   |
| FR4       | Real-browser click in the indent area of plain, split, and actions rows                                                                                                                                                                                                                                       | Link and button rows; plain, modified, and middle clicks; nested rows with toggle and actions                                                                                                                                                                                                                                                                                                                                                                            | A click in the indent that does nothing or differs from the same click on the primary element, or a toggle or action that activates the row, fails.                                                                                                                                                                                                                                                                                                                                                                                           | `audit:SideNav/behavior` |
| FR5, AR2  | `SideNav.test.tsx` group clipping case and real-browser keyboard focus on nested rows                                                                                                                                                                                                                         | Only-child and last nested rows; after opening; collapsed                                                                                                                                                                                                                                                                                                                                                                                                                | A focus ring cut at any edge of an expanded group, or an expanded group that still clips, fails.                                                                                                                                                                                                                                                                                                                                                                                                                                              | `audit:SideNav/a11y`     |
| FR2, FR3  | Real-browser collapsed rail and flyout                                                                                                                                                                                                                                                                        | Collapsed rail with nested children                                                                                                                                                                                                                                                                                                                                                                                                                                      | Any change to the collapsed rail, or an indent on the flyout's top level, fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `audit:SideNav/layout`   |
| AR1       | Accessibility-tree comparison of nested rows                                                                                                                                                                                                                                                                  | Plain, split, and actions rows                                                                                                                                                                                                                                                                                                                                                                                                                                           | Any change in role, name, state, or order fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `audit:SideNav/a11y`     |
| FR6       | `SideNavRailMotion.test.tsx`; `SideNavRailMotion.interaction.browser.spec.ts` frames of a collapse and an expand under a finger and a mouse, and of a second click after a long task (the `reducedMotion: 'always'` theme case pending); `SideNav.test.tsx` "keeps its items mounted across a collapse" suite | collapse and expand; a mouse and a finger; Reduce Motion under a coarse and under a fine primary pointer; a theme with `reducedMotion: 'always'`; a second toggle while the motion runs, and one after a long task; an app's change before the rail's first paint and after it, and the rail's own toggle before it; an open nested group across a collapse and an expand, plain and `resizable`                                                                         | an animated width, a collapse that does not end icons-only, an expand that does not end with its labels, a rail copy reachable by assistive technology or left after the motion ends, a reversal whose fades start behind its edge, travel under Reduce Motion, anything but an opacity-only change of 200 ms or less under Reduce Motion on a coarse pointer (DR2), or any animated property under Reduce Motion on a fine pointer (DR3) fails A nested group that closes, or item state that resets, across a collapse and an expand fails. | `audit:SideNav/behavior` |
| AR3       | `SideNav.test.tsx` collapse-focus suite; `SideNavCollapseFocus.a11y.chromium.spec.ts`; gap: a rail with no collapse toggle and no row it keeps has no destination, so focus there still falls to the page                                                                                                     | Focus on an icon-less row with and without a toggle, also in a resizable SideNav; a nested row and a kept row's action without a toggle; a kept row's replaced link with a toggle; a footer control, the toggle and Enter on the resize handle in a resizable SideNav; an icon-less heading link the collapse removes; a heading link whose subheading the collapsed rail drops, in a resizable SideNav; focus outside the nav; focus on a row the rail keeps; expanding | Focus left on the page body, a move to anything but the kept row's own control, the same header or footer control under the same name, the in-nav toggle, or the nearest kept row (preceding first; the first from a removed header or footer control or the resize handle), or a move of focus the collapse did not take, fails.                                                                                                                                                                                                             | `audit:SideNav/a11y`     |
| FR7       | `resizableSlot.test.tsx` SideNav cases                                                                                                                                                                                                                                                                        | The region alone; the region with `collapsible` setting `isCollapsed`, or disagreeing with the region's own `collapsible`                                                                                                                                                                                                                                                                                                                                                | A rail that ignores the region's width, collapse state or `collapsible` option, a toggle that misses the region, or no development warning fails                                                                                                                                                                                                                                                                                                                                                                                              | `audit:SideNav/behavior` |

## Decision log

<!-- Record the boundary or requirement, not how it was reached. A rejected alternative is at most one line here, kept only when it is consequential and likely to recur. -->

### DEC-1 — Nested rows are full width; depth is indent inside the row

**Reference:** `component:SideNav/DEC-1`
**Decider:** cixzhang, 2026-10-16

A nested row that starts at its indent paints its fills from a different edge
than the rows above it, so it reads as a different, narrower component. A row that
spans the full width with its indent inside lines up every fill and keeps each
label at its per-depth position. The indent is part of the row's primary
target, so it acts as well as lights up. Full-width rows reach the nested group's
edges, so an open group must not clip them, or their focus ring is cut off.

Rejected: indenting the nested group from outside the rows, because fills then
start at a different edge per depth.

### DEC-2 — The rail collapses by snap, clip, and cross-fade

**Reference:** `component:SideNav/DEC-2`
**Decider:** `cixzhang`, `2026-10-27`

Animating the rail's width relays out the whole shell every frame. Snapping
the layout to its final width, revealing or covering the rail by a clip, and
cross-fading the content's old and new wrap on one shared clock moves only
composited layers, and the rail ends in its real collapsed state.

Rejected: animating the rail's width.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/SideNav/SideNavCollapseButton.spec.md -->


# SideNavCollapseButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `SideNavCollapseButton` with `collapsible` (`{isCollapsed, onCollapsedChange}`), `handleRef` (deprecated), `label`, `size`, and `children` (replacement icon).                                                            |
| Behavior                | An icon-only ghost Button that toggles the SideNav rail between expanded and collapsed, inside SideNav or anywhere else on the page. It renders nothing when collapse is unavailable or AppShell is in its mobile layout. |
| End-user impact         | Users collapse and expand the side rail with one named button whose chevron points the right way in either writing direction.                                                                                             |
| Builder impact          | None.                                                                                                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap (see Current-state impact).                                                                                                                            |
| Review checks           | Reject a caller `onClick` that replaces the toggle, a button rendered in AppShell's mobile layout, or a chevron that does not mirror in right-to-left.                                                                    |
| Governing rules         | `architecture:public-component-api` INV7; `design:bidirectionality` DR4; `component:Button`.                                                                                                                              |

This table is a review projection; the body below is authoritative.

## Intent

SideNavCollapseButton is the control that collapses and expands the SideNav
rail. It owns where its collapse state comes from, its name, and its chevron.
Consumer usage lives in `SideNavCollapseButton.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: reads state from `collapsible`, else the
  deprecated `handleRef`, else the enclosing SideNav (FR1)
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Reduced motion on touch changes at once.** Under reduced motion the
  chevron's rotation changes at once on every pointer; `design:reduced-motion`
  DR2 has a touch-screen change cross-fade within 200 ms.

## Ownership boundary

**Owns**

- The state source, visibility, name, toggle, and chevron (FR1–FR5).

**Does not own / non-goals**

- The rail's collapse, resize, and persistence behavior — owned by SideNav.
- Button rendering, sizes, and focus ring — owned by `component:Button`.

## Public concepts

| Concept      | Closed values or states                                    | Meaning                                   | Availability by variant/orientation/state | Default           | Owner                             | Stability                      | Invalid-value behavior |
| ------------ | ---------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- | ----------------- | --------------------------------- | ------------------------------ | ---------------------- |
| State source | `collapsible`, `handleRef` (deprecated), enclosing SideNav | Where collapse state is read and toggled. | Everywhere.                               | Enclosing SideNav | `component:SideNavCollapseButton` | Stable; `handleRef` deprecated | Not applicable.        |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | State comes from `collapsible` when given (always collapsible; toggling calls `onCollapsedChange` with the opposite of `isCollapsed`), else from the SideNav that the deprecated `handleRef` points at, else from the enclosing SideNav.                                                                                                                                                                                                            | Current source and tests |
| FR2 | It renders nothing when the state source is not collapsible or AppShell reports its mobile layout.                                                                                                                                                                                                                                                                                                                                                  | Current source and tests |
| FR3 | It renders an icon-only ghost Button named by `label`, else by the translated `@astryx.sideNavCollapseButton.collapseSidebar` or `.expandSidebar` for the current state, at `size`, with the forwarded `ref` and other props.                                                                                                                                                                                                                       | Current source and tests |
| FR4 | A caller `onClick` runs, then the toggle; a caller `onClick` that calls `preventDefault()` cancels the toggle for that click.                                                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR5 | The default icon is a chevron pointing toward the inline start while expanded and turned while collapsed; it mirrors in right-to-left; its rotation animates only without a reduced-motion preference; under reduced motion it changes at once for a fine pointer, and on a touch screen it MUST cross-fade within 200 ms (`design:reduced-motion` DR2, DR3). Implementation gap: on a touch screen it also changes at once. `children` replace it. | Current source           |

### Allowed variation

- **AV1 — Icon.** `children` may replace the chevron.

### Representative states

| State                  | Required invariant                                 | Allowed variation |
| ---------------------- | -------------------------------------------------- | ----------------- |
| Inside SideNav         | Toggles that SideNav.                              | —                 |
| Outside with handleRef | Toggles the referenced SideNav.                    | —                 |
| Controlled             | Calls `onCollapsedChange`; state follows the prop. | —                 |
| Mobile layout          | Not rendered.                                      | —                 |

### Transformation and precedence order

- **ORD1 — State source.** FR1's order.
- **ORD2 — Name.** `label`, then the state-dependent default.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named control.** The button always has a name describing its action
  (FR3).

## Design relationships

| Anatomy or state | Design requirement                    | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------- | ------------------------ | -------------- | ------------------ |
| Chevron          | Points toward the collapse direction. | Current source           | Supporting     | FR5                |

`SideNavCollapseButton.doc.mjs` declares no anatomy of its own, so no
anatomy-theming map is recorded.

## Family and system relationships

- `component:Button` renders the control.
- `design:bidirectionality` DR4 governs the chevron's mirroring.

## Verification map

| Contract       | Verification                                                                                                                       | Representative states                                                     | Mutation or failure expectation                                          | Audit section                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| FR1, FR2       | `SideNav.test.tsx` handleRef, outside-button, and collapse-ownership tests                                                         | Inside, handleRef, controlled                                             | A stale or wrong state source fails.                                     | `audit:SideNavCollapseButton/behavior`      |
| FR1, FR3, ORD2 | `SideNav.test.tsx` outside-button and controlled-collapsible tests                                                                 | Own `collapsible`; `label` override; expanded and collapsed default names | A wrong state source, an ignored `label`, or a stale default name fails. | `audit:SideNavCollapseButton/accessibility` |
| FR4            | `SideNav.test.tsx` consumer onClick test                                                                                           | Outside with handleRef                                                    | A replaced toggle fails.                                                 | `audit:SideNavCollapseButton/behavior`      |
| FR3            | `SideNav.test.tsx` footer icon row sizing tests                                                                                    | Built-in button; explicit `size` outside the nav                          | A Button-default size or an ignored explicit size fails.                 | `audit:SideNavCollapseButton/behavior`      |
| RTL relation   | RTL audit automatic D1 on `SideNav / Collapsible sidebar`, routed by a route-only entry in `apps/storybook/rtl-audit/targets.json` | The collapse button's chevron; LTR and RTL                                | A chevron that does not mirror fails D1.                                 | `audit:SideNavCollapseButton/i18n-rtl`      |

Read from source, with no focused test yet:

- FR2: rendering nothing when the state source is not collapsible or AppShell
  is in its mobile layout.
- FR3: the ghost variant and the forwarded `ref`.
- FR4: that the caller `onClick` runs before the toggle, and its
  `preventDefault()` cancellation.
- FR5.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples. It links to their
owners.

---

<!-- source: docs/specs/components/SideNav/SideNavHeading.spec.md -->


# SideNavHeading component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `SideNavHeading` with `icon`, `heading`, `superheading`, `subheading`, their `*Href` links, `headerEndContent`, `menu`, and `as`; target `side-nav-heading`.                                                                       |
| Behavior                | The product identity block at the top of SideNav. Which parts are links and which part opens the menu follows from the `*Href` props and `menu`; in a collapsed rail it is an icon-only link, menu button, or icon with a tooltip. |
| End-user impact         | Users reach product, suite, and account destinations and a product menu, in both the expanded and the collapsed rail; screen-reader users hear named links, a named trigger, and a named menu.                                     |
| Builder impact          | None.                                                                                                                                                                                                                              |
| Compatibility/readiness | Shipping FR5 delays the first hover-open for mouse and pen users; no public API change. Seven implementation gaps (see Current-state impact).                                                                                      |
| Review checks           | Reject a collapsed icon without a name, a menu popup wrapped in a modal dialog, a heading button inside `role="menu"`, or `headerEndContent` rendered inside the whole-heading link.                                               |
| Governing rules         | `architecture:public-component-api` INV5; `architecture:interaction-modality`; `family:navigation-destinations`.                                                                                                                   |

This table is a review projection; the body below is authoritative.

## Intent

SideNavHeading presents the product's icon and name, with optional suite and
account lines, at the top of SideNav. It owns how those parts become links or a
menu trigger, the product menu popover, and the collapsed-rail form. Consumer
usage lives in `SideNavHeading.doc.mjs`.

## Compatibility and migration

- Released default preserved: `no`; shipping FR5 delays the first hover-open
  for mouse and pen users
- Compatibility class: records shipped behavior except FR5's first-open delay;
  no public API change
- Controlled/uncontrolled behavior: the menu's open state is internal
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Heading menu entry delay (FR5).** The menu opens on the first hover with
  no entry delay. FR5 requires the shared delay, with no wait only for a
  hand-off from another open menu in the same navigation.

- **Some configurations drop DOM props.** Other DOM props passed to
  SideNavHeading (beyond `data-testid`, `className`, `style`, `xstyle`, and
  `ref`) reach no element in the menu configurations and in the collapsed link
  and menu-button forms. `architecture:public-component-api` INV5 requires
  accepted DOM, data, ARIA, and event inputs to reach the owning element.

- **NavHeadingMenu nests a second menu.** The heading wraps `menu` in its own
  `role="menu"`; NavHeadingMenu, the documented `menu` content, adds another
  `role="menu"` inside it. WAI-ARIA 1.2 allows a `menu` to own only
  `menuitem`-family items and groups.
- **Links nested in the popover's heading button.** In the expanded
  links-plus-trigger configuration, the popover's heading button repeats the
  superheading, heading, and subheading links inside itself, so interactive
  content is nested inside a button. HTML forbids interactive content inside a
  `<button>`.
- **The open menu repeats the identity row.** While the menu is open, its
  heading button repeats the icon and text that stay mounted in the rail's block,
  so that content renders twice. `architecture:component-style-authoring` INV7
  has content render once.
- **Links in the links-plus-trigger form also open the menu.** The block that
  holds the links carries the menu's trigger handlers. With touch or the
  keyboard, activating the heading or suite link both navigates and opens the
  menu, moving focus to its first item. With a mouse, moving the pointer onto
  the block opens the menu at once over it, so a click lands on the menu's heading button, with its repeated links, rather than on the link underneath. Both break FR2's split between
  the links and the menu trigger.
- **End content also opens the menu.** In both menu configurations
  `headerEndContent` renders inside the block that carries the menu's trigger
  handlers. With touch or the keyboard, activating a control there runs that
  control and also opens the menu, moving focus to its first item. With a mouse,
  moving the pointer onto the links or end content opens the menu at once over
  the whole block, so a click on end content lands on the menu's heading button
  and the menu reopens under the pointer. A control in end content is the
  caller's, outside FR2's trigger area.

## Ownership boundary

**Owns**

- The identity block and its link and trigger configurations (FR1–FR4,
  FR11).
- The product menu popover (FR5–FR7).
- The collapsed-rail form (FR8) and the focus outline (FR9).

**Does not own / non-goals**

- Destination acceptance and blocking — owned by
  `family:navigation-destinations`.
- Menu content — owned by the caller (typically NavHeadingMenu).
- The rail's collapsed state — owned by SideNav.

## Public concepts

| Concept       | Closed values or states                                                                              | Meaning                                          | Availability by variant/orientation/state | Default | Owner                      | Stability | Invalid-value behavior |
| ------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------- | ------- | -------------------------- | --------- | ---------------------- |
| Configuration | plain, whole link, whole link with end content, independent links, whole trigger, links plus trigger | Derived from the `*Href` props and `menu` (FR2). | Expanded rail.                            | Plain   | `component:SideNavHeading` | Stable    | Not applicable.        |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Basis                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1  | In an expanded rail the block carries `side-nav-heading` and shows the icon, a text column (superheading, a heading row, subheading; plain-text lines and the menu-configuration heading link stay on one line with ellipsis, while lines rendered through the Link component wrap), and `headerEndContent`. With `menu`, the heading row holds the heading then the chevron button; without `menu` there is no chevron.                                                                                                                                                                                                                                                                              | Current source and tests |
| FR2  | `headingHref` alone without `menu` makes the icon and text one link; with `headerEndContent` that content sits beside the link, not inside it. Other `*Href` props without `menu` make each line with an href its own link, and a linked icon is named by `heading`. `menu` without hrefs makes the whole block, apart from `headerEndContent`, open the menu; `menu` with hrefs makes each line with an href its own link, and the chevron button and the rest of the block, apart from `headerEndContent`, open the menu.                                                                                                                                                                           | Current source and tests |
| FR3  | The icon link, the whole-heading link, and the menu-configuration heading link use the `as` component, else the `LinkProvider` link, else `<a>`. Supporting lines, and the heading line in the independent-links configuration, use the Link component, which does not receive `as`.                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source and tests |
| FR4  | The chevron button is named by `@astryx.sideNav.heading.openMenu` and is the popover's trigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR5  | On a hover-capable pointer, a first hover-open waits the menu hover delay (150 ms by default, as in `TopNavMenu`), and moving to it from another open menu in the same navigation opens it at once (`architecture:interaction-modality` INV11; owner decision, Nov 6 2026 (Cindy); proposed in `design:motion` DEC-1). A hover-open does not move focus. A click opens it and moves focus to the first menu item; a click within 500 ms of a hover-open keeps it open; Escape closes it and returns focus to the trigger.                                                                                                                                                                             | Cindy, 2026-11-06        |
| FR6  | The menu is a non-modal popover below the block, aligned to its start; in the expanded rail it overlaps the block. It contains a heading button that closes the menu (see Current-state impact for its content), then a `role="menu"` named by `heading` that holds `menu`.                                                                                                                                                                                                                                                                                                                                                                                                                           | Current source and tests |
| FR7  | Only the collapsed menu form gives `menu` descendants the close action NavMenu items call on selection; the expanded menu forms do not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current source           |
| FR8  | In a collapsed rail, without `icon` it renders nothing. With `icon`: `headingHref` makes an icon-only link named by `heading`; else `menu` makes an icon-only button named by `heading` that is the native invoker of its menu popover; else the icon renders alone. Each form shows a tooltip with `heading` at the inline end; `headerEndContent` and the chevron are hidden.                                                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR9  | Every focusable part paints the shared focus outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source and tests |
| FR10 | In the product menu's `role="menu"` region, a press (finger, pen or mouse) that lands on an enabled item and slides across the items acts on the one it lifts on, once, through that item's own activation, with the highlight following the pointer; a lift outside acts on nothing, and a mouse released outside closes the menu. The menu adopts `module:DropdownMenu/useMenuPress` for this (`family:action-groups` FR1–FR5; `module:DropdownMenu/useMenuPress` DEC-7). A press on caller content that is not an item, and a Ctrl-, Cmd- or Shift-click or a middle click on a link item, stays that content's or the browser's own, and keyboard and assistive-technology behavior is unchanged. | Current source and tests |
| FR11 | In both menu configurations, the chevron button's accessible name contains the visible `heading`, so a person who identifies the control by the product or workspace name they see hears that name (`family:buttons` FR1; WCAG 2.2 Label in Name). The name is one translated message, `@astryx.sideNav.heading.openMenu`, that takes `heading`: "Acme, Open menu" in English for the heading "Acme". Every shipped locale's message carries `{heading}` unchanged.                                                                                                                                                                                                                                   | Current source and tests |

### Allowed variation

- **AV1 — Lines.** Any combination of lines may be present; the block keeps its
  order.

### Representative states

| State                       | Required invariant                                | Allowed variation |
| --------------------------- | ------------------------------------------------- | ----------------- |
| Whole link with end content | End content beside the link.                      | —                 |
| Menu, no hrefs              | Whole block triggers; named chevron button.       | Menu content.     |
| Menu with hrefs             | Links; chevron and the rest of the block trigger. | —                 |
| Collapsed with menu         | Named icon button; flyout menu; tooltip.          | —                 |
| Collapsed without icon      | Nothing renders.                                  | —                 |

### Transformation and precedence order

- **ORD1 — Collapsed form.** `headingHref`, then `menu`, then plain icon.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named icons.** A linked or button icon without visible text is named
  by `heading`.
- **AR2 — Menu semantics.** The popup is not a modal dialog; `role="menu"` wraps
  only the menu content.

## Design relationships

| Anatomy or state | Design requirement                              | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Icon             | Leading product mark; alone when collapsed.     | Current source and public docs | Prominent      | FR1, FR8           |
| Heading lines    | Superheading, heading, subheading.              | Current source and public docs | Prominent      | FR1                |
| Menu popover     | Overlaps the block; a heading button closes it. | Current source                 | Supporting     | FR6                |

`SideNavHeading.doc.mjs` declares no anatomy of its own, so no anatomy-theming
map is recorded.

## Family and system relationships

- `family:overlay-dismissal` owns Escape and close-request ordering for this
  component's popover.
- `family:navigation-destinations` owns the accept/block decision for each
  `href`.
- NavHeadingMenu items close this menu where the close action is provided
  (FR7).

## Verification map

| Contract     | Verification                                                                                                                                                                                                                                                           | Representative states                                                            | Mutation or failure expectation                                                                                                      | Audit section                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| FR1–FR4, AR1 | `SideNav.test.tsx` SideNavHeading and headerEndContent suites                                                                                                                                                                                                          | Each configuration                                                               | Wrong element, unnamed link, or misplaced end content fails.                                                                         | `audit:SideNavHeading/behavior`      |
| FR5          | `SideNav.test.tsx` SideNavHeading hover/click guard suite. Evidence gap: no test of the first-open delay or the hand-off                                                                                                                                               | Hover, click, late click, Escape                                                 | Lost guard or focus return fails.                                                                                                    | `audit:SideNavHeading/behavior`      |
| FR6, AR2     | `SideNav.test.tsx` menu popover semantics suite                                                                                                                                                                                                                        | Whole trigger; mixed; collapsed                                                  | A dialog wrapper or misplaced menu role fails.                                                                                       | `audit:SideNavHeading/accessibility` |
| FR8          | `SideNav.test.tsx` SideNavHeading collapsed suite                                                                                                                                                                                                                      | Link, menu, plain, no icon                                                       | Missing name, tooltip, or invoker fails.                                                                                             | `audit:SideNavHeading/behavior`      |
| FR9          | `SideNav.test.tsx` focus ring suite                                                                                                                                                                                                                                    | Whole-heading link, collapsed link, menu trigger                                 | A missing shared ring class fails.                                                                                                   | `audit:SideNavHeading/accessibility` |
| FR10         | `SideNav.test.tsx` SideNavHeading menu-popover suite (touch and mouse slides)                                                                                                                                                                                          | Touch and mouse slides across items; a caller button and link; a release outside | Removing the adoption fails the slide tests.                                                                                         | —                                    |
| FR11         | `SideNav.test.tsx` SideNavHeading cases "includes the visible heading in the menu trigger name without hrefs", "includes the heading in the translated menu trigger name" (Korean catalog), and "renders chevron as separate trigger when menu and hrefs are provided" | Whole trigger; links plus trigger; a translated locale                           | A name without the heading, or a translated name that drops it, fails.                                                               | `audit:SideNavHeading/accessibility` |
| RTL relation | RTL audit curated D2 and D8 targets (`apps/storybook/rtl-audit/targets.json`) on `SideNav / Default`                                                                                                                                                                   | Heading icon and title, with 0px start and 8px end padding; LTR and RTL          | An icon that is not at the inline start of the title, or an end padding that stays on the same physical side in RTL, fails D2 or D8. | `audit:SideNavHeading/i18n-rtl`      |

Read from source, with no focused test yet:

- FR1: the forwarded `ref`, the `side-nav-heading` target, the order of parts,
  and one-line truncation.
- FR2: that the rest of the block opens the menu in the links-plus-trigger
  configuration.
- FR3: `as` on the icon and menu-configuration heading links, and the Link
  component for the other lines.
- FR5: the click guard, Escape, and focus return. Its first-open delay is an
  implementation gap.
- FR6: the popover's placement and the menu's name.
- FR7; FR8's tooltip placement at the inline end; and FR9 on the popover's
  heading button and the linked icon.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, or popover
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/SideNav/SideNavItem.spec.md -->


# SideNavItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `SideNavItem` with `label`, `href`, `as`, `onClick`, `icon`, `selectedIcon`, `isSelected`, `isDisabled`, `endContent`, `actions`, `children`, `collapsible`, and `size`; target `side-nav-item` with `size`, `selected`, and `disabled` states.               |
| Behavior                | One SideNav row: a link or button with optional icon and passive end content, optional row-level actions beside it, and optional nested children that can expand and collapse. In a collapsed rail it is icon-only with a tooltip or a flyout.                |
| End-user impact         | Users see and hear the current page, reach row actions before nested items, expand or collapse groups without navigating, and return to the page after choosing a destination in the mobile drawer.                                                           |
| Builder impact          | None.                                                                                                                                                                                                                                                         |
| Compatibility/readiness | Records shipped behavior; no public change. Three implementation gaps (see Current-state impact).                                                                                                                                                             |
| Review checks           | Reject an interactive control rendered inside the primary element, a link that also toggles collapse, a toggle or action that activates the row, collapsed children that stay reachable, or a drawer activation that leaves the drawer open after navigating. |
| Governing rules         | `component:SideNav` FR1–FR5, DD1 (nesting and row geometry); `family:navigation-destinations`; `architecture:interaction-modality`; `architecture:public-component-api`.                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

SideNavItem is one destination or group row in SideNav. It owns the row's
primary element, its selected and disabled states, its icon swap, the
placement of passive end content and row-level actions, the expand and collapse
behavior of its nested children, its collapsed-rail tooltip and flyout
interaction, and closing the mobile drawer on activation. Consumer usage lives
in `SideNavItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: nested children start expanded and the item
  owns that state unless `collapsible.isCollapsed` is defined; a controlled item
  reports toggle intent through `onCollapsedChange` and flips only when the prop
  changes (FR6)
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A disabled parent stays operable in a collapsed rail.** In a collapsed rail,
  a disabled item with children renders its flyout trigger with neither
  `disabled` nor `aria-disabled`, so it keeps its tab stop and announces no
  disabled state; a click does nothing, while Enter opens its flyout. `spec:AST-085` FR2 and
  FR5 have a disabled control block activation and expose its disabled state.
- **A disabled split row's toggle answers only the keyboard.** On a disabled
  item with `href` or `onClick` and children, the expand toggle inherits the
  row's pointer blocking but carries neither `disabled` nor `aria-disabled`, so
  a click does nothing while Tab reaches it and Enter collapses the group. Its
  pointer and keyboard behavior disagree, and its disabled state is not exposed
  (`spec:AST-085` FR5). OQ1 asks whether a disabled item's children stay
  expandable.
- **Reduced motion on touch changes at once.** Under reduced motion the
  chevron's rotation and the group's height change at once on every pointer;
  `design:reduced-motion` DR2 has a touch-screen change cross-fade within
  200 ms.

## Ownership boundary

**Owns**

- The primary element, states, icons, end content, and actions placement
  (FR1–FR5).
- Expand and collapse of nested children, including the independent toggle
  (FR6, FR7).
- Collapsed-rail tooltip and flyout interaction (FR8, FR9).
- Mobile drawer close on activation (FR10).
- Focus outline and reduced-motion behavior (FR11, FR12).

**Does not own / non-goals**

- The nested group's labelling, its collapsed inert state, collapsed-rail
  rendering rules, row width, indent, indent target, and group clipping — owned
  by `component:SideNav` FR1–FR5 and DD1.
- Destination acceptance and blocking — owned by
  `family:navigation-destinations`.
- The rail's collapsed state — owned by SideNav and `component:SideNavCollapseButton`.
- Each control placed in `actions` — owned by that control (name, keyboard,
  disabled state).
- Row fill colors, radius, minimum height, and padding per size — owned by the
  shared nav item styles, which take the height as a minimum, and the
  `side-nav-item` target.

## Public concepts

| Concept     | Closed values or states                                                 | Meaning                                                                | Availability by variant/orientation/state | Default               | Owner                   | Stability | Invalid-value behavior    |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | --------------------- | ----------------------- | --------- | ------------------------- |
| Collapsible | `false`, `true`, `{defaultIsCollapsed, isCollapsed, onCollapsedChange}` | Whether and how nested children expand and collapse.                   | Items with children, expanded rail.       | Collapsible, expanded | `component:SideNavItem` | Stable    | Ignored without children. |
| Row shape   | whole-row, split (link or `onClick` plus toggle), with actions          | Derived from `href`/`onClick`, children, `collapsible`, and `actions`. | Expanded rail and drawer.                 | Whole-row             | `component:SideNavItem` | Stable    | Not applicable.           |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Basis                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1  | The primary element is the `as` component, else the `LinkProvider` link, else `<a>`, when `href` is set and the item is enabled; otherwise a `<button type="button">`. A disabled item stays focusable with `aria-disabled="true"`, keeps its tab stop, and keeps focus when it becomes disabled (`spec:AST-085` FR1, FR4). It shows the icon (`selectedIcon` when selected and given), the label, `endContent`, and, for a whole-row collapsible item, a chevron. `endContent` is passive and renders inside the primary element.                                                                                                                                          | Current source and tests |
| FR2  | In an expanded rail and on a collapsed leaf, `isSelected` sets `aria-current="page"` on the primary element, never on a row wrapper. A collapsed parent's flyout trigger carries no `aria-current`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current source and tests |
| FR3  | A disabled item does not fire `onClick` or navigate. Its row actions stay operable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current source and tests |
| FR4  | `actions` render as siblings of the primary element at the row's trailing edge, after the toggle and before nested children in DOM and focus order, at the row's control size (`sm`) unless a control sets its own (`architecture:component-size-cascade`). Clicking an action neither activates nor toggles the row. A row wrapper exists only when there are actions or an independent toggle; a falsy `actions` adds none.                                                                                                                                                                                                                                               | Current source and tests |
| FR5  | The forwarded `ref`, other DOM props, `className`, and `style` reach the primary element; `data-testid` marks the row wrapper when one exists, else the primary element; `xstyle` styles the item's outer box.                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR6  | Whether an item with children collapses follows `component:SideNav` FR1. A collapsible item starts expanded unless `defaultIsCollapsed` is true; a controlled item calls `onCollapsedChange` with the next state and changes only when `isCollapsed` changes.                                                                                                                                                                                                                                                                                                                                                                                                               | Current source and tests |
| FR7  | With `href` or `onClick` in an expanded rail, a collapsible item is split: the primary element navigates or fires `onClick` and never toggles, and a separate toggle button named by `@astryx.sideNavItem.expand` or `.collapse` owns `aria-expanded` and `aria-controls`. Without either, the whole primary element toggles and carries `aria-expanded` and `aria-controls`.                                                                                                                                                                                                                                                                                               | Current source and tests |
| FR8  | In a collapsed rail, a leaf item shows a tooltip with its label at the inline end, anchored to the item, including when the rail is collapsed at mount.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests |
| FR9  | In a collapsed rail, an item with children (rendered per `component:SideNav` FR2) opens its flyout: on a hover-capable pointer after a hover-intent delay, leaving closes a hover-opened flyout, and a click-opened one stays; a click under a stationary pointer does not spring it back open; no hover timers run on a coarse pointer. Keyboard opening moves focus into the flyout and Escape restores it to the trigger; hover opening does not move focus. The flyout is labeled by `@astryx.sideNavItem.submenuLabel`, shows the parent label as a header, light-dismisses, and closes when anything inside is clicked. Arrow keys inside it are left to the browser. | Current source and tests |
| FR10 | Inside the mobile drawer, activating a link or button item calls `onClick` and then closes the drawer. Toggling a collapsible parent, clicking a row action, or activating outside the drawer does not close it.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Current source and tests |
| FR11 | Every focusable part paints the shared focus outline; a row with actions paints it on the wrapper when the primary element has focus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR12 | The expand chevron's rotation and the nested group's height change animate only without a reduced-motion preference. Under reduced motion they change at once for a fine pointer, and on a touch screen they MUST cross-fade within 200 ms (`design:reduced-motion` DR2, DR3). Implementation gap: on a touch screen they also change at once.                                                                                                                                                                                                                                                                                                                              | Current source           |

### Allowed variation

- **AV1 — Size.** `sm`, `md`, and `lg` change an expanded row's minimum
  height and its padding; an expanded row grows with a larger text size, so its
  label and end content stay inside it (`spec:AST-102` FR4). A collapsed rail
  row keeps its square size.
- **AV2 — Theme styling.** Themes restyle `side-nav-item` per size, selected,
  and disabled state.

### Representative states

| State                      | Required invariant                                             | Allowed variation |
| -------------------------- | -------------------------------------------------------------- | ----------------- |
| Link, selected             | `aria-current="page"` on the link; selected icon if given.     | Fill.             |
| Disabled button            | `aria-disabled`; focusable; no `onClick`.                      | Muted styling.    |
| Collapsible without action | Whole row toggles; chevron turns.                              | —                 |
| Collapsible with `href`    | Link navigates; separate toggle button collapses.              | —                 |
| Actions                    | Actions after toggle, before children; never activate the row. | Action content.   |
| Collapsed rail leaf        | Icon-only; tooltip with label.                                 | —                 |
| Collapsed rail parent      | Icon-only trigger; flyout with header and children.            | Delay.            |
| Mobile drawer              | Activation closes the drawer.                                  | —                 |

### Transformation and precedence order

- **ORD1 — Primary element.** Disabled or no `href` → button; else `as`, then
  `LinkProvider`, then `<a>`.
- **ORD2 — Icon.** `selectedIcon` when selected and given, else `icon`.

### Performance and resources

- **PR1 — Timers.** Flyout hover timers clear on close and unmount, and none are
  scheduled on a coarse pointer.

## Accessibility contract

- **AR1 — Current page.** FR2.
- **AR2 — Disclosure.** Exactly one element owns `aria-expanded` and
  `aria-controls` for the nested group (FR7).
- **AR3 — Focus order.** Row actions come after the primary element and toggle
  and before nested items (FR4).
- **AR4 — Collapsed names.** Collapsed-rail items keep a name per
  `component:SideNav` FR2.

## Design relationships

| Anatomy or state | Design requirement                                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Primary element  | Icon, label, passive end content, optional chevron. | Current source and public docs | Prominent      | FR1                |
| Toggle           | Trailing chevron button of the row control size.    | Current source                 | Supporting     | FR7                |
| Actions          | Trailing row controls.                              | Current source and public docs | Supporting     | FR4                |
| Flyout           | Parent label header over the children.              | Current source                 | Supporting     | FR9                |

`SideNavItem.doc.mjs` declares no anatomy of its own, so no anatomy-theming map
is recorded. Row geometry visual intent is `component:SideNav` DD1.

## Family and system relationships

- `family:overlay-dismissal` owns Escape and close-request ordering for this
  component's popover.
- `component:SideNav` owns nesting geometry and collapsed-rail rendering rules
  this component follows.
- `family:navigation-destinations` owns the accept/block decision for `href`.
- `architecture:interaction-modality` provides the shared focus indicator.

## Verification map

| Contract      | Verification                                                                                 | Representative states                                                                                                     | Mutation or failure expectation                                                   | Audit section                     |
| ------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR3, FR5  | `SideNav.test.tsx` SideNavItem suite                                                         | Link, button, `as`, provider, disabled                                                                                    | Wrong element, lost `aria-current`, or a disabled item that runs `onClick` fails. | `audit:SideNavItem/behavior`      |
| FR4–FR7, AR3  | `SideNav.test.tsx` actions-slot suite                                                        | Actions with toggle, endContent, disabled; row-wrapper `data-testid`; `defaultIsCollapsed` with whole-row `aria-controls` | Actions inside the primary element or wrong order fails.                          | `audit:SideNavItem/behavior`      |
| AV1 text size | `SideNavTextSize.interaction.browser.spec.ts` at a 200% and 250% default font size           | Default rows; end content                                                                                                 | A row whose label or end content leaves the row, or overlaps the next row, fails. | `audit:SideNavItem/behavior`      |
| FR6, FR7, AR2 | `SideNav.test.tsx` collapsible + href suite                                                  | Split, whole-row, controlled                                                                                              | A link that toggles or duplicated `aria-expanded` fails.                          | `audit:SideNavItem/accessibility` |
| FR8, FR9      | `SideNav.test.tsx` collapsed, hover-intent, and rail-tooltip suites                          | Leaf, parent, hover, click, keyboard, coarse                                                                              | Lost delay, focus restore, or tooltip anchor fails.                               | `audit:SideNavItem/behavior`      |
| FR10          | `SideNav.test.tsx` mobile drawer close-on-activate suite                                     | Link, button, toggle, action, outside drawer                                                                              | Wrong close behavior fails.                                                       | `audit:SideNavItem/behavior`      |
| FR11          | `SideNav.test.tsx` focus ring suite                                                          | Plain, split, actions rows                                                                                                | Missing shared ring classes fail.                                                 | `audit:SideNavItem/accessibility` |
| FR3, FR7, FR9 | `SideNav.test.tsx` keyboard operation and focus management suites                            | Tab order, Enter/Space toggle, flyout Escape                                                                              | Lost order, a stranded focus, or no focus return fails.                           | `audit:SideNavItem/accessibility` |
| RTL relation  | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `SideNav / Default` | Item icon and label; LTR and RTL                                                                                          | An icon that is not at the inline start of its label fails D2.                    | `audit:SideNavItem/i18n-rtl`      |

Read from source, with no focused test yet:

- FR1 and ORD1–ORD2: the button's `type="button"`, the icon, the
  selected-icon swap, and the whole-row chevron.
- FR4: the actions' trailing-edge placement and the wrapper for an independent
  toggle without actions.
- FR5: the forwarded `ref` and `xstyle` on the outer box.
- FR7: the toggle's translated names.
- FR8: the tooltip's inline-end placement.
- FR9: the flyout's light dismiss and close on an inner click.
- FR12; PR1's timer clearing on close; and the `size` and `selected` theme
  states.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Do a disabled item's children stay expandable?** (`human-api`)
  Today a disabled split row's toggle ignores the pointer and answers the
  keyboard (Current-state impact).

## Content boundary

This file does not duplicate consumer prop tables, examples, or SideNav's
nesting geometry. It links to their owners.

---

<!-- source: docs/specs/components/SideNav/SideNavSection.spec.md -->


# SideNavSection component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `SideNavSection` with `title`, `subtitle`, `endContent`, `isHeaderHidden`, and `children`; target `side-nav-section`.                                                   |
| Behavior                | A labeled group of SideNav items. Its header is visible in an expanded rail and visually hidden, but still read, when `isHeaderHidden` is set or the rail is collapsed. |
| End-user impact         | Screen-reader users hear each group's title in every rail state; sighted users see section titles only in the expanded rail.                                            |
| Builder impact          | None.                                                                                                                                                                   |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap (see Current-state impact).                                                                          |
| Review checks           | Reject a section without `role="group"` named by its title, or a hidden header removed from the accessibility tree.                                                     |
| Governing rules         | `architecture:public-component-api` INV5–INV6; `architecture:component-theming-surface`.                                                                                |

This table is a review projection; the body below is authoritative.

## Intent

SideNavSection groups related SideNav items under a title. It owns the group's
semantics and its header's visibility. Consumer usage lives in
`SideNavSection.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A hidden header keeps its end content focusable.** When the header is
  visually hidden (`isHeaderHidden` or a collapsed rail), a control placed in
  `endContent` stays in the tab order while it is clipped out of sight, so
  keyboard users land on a control they cannot see. WCAG 2.4.7 requires visible
  focus. OQ1 asks whether a hidden header renders `endContent`.

## Ownership boundary

**Owns**

- The group element, its name, header visibility, and root styling (FR1–FR4).

**Does not own / non-goals**

- Item rendering and nesting — owned by `component:SideNavItem` and
  `component:SideNav`.
- Interactive content placed in `endContent` — owned by that content.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                     | Basis                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root is a `div` with `role="group"` and `aria-labelledby` pointing at the title. It carries `side-nav-section`, the forwarded `ref`, `data-testid`, and other DOM props; the role and label cannot be overridden by them. | Current source and tests |
| FR2 | The header shows the title, an optional subtitle, and `endContent` at the inline end, followed by the items.                                                                                                                  | Current source and tests |
| FR3 | When `isHeaderHidden` is true or the rail is collapsed, the header is visually hidden but stays in the accessibility tree, so the group keeps its name.                                                                       | Current source and tests |
| FR4 | `className`, `style`, and `xstyle` merge onto the root after component styles.                                                                                                                                                | Current source and tests |

### Allowed variation

- **AV1 — Header content.** Subtitle and end content may be absent.

### Representative states

| State          | Required invariant                   | Allowed variation |
| -------------- | ------------------------------------ | ----------------- |
| Expanded rail  | Visible header; named group.         | End content.      |
| Header hidden  | Hidden header still names the group. | —                 |
| Collapsed rail | Hidden header still names the group. | —                 |

### Transformation and precedence order

- No precedence rule.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named group.** FR1 and FR3.

## Design relationships

| Anatomy or state | Design requirement                     | Representation authority       | Hierarchy role | Component contract |
| ---------------- | -------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Header           | Title, subtitle, trailing end content. | Current source and public docs | Supporting     | FR2, FR3           |

`SideNavSection.doc.mjs` declares no anatomy of its own, so no anatomy-theming
map is recorded.

## Family and system relationships

- `component:SideNav` hosts sections in its list.

## Verification map

| Contract      | Verification                                                                                               | Representative states                      | Mutation or failure expectation                                      | Audit section                        |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| FR1, FR2, FR4 | `SideNav.test.tsx` SideNavSection suite                                                                    | Title, subtitle, end content, props        | A lost role, name, or forwarded prop fails.                          | `audit:SideNavSection/accessibility` |
| FR3           | `SideNav.test.tsx` hidden section header test                                                              | Header hidden                              | A header removed from the tree fails.                                | `audit:SideNavSection/accessibility` |
| RTL relation  | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `SideNav / Section / End content` | Section title and end content; LTR and RTL | A title that is not at the inline start of the end content fails D2. | `audit:SideNavSection/i18n-rtl`      |

Read from source, with no focused test yet: the forwarded `ref`, the
`side-nav-section` target, and the role and label winning over caller props
(FR1); the header's part order and end placement (FR2); hiding the header in a
collapsed rail (FR3); and `xstyle` on the root (FR4).

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Does a hidden header render `endContent`?** (`human-api`) Today it
  does, and a control there stays focusable while hidden (Current-state
  impact).

## Content boundary

This file does not duplicate consumer prop tables or examples. It links to their
owners.
