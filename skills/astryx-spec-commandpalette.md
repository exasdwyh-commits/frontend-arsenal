---
schema_version: 3
template_version: 7
kind: component
id: component:CommandPalette
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-11-01
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/CommandPalette/CommandPalette.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteInput.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteList.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteItem.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteGroup.test.tsx,
    packages/core/src/CommandPalette/CommandPaletteFooter.test.tsx,
    packages/core/src/CommandPalette/__tests__/CommandPalette.a11y.chromium.spec.ts,
    packages/core/src/CommandPalette/__tests__/CommandPaletteFooter.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-056, spec:AST-092/FR9]
---

# CommandPalette component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CommandPalette` with its documented props and slots, composed from `CommandPaletteInput`, `CommandPaletteList`, `CommandPaletteItem`, `CommandPaletteGroup`, `CommandPaletteEmpty`, and `CommandPaletteFooter`, inside a Dialog.                                                           |
| Behavior                | Searchable commands in a Dialog: a combobox query field, a listbox of results only while selectable results exist, an empty message otherwise, and a keyboard-guidance footer. Modal Escape belongs to Dialog's shared dismissal.                                                           |
| End-user impact         | Keyboard and screen-reader users search and run commands with native text editing kept intact, hear the empty message that is shown, and close nested layers one Escape at a time.                                                                                                          |
| Builder impact          | None.                                                                                                                                                                                                                                                                                       |
| Compatibility/readiness | Records shipped behavior; no public change. AR1's caller `aria-label` rule is an implementation gap in `component:CommandPaletteList`, listed in its Current-state impact; two owner questions stay open (OQ2 asks whether INV5 should state this composite-semantics reading family-wide). |
| Review checks           | Reject local modal Escape handling, IME routing, Home/End result navigation, empty listboxes, stale active descendants, placeholder-only names, mismatched Empty announcements, or gaps.                                                                                                    |
| Governing rules         | `family:overlay-dismissal/FR1`, `FR2`, `FR4`, `FR5`; `spec:AST-056/FR3`, `AR1`, `AR2`; `spec:AST-092/FR9` (its outcome only; FR10); existing public component and delegated-owner contracts.                                                                                                |

This table is a review projection; the body below is authoritative.

## Intent

CommandPalette presents searchable commands inside a Dialog. It owns search and
selection orchestration plus the aggregate consumer anatomy while delegating its
surface and modal dismissal ordering to Dialog.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: as documented in `CommandPalette.doc.mjs`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The List replaces a caller's name (AR1).** A builder's explicit
  `aria-label` does not name the List today; `component:CommandPaletteList`
  records the gap.

## Ownership boundary

**Owns**

- Search orchestration and composition of the current Input, List, Item, Group,
  Group heading, Empty, and Footer parts and targets.
- Composition of the native Query field rendered inside the default Input; the field's semantics and native passthrough are owned by `component:CommandPaletteInput`.

**Does not own / non-goals**

- Dialog's surface, Icon's glyph, Spinner's loading indicator, or Kbd's shortcut
  badges — owned by their respective components.
- Caller-provided replacement Input, Footer, item content, or trailing input
  content — owned by the product callsite.
- The Item option's passthrough, pointer, disabled, selected, highlighted, and
  standalone-scroll semantics — owned by `component:CommandPaletteItem`.
- A `command-palette` root target — no such target exists.
- Shared layer hosting, positioning, or lifecycle rules beyond the current
  records linked below.
- The List root's accessible name, list-id application, native passthrough, and
  overflow scrolling — owned by `component:CommandPaletteList`.
- The Group's role, name, and heading — owned by `component:CommandPaletteGroup`;
  the Footer's guidance — owned by `component:CommandPaletteFooter`; the Empty
  surface — owned by `component:CommandPaletteEmpty`.

## Public concepts

No new public concept is introduced. Consumer props, slots, and usage remain
documented in `CommandPalette.doc.mjs` and its subcomponent docs.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1  | The default render places Input and Footer around a result surface inside a delegated Dialog. That surface is a List listbox while Items exist and an ordinary Empty container otherwise. Before the first query's result is committed, while that query is pending, the result surface keeps the Empty container's size and shows no message; once an answer is committed, a later pending query keeps the current results or the search-empty message until its own result commits (the "Pending search" state row; `component:CommandPaletteEmpty` FR2). The default Footer renders only when `footer` is omitted, `null`, or `undefined`; any other `footer` replaces it, so `footer={false}` shows no Footer guidance while the Footer area keeps its divider (`architecture:react-component-runtime` INV16). | Current source, docs, tests, and ARIA required-child rule               |
| FR2  | Input, List, Item, Group, Group heading, Empty, and Footer carry the seven current `command-palette-*` targets documented below; no `command-palette` root target exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and target docs                                          |
| FR3  | The default Input delegates its Search glyph to Icon and pending Loading spinner to Spinner; the default Footer delegates keyboard shortcuts to Kbd; the containing surface delegates to Dialog.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and component docs                                       |
| FR4  | Query field is a distinct native text field inside Input and has no separate public target. The `command-palette-input` target is on the surrounding search region, not the native field.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and target docs                                          |
| FR5  | A modal palette leaves Escape unclaimed for Dialog's shared dismissal stack so a nested member handles the first press; inline previews close locally because they do not register as layers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `family:overlay-dismissal/FR1`, `FR2`, `FR4`, `FR5`                     |
| FR6  | The editable query field keeps Home and End for native caret movement, uses PageUp and PageDown for first/last result navigation, and does not route active IME composition keys to commands.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | WAI-ARIA editable combobox convention; objective IME integrity          |
| FR7  | A committed result set resets highlight before exposure; the query input emits active-descendant only for an index that exists in the current selectable set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | WAI-ARIA active-descendant integrity                                    |
| FR8  | Empty search announcements mirror rendered `emptySearchText`, including rich caller content; the query input's default accessible name is independent of its placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `spec:AST-056/FR3`, `AR1`, `AR2`                                        |
| FR10 | A rejected `search()` settles as an empty answer and shows the empty-result state, as a typeahead's failed answer with nothing shown does; a rejected `bootstrap()` settles as no initial items and shows the initial empty state. Neither throws to an error boundary.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Consistency with the outcome `spec:AST-092/FR9` requires of typeaheads. |

### Allowed variation

- **AV1 — Results.** Item count, grouping, selected content, and empty state may
  vary without changing the aggregate anatomy.
- **AV2 — Slots.** Caller-provided Input and Footer content may replace the
  defaults without becoming CommandPalette-owned subparts.
- **AV3 — Delegated rendering.** Dialog, Icon, Spinner, and Kbd may change their
  internal element shape while preserving their own public contracts.

### Representative states

| State                  | Required invariant                                                            | Allowed variation                                          |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Ungrouped results      | List contains Item instances.                                                 | Item count and caller-rendered content.                    |
| Grouped results        | List contains Group, Group heading, and Item instances.                       | Group names, count, ordering, and item content.            |
| Empty bootstrap/search | Empty replaces listbox semantics; search-empty text is announced as rendered. | Caller-provided rich content, including ordinary controls. |
| Pending search         | Default Input may contain Loading spinner.                                    | Spinner is absent when no search is pending.               |
| Default slots          | Input and Footer render their documented defaults.                            | Footer shortcut text and translated labels.                |
| Caller-replaced slots  | The slot content replaces the corresponding default.                          | Replacement structure remains caller-owned.                |

### Transformation and precedence order

- No search, selection, layout, or styling precedence rule beyond FR1–FR10.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named composite.** The containing Dialog, combobox, populated listbox,
  groups, options, busy status, empty state, and keyboard guidance preserve their
  owned accessible names and roles. A caller's explicit `aria-label` names a List or
  Group (`architecture:public-component-api` INV5); the `listbox` and `option`
  roles and option state stay component-owned, as
  `component:CommandPaletteInput` AR3 records. `component:CommandPaletteList`
  records where today's List replaces a caller's name. When no selectable results exist, the result
  surface and combobox omit listbox, expanded, controls, and active-descendant
  semantics so rich Empty content stays ordinary non-nested content.
- **AR2 — Topmost Escape.** A modal palette delegates unclaimed Escape presses to
  Dialog's shared dismissal stack. A nested registered surface handles the first
  press; the host palette remains open until it becomes topmost.
