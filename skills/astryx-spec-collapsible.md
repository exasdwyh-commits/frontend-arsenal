---
schema_version: 3
template_version: 4
kind: component
id: component:Collapsible
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-07
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, layout, accessibility, theming]
verified_by:
  [
    packages/core/src/Collapsible/Collapsible.test.tsx,
    packages/core/src/Collapsible/CollapsibleGroup.test.tsx,
    packages/core/src/Collapsible/__tests__/Collapsible.a11y.test.tsx,
    packages/core/src/Collapsible/__tests__/Collapsible.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:react-component-runtime,
    architecture:component-theming-surface,
  ]
contributing: [contributing:api-conventions]
system_specs: [spec:AST-002/DEC-1, spec:AST-020, spec:AST-021]
---

# Collapsible component contract

## Intent

Collapsible reveals and hides one content region from one disclosure trigger. Its
chevron communicates the same open state in two intentional layout patterns: a
trailing status indicator or a leading disclosure arrow aligned before a column of
labels.

The public axis is the chevron's logical position. Callers do not provide arbitrary
cue content or replace Collapsible's disclosure rendering.

## Compatibility and migration

- Released default preserved: yes. Omitting the new position keeps the current
  trailing chevron and current no-prop rendering.
- Compatibility class: additive optional public axis with a stable default.
- Controlled/uncontrolled behavior: unchanged.
- Migration decision: `component:Collapsible/DEC-1`.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- the disclosure trigger, its `aria-expanded` / `aria-controls` relationship, and
  the chevron that represents the open state;
- the `start | end` logical chevron-position axis;
- position-specific chevron direction in collapsed and expanded states;
- group default, item override, and nested-item isolation for chevron position; and
- trigger-label layout needed to preserve the position contract.

**Does not own / non-goals**

- caller-provided chevron, cue, icon, or render-function escape hatches;
- TreeList, Table, or another component's disclosure indicator;
- generic icon resolution or artwork customization;
- sibling open-value coordination, group state, and the divided group wrapper
  — owned by `component:CollapsibleGroup`;
- a shared responsive or directional API; or
- new content-reveal motion behavior. Existing behavior outside this decision stays
  unchanged until its own current authority changes it.

## Public concepts

| Concept                | Closed values or states              | Meaning                                                                                                            | Availability                     | Default                                          | Owner                                        | Stability | Invalid-value behavior                    |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------ | -------------------------------------------- | --------- | ----------------------------------------- |
| chevron position       | `start`, `end`                       | logical side of the trigger label that owns Collapsible's disclosure chevron                                       | Collapsible and CollapsibleGroup | `end`                                            | `component:Collapsible`                      | stable    | rejected by the public type               |
| disclosure state       | collapsed, expanded                  | whether the controlled region is hidden or revealed                                                                | every Collapsible                | existing state owner                             | `component:Collapsible` or group state owner | stable    | existing controlled/uncontrolled behavior |
| group position default | absent, `start`, `end`               | common position supplied to direct group items                                                                     | CollapsibleGroup                 | absent, so item default resolves to `end`        | `component:Collapsible`                      | stable    | rejected by the public type               |
| animated layout        | absent, a `useAnimatedLayout` handle | whether opening and closing glide the content after the Collapsible, up to the handle's container (`spec:AST-105`) | every Collapsible                | absent: content after it takes its place at once | `spec:AST-105`                               | stable    | rejected by the public type               |

