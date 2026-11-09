---
schema_version: 3
template_version: 7
kind: component
id: component:CheckboxList
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
    packages/core/src/CheckboxList/CheckboxList.test.tsx,
    packages/core/src/CheckboxList/__tests__/CheckboxList.a11y.chromium.spec.ts,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.test.tsx,
    packages/core/src/CheckboxInput/__tests__/Checkbox.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/CheckboxList/CheckboxList.fr10.test.tsx,
    packages/core/src/CheckboxList/CheckboxList.required.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:input-fields]
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
    architecture:interaction-modality,
  ]
contributing: []
system_specs: [spec:AST-011, spec:AST-021, spec:AST-038, spec:AST-085]
---

# CheckboxList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxList` is a labeled `role="group"` of `CheckboxListItem` rows. A `value` array selects controlled collection mode (`onChange`, `changeAction`); without it, its items are standalone. The group owns naming, description, disabled, disabled-reason, read-only, pending values, and status. Each option's behavior is `component:CheckboxListItem`.                     |
| Behavior                | The group names and describes its options, tracks every value whose `changeAction` is pending so each saving option stays busy while the others stay interactive, and applies disabled, read-only, and status to every option.                                                                                                                                                  |
| End-user impact         | People can identify the group, operate every option by pointer, touch, and keyboard, learn why a group is unavailable, and see which options are still saving.                                                                                                                                                                                                                  |
| Builder impact          | Builders choose collection mode by passing `value`, and then supply stable item `value`s. The rendering of a status without a message stays an open question here (OQ3); per-option open questions are in `component:CheckboxListItem`.                                                                                                                                         |
| Compatibility/readiness | Adds `isOptional` (FR16) and `isRequired` (FR17), each default `false`. Each checkbox gains `aria-invalid` under an error status; no other API, default, or DOM change.                                                                                                                                                                                                         |
| Review checks           | Reject a pending value that loses its busy state or re-toggle guard when another option is toggled, dropped group naming or description ids, a toggle while the group is disabled or read-only, or new target or state API introduced without an owner decision. Per-option checks are in `component:CheckboxListItem`.                                                         |
| Governing rules         | `architecture:public-component-api/INV1–INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:interaction-modality/INV1–INV5`; `architecture:component-test-sufficiency/INV1–INV7`; `architecture:knowledge-contracts/INV2`; `spec:AST-021/FR8–FR10`; `spec:AST-038/FR7`; `spec:AST-085/FR1, FR7`; `family:input-fields/FR10`; WCAG 2.2 1.3.1, 2.1.1, 4.1.2. |

This table is a review projection; the body below is authoritative.

## Intent

Present a small, labeled set of independent checkbox options whose checked,
available, read-only, busy, and status states stay aligned across pointer,
touch, keyboard, and assistive technology.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive `isOptional` (FR16) and `isRequired` (FR17),
  each default `false`; no other public prop, default, or export change; each checkbox gains `aria-invalid`
  under an error status
- Controlled/uncontrolled behavior: collection mode is controlled by `value`;
  standalone items follow `component:CheckboxListItem`; no uncontrolled mode
  exists
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The labeled checkbox group, its `checkbox-list` target, the group's
  description, status, and disabled-reason relationships, and where its
  base, `container*`, and `control*` props land.
- Collection state shared with CheckboxListItem: checked membership, change
  ordering, optimistic pending values, and group-level availability.
- The composed option anatomy and its target dispositions (Theming anatomy
  below).

**Does not own / non-goals**

- Each option's behavior — its checkbox, naming and description, standalone
  mode, row-surface delegation and `onClick` routing, item disabled and loading
  states, density sizing, and checked-row fill — owned by
  `component:CheckboxListItem`.
- List and option-row presentation — owned by `component:List`; its
  `list-item` target reaches only the row root.
- The checkbox control, its indicator, focus ring, and pressed overlay — owned
  by `component:CheckboxInput` and CheckboxIndicator.
- Group-label and validation-message presentation — owned by Field under `family:input-fields` (shared owner section)
  and `component:FieldStatus`.
- Loading-indicator presentation — owned by `component:Spinner`; tooltip
  behavior — owned by `useTooltip`.
- New targets or reflected states for the row, descriptions, or caller content.

## Public concepts

| Concept          | Closed values or states                                     | Meaning                                                                                                                       | Availability by variant/orientation/state | Default                   | Owner                  | Stability                              | Invalid-value behavior                                       |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- | ---------------------- | -------------------------------------- | ------------------------------------------------------------ |
| group naming     | `label`, `isLabelHidden`, `description`                     | Names and describes the `role="group"`; a hidden label still names it.                                                        | All states.                               | label required; visible   | caller and Field       | stable                                 | rejected by the public type                                  |
| optionality      | `isOptional`, `isRequired`                                  | Shows Field's optional or required indicator after the group label; `isRequired` also needs one checked box (FR17).           | All states.                               | false                     | caller and Field       | stable                                 | boolean only                                                 |
| collection value | `value` array present or absent                             | Present: the group owns checked membership and change handling for its items. Absent: its items are standalone.               | All states.                               | absent                    | caller and component   | stable                                 | an item without `value` in collection mode throws (item FR4) |
| change path      | `onChange`, `changeAction`, both, neither                   | Reports the next value array; `changeAction` runs after `onChange` in a transition with an optimistic value.                  | Collection mode.                          | neither                   | caller and component   | shipped; handlerless meaning unsettled | no handler means no component-owned mutation                 |
| availability     | enabled, `isDisabled`, `isDisabled` with `disabledMessage`  | Blocks toggling on every item, which stays focusable through `aria-disabled`; a reason adds a group tooltip.                  | Reason applies only with `isDisabled`.    | enabled                   | component              | stable                                 | a reason without `isDisabled` renders nothing                |
| read-only        | `isReadOnly`                                                | Makes every item read-only.                                                                                                   | Group-wide.                               | false                     | component              | stable                                 | boolean only                                                 |
| pending values   | the values whose `changeAction` is pending                  | Each pending value's item renders busy; toggling another item does not clear it; concurrent values settle together.           | Collection mode with `changeAction`.      | none                      | component              | stable                                 | transition state only                                        |
| status           | `warning`, `error`, `success`, optional message             | A message renders a detached FieldStatus after the list and describes the group; an error makes each checkbox `aria-invalid`. | All states.                               | none                      | caller and FieldStatus | shipped                                | a status without a message renders nothing                   |
| row layout       | `density` compact/balanced/spacious; `hasDividers`; `width` | Density reaches the List and its rows; dividers separate rows; width sizes the label, list, and status together.              | All states.                               | balanced; none; intrinsic | component and List     | stable                                 | rejected by the public types                                 |
| pass-through     | CheckboxList rest, `ref`, `container*`, `control*`          | Base props and `ref` reach the `role="group"`; `container*` the Field box; `control*` the group element.                      | All states.                               | none                      | component              | stable                                 | root `xstyle`, `className`, `style` are not accepted         |