- **AR3 — Inline preview.** Documentation-only inline rendering remains outside
  the shared layer stack and preserves its local Escape close behavior.
- **AR4 — Editable query keys.** Home and End preserve native caret movement;
  PageUp and PageDown navigate to the first and last results; active IME
  composition keys remain owned by the input method.
- **AR5 — Rendered empty message.** A search dead end announces the text rendered
  by `emptySearchText`, including text produced by caller components and links.
- **AR6 — Query-field name.** The default query field name is a localized
  "Search commands" label independent of its placeholder; caller `label` and
  native `aria-label` overrides remain supported.
- **AR7 — Existing active option.** Result changes reset highlight, and
  `aria-activedescendant` is present only when the indexed option exists in the
  current selectable set.

## Design relationships

| Anatomy or state  | Design requirement                                                      | Representation authority       | Hierarchy role | Component contract |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Dialog            | Presents the containing modal surface.                                  | `component:Dialog`             | Supporting     | FR1, FR3           |
| Input             | Paints the search region around the query field and supporting visuals. | Current source and public docs | Prominent      | FR1, FR2, FR4      |
| Search glyph      | Presents the search symbol in the default Input.                        | `component:Icon`               | Supporting     | FR3                |
| Query field       | Accepts the native text query inside Input.                             | Current source and public docs | Prominent      | FR1, FR4           |
| Loading spinner   | Indicates a pending search in the default Input.                        | `component:Spinner`            | Supporting     | FR3                |
| List              | Presents the current result collection or Empty state.                  | Current source and public docs | Supporting     | FR1, FR2           |
| Item              | Presents one selectable command result.                                 | Current source and public docs | Prominent      | FR1, FR2           |
| Group             | Arranges related Items together.                                        | Current source and public docs | Supporting     | FR1, FR2           |
| Group heading     | Labels one Group visually.                                              | Current source and public docs | Supporting     | FR1, FR2           |
| Empty             | Presents the no-results or no-query message.                            | Current source and public docs | Prominent      | FR1, FR2           |
| Footer            | Presents default guidance or caller-provided footer content.            | Current source and public docs | Supporting     | FR1, FR2           |
| Keyboard shortcut | Presents one shortcut as painted key badges in the default Footer.      | `component:Kbd`                | Supporting     | FR3                |

The native Query field is separate from the Input region that carries
`command-palette-input`. It has no direct target; whether it should is OQ1.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Dialog": {
    "delegatesTo": {"owner": "component:Dialog", "target": "dialog"}
  },
  "Input": {"target": "command-palette-input"},
  "Search glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Query field": {
    "none": {
      "reason": "unsettled: No current public target is applied directly to the native query field; future exposure still needs an owner decision"
    }
  },
  "Loading spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "List": {"target": "command-palette-list"},
  "Item": {"target": "command-palette-item"},
  "Group": {"target": "command-palette-group"},
  "Group heading": {"target": "command-palette-group-heading"},
  "Empty": {"target": "command-palette-empty"},
  "Footer": {"target": "command-palette-footer"},
  "Keyboard shortcut": {
    "delegatesTo": {"owner": "component:Kbd", "target": "kbd"}
  }
}
```

The seven local targets are current public seams. The delegated parts retain
their existing component owners. The Query field `none` disposition is
unsettled (OQ1) and does not authorize a new target.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  mapping, delegation, and factual `none` dispositions.
- `architecture:public-component-api` owns the stable props and composition
  surface.
- `architecture:interaction-modality/INV4` owns supported-modality path
  reachability; the exact query-key details follow objective editable-combobox
  and IME composition standards.
- `spec:AST-056/FR3`, `AR1`, and `AR2` own rendered empty-search announcement
  parity and an accessible query-field name independent of placeholder text.
- `family:overlay-dismissal` owns topmost Escape and close-request ordering;
  CommandPalette adopts it through Dialog while preserving local inline-preview
  closing because inline mode does not register as a layer.
- `architecture:layer-runtime` records that the modal path delegates Escape to
  Dialog's shared dismissal registration while the unregistered inline preview
  preserves local closing.

## Verification map

| Contract            | Verification                                                                                                                                                                         | Representative states                                                     | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                       | Audit section                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| FR1, AR1            | CommandPalette root and subcomponent suites; `CommandPalette.test.tsx` pending-state cases; `CommandPalettePending.a11y.chromium.spec.ts` (pending keeps the empty surface's height) | Default, grouped, empty, pending, rich Empty, and replaced slots          | Exposing an empty listbox, leaving empty Input popup attributes, or nesting rich Empty controls under option semantics fails focused role assertions. Evidence gap: FR1's `footer` rule (the default footer only when `footer` is omitted, `null`, or `undefined`; `footer={false}` leaves an empty footer bar) is source-inspected; no test passes `footer={false}`. | `audit:CommandPalette/anatomy`     |
| FR2                 | Focused subcomponent suites and `themingTargets.test.ts`                                                                                                                             | Seven local targets at their owned elements                               | Removing or moving a current target fails a focused placement assertion or the global inventory.                                                                                                                                                                                                                                                                      | `audit:CommandPalette/theming`     |
| FR3                 | `CommandPaletteInput.test.tsx` and `CommandPaletteFooter.test.tsx`                                                                                                                   | Default Search glyph, pending spinner, and Footer Kbd                     | Replacing or removing the delegated Icon, Spinner, or Kbd instance fails a composed-owner assertion.                                                                                                                                                                                                                                                                  | `audit:CommandPalette/theming`     |
| FR4                 | `CommandPaletteInput.test.tsx`                                                                                                                                                       | Native query field with idle and pending Input                            | Removing the field fails combobox tests; adding a field target requires an explicit map update.                                                                                                                                                                                                                                                                       | `audit:CommandPalette/anatomy`     |
| FR5, AR2, AR3       | `CommandPalette.test.tsx`                                                                                                                                                            | Modal host with nested layer; inline preview                              | Restoring local modal Escape handling closes the host instead of the nested surface; removing the inline branch loses preview closing.                                                                                                                                                                                                                                | `audit:CommandPalette/interaction` |
| FR6, AR4            | `CommandPalette.test.tsx` and `CommandPaletteInput.test.tsx`                                                                                                                         | Home, End, PageDown, Enter, and active IME composition                    | Routing Home/End to results or forwarding a composing command key fails user-event and native composition assertions.                                                                                                                                                                                                                                                 | `audit:CommandPalette/interaction` |
| FR7, AR7            | `CommandPalette.test.tsx` and `CommandPaletteInput.test.tsx`                                                                                                                         | Populated, empty, and repopulated result sets                             | Preserving an out-of-range highlight or emitting its nonexistent active descendant fails transition and direct bounds assertions.                                                                                                                                                                                                                                     | `audit:CommandPalette/a11y`        |
| FR8, AR5, AR6       | `CommandPalette.test.tsx`, `CommandPaletteInput.test.tsx`, and i18n checks                                                                                                           | Rich caller Empty content; default and caller query names                 | Announcing catalog copy over rendered caller content or naming the query only through placeholder text fails live-region, name, and catalog assertions.                                                                                                                                                                                                               | `audit:CommandPalette/a11y`        |
| FR10                | `CommandPalette.test.tsx` "a rejected search source" suite                                                                                                                           | Bootstrap rejects; a search rejects or throws; a superseded query rejects | A rejection that reaches an error boundary, leaves the busy state on, keeps stale rows, or lets a superseded query clear the current results fails.                                                                                                                                                                                                                   | `audit:CommandPalette/interaction` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                        | Canonical anatomy and seven current local targets                         | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation. Gap: no check fails if a mapped part stops painting.                                                                                                                                                                                                                            | `audit:CommandPalette/theming`     |

Focused target-placement assertions cover all seven local targets. The composed
Input and Footer tests also pin the delegated Search Icon, pending Spinner, and
four default Kbd shortcuts.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Should Query field gain a stable public theming target?** (`human-api`)
  It has no direct target today, and no owner has decided whether it should.
- **OQ2 — Should `architecture:public-component-api` INV5 state the
  composite-semantics reading family-wide?** (`human-api`) Inside a composite
  such as CommandPalette, roles like `combobox`, `listbox`, and `option` and
  option state are component-owned and replace a caller's, as
  `component:CommandPaletteInput` AR3 records, while a caller's explicit name
  still wins. Stating it in INV5 would make every composite follow it; leaving
  it here keeps it a CommandPalette reading that other composites may not
  share.

## Content boundary

This file does not duplicate consumer prop tables/examples, shared layer or
modality rules, or implementation steps. It links to
their owners.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteEmpty.spec.md -->


# CommandPaletteEmpty component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CommandPaletteEmpty` / `CommandPaletteEmptyProps`: required `children`, `BaseProps<HTMLDivElement>`, and a root `ref`.                                                                         |
| Behavior                | One ordinary container centers caller content as supporting text. CommandPalette renders it for the no-query and no-results branches; it owns no role, state, announcement, or interaction.     |
| End-user impact         | People who reach a palette dead end read the message, and any caller link stays ordinary reachable content rather than an option.                                                               |
| Builder impact          | None.                                                                                                                                                                                           |
| Compatibility/readiness | Records shipped behavior; no public change. Evidence still pending for the claims listed as read from source.                                                                                   |
| Review checks           | Reject a component-owned role or live region, option semantics around caller content, dropped root inputs, a target moved off the painted root, or content that overflows its host inline axis. |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV8`; `architecture:component-theming-surface/INV2–INV6`; `spec:AST-056/FR3`, `AR1` for the parent's announcement; WCAG 2.2 SC 1.4.3 and 1.4.10.  |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteEmpty presents the message shown in a CommandPalette result area
when there is nothing to choose. It owns the empty-message surface: its layout,
supporting typography, secondary text color, root input composition, and the
`command-palette-empty` theme target. CommandPalette decides when the message
appears, what it says by default, and whether it is announced.

Consumer syntax and examples belong in `CommandPaletteEmpty.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One root container and its public ref, DOM/data/ARIA, class, style, event, and
  `xstyle` composition.