The public prop is named `chevronPosition`. The exported value type is
`CollapsibleChevronPosition`. `placement`, `side`, and rendering terminology are
not parallel public names for this axis.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| FR1  | Collapsible MUST expose `chevronPosition?: 'start' \| 'end'`; omission resolves to `end`.                                                                                                                                                                                                                                                                                                                                            | owner API decision; preserves released default            |
| FR2  | `end` MUST render Collapsible's chevron after the trigger label in logical order. Collapsed `end` points downward; expanded `end` points upward.                                                                                                                                                                                                                                                                                     | shipped trailing behavior plus approved position contract |
| FR3  | `start` MUST render Collapsible's chevron before the trigger label in logical order. Collapsed `start` points inward toward the label/content, so its inline direction mirrors under RTL; expanded `start` points downward.                                                                                                                                                                                                          | approved leading-disclosure behavior                      |
| FR4  | Position changes the chevron glyph/direction as well as DOM order. Reusing a vertical down chevron and rotating it sideways MUST NOT make collapsed `start` point away from its content.                                                                                                                                                                                                                                             | direction and representation decision                     |
| FR5  | Collapsible owns and renders the chevron for both positions. The position axis MUST NOT accept `none`, arbitrary React content, a cue callback, a renderer, or another replacement escape hatch.                                                                                                                                                                                                                                     | constrained public-axis decision                          |
| FR6  | Trigger-label content MUST retain the usable row width needed by composed labels at either position. Moving the chevron to `start` MUST NOT strand the label at the opposite edge or prevent composed label content from using the remaining row.                                                                                                                                                                                    | approved layout rationale and existing grow behavior      |
| FR7  | CollapsibleGroup MAY provide one `chevronPosition` default to its direct Collapsible items. A direct item's explicit position MUST override the group default.                                                                                                                                                                                                                                                                       | approved group-coherence behavior                         |
| FR8  | A Collapsible nested inside another item's revealed content MUST begin a new presentation scope and use its own explicit position or the component default. The outer group's position MUST NOT leak into the nested disclosure.                                                                                                                                                                                                     | approved nested isolation behavior                        |
| FR9  | Chevron position MUST NOT change disclosure semantics. The same trigger remains a button, retains `aria-expanded`, identifies the controlled region with `aria-controls`, and follows the existing state owner.                                                                                                                                                                                                                      | existing accessibility and behavior contract              |
| FR10 | Collapsible MUST accept `animatedLayout?: AnimatedLayout`. With a handle, opening and closing report the content's size change through it, so the content after the Collapsible glides inside the handle's container, and the revealed content and the chevron move on the same motion (`spec:AST-105` FR1–FR4; `spec:AST-108` FR4a). Without one, opening and closing are unchanged. The prop MUST NOT change disclosure semantics. | `spec:AST-105` FR1, FR2                                   |

### Allowed variation

- **AV1 — Artwork implementation.** The exact internal Icon names and transform
  implementation may change if FR2–FR4 remain visually and directionally true.
- **AV2 — Spacing mechanism.** Margin, gap, or equivalent internal layout may
  separate a leading chevron from its label while preserving FR6.
- **AV3 — Group consistency.** An item may explicitly override its group's
  position. Mixed positions are supported by precedence but should remain an
  intentional exception rather than an accidental row-to-row pattern.
- **AV4 — Existing non-chevron behavior.** Open-state ownership, disabled behavior,
  divider/density presentation, content layout, and reveal motion remain governed
  by their existing authority and are not changed by this decision.
- **AV5 — Internal region element.** The content region always wraps its
  children in one inner element, so an edge reveal or conceal slides them
  under the region's clip (`spec:AST-105` FR9). The element is internal: it is
  not a styling target or a promised structure.

### Representative states

| State                              | Required invariant                                                           | Allowed variation                    |
| ---------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| omitted position, collapsed        | chevron follows label and points down                                        | internal icon implementation         |
| omitted position, expanded         | chevron follows label and points up                                          | internal rotation implementation     |
| `start`, collapsed LTR             | chevron precedes label and points inline-end toward content                  | internal artwork                     |
| `start`, collapsed RTL             | chevron precedes label at logical start and points inline-end toward content | internal artwork/mirroring mechanism |
| `start`, expanded                  | chevron precedes label and points down                                       | internal transition mechanism        |
| group `start`, item omitted        | direct item resolves to `start`                                              | presentation-context implementation  |
| group `start`, item `end`          | direct item resolves to `end`                                                | presentation-context implementation  |
| group `start`, nested item omitted | nested item resolves to component default `end`                              | context-reset implementation         |

### Transformation and precedence order

- **ORD1 — Position precedence.** Item `chevronPosition` → direct surrounding
  CollapsibleGroup `chevronPosition` → component default `end`.
- **ORD2 — Direction resolution.** Resolve position and open state first; apply
  document direction to `start`'s inward inline direction. `end` remains a vertical
  down/up indicator and does not mirror into a horizontal cue.

## Accessibility contract

- **AR1 — Disclosure semantics stay primary.** The trigger MUST expose its expanded
  state and controlled-region relationship independently of the chevron artwork.
- **AR2 — Position is visual order, not reading duplication.** Moving the decorative
  chevron MUST NOT duplicate the accessible name or add a second focus target.
