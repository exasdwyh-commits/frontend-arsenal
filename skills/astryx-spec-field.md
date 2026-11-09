---
schema_version: 3
template_version: 7
kind: component
id: component:Field
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-28
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Field/Field.test.tsx,
    packages/core/src/Button/__tests__/ButtonHitArea.interaction.browser.spec.ts,
    packages/core/src/FormLayout/FormLayout.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
    apps/storybook/rtl-audit/verified-not-applicable.json,
  ]
modules: []
families: [family:input-fields]
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs:
  [spec:AST-027/FR1, spec:AST-027/FR2, spec:AST-027/FR3, spec:AST-027/FR11]
---

# Field component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Field` wraps one caller-owned control with a label, optional description and status, optionality indicators, an explicit width, and root `BaseProps`; it also consumes FormLayout's horizontal-label mode.                                                     |
| Behavior                | Single controls use a native label association; groups use a labelled span. Status messages receive stable IDs and use persistent live regions. Horizontal-label mode exposes one protected `data-layout` theme axis.                                           |
| End-user impact         | People can identify a custom control, hear its description and changing status, and keep label/control/status relationships together across ordinary and horizontal form layouts.                                                                               |
| Builder impact          | Builders provide the control and its ID, wire descriptions/status IDs to that control, choose group semantics when needed, and use a status placement that is safe for the wrapped surface.                                                                     |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. The default `statusVariant="attached"` for arbitrary children conflicts with `family:input-fields/FR8`; listed under Current-state impact, with the migration open (OQ1).                             |
| Review checks           | Reject a lost label/group association, dropped root props, caller replacement of `data-layout`, duplicate/missing status announcement, escaped local z-index, undocumented public literals, or a claim that all custom controls safely support attached status. |
| Governing rules         | Established public `Field` interface; `family:input-fields` shared ownership and FR8; `architecture:public-component-api/INV5–INV8`; `spec:AST-027/FR1–FR3`; HTML label and ARIA naming/description semantics.                                                  |

This table is a review projection; the body below is authoritative.

## Intent

`Field` supplies shared label, description, status, width, and layout chrome for a native, custom, or third-party control that does not already own an Astryx field shell. The caller continues to own the control's value, interaction model, and control-specific accessibility semantics.

## Compatibility and migration

- Released default preserved: yes; `statusVariant` still defaults to `attached` in the current implementation.
- Compatibility class: records shipped behavior; no public prop, default, export, or DOM change.
- Controlled/uncontrolled behavior: caller-owned and unchanged.
- Migration decision: none; resolving OQ1 requires a separate compatibility decision.

## Ownership boundary

**Owns**

- The root field box, explicit width, local stacking boundary, and composition order.
- Label and description placement around the caller-owned control.
- Single-control versus grouped-label semantics.
- Status-message placement and persistent live-region announcement.
- The FormLayout horizontal-label projection.

**Does not own / non-goals**

- The wrapped control's value, focus model, keyboard behavior, disabled behavior, or event semantics — owned by the caller or wrapped component.
- Applying `aria-describedby` to the wrapped control — the caller supplies the control and wires the generated or explicit IDs.
- The visual and semantic contract of `FieldLabel`, `FieldStatus`, `Tooltip`, or caller-owned children — owned by those components.
- Input-family member APIs and control-box part props — owned by `family:input-fields` and each member.

## Public concepts