- Centered layout, block and inline padding, supporting type size and leading,
  body font family, and secondary text color for caller content.
- Wrapping caller text inside the host's inline size.
- The `command-palette-empty` target on the same painted root.

**Does not own / non-goals**

- When the empty branch appears, the built-in catalog messages, and the
  empty-search announcement — owned by `component:CommandPalette`.
- Result-surface semantics while empty, including dropping listbox semantics —
  owned by `component:CommandPalette` and `component:CommandPaletteList`.
- The meaning, links, or controls inside caller content — owned by the product
  callsite.

## Public concepts

| Concept       | Closed values or states                       | Meaning                                                             | Availability by variant/orientation/state                        | Default  | Owner                | Stability | Invalid-value behavior                                  |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- | -------- | -------------------- | --------- | ------------------------------------------------------- |
| Empty message | caller `ReactNode`: text or elements          | The supporting message people read when there is nothing to choose. | No-query and no-results palette branches; standalone composition | required | component            | stable    | Rendered as given; React decides non-renderable values. |
| Root surface  | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the message root.                                           | Every render                                                     | omitted  | public component API | stable    | Accepted inputs compose; the component adds no role.    |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                           | Basis                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| FR1 | The component MUST render its children inside one container element that centers them on both axes with centered text, supporting type, body font family, and secondary text color. | Current source, consumer docs, and focused tests                             |
| FR2 | CommandPalette MUST render this component with `emptyBootstrapText` when there is no query and no result, and with `emptySearchText` when a query has no result.                    | Current source and tests                                                     |
| FR3 | The root MUST carry no component-owned role, live region, or focus stop, so caller links and controls remain ordinary content.                                                      | WAI-ARIA 1.2 listbox owned-children rule; current source and tests           |
| FR4 | Caller text MUST wrap inside the host's inline size, including a single unbroken token, so no message forces inline scrolling or clipping at 320 CSS px.                            | WCAG 2.2 SC 1.4.10; current source                                           |
| FR5 | The painted root MUST carry the `command-palette-empty` target; component styles apply before caller `xstyle`.                                                                      | `architecture:component-theming-surface/INV2–INV6`; source and focused tests |
| FR6 | Accepted ref, DOM/data/ARIA, class, style, events, and `xstyle` MUST reach or compose on the root.                                                                                  | `architecture:public-component-api/INV5–INV8`; focused tests                 |

### Allowed variation

- **AV1 — Theme paint.** The target may restyle the message surface and text
  without changing semantics or layout ownership.
- **AV2 — Caller content.** Text length, translation, inline elements, and links
  may vary while the root stays one ordinary container.

### Representative states

| State                  | Required invariant                                                            | Allowed variation                             |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| Palette no-query empty | The bootstrap message renders in the result area; no listbox is exposed.      | Built-in catalog text or caller content.      |
| Palette no-result      | The search message renders; CommandPalette announces the rendered text.       | Built-in catalog text or caller rich content. |
| Standalone             | The same root renders outside a palette with caller content.                  | Host layout and caller roles.                 |
| Long or translated     | Text wraps inside the host; no inline overflow.                               | Line count grows.                             |
| RTL                    | Centered layout and text remain direction-neutral; inline text order mirrors. | Caller content direction.                     |
| Narrow viewport        | The message wraps within a 320 CSS px host.                                   | Line count grows.                             |

### Transformation and precedence order

- **ORD1 — Root composition.** Apply the target class, component styles, then
  caller `xstyle`; append caller `className`; apply caller `style`; spread
  remaining host props onto the root.

### Performance and resources

- **PR1 — No lifecycle.** CommandPaletteEmpty uses no hook, listener, observer,
  timer, request, state, or Effect.

## Accessibility contract

- **AR1 — Ordinary content.** The root exposes caller content in reading order
  with no added role; a caller link keeps its own role and focus behavior.
- **AR2 — Readable message.** Message text meets the WCAG 2.2 SC 1.4.3 contrast
  minimum against its rendered surface in every supported theme and mode.

## Design relationships

| Anatomy or state | Design requirement                                                        | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Empty message    | Presents the dead-end message as supporting text centered in the results. | Current source tokens    | supporting     | FR1, FR4, FR5      |

No component-local design decision is recorded. The aggregate CommandPalette
anatomy map, owned by `component:CommandPalette`, maps the Empty part.

## Family and system relationships

- `architecture:public-component-api` owns exports and root input composition.
- `architecture:component-theming-surface` owns target placement.
- `architecture:component-test-sufficiency` owns proportionate, observable
  evidence.
- `spec:AST-056/FR3` and `AR1` require CommandPalette to announce the
  empty-search message it rendered; this component supplies the rendered node.
- `component:CommandPalette` and `component:CommandPaletteList` own the parent
  branches and the empty result surface.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract      | Verification                                             | Representative states                                                  | Mutation or failure expectation                                                                                                                                                   | Audit section                             |
| ------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1, FR5–FR6  | `CommandPaletteEmpty.test.tsx`; `themingTargets.test.ts` | text and element children; root inputs                                 | A dropped input, a moved target, or lost children fails the focused assertions.                                                                                                   | `audit:CommandPaletteEmpty/§2,§3,§4`      |
| FR2, FR3, AR1 | `CommandPalette.test.tsx`; `CommandPaletteList.test.tsx` | bootstrap, search, rich content, modal and inline                      | Exposing a listbox, adding a role, or announcing other text than the rendered message fails assertions.                                                                           | `audit:CommandPaletteEmpty/§1,§4`         |
| FR4, AR2      | `CommandPaletteEmptyAudit.a11y.chromium.spec.ts`         | Narrow and wide viewports; light and dark; forced colors; rich content | A case with horizontal overflow at 320 CSS px fails the audit manifest test. Gap: the audit records message contrast without gating on it, so contrast below 4.5:1 does not fail. | `audit:CommandPaletteEmpty/accessibility` |
| PR1           | Source review                                            | Every state                                                            | Gap: no automated check fails if CommandPaletteEmpty adds a hook, listener, or Effect.                                                                                            | `audit:CommandPaletteEmpty/behavior`      |

Read from source, with no focused test yet:

- FR1: centering, supporting type, body font, and secondary text color.
- AR2: message contrast in each theme and mode.
- PR1: no hook, listener, or lifecycle of the component's own.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, implementation
steps, or system rules. It links to their owners.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteFooter.spec.md -->


