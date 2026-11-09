---
schema_version: 3
template_version: 7
kind: component
id: component:Item
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-16
owners: [cixzhang]
review_triggers: [public-api, layout, theming]
verified_by:
  [
    packages/core/src/Item/Item.test.tsx,
    packages/core/src/hooks/nestedTouchPress.adopters.test.tsx,
    packages/core/src/List/List.test.tsx,
    packages/core/src/RadioList/RadioList.test.tsx,
    packages/core/src/CheckboxList/CheckboxList.test.tsx,
    apps/storybook/stories/Item.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:internationalization,
  ]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-017/FR3, spec:AST-057]
---

# Item component contract

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

This record governs how Item aligns its start and end content against the
label. Item's swipe actions are governed by `spec:AST-057`, and its link and
navigation semantics by `family:navigation-destinations`; other Item behavior
remains described by its source, tests, and `Item.doc.mjs` until a record
claims it.

## Contract at a glance

| Area                    | Contract                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `align?: 'center' \| 'start' \| 'first-line'` on Item, ListItem, RadioListItem, and CheckboxListItem; default `center`.                                                             |
| Behavior                | `first-line` centers each start and end slot on the label's first line, for any slot height; a slot taller than that line moves the text down rather than leaving the row.          |
| End-user impact         | A small status dot, radio, or age stays level with the first line of a wrapped label instead of drifting to the middle of the row (`center`) or riding above the line (`start`).    |
| Builder impact          | None by default. A builder opts in per row with `align="first-line"`; theme authors may style the `item` target's `first-line` alignment.                                           |
| Compatibility/readiness | Additive: a new value on an existing closed axis and typed forwarding of an existing runtime pass-through. Rows that omit `align` are unchanged.                                    |
| Review checks           | Reject a changed default, changed `center`/`start` geometry, JavaScript measurement, a slot pushed outside the row, a second theme target, or a composing row that drops the value. |
| Governing rules         | FR1–FR8 below; `architecture:component-theming-surface/INV6`; `spec:AST-017/FR3`.                                                                                                   |

This table is a review projection; the body below is authoritative.

## Intent

Item is the shared row behind lists, menus, pickers, and option rows. Its label
can wrap, while its start and end content is often a single-line-sized mark: a
status dot, a radio or checkbox, an icon, a short timestamp. Those marks belong
to the first line of text they annotate. Item owns the alignment because only
Item knows where its label's first line sits; a caller cannot place a slot
against it without copying Item's typography.

## Compatibility and migration

- Released default preserved: `yes`; omitted `align` resolves to `center`.
- Compatibility class: additive closed-axis value; additive typed prop on three
  composing rows that already forward unknown props to Item at runtime.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: `component:Item/DEC-1`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `align` axis: its values, default, and the geometry of each value for
  the start and end content slots.
- Reflecting the resolved alignment on the `item` theme target.
- Reflecting highlighted, selected, and disabled state on the `item` theme target.
- The forwarding rule for rows that compose Item and expose `align`.

**Does not own / non-goals**

- The `marker` slot's alignment — owned by whoever renders the marker; ListItem
  positions its own markers against the first line.
- Typography of caller content inside `label` — owned by the caller.
- A theme-wide default alignment — themes style values; they do not choose a
  component's prop default (`architecture:component-theming-surface`).
- Alignment inside a slot's own content (for example, an avatar stack) — owned
  by that content.

## Public concepts