| Concept                | Closed values or states                           | Meaning                                                                                          | Availability by variant/orientation/state                              | Default                        | Owner                 | Stability                 | Invalid-value behavior                                                                                                  |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------ | --------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| label mode             | single control; group                             | Chooses a native `<label htmlFor>` or a `<span>` named through `aria-labelledby`.                | All layouts.                                                           | single control                 | `component:Field`     | released                  | Type-constrained                                                                                                        |
| label visibility       | visible; visually hidden                          | Hides label and description visually while preserving them for assistive technology.             | All layouts.                                                           | visible                        | `component:Field`     | released                  | Type-constrained                                                                                                        |
| optionality marker     | none; optional; required                          | Shows the localized exception to FormLayout's optionality default.                               | Label presentation.                                                    | none                           | `component:Field`     | released                  | Both set warns; optional wins visibly, unless FormLayout's default is optional, which suppresses it and shows required. |
| status placement       | `attached`; `detached`; `tooltip`                 | Places a status box behind the control, below it, or leaves visible tooltip affordance to input. | Message required for a rendered box; tooltip still announces messages. | `attached` (see OQ1)           | `family:input-fields` | released; conformance gap | Type-constrained                                                                                                        |
| width                  | absent; number; CSS size string                   | Sizes the complete ordinary field box.                                                           | Ordinary box layout; horizontal-label mode uses `display: contents`.   | containing layout              | `component:Field`     | released                  | Type-constrained                                                                                                        |
| field layout           | ordinary box; `horizontal-labels` from FormLayout | Stacks content or projects label and input group into the parent grid.                           | Resolved from `FormLayoutContext`.                                     | ordinary box                   | `component:Field`     | released                  | Context-constrained                                                                                                     |
| description/status IDs | explicit; generated from `inputID`; absent        | Names stable description and message elements for caller-owned `aria-describedby` wiring.        | Generated only when the corresponding text is present.                 | generated when text is present | `component:Field`     | released                  | Empty text omits output                                                                                                 |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| FR1 | A single-control label renders as `<label htmlFor={inputID}>`; a group label renders as a non-label element with `labelID` for caller-owned `aria-labelledby`.                                                                                                                                                                                                                                                                                          | Established public interface; HTML and ARIA semantics                  |
| FR2 | Visually hidden labels and descriptions remain in the DOM and out of layout flow.                                                                                                                                                                                                                                                                                                                                                                       | Established public interface and accessibility behavior                |
| FR3 | Description and status IDs use explicit values when supplied and otherwise resolve to `${inputID}-desc` and `${inputID}-status` only when text exists.                                                                                                                                                                                                                                                                                                  | Established public interface                                           |
| FR4 | Error status messages announce assertively and warning/success messages politely through persistent live regions; tooltip placement renders no `FieldStatus` box but preserves the announcement.                                                                                                                                                                                                                                                        | Existing tests; family ownership                                       |
| FR5 | Ordinary layout orders label, control, then optional status. Horizontal-label mode places the label wrapper before one description/control/status group and reflects `data-layout="horizontal-labels"`; caller props cannot replace that owned theme marker.                                                                                                                                                                                            | Established layout interface; `architecture:public-component-api/INV5` |
| FR6 | `width` applies to the ordinary root field box; it does not style the caller-owned control and has no box to target in horizontal-label mode.                                                                                                                                                                                                                                                                                                           | Established public interface; `family:input-fields` shared owner       |
| FR7 | Root ref, data/ARIA/DOM inputs, events, `xstyle`, class name, and inline style reach or compose on the root without replacing component-owned semantics.                                                                                                                                                                                                                                                                                                | `architecture:public-component-api/INV5–INV8`                          |
| FR8 | The Field root isolates every local attached-status paint relationship without assigning the root a page-level z-index.                                                                                                                                                                                                                                                                                                                                 | `spec:AST-027/FR1–FR3`, `FR11`                                         |
| FR9 | Field MUST give attached placement only to an opaque, bordered, fixed-height control with reliable size reflection; tall, wrapped, translucent, non-bordered, or otherwise ineligible controls, as custom controls normally are, use detached or component-owned placement. Implementation gap: `statusVariant` defaults to `attached` for every child, so an ineligible control receives attached placement unless the caller chooses otherwise (OQ1). | `family:input-fields/FR8`                                              |

### Allowed variation

- **AV1 — Caller-owned control.** Any control markup may occupy the slot; Field does not inspect, clone, or change it.
- **AV2 — Form arrangement.** FormLayout may choose ordinary or horizontal-label arrangement without changing label, description, status, or announcement ownership.
- **AV3 — Status surface.** Eligible controls may use attached placement; other controls use detached or a member-owned tooltip presentation.

### Representative states

