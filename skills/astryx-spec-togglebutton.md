---
schema_version: 3
template_version: 7
kind: component
id: component:ToggleButton
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-25
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/ToggleButton/ToggleButton.test.tsx,
    packages/core/src/ToggleButton/__tests__/ToggleButton.a11y.test.tsx,
    packages/core/src/ToggleButton/__tests__/ToggleButton.a11y.chromium.spec.ts,
  ]
modules: []
families: [family:buttons]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:component-style-authoring,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-085]
---

# ToggleButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. ToggleButton takes `label`, `isPressed`, `onPressedChange`, `pressedChangeAction`, `icon`, `pressedIcon`, `isIconOnly`, `children`, `size`, `elevation`, `isDisabled`, `isLoading`, `tooltip`, and `value`.                                                                                                                                                                            |
| Behavior                | A ghost Button with `aria-pressed`. Standalone, it requests the next pressed value from the caller and may run an interruptible Action with an optimistic pressed state. As a valued ToggleButtonGroup member, the group owns both.                                                                                                                                                                  |
| End-user impact         | People see and hear whether a toggle is on. A pending toggle shows its new state at once and can be reversed by clicking again. The label does not shift width when pressed. A disabled toggle without a tooltip leaves the tab order.                                                                                                                                                               |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                                                                                                                |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Native `disabled` without a tooltip conflicts with `spec:AST-085` FR1 and FR4; Button's reduced-motion gaps apply; a pre-prevented click skips the Action; caller pressed attributes override ToggleButton's own; the label renders twice; consumer docs promise a tooltip that does not exist. All are listed under Current-state impact. |
| Review checks           | Reject a toggle without `aria-pressed`, a caller `onClick` that replaces the toggle request, an Action that runs after a prevented callback, a re-click derived from a stale committed value, or pressed state that shifts outer size.                                                                                                                                                               |
| Governing rules         | `family:buttons` FR1–FR11, AV1–AV4; `component:Button`; `spec:AST-085` FR1, FR4; `design:reduced-motion` DR1, DR3; `architecture:public-component-api` INV5; `architecture:component-style-authoring` INV7.                                                                                                                                                                                          |

This table is a review projection; the body below is authoritative.

## Intent

