---
schema_version: 3
template_version: 7
kind: component
id: component:Tab
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-27
owners: [cixzhang]
review_triggers: [public-api, behavior, accessibility]
verified_by:
  [
    packages/core/src/TabList/TabList.test.tsx,
    packages/core/src/TabList/__tests__/Tabs.a11y.test.tsx,
    packages/core/src/TabList/__tests__/TabDescription.test.tsx,
    packages/core/src/TabList/__tests__/Tabs.a11y.chromium.spec.ts,
    packages/core/src/TabList/__tests__/TabListTextSize.interaction.browser.spec.ts,
    apps/storybook/stories/TabList.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:component-style-authoring,
    architecture:interaction-modality,
    architecture:public-component-api,
    architecture:component-theming-surface,
  ]
contributing: []
system_specs: []
---

# Tab component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `Tab` with `value`, `label`, `isLabelHidden`, `href`, `as`, `panelId`, `icon`, `selectedIcon`, and `endContent`; targets `tab` and `tab-indicator` with a `selected` state.                                                                                                          |
| Behavior                | One TabList entry. In the navigation pattern it is a button or, with `href`, a link marked `aria-current` when selected; in the tabs pattern (`role="tablist"`) it is a `role="tab"` button that controls its panel. The strip has one tab stop, which starts on the selected entry. |
| End-user impact         | Users select a view or destination; keyboard users meet one tab stop for the whole strip; screen-reader users hear the selected entry and, in the tabs pattern, the panel it controls.                                                                                               |
| Builder impact          | None.                                                                                                                                                                                                                                                                                |
| Compatibility/readiness | Records shipped behavior; no public change. Four implementation gaps (see Current-state impact).                                                                                                                                                                                     |
| Review checks           | Reject more than one tab stop per strip, `aria-current="page"` on a navigation tab, a disabled tab that fires its handler or navigates, or a tabs-pattern tab that renders a link.                                                                                                   |
| Governing rules         | `component:TabList` (strip edge geometry); `family:navigation-destinations`; `architecture:interaction-modality`.                                                                                                                                                                    |

This table is a review projection; the body below is authoritative.

## Intent

