---
schema_version: 3
template_version: 7
kind: component
id: component:CheckboxIndicator
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-31
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/CheckboxInput/CheckboxInput.test.tsx,
    packages/core/src/Indicator/Indicator.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: []
---

# CheckboxIndicator component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckboxIndicator` is exported from `@astryxdesign/core/Indicator`; `state` is required, `size` defaults to `md`, `isDisabled` defaults to `false`, and `children` may replace the built-in mark. |
| Behavior                | A decorative checkbox chrome is always rendered. Checked and indeterminate states draw their matching mark unless the shallow `isRenderable()` predicate treats `children` as replacement content. |
| End-user impact         | People receive one visible checkbox-state cue while the owning control retains all semantics, focus, keyboard, and activation behavior.                                                            |
| Builder impact          | Builders may restyle the canonical targets or replace the named indicator without taking over the owning control's semantics.                                                                      |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Only the canonical `checkbox-indicator` target is emitted.                                                                               |
| Review checks           | Reject lost `aria-hidden`, missing state marks, dropped passthrough/ref/styling, changed replacement precedence, or a second target alias on the root.                                             |
| Governing rules         | `architecture:public-component-api/INV1,INV5,INV6,INV8,INV9`; `architecture:component-theming-surface/INV3–INV8,INV12`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`.           |

This table is a review projection; the body below is authoritative.

## Intent

Render the replaceable, decorative visual that communicates a checkbox owner's unchecked, checked, or indeterminate state without taking ownership of checkbox semantics or interaction.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: not applicable; `state` is supplied by the owner
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Decorative checkbox chrome, state mark, disabled appearance, size, replacement-content precedence, and component theming targets.
- A root DOM ref plus supported neutral DOM and styling passthrough.

**Does not own / non-goals**

- Checkbox role, accessible name, focus, keyboard, activation, form participation, or busy semantics — owned by the composing control.
- Row placement and logical-edge layout — owned by the host component.
- The behavior or accessibility of consumer-supplied replacement content.

## Public concepts

| Concept             | Closed values or states                 | Meaning                                                                                                                                                       | Availability by variant/orientation/state | Default            | Owner                         | Stability                                 | Invalid-value behavior                             |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------ | ----------------------------- | ----------------------------------------- | -------------------------------------------------- |
| state               | `unchecked`, `checked`, `indeterminate` | Chooses the built-in visual state.                                                                                                                            | All render paths.                         | required           | `component:CheckboxIndicator` | stable                                    | rejected by the public type                        |
| size                | `sm`, `md`                              | Selects the 20px or 24px visual box and matching mark geometry.                                                                                               | All states.                               | `md`               | `component:CheckboxIndicator` | stable                                    | rejected by the public type                        |
| disabled appearance | enabled, disabled                       | Mirrors the owning control's disabled presentation without creating semantics.                                                                                | All states.                               | enabled            | `component:CheckboxIndicator` | stable                                    | boolean only                                       |
| replacement content | shallow renderable or empty             | Replaces both built-in marks when `isRenderable(children)` returns true. React elements and containers take this branch even when descendants render nothing. | All states.                               | built-in mark path | `component:CheckboxIndicator` | stable; empty-container policy open (OQ1) | unsupported values follow React rendering behavior |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                           | Basis                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1 | The component MUST render one decorative span chrome in every state and MUST set its own `aria-hidden="true"` after caller passthrough.                                                                                             | shipped source; `architecture:public-component-api/INV5`           |
| FR2 | `unchecked` MUST show no built-in mark, `checked` MUST show the checkmark, and `indeterminate` MUST show the dash.                                                                                                                  | shipped source, docs, tests, and stories                           |
| FR3 | Replacement uses shallow `isRenderable(children)` precedence: nullish values, booleans, and the empty string keep the state mark; React elements and containers replace it even when descendants render nothing (OQ1).              | shipped source and regression tests                                |
| FR4 | The root MUST preserve supported DOM props, `ref`, `className`, `style`, and `xstyle` while keeping component-owned accessibility precedence.                                                                                       | `architecture:public-component-api/INV5,INV6,INV8`                 |
| FR5 | The root target MUST be `checkbox-indicator`, the only target on that element; no alias target is emitted.                                                                                                                          | `architecture:component-theming-surface/INV4,INV6`; current tests  |
| FR6 | Size, checked or indeterminate (`data-checked`), and disabled state MUST be reflected on the root target; the check and dash MUST retain their dedicated `checkbox-indicator-check` and `checkbox-indicator-dash` painting targets. | shipped source; `architecture:component-theming-surface/INV4,INV6` |
| FR7 | State transitions MUST honor reduced motion, and checked/indeterminate marks MUST remain perceivable in forced-colors mode.                                                                                                         | shipped source and WCAG 2.2 1.4.11                                 |

### Allowed variation

- **AV1 — Theme paint.** Tokens and canonical component targets may change color, border, radius, opacity, and other admitted visual properties without changing state or semantic ownership.
- **AV2 — Replacement component.** A theme may replace the named checkbox indicator when the replacement preserves this public prop and decorative-ownership contract.

### Representative states

| State               | Required invariant                                                                          | Allowed variation                |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| unchecked           | Chrome remains visible with no built-in mark.                                               | Theme-owned paint and shape.     |
| checked             | Chrome and checkmark remain visible.                                                        | Theme-owned paint and shape.     |
| indeterminate       | Chrome and dash remain visible.                                                             | Theme-owned paint and shape.     |
| disabled            | The requested state remains legible with muted treatment and no host-driven hover response. | Theme-owned inactive treatment.  |
| replacement content | Shallow-renderable content replaces both built-in marks inside the same chrome.             | Caller-owned decorative content. |

### Transformation and precedence order

- **ORD1 — Render precedence.** Caller passthrough → component-owned `aria-hidden` → merged theme/style inputs → shallow replacement-content decision → built-in state mark.

### Performance and resources

- **PR1 — Pure render.** The component owns no state, Effect, listener, observer, timer, or external resource.

## Accessibility contract

- **AR1 — Decorative ownership.** The root remains `aria-hidden`; the composing control owns role, name, state, focus, keyboard, activation, and form semantics.
- **AR2 — Forced colors.** Checked and indeterminate marks remain distinguishable when author colors are forced.
- **AR3 — Replacement boundary.** Replacement content is decorative within the hidden root and MUST NOT be the only semantic expression of the owning control's state.

## Design relationships

| Anatomy or state   | Design requirement                                  | Representation authority                   | Hierarchy role            | Component contract |
| ------------------ | --------------------------------------------------- | ------------------------------------------ | ------------------------- | ------------------ |
| Chrome             | Semantic theme tokens and canonical painting target | prescribed by current theming architecture | supporting control visual | FR1, FR5–FR7       |
| Checkmark          | Visible checked-state mark                          | observed shipped representation            | supporting state cue      | FR2, FR6–FR7       |
| Indeterminate mark | Visible partial-state mark                          | observed shipped representation            | supporting state cue      | FR2, FR6–FR7       |

The shared `Indicator.doc.mjs` lists anatomy and targets for CheckboxIndicator, CheckIndicator, and RadioIndicator together, so this record carries no anatomy-theming map.

## Family and system relationships

- `architecture:component-theming-surface` owns target placement and reflected state.
- `component:Indicator` owns the registry name `checkbox` and theme replacement.
- `architecture:public-component-api` owns export, passthrough, styling composition, ref, and compatibility requirements.
- `architecture:component-test-sufficiency` owns the evidence needed for each critical promise and distinct risk partition.

## Verification map

| Contract  | Verification                                                                                                                                                                                                              | Representative states                                                  | Mutation or failure expectation                                                                                                                                                                                                                                                                                                             | Audit section                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1, AR1  | `Indicator.test.tsx` decorative-contract cases                                                                                                                                                                            | Checked state; a caller `aria-hidden={false}`                          | A checked indicator that a caller can expose fails. Evidence gap: no test checks `aria-hidden` in the unchecked or indeterminate state, or that replacement content is not the only state expression (AR3).                                                                                                                                 | `audit:CheckboxIndicator/accessibility` |
| FR2, FR3  | `Indicator.test.tsx` default-indicator, replacement, and falsy-children cases                                                                                                                                             | Checked with falsy and real children; checked with a replacement child | A removed checkmark element, a falsy child that suppresses it, or real children that do not replace it fails. Evidence gap: no test looks for the dash element, and since both marks render in every state with their display toggled, no test asserts which mark is visible in each state.                                                 | `audit:CheckboxIndicator/behavior`      |
| FR4       | `Indicator.test.tsx` decorative-contract "still forwards ordinary props" cases                                                                                                                                            | Neutral DOM props                                                      | A dropped `data-testid`, `id`, or `dir` fails. Evidence gap: no test asserts `ref`, `className`, `style`, or `xstyle` on the root.                                                                                                                                                                                                          | `audit:CheckboxIndicator/api`           |
| FR5, FR6  | `Indicator.test.tsx` checkbox-target and canonical-target cases; `themingTargets.test.ts`                                                                                                                                 | Indeterminate at `sm`; canonical target                                | A missing or aliased `checkbox-indicator` target, or a missing `data-checked="indeterminate"` or `data-size`, fails. Evidence gap: no test asserts `data-checked` in the checked state, checkbox `data-disabled` (the disabled-state case renders RadioIndicator), or the `checkbox-indicator-check` and `checkbox-indicator-dash` targets. | `audit:CheckboxIndicator/theming`       |
| FR7, AR2  | `CheckboxInput.test.tsx` forced-colors cases ("compiles a forced-colors fill so the indeterminate mark survives Windows High Contrast", "compiles a forced-colors color so the checkmark survives Windows High Contrast") | Checked and indeterminate under forced colors                          | Evidence gap: the forced-colors cases pass on any matching injected rule, so removing the checkmark and dash `CanvasText` rules still passes; no test asserts the reduced-motion transition.                                                                                                                                                | `audit:CheckboxIndicator/visual`        |
| ORD1, PR1 | Covered by the FR1–FR4 rows. Evidence gap: no test asserts the absence of state, effects, or listeners                                                                                                                    | —                                                                      | —                                                                                                                                                                                                                                                                                                                                           | `audit:CheckboxIndicator/behavior`      |

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Should an empty React container in `children` keep suppressing the
  built-in state mark?** (`human-api`) FR3 records that it does today.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Indicator/CheckIndicator.spec.md -->


# CheckIndicator component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `CheckIndicator` is exported from `@astryxdesign/core/Indicator`; `state` is required, `size` defaults to `md`, `isDisabled` defaults to `false`, and `children` may replace the built-in mark.                                                                    |
| Behavior                | The component draws a decorative check glyph only when checked. Shallow-renderable `children` replace that glyph in either state; unchecked without replacement content renders no element.                                                                        |
| End-user impact         | People receive one selection cue from the owning control without a duplicate accessible object or an empty placeholder beside unselected rows.                                                                                                                     |
| Builder impact          | Builders may replace the named `check` indicator or compose host-owned classes and styling without taking over the owning control's semantics.                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. The checked glyph path drops the declared `ref`; listed under Current-state impact, with the fix open (OQ1).                                                                                             |
| Review checks           | Reject lost `aria-hidden`, a mark in the unchecked default, a missing checked mark, dropped supported DOM/styling passthrough, changed replacement precedence, a new component-owned theme target, or a checked path that still drops the ref once OQ1 is decided. |
| Governing rules         | `architecture:public-component-api/INV1,INV5,INV6,INV8,INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`.                                                                                 |

This table is a review projection; the body below is authoritative.

## Intent

Render the replaceable, decorative checkmark used by a host to show that one option is chosen, without taking ownership of selection semantics, interaction, or persistent control chrome.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: not applicable; `state` is supplied by the owner
- Migration decision: none; the public component and `check` registry name remain unchanged

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The checked glyph, unchecked absence, disabled color, size mapping, replacement-content precedence, and decorative root.
- Supported neutral DOM and styling passthrough on every rendered root. The replacement-content span receives the declared ref; the checked Icon path currently does not.

**Does not own / non-goals**

- Selection role, accessible name, state, focus, keyboard, activation, or busy semantics — owned by the composing control.
- Persistent checkbox or radio chrome — owned by `component:CheckboxIndicator` or `component:Indicator`.
- Row placement and logical-edge layout — owned by the host component.
- The behavior or accessibility of consumer-supplied replacement content.

## Public concepts

| Concept             | Closed values or states     | Meaning                                                                                                                                                                     | Availability by variant/orientation/state             | Default            | Owner                      | Stability                                 | Invalid-value behavior                             |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ | -------------------------- | ----------------------------------------- | -------------------------------------------------- |
| state               | `unchecked`, `checked`      | Selects whether the built-in check glyph is absent or present.                                                                                                              | Every render path.                                    | required           | `component:CheckIndicator` | stable                                    | rejected by the public type                        |
| size                | `sm`, `md`                  | Selects the shared indicator size; both current values use the `sm` Icon glyph.                                                                                             | Checked and replacement-content roots.                | `md`               | `component:CheckIndicator` | stable                                    | rejected by the public type                        |
| disabled appearance | enabled, disabled           | Mirrors the owning control's disabled color without creating semantics.                                                                                                     | Checked and replacement-content roots.                | enabled            | `component:CheckIndicator` | stable                                    | boolean only                                       |
| replacement content | shallow renderable or empty | Replaces the built-in mark in either state when `isRenderable(children)` returns true. React elements and containers take this branch even when descendants render nothing. | Every state; replacement content creates a span root. | built-in mark path | `component:CheckIndicator` | stable; empty-container policy open (OQ2) | unsupported values follow React rendering behavior |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                    | Basis                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| FR1 | The component MUST render one decorative check glyph when `state="checked"` and no replacement content is present, and MUST set its own `aria-hidden="true"` after caller passthrough.                                                                                                                                                                       | shipped source; `architecture:public-component-api/INV5`           |
| FR2 | The default component MUST render no element when `state="unchecked"` and no replacement content is present.                                                                                                                                                                                                                                                 | shipped source, docs, tests, and stories                           |
| FR3 | Replacement uses shallow `isRenderable(children)` precedence in both states: nullish values, booleans, and the empty string keep the built-in state behavior; React elements and containers replace it even when descendants render nothing (OQ2).                                                                                                           | shipped source and regression tests                                |
| FR4 | Every rendered root MUST preserve supported DOM props, `className`, `style`, and `xstyle` while keeping component-owned accessibility precedence, and the declared ref MUST reach the rendered root (`architecture:public-component-api/INV8`). Implementation gap: the replacement-content span receives the ref, but the checked Icon path drops it (OQ1). | `architecture:public-component-api/INV5,INV6,INV8`; current source |
| FR5 | The built-in checked mark MUST remain an Icon-owned painter on the same element as host-supplied classes; CheckIndicator MUST NOT add a wrapper or a distinct public target without an approved contract change.                                                                                                                                             | shipped source; `architecture:component-theming-surface/INV3–INV5` |
| FR6 | Disabled color and replacement-content color MUST continue to use semantic tokens rather than raw color values.                                                                                                                                                                                                                                              | shipped source; current token and theming architecture             |

### Allowed variation

- **AV1 — Theme paint.** The Icon target and host-owned class may change supported paint without changing state or semantic ownership.
- **AV2 — Replacement component.** A theme may replace the named `check` indicator when the replacement preserves this public prop and decorative-ownership contract.

### Representative states

| State               | Required invariant                                                                              | Allowed variation                 |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| unchecked           | No built-in element is rendered.                                                                | A replacement component may draw. |
| checked             | One decorative check glyph is rendered.                                                         | Icon- and host-owned theme paint. |
| disabled            | Checked or replacement content keeps the requested state and uses the disabled semantic color.  | Theme-owned inactive treatment.   |
| replacement content | Shallow-renderable content replaces the built-in mark in a centered fixed-size decorative root. | Caller-owned decorative content.  |

### Transformation and precedence order

- **ORD1 — Render precedence.** Shallow replacement-content decision → unchecked absence or checked Icon → caller passthrough → component-owned `aria-hidden` → merged theme/style inputs.

### Performance and resources

- **PR1 — Pure render.** The component owns no state, Effect, listener, observer, timer, or external resource.

## Accessibility contract

- **AR1 — Decorative ownership.** Every rendered root remains `aria-hidden`; the composing control owns role, name, state, focus, keyboard, activation, and form semantics.
- **AR2 — Replacement boundary.** Replacement content is decorative within the hidden root and MUST NOT be the only semantic expression of the owning control's selected or busy state.

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority                | Hierarchy role       | Component contract |
| ---------------- | ------------------------------------------------------- | --------------------------------------- | -------------------- | ------------------ |
| Chrome           | CheckIndicator intentionally owns no persistent chrome. | observed shipped representation         | not applicable       | FR2, FR5           |
| State mark       | Checked state renders the shared decorative check Icon. | Icon-owned current theming architecture | supporting state cue | FR1, FR5–FR6       |

The shared `Indicator.doc.mjs` lists anatomy and targets for CheckboxIndicator, CheckIndicator, and RadioIndicator together, so this record carries no anatomy-theming map. CheckIndicator owns no persistent chrome and delegates its built-in checked mark to Icon.

## Family and system relationships

- `architecture:component-theming-surface` owns target placement and composed-painter ownership.
- `architecture:public-component-api` owns export, passthrough, styling composition, ref, and compatibility requirements.
- `architecture:component-test-sufficiency` owns the evidence needed for each critical promise and distinct risk partition.

## Verification map

| Contract      | Verification                                                                                           | Representative states                                       | Mutation or failure expectation                                                                                                                                                                                                                                                                                               | Audit section                        |
| ------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| FR1, FR2, FR3 | `Indicator.test.tsx` CheckIndicator state and replacement cases; falsy-children cases                  | Checked, unchecked, empty scalar, visible child, `0`        | Removing the glyph, adding unchecked chrome, or choosing the wrong children branch fails.                                                                                                                                                                                                                                     | `audit:CheckIndicator/behavior`      |
| FR1, AR1      | `Indicator.test.tsx` decorative-contract cases                                                         | Glyph and replacement roots; a caller `aria-hidden={false}` | A root that a caller can expose fails. Evidence gap: no test asserts that replacement content is not the only state expression (AR2).                                                                                                                                                                                         | `audit:CheckIndicator/accessibility` |
| FR4           | `Indicator.test.tsx` "forwards caller props and styling on both render paths"                          | Both render paths                                           | A caller DOM prop that stops reaching either root, or a `className` that stops reaching the replacement span, fails. Evidence gap: no test asserts `className`, `style`, or `xstyle` on the checked-glyph path, `style` or `xstyle` on the replacement span, or the ref on either path (the checked-path ref is the FR4 gap). | `audit:CheckIndicator/api`           |
| FR5, FR6      | `themingTargets.test.ts`                                                                               | Checked glyph                                               | A rendered class absent from the documented targets fails. Evidence gap: no test asserts that no wrapper separates host classes from the Icon painter, or that disabled and replacement colors use semantic tokens.                                                                                                           | `audit:CheckIndicator/theming`       |
| ORD1, PR1     | Covered by the FR1–FR4 rows. Evidence gap: no test asserts the absence of state, effects, or listeners | —                                                           | —                                                                                                                                                                                                                                                                                                                             | `audit:CheckIndicator/behavior`      |

## Current-state impact

- **Checked-path ref (FR4).** The declared ref is `null` when CheckIndicator
  draws its checked glyph, against `architecture:public-component-api` INV8; the
  fix is OQ1.

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Should CheckIndicator preserve its declared `HTMLSpanElement` ref by owning a stable span root in the checked path, or should the public ref contract change to match the Icon-owned painter?** (`human-api`) The current checked path returns `null`; either correction changes a released DOM or ref contract.
- **OQ2 — Should empty React containers continue to suppress the built-in state mark?** (`human-api`) FR3 records that they do today.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Indicator/Indicator.spec.md -->


# Indicator component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. `@astryxdesign/core/Indicator` exports the three built-in indicators (`CheckboxIndicator`, `CheckIndicator`, `RadioIndicator`), the shared indicator props and types, the default registry, and name-based resolution.                                       |
| Behavior                | Hosts draw a decorative control visual by name (`check`, `checkbox`, `radio`). A theme's `indicators` entry for that name replaces it in every host that resolves indicators by name; otherwise the built-in renders. Every indicator is hidden from assistive technology. |
| End-user impact         | People see one consistent mark for a chosen option, a checkbox, or a radio across the components that resolve indicators by name, and screen-reader users hear the host control's semantics, never a duplicate.                                                            |
| Builder impact          | None.                                                                                                                                                                                                                                                                      |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Three hosts render the built-ins directly instead of resolving by name; listed under Current-state impact.                                                                                                       |
| Review checks           | Reject an indicator that is exposed to assistive technology, a theme override that a host resolving by name ignores, a falsy `children` that suppresses the built-in mark, or a role or tab stop on an indicator.                                                          |
| Governing rules         | `architecture:component-theming-surface`; `architecture:public-component-api` INV5; `architecture:theme-authoring-contract`.                                                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

Indicator is the shared, replaceable set of decorative control visuals: the
mark on a chosen option, the box a checkbox draws, and the circle a radio
draws. It owns the indicator names, theme replacement by name, the shared
decorative prop contract, and RadioIndicator. Consumer usage lives in
`Indicator.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; with no theme override, `check`,
  `checkbox`, and `radio` resolve to the built-ins
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: not applicable; hosts supply `state`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The core indicator names and the default registry that maps them to the
  built-ins.