ToggleButton is the family's persistent-press control. It reuses Button's
surface and adds a controlled pressed state, pressed-state paint, an optional
pressed icon, and an interruptible pressed Action, as `family:buttons`
assigns. Consumer usage lives in `ToggleButton.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; unpressed, `size="md"`, `elevation="none"`
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled only. `isPressed` (default
  `false`) is the committed value; ToggleButton holds no committed state of its
  own, only an optimistic value while an Action is pending
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The effective pressed state, `aria-pressed`, and the next-state request.
- Callback, caller `onClick`, and Action ordering for a standalone toggle.
- The optimistic pressed value while an Action is pending.
- Pressed paint, the pressed icon swap, the pressed label weight, and a
  stable outer size while pressed.
- The `toggle-button` target and its `isPressed` and `elevation` reflection.
- How a valued member defers to its ToggleButtonGroup.

**Does not own / non-goals**

- The surface, naming rules, size heights, pending presentation, disabled
  rendering, tooltip, link mode, and feedback — owned by `component:Button`.
- Group selection state, single or multiple mode, and group layout — owned by
  `component:ToggleButtonGroup`.
- On/off settings — owned by `component:Switch`.
- Inheriting an outer size provider — not provided (OQ1).

## Public concepts

| Concept        | Closed values or states      | Meaning                                         | Availability by variant/orientation/state                         | Default               | Owner                    | Stability | Invalid-value behavior                        |
| -------------- | ---------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- | --------------------- | ------------------------ | --------- | --------------------------------------------- |
| Pressed        | pressed, unpressed           | The retained on/off state.                      | Standalone from `isPressed`; valued group members from the group. | unpressed             | `component:ToggleButton` | Stable    | Not applicable.                               |
| Pressed Action | absent, idle, pending        | Async work run for a standalone toggle.         | Standalone only; ignored for valued group members.                | absent                | `component:ToggleButton` | Stable    | Not applicable.                               |
| Pressed icon   | caller node                  | The icon shown while pressed.                   | When pressed; falls back to `icon`.                               | `icon`                | `component:ToggleButton` | Stable    | Not applicable.                               |
| Group value    | string                       | Identifies the member to its ToggleButtonGroup. | Inside a ToggleButtonGroup.                                       | none                  | `component:ToggleButton` | Stable    | Without `value`, a member behaves standalone. |
| Size           | `sm`, `md`, `lg`             | Control height.                                 | Always.                                                           | Group size, else `md` | `family:buttons`         | Stable    | TypeScript rejects other values.              |
| Elevation      | `none`, `low`, `med`, `high` | Resting shadow depth.                           | Standalone and inside a ToggleButtonGroup.                        | `none`                | `family:buttons`         | Stable    | TypeScript rejects other values.              |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Basis                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FR1  | ToggleButton renders one Button with the `ghost` variant and Button's interruptible pending mode, and sets `aria-pressed` to the effective pressed value. Other supplied props reach Button.                                                                                                                                                                                                                                                                                                                                                                                                                                    | `family:buttons` FR2, FR6, AV3; current source                                                                   |
| FR2  | The effective pressed value is the group's selection for a valued member inside a ToggleButtonGroup, otherwise `isPressed` (default `false`); while a standalone Action is pending, the optimistic value replaces it.                                                                                                                                                                                                                                                                                                                                                                                                           | `family:buttons` FR6, FR11; current tests                                                                        |
| FR3  | Standalone activation: a caller `onClick` runs first. If that `onClick` calls `preventDefault()`, nothing else runs. Otherwise `onPressedChange(next, event)` runs synchronously, where `next` is the inverse of the effective value. If it calls `preventDefault()`, the Action does not run. A click already prevented before the caller `onClick` ran still calls `onPressedChange`, and `pressedChangeAction` MUST then run (`family:buttons` FR5). Implementation gap: Button skips its `clickAction` for any click already prevented, so `pressedChangeAction` does not run and an Action-only toggle ignores that click. | `family:buttons` FR5; current tests                                                                              |
| FR4  | With `pressedChangeAction`, a standalone activation sets the optimistic value to `next` and runs the Action through Button's `clickAction`; the Button is pending until it settles. The Action runs with or without `onPressedChange`. A re-click while pending is accepted and derives `next` from the optimistic value. When it settles, the committed `isPressed` shows.                                                                                                                                                                                                                                                     | `family:buttons` FR4–FR6; current tests                                                                          |
| FR5  | Without `pressedChangeAction`, activation is synchronous and reports no pending state.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `family:buttons` FR5; current tests                                                                              |
| FR6  | A valued member inside a ToggleButtonGroup asks the group to toggle its value on every enabled activation, after any caller `onClick` and whether or not that `onClick` prevented default. It never calls its own `onPressedChange` or `pressedChangeAction` and never reports Action pending.                                                                                                                                                                                                                                                                                                                                  | `family:buttons` FR11; current tests                                                                             |
| FR7  | Disabled when its own `isDisabled` or its group's `isDisabled` is true; an enabled group never re-enables a member that disables itself. A disabled toggle never requests a state change and follows `component:Button` FR10, including its implementation gap.                                                                                                                                                                                                                                                                                                                                                                 | `family:buttons` FR3; current tests                                                                              |
| FR8  | While pressed, the surface paints the pressed overlay color; under forced colors it paints `Highlight` with `HighlightText`. The visible label renders semibold while pressed, and pressing MUST NOT change outer size. Content MUST render once, with no hidden twin to reserve width (`architecture:component-style-authoring` INV7). Implementation gap: a labelled toggle wraps its label in a span beside a hidden semibold copy that reserves the width, so the label renders twice and `children` mount twice. Icon-only toggles render no copy.                                                                         | `family:buttons` FR7, FR9; current source and tests; `architecture:component-style-authoring` INV7               |
| FR9  | While pressed and `pressedIcon` is supplied, the icon slot shows `pressedIcon`; otherwise it shows `icon`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `family:buttons` AV2; current tests                                                                              |
| FR10 | Size is the explicit `size`, then the enclosing ToggleButtonGroup's `size`, then `md`; ToggleButton does not read an outer size provider.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `family:buttons` FR7; current source                                                                             |
| FR11 | `elevation` paints Button's shadow standalone and inside a ToggleButtonGroup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `family:buttons` FR8, FR12; current tests                                                                        |
| FR12 | The root carries both `astryx-button` and `astryx-toggle-button`, reflects `data-is-pressed` as `"true"` or `"false"`, and reflects `data-elevation`. A caller `className` is kept alongside them. A caller `data-is-pressed` MUST NOT replace the reflected value. Implementation gap: caller props spread last, so a caller `aria-pressed` or `data-is-pressed` overrides ToggleButton's own.                                                                                                                                                                                                                                 | `family:buttons` FR10; `architecture:component-theming-surface`; tests; `architecture:public-component-api` INV5 |
| FR13 | Visible content is `children` when supplied, else `label`; icon-only shows no visible text. When `label` is non-empty it is the accessible name, because Button sets it as `aria-label` (`component:Button` ORD4).                                                                                                                                                                                                                                                                                                                                                                                                              | `family:buttons` FR1; current tests                                                                              |
| FR14 | Pending presentation and press feedback follow `component:Button` FR8 and FR15: ToggleButton is a standalone Button inside or outside a ToggleButtonGroup, so it takes the press scale, which MUST NOT apply under reduced motion (`design:reduced-motion` DR1), and its interruptible Spinner waits the medium delay and MUST appear at once under reduced motion with a fine pointer (DR3). Implementation gap: both the press scale and the Spinner fade still apply under reduced motion, and content that paints its own colors stays visible beside the Spinner.                                                          | `component:Button`; `design:reduced-motion`; current source                                                      |

### Allowed variation

- **AV1 — Pressed paint.** Themes may restyle the pressed state through
  `toggle-button[data-is-pressed="true"]`; pressed must stay distinguishable
  from unpressed, including under forced colors.
- **AV2 — Icons.** Any caller node may fill `icon` and `pressedIcon`.

### Representative states

| State                 | Required invariant                                                                             | Allowed variation |
| --------------------- | ---------------------------------------------------------------------------------------------- | ----------------- |
| Unpressed             | `aria-pressed="false"`; ghost surface; regular weight.                                         | Icon.             |
| Pressed               | `aria-pressed="true"`; pressed paint; semibold label; same outer size.                         | Pressed icon.     |
| Action pending        | Optimistic pressed value; Spinner and `aria-busy`; still operable.                             | Spinner delay.    |
| Valued group member   | Pressed from the group; activation calls the group; no Action.                                 | Elevation.        |
| Disabled with tooltip | `aria-disabled`; focusable; no state request.                                                  | —                 |
| Disabled, no tooltip  | Focusable with `aria-disabled`; no state request. Implementation gap: native `disabled` (FR7). | —                 |

### Transformation and precedence order

- **ORD1 — Effective pressed.** Group selection for a valued member, then the
  pending optimistic value, then `isPressed`, then `false`.
- **ORD2 — Standalone activation.** Caller `onClick`, then `onPressedChange`,
  then the Action; a newly prevented event stops the steps after it. A click
  prevented before the caller `onClick` still reaches `onPressedChange`
  (FR3 gap for the Action).
- **ORD3 — Disabled.** Group disabled or own disabled; either is enough.

### Performance and resources

- **PR1 — Width reservation.** A labelled toggle renders three elements where
  its label text would do: a wrapper, the visible label, and a hidden copy;
  with `children` the children subtree mounts twice. No measurement runs. This
  cost is the FR8 gap.

## Accessibility contract

- **AR1 — State.** `aria-pressed` MUST reflect the effective pressed value
  (FR2), including the optimistic value while pending, and a caller prop MUST
  NOT replace it (`architecture:public-component-api` INV5). Implementation
  gap: caller props spread last, so a caller `aria-pressed` overrides it.
- **AR2 — Name.** A non-empty `label` is the accessible name (FR13); the
  width-reservation copy (FR8 gap) is hidden from assistive technology.
- **AR3 — Forced colors.** The pressed state stays visible under forced colors
  (FR8), as WCAG 1.4.11 requires.
- **AR4 — Visible hint.** An icon-only toggle shows a tooltip only when the
  caller sets `tooltip`.
- **AR5 — Everything else.** Keyboard, focus indicator, loading announcement,
  busy and disabled exposure, and target size follow `component:Button`
  AR2–AR6.

## Design relationships

| Anatomy or state | Design requirement                                                              | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Icon             | Leading icon; replaced by Pressed icon while pressed.                           | Current source and tests | Supporting     | FR9                |
| Pressed icon     | Alternate icon while pressed.                                                   | Current source and tests | Supporting     | FR9                |
| Label            | Visible text, semibold while pressed, at a stable width (FR8 gap: hidden copy). | Current source and tests | Prominent      | FR8, FR13          |
| Spinner          | Button's Spinner over hidden content while an Action runs.                      | Current source           | Supporting     | FR4                |
| Pressed surface  | Pressed overlay fill; `Highlight` under forced colors.                          | Current source and tests | Prominent      | FR8                |

`design:reduced-motion` governs the inherited press scale and Spinner reveal
(FR14); no other design record governs ToggleButton. The root carries `toggle-button` (and
Button's `button`); Icon, Pressed icon, and Label take color from them, and the
Spinner is a Spinner instance. The consumer anatomy names no root part, so this
record carries no anatomy-theming map.

## Family and system relationships

- `family:buttons` owns persistent-press semantics, callback and Action order,
  and group ownership of valued members (FR5, FR6, FR11); ToggleButton adopts
  them. The family's elevation axis is shipped on ToggleButton (FR11).
- `component:Button` owns the rendered surface and pending, disabled, and
  tooltip behavior.
- `component:ToggleButtonGroup` owns selection for valued members.
- `spec:AST-085` applies through Button; the gap is FR7 here.

## Verification map

| Contract            | Verification                                                                                                                                                                          | Representative states                                         | Mutation or failure expectation                                                                                                                                                                                                                            | Audit section                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| FR1, FR2, ORD1, AR1 | `ToggleButton.test.tsx`; `ToggleButton.a11y.chromium.spec.ts` standalone and group states                                                                                             | Unpressed, pressed, icon-only, composed label                 | Missing or stale `aria-pressed` fails.                                                                                                                                                                                                                     | `audit:ToggleButton/accessibility` |
| FR3–FR5, ORD2       | `ToggleButton.test.tsx` callback, Action, and caller-`onClick` suites                                                                                                                 | Callback only, Action only, both, prevented, pending re-click | Order flips, a prevented callback still runs the Action, or callback-only reports pending fails. Evidence gap: no test runs `pressedChangeAction` on a click prevented before the toggle's handler.                                                        | `audit:ToggleButton/behavior`      |
| FR6                 | `ToggleButton.test.tsx` group-ownership cases                                                                                                                                         | Member with standalone handlers; member with `onClick`        | A member that runs its own handler or skips the group toggle fails.                                                                                                                                                                                        | `audit:ToggleButton/behavior`      |
| FR7, ORD3           | `ToggleButton.test.tsx` disabled suite; `ToggleButton.a11y.test.tsx` and `ToggleButton.a11y.chromium.spec.ts` disabled states                                                         | Member and group disabled; tooltip-bearing disabled           | A disabled toggle that toggles, or an enabled group re-enabling a member, fails. The shared disabled state expects native `disabled`, matching the FR7 gap.                                                                                                | `audit:ToggleButton/accessibility` |
| FR8, FR9, AR3       | `ToggleButton.test.tsx` width-reservation, pressed-icon, and forced-colors cases                                                                                                      | Labelled and icon-only; pressed and unpressed                 | A wrong icon or no forced-colors pressed paint fails. The width-reservation case asserts the hidden copy, matching the FR8 gap.                                                                                                                            | `audit:ToggleButton/visual`        |
| FR11, FR12          | `ToggleButton.test.tsx` elevation and className cases                                                                                                                                 | Standalone and grouped elevation; caller className            | A lost elevation, missing target, or dropped caller class fails. Evidence gap: no test reads the painted shadow or passes a caller `aria-pressed` or `data-is-pressed`.                                                                                    | `audit:ToggleButton/theming`       |
| FR8 (outer size)    | Evidence gap: no test measures that pressing keeps the outer size                                                                                                                     | Labelled toggle pressed and unpressed                         | —                                                                                                                                                                                                                                                          | `audit:ToggleButton/layout`        |
| FR8, FR12 (gaps)    | Evidence gap: no test asserts the pressed overlay paint, the semibold pressed label, or `data-is-pressed`                                                                             | Pressed and unpressed                                         | —                                                                                                                                                                                                                                                          | `audit:ToggleButton/theming`       |
| FR14                | Evidence gap: no ToggleButton test presses or loads under `prefers-reduced-motion: reduce`, or loads self-colored content; the shipped scale and fade fail the reduced-motion clauses | Mouse and touch press; pending Action with a fine pointer     | A computed transform other than `none` or `scale(1)` during a press, or a Spinner opacity below 1 after it appears.                                                                                                                                        | `audit:ToggleButton/behavior`      |
| FR10                | Evidence gap: no test of ToggleButton size precedence                                                                                                                                 | —                                                             | —                                                                                                                                                                                                                                                          | `audit:ToggleButton/layout`        |
| FR13, AR2           | `ToggleButton.test.tsx` children, icon-only, and width-reservation cases; `ToggleButton.a11y.chromium.spec.ts` state-inventory check for the rendered visible label                   | Labelled; custom children; icon-only                          | A labelled toggle without its visible label, children that do not replace it, an icon-only toggle without `aria-label`, or a width copy not hidden from assistive technology fails. Evidence gap: no jsdom test asserts `aria-label` on a labelled toggle. | `audit:ToggleButton/accessibility` |
| AR5                 | `ToggleButton.a11y.test.tsx` and `ToggleButton.a11y.chromium.spec.ts` operable and focusable facts                                                                                    | Standalone and grouped                                        | A toggle that is not operable or that Tab does not reach fails. Evidence gap: no test asserts the focus indicator or the target size.                                                                                                                      | `audit:ToggleButton/accessibility` |
| AR4, PR1            | Evidence gap: no test asserts the absence of an automatic tooltip or the cost of the width copy                                                                                       | —                                                             | —                                                                                                                                                                                                                                                          | `audit:ToggleButton/behavior`      |

## Current-state impact

- **Disabled focusability (FR7).** A disabled ToggleButton without a tooltip
  renders native `disabled`, as `component:Button` FR10 records, against
  `spec:AST-085` FR1 and FR4 and `family:buttons` FR3. The shared toggle-pattern browser states expect
  that native `disabled`.
- **Duplicated label (FR8, PR1).** A labelled toggle renders a hidden semibold
  copy of its label to reserve width, so `children` mount twice, against
  `architecture:component-style-authoring` INV7.
- **Pre-prevented click (FR3).** A click already prevented before the toggle's
  handler calls `onPressedChange` but not `pressedChangeAction`, so an
  Action-only toggle ignores it, against `family:buttons` FR5.
- **Reduced motion (FR14).** A ToggleButton scales to 0.98 on a press, and its
  Spinner fades in, when the person prefers reduced motion, against
  `design:reduced-motion` DR1 and DR3, as `component:Button` FR8 and FR15
  record.
- **Self-colored content while pending (FR14).** Content that paints its own
  colors stays visible beside the Spinner, as `component:Button` FR8 records.
- **Consumer docs.** `ToggleButton.doc.mjs` says an icon without children makes
  the toggle icon-only, and that icon-only adds an automatic tooltip from the
  label; its anatomy rows and the `isIconOnly` JSDoc in `ToggleButton.tsx`
  promise the same automatic tooltip. Icon-only depends on `isIconOnly` alone,
  and no tooltip appears without `tooltip` (FR13, AR4).
- **Caller pressed attributes (FR12, AR1).** A caller `aria-pressed` or
  `data-is-pressed` replaces ToggleButton's own, against
  `architecture:public-component-api` INV5.
- **Family adoption table.** `family:buttons` lists ToggleButton elevation as an
  adoption gap; the axis is shipped (FR11).

## Decision log

No component-local decision. ToggleButton applies `family:buttons` and
`component:Button`.

## Open questions

- **OQ1 — Should ToggleButton inherit an outer size provider like Button?**
  (`human-api`) It reads only its own `size` and its group's (FR10); Button and
  IconButton also read the nearest size provider.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/ToggleButton/ToggleButtonGroup.spec.md -->


# ToggleButtonGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | None changes. ToggleButtonGroup takes `label`, `type` (`single` or `multiple`), a controlled `value` and `onChange`, `orientation`, `size`, `isDisabled`, `xstyle`, and `data-testid`.     |
| Behavior                | A labelled `role="group"` of separate ToggleButtons. Valued members show the group's selection and ask the group to toggle; the group reports the next selection through `onChange`.       |
| End-user impact         | People pick one or several options; a touch press can slide across, and only the lifted toggle toggles. Each member is its own Tab stop. A disabled group's members leave the tab order.   |
| Builder impact          | None.                                                                                                                                                                                      |
| Compatibility/readiness | No API or default change; its DOM change is listed below. Disabled members use native `disabled` without a tooltip, against `spec:AST-085` FR1 and FR7; listed under Current-state impact. |
| Review checks           | Reject a group without a name, a member whose pressed state disagrees with `value`, a member Action started by group activation, a wrapper shadow, or connected surfaces.                  |
| Governing rules         | `family:buttons` FR8, FR11, FR12, AV5; `spec:AST-085` FR1, FR7.                                                                                                                            |

This table is a review projection; the body below is authoritative.

## Intent

ToggleButtonGroup owns single or multiple selection across a set of
ToggleButtons and lays them out as separate surfaces, as `family:buttons`
assigns. Consumer usage lives in `ToggleButtonGroup.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` for a mouse; under the touch
  presentation a press gains the slide across the toggles; `type="single"`,
  `orientation="horizontal"`, `isDisabled={false}`
- Compatibility class: no public prop, default, or export change; under the
  touch presentation the DOM gains the action-group item marker on each
  tracked toggle, the gesture host's `data-astryx-touch-action` marker on the
  group root and the hit layer's inset properties, and an enabled group's root
  is also `position: relative`, so absolutely positioned descendants resolve
  against it there
- Controlled/uncontrolled behavior: controlled only; the group holds no
  selection of its own
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The group root: role, accessible name, layout, and the
  `toggle-button-group` target.
- Selection: which valued members are pressed, and the next selection a member
  activation requests.
- The default size and disabled state valued and unvalued members read.
- The press across members while it tracks a held pointer
  (`family:action-groups`): the press painted on the member under the
  pointer, the lift that runs only that member's click, and the hit layer that
  grows the members' touch targets toward 44 px.

**Does not own / non-goals**

- Each member's surface, `aria-pressed`, hover and selected paint, and
  disabled rendering — owned by `component:ToggleButton` and
  `component:Button`.
- Connected geometry and a shared elevation — not provided; members are
  separate surfaces (`family:buttons` FR12).
- Roving focus — not provided; each member is a Tab stop (`family:buttons`
  AV5).
- Requiring a selection in single mode — not provided; the active member
  deselects.

## Public concepts

| Concept     | Closed values or states      | Meaning                          | Availability by variant/orientation/state | Default       | Owner                         | Stability | Invalid-value behavior                                                   |
| ----------- | ---------------------------- | -------------------------------- | ----------------------------------------- | ------------- | ----------------------------- | --------- | ------------------------------------------------------------------------ |
| Type        | `single`, `multiple`         | How many members may be pressed. | Always; fixes the `value` shape.          | `single`      | `component:ToggleButtonGroup` | Stable    | TypeScript rejects a `value` or `onChange` that does not match the type. |
| Value       | `string \| null`, `string[]` | The selected member values.      | Always; required.                         | required      | `component:ToggleButtonGroup` | Stable    | A value no member carries selects nothing visible.                       |
| Orientation | `horizontal`, `vertical`     | Row or column layout.            | Always.                                   | `horizontal`  | `component:ToggleButtonGroup` | Stable    | TypeScript rejects other values.                                         |
| Size        | `sm`, `md`, `lg`             | Default member size.             | Always; a member's own `size` wins.       | members' `md` | `family:buttons`              | Stable    | TypeScript rejects other values.                                         |
| Disabled    | off, on                      | Every member is disabled.        | Always.                                   | off           | `component:ToggleButtonGroup` | Stable    | Not applicable.                                                          |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| FR1 | The root is one element with `role="group"` and `aria-label` set to `label`, carrying `astryx-toggle-button-group`, `data-testid`, and `xstyle`. It exposes no orientation or disabled attribute of its own.                                                                                                                                                              | `family:buttons` FR11; current source and tests      |
| FR2 | Members sit in a row (or a column when vertical) separated by the `--spacing-1` gap. The wrapper paints no surface and no shadow; each member keeps its own surface and elevation.                                                                                                                                                                                        | `family:buttons` FR8, FR12; current source and tests |
| FR3 | A member whose `value` is in the selection renders pressed; every other valued member renders unpressed.                                                                                                                                                                                                                                                                  | `family:buttons` FR11; current tests                 |
| FR4 | Single mode: activating an unpressed member calls `onChange` with its value; activating the pressed member calls `onChange(null)`.                                                                                                                                                                                                                                        | Current tests                                        |
| FR5 | Multiple mode: activating an unpressed member calls `onChange` with the current values plus its value appended; activating a pressed member calls it with that value removed.                                                                                                                                                                                             | Current tests                                        |
| FR6 | Member activation only requests a selection. The pressed state changes when the caller passes the new `value`, never earlier, and no member Action or Action-pending state runs (`component:ToggleButton` FR6).                                                                                                                                                           | `family:buttons` FR11; current tests                 |
| FR7 | Members read the group's `size` as their default and its disabled state. While disabled, every member MUST be disabled under `component:ToggleButton` FR7: focusable with `aria-disabled` and inert (`spec:AST-085` FR1, FR7); an enabled group does not re-enable a member that disables itself. Implementation gap: members without a tooltip render native `disabled`. | `family:buttons` FR3, FR11; current tests            |
| FR8 | Each member is its own Tab stop in DOM order; the group adds no arrow-key handling.                                                                                                                                                                                                                                                                                       | `family:buttons` AV5; current source                 |
| FR9 | The group's selection, size, and disabled context does not reach ToggleButtons rendered inside a layer opened from a member (`spec:AST-038` FR7, FR8).                                                                                                                                                                                                                    | Current source                                       |

### Allowed variation

- **AV1 — Members.** Members are ToggleButtons; a member without `value` reads
  only the group's size and disabled state and otherwise behaves standalone.

### Representative states

| State                   | Required invariant                                            | Allowed variation       |
| ----------------------- | ------------------------------------------------------------- | ----------------------- |
| Single, none selected   | Every member unpressed; activating one requests its value.    | Orientation.            |
| Single, one selected    | That member pressed; activating it requests `null`.           | —                       |
| Multiple, some selected | Each selected member pressed; activation adds or removes one. | —                       |
| Member disabled         | That member inert; others selectable.                         | Tooltip present or not. |
| Group disabled          | Every member inert (FR7 gap for members without a tooltip).   | —                       |

### Transformation and precedence order

- **ORD1 — Member pressed state.** For a valued member, the group's selection;
  the member's own `isPressed` is ignored.
- **ORD2 — Member size.** Member `size`, then group `size`, then `md`.
- **ORD3 — Member disabled.** Group disabled or member disabled.

### Performance and resources

- **PR1 — Layout reads and listeners only for press tracking.** Every group, a
  disabled one too, reads the touch presentation through
  `useTouchPresentation`, which listens to two media queries. Only an enabled
  group under the touch presentation tracks presses and watches its hit area.
  Any other group reads no box. When a press begins, the tracker reads the
  group's box once. It reads each enabled toggle's box three times for a
  finger, which picks the nearest target, and twice for a pen. A finger's
  press also reads each disabled toggle's box once. It also reads, once, the
  box of each member the group does not track, such as a toggle without a
  value. A finger's press on the group's own box or hit layer first reads each
  member's box once more. The group takes it only where a toggle's target
  holds it. A press reads no box outside the group. Nothing is read per move
  or at the lift. The hit-area watch (`utils/hitArea.ts`) reads the enabled
  tracked toggles' boxes when the group's layout changes, not at a press. It
  listens to the `(pointer: coarse)` query once per page. It sizes each side
  of the hit layer as far as the toggles on that edge grow, against the page's
  interactive elements. It ends at the outer toggles' targets, even where the
  group's box reaches past them. The layer exists while the group tracks
  presses; with no growth it covers nothing. The group adds no other observer
  or listener beyond the press tracking `family:action-groups` FR5 gives it.

## Accessibility contract

- **AR1 — Group name.** The group exposes `role="group"` with `label` as its
  name; members keep their own names and `aria-pressed`.
- **AR2 — Keyboard.** Tab moves through members in order (FR8); each member
  activates with Enter and Space as a Button does.
- **AR3 — Disabled.** Members expose disabled per `component:Button` AR5 (FR7
  gap); the group root carries no disabled state.

## Design relationships

| Anatomy or state | Design requirement                               | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| Members          | Separate ToggleButton surfaces with a small gap. | Current source           | Prominent      | FR2                |
| Group wrapper    | Layout only; no paint or shadow.                 | Current source           | Supporting     | FR2                |

No design record governs ToggleButtonGroup. Its root carries the
`toggle-button-group` target with no reflected visual props.

## Family and system relationships

- `family:buttons` assigns selection ownership, spaced layout, no wrapper
  elevation, and the toggle group's own keyboard model (FR11, FR12, AV5);
  ToggleButtonGroup adopts them.
- `component:ToggleButton` defers its pressed state and requests to the group
  for valued members (`component:ToggleButton` FR6).
- `spec:AST-085` FR7 applies to group disablement; the gap is FR7 here.

## Verification map

| Contract                     | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Representative states                                                             | Mutation or failure expectation                                                                                                                                                                                                                                                   | Audit section                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1, AR1                     | `ToggleButton.test.tsx` group role and label cases                                                                                                                                                                                                                                                                                                                                                                                                                                        | Single and multiple                                                               | A missing name or role fails. Evidence gap: no test asserts the root target, `data-testid`, or `xstyle`.                                                                                                                                                                          | `audit:ToggleButtonGroup/accessibility` |
| FR3–FR5, ORD1                | `ToggleButton.test.tsx` single and multiple suites                                                                                                                                                                                                                                                                                                                                                                                                                                        | Select, switch, deselect, add, remove                                             | A wrong pressed member or a wrong `onChange` payload fails.                                                                                                                                                                                                                       | `audit:ToggleButtonGroup/behavior`      |
| FR6                          | `ToggleButton.test.tsx` group-ownership cases                                                                                                                                                                                                                                                                                                                                                                                                                                             | Members with standalone handlers and `onClick`                                    | A member Action runs, or pressed state moves before `value`, fails.                                                                                                                                                                                                               | `audit:ToggleButtonGroup/behavior`      |
| FR7, ORD3, AR3               | `ToggleButton.test.tsx` disabled suite; `ToggleButton.a11y.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                      | Member disabled; group disabled; tooltip-bearing member                           | A disabled member that toggles, or a re-enabled member, fails. The shared disabled states expect native `disabled`, matching the FR7 gap.                                                                                                                                         | `audit:ToggleButtonGroup/accessibility` |
| FR2                          | `ToggleButton.test.tsx` grouped elevation case                                                                                                                                                                                                                                                                                                                                                                                                                                            | Member with its own elevation                                                     | A member losing its elevation inside the group fails. Evidence gap: no test asserts the spacing or the unpainted wrapper. Evidence gap: no test reads a member's painted shadow.                                                                                                  | `audit:ToggleButtonGroup/layout`        |
| FR9 (selection)              | `layerScopedContext.test.tsx` "ends ancestor selection and callbacks while honoring explicit toggle props"                                                                                                                                                                                                                                                                                                                                                                                | Member inside a fixed Layer and an inline Dialog                                  | A member inside a layer that follows the outer group's selection or callbacks fails.                                                                                                                                                                                              | `audit:ToggleButtonGroup/behavior`      |
| FR8, FR9 (size and disabled) | Evidence gap: no test of member Tab order, or of size and disabled scoping at a layer                                                                                                                                                                                                                                                                                                                                                                                                     | —                                                                                 | —                                                                                                                                                                                                                                                                                 | `audit:ToggleButtonGroup/accessibility` |
| FR7 (size), ORD2             | Evidence gap: no test asserts the group size default or member size precedence                                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                                 | —                                                                                                                                                                                                                                                                                 | `audit:ToggleButtonGroup/behavior`      |
| PR1                          | `ToggleButtonGroupTracking.test.tsx` "marks each toggle as a tracked action, and marks none while the group is disabled", the once-per-press case and the count case "reads each box a fixed number of times as a press begins (PR1)", and the band case "draws each tracked toggle's touch band on the group's hit layer: a tracked toggle draws none of its own, and a toggle without a value keeps its own"; `ToggleButtonGroupTracking.interaction.browser.spec.ts` 44 px target case | Group tracking under a finger and a pen; group disabled; a toggle without a value | A disabled group that tracks, a toggle whose target does not reach 44 px under a finger, another number of reads as a press begins, a box read per move, or a tracked toggle with a touch band of its own fails. Evidence gap: no test counts the touch presentation's listeners. | `audit:ToggleButtonGroup/behavior`      |
| AR2                          | `ToggleButton.a11y.test.tsx` and `ToggleButton.a11y.chromium.spec.ts` operable and focusable facts for the single- and multiple-group states                                                                                                                                                                                                                                                                                                                                              | Group members                                                                     | A group member that is not operable or that Tab does not reach fails.                                                                                                                                                                                                             | `audit:ToggleButtonGroup/accessibility` |
| RTL relation                 | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `ToggleButton / Group single`                                                                                                                                                                                                                                                                                                                                                                                    | Two adjacent toggle buttons; LTR and RTL                                          | An earlier button that is not at the inline start of the next fails D2.                                                                                                                                                                                                           | `audit:ToggleButtonGroup/i18n-rtl`      |

## Current-state impact

- **Disabled focusability (FR7).** A disabled group renders members without a
  tooltip with native `disabled`, against `spec:AST-085` FR1 and FR7 and
  `family:buttons` FR3.

## Decision log

No component-local decision. ToggleButtonGroup applies `family:buttons`.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