Item props (`label`, `aria-label`, `description`, `endContent`, `isChecked`,
`onCheck`, item `isDisabled`, `isLoading`, and item pass-through) are concepts
of `component:CheckboxListItem`.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                                                                                            |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1  | The render MUST place CheckboxListItem children inside a List within a `role="group"` named by the group label through `aria-labelledby`; its `aria-describedby` MUST list any caller description, then the description, status message, and disabled-reason tooltip that are present, in that order.                                                                                                                                                                                                                                                                                                                | shipped source; focused tests; WCAG 1.3.1 and 4.1.2                                                                                              |
| FR2  | The CheckboxList root MUST carry the current `checkbox-list` target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | shipped source and public docs                                                                                                                   |
| FR4  | A status message MUST render through a detached FieldStatus after the list.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | shipped source, focused tests, and the Chromium accessibility suite                                                                              |
| FR6  | With a `value` array, the group MUST provide membership to its items, call `onChange` with the next array an item proposes (`component:CheckboxListItem` FR4), and then run `changeAction` with the same array in a transition with an optimistic value.                                                                                                                                                                                                                                                                                                                                                             | shipped source and focused tests                                                                                                                 |
| FR7  | The group MUST track every value whose `changeAction` is pending and expose it to its items, each of which renders busy (`component:CheckboxListItem` FR7); toggling another item MUST NOT clear an earlier pending value. Concurrent pending values settle together, after which every busy state clears.                                                                                                                                                                                                                                                                                                           | shipped public `changeAction` promise; focused regression test; the Chromium accessibility suite                                                 |
| FR9  | Group `isDisabled` MUST make every checkbox focusable-disabled through `aria-disabled` (`component:CheckboxInput` FR4) and refuse toggling, and MUST set `aria-disabled="true"` on the `role="group"` element, as `component:ButtonGroup` FR1 does. With `disabledMessage`, the reason tooltip opens on group hover and keyboard focus, and the reason MUST describe each focusable checkbox (`spec:AST-085` FR5, FR7). Implementation gap: the reason describes only the `role="group"`, so a focused checkbox is not described by it.                                                                              | `spec:AST-085` FR1, FR7; shipped source, focused tests, and shared checkbox binding                                                              |
| FR10 | Group `isReadOnly` MUST make every item in the group read-only (`component:CheckboxListItem` FR8 and FR10).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | shipped source; shared checkbox binding; `spec:AST-011` read-only vocabulary                                                                     |
| FR13 | `density` MUST reach the List and its rows (the checkbox size follows `component:CheckboxListItem` FR11); `hasDividers` MUST separate rows without a divider after the last row; `width` MUST size the label, list, and status together.                                                                                                                                                                                                                                                                                                                                                                             | shipped source, docs, and the Chromium accessibility suite                                                                                       |
| FR14 | An error `status` with a message renders it (FR4), and an error `status` makes every checkbox `aria-invalid="true"`, so a screen reader announces the invalid state as each checkbox takes focus. Implementation gap: a status without a message renders nothing; its meaning is OQ3.                                                                                                                                                                                                                                                                                                                                | shipped source; `spec:AST-002/FR15`                                                                                                              |
| FR15 | Base props, including ARIA and `ref`, MUST reach the `role="group"`; a caller `aria-labelledby` joins the group label and a caller `aria-describedby` comes first. `container*` MUST reach the Field box where one renders (in a `horizontal-labels` FormLayout none renders, and `container*` has no effect and warns), and `control*` the group element; root `xstyle`, `className`, and `style` are not accepted.                                                                                                                                                                                                 | `family:input-fields` FR10; `CheckboxList.fr10.test.tsx`                                                                                         |
| FR16 | `isOptional` MUST reach the group's Field as `isOptional`, so the group label shows the optional indicator unless the nearest `FormLayout` defaults fields to optional (`component:FormLayout` FR5). An empty selection is an answer, so a checkbox group takes no required state from a form default (`component:FormLayout` FR5's exception): with or without `isOptional`, its checkboxes carry no `aria-required` from it, and the form default puts no native `required` on them.                                                                                                                               | CheckboxInput and RadioList parity; WAI-ARIA 1.2 `group` has no `aria-required`, and `aria-required` on each checkbox would require every option |
| FR17 | `isRequired` marks the group required. Its name shows the input fields' required marker by the same rules every input field follows (`family:input-fields`), so where a form's default already marks fields required, no marker shows, as for any field. While no checkbox is checked, the first checkbox that is neither disabled nor read-only carries native `required`, so the browser blocks submit and focuses it with its own message; once any box is checked, no box carries `required`. An empty group is missing; the app's `status` stays the visible error text, and Astryx adds no message of its own. | Owner decision; `family:input-fields`; HTML constraint validation                                                                                |