- **AR3 — Direction remains understandable.** The collapsed leading cue MUST point
  toward the content in both LTR and RTL; it MUST NOT retain an LTR physical
  direction under RTL.
- **AR4 — Focus leaves closing content.** When the Collapsible closes while
  focus is inside its content, however it closes (an owner-set `isOpen`, a
  group's value), focus moves to its trigger, including while the content
  plays its exit (FR10). Focus anywhere else is not moved (WCAG 2.2 SC
  2.4.3).

## Design relationships

The two positions express established disclosure patterns:

- `end` is a trailing status indicator: down when collapsed, up when expanded;
- `start` is a leading tree/file-browser disclosure arrow: inward when collapsed,
  down when expanded.

This contract chooses those relationships but does not expose arbitrary icon or cue
selection. Themes may style the owning Collapsible target without changing the
semantic direction or position states.

## Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "collapsible"},
  "Trigger": {"target": "collapsible-trigger"},
  "Chevron": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Content": {"target": "collapsible-content"},
  "Group container": {"target": "collapsible-group"}
}
```

The container owns divided-row chrome, while the trigger and content own their
independent paint and open-state selector surfaces. The chevron keeps Icon's
target; Collapsible owns its semantic position and direction. CollapsibleGroup is
an aggregate subcomponent of this contract, so its conditional wrapper target maps
to the Group container anatomy here.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, target
  placement, visual-axis and state reflection, and delegated Icon ownership.
- The public `useCollapsible` hook retains its existing state behavior and consumer
  documentation. This component owns the rendered trigger, chevron, and aggregate
  component/group protocol.
- `architecture:public-component-api` owns reachability and compatibility of the
  admitted position prop and exported type.
- `architecture:react-component-runtime` owns context identity/lifecycle; this
  record owns the presentation value and nested-scope outcome.
- `spec:AST-002/DEC-1` admits this axis because otherwise-identical disclosure
  layouts require caller-owned leading versus trailing patterns. It does not admit
  custom cue rendering.

## Verification map

| Contract           | Verification                                                                                                                                                                                                                                                                                                                                                            | Representative states                                                                                                | Mutation or failure expectation                                                                                                                                                                    | Audit section                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1–FR5            | Collapsible prop/type, DOM-order, glyph/direction, and no-extra-values tests                                                                                                                                                                                                                                                                                            | omitted/end/start; collapsed/expanded; LTR/RTL                                                                       | default changes, `start` follows the label, collapsed leading cue points outward, or an unsupported cue value is admitted                                                                          | audit:Collapsible/public-api      |
| FR6                | composed trigger layout and geometry tests                                                                                                                                                                                                                                                                                                                              | plain text; composed label with trailing content; start/end                                                          | label becomes shrink-wrapped/stranded or composed content cannot use remaining row                                                                                                                 | audit:Collapsible/layout          |
| FR7–FR8, ORD1      | group inheritance, item override, and nested reset tests                                                                                                                                                                                                                                                                                                                | group start/end; item override; nested omission                                                                      | group value is ignored, item cannot override, or position leaks into nested content                                                                                                                | audit:Collapsible/behavior        |
| FR9, AR1–AR3, ORD2 | disclosure semantics via `DISCLOSURE_PATTERN`, plus component-owned chevron and real RTL rendering                                                                                                                                                                                                                                                                      | collapsed/expanded; controlled/uncontrolled; enabled/disabled; start/end; LTR/RTL                                    | position changes state behavior, the trigger loses its controlled-content relationship, content visibility diverges from state, accessible output duplicates, or leading direction fails to mirror | audit:Collapsible/accessibility   |
| FR10               | `animatedLayoutAdopters.test.tsx` (with and without a handle; an owner-set `isOpen` and a group's controlled value glide; one measurement in StrictMode and none for a refused change; the exit kept inert until it ends) and `animatedLayoutAdopters.interaction.browser.spec.ts` (the `Core/Animated layout` story through a ScrollableArea ref, opening and closing) | no handle; a handle; click, owner-set, and group-driven changes; opening and closing                                 | the content after it jumps with a handle, an owner-set change lands at once, closing content vanishes before its exit or stays reachable during it, or anything changes without a handle           | audit:Collapsible/behavior        |
| AR4                | `Collapsible.test.tsx` close-focus suite; `animatedLayoutAdopters.test.tsx` close with focus inside during the exit; `CollapsibleCloseFocus.a11y.chromium.spec.ts`                                                                                                                                                                                                      | Focus inside the content, owner-set close, with and without a handle; focus outside; the trigger closing it; opening | Focus left inside the hidden or inert content, on the page body, or moved when it was not inside the content fails.                                                                                | `audit:Collapsible/accessibility` |
| Theming anatomy    | focused target-reflection assertions plus `themingTargets.test.ts`                                                                                                                                                                                                                                                                                                      | standalone/grouped; open/closed; enabled/disabled; start/end; divided/density                                        | a style-driving axis or state disappears from its owning target, a target loses its anatomy owner, or the chevron stops delegating to Icon                                                         | audit:Collapsible/theming         |

## Decision log

### DEC-1 — Chevron position is the public axis

**Reference:** `component:Collapsible/DEC-1`
**Decider:** `cixzhang`, `2026-09-07`

Callers may choose the logical chevron position `start` or `end`. Collapsible owns
the cue and derives its position-specific glyph and direction. `start` exists for
leading disclosure patterns such as tree/file-browser rows; `end` preserves the
released trailing indicator.

Rejected: `chevronPlacement`, `none`, `hasChevron`, caller-provided cue content, and
rendering callbacks. Those surfaces expose rendering machinery or permit the
component's disclosure affordance to disappear rather than expressing the approved
caller-owned layout distinction.

### DEC-2 — Group defaults do not leak through content

**Reference:** `component:Collapsible/DEC-2`
**Decider:** `cixzhang`, `2026-09-07`

A CollapsibleGroup may provide position to its direct items, and an item may
override it. A Collapsible nested inside an item's body starts a new presentation
scope so an outer list's visual convention does not silently alter an independent
disclosure.

## Open questions

None.

## Content boundary

This file owns Collapsible's durable semantic concepts, chevron-position behavior,
precedence, and evidence. Consumer prop tables/examples remain in
`Collapsible.doc.mjs` and `CollapsibleGroup.doc.mjs`. Exact Icon names, transforms,
StyleX declarations, context fields, implementation plans, audit results, and pull-
request verdicts do not belong here.

---

<!-- source: docs/specs/components/Collapsible/CollapsibleGroup.spec.md -->


# CollapsibleGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CollapsibleGroup` coordinates public `Collapsible` children in `single` or `multiple` mode, supports controlled and uncontrolled values, and optionally supplies divider, density, and chevron-position presentation defaults. |
| Behavior                | Direct children with a `value` read group state; opening an item replaces or extends the open-value set according to mode. The group renders no wrapper unless divider chrome is enabled.                                       |
| End-user impact         | People can reveal one section or several sections without disclosure state drifting between sibling rows; divided groups keep one coherent visual and directional treatment.                                                    |
| Builder impact          | Builders choose state ownership and selection mode, give participating items stable values, and may opt into divided-row presentation.                                                                                          |
| Compatibility/readiness | Records shipped behavior; no public change. Three implementation gaps, listed under Current-state impact.                                                                                                                       |
| Review checks           | Reject lost single/multiple coordination, controlled state that mutates internally, uncontrolled state that stops updating, presentation leakage into nested disclosures, or a wrapper appearing when dividers are absent.      |
| Governing rules         | `component:Collapsible/FR7–FR9,DEC-2`; `architecture:public-component-api/INV1,INV5–INV9`; `architecture:react-component-runtime/INV1,INV8–INV9`; `architecture:component-theming-surface/INV3–INV7`.                           |