Tab is one entry in a TabList. It owns its element and role in each TabList
pattern, its selected and disabled behavior, its icon swap, label sizing, and
its selection indicator. Consumer usage lives in `Tab.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: selection is the TabList's `value`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A hidden label twin reserves the selected width.** Each visible label
  renders a second, `aria-hidden` copy that reserves the label's selected
  weight so the tab does not shift. `architecture:component-style-authoring`
  INV7 has content render once and has CSS size or reserve it on the element
  that shows it.
- **Hover decoration is an element.** The hover fill is an `aria-hidden` span
  rather than a pseudo-element; `architecture:component-style-authoring` INV7
  has decoration without a semantic role carried by a pseudo-element.
- **Color transitions under reduced motion.** The label color, hover fill,
  pressed fill, and indicator fade still animate when reduced motion is
  requested;
  `design:reduced-motion` DR3 allows no animated property for a fine pointer.
- **The `tab` target does not reflect disabled.** A disabled Tab drops its
  hover and pressed treatment, but the `tab` target reflects only `selected`.
  `architecture:component-theming-surface` INV6 has a state that changes paint
  reflected on the owning target.

## Ownership boundary

**Owns**

- The entry element and role per pattern, selection on activation, disabled
  handling, the tab stop, icon swap, label, end content, and indicator
  (FR1–FR8).

**Does not own / non-goals**

- Which value is selected, the pattern (`role`), size, layout, arrow-key
  movement, and overflow scrolling — owned by TabList and uncontracted here;
  strip edge geometry — owned by `component:TabList`.
- Destination acceptance and blocking — owned by
  `family:navigation-destinations`.
- The panel a tab controls — owned by the caller.

## Public concepts

| Concept | Closed values or states | Meaning                                                   | Availability by variant/orientation/state | Default    | Owner   | Stability | Invalid-value behavior |
| ------- | ----------------------- | --------------------------------------------------------- | ----------------------------------------- | ---------- | ------- | --------- | ---------------------- |
| Pattern | navigation, tabs        | Set by the TabList `role`; decides element and semantics. | Every tab.                                | navigation | TabList | Stable    | Not settable on Tab.   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                  | Basis                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | In the navigation pattern a Tab is a `<button type="button">`, or with `href` the `as` component, else the `LinkProvider` link, else `<a>`. The selected Tab carries `aria-current="true"`, never `"page"`.                                                                                                                                                | Current source and tests |
| FR2 | In the tabs pattern a Tab is a `<button>` with `role="tab"`, `aria-selected`, and `aria-controls` from `panelId` (else a caller `aria-controls`). `href` is ignored, and development warnings name an ignored `href`, a missing panel, or a `panelId` outside the tabs pattern.                                                                            | Current source and tests |
| FR3 | The strip has one tab stop. It starts on the selected Tab (`tabIndex=0`, every other entry `-1`), and moves to whichever entry the arrow keys, Home, or End focus, without selecting it. Where the stop starts when no entry is selected, or the selected one is disabled, is uncontracted here; the Tabs accessibility inventory leaves that policy open. | Current source and tests |
| FR4 | Activation runs the caller `onClick`, then selects the Tab's `value` through the TabList unless the caller cancelled the event.                                                                                                                                                                                                                            | Current source and tests |
| FR5 | A Tab with `aria-disabled="true"` does not run `onClick`, does not select, and, as a link, renders a plain `<a>` without `href`; it gets no hover or pressed treatment.                                                                                                                                                                                    | Current source and tests |
| FR6 | `isLabelHidden` names the Tab by `label` through `aria-label` and hides the text; the visible label reserves its selected (semibold) width so selection does not shift layout. `selectedIcon` replaces `icon` while selected.                                                                                                                              | Current source and tests |
| FR7 | Every Tab renders an indicator carrying `tab-indicator`, visible only when selected; the root carries `tab` with `selected`. The pressed overlay paints on the tab surface.                                                                                                                                                                                | Current source and tests |
| FR8 | The root forwards the `ref` and other DOM props, merges `className`, `style`, and `xstyle` after component styles, and paints the shared focus outline.                                                                                                                                                                                                    | Current source and tests |

### Allowed variation

- **AV1 — Size and layout.** The TabList size sets each Tab's minimum
  height; a Tab grows with a larger text size so its label is never clipped
  (`spec:AST-102` FR4). `fill` layout stretches Tabs.
- **AV2 — Theme styling.** Themes restyle `tab` and `tab-indicator` per selected
  state.

### Representative states

| State             | Required invariant                              | Allowed variation  |
| ----------------- | ----------------------------------------------- | ------------------ |
| Navigation button | `aria-current="true"` when selected.            | Icon, end content. |
| Navigation link   | Link; `aria-current="true"` when selected.      | Router renderer.   |
| Tabs pattern      | `role="tab"`, `aria-selected`, `aria-controls`. | —                  |
| Icon only         | Named by `label`.                               | Icon.              |
| Disabled          | No selection, handler, or navigation.           | Muted styling.     |

### Transformation and precedence order

- **ORD1 — Element.** Tabs pattern → button; else `href` → link (disabled →
  plain `<a>`); else button.
- **ORD2 — Controls.** `panelId`, then caller `aria-controls`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Pattern semantics.** FR1 and FR2.
- **AR2 — One tab stop.** FR3.
- **AR3 — Names.** Visible label or, when hidden, `aria-label` from `label`.
- **AR4 — Help text describes the tab.** A tab's help text is a Tooltip
  anchored on the Tab through its forwarded ref, so the description lands on
  the tab and the Tooltip renders outside the strip; `endContent` holds only
  non-interactive content (FR2).

## Design relationships

| Anatomy or state | Design requirement                                   | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Tab              | Icon, label, end content; stable width on selection. | Current source and public docs | Prominent      | FR6                |
| Indicator        | Selected-only underline.                             | Current source                 | Supporting     | FR7                |

`Tab.doc.mjs` declares no anatomy of its own, so no anatomy-theming map is
recorded. Edge and indicator geometry across the strip is `component:TabList`
FR1–FR2.

## Family and system relationships

- TabList supplies pattern, value, size, layout, and keyboard movement;
  `component:TabList` contracts its edge geometry.
- `family:navigation-destinations` owns the accept/block decision for `href`.

## Verification map

| Contract      | Verification                                                                                                                                      | Representative states                                          | Mutation or failure expectation                                                                                                                 | Audit section             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1, FR2      | `TabList.test.tsx` aria-current, polymorphic link, and tabs-pattern tests; `Tabs.a11y.test.tsx`; `Tabs.a11y.chromium.spec.ts` for `aria-selected` | Navigation, link, tabs                                         | Wrong role or state fails.                                                                                                                      | `audit:Tab/accessibility` |
| FR3           | `TabList.test.tsx` single tab stop and roving tabindex tests                                                                                      | Selected                                                       | Extra tab stops, or a wrong starting stop, fail.                                                                                                | `audit:Tab/accessibility` |
| FR4, FR5      | `TabList.test.tsx` onChange and disabled tests                                                                                                    | Click, disabled button                                         | Selection when disabled fails.                                                                                                                  | `audit:Tab/behavior`      |
| FR6, FR7      | `TabList.test.tsx` icon, icon-only, and pressed-overlay tests                                                                                     | Icon, selected icon, hidden label                              | Wrong icon, name, or overlay fails.                                                                                                             | `audit:Tab/behavior`      |
| AV1 text size | `TabListTextSize.interaction.browser.spec.ts` at a 200% and 250% default font size                                                                | Default, size variants, with menu                              | A tab or tab strip that clips its label, or a label outside its tab, fails.                                                                     | `audit:Tab/behavior`      |
| RTL relation  | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TabList / With icons`                                                   | Tab icon and label; LTR and RTL                                | An icon that is not at the inline start of its label fails D2.                                                                                  | `audit:Tab/i18n-rtl`      |
| AR4           | `TabDescription.test.tsx`                                                                                                                         | A Tooltip anchored on a Tab with an info glyph in `endContent` | A tab without the tooltip's `aria-describedby`, a focusable element inside the tab, a tooltip inside the strip, or a development warning fails. | `audit:Tab/accessibility` |

