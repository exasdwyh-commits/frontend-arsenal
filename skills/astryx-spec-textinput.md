---
schema_version: 3
template_version: 7
kind: component
id: component:TextInput
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-26
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/TextInput/TextInput.test.tsx,
    packages/core/src/TextInput/TextInput.fr10.test.tsx,
    packages/core/src/TextInput/__tests__/TextInput.a11y.test.tsx,
    packages/core/src/TextInput/__tests__/TextInput.a11y.chromium.spec.ts,
    packages/core/src/InputGroup/InputGroup.test.tsx,
  ]
modules: []
families: [family:input-fields]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-082, spec:AST-085, spec:AST-086, spec:AST-102]
---

# TextInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | TextInput is a controlled single-line text field with Field props, `type` (`text`, `password`, `email`, `search`, `tel`, `url`), size, status, clear, start icon, `onChange`, `changeAction`, `isLoading`, disabled and read-only states, the touch-keyboard props `enterKeyHint`, `inputMode`, `autoCapitalize`, `hasAutoCorrect`, and `hasSpellCheck` (FR16), and the input-family part props.                                                |
| Behavior                | Typing calls `onChange`, then an optional `changeAction` in a transition with an optimistic value, and a busy Spinner while the shown value differs from `value`. A disabled field stays focusable, read-only, unsubmitted, and inert.                                                                                                                                                                                                          |
| End-user impact         | People type into a labelled field that shows progress and validation in place. Keyboard and screen-reader users can reach a disabled field and its reason. An error without a message is signalled only by color and an icon. On a phone, a field its caller describes opens the keyboard it needs, such as a phone pad or a number pad, with a Return key that says Next, Go, or Done, and leaves names as typed.                              |
| Builder impact          | Callers can choose the touch keyboard, its Return key label, capitalization, correction, and spell-check marking (FR16); an unset prop leaves the field as it is.                                                                                                                                                                                                                                                                               |
| Compatibility/readiness | The touch-keyboard props and the `search`, `tel`, and `url` types are additive, a patch `[feat]` (`spec:AST-017` FR5, FR7). Otherwise the record states shipped behavior. The clear button scales under reduced motion, an error may lack text, the height does not grow with text, a `detached` status without a message is color-only, and a grouped `description` is referenced but not rendered; all are listed under Current-state impact. |
| Review checks           | Reject a disabled field that leaves the tab order, submits, or runs caller handlers; an Enter that fires `onEnter` while committing an IME conversion; a busy state without `aria-busy`; root styling props; a keyboard prop that renders an attribute while unset or changes what Enter does; or a keyboard value type that accepts any string.                                                                                                |
| Governing rules         | `family:input-fields` FR1, FR2, FR3, FR4, FR6, FR8–FR11; `spec:AST-085` FR1–FR3, FR5–FR7; `spec:AST-086` FR8; `architecture:component-size-cascade` INV3–INV5; `design:reduced-motion` DR1; `spec:AST-102` FR4; `architecture:public-component-api` INV2–INV4, INV25; `spec:AST-082` FR3, DEC-14; `spec:AST-017` FR5, FR7.                                                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