This table is a review projection; the body below is authoritative.

## Intent

Coordinate a set of disclosure items so their open state follows one group owner while each `Collapsible` continues to own its trigger, region, and disclosure semantics.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A disabled header leaves the Tab order.** A disabled direct item's header
  carries `aria-disabled` but drops out of the Tab order, so a keyboard user
  cannot reach it to learn why it is unavailable. `spec:AST-085` FR1 keeps a
  disabled control focusable; the header is owned by `component:Collapsible`.
- **Equal values can rebuild the coordination context.** An equal new
  controlled array, or a new `onChange` such as an inline handler, rebuilds the
  coordination context on every parent render, so memoized direct items
  re-render. `architecture:react-component-runtime` INV9 keeps an unchanged
  payload from broadcasting a new identity (FR7).
- **The accordion binding runs adopted rows as advisory.** The binding runs
  the header-to-header Tab step, single-mode sibling collapse, and no
  arrow-key movement as advisory rows, so
  a regression there does not fail the binding lane. `spec:AST-020` FR9 makes
  an adopted expectation required once this record adopts it (AR4).

## Ownership boundary

**Owns**

- sibling open-value coordination in single and multiple modes;
- controlled and uncontrolled group state ownership and the shape delivered to `onChange`;
- the optional divided-row wrapper, density default, and group presentation context; and
- direct-item defaults for density and chevron position.