Per-option requirements are owned by `component:CheckboxListItem`
(`architecture:knowledge-contracts/INV2`).

### Allowed variation

- **AV1 — Group content.** The label, description, status message, and width
  may vary within their public types.
- **AV2 — Theme paint.** The `checkbox-list` target and the composed group
  targets may change admitted visual properties without changing semantics or
  state precedence.

Option variation is `component:CheckboxListItem` AV1–AV3.

### Representative states

| State                      | Required invariant                                                                        | Allowed variation                  |
| -------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| Default collection         | Named group, options list, and rows render; membership reaches every item                 | Option content and selected values |
| Pending values             | Each pending value keeps its item busy until every pending value settles                  | Which options are pending          |
| Group disabled with reason | Checkboxes stay focusable and inoperable; the reason is reachable by hover, focus, and AT | Reason text                        |
| Group read-only            | Every item is read-only                                                                   | Which values are checked           |
| Group status with message  | Detached FieldStatus follows the group and describes it                                   | Error, warning, or success status  |

### Transformation and precedence order

- **ORD1 — Checked state.** Collection `value` → optimistic pending value → the
  membership each item reads (`component:CheckboxListItem` ORD1).
- **ORD2 — Toggle.** An item's proposed next array (`component:CheckboxListItem`
  ORD2) → `onChange` → `changeAction` in a transition that adds the toggled value
  to the pending set.
- **ORD3 — Availability.** Group disabled wins and keeps every checkbox
  focusable; a group reason adds the tooltip, not operability; group read-only
  applies to mutation only.

### Performance and resources

- **PR1 — Bounded resources.** The component owns no observer or global
  listener of its own. Tooltip listeners are scoped to the group element and
  its lifetime. A required group (FR17) registers its options with Core's
  shared mutation observer for its lifetime, so a reorder updates which box
  carries `required`.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Group identity.** The group name and its description, status, and
  disabled-reason relationships MUST remain programmatically determinable.
- **AR2, AR3, AR5 — Option semantics, keyboard parity, and busy perception** are
  owned by `component:CheckboxListItem` AR1, AR2, and AR4.
- **AR4 — Disabled reasons.** A group reason MUST stay discoverable by keyboard
  focus and assistive technology while toggling stays blocked.

## Design relationships