# CommandPaletteFooter component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CommandPaletteFooter` with optional `children`, `ref`, `xstyle`, `className`, `style`, and root DOM props.                               |
| Behavior                | A footer row of keyboard guidance: by default, the navigate, select, and close shortcuts with translated labels; `children` replace them. |
| End-user impact         | People see which keys move through, run, and close the palette.                                                                           |
| Builder impact          | None.                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no public change.                                                                                               |
| Review checks           | Reject a footer that takes a role or name of its own, a lost default shortcut, or guidance that cannot wrap.                              |
| Governing rules         | `component:Kbd`; `architecture:public-component-api`; `architecture:component-theming-surface`.                                           |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteFooter is the guidance row at the bottom of a CommandPalette.
Consumer usage lives in `CommandPaletteFooter.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The footer root, its layout, supporting text style, and the
  `command-palette-footer` target (FR1, FR3).
- The default guidance and its replacement by `children` (FR2).
- Root ref, DOM props, and styling (FR4).

**Does not own / non-goals**

- Painting each shortcut — owned by `component:Kbd`.
- The keyboard behavior the guidance describes — owned by
  `component:CommandPalette`.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                               | Basis                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root is a wrapping row of supporting text in the secondary color, with no role or name of its own.                                                                                                  | Current source and tests |
| FR2 | Without `children`, the root shows three hints in order: Up and Down with the translated navigate label, Enter with select, and Escape with close, each shortcut a `Kbd`. `children` replace all three. | Current source and tests |
| FR3 | The root carries the `command-palette-footer` target.                                                                                                                                                   | Current source and tests |
| FR4 | `ref`, DOM props, `className`, `style`, and `xstyle` reach the root, with the caller's class after the generated ones.                                                                                  | Current source and tests |

### Allowed variation

- **AV1 — Guidance.** Callers may replace the default hints.
- **AV2 — Translation.** Label text follows the active locale.

### Representative states

| State          | Required invariant                          | Allowed variation |
| -------------- | ------------------------------------------- | ----------------- |
| Default        | Navigate, select, and close hints in order. | Locale.           |
| Custom         | `children` replace the defaults.            | Content.          |
| Narrow surface | Hints wrap onto more lines.                 | Line count.       |

### Transformation and precedence order

- **ORD1 — Content.** `children` when given, otherwise the default hints.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — No owned semantics.** The footer adds no role, name, or focus
  target; each shortcut's semantics are Kbd's.

## Design relationships

| Anatomy or state  | Design requirement                     | Representation authority | Hierarchy role | Component contract |
| ----------------- | -------------------------------------- | ------------------------ | -------------- | ------------------ |
| Footer            | A wrapping row of supporting guidance. | Current source           | Supporting     | FR1, FR3           |
| Keyboard shortcut | Shows one shortcut.                    | `component:Kbd`          | Supporting     | FR2                |

The aggregate CommandPalette anatomy map, owned by `component:CommandPalette`,
maps the Footer and Keyboard shortcut parts.

## Family and system relationships

- `component:Kbd` owns shortcut painting and semantics.
- `component:CommandPalette` owns the keyboard behavior the guidance names.

## Verification map

| Contract | Verification                                                                            | Representative states | Mutation or failure expectation                    | Audit section                           |
| -------- | --------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------- | --------------------------------------- |
| FR1, AR1 | `CommandPaletteFooter.test.tsx` wrap test; `CommandPaletteFooter.a11y.chromium.spec.ts` | narrow; LTR and RTL   | A role or name on the root, or no wrapping, fails. | `audit:CommandPaletteFooter/layout`     |
| FR2      | `CommandPaletteFooter.test.tsx` default-labels and custom-children tests                | default; custom       | A lost hint or ignored children fails.             | `audit:CommandPaletteFooter/behavior`   |
| FR3      | `CommandPaletteFooter.test.tsx` "carries the stable theme target on its single root"    | any                   | A missing target fails.                            | `audit:CommandPaletteFooter/theming`    |
| FR4      | `CommandPaletteFooter.test.tsx` className, xstyle, style, ref, and DOM-prop tests       | root inputs           | A dropped input fails.                             | `audit:CommandPaletteFooter/public-api` |

Read from source, with no focused test yet:

- FR1: the supporting type and secondary color.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, or
CommandPalette's search and keyboard behavior. It links to their owners.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteGroup.spec.md -->


# CommandPaletteGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `CommandPaletteGroup` with a required string `heading`, `children`, `ref`, `xstyle`, `className`, `style`, and root DOM props. |
| Behavior                | A `group` of command results named by `heading`, with the heading shown as a visual label above them.                          |
| End-user impact         | Related commands appear under a visible heading, and screen-reader users hear the group's name when they move into it.         |
| Builder impact          | None.                                                                                                                          |
| Compatibility/readiness | Records shipped behavior; no public change.                                                                                    |
| Review checks           | Reject an unnamed group, a heading read twice, or a heading target that merges with the group target.                          |
| Governing rules         | `component:CommandPalette`; `architecture:public-component-api` INV5; `architecture:component-theming-surface`.                |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteGroup gathers related command results under a heading inside a
CommandPalette list. Consumer usage lives in `CommandPaletteGroup.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

None.

## Ownership boundary

**Owns**

- The group root, its role and name, and the `command-palette-group` target
  (FR1, FR3).
- The visual heading and its `command-palette-group-heading` target (FR2, FR3).
- Root ref, DOM props, and styling (FR4).

**Does not own / non-goals**

- Option semantics and activation — owned by `component:CommandPaletteItem`.
- The list, search, and keyboard navigation — owned by
  `component:CommandPalette` and `component:CommandPaletteList`.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                         | Basis                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root has `role="group"` and is named by `heading` through `aria-label`, unless the caller supplies its own `role` or `aria-label` (FR4), and lays its heading and children out in one column. | Current source and tests |
| FR2 | The heading renders `heading` as supporting text before the children and is hidden from assistive technology, so the name is read once.                                                           | Current source and tests |
| FR3 | The root carries `command-palette-group` and the heading carries the separate `command-palette-group-heading` target.                                                                             | Current source and tests |
| FR4 | `ref`, DOM props, `className`, `style`, and `xstyle` reach the root, and a caller's explicit `role` or `aria-label` reaches it (`architecture:public-component-api` INV5).                        | Current source           |

### Allowed variation

- **AV1 — Content.** The heading text and the grouped items vary.
- **AV2 — Theme.** Themes restyle the group and the heading separately.

### Representative states

| State           | Required invariant                          | Allowed variation |
| --------------- | ------------------------------------------- | ----------------- |
| Grouped results | A named group with a hidden visual heading. | Items.            |

### Transformation and precedence order

- No precedence rule.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named group.** The group is named by `heading` (FR1), unless the
  caller supplies its own `aria-label` (FR4).
- **AR2 — One reading.** The visual heading is hidden from assistive
  technology, so the name is not repeated (FR2).

## Design relationships

| Anatomy or state | Design requirement                     | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------- | ------------------------ | -------------- | ------------------ |
| Group            | Gathers related results in one column. | Current source           | Supporting     | FR1, FR3           |
| Group heading    | Labels the group with supporting text. | Current source           | Supporting     | FR2, FR3           |

The aggregate CommandPalette anatomy map, owned by `component:CommandPalette`,
maps the Group and Group heading parts to these targets.

## Family and system relationships

- `component:CommandPalette` owns the aggregate anatomy and the composite
  keyboard model; `component:CommandPaletteItem` owns the options inside.

## Verification map

| Contract | Verification                                                                        | Representative states | Mutation or failure expectation                                                                           | Audit section                             |
| -------- | ----------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1, AR1 | `CommandPaletteGroup.test.tsx` "has group role with aria-label"                     | grouped results       | A missing role or name fails.                                                                             | `audit:CommandPaletteGroup/accessibility` |
| FR2, AR2 | `CommandPaletteGroup.test.tsx` heading, `aria-hidden`, and decorative-heading tests | grouped results       | A heading exposed to assistive technology fails.                                                          | `audit:CommandPaletteGroup/accessibility` |
| FR3      | `CommandPaletteGroup.test.tsx` heading-target tests; `themingTargets.test.ts`       | grouped results       | A missing or merged target fails.                                                                         | `audit:CommandPaletteGroup/theming`       |
| FR4      | Source review                                                                       | Caller inputs         | Gap: no test covers `ref`, DOM props, `className`, `style`, `xstyle`, or a caller `role` or `aria-label`. | `audit:CommandPaletteGroup/api`           |

Read from source, with no focused test yet:

- FR1: the one-column layout.
- FR4: `ref`, DOM props, `className`, `style`, and `xstyle` on the root.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, or
CommandPalette's search and keyboard behavior. It links to their owners.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteInput.spec.md -->


# CommandPaletteInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | A query field with context-backed search state, optional trailing content, and a split wrapper/field attribute boundary.                                                                                                            |
| Behavior                | Standalone use without popup attributes is a searchbox; caller popup attributes or CommandPalette context supply combobox state and relationships. On a touch keyboard the field shows a Search key and does not autocorrect (FR6). |
| End-user impact         | Screen-reader users receive role and popup state that match whether a controlled result popup exists.                                                                                                                               |
| Builder impact          | Context-owned popup semantics cannot be replaced through native passthrough props; standalone caller-owned popup semantics remain supported.                                                                                        |
| Compatibility/readiness | A `[fix]` restores no-popup semantics while preserving released caller-owned popup associations, and names the field "Search commands" by default instead of its placeholder; primary callback naming remains OQ1.                  |
| Review checks           | Reject unassociated standalone combobox state, clobberable owned popup semantics, empty trailing chrome, or changed input ref routing.                                                                                              |
| Governing rules         | `architecture:public-component-api/INV2,INV4,INV5`; `spec:AST-017/FR1,FR3,FR5,FR7,FR53`; `spec:AST-020/FR1,FR2`; `spec:AST-056/AR2`; `family:input-fields/FR12`; WCAG 2.2 4.1.2.                                                    |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteInput presents the text query for a command palette. It can bind
to CommandPalette search and navigation context or act as an independent search
field when no result-popup context is present.

## Compatibility and migration

- Released default preserved: `no` for no-popup standalone semantic output and
  for the default accessible name; caller-owned popup associations and all other
  CommandPalette output remain equivalent
- Compatibility class: contract restoration under `spec:AST-017/FR1,FR3,FR5` for
  standalone semantics, since no-popup standalone use has no released popup
  association to preserve; accessibility behavior fix under `spec:AST-017/FR53`
  for the default name
- Search keyboard hint: FR6's `enterkeyhint` and `autocorrect` are a patch
  `[feat]` under `spec:AST-017/FR5,FR7`; they change no API, and Enter keeps
  FR2's routing
- Controlled/uncontrolled behavior: unchanged
- Migration decision: `role="combobox"` keeps the earlier standalone semantics,
  and `label` or `aria-label` keeps a specific name; the primary callback naming
  question remains OQ1

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The arrangement inside Input: Search glyph, native Query field, Loading spinner
  placement, and Trailing content.
- The query field's role and popup state when CommandPalette context is present.
- Context fallback for the search value, value updates, and keyboard navigation.

**Does not own / non-goals**

- The result popup, option collection, selection, or search orchestration — owned
  by `component:CommandPalette` and its list/item parts.
- Spinner and search-glyph rendering — delegated to Spinner and Icon.
- Caller-provided trailing content behavior — owned by the product callsite.

## Public concepts

| Concept          | Closed values or states                                                              | Meaning                                          | Availability by variant/orientation/state | Default              | Owner                           | Stability | Invalid-value behavior                                       |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------- | -------------------- | ------------------------------- | --------- | ------------------------------------------------------------ |
| Query binding    | explicit; CommandPalette context; native                                             | Source and destination of query text changes.    | All uses                                  | context, then native | `component:CommandPaletteInput` | Released  | Missing handlers leave native state                          |
| Popup semantics  | standalone searchbox; standalone caller-owned popup; contextual CommandPalette popup | Whether the query field controls a result popup. | Context-dependent                         | standalone searchbox | `component:CommandPaletteInput` | Stable    | Standalone overrides persist; CommandPalette context wins    |
| Trailing content | busy indicator; `endContent`; both; absent                                           | Supporting status or caller content after query. | All uses                                  | absent               | `component:CommandPaletteInput` | Released  | Boolean, empty-string, null, and undefined values are absent |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                            | Basis                                                              | Draft review state                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| FR1 | Explicit `value` and `onValueChange` take precedence; otherwise CommandPalette context supplies search state; native uncontrolled state remains when neither exists.                                                                                           | Released source, docs, and tests                                   | Verified current behavior                                  |
| FR2 | Consumer `onKeyDown` runs before contextual navigation; preventing the event, or an active IME composition, prevents contextual delegation.                                                                                                                    | Released source and tests                                          | Verified current behavior                                  |
| FR3 | `ref` and native passthrough attributes reach the native query field; standalone caller-owned popup semantics persist, while CommandPalette context owns its popup role and relationships; `xstyle`, `className`, and `style` customize the surrounding Input. | Released source and docs; `architecture:public-component-api/INV5` | Verified current routing                                   |
| FR4 | Pending state and renderable `endContent` share one trailing-content group; booleans, empty strings, null, and undefined do not create empty trailing chrome.                                                                                                  | React rendering semantics and current utility contract             | Verified current behavior                                  |
| FR5 | Auto-focus is enabled by default and suppressed inside an inline Dialog; `hasAutoFocus={false}` suppresses both focus work and the autofocus marker.                                                                                                           | Released source, docs, and tests                                   | Verified current behavior; browser timing evidence remains |
| FR6 | The query field carries `enterkeyhint="search"` and `autocorrect="off"`, standalone and inside CommandPalette, as `family:input-fields` FR12 states for search inputs; Enter keeps FR2's routing whatever the key shows.                                       | `family:input-fields/FR12, DEC-10`                                 | Verified current behavior                                  |

### Allowed variation

- **AV1 — Query content.** Value, placeholder, label, and caller-provided trailing
  content may vary without changing semantic ownership.
- **AV2 — Delegated visuals.** Icon and Spinner may change internal markup while
  preserving their public contracts.

### Representative states

| State                    | Required invariant                                                | Allowed variation                    |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------ |
| Standalone, no popup     | Named searchbox with no popup-only ARIA state.                    | Explicit value and change handler.   |
| Standalone, caller popup | Caller role, state, relationships, and active descendant persist. | Caller-owned popup model.            |
| Contextual, closed       | Named combobox references the list and reports collapsed state.   | Query value and trailing content.    |
| Contextual, no results   | Named combobox reports collapsed state and references no list.    | Empty or pending message.            |
| Contextual, open         | Named combobox references the list and reports expanded state.    | Highlighted option and result count. |
| Contextual, highlighted  | Active descendant names the context-owned highlighted option.     | Highlighted index.                   |
| Pending or trailing      | Supporting content remains at the logical trailing edge.          | Spinner, caller content, or both.    |
| Inline Dialog            | Mount does not steal focus from the surrounding page.             | Query and result content.            |

### Transformation and precedence order

- **ORD1 — Search state.** Explicit props → CommandPalette context → native
  uncontrolled state.
- **ORD2 — Keyboard handling.** Consumer handler → default-prevented or
  IME-composition check → CommandPalette context handler.
- **ORD3 — Accessible name.** Native `aria-label` → `label` → the translated
  default "Search commands" (DEC-1). Placeholder text is never the name.

### Performance and resources

- **PR1 — Focus scheduling.** At most one animation-frame focus request is
  scheduled by a mounted eligible field; no listener or observer is retained.

## Accessibility contract

- **AR1 — Name.** The native query field always has an explicit accessible name
  from ORD3 and never takes its name from placeholder text, satisfying
  `spec:AST-056/AR2` and WCAG 2.2 4.1.2.
- **AR2 — Role and popup state.** Standalone use without popup attributes exposes
  a `searchbox` without popup-only state. Standalone callers that provide their
  own popup relationships retain those semantics. CommandPalette context exposes
  a `combobox` with context-owned expanded state, list relationship, autocomplete
  mode, and active descendant, following `spec:AST-020/FR1,FR2` and the WAI-ARIA
  combobox pattern. While the palette holds no selectable result, the field
  reports collapsed state and has no list relationship or active descendant, and
  an active descendant always names an existing option.
- **AR3 — Semantic ownership.** With CommandPalette context, the field owns
  `role`, `aria-expanded`, `aria-autocomplete`, `aria-controls`, and
  `aria-activedescendant`, and these replace the same native passthrough props;
  other ARIA props, including `aria-haspopup` and `aria-owns`, pass through.
  Standalone caller-owned roles and relationships remain intact.

## Design relationships

