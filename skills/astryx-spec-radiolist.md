---
schema_version: 3
template_version: 7
kind: component
id: component:RadioList
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
    packages/core/src/RadioList/RadioList.test.tsx,
    packages/core/src/RadioList/RadioList.fr10.test.tsx,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.test.tsx,
    packages/core/src/RadioList/__tests__/RadioGroup.a11y.chromium.spec.ts,
  ]
modules: []
families: [family:input-fields]
design_specs: [design:user-states]
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-085]
---

# RadioList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. RadioList takes `label`, `value`, `onChange`, `orientation`, `size`, `isDisabled`, `disabledMessage`, `isRequired`, `isOptional`, `status`, `htmlName`, Field props, part props, and RadioListItem children. |
| Behavior                | A Field-labelled `role="radiogroup"` of native radios sharing one name. Selecting an option calls `onChange(value)`. The group sets the item size, the disabled state, and required semantics.                             |
| End-user impact         | People choose one option by pointer, touch, or the browser's arrow keys, with a predictable first Tab stop. A group disabled without a reason leaves the tab order, so keyboard users cannot find it.                      |
| Builder impact          | None.                                                                                                                                                                                                                      |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Native `disabled` on disabled radios conflicts with `spec:AST-085` FR1 and FR7; listed under Current-state impact.                                               |
| Review checks           | Reject a group without a name, radios that lose their shared name, a selection while disabled, a first Tab stop that lands mid-group with an empty value, or root styling props.                                           |
| Governing rules         | `family:input-fields` FR10, DEC-7; `spec:AST-085` FR1–FR7; `design:user-states` DR1, DR2 (through RadioListItem); WAI-ARIA radio group pattern.                                                                            |

This table is a review projection; the body below is authoritative.

## Intent