| Anatomy or state | Design requirement                                                           | Representation authority        | Hierarchy role | Component contract                    |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------------------------- |
| Group            | Contains the current checkbox-group composition.                             | Current source and public docs  | Supporting     | FR1, FR2                              |
| Options list     | Presents the List-owned list and row roots.                                  | Current source                  | Supporting     | FR1, FR13                             |
| Option rows      | Present each option's checkbox, content, busy spinner, and checked-row fill. | `component:CheckboxListItem`    | Prominent      | `component:CheckboxListItem` FR1–FR13 |
| Status message   | Presents the group's current status.                                         | Current shared-component source | Supporting     | FR4                                   |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Group": {"target": "checkbox-list"},
  "Group label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches the stable Description; future exposure still needs an owner decision"
    }
  },
  "Options list": {
    "delegatesTo": {"owner": "component:List", "target": "list"}
  },
  "Option row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  },
  "Checkbox": {
    "delegatesTo": {
      "owner": "component:CheckboxInput",
      "target": "checkbox-indicator"
    }
  },
  "Option label": {
    "none": {
      "reason": "unsettled: Item rather than Text renders the stable Option label in a separate untargeted span; future exposure still needs an owner decision"
    }
  },
  "Option description": {
    "none": {
      "reason": "unsettled: Item rather than Text renders the stable Option description in a separate untargeted span; future exposure still needs an owner decision"
    }
  },
  "End content": {
    "none": {
      "reason": "intentional: End content is caller-provided content outside CheckboxList's public theming ownership"
    }
  },
  "Spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "Status message": {
    "delegatesTo": {
      "owner": "component:FieldStatus",
      "target": "field-status"
    }
  }
}
```

`Description` remains stable consumer anatomy, but no current public target
reaches it. Item, not Text, renders option labels and descriptions in separate
untargeted spans, so neither delegates to Text nor inherits the row-root
`list-item` target; future exposure remains unsettled. Rich label content and end
content are caller-provided, and end content intentionally stays outside
CheckboxList's public theming ownership. The `Option row` delegation reaches the
row surface and, on a checked, enabled, editable row, its `selected` state
(`component:CheckboxListItem` FR15).

## Family and system relationships

- `architecture:public-component-api` owns export reachability, pass-through
  preservation, styling composition, refs, and released-change rules.
- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, composition-preserving target ownership, and state
  reflection.
- `architecture:interaction-modality` owns focus visibility and the boundary
  between the focused checkbox and the element that paints its ring.
- `architecture:knowledge-contracts/INV2` keeps each per-option fact in
  `component:CheckboxListItem` rather than copying it here.
- `spec:AST-021` owns the reusable checkbox accessibility binding for
  CheckboxListItem and its exact known-failure lifecycle.
- `spec:AST-011` records `isReadOnly` as the name for visible, focusable,
  non-editable values.
- `spec:AST-038/FR7` stops CheckboxList context at a layer boundary; an item
  inside a layer needs its own provider.
- `component:CheckboxListItem` owns the per-option contract this group
  composes.
- List, CheckboxInput, Field, FieldStatus, Spinner, and Tooltip retain their
  existing public target and behavior contracts when composed by CheckboxList.

## Verification map

| Contract            | Verification                                                                                                                                                                              | Representative states                                                                                                                                                              | Mutation or failure expectation                                                                                                                                                                  | Audit section                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| FR1, AR1            | `CheckboxList.test.tsx` group-role, group-description, and disabledMessage cases                                                                                                          | Named group; description plus status; disabled reason                                                                                                                              | A missing group name, or a description and status out of order, fails. Evidence gap: no test asserts the caller description first or the disabled reason last.                                   | `audit:CheckboxList/accessibility` |
| FR2, FR15           | `CheckboxList.test.tsx` ref and container case; `CheckboxList.fr10.test.tsx`                                                                                                              | Standalone; `horizontal-labels` FormLayout                                                                                                                                         | A ref off the group, `container*` off the Field box, or a base prop off the group fails.                                                                                                         | `audit:CheckboxList/api`           |
| FR4, FR14           | `CheckboxList.test.tsx` error-status cases, including every checkbox's `aria-invalid`; `CheckboxListErrorStatus.a11y.chromium.spec.ts`                                                    | Error with message                                                                                                                                                                 | A missing status message fails. Evidence gap: no test asserts the empty render without a message.                                                                                                | `audit:CheckboxList/accessibility` |
| FR6, FR7            | `CheckboxList.test.tsx` add, remove, and pending cases; `CheckboxList.a11y.chromium.spec.ts` `pending-single`, `pending-concurrent`, and `pending-settled` cases                          | Add; remove; one and two pending values; settled                                                                                                                                   | A wrong array, a cleared earlier pending value, or a busy state that outlives settlement fails.                                                                                                  | `audit:CheckboxList/behavior`      |
| FR9, FR10, AR4      | `CheckboxList.test.tsx` group-disabled (including the group's `aria-disabled`), disabledMessage, and read-only cases; `ListGroupDisabled.a11y.chromium.spec.ts`; shared checkbox bindings | Group disabled; with reason; read-only item                                                                                                                                        | A lost tab stop, a toggle while disabled, or a read-only toggle fails. Evidence gap: no test asserts that a focused checkbox is not described by the reason.                                     | `audit:CheckboxList/accessibility` |
| FR13                | `CheckboxList.test.tsx` density cases; `CheckboxList.a11y.chromium.spec.ts` density, divider, 320-pixel, and RTL cases                                                                    | Compact, balanced, spacious; dividers; narrow; RTL                                                                                                                                 | A density, divider, overflow, or direction sensor fails. Evidence gap: no test asserts `width` sizing the label, list, and status together.                                                      | `audit:CheckboxList/layout`        |
| FR16                | `CheckboxList.test.tsx` optional-indicator and FormLayout-default cases                                                                                                                   | `isOptional`; unmarked and optional groups under a required default; optional default; toggled with focus                                                                          | Dropping `isOptional` from the Field, showing it under an optional default, a group checkbox with `aria-required` under a required default, or remounting rows when `isOptional` changes, fails. | `audit:CheckboxList/accessibility` |
| FR17                | `CheckboxList.required.test.tsx`                                                                                                                                                          | Marker; required-default form; no box checked; one checked; last box unchecked; disabled first box; disabled group; read-only group; standalone items; keyed reorder; item removed | A missing marker, a marker under a required default, a submit with no box checked, a blocked submit with one checked, or `required` on more than one box, fails.                                 | `audit:CheckboxList/accessibility` |
| ORD1–ORD3, PR1      | ORD1 and ORD2 are covered by the FR6 and FR7 rows, ORD3 by the FR9 and FR10 rows. Evidence gap: no test asserts the absence of observers or global listeners                              | —                                                                                                                                                                                  | —                                                                                                                                                                                                | `audit:CheckboxList/behavior`      |
| Local target source | `themingTargets.test.ts`; `CheckboxList.test.tsx` ref and container case                                                                                                                  | `checkbox-list`                                                                                                                                                                    | A rendered class absent from the documented targets, or a missing `astryx-checkbox-list` on the Field root, fails.                                                                               | `audit:CheckboxList/theming`       |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                             | Canonical anatomy and current local target                                                                                                                                         | Canonical-key drift, invalid dispositions or target spelling, or an unclaimed current local target fails validation.                                                                             | `audit:CheckboxList/theming`       |

Per-option verification is owned by `component:CheckboxListItem`'s
verification map. No current repository check resolves `delegatesTo`
owner and target pairs; the pairs above match the current Field, List,
CheckboxInput, Spinner, and FieldStatus targets.

## Current-state impact

- **Group reason (FR9).** A group `disabledMessage` describes only the
  `role="group"`, so a focused disabled checkbox is not described by it,
  against `spec:AST-085` FR5 and FR7.
- **Status without a message (FR14).** A status without a message renders
  nothing; its meaning is OQ3.
- **Required announcement (FR17).** `role="group"` cannot carry `aria-required`, and browsers expose an unchecked `required` checkbox as invalid rather than required, so while the group is empty its first checkbox alone reports that state, as a `CheckboxInput` with `isRequired` does today; a required `RadioList` keeps each radio's invalid state on its status instead (`component:RadioList` FR6).

## Decision log

No component-local decision. CheckboxList applies `spec:AST-021`,
`spec:AST-085`, and `family:input-fields` FR10.

## Open questions

- **OQ3 — What should a status without a message render?** (`human-api`)
  Per-option questions live in `component:CheckboxListItem`.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, the per-option contract, or shared-component
contracts. It links to their owners.

---

<!-- source: docs/specs/components/CheckboxList/CheckboxListItem.spec.md -->


# CheckboxListItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One option row: a native checkbox named by `label` or `aria-label`, described by `description`, with optional `endContent`, rendered through ListItem. Inside a CheckboxList with a `value` array (collection mode), checked state comes from membership and `value` is required. Inside List, or inside a CheckboxList without `value` (standalone mode), the item reads `isChecked` and calls `onCheck`. |
| Behavior                | The checkbox is the option's only tab stop. Row-surface clicks delegate to it when the item is editable and sits in a CheckboxList or has `onCheck`, or when it has `onClick`; an item `onClick` fires once per direct, keyboard, or row-surface click. Disabled, read-only, and busy states refuse toggling.                                                                                              |
| End-user impact         | People can operate each option by pointer, touch, and keyboard, hear its name, description, and checked, mixed, disabled, read-only, or busy state, and see a spinner while it saves.                                                                                                                                                                                                                      |
| Builder impact          | Where the item sits, and whether its parent list has `value`, selects the mode; `value` is required only in collection mode. Handlerless meaning, checked-row pointer feedback, consumer DOM-prop targets, read-only click propagation, and focus-ring ownership stay open questions (OQ1, OQ3–OQ6).                                                                                                       |
| Compatibility/readiness | A checked, enabled, editable row reflects `selected` (FR15); no API or default change. Handlerless items and the double focus indicator are listed under Current-state impact.                                                                                                                                                                                                                             |
| Review checks           | Reject a second tab stop, a toggle while disabled, read-only, or busy, `isChecked` overriding a parent `value` array, an `onClick` that fires more than once per click, a dropped description relationship, or a new target, state, or event-routing API introduced without an owner decision.                                                                                                             |
| Governing rules         | `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:interaction-modality/INV1–INV5`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-021/FR8–FR10`; `spec:AST-085/FR1, FR7`; `spec:AST-011`; `spec:AST-038/FR7`; WCAG 2.2 1.3.1, 2.1.1, 4.1.2.                                                                                 |