Read from source, with no focused test yet:

- FR3: the stop moving with arrow, Home, and End focus.
- FR1: the button's `type="button"`.
- FR4: the caller `onClick` running first, and its `preventDefault()`
  cancelling selection.
- FR5: the absent hover and pressed treatment on a disabled Tab.
- FR6: the reserved selected-width label.
- FR7: the `tab` and `tab-indicator` targets and their `selected` state.
- FR8.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, or TabList strip
behavior. It links to their owners.

---

<!-- source: docs/specs/components/TabList/TabList.spec.md -->


# TabList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Canonicalize the existing mode as `edge?: 'padded' \| 'bleed'` (default `'padded'`) from the shared `edge` vocabulary; deprecate `isFullBleed` as an alias of `edge="bleed"` and remove it in the next minor release.                                                              |
| Behavior                | Move first and last visible tab content toward the host content line, reaching it when the host inset is at least the edge-tab padding, while preserving tab interaction padding, focus-ring room, overflow controls, selection-indicator geometry, and the optional divider rail. |
| End-user impact         | Edge tabs lose unnecessary extra inset where host geometry permits and remain fully interactive without clipped focus, selection, overflow, or divider treatment.                                                                                                                  |
| Builder impact          | Existing `isFullBleed` callsites keep working during the deprecation window and migrate mechanically to `edge="bleed"`.                                                                                                                                                            |
| Compatibility/readiness | Current behavior is shipped; the canonical alias is additive, while removing the released legacy prop is a separately implemented breaking change in the next minor release.                                                                                                       |
| Review checks           | Reject a behavior change disguised as a rename, directional values without overflow/indicator proof, or early removal of the legacy prop.                                                                                                                                          |
| Governing rules         | `architecture:container-padding/INV9–INV11`; `spec:AST-002/DEC-1–DEC-2`; `spec:AST-017/DEC-1`.                                                                                                                                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