**Does not own / non-goals**

- disclosure trigger, region, chevron artwork, semantics, or nested presentation reset — owned by `component:Collapsible`;
- caller content, item labels, or the meaning and uniqueness of caller-supplied values — owned by the product callsite; or
- arbitrary selection models beyond the released single and multiple modes.

## Public concepts

| Concept              | Closed values or states                     | Meaning                                                                     | Availability          | Default                        | Owner                        | Stability | Invalid-value behavior      |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------- | --------------------- | ------------------------------ | ---------------------------- | --------- | --------------------------- |
| coordination mode    | `single`, `multiple`                        | Replaces the open set or toggles one member within it.                      | Every group.          | `single`                       | `component:CollapsibleGroup` | stable    | rejected by the public type |
| state ownership      | uncontrolled, controlled                    | Internal state starts from `defaultValue`, or `value` remains caller-owned. | Every group.          | uncontrolled                   | `component:CollapsibleGroup` | stable    | ordinary React semantics    |
| divided presentation | absent, present                             | Adds one wrapper and asks direct items to draw row dividers.                | Every group.          | absent                         | `component:CollapsibleGroup` | stable    | rejected by the public type |
| row density          | unpadded, `compact`, `balanced`, `spacious` | Supplies direct-item block padding; divided groups fall back to balanced.   | Direct grouped items. | unpadded; balanced if divided  | `component:CollapsibleGroup` | stable    | rejected by the public type |
| chevron default      | absent, `start`, `end`                      | Supplies the position default owned by `component:Collapsible`.             | Direct grouped items. | absent; item resolves to `end` | `component:Collapsible`      | stable    | rejected by the public type |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FR1 | In `single` mode, toggling a closed direct item MUST replace the open-value set with that item, and toggling the open item MUST clear the set.                                                                                                                                                                                                                                                                            | shipped source, consumer docs, and focused interaction tests                                      |
| FR2 | In `multiple` mode, toggling a direct item MUST add or remove only that value while preserving the state of other values.                                                                                                                                                                                                                                                                                                 | shipped source, consumer docs, and focused interaction tests                                      |
| FR3 | Supplying `value` MUST keep state caller-owned and report requested changes through `onChange`; omitting it MUST keep state internal after initialization from `defaultValue`.                                                                                                                                                                                                                                            | `architecture:react-component-runtime/INV1,INV8`; shipped controlled and uncontrolled tests       |
| FR4 | A direct `Collapsible` with a `value` MUST use group coordination; an item without a value MUST retain standalone ownership.                                                                                                                                                                                                                                                                                              | shipped hook behavior and focused group/standalone tests                                          |
| FR5 | With `hasDividers=false`, the group MUST add no DOM wrapper. With dividers enabled it MUST render one wrapper that receives documented root props and the `collapsible-group` target.                                                                                                                                                                                                                                     | `architecture:public-component-api/INV5–INV8`; `architecture:component-theming-surface/INV3–INV7` |
| FR6 | Density, divider, and chevron defaults MUST reach direct items without leaking through a direct item's revealed content into nested independent disclosures.                                                                                                                                                                                                                                                              | `component:Collapsible/FR7–FR8,DEC-2`; focused nesting tests                                      |
| FR7 | Presentation context identity MUST remain stable while divider, density, and chevron inputs are unchanged; coordination identity MUST stay stable across a rerender with an unchanged controlled string, the same controlled array reference, or unchanged internal state, with the same `type` and `onChange`. Implementation gap: an equal new controlled array or a new `onChange` rebuilds it (Current-state impact). | `architecture:react-component-runtime/INV9`; memoized source and interaction tests                |

### Allowed variation