This table is a review projection; the body below is authoritative.

## Intent

Present one independent choice as a full-width row whose checkbox, label,
description, and end content stay aligned with its checked, available,
read-only, and busy state, inside a CheckboxList or a plain List.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled only — by the parent list's
  `value` in collection mode, by `isChecked` in standalone mode
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One option row: its CheckboxInput, naming (string label, rich label through
  `aria-labelledby`, `aria-label` override), description relationship,
  end-content slot, and the checkbox size that follows list density.
- Mode resolution: collection membership versus standalone `isChecked` and
  `onCheck`, the error for a missing `value` in collection mode, and the next
  value the row proposes.
- Row-surface click delegation, the single-tab-stop rule, and item `onClick`
  routing.
- Item disabled and loading states, the busy rendering of a pending collection
  item, read-only rendering, and the checked-row fill.

**Does not own / non-goals**

- The group, its label, description, status, disabled reason, read-only and
  disabled inputs, pending-value set, and collection change ordering — owned by
  `component:CheckboxList`.
- Row presentation, density, dividers, hover and pressed overlays, the
  focus-within ring, the `list-item` target, and label and description
  truncation — owned by `component:List` and Item.
- The checkbox control, its indicator, focus ring, pressed overlay, and busy,
  disabled, and read-only semantics — owned by `component:CheckboxInput` and
  CheckboxIndicator.
- Loading-indicator presentation — owned by `component:Spinner`; delegation
  mechanics — owned by the shared clickable-container hook.
- New targets, reflected states, or event-routing API.

## Public concepts