TabList's current opt-in is the shared `bleed` edge treatment: it consumes the
full inherited host inset, moves visible edge-tab content toward the surrounding content line,
and retains Tab-owned interaction padding plus TabList-owned divider, overflow,
and indicator geometry. Content reaches the host line only when that inset is at
least the edge tab's own padding. The public `isFullBleed` name is misleading
because the strip keeps a content line: it restores uncovered content inset
after the outer box expands, which `architecture:container-padding` names `bleed`.

## Compatibility and migration

- Released default preserved: `yes`; omission keeps current TabList geometry.
- Compatibility class: the canonical alias is additive while the released
  `isFullBleed` prop remains; removing that prop is a breaking change in the next
  minor release under `spec:AST-017/DEC-1`.
- Controlled/uncontrolled behavior: active-value control is unchanged.
- Migration decision: `component:TabList/DEC-1`.

During the compatibility window:

- `edge="bleed"` is the canonical spelling, and omitted `edge` means `padded`;
- omitted `edge` plus `isFullBleed={true}` selects `bleed`;
- `isFullBleed` is deprecated and maintained examples use the canonical prop;
- if both props are supplied, explicit `edge` is canonical and the legacy
  boolean cannot override it.

The removal release MUST include a `[breaking]` Changeset for
`@astryxdesign/core`, consumer release notes, and an `astryx upgrade` codemod that rewrites
`isFullBleed` to `edge="bleed"`.

## Ownership boundary

**Owns**

- The TabList-wide `bleed` edge treatment and its compatibility alias.
- The relationship between the outer TabList box, inner strip padding, edge tabs,
  focus-ring room, overflow controls, and selection indicator.
- Which logical edges are supported by the public mode.

**Does not own / non-goals**

- Host padding publication, nesting, or overlay resets — owned by
  `architecture:container-padding`.
- Button or List edge projections.
- The `flush` or `outset` values, or per-edge application, without separate
  proof and owner approval.
- A change to navigation/tab semantics, selection state, keyboard behavior, or
  overflow ownership.

## Public concepts

| Concept        | Closed values or states    | Meaning                                                                                                                                                                                           | Availability by variant/orientation/state                          | Default            | Owner               | Stability                       | Invalid-value behavior                       |
| -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------ | ------------------- | ------------------------------- | -------------------------------------------- |
| Edge treatment | omitted, `padded`, `bleed` | `bleed`: consume both inherited inline host insets and move edge-tab content toward the host lines while retaining local interaction and strip-owned geometry; `padded`: current default geometry | Navigation and tabs patterns across current layout/overflow states | omitted (`padded`) | `component:TabList` | accepted; canonical API pending | Other values are rejected by the public type |
| Legacy alias   | omitted, `false`, `true`   | Compatibility spelling for `padded` or `bleed`                                                                                                                                                    | Until the next minor release                                       | omitted/`false`    | `component:TabList` | deprecated                      | `true` maps to `bleed`; explicit `edge` wins |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                             | Status                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| FR1 | The current opt-in MUST remain the `bleed` treatment: the outer TabList box consumes the full inherited inline host inset and any `hasDivider` rail spans that expanded width; the inner strip restores `max(host inset - edge-tab padding, 0)` at each logical edge. Visible edge-tab content reaches the host line only when the host inset is at least the tab padding; otherwise it moves toward that line without crossing the host boundary. | Current source and `component:TabList/DEC-1`                      | Shipped behavior                                         |
| FR2 | Compensation MUST preserve Tab interaction padding, focus-ring room, overflow detection and controls, scroll access, selection-indicator geometry, and the optional divider rail's expanded inline span.                                                                                                                                                                                                                                           | Current source plus owner direction                               | Shipped behavior; expanded evidence required with rename |
| FR3 | `edge?: 'padded' \| 'bleed'` MUST become the canonical API, with `bleed` selecting FR1–FR2 geometry and `padded` the omitted default, without changing either.                                                                                                                                                                                                                                                                                     | `architecture:container-padding/INV10`; `component:TabList/DEC-1` | Accepted contract; implementation pending                |
| FR4 | During the deprecation window, omitted `edge` plus `isFullBleed={true}` MUST produce the canonical `bleed` behavior. Explicit `edge` MUST remain authoritative when both props are supplied.                                                                                                                                                                                                                                                       | Compatibility decision                                            | Accepted contract; implementation pending                |
| FR5 | `isFullBleed` MUST be removed in the next minor release only after maintained docs/examples use `edge`, both paths have compatibility evidence, and the removal includes a `[breaking]` Changeset plus an `astryx upgrade` codemod for mechanical consumer migration.                                                                                                                                                                              | `component:TabList/DEC-1`; `spec:AST-017/DEC-1`                   | Accepted contract; implementation pending                |
| FR6 | `flush`, `outset`, and per-edge application MUST remain rejected until overflow, clipping, scroll-control, focus-ring, indicator, direction, and theme-padding evidence receives owner approval.                                                                                                                                                                                                                                                   | Shared edge vocabulary and TabList boundary                       | Accepted boundary                                        |

