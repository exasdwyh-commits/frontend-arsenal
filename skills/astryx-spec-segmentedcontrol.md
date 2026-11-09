---
schema_version: 3
template_version: 7
kind: component
id: component:SegmentedControl
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-28
owners: [cixzhang]
review_triggers:
  [
    public-api,
    behavior,
    layout,
    interaction,
    motion,
    theming,
    styling,
    accessibility,
    visual,
    react-runtime,
    compatibility,
  ]
verified_by:
  [
    packages/core/src/SegmentedControl/SegmentedControl.test.tsx,
    packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts,
    packages/core/src/SegmentedControl/useSegmentedSelectionMotion.test.ts,
    packages/core/src/SegmentedControl/useSegmentedTouchTracking.test.ts,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.test.tsx,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs:
  [design:user-states, design:bidirectionality, design:reduced-motion]
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-style-authoring,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs:
  [
    spec:AST-020,
    spec:AST-020/FR9,
    spec:AST-085,
    spec:AST-094,
    spec:AST-094/FR4,
    spec:AST-094/FR11,
    spec:AST-094/FR13,
    spec:AST-094/FR43,
    spec:AST-094/FR45,
  ]
---

# SegmentedControl component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. SegmentedControl takes `label`, `value`, `onChange`, `size`, `layout`, `isDisabled`, `disabledMessage`, base props, and SegmentedControlItem children.                                                                                                                                                                                                                                                                                                                                              |
| Behavior                | A `role="radiogroup"` named by `label` with one Tab stop; arrow keys, Home, and End move focus between enabled segments, wrap, and select the segment they land on. Tabbing in never changes the value. Every change of selection slides the selected surface, and a drag from the selected segment carries it with any pointer until the lift commits.                                                                                                                                                           |
| End-user impact         | People switch between a few modes with one click or arrow press, and the control shrinks with its row by truncating labels. A disabled control keeps one Tab stop.                                                                                                                                                                                                                                                                                                                                                |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. A drag now commits at the lift on the nearest segment, where a press used to select only on a click inside a segment; `onChange` still fires once per commit, and a lift outside the control still selects nothing (patch, the touch presentation batch). A caller `onFocus` or `onBlur` can cancel built-in focus behavior, caller handlers run while disabled, and a caller `aria-describedby` is dropped; all are listed under Current-state impact. |
| Review checks           | Reject more than one Tab stop, a value change on Tab entry, arrows that land on a disabled segment, a control that overflows its container when segments have labels, or a selection while disabled.                                                                                                                                                                                                                                                                                                              |
| Governing rules         | WAI-ARIA radio group pattern; `spec:AST-020` FR9, FR15, DEC-5; `spec:AST-094` FR4, FR11, FR13, FR43; `design:reduced-motion`; `spec:AST-085` FR1, FR2, FR5, FR7; `design:user-states` DR1–DR3 (through SegmentedControlItem); `design:bidirectionality` DR6; `architecture:component-size-cascade` INV3–INV5; `architecture:interaction-modality` INV1; `architecture:public-component-api` INV5, INV7.                                                                                                           |

This table is a review projection; the body below is authoritative.

## Intent

SegmentedControl presents a group of mutually exclusive choices through
SegmentedControlItem children. It owns the radiogroup, its single Tab stop and
arrow-key selection, the group's size, layout, and disabled state, and the
consumer theming anatomy. Consumer usage lives in `SegmentedControl.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `size="md"`, `layout="hug"`, not disabled
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled; selection is `value` and
  `onChange`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The radiogroup control and its current `segmented-control` theming target.
- The roving Tab stop, arrow, Home, and End navigation, and
  selection-follows-focus.
- Group size, layout, disabled state, and the disabled-reason tooltip.
- The keyboard hint shown on first keyboard focus.
- The consumer theming anatomy, including the segment target's mapping.

**Does not own / non-goals**

- Each segment's radio semantics, click selection, label and icon rendering,
  item disabled state, and paint — owned by `component:SegmentedControlItem`.
- The artwork supplied through an item's `icon` prop — owned by the caller.
- A separate anatomy part or target for selected state; selection is state on the
  segment target.
- A visible control-level label; the control's required `label` is its accessible
  name and is not rendered as visual anatomy.
- Page navigation — use TabList; no SegmentedControl requirement covers it.

## Public concepts

| Concept  | Closed values or states | Meaning                                                   | Availability by variant/orientation/state | Default                   | Owner                        | Stability | Invalid-value behavior                                                                                                   |
| -------- | ----------------------- | --------------------------------------------------------- | ----------------------------------------- | ------------------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| Value    | string                  | The selected segment's value.                             | Always.                                   | required                  | `component:SegmentedControl` | Stable    | A value no segment carries selects nothing; the first segment not disabled by its own `isDisabled` becomes the Tab stop. |
| Size     | `sm`, `md`, `lg`        | Segment height and text size.                             | Always.                                   | Inherited size, else `md` | `component:SegmentedControl` | Stable    | TypeScript rejects other values.                                                                                         |
| Layout   | `hug`, `fill`           | Content-sized control, or full width with equal segments. | Always.                                   | `hug`                     | `component:SegmentedControl` | Stable    | TypeScript rejects other values.                                                                                         |
| Disabled | off, on, on with reason | Blocks selection on every segment.                        | A reason applies only with `isDisabled`.  | off                       | `component:SegmentedControl` | Stable    | A reason without `isDisabled` renders nothing.                                                                           |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| FR1  | The radiogroup container carries the current `segmented-control` target with `data-size`, sets `aria-label` to `label`, and renders its supplied children.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source, docs, and tests                                               |
| FR2  | The group is one Tab stop: the selected segment, or, when the value matches no segment, the first segment not disabled by its own `isDisabled` (in a disabled group that segment keeps the stop, FR7); a disabled selected segment MUST keep the Tab stop (`spec:AST-085` FR1). ArrowLeft and ArrowRight move focus between enabled segments in the visual direction, flipping in right-to-left layouts (`design:bidirectionality` DR6), and wrap; Home and End jump to the ends; ArrowUp and ArrowDown do nothing. Disabled segments are skipped.                                                                                                                                                                                                      | WAI-ARIA radio group pattern; current tests; `design:bidirectionality` DR6    |
| FR3  | When arrow, Home, or End navigation moves focus to an enabled segment, that segment's value is passed to `onChange` if it differs. A tap selects through the segment's click when its lift lands on that segment; a drag commits at the lift on the segment nearest the pointer, its padding and the gaps between segments included (FR13); a lift outside the control selects nothing (`spec:AST-020` FR9, DEC-5). Focus entering the group from outside never changes the value.                                                                                                                                                                                                                                                                      | WAI-ARIA radio group pattern; current tests; `spec:AST-020` FR9, DEC-5        |
| FR4  | A caller `onKeyDown` runs before built-in navigation and can cancel it with `preventDefault()`; a caller `onFocus` runs before selection-follows-focus. On first keyboard focus an ephemeral hint naming the arrow keys appears at the focused segment and dismisses on the first arrow press, a timeout, or blur. Built-in focus behavior MUST NOT be cancellable except where the public API promises it (`architecture:public-component-api` INV7). Implementation gap: a caller `onFocus` that calls `preventDefault()` also cancels the hint, the Tab-stop sync, and selection-follows-focus, and a caller `onBlur` that does so cancels the hint's blur dismissal.                                                                                | Current source and tests; `architecture:public-component-api` INV7            |
| FR5  | `hug` sizes the control to its segments; when any segment shows a visible label, the control never exceeds its container and labelled segments shrink and truncate. A control of only icon-only segments keeps its size. `fill` stretches the control to its container and gives segments equal shares that can shrink and truncate.                                                                                                                                                                                                                                                                                                                                                                                                                    | Current tests                                                                 |
| FR6  | Size resolves from an explicit `size`, then the nearest size provider, then `md`, and reaches every segment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `architecture:component-size-cascade` INV3–INV5; current source               |
| FR7  | `isDisabled` sets `aria-disabled` on the radiogroup, disables every segment, dims the control to half opacity, and blocks selection. The group MUST keep a Tab stop while disabled, placed as in FR2, and pointer events stay on (`spec:AST-085` FR1, FR7). With `disabledMessage`, a reason tooltip opens on hover and keyboard focus; the reason MUST describe the focusable segment (`spec:AST-085` FR5, FR7). Implementation gap: caller handlers on the radiogroup, such as `onKeyDown`, still run while disabled (`spec:AST-085` FR2).                                                                                                                                                                                                            | `spec:AST-085`; current tests                                                 |
| FR8  | The radiogroup owns `role`, `aria-label` (from `label`), `aria-disabled`, and `data-size`; a caller value for any of them is replaced. Other base props reach the radiogroup, and `ref` reaches it. Implementation gap: a caller `aria-describedby` is replaced, by the disabled-reason id or by nothing, against `architecture:public-component-api` INV5.                                                                                                                                                                                                                                                                                                                                                                                             | `architecture:public-component-api` INV5; current source and tests            |
| FR9  | Under every pointer, a change of selection slides the selected surface from the old segment to the new one as one surface, the radiogroup's `::before`, animating transform and opacity only. Under a touch presentation, a change that a tap, a click, a key or the program starts settles on the same spring as a drag's release, from rest: under touch, SegmentedControl's main interaction is a gesture (`spec:AST-094` FR45). Without a touch presentation, a change that a click, a key or the program starts slides on the theme's duration and easing tokens, as released. A drag's release settles on that spring from the release velocity (FR10, FR13).                                                                                     | Owner direction; `spec:AST-094` FR13; current source and tests                |
| FR10 | A drag's release settles on the internal `segmented.*` motion roles with UIKit's measured values, starting at the release velocity under every pointer, with the theme's `character` and `tempo` shaping the spring (`spec:AST-094` FR4, FR45, DEC-15; thresholds internal under `spec:AST-002` FR3). Under Reduce Motion the old surface fades out in place as the new one fades in (`design:reduced-motion` DR1–DR3). With a fine pointer under Reduce Motion, the theme's transition shows the change. Implementation gap: under a mouse or a pen a drag's release slides on the theme's duration.                                                                                                                                                   | UIKit measurements (iOS 26.2); `design:reduced-motion` DR1–DR3; current tests |
| FR11 | Under a finger, a held unselected segment paints the pressed overlay on its part, as under a mouse (`design:user-states` DR1); no theme role changes or dims it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `design:user-states` DR1; current tests                                       |
| FR12 | During a drag of the selected surface, the selected label's colour follows the surface, with an internal hysteresis around each boundary; the weights change at the lift. A tap selects through the browser's click (`spec:AST-094` FR11).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Owner decision (weights at the lift); current tests                           |
| FR13 | Under a finger, a drag from the selected segment carries the selected surface with the finger, within an internal overshoot past the end segments, and the lift commits the segment nearest the finger through that segment's click; a drag that starts on another segment leaves the surface in place and commits where it lifts, as a menu's press-tracking slide commits where it lifts (`spec:AST-094` FR26–FR28). A mouse and a pen drag the same way (`spec:AST-094` FR43). Under Reduce Motion the surface still follows the pointer, as direct movement (`design:reduced-motion`), and a finger's release cross-fades; under a fine pointer a mouse's or a pen's release lands at once (DR3). A lift outside the control commits nothing (FR3). | `spec:AST-094` FR26–FR28, FR43; `design:reduced-motion`; current tests        |

### Allowed variation

- **AV1 — Segments.** A segment may render its visible label, an icon and label,
  or an icon while the required label supplies the accessible name.
- **AV2 — Theme paint.** Themes may restyle the control and segments through
  their targets and the reflected states.

### Representative states

| State                | Required invariant                                                                              | Allowed variation |
| -------------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| Hug, labelled        | Content-sized; capped at the container; labels truncate.                                        | Size.             |
| Fill                 | Full width; equal segments.                                                                     | —                 |
| Unmatched value      | The first segment not disabled by its own `isDisabled` is the Tab stop; Tab-in changes nothing. | —                 |
| Disabled with reason | Selected segment focusable; reason tooltip; no selection.                                       | —                 |
| Disabled, no reason  | Selected segment focusable; no selection.                                                       | —                 |

### Transformation and precedence order

- **ORD1 — Keydown and focus.** Caller `onKeyDown`, then the hint, then
  navigation unless prevented; caller `onFocus`, then the hint, the Tab-stop
  sync, and selection-follows-focus (today also cancelled by a prevented
  `onFocus`, FR4 gap).
- **ORD2 — Tab stop.** The selected segment; for a value that matches no
  segment, the first segment not disabled by its own `isDisabled`. A disabled
  selected segment, or a segment of a disabled control, keeps the stop (FR2,
  FR7).

### Performance and resources

- **PR1 — Bounded resources.** One roving-focus handler, one hint, and the
  disabled-reason tooltip's pointer and focus listeners on the radiogroup per
  control, plus, through the tooltip's layer, the shared gesture counter's
  document listeners, installed once per page; segments share the press
  controller's window and document listeners.
- **PR2 — The touch presentation adds no element.** SegmentedControl is a
  repeated control, so it keeps the strict element budget
  (`architecture:component-style-authoring` INV7): the slide uses the
  radiogroup's `::before`.

## Accessibility contract

- **AR1 — Group semantics.** `role="radiogroup"` named by `label`; segments
  follow `component:SegmentedControlItem` AR1.
- **AR2 — Keyboard.** FR2 and FR3.
- **AR3 — Disabled reason.** FR7.

## Design relationships

| Anatomy or state | Design requirement                                          | Representation authority       | Hierarchy role | Component contract                   |
| ---------------- | ----------------------------------------------------------- | ------------------------------ | -------------- | ------------------------------------ |
| Control          | Presents the current grouped choice container.              | Current source and public docs | Supporting     | FR1, FR5                             |
| Segment          | Presents one mutually exclusive choice and its item states. | Current source and public docs | Prominent      | `component:SegmentedControlItem` FR1 |
| Label            | Identifies a segment visually when not hidden.              | Current source and public docs | Prominent      | `component:SegmentedControlItem` FR3 |
| Icon             | Presents optional caller-supplied artwork within a segment. | Caller-supplied content        | Supporting     | `component:SegmentedControlItem` FR3 |

`design:user-states` governs the segments' pressed overlay and its
selected-segment exception (`component:SegmentedControlItem` FR5), and
`design:bidirectionality` DR6 governs the arrow-key direction (FR2). Selection is a state of Segment, not a
separate anatomy part. The consumer
docs declare both targets on SegmentedControl, so the map below covers the
segment parts as well.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Control": {"target": "segmented-control"},
  "Segment": {"target": "segmented-control-item"},
  "Label": {"inherits": "segmented-control-item"},
  "Icon": {"inherits": "segmented-control-item"}
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, inherited
  parts, and state-on-target rules.
- `spec:AST-085` owns disabled focusability, reasons, and callbacks; FR7
  records the gap.
- `component:SegmentedControlItem` owns each segment.

## Verification map

| Contract            | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Representative states                                                                                                                           | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                    | Audit section                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| FR1, AR1            | `SegmentedControl.test.tsx` rendering, size, and data-testid cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-*` states                                                                                                                                                                                                                                                                                                          | Control with several segments; sizes                                                                                                            | Lost group semantics or name fails. Evidence gap: no test asserts the `segmented-control` target or `data-size`.                                                                                                                                                                                                                                                                                                   | `audit:SegmentedControl/anatomy`       |
| FR2, FR3, ORD2, AR2 | `SegmentedControl.test.tsx` keyboard-navigation, unmatched-value and Tab-stop cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-*` states; the radio-group pattern's aborted-press check on `segmented-option-unselected`; the `segmented-group-selected-rtl` state's arrow round trip under `dir="rtl"`; `SegmentedControl.interaction.browser.spec.ts` slide-off cases for a finger and a mouse, with focus in the group or not | Arrows, wrap, Home, End; Tab-in with an unmatched or disabled selection                                                                         | A value change on Tab entry, no wrap, or landing on a disabled segment fails. A press that slides off with focus outside the group and still selects fails. A press with focus already in the group that selects before its lift fails.                                                                                                                                                                            | `audit:SegmentedControl/accessibility` |
| FR4, ORD1           | `SegmentedControl.test.tsx` container handler forwarding cases                                                                                                                                                                                                                                                                                                                                                                                                                                       | Caller `onKeyDown`, with and without `preventDefault`                                                                                           | A caller key handler that cannot cancel navigation fails. Evidence gap: no test asserts the caller `onFocus` order or the keyboard hint.                                                                                                                                                                                                                                                                           | `audit:SegmentedControl/behavior`      |
| FR5                 | `SegmentedControl.test.tsx` layout cases                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Hug, fill, narrow row, icon-only                                                                                                                | A control that overflows, or squeezes icon-only segments, fails.                                                                                                                                                                                                                                                                                                                                                   | `audit:SegmentedControl/layout`        |
| FR6                 | Evidence gap: no test asserts size precedence or its propagation                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                               | —                                                                                                                                                                                                                                                                                                                                                                                                                  | `audit:SegmentedControl/layout`        |
| FR7, AR3            | `SegmentedControl.test.tsx` disabled and disabledMessage cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-group-disabled` and `segmented-group-disabled-with-message` states                                                                                                                                                                                                                                                           | Group and item disabled; with reason                                                                                                            | A selection while disabled, or a missing reason tooltip, fails. Evidence gap: no test asserts the half opacity, or caller handlers while disabled. The `segmented-group-disabled` state declares a Tab stop.                                                                                                                                                                                                       | `audit:SegmentedControl/accessibility` |
| FR8                 | `SegmentedControl.test.tsx` role-override and data-testid cases                                                                                                                                                                                                                                                                                                                                                                                                                                      | Forwarded role                                                                                                                                  | A forwarded prop that overrides the role fails. Evidence gap: no test asserts `ref` or a caller `aria-describedby`.                                                                                                                                                                                                                                                                                                | `audit:SegmentedControl/api`           |
| FR9, FR10, PR2      | `useSegmentedSelectionMotion.test.ts` slide, retarget, keyboard, Reduce Motion and fine-pointer cases; `SegmentedControl.interaction.browser.spec.ts` slide, measured-spring, Reduce Motion, busy-main-thread and mouse-click proofs in Chromium and WebKit                                                                                                                                                                                                                                          | a tap, a retarget, keyboard selection, Reduce Motion, a mouse                                                                                   | a second surface or added element, a Layout or Paint per frame, a slide under a touch presentation on a curve instead of the selection spring from rest, a click's, a key's or a program change's slide without a touch presentation off the theme's curve, a drag release under any pointer that settles from rest or on a theme curve instead of a spring from its velocity, or travel under Reduce Motion fails | `audit:SegmentedControl/theming`       |
| FR11                | `SegmentedControl.interaction.browser.spec.ts` pressed-overlay proofs; `PressedState.a11y.chromium.spec.ts` segmented-control cases                                                                                                                                                                                                                                                                                                                                                                  | a held unselected segment, a held selected segment                                                                                              | an unselected segment without the pressed overlay, or a dim under the default theme fails                                                                                                                                                                                                                                                                                                                          | `audit:SegmentedControl/theming`       |
| FR12, FR13          | `useSegmentedSelectionMotion.test.ts` and `useSegmentedTouchTracking.test.ts` drag, face and lift cases; `SegmentedControl.interaction.browser.spec.ts` drag, overshoot, hysteresis, tap-click, slide-off, Reduce Motion drag, mouse and pen proofs                                                                                                                                                                                                                                                  | a hold, a drag, a release between segments, the end overshoot, a slow dither, a tap, a drag from another segment, a lift outside, Reduce Motion | a weight change mid-drag, a label that flips twice in a small dither, a commit anywhere but the segment nearest the finger, a commit after a lift outside, or a surface that stays put under Reduce Motion fails                                                                                                                                                                                                   | `audit:SegmentedControl/anatomy`       |
| PR1                 | Evidence gap: no test asserts the absence of global listeners                                                                                                                                                                                                                                                                                                                                                                                                                                        | —                                                                                                                                               | —                                                                                                                                                                                                                                                                                                                                                                                                                  | `audit:SegmentedControl/behavior`      |
| Target inventory    | `packages/core/src/theme/themingTargets.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Control and item targets                                                                                                                        | A rendered class absent from the documented targets fails.                                                                                                                                                                                                                                                                                                                                                         | `audit:SegmentedControl/theming`       |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Canonical anatomy and both current targets                                                                                                      | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                                                                                                                                                                                                                                                            | `audit:SegmentedControl/theming`       |

## Current-state impact

- **Focus handler cancellation (FR4).** A caller `onFocus` or `onBlur` that
  calls `preventDefault()` cancels built-in focus behavior the public API does
  not promise to expose, against `architecture:public-component-api` INV7.
- **Caller handlers while disabled (FR7).** Caller handlers on the radiogroup,
  such as `onKeyDown`, still run while disabled, against `spec:AST-085` FR2.
- **Caller description (FR8).** A caller `aria-describedby` on the control is
  replaced, against `architecture:public-component-api` INV5.

## Decision log

- **Keyboard model (FR2).** The keyboard model is horizontal only: ArrowLeft
  and ArrowRight skip disabled segments and select the segment they reach, and
  ArrowUp and ArrowDown do nothing; horizontal movement follows the visual
  direction (`design:bidirectionality` DR6). `spec:AST-085` leaves which items a
  composite's arrow keys visit to the composite.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, implementation
steps, or system rules. It links to their owners.

---

<!-- source: docs/specs/components/SegmentedControl/SegmentedControlItem.spec.md -->


# SegmentedControlItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. SegmentedControlItem takes `value`, `label`, `isLabelHidden`, `icon`, `isDisabled`, and base props, and must sit inside a SegmentedControl.                                                                                                                                               |
| Behavior                | One segment: a `<button role="radio">` with `aria-checked`. A click, or Space or Enter on the focused segment, selects it unless it is selected, disabled, or the caller's `onClick` prevents default.                                                                                                  |
| End-user impact         | People see the selected segment raised and bold, and pick another with one click. Icon-only segments are still named. A disabled selected segment keeps the Tab stop.                                                                                                                                   |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                   |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. A caller `onClick` runs while disabled, a caller `className` is replaced, segments hold a fixed height, and a truncated `sm` segment can be under 24 px wide; all are listed under Current-state impact.                                      |
| Review checks           | Reject a segment without a name, a click that selects a disabled segment, press paint on the selected or a disabled segment, or a lost forced-colors selected state.                                                                                                                                    |
| Governing rules         | `component:SegmentedControl`; WAI-ARIA radio pattern; `spec:AST-020` FR9, FR15, DEC-5; `spec:AST-085` FR1, FR2; `spec:AST-102` FR4; `design:user-states` DR1–DR3 (pressed overlay, disabled non-response, and selected-segment exception); `architecture:public-component-api` INV5, INV6; WCAG 1.4.11. |

This table is a review projection; the body below is authoritative.

## Intent

SegmentedControlItem is one choice in a SegmentedControl. It owns the
segment's radio semantics, click selection, naming, label and icon rendering,
item disabled state, and the segment's paint. Consumer usage lives in
`SegmentedControlItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; label visible, enabled
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled by the parent's `value`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The segment button, its radio role, checked and disabled state, and name.
- Click selection and `onClick` composition.
- Label and icon rendering, truncation, and segment paint per size and state.

**Does not own / non-goals**

- Tab stop, arrow navigation, selection-follows-focus, group disabled state,
  and the theming anatomy map — owned by `component:SegmentedControl`. The
  `segmented-control-item` target is declared in SegmentedControl's consumer
  docs and mapped in its record.
- Icon artwork — owned by the caller.
- Use outside SegmentedControl — not supported.

## Public concepts

| Concept  | Closed values or states   | Meaning                                            | Availability by variant/orientation/state | Default  | Owner                            | Stability | Invalid-value behavior              |
| -------- | ------------------------- | -------------------------------------------------- | ----------------------------------------- | -------- | -------------------------------- | --------- | ----------------------------------- |
| Value    | string                    | The value this segment selects.                    | Always.                                   | required | `component:SegmentedControlItem` | Stable    | TypeScript rejects a missing value. |
| Label    | string; visible or hidden | Visible text, or the name of an icon-only segment. | Always.                                   | visible  | `component:SegmentedControlItem` | Stable    | TypeScript rejects a missing label. |
| Disabled | off, item, group          | Blocks selection.                                  | Always.                                   | off      | `component:SegmentedControlItem` | Stable    | Not applicable.                     |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Basis                                                                        |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| FR1 | Each segment renders one `<button type="button" role="radio">` with `aria-checked` true when its `value` equals the group value, `data-value`, and the `segmented-control-item` target reflecting `data-size`, `data-selected`, and `data-disabled`. A forwarded prop cannot override the role.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | WAI-ARIA radio pattern; current source and tests                             |
| FR2 | A click, including one from Space or Enter on the focused segment (native button activation; `spec:AST-020` FR15), runs the caller `onClick` first; unless it prevents default, an enabled, unselected segment passes its value to the group's `onChange`. Clicking the selected segment does nothing. The caller's `preventDefault()` MUST veto every press.                                                                                                                                                                                                                                                                                                                                                                                                                                 | `spec:AST-020` FR15; current tests                                           |
| FR3 | The segment renders its icon (sized to the segment size) followed by its label. With `isLabelHidden`, the label is not rendered and becomes `aria-label`, and the segment does not shrink. A visible label truncates with an ellipsis when the segment is narrower than it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current tests                                                                |
| FR4 | A segment disabled by its own `isDisabled` or by the group sets `aria-disabled`, refuses selection, shows disabled text color, and shows no hover or press paint. A disabled selected segment MUST keep the Tab stop (`spec:AST-085` FR1); for a value that matches no segment, `component:SegmentedControl` FR2 places the stop. Implementation gap: a caller `onClick` still runs on a disabled segment (`spec:AST-085` FR2).                                                                                                                                                                                                                                                                                                                                                               | `spec:AST-085` FR1, FR2; current tests                                       |
| FR5 | The selected segment paints a raised surface with a low shadow and semibold primary text; under forced colors it paints `Highlight` with `HighlightText`. Unselected enabled segments paint the shared hover tint and, under `design:user-states` DR1 and DR2, the pressed overlay; the selected segment keeps its raised surface during a press (DR3).                                                                                                                                                                                                                                                                                                                                                                                                                                       | WCAG 1.4.11; `design:user-states` DR1–DR3; current tests                     |
| FR6 | Segment height is the element height for the size minus 4 CSS px (24, 28, or 32) as a minimum that grows with a set text size under `spec:AST-102` FR4 (implementation gap: the height is fixed), with corners concentric with the control; `sm` uses supporting text and tighter padding. Keyboard focus paints the shared focus outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `architecture:interaction-modality` INV1; current source; `spec:AST-102` FR4 |
| FR7 | The segment owns `role`, `aria-checked`, `aria-disabled`, `aria-label` (set from the label when hidden), `tabIndex`, `type`, `data-value`, and `data-size`, and writes `data-selected`, `data-disabled`, and the press marker `data-astryx-pressable` in their own states; a caller value for an owned attribute is replaced, while a caller `data-selected`, `data-disabled`, or `data-astryx-pressable` passes through on segments outside that state. `ref`, other `data-*`, `style`, other ARIA such as `aria-describedby`, and other base props reach the button; `xstyle` composes last. Caller `className` MUST compose with the component's classes (`architecture:public-component-api` INV5, INV6). Implementation gap: the component's merged class replaces a caller `className`. | `architecture:public-component-api` INV5, INV6; current tests                |

### Allowed variation

- **AV1 — Content.** Label text and icon vary within their types.

### Representative states

| State      | Required invariant                                                  | Allowed variation |
| ---------- | ------------------------------------------------------------------- | ----------------- |
| Unselected | `aria-checked="false"`; hover and press overlay.                    | Icon.             |
| Selected   | `aria-checked="true"`; raised; bold; Highlight under forced colors. | —                 |
| Icon-only  | Named by `aria-label`; does not shrink.                             | —                 |
| Disabled   | `aria-disabled`; no paint feedback; no selection.                   | Item or group.    |

### Transformation and precedence order

- **ORD1 — Click.** Caller `onClick`, then selection unless prevented,
  disabled, or already selected.

### Performance and resources

- **PR1 — Bounded resources.** No state, effect, or listener of its own; press
  feedback shares the press controller's window and document listeners.

## Accessibility contract

- **AR1 — Radio semantics.** Each segment exposes the radio role, checked
  state, disabled state, and a name (FR1, FR3).
- **AR2 — Target size.** The smallest segment is 24 CSS px tall. A labelled
  `sm` segment that truncates under `component:SegmentedControl` FR5 can shrink
  below 24 CSS px wide, short of WCAG 2.5.8 (implementation gap).
- **AR3 — Non-color state.** FR5.

## Design relationships

| Anatomy or state | Design requirement                                | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Segment          | Transparent button; raised surface when selected. | Current source           | Prominent      | FR1, FR5, FR6      |
| Label            | Medium text; semibold when selected; truncates.   | Current source           | Prominent      | FR3, FR5           |
| Icon             | Caller artwork sized to the segment.              | Current source           | Supporting     | FR3                |

The target mapping for these parts lives in `component:SegmentedControl`'s
theming anatomy.

## Family and system relationships

- `component:SegmentedControl` supplies the value, size, layout, and group
  disabled state, and owns keyboard navigation.
- `spec:AST-085` owns disabled focusability; FR4 records the gap.
- `design:user-states` owns the pressed treatment.

## Verification map

| Contract     | Verification                                                                                                                                                                                                       | Representative states                         | Mutation or failure expectation                                                                                                                                                                                                                                           | Audit section                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| FR1          | `SegmentedControl.test.tsx` aria-checked and data-testid cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-option-*` states                           | Selection change; data-testid                 | Stale `aria-checked` fails. Evidence gap: no test passes `role` to a segment; the role-override case covers the radiogroup.                                                                                                                                               | `audit:SegmentedControlItem/accessibility` |
| FR2          | `SegmentedControl.test.tsx` click and onClick-composition cases; `SegmentedControl.interaction.browser.spec.ts` click-commit and veto cases for a tap and a drag                                                   | Click; selected click; prevented click        | A selected or prevented click that selects fails. A press with focus already in the group that selects past a veto fails.                                                                                                                                                 | `audit:SegmentedControlItem/behavior`      |
| FR3          | `SegmentedControl.test.tsx` icon, icon-only, and truncation cases                                                                                                                                                  | Icon and label; icon-only; long label         | A missing name, or an icon that truncates, fails.                                                                                                                                                                                                                         | `audit:SegmentedControlItem/anatomy`       |
| FR4          | `SegmentedControl.test.tsx` disabled cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` (in `RadioList/__tests__`) `segmented-option-disabled` and `segmented-option-group-disabled*` states | Item and group disabled                       | A disabled segment that selects fails. Evidence gap: no test asserts the disabled text color, absent hover paint, or the caller `onClick` while disabled. The `segmented-option-group-disabled` state declares a checked, group-disabled segment that keeps the Tab stop. | `audit:SegmentedControlItem/accessibility` |
| FR5          | `SegmentedControl.test.tsx` forced-colors and pressed-state cases; `PressedState.a11y.chromium.spec.ts` segmented-control cases                                                                                    | Selected under forced colors; press; disabled | Lost forced-colors state, or press paint on a disabled segment, fails. Evidence gap: no test asserts the raised selected surface or the hover tint.                                                                                                                       | `audit:SegmentedControlItem/visual`        |
| FR6, FR7     | Evidence gap: no test of segment heights, text growth, focus outline, `ref`, or `xstyle` order                                                                                                                     | —                                             | —                                                                                                                                                                                                                                                                         | `audit:SegmentedControlItem/layout`        |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `SegmentedControl / With icons`                                                                                                           | Segment icon and label; LTR and RTL           | An icon that is not at the inline start of its label fails D2.                                                                                                                                                                                                            | `audit:SegmentedControlItem/i18n-rtl`      |

## Current-state impact

- **Narrow target (AR2).** A labelled `sm` segment that truncates can shrink
  below 24 CSS px wide, short of WCAG 2.5.8.
- **Caller className (FR7).** A caller `className` on a segment is replaced by
  the component's class, against `architecture:public-component-api` INV5 and
  INV6.
- **Caller onClick while disabled (FR4).** A disabled segment still runs a
  caller's `onClick`, against `spec:AST-085` FR2.
- **Fixed height (FR6).** Segments hold a fixed height instead of growing with
  a set text size, against `spec:AST-102` FR4.

## Decision log

No component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