| Concept       | Closed values or states                                                                         | Meaning                                                                                                                               | Availability by variant/orientation/state                                      | Default        | Owner                | Stability                              | Invalid-value behavior                       |
| ------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------- | -------------------- | -------------------------------------- | -------------------------------------------- |
| naming        | string `label`; node `label`; `aria-label`                                                      | Names the checkbox; a node label names it from its visible text; `aria-label` replaces the derived name on the checkbox, not the row. | All states.                                                                    | label required | caller and component | stable                                 | rejected by the public type                  |
| mode          | collection (parent has `value`); standalone in CheckboxList without `value`; standalone in List | Collection reads membership and reports through the parent; standalone reads `isChecked` and calls `onCheck`.                         | Chosen by placement; `isChecked` and `onCheck` are ignored in collection mode. | standalone     | component            | stable                                 | a collection item without `value` throws     |
| checked state | unchecked, checked, mixed (standalone only)                                                     | Native checkbox state; mixed uses the native `indeterminate` property and proposes `true`.                                            | All modes.                                                                     | unchecked      | caller               | stable                                 | rejected by the public type                  |
| change path   | parent `onChange`/`changeAction` (collection); `onCheck` (standalone); none                     | Proposes the next value array or boolean.                                                                                             | Enabled, editable, non-busy items.                                             | none           | caller and component | shipped; handlerless meaning unsettled | no handler means no component-owned mutation |
| availability  | enabled; item `isDisabled`; group disabled; group disabled with reason                          | Blocks toggling and the checked-row fill; the checkbox stays focusable through `aria-disabled`.                                       | Item and group.                                                                | enabled        | component            | stable                                 | boolean only                                 |
| read-only     | from the group's `isReadOnly`                                                                   | Keeps the value visible, focusable, and full-opacity while refusing toggles.                                                          | Inside CheckboxList only.                                                      | false          | component            | stable                                 | boolean only                                 |
| busy          | `isLoading`; pending parent `changeAction` for the item's `value`                               | Spinner in the checkbox, busy row and checkbox, toggling refused.                                                                     | Per item.                                                                      | idle           | component            | stable                                 | boolean/transition state only                |
| content       | `description`, `endContent`                                                                     | Description describes the checkbox; end content stays caller-owned and outside the name.                                              | All states.                                                                    | none           | caller               | stable                                 | typed values only                            |
| `onClick`     | fires on the checkbox for direct, keyboard, and row-surface clicks                              | Once per click, including read-only items; the public type names the row element.                                                     | All states.                                                                    | none           | caller and component | shipped; target unsettled              | —                                            |
| pass-through  | `ref`, `className`, `style`, `xstyle`, data, ARIA except `aria-label`, other events             | Reach the row `<li>`; consumer `xstyle` composes after the checked-row fill.                                                          | All states.                                                                    | none           | component            | shipped; ARIA target unsettled         | component-owned attributes win               |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                    | Basis                                                                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| FR1  | The row MUST render one native CheckboxInput as ListItem start content; that checkbox MUST be the option's only focusable control, and the row itself MUST NOT be focusable.                                                                                                                                                                                 | shipped source; focused tests; WCAG 2.1.1 and 4.1.2                                                                   |
| FR2  | A string `label` MUST name the checkbox; a node `label` MUST name it from the visible label element through `aria-labelledby`; `aria-label` MUST replace the derived name on the checkbox and never reach the row.                                                                                                                                           | shipped source and focused tests                                                                                      |
| FR3  | A renderable `description` MUST describe the checkbox through `aria-describedby`; an absent or empty description MUST add none.                                                                                                                                                                                                                              | shipped source and focused tests; WCAG 1.3.1                                                                          |
| FR4  | Inside a CheckboxList with a `value` array, the item MUST read checked state from membership, throw without `value`, and propose the array with its `value` added or removed through the parent's change path; `isChecked` and `onCheck` MUST be ignored.                                                                                                    | shipped source and focused tests                                                                                      |
| FR5  | Inside List, or inside a CheckboxList without `value`, the item MUST read `isChecked` and call `onCheck` with the next boolean; a mixed item MUST propose `true`, and `value` MAY be omitted. The mixed-state gap `component:CheckboxInput` FR1 records applies when the mixed value is kept.                                                                | shipped source and focused tests                                                                                      |
| FR6  | Item `isDisabled` or a disabled group MUST make the checkbox focusable-disabled through `aria-disabled` (`component:CheckboxInput` FR4), refuse toggling, and omit the checked-row fill; a group reason adds the group tooltip (`component:CheckboxList` FR9).                                                                                               | shipped source, focused tests, and shared checkbox binding                                                            |
| FR7  | Item `isLoading`, or a pending parent `changeAction` for the item's `value`, MUST render Spinner inside the checkbox, mark the row and the checkbox busy, and refuse toggling.                                                                                                                                                                               | shipped source, focused tests, and the Chromium accessibility suite                                                   |
| FR8  | A read-only group MUST make the checkbox read-only, focusable, and full-opacity, refuse every toggle, and omit the checked-row fill; the row delegates clicks only when the item has `onClick`.                                                                                                                                                              | shipped source, focused tests, and shared checkbox binding; `spec:AST-011`                                            |
| FR9  | On an enabled, editable item inside a CheckboxList or with `onCheck`, a row-surface click outside interactive descendants MUST be delegated to the checkbox; links and buttons in the label, description, or end content MUST keep their own behavior.                                                                                                       | shipped source and focused tests                                                                                      |
| FR10 | An item `onClick` MUST fire once for each direct, keyboard, or row-surface click, including on read-only items.                                                                                                                                                                                                                                              | shipped source and focused tests; `architecture:public-component-api/INV5`                                            |
| FR11 | `compact` density MUST render the `sm` checkbox; other densities MUST render `md`.                                                                                                                                                                                                                                                                           | shipped source and focused test                                                                                       |
| FR12 | An enabled, editable, checked row MUST paint the `--color-accent-muted` fill, and consumer `xstyle` MUST compose after it.                                                                                                                                                                                                                                   | shipped source and the Chromium accessibility suite                                                                   |
| FR13 | `ref`, `className`, `style`, `xstyle`, data attributes, ARIA other than `aria-label`, and events other than `onClick` MUST reach the row `<li>`.                                                                                                                                                                                                             | shipped source and focused tests                                                                                      |
| FR14 | A standalone item with `isChecked` and no `onCheck` changes nothing on activation. Implementation gap: it declares no read-only state, so the checkbox is exposed as editable (WCAG 2.2 4.1.2); inside a CheckboxList without `value`, its row also delegates clicks and shows pointer feedback. Its meaning is OQ1.                                         | exact `spec:AST-021` known failure `list-item-handlerless-read-only`; WCAG 4.1.2                                      |
| FR15 | A checked, enabled, editable row paints the checked-row fill and reflects a `selected` state on the row's `item` and `list-item` targets, so a theme can restyle checked rows and the text on that fill (`architecture:component-theming-surface` INV6). A read-only or disabled row paints no fill and reflects no state; its targets match unchecked rows. | `architecture:component-theming-surface/INV6`                                                                         |
| FR16 | Shipped behavior, not a requirement until its open question is ruled: consumer DOM inputs split between two elements: data attributes and ARIA reach the row, while `onClick` runs on the checkbox and is typed for the row, so `event.currentTarget` is the checkbox and does not carry the row's data attributes (OQ3).                                    | `architecture:public-component-api/INV5`; `INV9` for any retype or move                                               |
| FR17 | Shipped behavior, not a requirement until its open question is ruled: on a read-only item with `onClick`, the item stops the click's propagation, so React ancestors never receive those clicks, while they do for enabled items (OQ4). The item's own `onClick` still fires once per click (FR10).                                                          | Current source; shared clickable-container hook behavior                                                              |
| FR18 | Shipped behavior, not a requirement until its open question is ruled: on an enabled, editable, checked row, the checked-row fill replaces the row's hover and pressed overlays, so pointer hover and hold give no row feedback (OQ5).                                                                                                                        | the Chromium accessibility suite; `design:user-states` leaves hover and selection treatment outside its current claim |
| FR19 | One keyboard focus move paints two indicators: Item's row focus-within outline and CheckboxInput's indicator ring (OQ6). One focus move MUST have one owning indicator (`architecture:interaction-modality` INV3). Implementation gap: both indicators paint.                                                                                                | the Chromium accessibility suite; `architecture:interaction-modality/INV3`                                            |