- **AV1 — Internal state representation.** The group may represent open values with arrays or another private structure while preserving FR1–FR4 and callback output.
- **AV2 — Wrapper implementation.** Divider mode may change internal layout technique while retaining one painting wrapper, the public target, root-prop reachability, and direct-item results.
- **AV3 — Item composition.** Callers may place direct Collapsible items beside non-participating content; only valued Collapsible children join coordination.

### Representative states

| State                              | Required invariant                                                            | Allowed variation             |
| ---------------------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| single, uncontrolled               | One valued item or none is open and internal state updates after each toggle. | Item labels and content.      |
| multiple, uncontrolled             | Any number of valued items may remain open.                                   | Item order and content.       |
| controlled                         | Rendered state follows `value`; `onChange` reports requested next state.      | Parent update timing.         |
| divided, density omitted           | One wrapper paints the group target and direct items use balanced density.    | Theme paint.                  |
| plain, density omitted             | No wrapper appears and direct items remain unpadded.                          | Surrounding caller layout.    |
| group position with nested content | Direct items inherit the group position; nested disclosures reset it.         | Item-level explicit override. |

### Transformation and precedence order

- **ORD1 — State ownership.** Controlled `value` when present → internal value initialized from `defaultValue` otherwise → mode-specific toggle → callback in the mode's documented output shape.
- **ORD2 — Density.** Explicit group density → `balanced` when dividers are enabled → no group density.
- **ORD3 — Chevron position.** Explicit item position → direct group position → Collapsible default `end`, as owned by `component:Collapsible/ORD1`.

### Performance and resources

- **PR1 — Render-owned coordination.** The group derives output from props, state, and context and owns no Effect, listener, observer, timer, request, subscription, or imperative browser resource.
- **PR2 — Stable broadcasts.** Memoized context values keep the identities FR7 names stable for direct consumers.

## Accessibility contract

- **AR1 — Child semantics remain primary.** Group coordination MUST preserve each Collapsible button's accessible name, `aria-expanded`, `aria-controls`, controlled region, and keyboard activation.
- **AR2 — Presentation adds no competing interaction.** The divider wrapper MUST NOT add a role, focus target, accessible name, or keyboard behavior.
- **AR3 — Direction stays with Collapsible.** Group chevron defaults MUST preserve `component:Collapsible/AR1–AR3`, including the inward leading cue under LTR and RTL.
- **AR4 — The group adopts the APG Accordion pattern's required parts** (`spec:AST-020/FR15`): each direct item's header is a `button` whose accessible name is the item's title, with `aria-expanded` reflecting its panel, `aria-controls` naming the panel it reveals, and `aria-disabled` when it cannot be toggled; every enabled header sits in the page Tab order and Enter or Space toggles its panel, in `single` mode collapsing the sibling that was open; a disabled header carries `aria-disabled` and cannot be toggled, apart from the Tab-order gap (Current-state impact). Not adopted: a heading element around each header (this record requires none; the caller's document structure supplies headings), the optional `region` role on panels, and arrow-key or Home/End movement between headers — the group is a set of independent disclosures, not one composite control.

## Design relationships

| Anatomy or state | Design requirement                                                        | Representation authority        | Hierarchy role      | Component contract |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------- | ------------------- | ------------------ |
| Group container  | Optional divider chrome visually associates sibling disclosures as a set. | observed shipped representation | aggregate container | FR5–FR6, AR2       |
| Direct item      | Density and chevron defaults remain consistent across sibling rows.       | `component:Collapsible/FR7–FR8` | disclosure row      | FR6, AR3           |