| State             | Required invariant                                                             | Allowed variation                                          |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| label only        | One associated label precedes the caller-owned control.                        | Visible or visually hidden.                                |
| description       | One description element receives the resolved ID.                              | Caller may use an explicit ID or the generated value.      |
| group             | Group label is not a literal `<label>` and is referenceable by ID.             | Caller owns the group role and `aria-labelledby`.          |
| status            | Message receives resolved ID and is announced once on its urgency channel.     | Attached/detached box or tooltip-owned visible affordance. |
| horizontal labels | Label and input group participate in the parent grid and retain `data-layout`. | Description/status may be absent.                          |
| explicit width    | Ordinary root receives the requested size and remains shrinkable.              | Number or CSS size string.                                 |

### Transformation and precedence order

- **ORD1 — Root props.** Caller DOM/data/event props are forwarded first; Field-owned visual-state reflection is applied afterward; StyleX, caller class, and caller inline style compose in the documented order.
- **ORD2 — IDs.** Explicit description/status ID wins; otherwise text presence derives an ID from `inputID`; absent text produces no ID-bearing element.
- **ORD3 — Optionality.** FormLayout default optionality suppresses the matching visible marker; if both local booleans are true, Field warns and the optional marker wins visibly, unless FormLayout's default is optional, which suppresses it so the required marker shows.

### Performance and resources

- **PR1 — No per-field global resource.** Field owns no listener, observer, timer, or external store. Status announcement delegates to the shared persistent live-region runtime, and a `labelTooltip` brings the shared Tooltip's listeners and layer.

## Accessibility contract

- **AR1 — Label association.** Single controls receive a native label association; grouped controls use caller-wired `aria-labelledby` and never a misleading literal `<label>`.
- **AR2 — Description association.** Description text remains separate from the accessible name and exposes a stable ID for caller-owned `aria-describedby`.
- **AR3 — Status announcement.** Changing status text is announced through the persistent live region, including tooltip placement where no message box renders.
- **AR4 — Hidden labels.** Visually hidden label and description text remain available to assistive technology.

## Design relationships