### Allowed variation

- **AV1 — Content.** Label, description, and end content may vary within their
  public types without becoming new targets.
- **AV2 — Composed presentation.** Density, dividers, row overlays, the focus
  ring, and the checkbox indicator remain capabilities of their owning
  components.
- **AV3 — Theme paint.** Semantic tokens and composed targets may change
  admitted visual properties without changing semantics, tab order, or state
  precedence.

### Representative states

| State                             | Required invariant                                                          | Allowed variation                     |
| --------------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| Collection option                 | Checked from membership; one tab stop; toggles through the parent           | Label, description, end content       |
| Standalone option (List or group) | Reads `isChecked`, calls `onCheck`; mixed proposes `true`                   | Placement                             |
| Busy option                       | Spinner, busy row and checkbox, toggling refused                            | Loading source (prop or pending save) |
| Read-only option                  | Visible, focusable, full-opacity, immutable; `onClick` fires once per click | Whether the item has `onClick`        |
| Disabled option                   | Inoperable; no checked-row fill                                             | Item or group source; group reason    |
| Handlerless standalone option     | Inert; declares no read-only state (FR14, OQ1)                              | —                                     |

### Transformation and precedence order

- **ORD1 — Checked state.** Parent `value` array (collection) → optimistic
  pending value → membership; otherwise `isChecked`; otherwise unchecked.
- **ORD2 — Toggle.** disabled, read-only, or busy guard → mode → parent
  `onChange` (collection) or `onCheck` (standalone).
- **ORD3 — Click routing.** Interactive descendants keep their clicks → other
  row-surface clicks delegate to the checkbox when the item is editable and sits
  in a CheckboxList or has `onCheck`, or has `onClick` → the checkbox's click
  runs `onClick` once.
- **ORD4 — Attributes.** Consumer rest props → row `<li>`; `aria-label` and
  `onClick` → checkbox; component-owned name, description, state, and busy
  attributes win.

### Performance and resources

- **PR1 — Bounded resources.** The item owns no observer, timer, or global
  listener; delegation listeners belong to the row and its lifetime.

Current measurements belong in the audit record; this subsection owns only
durable constraints and their verification target.

## Accessibility contract

- **AR1 — Option semantics.** Each option MUST remain a native checkbox whose
  name, description, checked or mixed state, and disabled, read-only, and busy
  states are programmatically determinable.
- **AR2 — Keyboard parity.** Tab MUST reach the checkbox exactly once, and Space
  MUST follow the same availability and change rules as pointer activation.
- **AR3 — Enlarged target.** The row surface MUST act as the checkbox's pointer
  and touch target without becoming a second control.
  Under a coarse pointer, a finger held on the box of a click-delegating row presses and paints the whole row, as a press on the row does (owner pass, 2026-11-04).
- **AR4 — Busy perception.** A busy option MUST expose busy state in the
  accessibility tree and visibly through Spinner.
- **AR5 — Focus visibility.** Keyboard focus on the checkbox MUST stay visible;
  two indicators paint today (FR19, OQ6).

## Design relationships

| Anatomy or state   | Design requirement                                                          | Representation authority                                   | Hierarchy role  | Component contract |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- | ------------------ |
| Option row         | Full-width row with start checkbox, label and description, and end content. | List and Item                                              | Supporting      | FR1, FR9, FR13     |
| Checkbox           | Presents the option's selection indicator.                                  | CheckboxInput owner and `design:user-states` for its press | Prominent       | FR1, FR6–FR8, FR11 |
| Label, description | Name and describe the checkbox.                                             | Item                                                       | Primary content | FR2, FR3           |
| Checked-row fill   | Supplements the checkbox state on enabled, editable checked rows.           | row `selected` state (FR15); FR18 open                     | Supporting      | FR12               |
| Spinner            | Replaces the mark while the option is busy.                                 | Spinner                                                    | Supporting      | FR7                |

This record carries no anatomy-theming map. The composed option anatomy and its
target dispositions are recorded in `component:CheckboxList`'s theming anatomy,
and CheckboxListItem owns no target of its own.

## Family and system relationships

- `component:CheckboxList` composes this contract: it supplies the collection
  value, availability, read-only, and pending values the option reads through
  context, and owns the group around it.
- `architecture:public-component-api` owns pass-through preservation, event
  composition, refs, and released-change rules.
- `architecture:component-theming-surface` owns target placement and state
  reflection.
- `architecture:interaction-modality` owns focus visibility and the one-indicator
  rule.
- `spec:AST-021` owns the reusable checkbox accessibility binding for
  CheckboxListItem and its exact known-failure lifecycle.
- `spec:AST-011` records `isReadOnly` as the name for visible, focusable,
  non-editable values.
- `spec:AST-038/FR7` stops CheckboxList context at a layer boundary; an item
  inside a layer needs its own provider.
- List, Item, CheckboxInput, CheckboxIndicator, and Spinner retain their
  existing target and behavior contracts when composed here.

## Verification map