No current design record prescribes exact CollapsibleGroup pixels. This record covers the shipped divided and plain relationships without deciding new visual direction.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "collapsible"},
  "Trigger": {"target": "collapsible-trigger"},
  "Chevron": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Content": {"target": "collapsible-content"},
  "Group container": {"target": "collapsible-group"}
}
```

The Group container is CollapsibleGroup's conditional aggregate wrapper. The other anatomy rows remain owned by `component:Collapsible`; they are repeated in this subcomponent map only because the released consumer anatomy and target inventory are shared. Trigger, content, chevron, open state, disabled state, density padding, and per-item dividers remain with Collapsible's contract.

## Family and system relationships

- `component:Collapsible` owns direct-item disclosure semantics, chevron representation, item-level theming anatomy, and nested presentation reset.
- `architecture:public-component-api` owns export reachability, documented root-prop behavior, controlled API stability, styling composition, and conditional ref reachability.
- `architecture:react-component-runtime` owns render-derived state, stable context broadcast identity, and controlled-state ownership boundaries.
- `architecture:component-theming-surface` owns target qualification, target placement, visual-axis reflection, and delegated item ownership.
- `architecture:component-test-sufficiency` owns the rational evidence set across state coordination, browser accessibility, direction, and rendered presentation.

## Verification map

| Contract               | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Representative states                                                                            | Mutation or failure expectation                                                                                                                 | Audit section                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1–FR4, ORD1          | `CollapsibleGroup.test.tsx`; `useCollapsible.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | single/multiple; controlled/uncontrolled; valued/unvalued                                        | A sibling stays open in single mode, closes in multiple mode, controlled state mutates internally, or an unvalued item loses local state.       | `audit:CollapsibleGroup/behavior`      |
| FR5–FR6, ORD2–ORD3     | `CollapsibleGroup.test.tsx`; `Collapsible.test.tsx`; `themingTargets.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | plain/divided; each density; group/item/nested position                                          | Wrapper/target reachability changes, defaults stop reaching direct items, or presentation leaks into nested content.                            | `audit:CollapsibleGroup/theming`       |
| AR4                    | `Collapsible.test.tsx` (disabled trigger: `aria-disabled` and no toggle; its out-of-Tab-order assertion pins the gap, pending conformance); `CollapsibleGroup.test.tsx` (single/multiple coordination, `aria-expanded`, Enter activation); `Collapsible.a11y.test.tsx` and `Collapsible.a11y.chromium.spec.ts` (disclosure semantics, Space, Tab reachability for a lone item); `CollapsibleGroup.a11y.test.tsx` and `CollapsibleGroupAccordion.a11y.chromium.spec.ts` (Space on grouped headers; the header-to-header Tab step, single-mode sibling collapse, and no arrow-key movement run as advisory rows) | single/multiple; open/closed; a disabled item, open or closed; Tab order; Enter/Space round trip | A header loses its button role, name, `aria-expanded`, or `aria-controls`; Enter or Space stops toggling; arrow keys move focus between headers | `audit:CollapsibleGroup/accessibility` |
| AR1–AR3                | DOM and Chromium accessibility suites; component-owned Storybook fixture; RTL audit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | open/closed; single/multiple; leading/trailing; LTR/RTL                                          | Disclosure semantics diverge from state, the wrapper becomes interactive, or leading direction stops mirroring.                                 | `audit:CollapsibleGroup/accessibility` |
| PR1–PR2, FR7           | source review plus context and interaction tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | unchanged and changed state/presentation inputs                                                  | An Effect/resource appears, unchanged payload broadcasts a new identity, or changed group behavior fails to reach consumers.                    | `audit:CollapsibleGroup/code-health`   |
| Consumer documentation | CLI component projection, docs checks, and `CollapsibleGroup.stories.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | every public concept and representative composition                                              | A released prop/default is undiscoverable or the owned browser route loses representative state coverage.                                       | `audit:CollapsibleGroup/docs`          |

Read from source, with no focused test yet:

- AR4: no Home/End movement between headers.
- FR7: presentation context identity staying stable while divider, density,
  and chevron inputs are unchanged, and coordination identity across the same
  array reference, unchanged internal state, and an equal new array; only the
  controlled-string case is tested.
- PR1: the group owning no Effect or browser resource.

## Decision log

### DEC-1 — Adopt Accordion's required parts; keep the headers independent

**Reference:** `component:CollapsibleGroup/DEC-1`
**Decider:** `cixzhang`, `2026-10-13`

The group's headers already play the accordion header's role, so they carry its name, state, relationship, and Enter/Space activation (AR4). They stay in the page Tab order without arrow-key or Home/End movement because the group coordinates independent disclosures rather than acting as one composite control; a heading wrapper is left to the caller's document structure.

Rejected: arrow-key movement between headers; a required heading element around each header.

## Open questions

None. This record does not broaden the released coordination modes or decide new presentation.

## Content boundary

This file does not duplicate consumer prop tables, examples, current audit scores, implementation steps, or Collapsible's disclosure and chevron rules. It links to their owners.