### Allowed variation

- Layout, size, role, selected value, labels, tab content, and overflow mode may
  vary while the same `bleed` meaning is preserved.
- The implementation may retain the current outer-box/inner-strip technique or
  replace it with equivalent geometry that satisfies FR1–FR2.
- A host may be painted or bounded only where TabList's component-specific
  evidence proves the outer box, clipping, focus, and indicator behavior safe.

### Representative states

| State             | Required invariant                                                                                                       | Allowed variation                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Default/omitted   | Current TabList box, strip, and tab geometry are unchanged.                                                              | Any current layout, role, or overflow mode.                                                     |
| Canonical `bleed` | Outer box consumes each host inset; edge content reaches the host line only when that inset is at least the tab padding. | Host inset smaller than, equal to, or larger than edge-tab padding; asymmetric insets; LTR/RTL. |
| Divider           | `hasDivider` rail spans the expanded outer inline width.                                                                 | Fitting or overflowing strips.                                                                  |
| Legacy alias      | `isFullBleed={true}` matches canonical `bleed` geometry during the compatibility window.                                 | The canonical prop may also be present.                                                         |
| Overflowing strip | Scroll access, edge fades, controls, and selected-tab reveal remain correct.                                             | Start/end overflow independently.                                                               |
| Focused edge tab  | The focus ring remains visible and local to the tab.                                                                     | Keyboard or pointer focus.                                                                      |

### Transformation and precedence order

- **ORD1 — Public input.** Resolve explicit `edge`; otherwise map
  `isFullBleed={true}` to `bleed` during the compatibility window; otherwise use
  `padded`.
- **ORD2 — Host geometry.** Read the matching inherited logical host insets, with
  missing values falling back to zero.
- **ORD3 — Component geometry.** Resolve edge-tab padding and focus/indicator
  allowances from TabList-owned sources, restore the non-overlapping portion of
  each content inset, and preserve interaction padding and owned affordances.

### Performance and resources

- **PR1 — CSS-first geometry.** The rename MUST add no observer, listener,
  state, Effect, or render pass. Existing overflow measurement remains unchanged.

## Accessibility contract

- **AR1 — Interaction remains stable.** The `bleed` treatment MUST NOT change the
  tab/nav pattern, accessible names, selected state, keyboard movement, tab stop,
  focus target, or controlled value behavior.
- **AR2 — Overflow remains reachable.** `bleed` geometry MUST NOT clip or
  hide a focus ring, selected indicator, visible tab content, or an overflow
  control required to reach offscreen tabs.

## Design relationships