| Concept   | Closed values or states         | Meaning                                                                                                                                              | Availability by variant/orientation/state                                   | Default  | Owner            | Stability | Invalid-value behavior                       |
| --------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------- | ---------------- | --------- | -------------------------------------------- |
| Alignment | `center`, `start`, `first-line` | `center`: slots centered on the whole text block. `start`: slot tops on the text block's top. `first-line`: slot centers on the first line's center. | Every density, layout, interaction mode, and direction; start and end slots | `center` | `component:Item` | stable    | Other values are rejected by the public type |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Basis                                                                                               | Draft review state          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------- |
| FR1  | Item MUST accept `align` with exactly `center`, `start`, and `first-line`, and MUST resolve an omitted value to `center`. The geometry of `center` and `start` MUST NOT change.                                                                                                                                                                                                                                                                                                                                                                                                            | `component:Item/DEC-1`                                                                              | settled                     |
| FR2  | Under `first-line`, the block-axis center of each rendered start-content and end-content slot MUST coincide with the block-axis center of the label's first line box, for every slot block size.                                                                                                                                                                                                                                                                                                                                                                                           | Owner direction                                                                                     | settled                     |
| FR3  | Under `first-line`, a slot taller than the label's first line MUST stay inside the row's content box: the label and description move down by the difference, and the row grows to fit. No slot is clipped or painted into the row's block padding.                                                                                                                                                                                                                                                                                                                                         | Owner direction                                                                                     | settled                     |
| FR4  | A row whose label renders a single line and which has no description MUST render identically under `first-line` and `center`, for every slot block size.                                                                                                                                                                                                                                                                                                                                                                                                                                   | Follows from FR2 and FR3                                                                            | settled                     |
| FR5  | The first line box is the label line as Item styles it, from the active theme's body text size and leading. A theme that changes those tokens moves the alignment with them. Caller content inside `label` that sets its own font size or line height is outside the FR2 guarantee.                                                                                                                                                                                                                                                                                                        | Shared typography source                                                                            | settled                     |
| FR6  | `first-line` MUST hold in every density, in `stacked` and `inline` layouts, with `labelLines` truncation, and in plain, button, link, link-root, delegated, and parent-role rows. In right-to-left text it MUST produce the same block-axis placement with the slots mirrored by logical order and no DOM reordering.                                                                                                                                                                                                                                                                      | `architecture:internationalization`                                                                 | settled                     |
| FR7  | The `item` theme target MUST reflect the resolved alignment as its existing `align` selector axis, including `first-line`, and Item's public theming metadata MUST list that value. The alignment axis adds no new target or theme-level default.                                                                                                                                                                                                                                                                                                                                          | `architecture:component-theming-surface/INV6`; `component:Item/DEC-2`                               | settled                     |
| FR8  | ListItem, RadioListItem, and CheckboxListItem MUST expose `align` with Item's values and default and forward it unchanged to the Item row they render. A composing row MUST NOT drop, remap, or narrow the value.                                                                                                                                                                                                                                                                                                                                                                          | Owner direction                                                                                     | settled                     |
| FR9  | An interactive row (an `onClick` row, an `href` row, or a delegated row with `interactiveRef`) shows its touch pressed paint only for a press that would activate it: a finger press on the row's surface or on its own action (its invisible button or link, or the control it delegates to) paints the row, and a finger press that starts on another interactive element inside the row paints none. In a row with a parent-supplied `role`, or a row whose root is a link, a press on a nested control activates the row, so it paints. A mouse press keeps the row's `:active` paint. | Owner direction, 2026-11-03: no pressed state on a container for a press that does not activate it  | settled                     |
| FR10 | The `item` theme target MUST reflect a highlighted, selected, or disabled row as `data-highlighted`, `data-selected`, and `data-disabled`, each present only while its state holds, with the names CommandPaletteItem uses. A row that composes Item reflects the states it passes to Item.                                                                                                                                                                                                                                                                                                | `architecture:component-theming-surface/INV6`; shipped source and focused tests, not owner-reviewed | settled; not owner-reviewed |

### Allowed variation

- **AV1 — Slot content.** Any slot content and size may appear; FR2 holds for
  each slot independently, so a start slot and an end slot of different heights
  each center on the first line.
- **AV2 — Theme typography.** Body text size and leading may vary by theme; the
  first line box follows them (FR5).
- **AV3 — Row height.** Under `first-line` a row may be taller than the same
  row under `center` when a slot is taller than the first line and a
  description or second label line is present (FR3).

### Representative states