| Anatomy or state | Design requirement                                                                | Representation authority                  | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------ |
| Input            | Arranges Search glyph, Query field, Loading spinner, and Trailing content inline. | Current source and public docs            | Prominent      | FR3, FR4           |
| Search glyph     | Identifies the query affordance without adding a name.                            | Icon component                            | Supporting     | AR1                |
| Query field      | Receives text, focus, name, and popup semantics.                                  | Current source and accessibility standard | Prominent      | FR1–FR3, AR1–AR3   |
| Loading spinner  | Indicates a pending contextual search before Trailing content.                    | Spinner component                         | Supporting     | FR4                |
| Trailing content | Keeps caller content at logical inline-end.                                       | Current source and public docs            | Supporting     | FR4                |

## Family and system relationships

- `component:CommandPalette` owns the result-popup context, aggregate composition,
  and the open theming-reachability question; this component owns the default
  Input's query-field semantics and binds them to that context.
- `spec:AST-017` owns compatibility classification for the released standalone
  caller-popup and no-popup cases.
- `spec:AST-020` supplies the WCAG 2.2 and adopted-pattern evidence boundaries.
- `spec:AST-056/AR2` requires a query-field name distinct from placeholder text;
  ORD3 and AR1 satisfy it.

## Verification map

| Contract    | Verification                                                                                                                                                | Representative states                                         | Mutation or failure expectation                                                                                                                                | Audit section                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| FR1–FR3     | `CommandPaletteInput.test.tsx`                                                                                                                              | explicit, context, prevented key, native, caller popup        | Reversing state precedence, rerouting the ref, dropping standalone popup relationships, or allowing context semantics to be clobbered fails focused DOM tests. | `audit:CommandPaletteInput/testing`  |
| FR4         | `CommandPaletteInput.test.tsx`                                                                                                                              | numeric, empty, busy, caller content                          | Truthiness routing creates empty chrome or moves numeric content away from the trailing edge.                                                                  | `audit:CommandPaletteInput/behavior` |
| FR5         | focused unit tests plus exact-head browser evidence                                                                                                         | enabled, disabled, inline                                     | Eligible focus is lost, disabled focus is scheduled, or inline mode steals focus.                                                                              | `audit:CommandPaletteInput/behavior` |
| FR6         | `CommandPaletteInput.test.tsx` attribute and Enter cases, standalone and in context; `SearchKeyboard.interaction.browser.spec.ts` on a touch-emulated phone | standalone; contextual; a phone viewport with touch emulation | A missing `enterkeyhint` or `autocorrect`, or changed Enter routing, fails.                                                                                    | `audit:CommandPaletteInput/behavior` |
| AR1–AR3     | unit tests, exact-head axe/browser run, and source review                                                                                                   | standalone, open, closed, highlighted                         | Wrong role/state, consumer clobbering of an owned attribute, or a placeholder-derived name fails semantics and name assertions.                                | `audit:CommandPaletteInput/a11y`     |
| Theming/RTL | target inventory, Storybook fixture, and RTL D2 audit                                                                                                       | standalone trailing content, contextual                       | Target loss or physical ordering fails the owned fixture.                                                                                                      | `audit:CommandPaletteInput/theming`  |

## Decision log

### DEC-1 — The query field's default name is "Search commands"

**Reference:** `component:CommandPaletteInput/DEC-1`
**Decider:** `cixzhang`, 2026-10-14

A screen-reader user reaching the field hears what it does, whatever the
placeholder says or whether one is set. The default is a fixed, localizable
"Search commands"; `label` and `aria-label` replace it, and placeholder text is
never the name.

Rejected: falling back to the placeholder, which a caller writes as a visual
hint and AST-056 AR2 does not accept as a name.

## Open questions