| Anatomy or state  | Design requirement                                                                                    | Representation authority  | Hierarchy role | Component contract |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- | -------------- | ------------------ |
| Outer TabList box | Consumes the full inherited inline host inset; with `hasDivider`, its rail spans that expanded width. | `component:TabList/DEC-1` | Supporting     | FR1–FR3            |
| Inner strip       | Restores `max(host inset - edge-tab padding, 0)` and owns scrolling/fades.                            | Current TabList behavior  | Structural     | FR1–FR2            |
| Edge Tab          | Retains interaction padding and visible focus/selection treatment.                                    | Tab composition           | Prominent      | FR1–FR2, AR1–AR2   |

## Family and system relationships

- `architecture:container-padding` owns host publication, the shared `edge`
  vocabulary, logical-edge semantics, and overlay reset.
- `architecture:public-component-api` and `spec:AST-002` own public API
  admission; `spec:AST-017/DEC-1` owns the breaking classification and migration
  evidence required when the released alias is removed.
- TabList owns its specialized host, overflow, focus, and indicator projection.

## Verification map

| Contract         | Verification                                                                                                            | Representative states                                                                                                                           | Mutation or failure expectation                                                                            | Audit section          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR1–FR4          | `TabList.test.tsx` and type/docs tests                                                                                  | omitted, canonical, legacy, both props, and `hasDivider`                                                                                        | Alias drift, changed defaults, wrong precedence, or lost divider span fails                                | `audit:TabList/api`    |
| FR1–FR6, AR1–AR2 | Real-browser TabList geometry and interaction evidence                                                                  | LTR/RTL; host inset smaller/equal/larger than edge-tab padding; asymmetric/zero inset; divider; fitting/overflowing; selected/focused edge tabs | Wrong bounded movement, clipped focus/indicator/divider, inaccessible overflow, or scroll regression fails | `audit:TabList/visual` |
| FR5 and docs     | `TabList.doc.mjs`, Storybook, `[breaking]` Changeset, `astryx upgrade` codemod tests, and `scripts/check-knowledge.mjs` | canonical examples, deprecated alias, and removal migration                                                                                     | Missing migration guidance, wrong Changeset class, missing codemod rewrite, or stale canonical usage fails | `audit:TabList/docs`   |

## Decision log

### DEC-1 — TabList migrates from full-bleed wording to edge compensation

**Reference:** `component:TabList/DEC-1`

**Decider:** cixzhang, 2026-09-21

TabList's current mode consumes the full inherited inline host inset, keeps an
optional divider across that expanded width, and restores only the portion of
content inset not already supplied by edge-tab padding. The user-facing intent is
therefore edge compensation, not a promise that tab content itself reaches an
outer edge. DEC-2 sets the canonical spelling; `isFullBleed` remains a
compatibility alias until its `[breaking]` next-minor removal, with the required
codemod and release evidence.

### DEC-2 — TabList spells its mode with the shared edge vocabulary

**Reference:** `component:TabList/DEC-2`

**Decider:** cixzhang, 2026-10-16

`architecture:container-padding` names TabList's geometry `bleed`: paint reaches
the host's padding edge and content stays on the host content line, or at the
edge tab's own padding when the host inset is smaller. `edge="bleed"` is the
canonical spelling, so TabList and List share one prop name and one value set.

## Open questions

None.

## Content boundary

This claim-scoped contract does not duplicate TabList's complete navigation,
selection, overflow, or theming contract, consumer examples, implementation
steps, or List/Button projections. Those remain with their named owners.

---

<!-- source: docs/specs/components/TabList/TabMenu.spec.md -->


# TabMenu component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TabMenu` with `label` and `options` (`{value, label, icon?}`); targets `tab-menu`, `tab-menu-dropdown`, and `tab-menu-item`, plus `tab-indicator` when an option is selected.     |
| Behavior                | A TabList entry that groups several tab values behind a menu button. Its label shows the selected option, else `label`; choosing an option selects that value and closes the menu. |
| End-user impact         | Users reach overflow tab values from one entry and see which one is selected; keyboard users get APG menu-button behavior with a single tab stop inside the menu.                  |
| Builder impact          | None.                                                                                                                                                                              |
| Compatibility/readiness | Records shipped behavior; no public change. Six implementation gaps (see Current-state impact).                                                                                    |
| Review checks           | Reject options without `menuitemradio` and `aria-checked`, more than one tab stop in the open menu, or a closed menu that leaves focus stranded.                                   |
| Governing rules         | `component:TabList` (strip edge geometry); `family:overlay-dismissal`; `architecture:interaction-modality`.                                                                        |