RadioList presents a small set of mutually exclusive options as one labelled
radio group. It owns the group's name, selection value, shared radio name,
group-level disabled, required, and status semantics, and the entry Tab stop.
Each option is `component:RadioListItem`. Consumer usage lives in
`RadioList.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `orientation="vertical"`, `size="md"`,
  not disabled
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled only; `value` is required and
  `''` means nothing is selected
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The group Field and the `role="radiogroup"` element, its name, description,
  status, invalid and required state, and the `radio-list` target.
- The shared radio name, the selected value, and `onChange`.
- Group disabled and the group disabled-reason tooltip.
- The entry Tab stop when nothing is selected.
- Where base, `container*`, and `control*` props land.

**Does not own / non-goals**

- Each option's radio, naming, description, row, disabled item state, and the
  `radio-list-item` target — owned by `component:RadioListItem`.
- Arrow-key movement and selection between radios — the browser's native radio
  group behavior.
- The radio indicator — owned by the Indicator registry's radio indicator.
- Group-label and status-message presentation — owned by Field under `family:input-fields` (shared owner section) and
  `component:FieldStatus`.

## Public concepts

| Concept     | Closed values or states                         | Meaning                                      | Availability by variant/orientation/state | Default      | Owner                 | Stability | Invalid-value behavior                         |
| ----------- | ----------------------------------------------- | -------------------------------------------- | ----------------------------------------- | ------------ | --------------------- | --------- | ---------------------------------------------- |
| Value       | string; `''` for none                           | The selected option's value.                 | Always.                                   | required     | `component:RadioList` | Stable    | A value no item carries selects nothing.       |
| Orientation | `vertical`, `horizontal`                        | Layout of the options.                       | Always.                                   | `vertical`   | `component:RadioList` | Stable    | TypeScript rejects other values.               |
| Size        | `sm`, `md`                                      | Radio circle size for every item.            | Always.                                   | `md`         | `component:RadioList` | Stable    | TypeScript rejects other values.               |
| Disabled    | off, on, on with reason                         | Blocks selection on every item.              | A reason applies only with `isDisabled`.  | off          | `component:RadioList` | Stable    | A reason without `isDisabled` renders nothing. |
| Status      | `error`, `warning`, `success`, optional message | Group validation state.                      | Always; the message is detached.          | none         | `family:input-fields` | Stable    | TypeScript rejects other types.                |
| Name        | string                                          | The shared radio `name` and form field name. | Always.                                   | generated id | `component:RadioList` | Stable    | Not applicable.                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| FR1 | RadioList renders a Field in group-label mode (label rendered as a span, visible unless `isLabelHidden`, description, optional or required marker, label tooltip, detached status) around one `role="radiogroup"` element. The radiogroup is labelled by the group label plus any caller `aria-labelledby`, and described by any caller description, then the description, status message, and disabled reason that exist.                                                                                                                                                                                                                                                                                                                                                               | WAI-ARIA radio group pattern; current tests             |
| FR2 | Every item's radio shares one `name`: `htmlName` when supplied, otherwise a generated id, so the radios form one native group. The checked radio is the one whose `value` equals the group `value`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current tests                                           |
| FR3 | Selecting an enabled option calls `onChange(value)` once; RadioList holds no selection of its own.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current tests                                           |
| FR4 | With an empty `value`, keyboard focus entering the group lands on the first radio that is not natively disabled (in a group disabled with a reason, that is its first `aria-disabled` radio, keeping the enabled focus order under `spec:AST-085` FR1), or stays on the last one when entering backward. Focus moving between radios inside the group is not redirected. With a selection, the selected radio is the Tab stop. Arrow keys follow the browser's native radio behavior, which stops on `aria-disabled` radios.                                                                                                                                                                                                                                                             | WAI-ARIA radio group pattern; current tests             |
| FR5 | `isDisabled` MUST disable every item: each radio stays focusable with `aria-disabled="true"`, is detached from the form so it does not submit, and refuses selection (`spec:AST-085` FR1–FR3, FR7). The `radiogroup` element MUST carry `aria-disabled="true"`, as `component:ButtonGroup` FR1 does. With `disabledMessage`, a reason tooltip also opens on group hover and keyboard focus, and the reason MUST describe each focusable radio (`spec:AST-085` FR5, FR7). Implementation gap: the reason describes only the radiogroup, so a focused radio is not described by it; and without a `disabledMessage`, each radio gets native `disabled` instead, which removes it from the tab order, and a radio focused when the group becomes disabled loses focus (`spec:AST-085` FR4). | `spec:AST-085` FR1–FR5, FR7; current tests              |
| FR6 | `status.type === 'error'` sets `aria-invalid` on the radiogroup. The radiogroup exposes the effective required state (including a form-level default) with `aria-required`, while each radio's native `required` follows only the explicit `isRequired`; a natively required radio's `aria-invalid` follows the same status, so the browser's own invalid state never shows before an error.                                                                                                                                                                                                                                                                                                                                                                                             | Current source and tests                                |
| FR7 | The radiogroup lays options in a column with a small gap, or a row with a wider gap when horizontal, and passes `size` to every item.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Current source and tests                                |
| FR8 | Base props (`ref`, `id`, `aria-*`, `data-*`, `hidden`, `inert`, `dir`, DOM handlers) reach the radiogroup; a caller `onFocus` runs after FR4's entry handling. `container*` reaches the Field box where one renders (in a `horizontal-labels` FormLayout none renders, and `container*` has no effect and warns), and `control*` the radiogroup; root `xstyle`, `className`, and `style` are not accepted.                                                                                                                                                                                                                                                                                                                                                                               | `family:input-fields` FR10; current tests               |
| FR9 | The radiogroup carries `astryx-radio-list` and reflects `data-orientation` and `data-size`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `architecture:component-theming-surface`; current tests |

### Allowed variation

- **AV1 — Options.** Item content varies under `component:RadioListItem`.
- **AV2 — Theme paint.** Themes may restyle the group through `radio-list`.

### Representative states

| State                | Required invariant                                                                                                                        | Allowed variation |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Empty value          | Forward Tab enters on the first radio that is not natively disabled.                                                                      | Orientation.      |
| One selected         | The selected radio is checked and is the Tab stop.                                                                                        | Size.             |
| Error status         | `aria-invalid`; detached message describes the group.                                                                                     | Message.          |
| Disabled with reason | Radios focusable, refuse selection, not submitted; reason tooltip. Implementation gap: a caller `onClick` still runs (RadioListItem FR6). | —                 |
| Disabled, no reason  | Same as with a reason, without the tooltip. Implementation gap: native `disabled` (FR5).                                                  | —                 |

### Transformation and precedence order

- **ORD1 — Item availability.** Group disabled or item disabled; the group
  reason keeps only group-disabled radios focusable.
- **ORD2 — Required.** Effective required on the radiogroup; explicit required
  on each radio.

### Performance and resources

- **PR1 — Entry handling.** FR4 runs only on focus events with an empty `value`
  and adds no global listener.

## Accessibility contract

- **AR1 — Group semantics.** `role="radiogroup"` with a name, description,
  invalid and required state (FR1, FR6).
- **AR2 — Keyboard.** Tab reaches the group once (FR4); arrow keys move and
  select through native radio behavior.
- **AR3 — Disabled reason.** A group reason stays reachable by keyboard focus
  and assistive technology (FR5).

## Design relationships

| Anatomy or state | Design requirement                   | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------ | ------------------------ | -------------- | ------------------ |
| Group label      | Field group label above the options. | Current source           | Prominent      | FR1                |
| Options          | Column or row of RadioListItem rows. | Current source           | Prominent      | FR7                |
| Status message   | Detached message after the group.    | Current source           | Supporting     | FR1, FR6           |

`design:user-states` governs the pressed overlay its options paint
(`component:RadioListItem` FR8); no other design record governs RadioList. The radiogroup carries `radio-list`.

## Family and system relationships

- `spec:AST-085` owns disabled reasons and `family:input-fields` FR10 and DEC-7
  own prop targets; RadioList
  meets FR10.
- `spec:AST-085` owns disabled focusability; FR5 records the gap.
- `component:RadioListItem` owns each option and reads the group through
  context.

## Verification map

| Contract       | Verification                                                                                                                                                                                                                                                                                                     | Representative states                                                 | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                            | Audit section                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1, AR1       | `RadioList.test.tsx` label, span-label, hidden-label, required and optional marker, status, and group-description cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts`                                                                                                                       | Visible and hidden label; each status; description                    | A missing group name or description fails. Evidence gap: no test asserts the caller description first or the disabled reason last, or the label tooltip.                                                                                                                                                                                                                   | `audit:RadioList/accessibility` |
| FR2, FR3       | `RadioList.test.tsx` selection and form cases                                                                                                                                                                                                                                                                    | Radio, label, and description clicks; `htmlName`; no name             | A wrong value, lost grouping, wrong form value, or a second `onChange` on a radio click fails. Evidence gap: no test counts `onChange` calls on delegated label and description clicks.                                                                                                                                                                                    | `audit:RadioList/behavior`      |
| FR4, AR2, PR1  | `RadioList.test.tsx` focus-management cases; `RadioGroup.a11y.chromium.spec.ts` `radio-group.focus.entry-and-exit` rule on every `radio-list-group-*` state                                                                                                                                                      | Backward entry; intra-group movement; disabled radios                 | A redirected intra-group move, entry on a natively disabled radio, or Tab entry off the selected or first option fails. Evidence gap: no test enters an empty group disabled with a reason, or asserts a caller `onFocus` after entry handling or the absence of global listeners.                                                                                         | `audit:RadioList/accessibility` |
| FR5, ORD1, AR3 | `RadioList.test.tsx` disabled (including the radiogroup's `aria-disabled`), disabledMessage, and form cases; `ListGroupDisabled.a11y.chromium.spec.ts`; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` `radio-list-group-disabled-with-message` and `radio-list-option-group-disabled` states | Group and item disabled; with reason                                  | A selection while disabled, or a submitted value from a group disabled with a reason, fails; the binding expects `tabReachable: false` for `radio-list-option-group-disabled`, which fails when that gap closes. Evidence gap: no form case submits an item-disabled option or a group disabled without a reason, and no test disables the group while a radio is focused. | `audit:RadioList/accessibility` |
| FR6, ORD2      | `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` `radio-list-group-required-invalid-described` state                                                                                                                                                                                            | Required, invalid, described group                                    | A missing required or invalid state on the group fails. Evidence gap: no test asserts that a form-level required default reaches only `aria-required`.                                                                                                                                                                                                                     | `audit:RadioList/accessibility` |
| FR7, FR9       | `RadioList.test.tsx` theme-target case                                                                                                                                                                                                                                                                           | `size="sm"`                                                           | A missing row size fails. Evidence gap: the orientation case asserts only rendering; no test asserts the gaps, horizontal layout, `data-orientation`, `data-size`, or `astryx-radio-list` on the radiogroup.                                                                                                                                                               | `audit:RadioList/layout`        |
| FR8            | `RadioList.fr10.test.tsx`; `RadioList.test.tsx` data-testid case                                                                                                                                                                                                                                                 | Caller labelledby; hidden, inert, dir; `horizontal-labels` FormLayout | A base prop off the radiogroup, or `container*` off the Field box, fails. Evidence gap: no test asserts a caller `onFocus` runs after entry handling.                                                                                                                                                                                                                      | `audit:RadioList/api`           |

## Current-state impact

- **Group reason (FR5).** A group `disabledMessage` describes only the
  radiogroup, so a focused disabled radio is not described by it, against
  `spec:AST-085` FR5 and FR7.
- **Caller onClick while disabled (FR5).** A radio kept focusable by a group
  reason still runs a caller's `onClick` on a click or an arrow key onto it,
  against `spec:AST-085` FR2.
- **Disabled focusability (FR5).** A group disabled without a reason gives its
  radios native `disabled`, so they leave the tab order, against `spec:AST-085`
  FR1 and FR7.
- **Consumer docs.** `RadioList.doc.mjs` anatomy lists Header, Children, and
  Label/Value parts; RadioList renders a group label, options, and a status
  message, and has no header.

## Decision log

- **Keyboard model (FR4).** RadioList keeps the browser's native radio arrow
  keys and its shipped Tab entry rule; `spec:AST-085` leaves which radios a
  composite's arrow keys visit to the composite.

RadioList otherwise applies `family:input-fields` FR10 and the WAI-ARIA radio
group pattern.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/RadioList/RadioListItem.spec.md -->


# RadioListItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | None changes. RadioListItem takes `label`, `aria-label`, `value`, `description`, `isDisabled`, `startContent`, `endContent`, `align`, and base props, and must sit inside a RadioList.                                                                                   |
| Behavior                | One option row: a visually hidden native radio drawn by the radio indicator, named by the visible label, with the whole row as its click target and the radio as its only tab stop.                                                                                      |
| End-user impact         | People can click anywhere on an option to choose it, and keyboard users reach one control per option. An item-disabled option, or one in a group disabled without a reason, leaves the tab order; a focused disabled option shows the row outline but no indicator ring. |
| Builder impact          | None.                                                                                                                                                                                                                                                                    |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Native `disabled`, two focus indicators, the missing indicator ring on a disabled option, and the `startContent` docs are listed under Current-state impact.                                                   |
| Review checks           | Reject a second tab stop on the row, a link in the label that selects the option, a description that is not linked, a theme target off the painted row, or a selection while disabled.                                                                                   |
| Governing rules         | `component:RadioList`; `spec:AST-085` FR1–FR3, FR6; `design:user-states` DR1, DR2 (pressed overlay); `architecture:interaction-modality` INV1–INV3.                                                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

RadioListItem is one option in a RadioList. It owns the option's native radio,
naming and description, row-surface click delegation, item disabled state,
pressed and hover feedback on the radio, and the `radio-list-item` target.
Consumer usage lives in `RadioListItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: controlled by the parent RadioList's
  `value`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The option's native radio, its name, description link, and form value.
- Row-surface click delegation to the radio and `onClick` routing.
- Item disabled state and the disabled, selected, and size reflection on
  `radio-list-item`.
- The radio indicator's hover tint and pressed overlay, and its focus ring (FR7,
  OQ1).
- The bare default row appearance.

**Does not own / non-goals**

- The group, its value, name, size, disabled reason, and required and status
  semantics — owned by `component:RadioList`.
- Row layout of label, description, start and end content — owned by Item.
- The radio indicator's paint — owned by the Indicator registry's radio
  indicator.
- Use outside RadioList — not supported; it throws.

## Public concepts

| Concept  | Closed values or states                     | Meaning                                                        | Availability by variant/orientation/state | Default        | Owner                     | Stability | Invalid-value behavior                           |
| -------- | ------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------- | -------------- | ------------------------- | --------- | ------------------------------------------------ |
| Naming   | `label` node or text; `aria-label`          | Names the radio; `aria-label` replaces the visible-label name. | Always.                                   | label required | `component:RadioListItem` | Stable    | TypeScript rejects a missing label.              |
| Value    | string                                      | The value the group selects and submits.                       | Always.                                   | required       | `component:RadioListItem` | Stable    | TypeScript rejects a missing value.              |
| Disabled | off, item, group, group with reason         | Blocks selection.                                              | Always.                                   | off            | `component:RadioListItem` | Stable    | Not applicable.                                  |
| Content  | `description`, `startContent`, `endContent` | Supporting text and caller content around the label.           | Always.                                   | none           | caller                    | Stable    | A description that renders nothing adds no link. |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| FR1  | RadioListItem throws when rendered outside a RadioList.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source                                                                    |
| FR2  | The option renders an Item row whose start content is a visually hidden native `<input type="radio">` (the group's `name`, this `value`, checked when the group value matches) layered over the radio indicator, followed by any `startContent`.                                                                                                                                                                                                                                                                                                                                                        | Current source and tests                                                          |
| FR3  | The radio is named by the visible label element through `aria-labelledby`, for text and node labels alike; `aria-label` replaces that name and never reaches the row. A renderable `description` is linked through `aria-describedby`; one that renders nothing adds no link.                                                                                                                                                                                                                                                                                                                           | Current tests                                                                     |
| FR4  | The radio is the option's only tab stop. Clicks on the row surface (label, description, empty area) are delegated to the radio; links and buttons inside the label, description, or end content keep their own behavior. A caller `onClick`, typed for the row, runs on the radio for direct and delegated clicks; that routing is shipped behavior, not a requirement until OQ2 is ruled.                                                                                                                                                                                                              | WCAG 4.1.2; current tests                                                         |
| FR5  | Selecting the radio calls the group's `onChange(value)` unless the option is disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current tests                                                                     |
| FR6  | Disabled when the item or the group is disabled. A disabled radio MUST stay focusable with `aria-disabled="true"`, be detached from the form, and refuse selection (`spec:AST-085` FR1–FR3); disabled options show no hover tint or pressed overlay. Implementation gap: only a group-disabled radio with a group reason renders that shape; an item-disabled radio, and a group-disabled radio without a reason, get native `disabled`, which removes them from the tab order. A focusable disabled radio also still runs a caller `onClick`, on a click or an arrow key onto it (`spec:AST-085` FR2). | `spec:AST-085`; current source and tests                                          |
| FR7  | Keyboard focus on the radio paints the shared focus ring on the radio indicator, and Item's row focus-within outline on the row. One focus move MUST have one owning indicator (`architecture:interaction-modality` INV3); which element owns it is OQ1. Implementation gap: both paint. On a focused disabled option the indicator ring is skipped, against `spec:AST-085` FR6; only the row outline shows, and whether it is enough follows OQ1.                                                                                                                                                      | `architecture:interaction-modality` INV1–INV3; `spec:AST-085` FR6; current source |
| FR8  | Hovering the enabled row tints the radio indicator. RadioListItem applies `design:user-states` DR1 and DR2 for the pressed overlay, painting it on the indicator while the enabled row is pressed. The row itself paints no padding, radius, hover, or press background by default.                                                                                                                                                                                                                                                                                                                     | `design:user-states`; current tests                                               |
| FR9  | The radio's hit area is at least 24 by 24 CSS pixels on coarse pointers, and its position follows the inline direction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | WCAG 2.5.8; current tests                                                         |
| FR10 | Under forced colors, the selected dot stays visible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | WCAG 1.4.11; current tests                                                        |
| FR11 | The painted row element carries `astryx-radio-list-item` (alongside Item's own target) and reflects `data-size`, `data-selected` when checked, and `data-disabled` when disabled. A theme's `radio-list-item` styles override the bare default row.                                                                                                                                                                                                                                                                                                                                                     | `architecture:component-theming-surface` INV6; current tests                      |
| FR12 | `ref`, `className`, `style`, `xstyle`, `align`, `data-*`, `id`, and ARIA other than `aria-label` reach the row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current tests                                                                     |
| FR13 | Under a coarse pointer, the touch target grows toward 44 × 44 px, up to halfway to a neighboring target, and is never smaller than the control's own box (owner decision, 2026-11-04; `spec:AST-094` FR42). It grows through an invisible band on an enabled option's row, and the row keeps its size.                                                                                                                                                                                                                                                                                                  | `spec:AST-094` FR42; current source and tests                                     |

### Allowed variation

- **AV1 — Content.** Label, description, start and end content vary within
  their types.
- **AV2 — Theme paint.** Themes may restore row padding, radius, hover, and
  selected paint through `radio-list-item`.

### Representative states

| State         | Required invariant                                                                                                                                                                               | Allowed variation |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Unselected    | Radio named by label; row click selects.                                                                                                                                                         | Content.          |
| Selected      | Radio checked; `data-selected`; dot visible under forced colors.                                                                                                                                 | Theme paint.      |
| Rich label    | Name from the label text; a link inside it does not select.                                                                                                                                      | —                 |
| Item disabled | Focusable with `aria-disabled`; no hover or press feedback; the focus indicator shows under keyboard focus. Implementation gap: native `disabled`, and the indicator ring is skipped (FR6, FR7). | —                 |

### Transformation and precedence order

- **ORD1 — Name.** `aria-label`, else the visible label element.
- **ORD2 — Availability.** Group disabled or item disabled; only the group
  reason keeps the radio focusable.

### Performance and resources

- **PR1 — Bounded resources.** The item owns no observer or global listener; its
  press feedback uses the shared press controller.

## Accessibility contract

- **AR1 — Radio semantics.** Each option is a native radio with a name,
  optional description, and checked state.
- **AR2 — One tab stop.** FR4.
- **AR3 — Target size.** FR9.
- **AR4 — Non-color state.** FR10.

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority                                                                                | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------- | ------------------ |
| Radio            | Indicator with hover tint, pressed overlay, focus ring. | `design:user-states` for the pressed overlay; current source for the hover tint; FR7 for the focus ring | Prominent      | FR2, FR7, FR8      |
| Label            | Names the option.                                       | Item                                                                                                    | Prominent      | FR3                |
| Description      | Supporting text linked to the radio.                    | Item                                                                                                    | Supporting     | FR3                |
| Row              | Bare, full-width click target.                          | Current source and tests                                                                                | Supporting     | FR4, FR8, FR11     |

No design record beyond `design:user-states` governs RadioListItem.

## Family and system relationships

- `component:RadioList` supplies the name, value, size, and group availability.
- `design:user-states` owns the pressed treatment the radio indicator paints.
- `spec:AST-085` owns disabled focusability; FR6 and FR7 record the gaps.

## Verification map

| Contract                | Verification                                                                                                                                                                                                                                | Representative states                                          | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                 | Audit section                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1                     | Evidence gap: no test renders RadioListItem outside a RadioList                                                                                                                                                                             | —                                                              | —                                                                                                                                                                                                                                                                                                                                                                                                               | `audit:RadioListItem/behavior`      |
| FR2–FR5, ORD1, AR1, AR2 | `RadioList.test.tsx` selection, rich-content, and rest-forwarding cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts`                                                                                                  | Text and node labels; `aria-label`; description; link in label | A wrong name, dangling description, or link that selects fails. Evidence gap: no test asserts a caller `onClick` on the radio for direct and delegated clicks.                                                                                                                                                                                                                                                  | `audit:RadioListItem/accessibility` |
| FR6, ORD2               | `RadioList.test.tsx` item-disabled and form cases; `RadioGroup.a11y.test.tsx` and `RadioGroup.a11y.chromium.spec.ts` `radio-list-option-disabled`, `radio-list-option-group-disabled`, and `radio-list-option-disabled-with-message` states | Item and group disabled; group reason                          | A disabled option that selects, or a submitted value from a group disabled with a reason, fails; the binding expects `tabReachable: false` for `radio-list-option-group-disabled`, which fails when that gap closes. Evidence gap: no state guards item-disabled focusability, since `radio-list-option-disabled` binds a radio that is not the group's Tab stop. No form case submits an item-disabled option. | `audit:RadioListItem/accessibility` |
| FR7                     | Evidence gap: no test of focus-ring placement on the indicator, the disabled ring, or the indicator count                                                                                                                                   | —                                                              | —                                                                                                                                                                                                                                                                                                                                                                                                               | `audit:RadioListItem/accessibility` |
| FR8                     | `RadioList.test.tsx` pressed-state and bare-row cases; `RadioListItem.press.source-build.test.mjs`                                                                                                                                          | Enabled, disabled, touch                                       | Press paint on a disabled option, or a default row background, fails. Evidence gap: no test asserts the hover tint.                                                                                                                                                                                                                                                                                             | `audit:RadioListItem/visual`        |
| FR9, FR10, AR3, AR4     | `RadioList.test.tsx` coarse-pointer, RTL, and forced-colors cases                                                                                                                                                                           | Coarse pointer; RTL; forced colors                             | Evidence gap: the forced-colors case passes on any matching rule (the checkbox mark supplies one), so it does not prove the dot; the coarse-pointer and RTL cases check only the direction-symmetric centering class, not the 24 by 24 minimum or RTL placement.                                                                                                                                                | `audit:RadioListItem/accessibility` |
| FR11, FR12              | `RadioList.test.tsx` theme-target and rest-forwarding cases                                                                                                                                                                                 | Sizes; selected; disabled                                      | A target off the painted row, or a missing state, fails. Evidence gap: no test asserts `ref`, `className`, `style`, or `xstyle` on the row.                                                                                                                                                                                                                                                                     | `audit:RadioListItem/theming`       |
| FR13                    | `touchTarget.test.tsx` hit-band and minimum cases; `TouchTargets.interaction.browser.spec.ts` RadioList and mouse cases                                                                                                                     | Enabled and disabled; both orientations; 24 and 60 px; a mouse | A band on a disabled option, a band under a mouse, a row or gap that changes size, a band past half the gap, a 24 px row short of 44 px, or a 60 px row with a band fails.                                                                                                                                                                                                                                      | `audit:RadioListItem/behavior`      |
| PR1                     | Evidence gap: no test asserts the absence of observers or global listeners                                                                                                                                                                  | —                                                              | —                                                                                                                                                                                                                                                                                                                                                                                                               | `audit:RadioListItem/behavior`      |
| RTL relation            | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `RadioList / Default`                                                                                                                                              | Indicator and label; LTR and RTL                               | An indicator that is not at the inline start of its label fails D2.                                                                                                                                                                                                                                                                                                                                             | `audit:RadioListItem/i18n-rtl`      |

## Current-state impact

- **Two focus indicators (FR7).** Keyboard focus paints both Item's row outline
  and the radio indicator ring, against `architecture:interaction-modality`
  INV3.
- **Caller onClick while disabled (FR6).** A focusable disabled radio still
  runs a caller's `onClick`, against `spec:AST-085` FR2.
- **Disabled focusability (FR6).** Item-disabled radios, and group-disabled
  radios without a reason, use native `disabled`, against `spec:AST-085` FR1.
- **Disabled focus ring (FR7).** The indicator ring is skipped on a focused
  disabled option, against `spec:AST-085` FR6; only the row outline shows.
- **Consumer docs (FR2).** `RadioListItem.doc.mjs` and the `startContent` prop
  JSDoc in `RadioListItem.tsx` say `startContent` renders before the radio
  circle; it renders after it.

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Which element paints the option's focus ring, the row or the radio
  indicator?** (`human-design`) `architecture:interaction-modality` INV3
  requires one indicator; CheckboxListItem composes the same two painters.
- **OQ2 — Which element owns a caller `onClick`?** (`human-api`) It is typed
  for the row but runs on the radio, as CheckboxListItem's matching open
  question records.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