TextInput collects short, single-line text. It owns the native input, its
change and Action pipeline, busy, clear, status, disabled, and read-only
behavior, and its adaptation to Field and InputGroup under
`family:input-fields`. Consumer usage lives in `TextInput.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `type="text"`, `size="md"`,
  `statusVariant="attached"`, no clear button
- Compatibility class: additive; the optional touch-keyboard props (FR16), their
  value types, and the `type` values `search`, `tel`, and `url` are a patch
  `[feat]` (`spec:AST-017` FR5, FR7). Unset, they render nothing, so no released
  default or DOM output changes
- Controlled/uncontrolled behavior: controlled only; `value` is required, and
  the field shows an optimistic value only while a `changeAction` is pending
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The native input, its attributes, and its accessible relationships.
- The `onChange` → optimistic value → `changeAction` pipeline and the busy
  state.
- The clear button's presence and effect, the start icon slot, and the
  status icon in the control.
- Disabled, disabled-reason, and read-only behavior.
- The control box and its `text-input` target.
- Its grouped adaptation inside InputGroup.
- The touch-keyboard attributes of the native input (FR16).

**Does not own / non-goals**

- Label, description, status message placement, label tooltip, and `width`
  layout — owned by Field under `family:input-fields` (shared owner section).
- The status message box — owned by `component:FieldStatus`.
- The clear button's own rendering and tooltip — owned by the shared clear
  control (`family:input-fields` FR11).
- InputGroup row height, connected surface, edge alignment, and group focus —
  owned by InputGroup under `family:input-fields` (shared owner section).
- Multiline text — owned by TextArea.
- Length limits — uncontracted.

## Public concepts

| Concept          | Closed values or states                                                            | Meaning                                                                                                                           | Availability by variant/orientation/state                                                                                   | Default                   | Owner                 | Stability | Invalid-value behavior           |
| ---------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------- | --------- | -------------------------------- |
| Type             | `text`, `password`, `email`, `search`, `tel`, `url`                                | Native input type; `email`, `tel`, and `url` also bring up the matching touch keyboard, and `search` makes the field a searchbox. | Always.                                                                                                                     | `text`                    | `component:TextInput` | Stable    | TypeScript rejects other values. |
| Return key label | `EnterKeyHint`: `enter`, `done`, `go`, `next`, `previous`, `search`, `send`        | `enterKeyHint`: what the touch keyboard's Return key says. It does not change what Enter does (FR10).                             | Always; web contract.                                                                                                       | unset: no attribute       | `component:TextInput` | Stable    | TypeScript rejects other values. |
| Touch keyboard   | `InputMode`: `none`, `text`, `tel`, `url`, `email`, `numeric`, `decimal`, `search` | `inputMode`: which touch keyboard opens, without changing what the field accepts.                                                 | Always; web contract.                                                                                                       | unset: no attribute       | `component:TextInput` | Stable    | TypeScript rejects other values. |
| Capitalization   | `AutoCapitalize`: `off`, `none`, `on`, `sentences`, `words`, `characters`          | `autoCapitalize`: when the touch keyboard capitalizes as the person types.                                                        | Always; web contract.                                                                                                       | unset: no attribute       | `component:TextInput` | Stable    | TypeScript rejects other values. |
| Autocorrect      | `true`, `false`                                                                    | `hasAutoCorrect`: whether the touch keyboard corrects words as the person types.                                                  | Always; web contract.                                                                                                       | unset: no attribute       | `component:TextInput` | Stable    | TypeScript rejects other types.  |
| Spell check      | `true`, `false`                                                                    | `hasSpellCheck`: whether misspelled words are marked.                                                                             | Always; web contract.                                                                                                       | unset: no attribute       | `component:TextInput` | Stable    | TypeScript rejects other types.  |
| Size             | `sm`, `md`, `lg`                                                                   | Control height.                                                                                                                   | Always.                                                                                                                     | Inherited size, else `md` | `family:input-fields` | Stable    | TypeScript rejects other values. |
| Status           | `error`, `warning`, `success`, optional message                                    | Validation state.                                                                                                                 | Always; the message box only outside InputGroup.                                                                            | none                      | `family:input-fields` | Stable    | TypeScript rejects other types.  |
| Status placement | `attached`, `detached`, `tooltip`                                                  | Where the status message shows.                                                                                                   | Outside InputGroup.                                                                                                         | `attached`                | `family:input-fields` | Stable    | TypeScript rejects other values. |
| Busy             | idle, busy                                                                         | The value is loading or being saved.                                                                                              | `isLoading`, or while the shown value differs from `value` (a pending `changeAction` whose value `value` has not accepted). | idle                      | `family:input-fields` | Stable    | Not applicable.                  |
| Availability     | editable, read-only, disabled                                                      | Whether the value can change and submits.                                                                                         | Always; disabled wins over read-only.                                                                                       | editable                  | `component:TextInput` | Stable    | Not applicable.                  |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Basis                                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| FR1  | Standalone, TextInput renders inside Field with its label (always rendered; `isLabelHidden` hides it visually), description, optional or required marker, label tooltip, status, and `width`. Inside InputGroup it renders no Field: `aria-labelledby` names the input by the group label, then a visually hidden label inside the control, and no status message box renders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `family:input-fields` FR3; current source and tests                                                            |
| FR2  | The input is a native `<input>` of the chosen `type` showing the controlled value. `htmlName` becomes `name`, `autoComplete` reaches the input unchanged, and `hasAutoFocus` focuses it on mount.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current tests                                                                                                  |
| FR3  | Editing calls `onChange(value, event)`. Unless that call prevents default, `changeAction(value, event)` then runs in a transition; the field shows the proposed value while the Action is pending, and the controlled `value` once it settles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `family:input-fields` FR6; current source                                                                      |
| FR4  | While `isLoading` or while the shown value differs from `value`, the input sets `aria-busy`, a decorative small Spinner shows in the end area, and the busy start is announced once (`spec:AST-086` FR8).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `family:input-fields` FR5; `spec:AST-086` FR8; current source                                                  |
| FR5  | With `hasClear`, a clear button shows only while `value` is non-empty and the field is editable. Its accessible name is the localized "Clear" phrase with the label. Activating it MUST commit `''` through FR3's pipeline (`onChange`, then the optimistic value and `changeAction`) and moves focus to the input: at once for keyboard activation, and inside the tap without scrolling for pointer activation. The clear button is a ghost small `component:Button`, so its press feedback follows Button FR15, whose press scale MUST NOT apply under reduced motion (`design:reduced-motion` DR1). Implementation gap: its press scale still applies under reduced motion.                                                                                                                                                                                                                                                                                                                                                                | `family:input-fields` FR6, FR11; current tests                                                                 |
| FR6  | TextInput is disabled when its own `isDisabled` or an enclosing InputGroup's `isDisabled` is true; an enabled group never re-enables a field that disables itself (`spec:AST-085` FR7). Disabled: the input exposes `aria-disabled="true"` and `readOnly`, keeps its tab stop, has no `name` (so it does not submit), and never changes value. Caller event handlers other than focus and blur do not run, Enter is cancelled, the clear button hides, the control dims, and keyboard focus paints a ring.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `spec:AST-085` FR1–FR3, FR6; current tests                                                                     |
| FR7  | Disabled with `disabledMessage`: a tooltip with the reason opens above the control on hover and keyboard focus, and describes the input.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `family:input-fields` FR4; current tests                                                                       |
| FR8  | Read-only: the input is `readOnly`, keeps full opacity, stays focusable, still submits under `name`, never calls `onChange`, and hides the clear button. Disabled wins when both are set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current tests                                                                                                  |
| FR9  | A status paints the status border; `error` sets `aria-invalid="true"`. Outside InputGroup, `attached` and `tooltip` placement show a trailing status icon on the control; `detached` placement shows its glyph only in the message box, which renders only with a message; inside InputGroup no status icon renders. Outside InputGroup, a message renders through Field in the chosen placement; `tooltip` renders no message box, and with a message its status icon becomes a focusable button whose tooltip describes the input (without one it stays a plain icon).                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `family:input-fields` FR8; current tests                                                                       |
| FR10 | Enter calls `onEnter` unless the key event commits an IME composition; `onKeyDown` receives every key, including composing ones.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current tests                                                                                                  |
| FR11 | Standalone, height comes from the shared element size for the resolved size, as a minimum that grows with a set text size under `spec:AST-102` FR4: explicit `size`, then the nearest size provider, then `md`. Implementation gap: the height is fixed at that size. Inside InputGroup the control fills the group row's height, so its own `size` does not set its height. Text uses the body type size at every size, floored at 16 CSS px only on the iOS touch path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `family:input-fields` FR9; `architecture:component-size-cascade`; current source and tests; `spec:AST-102` FR4 |
| FR12 | `startIcon` renders a small secondary icon before the input. While the field is enabled, a click on the control box outside the input focuses the input.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current tests                                                                                                  |
| FR13 | Base props (`ref`, `id`, `aria-*`, `data-*`, DOM handlers, and the like) reach the native input; `aria-describedby` is joined with TextInput's own descriptions, and `aria-labelledby` follows the field's own label (AR1). `container*` reaches the Field box and `control*` the control box. Root `xstyle`, `className`, and `style` are not accepted; an untyped one is dropped with a development warning.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `family:input-fields` FR10; current tests                                                                      |
| FR14 | The control box carries `astryx-text-input` and reflects `data-size`, `data-status` when set, `data-disabled` when disabled, and `data-readonly` when read-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `architecture:component-theming-surface`; current tests                                                        |
| FR15 | The input has no minimum inline size, so a row can shrink the whole field. End controls (clear, Spinner, status icon) are in-flow items after the input and never overlap its text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `family:input-fields` FR1, FR2; current tests                                                                  |
| FR16 | `enterKeyHint`, `inputMode`, `autoCapitalize`, `hasAutoCorrect`, and `hasSpellCheck` are optional. A set prop renders its native attribute on the input: `enterkeyhint`, `inputmode`, `autocapitalize`, `autocorrect="on"` or `"off"`, and `spellcheck="true"` or `"false"`; an unset prop renders no attribute, so the browser keeps its own keyboard. `enterKeyHint`, `inputMode`, and `autoCapitalize` take the closed unions `EnterKeyHint`, `InputMode`, and `AutoCapitalize`, exported from the package entry with no `string` widening, so TypeScript rejects any other value; `hasAutoCorrect` and `hasSpellCheck` are on/off booleans. They choose only the touch keyboard, its Return key label, capitalization, correction, and spell-check marking: Enter follows FR10 whatever the key says, and the value, validation, and submission do not change. They and the `search`, `tel`, and `url` types belong to the web contract; the Swift contract carries one only where its field applies it (`component:swift/TextInput` FR6). | DEC-1; `architecture:public-component-api` INV2, INV3, INV25; `spec:AST-082` FR3, DEC-14                       |

### Allowed variation

- **AV1 — Theme paint.** Themes may restyle the control box through
  `text-input` and its states without changing behavior.
- **AV2 — Start icon.** Any icon may fill the slot.

### Representative states

| State                  | Required invariant                                                                                                                                       | Allowed variation |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Empty with placeholder | Labelled input; placeholder visible.                                                                                                                     | Size.             |
| Typing with Action     | Proposed value shows while the Action is pending, with the Spinner and `aria-busy` while it differs from `value`; `value` shows once the Action settles. | —                 |
| Error with message     | Error border and icon; `aria-invalid`; message described.                                                                                                | Placement.        |
| Disabled with reason   | `aria-disabled`; focusable; read-only; not submitted; reason tooltip on focus.                                                                           | —                 |
| Read-only              | Full opacity; submits; cannot change.                                                                                                                    | —                 |
| In InputGroup          | No Field; hidden label names the input; no message box.                                                                                                  | Group geometry.   |

### Transformation and precedence order

- **ORD1 — Availability.** Disabled (own or enclosing InputGroup), then
  read-only, then editable.
- **ORD2 — Change.** `onChange`, then the optimistic value and `changeAction`
  unless prevented.
- **ORD3 — Description.** Standalone: caller `aria-describedby`, then
  description, status message (when a message box renders), status tooltip, and
  disabled reason. Inside InputGroup: caller `aria-describedby`, then the
  group's description and status message, then TextInput's own ids; TextInput's
  own `description` does not render there, yet its id is still referenced.
- **ORD4 — Size.** Explicit `size`, then the nearest size provider, then `md`.

### Performance and resources

- **PR1 — No measurement.** TextInput adds no observer or measurement; the end
  controls are in-flow flex items.

## Accessibility contract

- **AR1 — Name and description.** Standalone, Field's native label names the
  input; inside InputGroup, `aria-labelledby` names it by the group label, then
  its own visually hidden label. A caller `aria-labelledby` follows that
  label: the Field label standalone, the group and input labels inside
  InputGroup. It is described per ORD3, including the group's description and
  status message inside InputGroup.
- **AR2 — State.** `aria-required` when effectively required, `aria-invalid`
  for an error, `aria-busy` while busy, `aria-disabled` while disabled.
- **AR3 — Disabled reachability.** FR6 and FR7 satisfy `spec:AST-085` FR1,
  FR5, and FR6.
- **AR4 — Status without color.** Outside InputGroup, every status MUST show a
  cue other than color (WCAG 2.2 1.4.1): a glyph on the control for `attached`
  and `tooltip`, or in the message box for `detached` with a message. Outside
  InputGroup, an error MUST be identified in text (WCAG 2.2 3.3.1); inside
  InputGroup, the group's own status carries the text. Implementation gap: TextInput
  accepts an error status without a message, and a `detached` status without a
  message shows only the colored border.
- **AR5 — Focus-zoom floor.** FR11.
- **AR6 — Search field.** With `type="search"` the native input has the
  searchbox role, so a screen reader announces a search field.

## Design relationships

| Anatomy or state | Design requirement                                                  | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Label            | Field label above the control, or hidden.                           | Current source           | Prominent      | FR1                |
| Description      | Field helper text.                                                  | Current source           | Supporting     | FR1                |
| Start icon       | Small secondary icon before the input.                              | Current source and tests | Supporting     | FR12               |
| Placeholder      | Secondary-color hint while empty.                                   | Current source           | Supporting     | FR2                |
| Clear button     | Trailing clear control while a value is editable.                   | Current source and tests | Supporting     | FR5                |
| Spinner          | Trailing decorative Spinner while busy.                             | Current source           | Supporting     | FR4                |
| Status icon      | Trailing status icon (attached, tooltip); a button under `tooltip`. | Current source and tests | Supporting     | FR9                |

`design:reduced-motion` governs the clear button's press scale (FR5); no other
design record governs TextInput. The control box carries `text-input`; the
consumer anatomy names no control-box part, so this record carries no
anatomy-theming map.

## Family and system relationships

- `family:input-fields` owns inline-size stability, end controls, grouped
  admission, disabled reasons, input busy, Transition Actions, status
  placement, the focus-zoom floor, prop targets, and the clear tooltip;
  TextInput adopts them, with the FR5 gap.
- `spec:AST-085` owns disabled focusability; TextInput meets it.
- `spec:AST-086` FR8 owns the busy announcement.
- `architecture:component-size-cascade` owns size inheritance.

## Verification map

| Contract       | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Representative states                                                                           | Mutation or failure expectation                                                                                                                                                                                     | Audit section                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1, AR1       | `TextInput.test.tsx` label, tooltip, and group cases; `InputGroup.test.tsx` grouped name and description cases; `TextInput.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                                                                                          | Standalone, hidden label, in group                                                              | A lost name, a wrong grouped name or description, or a dangling description id fails. Evidence gap: no test asserts the optional marker or the standalone description.                                              | `audit:TextInput/accessibility` |
| FR2, FR3       | `TextInput.test.tsx` change, form, autoComplete, autofocus cases                                                                                                                                                                                                                                                                                                                                                                                                                                           | Typing; form submission                                                                         | A wrong `onChange` payload or a missing `name` fails. Evidence gap: no test asserts the `type` or that `changeAction` runs after `onChange` with the optimistic value.                                              | `audit:TextInput/behavior`      |
| FR4            | Evidence gap: no TextInput test of the pending Action's optimistic value and busy announcement                                                                                                                                                                                                                                                                                                                                                                                                             | —                                                                                               | —                                                                                                                                                                                                                   | `audit:TextInput/behavior`      |
| FR5            | `TextInput.test.tsx` clear and clear-focus suites                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Keyboard and pointer clear; empty; disabled                                                     | A clear button on an empty or disabled field, or lost focus, fails. Evidence gap: no test presses the clear button under reduced motion.                                                                            | `audit:TextInput/behavior`      |
| FR6–FR8, AR3   | `TextInput.test.tsx` disabled, disabledMessage, read-only, and form suites; `InputGroup.test.tsx` disabled-propagation cases                                                                                                                                                                                                                                                                                                                                                                               | Disabled, with reason, read-only, both                                                          | A lost tab stop, a submitted disabled value, a caller handler, or an edit fails. Evidence gap: no test asserts the dimmed paint.                                                                                    | `audit:TextInput/accessibility` |
| FR9            | `TextInput.test.tsx` status and statusVariant suites                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Each type; each placement; in group                                                             | A missing icon, `aria-invalid`, or description fails. Evidence gap: no test asserts the status border paint.                                                                                                        | `audit:TextInput/accessibility` |
| FR10           | `TextInput.test.tsx` onEnter and onKeyDown suites                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Enter; IME commit; other keys                                                                   | `onEnter` during IME commit fails.                                                                                                                                                                                  | `audit:TextInput/behavior`      |
| FR11, FR15     | `TextInput.test.tsx` text-size and narrow-row cases                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Outside the iOS gate; narrow filter bar                                                         | A floor off iOS, or a field that overflows its row, fails. Evidence gap: no test asserts the height per size, the size precedence, or that end controls never overlap the text. No test asserts the grouped height. | `audit:TextInput/layout`        |
| FR12           | `TextInput.test.tsx` start-icon and click-to-focus cases                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Icon; wrapper padding                                                                           | Clicks that do not focus the input fail. Evidence gap: no test asserts the start icon's size or color.                                                                                                              | `audit:TextInput/behavior`      |
| FR13           | `TextInput.fr10.test.tsx`; `TextInput.test.tsx` caller `aria-labelledby` cases                                                                                                                                                                                                                                                                                                                                                                                                                             | Standalone and in group                                                                         | A base prop off the input, or styling on the wrong part, fails.                                                                                                                                                     | `audit:TextInput/api`           |
| FR14           | `TextInput.test.tsx` theme-state suites                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Disabled and read-only                                                                          | A missing state attribute fails. Evidence gap: no test asserts `data-size` or `data-status`.                                                                                                                        | `audit:TextInput/theming`       |
| AR4            | `TextInput.a11y.chromium.spec.ts` with its recorded known failure                                                                                                                                                                                                                                                                                                                                                                                                                                          | Error without message                                                                           | The known failure stops matching when the gap closes. Evidence gap: no test renders a `detached` status without a message.                                                                                          | `audit:TextInput/accessibility` |
| FR16, DEC-1    | `TextInput.test.tsx` touch keyboard traits suite (each prop set and unset, `hasAutoCorrect` and `hasSpellCheck` on and off, Enter calls `onEnter` under every `enterKeyHint`) and type suite (`search`, `tel`, and `url`); `textEntryTraits.test.ts`; `textEntryTraits.public.test.ts`, run by `pnpm typecheck`, for the unions exported from the package entry rejecting an arbitrary or unnarrowed string; `TextInputKeyboardTraits.a11y.chromium.spec.ts` for the attributes on the input a tap focuses | Each prop set and unset; each `type`; Enter under `send`; a phone viewport with touch emulation | An attribute while unset, a dropped or renamed attribute, `onEnter` skipped under any label, a value type that accepts `string`, or a missing export fails.                                                         | `audit:TextInput/api`           |
| AR6            | `TextInput.test.tsx` type suite (`type="search"` renders a searchbox); `TextInputKeyboardTraits.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                     | `type="search"`                                                                                 | A search field without the searchbox role fails.                                                                                                                                                                    | `audit:TextInput/accessibility` |
| ORD1–ORD3, PR1 | ORD1 and ORD2 are covered by the FR3 and FR6–FR8 rows. Evidence gap: no test asserts the description order or the absence of measurement                                                                                                                                                                                                                                                                                                                                                                   | —                                                                                               | —                                                                                                                                                                                                                   | `audit:TextInput/behavior`      |

## Current-state impact

- **Error without text (AR4).** TextInput accepts an error status without a
  message, so the error is shown only by color and an icon, against WCAG 2.2
  3.3.1. The accessibility suite records this as a known failure.
- **Color-only detached status (AR4).** A `detached` status without a message
  shows only the colored border, against WCAG 2.2 1.4.1.
- **Grouped description (ORD3).** Inside InputGroup, TextInput's own
  `description` does not render, yet `aria-describedby` still references its
  id.
- **Clear press under reduced motion (FR5).** The clear button scales to 0.98 on
  a press when the person prefers reduced motion, as `component:Button` FR15
  records, against `design:reduced-motion` DR1.
- **Fixed height (FR11).** The control holds the fixed shared element height
  instead of growing with a set text size, against `spec:AST-102` FR4.
- **Source comment.** The `size` JSDoc in `TextInput.tsx` gives 18 px and 26 px
  heights; the shipped heights come from the shared element sizes (FR11).

## Decision log

TextInput applies `family:input-fields` and `spec:AST-085`.

### DEC-1 — Callers choose the touch keyboard

**Reference:** `component:TextInput/DEC-1`
**Decider:** `cixzhang`, `2026-11-01`

Only the caller knows that a field holds a phone number, a one-time code, or a
username, so the keyboard, its Return key label, capitalization, correction, and
spell-check marking are caller intent the field cannot derive (`spec:AST-002`
DEC-1). The props keep the native names, with on/off natives as `has…`
booleans (`architecture:public-component-api` INV2), and each value set is a
closed union (INV3). They are keyboard hints, not behavior props: what Enter does
stays with FR10. TextArea admits the same props (`component:TextArea` FR13) and
ChatComposerInput admits `enterKeyHint` (`component:ChatComposerInput` FR17)
under this decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/TextInput/TextInput.swift.spec.md -->


# TextInput (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `TextInput(label:value:type:onChange:size:isLabelHidden:description:isOptional:isRequired:onEnter:isDisabled:isReadOnly:disabledMessage:isLoading:placeholder:labelTooltip:status:statusVariant:hasClear:hasAutoFocus:base:)` and `TextInput(_ props: TextInputProps)`, a SwiftUI `View` in module `Astryx`. |
| Behavior                | An editable field is SwiftUI's `TextField`, or `SecureField` for a password. A read-only or disabled field draws its value, keeps a focus stop without raising a keyboard, and reads to VoiceOver as SwiftUI's text field.                                                                                   |
| End-user impact         | A person types in the platform's own field; keyboard users still reach a read-only or disabled field and its reason; VoiceOver users hear the name, any error, the description, and the state.                                                                                                               |
| Builder impact          | An app passes `value` and `onChange` as the contract types them, not a `Binding`.                                                                                                                                                                                                                            |
| Compatibility/readiness | Breaking for canary callers: a `Binding` gives way to `value` and `onChange`, as the contract types them. Built and tested on macOS and the iOS Simulator.                                                                                                                                                   |
| Review checks           | Reject a read-only field that raises a keyboard or accepts edits, a disabled field that leaves focus, a read-only password that shows its characters, an error only in the hint, or `.help` for a tip, or a contract that carries a keyboard prop or `type` value the field ignores.                         |
| Governing rules         | `component:TextInput` FR3–FR10, FR13, FR15, FR16; `family:input-fields` FR4; `spec:AST-085`; `spec:AST-082` FR3, FR7, FR11, DEC-14; `spec:AST-093` FR1–FR5; the Swift component API, tooltip, and accessibility records under `packages/native/specs/swift/library/`.                                        |

This table is a review projection; the body below is authoritative.

## Intent

TextInput on Apple platforms is core's text field drawn with SwiftUI's own
field for typing, so input methods, autofill, and the keyboard work the
platform's way, while its read-only and disabled states keep core's focus and
reading behavior where SwiftUI's field cannot.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: breaking for canary callers (`Binding` → `value` and `onChange`)
- Controlled/uncontrolled behavior: controlled; `value` and `onChange` only
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Which platform field Swift uses in each state, how a read-only or disabled
  field keeps focus and reads to VoiceOver, and its status announcements.

**Does not own / non-goals**

- The meaning of TextInput's props and states — owned by `component:TextInput`
  and `family:input-fields`.
- Tooltip behavior — owned by the Swift tooltip record.

## Public concepts

| Concept      | Closed values or states       | Meaning                                                                  | Availability by variant/orientation/state | Default  | Owner                       | Stability    | Invalid-value behavior |
| ------------ | ----------------------------- | ------------------------------------------------------------------------ | ----------------------------------------- | -------- | --------------------------- | ------------ | ---------------------- |
| field        | editable; drawn               | SwiftUI `TextField`/`SecureField`, or the drawn read-only/disabled field | always                                    | editable | `component:swift/TextInput` | experimental | none                   |
| availability | editable; read-only; disabled | disabled wins over read-only                                             | always                                    | editable | `component:TextInput`       | experimental | none                   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Basis                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| FR1 | Both initializers MUST build the same `TextInputProps`. Edits reach `onChange` only while the field is editable; Return runs `onEnter` while editable or read-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Swift component API A2, A3, A5; `component:TextInput` FR3, FR10                 |
| FR2 | A read-only or disabled field MUST draw its value (masked for a password, the placeholder when empty), keep its focus stop without raising a keyboard (a field that becomes read-only or disabled while focused keeps focus: the editable and drawn parts stay in one view structure and focus moves between them), accept no edits, and read to VoiceOver as SwiftUI's text field (`accessibilityRepresentation`): dimmed when disabled, a secure field for a password, with "Read only" or the disabled reason in its description.                                                                                                                                                                                              | `component:TextInput` FR6, FR8; `spec:AST-085`; `family:input-fields` FR4; AV1  |
| FR3 | An error MUST be in the field's VoiceOver label after its name; the description and status message MUST stay readable as text and in the description. A status message, and "Loading", are announced on the field's first appearance and when they change, an error at high priority.                                                                                                                                                                                                                                                                                                                                                                                                                                             | `component:TextInput` FR4, FR9; `component:FieldStatus` AR1                     |
| FR4 | The label tip, the tooltip-variant status, the clear button, and a disabled reason MUST show through the shared Astryx tooltip; no view uses `.help`. The tooltip-variant status tip is a button, as core's status icon is, named by its status and speaking its message when VoiceOver activates it. Trailing controls each lay out across their own 44-point target.                                                                                                                                                                                                                                                                                                                                                            | `component:TextInput` FR5, FR7, FR15; `spec:AST-082` FR11; Swift tooltip record |
| FR5 | Base `id` and `isHidden` MUST apply to the field control, TextInput's base target: `id` is its accessibility identifier, and `isHidden` takes the control and its buttons out of layout and focus (autofocus included) while the label, description, and status stay, with the label and its note read by VoiceOver as text.                                                                                                                                                                                                                                                                                                                                                                                                      | `component:TextInput` FR13; `spec:AST-082` FR7                                  |
| FR6 | The Swift contract MUST carry only the `type` values and keyboard props the Swift field applies. It carries `text`, `password`, and `email`; `email` applies the email keyboard and content type with no autocorrection or capitalization. The `search`, `tel`, and `url` types and core's `enterKeyHint`, `inputMode`, `autoCapitalize`, `hasAutoCorrect`, and `hasSpellCheck` (`component:TextInput` FR16) join it only with the field applying each as its platform keyboard type, return key, capitalization, autocorrection, or spell-checking trait; a contract that carries one the field ignores fails this rule. Implementation gap: the Swift field applies none of them, so a Swift caller cannot choose the keyboard. | `spec:AST-082` FR3, DEC-14; `component:TextInput` FR16; current source          |

### Allowed variation

- **AV1 — The drawn read-only and disabled field.** No platform field fits
  both states on both platforms, so Swift draws the value and gives VoiceOver
  SwiftUI's text field in its place. Fields considered:
  - SwiftUI `TextField` and `SecureField`: no read-only mode, and `.disabled`
    removes the focus stop core keeps (`spec:AST-085`).
  - UIKit `UITextField` refusing edits through its delegate: focus raises the
    keyboard unless its input view is replaced, its text and colors must be
    bridged from the theme by hand, and SwiftUI's image renderer and previews
    do not draw it.
  - AppKit `NSTextField` with editing off and selection on: a true read-only
    field on macOS, with no iOS counterpart, so the two platforms would differ.

### Representative states

| State              | Required invariant                                          | Allowed variation |
| ------------------ | ----------------------------------------------------------- | ----------------- |
| editable           | the platform field; edits reach `onChange`                  | none              |
| read-only          | value shown; focus stop; no keyboard; Return runs `onEnter` | none              |
| read-only password | masked; not selectable                                      | none              |
| disabled           | dimmed; focus stop; reads as a dimmed text field            | none              |
| error              | error in the label; message readable                        | none              |

### Transformation and precedence order

- **ORD1 — Availability.** Disabled, then read-only, then editable, as in core.

### Performance and resources

- **PR1 — No work while idle.** The view holds no timers; announcements fire
  only on first appearance or a change.

## Accessibility contract

- **AR1 — Name, error, description.** The name is the label and its note; an
  error follows it in the label; the description, other status messages,
  "Read only", and the disabled reason are the description.
- **AR2 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree and keyboard focus are not measured until an
  app-hosted target exists.

## Design relationships

| Anatomy or state | Design requirement        | Representation authority   | Hierarchy role | Component contract |
| ---------------- | ------------------------- | -------------------------- | -------------- | ------------------ |
| Field            | the platform's text field | prescribed by the platform | primary        | FR1, FR2           |

The component implements design requirements without copying their rationale.

Platform control: SwiftUI `TextField` and `SecureField` for editing; the drawn
field in AV1 for read-only and disabled (`spec:AST-093` FR2). Guideline pages:
Text fields and Accessibility in the Apple Human Interface Guidelines
(`spec:AST-093` FR3).

Theme values read (`spec:AST-093` FR4): `color.textPrimary`,
`color.textSecondary`, `color.textDisabled`, `color.borderEmphasized`, the
status roles `architecture:theme-tokens` INV11 assigns (`color.borderError`,
`color.borderWarning`, `color.borderSuccess` for the border;
`color.iconError`, `color.iconWarning`, `color.iconSuccess` for the icon;
`color.errorMuted`, `color.warningMuted`, `color.successMuted` for the
message ground and `color.onErrorMuted`, `color.onWarningMuted`,
`color.onSuccessMuted` for its text),
`size.elementSm`, `size.elementMd`, `size.elementLg`, `size.borderWidth`,
`radius.element`, `space` steps, `font.body`, `font.label`, `font.supporting`,
`font.weight.medium`, `font.weight.normal`,
`font.family.body`, the theme's icons, and the Dynamic Type scale.

## Family and system relationships

- `component:TextInput` and `family:input-fields` own the props and states;
  this record states only how Swift draws them.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                              | Representative states                                                       | Mutation or failure expectation                                                                                                            | Audit section                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| FR1      | `TextInputTests.swift` initializer and edit tests                                                                                                                                                                                                                         | both initializers; editable, read-only, disabled                            | differing props, or an edit that reaches `onChange` while not editable, fails                                                              | `audit:swift/TextInput/api`    |
| FR2      | `TextInputTests.swift` read-only, password, placeholder, and focus-stop tests, and the VoiceOver field each state gives `accessibilityRepresentation` (text or secure, dimmed when disabled, label, value, and description); the rendered tree and focus are not measured | read-only; read-only password; empty; disabled; disabled password; error    | a shown password, a missing placeholder, a secure field read as text, an undimmed disabled field, or a disabled field without a stop fails | `audit:swift/TextInput/states` |
| FR3      | `TextInputTests.swift` label, description, and announcement tests                                                                                                                                                                                                         | error with and without a message; warning; type change                      | an error missing from the label, or a missed announcement change, fails                                                                    | `audit:swift/TextInput/a11y`   |
| FR4      | `TooltipPresenterTests.swift` `.help` guard; `TextInputTests.swift` checks the row ends in buttons and that the status tip is a button named by its status with its message; overlap of the 44-point targets is not measured until an app-hosted test can hit-test them   | clear and tooltip status together; tooltip, attached, and detached statuses | `.help` in a view, or a status tip without the button trait, fails                                                                         | `audit:swift/TextInput/tips`   |
| FR5      | `TextInputTests.swift` base tests: `isHidden` leaves the control out of layout; `id` and the control base target; the identifier on the drawn control is not measured until an app-hosted test exists                                                                     | `id`; `isHidden`                                                            | `isHidden` keeping the control in layout or hiding the label fails                                                                         | `audit:swift/TextInput/base`   |
| FR6      | The per-platform prop check over every contract (`spec:AST-082` FR1, FR3); `TextInputTests.swift` email initializer tests; the applied keyboard traits are not measured until an app-hosted test exists                                                                   | `email`; each omitted prop and `type` value                                 | A Swift type that accepts a keyboard prop or `type` value the field does not apply fails                                                   | `audit:swift/TextInput/api`    |

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