This table is a review projection; the body below is authoritative.

## Intent

TabMenu is a TabList entry that holds several tab values in a menu. It owns its
trigger, the option menu, and how choosing an option selects a value. Consumer
usage lives in `TabMenu.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: selection is the TabList's `value`; the
  menu's open state is internal
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A hidden label twin reserves the selected width.** The trigger's visible
  label renders a second, `aria-hidden` copy that reserves the label's selected
  weight. `architecture:component-style-authoring` INV7 has content render once
  and has CSS size or reserve it on the element that shows it.
- **Hover decoration is an element.** The trigger's hover fill is an
  `aria-hidden` span rather than a pseudo-element;
  `architecture:component-style-authoring` INV7 has decoration without a
  semantic role carried by a pseudo-element.
- **The open menu repeats the label.** The menu's heading repeats `label`,
  which the trigger also shows while no option is selected, so that text
  renders twice while the menu is open. `architecture:component-style-authoring`
  INV7 has content render once.
- **Motion under reduced motion.** The chevron's turn and the trigger and item
  color and fill transitions still animate when reduced motion is requested;
  `design:reduced-motion` DR1–DR3 allow no travel and, for a fine pointer, no
  animated property.
- **The `tab-menu` and `tab-menu-item` targets reflect no state.** The trigger
  takes selected styling and a checked option takes medium weight, but neither
  target reflects a state. `architecture:component-theming-surface` INV6 has a
  state that changes paint reflected on the owning target.
- **Selection mounts extra elements.** The trigger mounts its `tab-indicator`
  only while an option is selected, and an option mounts its check mark only
  while checked. `architecture:component-style-authoring` INV7 has states
  expressed through attributes, classes, and styles on existing elements, never
  through extra elements.

## Ownership boundary

**Owns**

- The trigger, its label and tab stop, the option menu, and selection from it
  (FR1–FR6).

**Does not own / non-goals**

- Selected value, size, and strip keyboard movement — owned by TabList and
  uncontracted here; strip edge geometry — owned by `component:TabList`.
- Popover hosting and light dismiss — owned by the shared popover and layer
  runtime; Escape ordering — owned by `family:overlay-dismissal`.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The trigger is a `<button>` with `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls` naming the menu; its props type omits `role`, and caller props cannot set its tab index or popup attributes. It carries `tab-menu` and forwards `ref` and other DOM props.                                                                                                                                                                                                                                  | Current source and tests |
| FR2 | The trigger shows the label of the option whose value is selected, else `label`, reserving semibold width; when an option is selected it uses selected styling and shows the selected indicator. It takes part in the strip's single tab stop like a Tab (`component:Tab` FR3): it starts as the stop when one of its options is selected, and the stop moves with arrow-key focus; where the stop starts when nothing in the strip is selected, or the selected entry is disabled, is uncontracted here. | Current source and tests |
| FR3 | Clicking the trigger toggles a non-modal popover below it and, on open, focuses the first option; a caller `onClick` runs after the toggle.                                                                                                                                                                                                                                                                                                                                                               | Current source and tests |
| FR4 | The menu is a `role="menu"` named by `label`, carrying `tab-menu-dropdown`, with a presentational heading repeating `label`, then one `role="menuitemradio"` per option with `aria-checked` for the selected value, an optional icon, and a check mark when selected.                                                                                                                                                                                                                                     | Current source and tests |
| FR5 | Inside the menu one option is a tab stop, and ArrowUp, ArrowDown, Home, and End move it; ArrowLeft and ArrowRight are left to the strip; Enter, Space, or click on an option selects its value through the TabList and closes the menu; Escape and Tab close it. Closing returns focus to the trigger.                                                                                                                                                                                                    | Current source and tests |
| FR6 | The trigger and options paint the shared focus outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source           |
| FR7 | In the open menu, a press (finger, pen or mouse) that lands on an option and slides across the options picks the one it lifts on, once, through that option's own activation, with the highlight following the pointer; a lift outside acts on nothing, and a mouse released outside closes the menu. The menu adopts `module:DropdownMenu/useMenuPress` for this (`family:action-groups` FR1–FR5; `module:DropdownMenu/useMenuPress` DEC-7). Keyboard and assistive-technology behavior is unchanged.    | Current source and tests |

### Allowed variation

- **AV1 — Options.** Any number of options, each with an optional icon.

### Representative states

| State              | Required invariant                                                                                                                                                                                  | Allowed variation |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| No option selected | Trigger shows `label`; while another enabled entry is selected it is not the starting stop (Tab FR3); with nothing selected, or the selected entry disabled, where the stop starts is uncontracted. | —                 |
| Option selected    | Trigger shows that option's label and indicator.                                                                                                                                                    | —                 |
| Open               | Named menu; first option focused; one tab stop.                                                                                                                                                     | —                 |

### Transformation and precedence order

- **ORD1 — Trigger label.** Selected option's label, then `label`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Menu button.** FR1 and FR5 follow the APG menu-button pattern.
- **AR2 — Radio options.** Options are `menuitemradio` with `aria-checked`.

## Design relationships

| Anatomy or state | Design requirement                                    | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Trigger          | Tab-styled button with chevron and indicator.         | Current source and public docs | Prominent      | FR2                |
| Menu             | Heading, then options with a check mark on selection. | Current source                 | Supporting     | FR4                |

`TabMenu.doc.mjs` declares no anatomy of its own, so no anatomy-theming map is
recorded.

## Family and system relationships

- TabList supplies value, size, and the strip; `component:TabList` contracts
  its edge geometry.
- `family:overlay-dismissal` owns shared Escape ordering.

## Verification map

| Contract     | Verification                                                                                   | Representative states                             | Mutation or failure expectation                                  | Audit section                 |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| FR1, FR3     | `TabList.test.tsx` TabMenu and host-attribute tests                                            | Closed, open                                      | Lost popup attributes fail.                                      | `audit:TabMenu/accessibility` |
| FR2, FR4     | `TabList.test.tsx` TabMenu label, heading, and menuitemradio tests                             | Selected and unselected                           | Wrong label or missing `aria-checked` fails.                     | `audit:TabMenu/behavior`      |
| FR5          | `TabList.test.tsx` TabMenu keyboard navigation tests                                           | ArrowUp, ArrowDown, Home, End, Tab, Escape, Enter | Extra tab stops or a menu left open fails.                       | `audit:TabMenu/accessibility` |
| FR7          | `TabList.test.tsx` TabMenu suite (touch and mouse slides)                                      | Touch and mouse slides across options             | Removing the adoption fails the slide tests.                     | —                             |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TabList / With menu` | Menu tab label and its chevron; LTR and RTL       | A label that is not at the inline start of its chevron fails D2. | `audit:TabMenu/i18n-rtl`      |

Read from source, with no focused test yet:

- FR1: the `tab-menu` target, the forwarded `ref`, and owned attributes winning
  over caller props.
- FR2: the reserved semibold width, the selected styling and indicator, and the
  trigger's part in the strip's tab stop.
- FR3: the popover's placement, focus moving to the first option on open, and
  the caller `onClick` running after the toggle.
- FR4: the `tab-menu-dropdown` and `tab-menu-item` targets, option icons, and
  the check mark.
- FR3: a second click closing the menu.
- FR5: Space selecting, the menu closing on selection, ArrowLeft and ArrowRight
  left to the strip, and focus returning to the trigger on close.
- FR6.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, or TabList strip
behavior. It links to their owners.