- **OQ1 — How should the released `onValueChange(value)` primary callback and
  native-event `onChange(event)` exception migrate to the shared `onChange`
  callback grammar without breaking existing consumers?** (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteItem.spec.md -->


# CommandPaletteItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One result option with context-backed identity, highlight, selection, and close behavior; explicit standalone visual state and pointer activation remain available. |
| Behavior                | Consumer click runs first; cancellation stops selection; successful activation reports locally, updates context, and closes; disabled items run no click callbacks. |
| End-user impact         | Disabled commands cannot activate, and keyboard focus, selected value, and option identity remain distinct and consistently exposed.                                |
| Builder impact          | None.                                                                                                                                                               |
| Compatibility/readiness | Records shipped behavior; no public change. Two implementation gaps, listed under Current-state impact; two owner questions stay open.                              |
| Review checks           | Reject disabled activation, dropped standalone DOM identity, highlight-as-selection ARIA, nested interactive children, or a second context scroll owner.            |
| Governing rules         | `architecture:public-component-api/INV5,INV7`; `architecture:interaction-modality`; `spec:AST-017/FR1,FR3,FR5`; `spec:AST-020/FR1,FR2`; WAI-ARIA 1.2 `option`.      |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteItem presents one command result as an option. CommandPalette
context supplies composite state and keyboard ownership; the item owns its option
semantics, visual states, pointer activation, native passthrough boundary, and
standalone scroll behavior.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: explicit item state still precedes context
  state, then the existing false default
- Migration decision: none; OQ1 holds any change to the standalone keyboard
  contract. Item `onSelect` reports pointer activation only; keyboard selection
  is reported through the root's `onValueChange`.

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A standalone option has no keyboard model.** Outside CommandPalette the
  item exposes `role=option` and pointer activation but no owning listbox
  keyboard model, so a keyboard user cannot reach or activate it; WAI-ARIA 1.2
  options belong to a composite that owns their keyboard interaction (AR5, OQ1).
- **Selected paint hides keyboard highlight.** When an item is both highlighted
  and selected, the selected background masks the highlighted one, so the
  keyboard position is not visible on that item (AV2, OQ2).

## Ownership boundary

**Owns**

- The option root, item value marker, selected and disabled ARIA state, and
  `command-palette-item` theme target.
- Explicit → CommandPalette context → false precedence for highlighted and
  selected visual state.
- Pointer activation order, disabled suppression, and context selection/close.
- Standalone highlighted-item scroll behavior and the inline-preview initial
  scroll suppression.

**Does not own / non-goals**

- CommandPalette's listbox, query-field active descendant, arrow-key navigation,
  Enter handling, search results, or root `onValueChange` callback.
- Grouping, list layout, or caller-provided non-interactive item content.
- A standalone composite listbox keyboard model; its direction remains OQ1.
- Interactive descendants. Buttons and links are sibling actions or separate
  commands, not content inside an option.

## Public concepts

| Concept       | Closed values or states                             | Meaning                                           | Availability             | Default | Owner                          | Stability | Invalid-value behavior                                    |
| ------------- | --------------------------------------------------- | ------------------------------------------------- | ------------------------ | ------- | ------------------------------ | --------- | --------------------------------------------------------- |
| Highlight     | explicit; context index; false                      | Active keyboard result, painted but not selected. | All uses                 | false   | `component:CommandPaletteItem` | Stable    | Unknown context value leaves every item unhighlighted.    |
| Selection     | explicit; context value; false                      | Chosen value exposed through `aria-selected`.     | All uses                 | false   | `component:CommandPaletteItem` | Stable    | Duplicate values resolve ambiguously; values stay unique. |
| Availability  | enabled; disabled                                   | Whether pointer activation is available.          | All uses                 | enabled | `component:CommandPaletteItem` | Stable    | Disabled suppresses consumer and component callbacks.     |
| Item identity | context-generated id; standalone caller-provided id | DOM identity used by active-descendant or caller. | Contextual or standalone | absent  | component or caller            | Stable    | Context identity wins only for a registered item.         |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                              | Basis                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| FR1 | Native props and `ref` reach the option root. The `option` role, selected state, and disabled state replace a caller's: inside CommandPalette because composite semantics are component-owned and replace passthrough, as `component:CommandPaletteInput` AR3 records, and standalone by this record's own rule. CommandPalette context owns the registered-item id and value marker; a standalone caller id persists. | Current source and tests; `architecture:public-component-api` |
| FR2 | Pointer activation runs consumer `onClick`, then stops when prevented; otherwise it calls item `onSelect`, then context selection and close. Disabled items run none of those paths.                                                                                                                                                                                                                                   | Current source and tests                                      |
| FR3 | Explicit `isHighlighted` and `isSelected` precede context-derived values, then false. Highlight paints active state only; selection alone drives `aria-selected`.                                                                                                                                                                                                                                                      | Current source, tests, and docs                               |
| FR4 | Context owns highlighted-item scrolling. Outside context, a highlighted item scrolls nearest, except an initially highlighted item inside an inline Dialog does not scroll.                                                                                                                                                                                                                                            | Current source and tests                                      |
| FR5 | Children provide the option's label and supporting presentation, without nested interactive descendants.                                                                                                                                                                                                                                                                                                               | Option semantics and `spec:AST-020/FR1,FR2`                   |

### Allowed variation

- **AV1 — Content.** Labels, icons, descriptions, and shortcut hints may vary
  while remaining non-interactive.
- **AV2 — Visual state.** Highlight, selection, and disabled state may occur
  independently or together. The current selected paint masks highlighted paint
  when both are true; OQ2 holds the visible-state remedy.
- **AV3 — Layout.** Consumer `xstyle`, class, and style may adjust the single
  root without replacing its option semantics.

### Representative states

| State                | Required invariant                                                        | Allowed variation                 |
| -------------------- | ------------------------------------------------------------------------- | --------------------------------- |
| Enabled standalone   | Caller id and native props persist; pointer activation reports locally.   | Content and visual state.         |
| Disabled standalone  | `aria-disabled` is true and no click callback fires.                      | Content.                          |
| Context highlighted  | Context item id matches active descendant and highlight is not selection. | Item index and content.           |
| Context selected     | Matching value exposes `aria-selected=true`.                              | Highlight may be same or another. |
| Consumer-cancelled   | Consumer click runs; local and context selection/close do not.            | Consumer side effect.             |
| Inline initial state | Initial standalone highlight does not scroll the surrounding preview.     | Selected value and content.       |

### Transformation and precedence order

- **ORD1 — Visual state.** Explicit item prop → CommandPalette context → false.
- **ORD2 — Pointer activation.** Disabled guard → consumer click → prevented
  check → item `onSelect` → context select → context close.
- **ORD3 — Identity.** Registered context id → standalone caller id → absent.

### Performance and resources

- **PR1 — Lookup.** Context matching remains bounded by the current flat result
  list and performs no listener, observer, or per-item registry work.
- **PR2 — Scroll ownership.** One owner scrolls a highlighted contextual item;
  standalone items schedule no work when not highlighted.

## Accessibility contract

- **AR1 — Option semantics.** The root exposes `role=option` (FR1); its content or
  caller label provides the accessible name, and `aria-selected` reports chosen
  value rather than visual highlight.
- **AR2 — Composite ownership.** Inside CommandPalette, the query field retains
  focus and points to the context-generated item id; CommandPalette owns arrow
  navigation and Enter selection under its adopted listbox/combobox model.
- **AR3 — Disabled state.** Disabled items expose `aria-disabled=true` and
  suppress every pointer activation callback, and the interaction overlay is
  omitted.
- **AR4 — Content.** Item children contain no nested button, link, or other
  interactive descendant whose semantics would be lost when the `option`
  role makes its descendants presentational, following WAI-ARIA 1.2 and
  `spec:AST-020/FR1,FR2`.
- **AR5 — Standalone gap.** A standalone option has no owning composite keyboard
  model (Current-state impact; OQ1).

## Design relationships

| Anatomy | Design requirement                                                                                                             | Representation authority       | Hierarchy role | Component contract |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | -------------- | ------------------ |
| Item    | Paints enabled, highlighted, selected, disabled, and press states on one root. Selected masks highlight when both apply (OQ2). | Current source and public docs | Prominent      | FR1–FR4, AR1–AR3   |
| Content | Supplies the option name and non-interactive supporting presentation.                                                          | Product callsite               | Supporting     | FR5, AR1, AR4      |

## Family and system relationships

- `component:CommandPalette` owns composite search, listbox, active-descendant,
  keyboard, and close orchestration; this component binds one option to it.
- `architecture:interaction-modality` owns shared pointer and keyboard behavior.
- `architecture:public-component-api` owns native passthrough and released API
  compatibility.
- `architecture:component-theming-surface` owns the aggregate Item anatomy map
  and stable `command-palette-item` target.
- `spec:AST-017` holds OQ1 against silent released-contract changes.
- `spec:AST-020` supplies accessibility evidence and adopted-pattern boundaries.
- WAI-ARIA 1.2 option semantics make descendants presentational, so interactive
  controls do not belong inside this option root.

## Verification map

| Contract          | Verification                                                        | Representative states                             | Mutation or failure expectation                                                                             | Audit section                            |
| ----------------- | ------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| FR1, FR3, AR1–AR2 | `CommandPaletteItem.test.tsx`, `CommandPalette.test.tsx`            | standalone; context highlighted/selected          | Dropped id/ref/native prop, clobberable role/state, or highlight-as-selection fails focused DOM assertions. | `audit:CommandPaletteItem/a11y`          |
| FR2, AR3          | `CommandPaletteItem.test.tsx`                                       | enabled; disabled; consumer-cancelled; contextual | Disabled consumer activation, ignored cancellation, missing local report, selection, or close fails tests.  | `audit:CommandPaletteItem/behavior`      |
| FR4, PR2          | `CommandPaletteItem.test.tsx`, `CommandPalette.test.tsx`            | standalone; inline initial; changed highlight     | Lost nearest scrolling, duplicate contextual scrolling, or initial inline scroll fails Effect assertions.   | `audit:CommandPaletteItem/behavior`      |
| Theme/RTL         | focused class assertion, `themingTargets.test.ts`, RTL verified N/A | all visual states                                 | Target loss fails inventory/DOM tests; any new directional behavior requires a non-empty RTL dimension.     | `audit:CommandPaletteItem/theming`       |
| FR5, AR4          | Source review                                                       | Item children                                     | Gap: no check fails if item children contain a nested interactive descendant.                               | `audit:CommandPaletteItem/accessibility` |
| AR5               | Source review                                                       | Standalone item                                   | Gap: no standalone keyboard model exists to test (OQ1).                                                     | `audit:CommandPaletteItem/accessibility` |
| PR1               | Source review                                                       | Inside CommandPalette                             | Gap: no automated check fails if context matching adds a listener, an observer, or per-item registry work.  | `audit:CommandPaletteItem/behavior`      |

Read from source, with no focused test yet:

- FR5, AR4: children carrying no interactive descendant.
- AR3: the omitted interaction overlay on a disabled item.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — What standalone keyboard contract should CommandPaletteItem expose?**
  (`human-api`) Current standalone use exposes an option and pointer activation
  but no owning listbox keyboard model. Decide whether a public composite owner
  must supply that model, the item should gain a different standalone role and
  interaction contract, or standalone activation should enter a migration path.
- **OQ2 — How should keyboard highlight remain visible when the item is also
  selected?** (`human-design`) Current selected background paint follows and
  masks the highlighted background; any appearance remedy needs owner
  direction.

## Content boundary

This file does not duplicate consumer examples, implementation steps, aggregate CommandPalette search/list behavior, or shared system rules.

---

<!-- source: docs/specs/components/CommandPalette/CommandPaletteList.spec.md -->


# CommandPaletteList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CommandPaletteList` with `label`, `children`, `ref`, `xstyle`, `className`, `style`, and root DOM props: the named listbox of results that CommandPalette renders, or a standalone results list.                                                                                   |
| Behavior                | The root is a `listbox` named by a caller's `aria-label`, else `label`, else the translated default (the caller's `aria-label` is an FR2 gap today); inside CommandPalette it is one only while selectable results exist, and carries the context list id the query field controls. |
| End-user impact         | Screen-reader users reach a named results list from the query field; overflowing results scroll inside the list instead of growing the palette.                                                                                                                                     |
| Builder impact          | A builder's explicit `aria-label` is meant to name the list; today the component's name replaces it (FR2 gap).                                                                                                                                                                      |
| Compatibility/readiness | Records shipped behavior; no public change. Two implementation gaps, listed under Current-state impact; one owner question stays open.                                                                                                                                              |
| Review checks           | Reject a second list-id owner, a `listbox` role a caller can replace, a caller `aria-label` that does not reach the root, dropped native or styling inputs, or a list target moved off the scrolling root.                                                                          |
| Governing rules         | `architecture:public-component-api/INV5,INV6,INV8`; `architecture:component-theming-surface`; WAI-ARIA 1.2 `listbox`.                                                                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