- Theme replacement by name and the shared indicator prop contract.
- RadioIndicator, documented as an inline component of `Indicator.doc.mjs`,
  with the `radio-indicator` and `radio-indicator-dot` targets.
- The `indicatorScope` marker hosts put on the element whose hover drives the
  indicator's hover tint.

**Does not own / non-goals**

- CheckboxIndicator — owned by `component:CheckboxIndicator`.
- CheckIndicator — owned by `component:CheckIndicator`.
- Role, name, state, focus, keyboard, and activation of the host control —
  owned by each host (CheckboxInput, RadioList, Selector, menu rows).
- `useIndicator` and `getIndicator` as API — a public hook and function without
  their own module records; uncontracted beyond the resolution FR2 states.

## Public concepts

| Concept             | Closed values or states                                | Meaning                                           | Availability by variant/orientation/state | Default  | Owner                 | Stability | Invalid-value behavior                                              |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------- | -------- | --------------------- | --------- | ------------------------------------------------------------------- |
| Indicator name      | `check`, `checkbox`, `radio`, plus augmented names     | Which visual a host draws.                        | Always.                                   | —        | `component:Indicator` | Stable    | An augmented name no theme supplies resolves to nothing.            |
| State               | `unchecked`, `checked`, and `indeterminate` (checkbox) | The host's selection state.                       | Per indicator family.                     | required | `component:Indicator` | Stable    | TypeScript rejects values outside the family.                       |
| Size                | `sm`, `md`                                             | Indicator box size.                               | Always.                                   | `md`     | `component:Indicator` | Stable    | TypeScript rejects other values.                                    |
| Replacement content | renderable `children`                                  | Content drawn instead of the built-in state mark. | Always.                                   | none     | `component:Indicator` | Stable    | Nullish, boolean, and empty-string children keep the built-in mark. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| FR1 | The default registry maps exactly `check` → CheckIndicator, `checkbox` → CheckboxIndicator, and `radio` → RadioIndicator.                                                                                                                                                                                                                                                                                                                                                                | Current tests                                           |
| FR2 | A host resolves an indicator by name from the nearest theme: the theme's `indicators` entry for that name wins, otherwise the built-in. One override reaches every host that resolves that name. The Tokenizer bottom sheet renders CheckboxIndicator and RadioIndicator directly, so a theme's `checkbox` or `radio` entry does not reach it. An augmented name resolves only when a theme supplies it.                                                                                 | `architecture:theme-authoring-contract`; current tests  |
| FR3 | Every built-in indicator root sets `aria-hidden="true"` after caller props, so a caller cannot expose it; the public props type rejects `role` and `tabIndex`. Indicators receive `state`, `size`, `isDisabled`, and `children` and nothing that would give them semantics.                                                                                                                                                                                                              | `architecture:public-component-api` INV5; current tests |
| FR4 | Renderable `children` replace the built-in state mark inside the indicator; nullish, boolean, and empty-string children keep it, and `0` counts as content.                                                                                                                                                                                                                                                                                                                              | Current tests                                           |
| FR5 | RadioIndicator renders one circular span (20 or 24 CSS px) whose border and fill follow the state: an emphasized border on the surface when unchecked, an accent fill when checked with an on-accent dot (8 or 10 CSS px) inside. Disabled halves the opacity and mutes the border (and the fill when unchecked). Under a hover-capable pointer, hovering the host's `indicatorScope` tints it. The dot stays visible under forced colors. Transitions are instant under reduced motion. | Current source and tests                                |
| FR6 | RadioIndicator's root carries `astryx-radio-indicator` with `data-size`, `data-checked`, and `data-disabled`; the dot carries `astryx-radio-indicator-dot` with `data-size`. No alias target is emitted. Caller props, `ref`, `className`, `style`, and `xstyle` reach the root.                                                                                                                                                                                                         | `architecture:component-theming-surface`; current tests |