| State                                        | Required invariant                                                    | Allowed variation                     |
| -------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| Wrapped label, 6px dot start, short-text end | Both slot centers on the first line's center.                         | Density, theme typography, direction. |
| One-line label, no description, any slot     | Identical to `center`.                                                | Slot size.                            |
| Label and description, 40px avatar start     | Avatar center on the first line's center; text moves down; row grows. | Avatar size.                          |
| Radio or checkbox row with a wrapped label   | The control centers on the first line.                                | Control size by Field size.           |
| Right-to-left                                | Same block-axis placement; slots mirrored by logical order.           | Writing direction.                    |
| Omitted `align`                              | Identical to today's `center`.                                        | None.                                 |

### Transformation and precedence order

- **ORD1 — Resolution.** An explicit `align` on a composing row forwards to
  Item unchanged; Item resolves an omitted value to `center`; the resolved value
  drives both geometry and the `item` target's selector axis, so the two never
  disagree.

### Performance and resources

- **PR1 — CSS geometry only.** Every alignment value MUST be achieved in CSS:
  no measurement, observer, listener, state, Effect, or extra render pass.

## Accessibility contract

- **AR1 — Presentation only.** Alignment MUST NOT change the DOM order, role,
  accessible name or description, focus target, tab order, or hit target of the
  row or its slots.
- **AR2 — No exposed text.** Any construct that implements `first-line` MUST
  contribute no text to the accessibility tree.

## Design relationships

| Anatomy or state      | Design requirement                                    | Representation authority | Hierarchy role | Component contract |
| --------------------- | ----------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Start and end content | Annotates the first line of the label it sits beside. | Owner direction          | Supporting     | FR2–FR4            |
| Label first line      | The reference line the slots align to.                | Item typography          | Prominent      | FR5                |

## Family and system relationships

- `spec:AST-057` owns Item's swipe actions and their panels; alignment does
  not change them, because the panels sit outside the row's flow.
- `family:navigation-destinations` owns Item's link and navigation semantics;
  alignment does not change them.
- `architecture:component-theming-surface` owns how visual axes reach theme
  targets; this record adds one value to Item's existing `align` axis.
- `architecture:public-component-api` owns prop admission; FR8 types an existing
  runtime pass-through rather than adding a parallel concept.
- `architecture:internationalization` owns logical-direction behavior; FR6
  applies it.
- `spec:AST-017/FR3` classifies this as a non-breaking feature: it adds a value
  and a typed prop, narrows nothing, and a caller who never sets `align` sees no
  change.

## Verification map

| Contract | Verification                                                                            | Representative states                                                         | Mutation or failure expectation                                                                           | Audit section         |
| -------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------- |
| FR1, FR7 | `Item.test.tsx` alignment and theme-reflection suites; public type test                 | Omitted, `center`, `start`, `first-line`                                      | A changed default, a missing `data-align="first-line"`, or a widened type fails.                          | `audit:Item/api`      |
| FR2–FR6  | Real-Chromium geometry assertions over the Item alignment stories                       | Wrapped label with dot and age; avatar; densities; RTL; theme                 | A slot center off the first line center by more than 0.5px, or a clipped slot, fails.                     | `audit:Item/layout`   |
| FR8      | `List.test.tsx`, `RadioList.test.tsx`, `CheckboxList.test.tsx` forwarding cases         | Each composing row with `align="first-line"`                                  | A row whose Item root lacks `data-align="first-line"` fails.                                              | `audit:Item/api`      |
| FR9      | `nestedTouchPress.adopters.test.tsx`; `Item.nestedPress.test.tsx`                       | A finger on the delegated control; a finger on another control in the row     | A row painted for a press on another control, or not painted for a press on its delegated control, fails. | `audit:Item/behavior` |
| FR10     | `Item.test.tsx` "reflects highlighted, selected, and disabled on the item theme target" | Plain, highlighted only, selected only, disabled only, and all three together | A missing attribute, or an attribute left on a row whose state does not hold, fails.                      | `audit:Item/theming`  |
| AR1, AR2 | Accessibility-tree snapshot of a `first-line` row against a `center` row                | Plain and option rows                                                         | Any difference in name, role, description, or order fails.                                                | `audit:Item/a11y`     |
| PR1      | Source review of Item's alignment styles                                                | All values                                                                    | A ref, observer, or Effect added for alignment fails review.                                              | `audit:Item/layout`   |