No current repository design record governs component-local visual tuning.
The label, description, and status use shared semantic type, color, and
spacing tokens.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "field"},
  "Label": {"target": "field-label"},
  "Ordinary description": {
    "none": {
      "reason": "reachability-gap: The ordinary-layout description paints supporting text outside the field-label target and has no current public target of its own."
    }
  },
  "Horizontal-label description": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  },
  "Control slot": {
    "none": {
      "reason": "intentional: The wrapped control is caller-owned or another Astryx component and retains its own theming surface."
    }
  },
  "Status message": {"target": "field-status"},
  "Input status icon": {"target": "input-status-icon"},
  "Input clear button": {"target": "input-clear-button"},
  "Input clear icon": {"target": "input-clear-icon"},
  "Optional/Required indicator": {"inherits": "field-label"},
  "Label tooltip trigger": {
    "none": {
      "reason": "unsettled: the trigger is component:InfoTip's button, which has no public theming target yet; its info icon stays on Icon/icon through InfoTip"
    }
  },
  "Label tooltip surface": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  }
}
```

The ordinary description remains stable consumer anatomy without a Field-owned target. A visible horizontal-label description delegates to `Text/text`; when `isLabelHidden` is true, the same content delegates to `VisuallyHidden` and exposes no painted target. The label tooltip splits its `component:InfoTip` trigger button, which has no public target yet, from its layer-hosted `Tooltip/tooltip` surface.

## Family and system relationships

- `family:input-fields` owns shared status-placement capability and identifies Field as the standalone label, description, status-placement, and explicit-width owner.
- `architecture:public-component-api` owns root prop, style, event, and ref composition.
- `architecture:component-theming-surface` owns anatomy qualification and target disposition.
- `architecture:component-test-sufficiency` owns mutation-sensitive evidence and bounded partitions.
- `spec:AST-027` owns the isolated local paint relationship between the control and attached status.

## Verification map

| Contract                     | Verification                                                                                                           | Representative states                                                                                | Mutation or failure expectation                                                                                                                                 | Audit section               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| FR1–FR3, ORD2, AR1, AR2, AR4 | `Field.test.tsx` label-element, group-label, hidden label and description, description-ID, and generated-ID cases      | Single control, group, visible and hidden label, explicit and generated IDs                          | A lost association, wrong element, missing hidden text, or wrong ID fails.                                                                                      | `audit:Field/accessibility` |
| FR4, AR3                     | `Field.test.tsx` announcement and tooltip-placement cases                                                              | First mount, update, repeat, error, warning, tooltip, no message                                     | A missing, duplicate, stale, or wrong-urgency announcement fails.                                                                                               | `audit:Field/accessibility` |
| FR5, FR6, ORD1               | `Field.test.tsx` horizontal-labels, width, and narrow-row cases                                                        | Ordinary and horizontal layout; string and number width; narrow row                                  | A replaceable layout marker, wrong grid grouping, or width on the inner control fails. Evidence gap: no test asserts the ordinary label, control, status order. | `audit:Field/layout`        |
| FR7                          | `Field.test.tsx` ref and horizontal-labels root-props cases                                                            | Ref; class, style, data, and event props in horizontal mode                                          | A dropped ref or caller-replaced layout marker fails. Evidence gap: no test asserts root `xstyle`, class, style, and event props in the ordinary layout.        | `audit:Field/api`           |
| ORD3                         | `Field.test.tsx` optional, required, and both-set cases; `FormLayout.test.tsx` default-optionality cases through Field | Optional; required; both; form default                                                               | A missing marker, no warning when both are set, or a marker that restates the form default fails.                                                               | `audit:Field/behavior`      |
| FR8                          | `Field.test.tsx` attached-layer and local-stacking cases                                                               | Attached, no status, custom control                                                                  | Removing isolation or ranking the root outside its parent fails.                                                                                                | `audit:Field/code-health`   |
| FR9                          | `Field.test.tsx` attached-layer case for a custom control                                                              | Custom control with an attached status                                                               | The test pins the current attached default, so it changes when the FR9 gap closes.                                                                              | `audit:Field/behavior`      |
| PR1                          | Evidence gap: no test asserts the absence of per-field global resources                                                | —                                                                                                    | —                                                                                                                                                               | `audit:Field/code-health`   |
| `spec:AST-094` FR42          | `ButtonHitArea.interaction.browser.spec.ts` clear-band and clearable-Selector chevron cases                            | A text input's clear button beside its text; a clearable Selector's beside its chevron               | A clear band past half the gap to the text or to the field's next part, or a chevron tap that clears, fails.                                                    | `audit:Field/behavior`      |
| Theming anatomy              | `scripts/check-knowledge.mjs`; `themingTargets.test.ts`                                                                | Field root, label, description, caller control, status, shared input affordances, indicator, tooltip | Invalid dispositions, or a rendered class absent from the documented targets, fails.                                                                            | `audit:Field/theming`       |
| Documentation projection     | `docPropLiterals.test.ts`; `docPropReferences.test.ts`                                                                 | Status placements, `labelIcon`, and other documented props                                           | A documented literal or prop reference that drifts from the source type fails.                                                                                  | `audit:Field/docs`          |
| RTL applicability            | `apps/storybook/rtl-audit/verified-not-applicable.json` entry for `core/Field`                                         | Checked-in Field stories                                                                             | A story that gains directional placement or behavior makes the not-applicable entry stale.                                                                      | `audit:Field/i18n-rtl`      |

## Current-state impact

- **Attached default (FR9).** Field defaults `statusVariant` to `attached` for
  every child, against `family:input-fields/FR8`; how to migrate the default is
  OQ1.

## Decision log

No component-local decision. Field applies `family:input-fields` and `spec:AST-027`.

## Open questions

- **OQ1 — How should Field migrate the released `attached` default so arbitrary custom controls cannot receive a placement that `family:input-fields/FR8` says they may not safely support?** (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Field/FieldLabel.spec.md -->


# FieldLabel component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `FieldLabel` renders a visible or visually hidden label group for one control or a caller-labelled group, with optional description, optionality indicator, icon, tooltip, label-element BaseProps, and label-element ref.                                                                                                  |
| Behavior                | Single-control mode uses a native label; group mode uses a labelled span. A description adds a wrapper div, while caller props and ref stay on the inner label element. Description clicks forward only to one associated control.                                                                                          |
| End-user impact         | People can identify a control or group, hear supporting text separately from its name, and activate eligible controls from the complete visible label area. Help behind the info button opens by pointer, touch, keyboard, and screen reader, and a tap, click, or key press on it never changes the control (DEC-1).       |
| Builder impact          | Builders provide stable control and description IDs, select group mode when labelling a composite, and wire `aria-labelledby` or `aria-describedby` on the controlled surface.                                                                                                                                              |
| Compatibility/readiness | No API or default change; with `labelTooltip`, the info trigger is an InfoTip button after the label element, and a mouse click on it does not activate the control (FR9, DEC-1). Group mode renders a span while public types promise label props and ref; it is listed under Current-state impact.                        |
| Review checks           | Reject a lost native/group association, nested description in the accessible name, forwarded clicks from group or interactive description content, dropped label-element props/ref, hidden tooltip content, an info trigger inside the label element or one whose press activates the control, or undocumented public prop. |
| Governing rules         | Established public interface; HTML label semantics; WCAG 2.2 SC 2.1.1, SC 4.1.2; `component:InfoTip`; `architecture:public-component-api/INV1,INV5–INV9,INV12`; `architecture:component-theming-surface/INV3–INV7`; `spec:AST-020/FR1`.                                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

`FieldLabel` supplies the shared label, description, optionality, icon, and tooltip presentation used by Field and labeled controls such as CheckboxInput and Switch. It owns the label group only; the associated control or group owns value and interaction behavior.

## Compatibility and migration

- Released default preserved: yes.
- Compatibility class: no public prop, default, or export change. With `labelTooltip`, the info trigger moves from an icon inside the label element to a `component:InfoTip` button after it, in one inline-flex row wrapping both, and a press on it, by any pointer or key, does not activate the control (FR9, DEC-1). Callers see that extra wrapper only when `labelTooltip` is set; their class, `xstyle`, and ref stay on the label element (FR6).
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: DEC-1 needs no caller change; the ref typing is OQ1.

## Ownership boundary

**Owns**

- Native single-control and non-label group-label element selection.
- Visible and visually hidden label and description presentation.
- Optional/required exception indicators from FormLayout optionality context.
- Safe description-click forwarding for one associated control.
- The `field-label` theme target and composition of caller props, styles, and ref on the label element.
- Whether the optional tooltip trigger is reachable and named for every input modality and assistive-technology path.

**Does not own / non-goals**

- The associated control or group's value, disabled semantics, focus model, keyboard behavior, and ARIA wiring beyond the label's own IDs.
- The caller's layout around the label group.
- The info trigger, its press toggle, and the tooltip surface, which delegate to `component:InfoTip` and through it to `component:Tooltip`; FieldLabel owns where the trigger renders, its name, and that its content is exposed.

## Public concepts

| Concept                | Closed values or states                         | Meaning                                                                                                                                                | Availability by variant/orientation/state | Default        | Owner                  | Stability | Invalid-value behavior                                                                                                               |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | -------------- | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| label mode             | single control; group                           | Chooses a native `<label htmlFor>` or a `<span>` referenced through `aria-labelledby`.                                                                 | All uses.                                 | single control | `component:FieldLabel` | released  | Boolean-constrained; see OQ1 for root/ref typing.                                                                                    |
| label visibility       | visible; visually hidden                        | Keeps label and description accessible while removing their layout space when hidden.                                                                  | Both label modes.                         | visible        | `component:FieldLabel` | released  | Boolean-constrained.                                                                                                                 |
| optionality marker     | none; optional; required                        | Shows the localized exception to FormLayout's form-level optionality default.                                                                          | Visible and hidden labels.                | none           | `component:FieldLabel` | released  | When both booleans are true, optional wins visibly, unless FormLayout's default is optional, which suppresses it and shows required. |
| leading icon           | absent; icon type; rendered node                | Adds visual content before the label text.                                                                                                             | Both label modes.                         | absent         | `component:FieldLabel` | released  | Rendered through the shared icon slot.                                                                                               |
| explanatory tooltip    | absent; localized string                        | Adds a `component:InfoTip` after the label element; a tap, click, or key press on it opens or closes the tooltip without activating the control (FR9). | Both label modes.                         | absent         | `component:FieldLabel` | released  | —                                                                                                                                    |
| supporting description | absent; rendered node with optional explicit ID | Keeps supporting content separate from the accessible name and available for description.                                                              | Both label modes.                         | absent         | `component:FieldLabel` | released  | Missing ID leaves association to the caller.                                                                                         |
| description activation | forwarding; non-forwarding                      | For one control, noninteractive description clicks mirror native-label activation.                                                                     | Single mode only.                         | forwarding     | `component:FieldLabel` | released  | Group mode and interactive descendants do not forward.                                                                               |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| FR1 | Single-control mode renders `<label htmlFor={inputID}>`; group mode renders a non-label element with `labelID` for caller-owned `aria-labelledby`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Established public interface; HTML and ARIA semantics                  |
| FR2 | Visible and hidden labels retain the label text; hidden label and description boxes remain in the accessibility tree and leave no layout slot.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Established public interface                                           |
| FR3 | Descriptions remain siblings of the label so they do not enter the control's accessible name. Noninteractive description clicks forward to one eligible control; group labels and interactive descendants do not forward activation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Established public interface; native label behavior                    |
| FR4 | FormLayout optionality suppresses the matching visible marker; without a form default, the requested marker is localized and shown. When both flags are true, optional wins, except inside a FormLayout whose default is optional, where the optional marker is suppressed and the required marker shows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Established public interface and current tests                         |
| FR5 | Label icons, tooltip anchors, required/optional text, and description content preserve source order. The label element uses a horizontal flex row; the optional label/description wrapper uses block flow. With `labelTooltip`, one inline-flex row wraps the label element and the InfoTip that follows it (FR9). All component-owned spacing is logical or direction-neutral.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Established public interface and source observation                    |
| FR6 | Accepted data, ARIA, DOM, class, style, event, and `xstyle` inputs compose on the label element without replacing the component-owned target or association. When a description renders, the outer wrapper is layout-only and caller props stay on the inner label element; the `labelTooltip` row (FR9) is layout-only in the same way, so caller class, `xstyle`, and ref stay on the label element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `architecture:public-component-api/INV5–INV7`                          |
| FR7 | The public ref and label-element props MUST describe the element FieldLabel renders in each mode; which root element and public type group mode uses is OQ1. Implementation gap: group mode renders a `<span>` while the public BaseProps and ref types are fixed to `HTMLLabelElement`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `architecture:public-component-api/INV8,INV9`; current runtime/types   |
| FR8 | The optional tooltip's explanatory content MUST be reachable by keyboard (WCAG 2.2 SC 2.1.1) and its trigger MUST have an accessible name and role (WCAG 2.2 SC 4.1.2); FR9's InfoTip button meets both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | WCAG 2.2 SC 2.1.1, SC 4.1.2; `spec:AST-020/FR1`                        |
| FR9 | With `labelTooltip`, FieldLabel renders `component:InfoTip` with that content after the label element and outside it, and wraps the label element and the InfoTip in one inline-flex row, as it wraps the label and description, so no button sits inside a `<label>`; caller class, `xstyle`, and ref stay on the label element, and the row renders only when `labelTooltip` is set. With `isLabelHidden`, the InfoTip is visually hidden with the label, leaves no layout slot (FR2), and while it has keyboard focus, the button takes its place in flow above the control (or in the label cell with horizontal labels), so it is never covered or clipped (WCAG 2.4.7, 2.4.11); the button's name is a localized string that includes the label text ("About Auto-save"). A tap, click, Enter, or Space on the info trigger opens or closes the tooltip (`component:Tooltip` FR9) and never activates, focuses, or toggles the associated control; hover and focus preview it. | DEC-1; HTML label content model; WCAG 2.2 SC 2.1.1, SC 2.4.7, SC 4.1.2 |

### Allowed variation

- **AV1 — Parent layout.** Field, CheckboxInput, Switch, and direct consumers may arrange the label group differently without changing its local semantics.
- **AV2 — Label content.** Icon, tooltip, optionality text, and description content may be absent independently.
- **AV3 — Control kind.** Description activation follows the associated native or custom control's supported click/focus behavior.

### Representative states

| State                 | Required invariant                                                                                                                                                                   | Allowed variation                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| single label          | Native label association reaches the one control.                                                                                                                                    | Visible or visually hidden.                      |
| group label           | Label element is not a literal label and is referenceable by `labelID`.                                                                                                              | Caller owns group role and `aria-labelledby`.    |
| description           | Supporting content remains outside the label and may expose `descriptionID`.                                                                                                         | Text or structured content.                      |
| optional or required  | One localized exception marker follows label text.                                                                                                                                   | Suppressed when it matches FormLayout's default. |
| disabled presentation | Label uses disabled text treatment and no pointer cursor.                                                                                                                            | Associated control owns actual disabled state.   |
| icon and tooltip      | Shared Icon and InfoTip render their owned paint; the InfoTip button follows the label element, is keyboard-reachable and named, and its press never reaches the control (FR8, FR9). | Either slot may be absent.                       |

### Transformation and precedence order

- **ORD1 — Optionality.** The FormLayout default suppresses its matching marker first; then optional wins when both local booleans are true.
- **ORD2 — Label-element composition.** Component target and base styles apply before caller `xstyle`, class, and inline style composition on the label element; association and label-element choice remain component-owned. An optional description, or a `labelTooltip` row (FR9), adds a layout wrapper without retargeting those inputs.

### Performance and resources

- **PR1 — No retained resource.** FieldLabel owns no global listener, observer, timer, or external store. Description activation reuses the shared input-container hook with local refs, and a `labelTooltip` brings InfoTip's, and so Tooltip's, listeners and layer.

## Accessibility contract

- **AR1 — Label association.** Single controls use native label association; grouped controls use a caller-wired labelled span and never a misleading literal label.
- **AR2 — Description separation.** Description content stays outside the label so it is not duplicated in the accessible name and exposes an ID for caller-owned `aria-describedby`.
- **AR3 — Hidden labels.** Visually hidden label and description content remain programmatically available.
- **AR4 — Activation boundary.** Description activation never hijacks interactive descendants and never forwards from a group label to one control.
- **AR5 — Tooltip reachability.** Tooltip content MUST be reachable by keyboard
  (WCAG 2.2 SC 2.1.1) through a named trigger (SC 4.1.2), the InfoTip button
  that follows the label (FR8, FR9).

## Design relationships

No current repository design record governs component-local visual tuning. The implementation uses shared semantic type, color, spacing, and disabled tokens; rendered evidence records the resulting states without turning them into policy.

## Family and system relationships

- `architecture:public-component-api` owns exports, label-element prop composition, ref accuracy, and released API compatibility.
- `architecture:component-theming-surface` owns the anatomy-to-target disposition and target composition.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence for each critical established public seam.

## Verification map

| Contract          | Verification                                                                                                                                                                                                                                                                                                                                                                                                     | Representative states                                                                                                             | Mutation or failure expectation                                                                                                                                                                                                                                                         | Audit section                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1–FR3, AR1–AR4  | `FieldLabel.test.tsx` association, ref, and description-forwarding cases; `FieldLabelAudit.a11y.chromium.spec.ts` default, custom-theme, RTL, and narrow cases in light and dark                                                                                                                                                                                                                                 | Single, group, description, interactive description child                                                                         | A wrong label element, lost association, nested description, or forwarded group or interactive click fails. Evidence gap: no test asserts the hidden label and description leave no layout slot.                                                                                        | `audit:FieldLabel/accessibility` |
| FR4, ORD1         | `FieldLabel.test.tsx` optional, required, both-set, and i18n cases; `FormLayout.test.tsx` default-optionality cases through Field                                                                                                                                                                                                                                                                                | Optional, required, both, localized                                                                                               | A wrong localized marker, required winning over optional, or a marker that restates the form default fails.                                                                                                                                                                             | `audit:FieldLabel/behavior`      |
| FR5               | `FieldLabel.test.tsx` label-icon, info-button placement, and tooltip-with-optional cases                                                                                                                                                                                                                                                                                                                         | Icon, tooltip, optionality                                                                                                        | A missing icon or tooltip anchor fails. Evidence gap: no test asserts source order, the flex row, or logical spacing.                                                                                                                                                                   | `audit:FieldLabel/layout`        |
| FR6, ORD2         | `FieldLabel.test.tsx` ref, layout-item, and label-target cases; `themingTargets.test.ts`                                                                                                                                                                                                                                                                                                                         | Ref; composed target; with a description wrapper                                                                                  | A dropped ref or a lost `field-label` target fails; a rendered class absent from the documented targets fails. Evidence gap: no test asserts caller class, style, `xstyle`, data, and event props on the inner label element with a description wrapper or with the `labelTooltip` row. | `audit:FieldLabel/api`           |
| FR7               | Evidence gap: no type test pins the public ref and props against the rendered group span                                                                                                                                                                                                                                                                                                                         | —                                                                                                                                 | —                                                                                                                                                                                                                                                                                       | `audit:FieldLabel/api`           |
| FR8, AR5          | `FieldLabelAudit.a11y.chromium.spec.ts` tooltip-anchor count                                                                                                                                                                                                                                                                                                                                                     | Tooltip present                                                                                                                   | The audit asserts one named, focusable InfoTip button after the label element and outside it; an anonymous, unfocusable, or label-nested trigger fails.                                                                                                                                 | `audit:FieldLabel/accessibility` |
| FR9               | `FieldLabel.test.tsx` info-button placement and name, hidden-label tab stop, finger-tap, pen-tap, mouse-click, and Space checkbox cases and the Switch-label click case; `FieldLabelTap.a11y.chromium.spec.ts` touch-tap, mouse-click, and Enter text-field cases and the hidden label's focused button on top of the field; evidence gap: no check measures that the hidden label's button takes no layout slot | Checkbox, text field, and Switch labels; finger, pen, mouse, Enter, and Space; `isLabelHidden` with keyboard focus on the InfoTip | A tap, click, or key press on the info trigger that activates, focuses, or toggles the control, an info button inside the label element, a trigger without the label in its name, or a hidden label's InfoTip that takes layout space or stays invisible while focused fails.           | `audit:FieldLabel/accessibility` |
| PR1               | Evidence gap: no test asserts the absence of retained resources                                                                                                                                                                                                                                                                                                                                                  | —                                                                                                                                 | —                                                                                                                                                                                                                                                                                       | `audit:FieldLabel/code-health`   |
| Documentation     | `docPropLiterals.test.ts`; `docPropReferences.test.ts`                                                                                                                                                                                                                                                                                                                                                           | Documented props and defaults                                                                                                     | A documented literal or prop reference that drifts from the source type fails.                                                                                                                                                                                                          | `audit:FieldLabel/docs`          |
| RTL applicability | `apps/storybook/rtl-audit/verified-not-applicable.json` entry for `core/FieldLabel`                                                                                                                                                                                                                                                                                                                              | Checked-in FieldLabel stories                                                                                                     | A story that gains directional placement or behavior makes the not-applicable entry stale.                                                                                                                                                                                              | `audit:FieldLabel/i18n-rtl`      |

## Current-state impact

- **Group-mode typing (FR7).** Group mode renders a `<span>` while the public
  props and ref are typed for `HTMLLabelElement`, against
  `architecture:public-component-api` INV8 and INV9; the fix is OQ1.

## Decision log

- **DEC-1 — A press on the info trigger is for its help.** A tap, click,
  Enter, or Space on the label's info trigger opens or closes the help and
  never activates the label's control, so asking what a setting does never
  toggles a switch or focuses a field, for any pointer or key. The trigger is
  `component:InfoTip`, the info-icon preset over Tooltip's press toggle, after
  the label element, because a `<label>` may contain no control other than the
  one it labels. Rejected: leaving the tap, or a mouse click, to the label.

The label-element and ref typing is OQ1.

## Open questions

- **OQ1 — Should `isGroupLabel` expose a discriminated span-root BaseProps/ref contract, or should FieldLabel use one root element whose public type is stable in both modes?** (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