| Contract           | Verification                                                                                                                                                                   | Representative states                                                                | Mutation or failure expectation                                                                                                                 | Audit section                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1, FR9, AR2, AR3 | `CheckboxList.test.tsx` single-tab-stop, row-click, link-in-label, and interactive end-content cases                                                                           | Collection option; row-surface click; link in a rich label; interactive end content  | A second tab stop, lost delegation, or a toggle from an interactive descendant fails.                                                           | `audit:CheckboxListItem/interaction`   |
| AR3 (finger)       | `CheckboxList.test.tsx` press-surface cases; `CheckboxListPress.a11y.chromium.spec.ts`                                                                                         | Coarse and fine pointer; label, description and box; nested checkbox                 | A finger on the box that paints only the box, a mouse press that paints the row, or a nested checkbox pressing the row fails.                   | `audit:CheckboxListItem/interaction`   |
| FR2, FR3, AR1      | `CheckboxList.test.tsx` accessible-name and description cases; shared checkbox bindings                                                                                        | String and rich label; `aria-label`; string and node description; absent description | A wrong name or description, or `aria-label` on the row, fails.                                                                                 | `audit:CheckboxListItem/accessibility` |
| FR4, FR5           | `CheckboxList.test.tsx` collection, standalone, and select-all cases                                                                                                           | Add, remove, missing `value`, mixed, select-all, `isChecked` with a parent array     | A wrong array or boolean, a missing error, or `isChecked` overriding membership fails.                                                          | `audit:CheckboxListItem/behavior`      |
| FR6–FR8, AR4       | `CheckboxList.test.tsx` disabled, loading, pending, and read-only cases; `CheckboxList.a11y.chromium.spec.ts` `disabled-*`, `loading-item`, `pending-*`, and `read-only` cases | Item and group disabled; reason; loading; pending; read-only                         | A toggle while disabled, read-only, or busy, or a lost busy state, fails.                                                                       | `audit:CheckboxListItem/accessibility` |
| FR10, FR17         | `CheckboxList.test.tsx` item `onClick` and read-only click cases                                                                                                               | Enabled and read-only; direct, keyboard, and row-surface clicks                      | An `onClick` that fires zero or several times per click fails. Evidence gap: no test asserts the stopped propagation on read-only items (FR17). | `audit:CheckboxListItem/behavior`      |
| FR11               | `CheckboxList.test.tsx` density case                                                                                                                                           | Compact and balanced                                                                 | A wrong checkbox size fails.                                                                                                                    | `audit:CheckboxListItem/layout`        |
| FR12, FR18         | `CheckboxList.a11y.chromium.spec.ts` `checked`, `hover-*`, and `pressed-*` cases                                                                                               | Light and dark; unchecked and checked                                                | A missing or misplaced fill fails the row-paint check. Evidence gap: no assertion that `xstyle` composes after the fill.                        | `audit:CheckboxListItem/visual`        |
| FR13, FR16         | `CheckboxList.test.tsx` ref and styling, data-testid, and ARIA cases                                                                                                           | Row ref, class, style, data, ARIA                                                    | A dropped or misrouted input fails. Evidence gap: no test asserts `event.currentTarget` for `onClick` (FR16).                                   | `audit:CheckboxListItem/api`           |
| FR14               | `Checkbox.a11y.test.tsx` known failure `list-item-handlerless-read-only`; `CheckboxList.a11y.chromium.spec.ts` `handlerless` case                                              | Standalone with `isChecked` and no `onCheck`                                         | The recorded known failure stops matching when its gap closes.                                                                                  | `audit:CheckboxListItem/accessibility` |
| FR15               | `CheckboxList.test.tsx` checked-row state case                                                                                                                                 | checked, unchecked, read-only and disabled rows                                      | A checked, enabled, editable row without `selected` on its row targets fails; a read-only or disabled row with it fails                         | current source                         |
| FR19, AR5          | `CheckboxList.a11y.chromium.spec.ts` `focus-visible` and `forced-colors-focus` cases                                                                                           | Keyboard focus; forced colors                                                        | A lost focus indicator fails. Evidence gap: no test counts focus indicators (FR19).                                                             | `audit:CheckboxListItem/visual`        |
| Direction          | RTL audit target `core-checkboxlist--rich-descriptions` (`apps/storybook/rtl-audit/targets.json`); `CheckboxList.a11y.chromium.spec.ts` `rtl` case                             | LTR and RTL                                                                          | The checkbox and end content fail to swap inline order.                                                                                         | `audit:CheckboxListItem/layout`        |
| ORD1–ORD4, PR1     | Covered by the FR4–FR10 and FR13 rows. Evidence gap: no test asserts the absence of observers, timers, or global listeners                                                     | —                                                                                    | —                                                                                                                                               | `audit:CheckboxListItem/behavior`      |

## Current-state impact

- **Handlerless item (FR14).** A standalone item with `isChecked` and no
  `onCheck` is exposed as an editable checkbox though activation changes
  nothing (WCAG 2.2 4.1.2). The shared checkbox suite records this as a known
  failure; the meaning is OQ1.
- **Mixed state after activation (FR5).** A standalone mixed item whose value
  stays mixed loses its native mixed state on activation, as
  `component:CheckboxInput` records.
- **Two focus indicators (FR19).** Keyboard focus paints both the row outline
  and the checkbox ring, against `architecture:interaction-modality` INV3.

## Decision log

No component-local decision. CheckboxListItem applies `spec:AST-021` and
`spec:AST-085`.

## Open questions

- **OQ1 — What does a standalone item with `isChecked` and no `onCheck`
  mean?** (`human-api`) Choose read-only, unavailable, or invalid usage,
  consistent with the matching CheckboxInput question.
- **OQ3 — Which element owns consumer DOM inputs?** (`human-api`) Data and ARIA
  reach the row while `onClick` runs on the checkbox under a row-typed handler.
- **OQ4 — Should read-only item clicks propagate?** (`human-api`) No current
  authority owns ancestor propagation. The stop exists because the shared
  clickable-container hook would otherwise re-delegate a click that came from
  its `aria-readonly` delegate target back to it.
- **OQ5 — What hover and pressed feedback should a checked row show?**
  (`human-design`) The checked-row fill currently replaces both overlays.
- **OQ6 — Which element paints the option's focus ring?** (`human-design`)
  `architecture:interaction-modality/INV3` requires one indicator; RadioList
  composes the same two painters.

## Content boundary

This file does not duplicate consumer prop tables and examples, current audit
results, implementation steps, or the group contract. It links to their
owners.