## Decision log

<!-- Record the boundary or requirement, not how it was reached. A rejected alternative is at most one line here, kept only when it is consequential and likely to recur. -->

### DEC-1 — `first-line` is an opt-in value; `center` stays the default

**Reference:** `component:Item/DEC-1`
**Decider:** cixzhang, 2026-10-16

A wrapped label with a single-line-sized mark needs the mark on its first line,
and neither existing value does that: `center` drops the mark to the middle of
the row and `start` pins its top, which leaves a small mark above the line's
center. A new value fixes those rows without moving any row that relies on
today's default.

Rejected: making `first-line` the default, because a slot sized to the whole
text block, such as an avatar beside a label and description, is correct under
`center`.

### DEC-2 — The theme setting is the `item` target's alignment axis

**Reference:** `component:Item/DEC-2`
**Decider:** cixzhang, 2026-10-16

Themes reach `first-line` rows through the `item` target's existing `align`
selector axis, the same way they reach `center` and `start`. A theme can style
those rows; it does not choose which value a row receives.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Item/Item.swift.spec.md -->


# Item (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Item(_ label:, description:, align:, density:, labelLines:, descriptionLines:, layout:, href:, isHighlighted:, isSelected:, isDisabled:, startContent:, endContent:, marker:, onClick:)` and `Item(_ props: ItemProps, startContent:, endContent:, marker:)`, a generic SwiftUI `View`. |
| Behavior                | Draws core's row: marker, start content, the label over or beside its description, end content, with core's density padding, alignment, line limits, and highlighted, selected, and disabled looks. With `href` it is a SwiftUI `Link`; with only `onClick` a SwiftUI `Button`.          |
| End-user impact         | A person sees list, menu, and settings rows that line up and read like the web's, can tap a whole row, and VoiceOver reads one row in slot order with its selected or dimmed state.                                                                                                      |
| Builder impact          | Slots take any SwiftUI view through closures; a single trailing closure is the start content. Swipe actions, `target`, `rel`, and `data-testid` have no Swift form.                                                                                                                      |
| Compatibility/readiness | Additive: a new view and generated `ItemProps`. Draft; built and tested on macOS and the iOS Simulator; device captures are attached to the change.                                                                                                                                      |
| Review checks           | Reject a slot typed as `AnyView`, a row that draws differently as a link or button, a static row grown to the touch target, a disabled link that opens, colors that are not theme tokens, or a swipe prop the row cannot honor.                                                          |
| Governing rules         | `spec:AST-082` FR3, FR4, FR7; `spec:AST-093` FR1–FR5; the Swift component API (A2–A4, A7, A9), slots (S1, S3–S5), theme environment, and accessibility (X1, X2, X5, X7) records under `packages/native/specs/swift/library/`.                                                            |

This table is a review projection; the body below is authoritative.

## Intent

Item on Apple platforms is core's row primitive: the shared layout for list
rows, menu rows, and settings rows, drawn with theme tokens and SwiftUI's own
link and button controls.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The row's slot order, spacing, padding per density, and alignment of the
  start and end content against the words.
- Line limits, the label and description type, and the highlighted, selected,
  and disabled looks.
- Switching to a SwiftUI `Link` or `Button` without changing the drawing, and
  the row's accessibility element.

**Does not own / non-goals**

- The meaning of the props — owned by `component:Item`.
- List markers, dividers, and edges — owned by the list that holds the rows.
- What a slot draws: an `Icon`, an `Avatar`, or any view keeps its own size and
  look (Swift slots S4: an unsized Avatar stays `md`).

## Public concepts