### Allowed variation

- **AV1 — Replacement.** A theme may replace any named indicator with a
  component that honors FR3.
- **AV2 — Theme paint.** Themes may restyle the built-ins through their
  targets without replacing them.

### Representative states

| State             | Required invariant                                    | Allowed variation |
| ----------------- | ----------------------------------------------------- | ----------------- |
| No theme override | Built-ins render for each name.                       | —                 |
| Theme override    | Every host that resolves the name draws the override. | Override design.  |
| Radio checked     | Accent circle with dot; `data-checked`.               | Size.             |
| Falsy children    | Built-in mark still renders.                          | —                 |

### Transformation and precedence order

- **ORD1 — Resolution.** Nearest theme's `indicators[name]`, then the built-in,
  then nothing for an unsupplied augmented name.
- **ORD2 — Attributes.** Caller props, then the indicator's own `aria-hidden`.

### Performance and resources

- **PR1 — Pure render.** Indicators own no state, effect, listener, or
  observer.

## Accessibility contract

- **AR1 — Decorative.** Indicators are hidden from assistive technology; the
  host owns all semantics (FR3).
- **AR2 — Forced colors.** The radio dot stays visible under forced colors.

## Design relationships

| Anatomy or state | Design requirement                                | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Radio circle     | Emphasized border unchecked; accent fill checked. | Current source           | Supporting     | FR5, FR6           |
| Radio dot        | On-accent dot when checked.                       | Current source           | Supporting     | FR5, FR6           |