CommandPaletteList is the scrolling results container of the command palette.
Inside CommandPalette it is the listbox the query field controls. Standalone, it
presents a named results listbox around caller-provided option content.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the list holds no state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A standalone list has no keyboard model.** A standalone list exposes a
  listbox of options with no owning keyboard model, so a keyboard user cannot
  move through its options; WAI-ARIA 1.2 gives a listbox's keyboard interaction
  to its owner (AR3, OQ1).
- **The list replaces a caller's name (FR2).** Consumer props spread before
  the component's accessible name, so a builder's explicit `aria-label` never
  names the list, where `architecture:public-component-api` INV5 lets it.

## Ownership boundary

**Owns**

- The listbox root and its accessible name from a caller's `aria-label`, else
  `label`, else the translated default (FR2), and dropping both inside
  CommandPalette while no selectable result exists.
- Applying the CommandPalette context list id to the root.
- Native passthrough, `ref`, and styling-input composition on the root.
- Block-axis scrolling of overflowing children, with spacing-scale padding and
  gaps.

**Does not own / non-goals**

- List-id generation, query-field focus, active descendant, arrow-key
  navigation, hover highlight, Enter selection, search, and the choice between
  results and the empty state — owned by `component:CommandPalette`.
- The aggregate List anatomy entry and its `command-palette-list` target mapping
  — owned by `component:CommandPalette`.
- Option semantics, state, and activation; group semantics and headings — owned
  by CommandPaletteItem and CommandPaletteGroup.
- A standalone composite keyboard model; its direction remains OQ1.

## Public concepts

| Concept         | Closed values or states                                 | Meaning                                           | Availability by variant/orientation/state | Default                                                     | Owner                          | Stability | Invalid-value behavior                                                   |
| --------------- | ------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- | ------------------------------ | --------- | ------------------------------------------------------------------------ |
| Accessible name | caller `aria-label`; caller `label`; translated default | Name announced for the results listbox.           | All uses                                  | `@astryx.commandPalette.list.label` ("Commands" in English) | `component:CommandPaletteList` | Stable    | An empty `label` leaves the listbox unnamed; callers supply a real name. |
| List identity   | context list id; caller `id`                            | DOM id the CommandPalette query field references. | Inside CommandPalette; standalone         | Context id inside CommandPalette; caller `id` standalone    | `component:CommandPalette`     | Stable    | Inside CommandPalette a caller `id` is replaced by the context id.       |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Basis                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | Native props and `ref` reach the listbox root, and consumer `className` and `style` combine with the list target and base styles. Inside CommandPalette the root id is the context list id; standalone, a caller `id` is kept.                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests |
| FR2 | Standalone, and inside CommandPalette while at least one selectable result exists, the root exposes `role=listbox`, which a caller's `role` does not replace: inside CommandPalette because composite semantics are component-owned and replace passthrough, as `component:CommandPaletteInput` AR3 records, and standalone by this record's own rule, named by a caller's explicit `aria-label`, else `label`, else the translated default (`architecture:public-component-api` INV5). Implementation gap: the component's name replaces a caller's `aria-label` (Current-state impact). Otherwise AR4 applies. | Current source and tests |
| FR3 | Inside CommandPalette, the query field's `aria-controls` names the listbox id.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests |
| FR4 | The root lays out children in one column with spacing-scale padding and gaps, grows within a flex parent, caps its height at the parent's height, and scrolls overflowing children inside itself.                                                                                                                                                                                                                                                                                                                                                                                                                | Current source           |

### Allowed variation

- **AV1 — Children.** Items, groups, and empty states may vary in count, order,
  and content without changing the root, except as AR4 states.
- **AV2 — Layout.** Consumer `xstyle`, class, and style may adjust the root
  without replacing its role, id, or target.

### Representative states

| State                 | Required invariant                                                                                                     | Allowed variation          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Standalone results    | The listbox is named by a caller's `aria-label`, else `label`, else the translated default (FR2 gap for `aria-label`). | Item count and grouping.   |
| Inside CommandPalette | The root id equals the query field's `aria-controls` value.                                                            | Results count and groups.  |
| Overflowing results   | Results scroll inside the list instead of growing past the container.                                                  | Container and item height. |
| Empty palette results | Inside CommandPalette with no selectable result, the root has no role or name.                                         | Empty or pending message.  |

### Transformation and precedence order

- **ORD1 — Root attributes.** Consumer native props, then the component-owned
  id and `listbox` role; the accessible name applies unless the caller supplies
  its own `aria-label` (FR2; today it replaces the caller's).
- **ORD2 — Styling.** List target, then base styles with `xstyle`, then
  consumer class, then consumer style.

### Performance and resources

- **PR1 — No work beyond render.** The list adds no state, effect, listener, or
  observer; it reads translation and CommandPalette context during render only.

## Accessibility contract

- **AR1 — Name.** The listbox takes a caller's explicit `aria-label`, else
  `label`, else the translated default, as its accessible name (FR2 gap).
- **AR2 — Relationship.** Inside CommandPalette, the query field controls the
  listbox through its id; CommandPalette owns focus and keyboard navigation under
  its combobox model.
- **AR3 — Standalone gap.** A standalone list exposes a listbox of options with
  no owning keyboard model (Current-state impact; OQ1).
- **AR4 — Empty content.** Inside CommandPalette, while no selectable result
  exists, the root has no role and no accessible name, so screen readers meet the
  empty or pending message as plain content and no empty popup; WAI-ARIA 1.2
  requires a listbox to own options. A standalone list stays a listbox, and its
  caller supplies the options.

## Design relationships

| Anatomy or state | Design requirement                                                                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| List             | Presents result options in one scrolling column with spacing-scale padding and gap. | Current source and public docs | Supporting     | FR1, FR4           |

## Family and system relationships

- `component:CommandPalette` owns list-id generation, keyboard navigation, hover
  highlight, the aggregate anatomy, and the `command-palette-list` target
  mapping; this component applies the id and paints the List.
- `architecture:public-component-api` owns native passthrough, styling
  composition, and refs.
- `architecture:component-theming-surface` owns target qualification and the
  aggregate List anatomy map.
- `architecture:component-test-sufficiency` owns the evidence rules behind the
  verification map below.

## Verification map

| Contract      | Verification                                             | Representative states                                      | Mutation or failure expectation                                                                                                                                  | Audit section                            |
| ------------- | -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| FR1           | `CommandPaletteList.test.tsx`                            | standalone root with ref, class, and style                 | Disconnecting `ref`, or dropping the consumer class or the list target, fails focused DOM assertions.                                                            | `audit:CommandPaletteList/api`           |
| FR2, AR1, AR4 | `CommandPaletteList.test.tsx`                            | default and caller label; palette with and without results | Removing the role or name, or keeping them on an empty palette surface, fails the role and name assertions. Gap: no test covers a caller `role` or `aria-label`. | `audit:CommandPaletteList/a11y`          |
| FR3, AR2      | `CommandPaletteList.test.tsx`, `CommandPalette.test.tsx` | inline CommandPalette                                      | Dropping the context id breaks the query-field relationship assertion.                                                                                           | `audit:CommandPaletteList/a11y`          |
| FR4           | `themingTargets.test.ts`; RTL verified not applicable    | standalone list                                            | Losing the target fails the target inventory.                                                                                                                    | `audit:CommandPaletteList/theming`       |
| AR3           | Source review                                            | Standalone list                                            | Gap: no standalone keyboard model exists to test (OQ1).                                                                                                          | `audit:CommandPaletteList/accessibility` |
| PR1           | Source review                                            | Every state                                                | Gap: no automated check fails if the list adds state, an effect, a listener, or an observer.                                                                     | `audit:CommandPaletteList/behavior`      |

Read from source, with no focused test yet:

- FR4: the one-column layout, spacing, height cap, and inner scrolling.
- PR1: no state, Effect, listener, or observer.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — What standalone keyboard contract should CommandPaletteList expose?**
  (`human-api`) A standalone list exposes a listbox of options but no owning
  keyboard model. Decide whether a public composite owner supplies that model,
  the standalone composition takes a different role, or standalone use remains
  pointer-only presentation.

## Content boundary

This file does not duplicate consumer prop tables/examples, implementation
steps, or family/system rules. It links to their owners.