| Concept | Closed values or states                   | Meaning                                                                 | Availability by variant/orientation/state | Default    | Owner                  | Stability    | Invalid-value behavior                              |
| ------- | ----------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- | ---------- | ---------------------- | ------------ | --------------------------------------------------- |
| slots   | marker, startContent, endContent          | any SwiftUI view through a `@ViewBuilder` closure                       | always                                    | empty      | `component:Item`       | experimental | none                                                |
| density | `compact`, `balanced`, `spacious`         | block padding of spacing 1, 2, 3; inline padding 2, or 3 when spacious  | always                                    | `balanced` | `component:Item`       | experimental | none                                                |
| align   | `center`, `start`, `firstLine`            | slots centered on the words, at their top, or on the label's first line | always                                    | `center`   | `component:Item`       | experimental | none                                                |
| layout  | `stacked`, `inline`                       | description under or beside the label                                   | with a description                        | `stacked`  | `component:Item`       | experimental | none                                                |
| control | static, link (`href`), button (`onClick`) | how a tap behaves; the drawing is the same                              | always                                    | static     | `component:swift/Item` | experimental | an `href` that is not an absolute URL is not a link |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                              | Draft review state |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------ |
| FR1 | The row MUST lay out marker, start content, the words, and end content in that order with a gap of `space.s2`, the words taking the remaining width, inside block padding of `space.s1`, `s2`, or `s3` for `compact`, `balanced`, or `spacious` and inline padding of `space.s2`, or `s3` when spacious.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | core `Item` styles                                 | verify             |
| FR2 | The label MUST draw in the body type and `color.textPrimary`, the description in the supporting type and `color.textSecondary`, each limited to `labelLines` or `descriptionLines` lines and truncating after them: one line when unset, and every line for zero, as core's row does. Each line takes the theme's leading, grown with Dynamic Type. With `inline` and a description, the description sits beside the label with a gap of `space.s1` and the label does not shrink; without a description the label keeps its line limit.                                                                                                                                                                                                                                                                                                                          | core `Item` styles                                 | verify             |
| FR3 | `center` MUST center each slot on the words; `start` MUST put each slot's top on the words' top; `firstLine` MUST center each slot on the label's first line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | core `Item` `align`                                | verify             |
| FR4 | `isSelected` MUST paint `color.accentMuted` behind the row and `isHighlighted` `color.overlayHover`, with selected winning, in the element radius. `isDisabled` MUST draw the words and the end content at half opacity, as core does; the marker and start content keep their own look. A pressed button or link row paints `color.overlayPressed` above its selected or highlighted fill, as core does.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | core `Item` styles                                 | verify             |
| FR5 | With an `href` that is an absolute URL (it has a scheme), the row MUST be a SwiftUI `Link`, and `onClick` does not run. In core the link is the label and a click elsewhere on the row runs `onClick`; a SwiftUI `Link` takes the whole row, so the Swift row has no such area. A script URL (`javascript:`, `vbscript:`) or an HTML document in a `data:` URL MUST leave the row inert, never a link, as core's navigation destinations refuse them (`family:navigation-destinations` FR4). An `href` that is not an absolute URL, such as a web path, MUST stop a development build with a message naming it; a release build draws the row without a link. With only `onClick`, a SwiftUI `Button`. A tappable row is at least 44 points tall; a static row keeps core's height. A disabled link or button stays reachable, reads as dimmed, and does nothing. | Swift component API A4; Swift accessibility X2, X7 | verify             |
| FR6 | Both initializers MUST build the same `ItemProps`. Slots are generic `@ViewBuilder` closures with empty defaults, never `AnyView`; a single trailing closure is the start content and `onClick` comes last. Base props come through `ItemProps`: with `isHidden` the view draws nothing; `id` becomes the accessibility identifier.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Swift component API A2–A4, A7; Swift slots S3      | verify             |

### Allowed variation

- **AV1 — Touch height.** A tappable row is at least 44 points tall, which can
  be taller than core's compact or balanced row.
- **AV2 — Line metrics.** A line's height comes from the theme's leading over
  the system font's own line height, so a custom face can differ by a point.

### Representative states

| State                               | Required invariant                                 | Allowed variation |
| ----------------------------------- | -------------------------------------------------- | ----------------- |
| each density                        | core's block and inline padding                    | none              |
| label and description, both layouts | description under or beside the label              | none              |
| each alignment with a tall slot     | slots centered, at the top, or on the first line   | none              |
| selected, highlighted, disabled     | each look from the theme; selected wins            | none              |
| static, link, button                | the same drawing; tappable rows at least 44 points | AV1               |
| light and dark, two themes          | each theme's colors                                | none              |