No design record governs Indicator. The checkbox and check visuals are owned by
their own records.

## Family and system relationships

- `architecture:theme-authoring-contract` owns how a theme supplies
  `indicators`.
- `component:CheckboxIndicator` and `component:CheckIndicator` own the other two
  built-ins.
- CheckboxInput, RadioListItem, Selector, and menu selection rows host
  indicators.

## Verification map

| Contract        | Verification                                                                                               | Representative states                                                                                      | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Audit section                   |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| FR1, FR2        | `indicatorRegistry.test.tsx`; `Indicator.test.tsx` useIndicator suite                                      | No theme; theme override; augmented names                                                                  | A wrong default, an ignored override, or a resolved unsupplied name fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `audit:Indicator/behavior`      |
| FR3             | `Indicator.test.tsx` decorative-contract suite                                                             | Each built-in in the checked state; a caller `aria-hidden={false}`; `role` and `tabIndex` as literal props | An indicator a caller can expose, a dropped ordinary prop, or an accepted literal `role` or `tabIndex` fails. Evidence gap: no test checks `aria-hidden` on the unchecked states.                                                                                                                                                                                                                                                                                                                                                                | `audit:Indicator/accessibility` |
| FR4             | `Indicator.test.tsx` falsy-children suite                                                                  | `null`, `false`, `''`, `0`, real children                                                                  | A falsy child (`false`, `null`, `undefined`, or `''`) that suppresses any built-in's mark fails, and CheckIndicator treating `0` as empty fails. Evidence gap: no test renders `0` as children of CheckboxIndicator or RadioIndicator.                                                                                                                                                                                                                                                                                                           | `audit:Indicator/behavior`      |
| FR5, FR6, AR2   | `Indicator.test.tsx` radio-dot, disabled, and target-name cases                                            | Checked and unchecked; disabled; canonical targets                                                         | A dot when unchecked, no dot when checked, a missing checked `data-checked` or disabled `data-disabled`, or an alias target fails. Evidence gap: no test asserts the radio sizes, the state colors (emphasized border, accent fill, on-accent dot), the instant transitions under reduced motion, the disabled opacity and border, the hover tint, the forced-colors dot (the RadioList forced-colors case passes on any matching rule), radio `data-size` on the root and dot, `ref`, or caller `className`, `style`, and `xstyle` on the root. | `audit:Indicator/theming`       |
| ORD1, ORD2, PR1 | Covered by the FR2 and FR3 rows. Evidence gap: no test asserts the absence of state, effects, or listeners | —                                                                                                          | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `audit:Indicator/behavior`      |

## Current-state impact

- **Direct indicator imports (FR2).** The Tokenizer bottom sheet renders
  CheckboxIndicator and RadioIndicator directly, so a theme's `checkbox` or
  `radio` override does not reach it.

## Decision log

No component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