### Transformation and precedence order

- **ORD1 — Background.** Selected → highlighted → none.
- **ORD2 — Control.** `href` (link) → `onClick` (button) → static.

### Performance and resources

- **PR1 — No type erasure.** Slots are generic, so the row adds no `AnyView`
  boxing.

## Accessibility contract

- **AR1 — One element per row.** A static row is one element whose label reads
  the slots in order: marker, start content, label, description, end content.
  A link or button row is one link or button element read the same way
  (Swift accessibility X5; Swift slots S5).
- **AR2 — State.** A selected row reads as selected. A disabled row stays in
  the VoiceOver order and reads as dimmed (X1, X2).
- **AR3 — Touch target.** A tappable row is at least 44 points tall (X7).
- **AR4 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target
  exists.

## Design relationships

| Anatomy or state | Design requirement                                 | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Row              | Apple Human Interface Guidelines, Lists and tables | prescribed by core       | supporting     | FR1–FR5            |

The component implements design requirements without copying their rationale.

Platform control: SwiftUI `List` was considered and does not fit: it is a
scrolling container that owns its rows, while core's Item is a row that sits
in any container, including a Card, a Section, or a dialog (`spec:AST-093`
FR2). The row uses SwiftUI `Link` and `Button` for its taps and draws its own
layout. Guideline pages: Lists and tables, Buttons, and Accessibility in the
Apple Human Interface Guidelines.

Theme values read: `space.s1`, `space.s2`, `space.s3`, `radius.element`,
`color.textPrimary`, `color.textSecondary`, `color.accentMuted`,
`color.overlayHover`, `color.overlayPressed`, the body and supporting type, and Dynamic Type.

## Family and system relationships

- `component:Item` owns the props, the slots, and the row's look; this record
  states only how Swift draws them.
- A list owns its rows' markers, dividers, and edges.

## Verification map

| Contract | Verification                                                                                      | Representative states                                                                                | Mutation or failure expectation                                                                                              | Audit section              |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1, FR2 | `ItemTests.swift` density, leading, line-limit, and largest-text renders                          | each density; one and three label lines; the largest text size                                       | wrong padding, leading, or line limit, or a row that does not grow fails                                                     | `audit:swift/Item/layout`  |
| FR3      | `ItemTests.swift` alignment renders                                                               | `start` and `center` with a description; `firstLine` with a slot taller than one line                | a slot off the words' top, middle, or the label's first line fails                                                           | `audit:swift/Item/align`   |
| FR4      | `ItemTests.swift` background, two-theme, and disabled renders                                     | selected, highlighted, both; neutral, butter; disabled                                               | a wrong token, highlighted beating selected, or an undimmed disabled row fails                                               | `audit:swift/Item/states`  |
| FR5, AR2 | `ItemTests.swift` touch-height renders; tap, trait, `linkURL`, and refused-destination tests      | static, button, link; selected; empty `href`; `javascript:`, `vbscript:`, and `data:text/html` hrefs | a short tappable row, a grown static row, or a missing selected trait fails; a refused destination that becomes a link fails | `audit:swift/Item/control` |
| FR6      | `ItemTests.swift` initializer, trailing-closure, hidden, and wire-slot tests; `contracts.test.ts` | both initializers; each slot; `isHidden`                                                             | differing props, a closure filling the wrong slot, or a drawn hidden row fails; a wire node whose slots do not draw fails    | `audit:swift/Item/api`     |

## Decision log

### DEC-1 — Swipe actions are web-only for now

**Reference:** `component:swift/Item/DEC-1`
**Decider:** cixzhang, 2026-10-31

`swipeActions` has no Swift form. SwiftUI's swipe actions work only on rows
inside a SwiftUI `List`, so an Item anywhere else could not honor them; a
person on iPhone or Mac uses the row's own action or its end content instead.
A Swift form waits until a row can honor swipe actions wherever it sits.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
