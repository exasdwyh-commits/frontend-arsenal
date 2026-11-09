---
schema_version: 3
template_version: 7
kind: component
id: component:Layout
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-30
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Layout/Layout.test.tsx,
    packages/core/src/Layout/LayoutSlots.test.tsx,
    packages/core/src/Layout/__tests__/childrenAsContent.test.tsx,
    packages/core/src/Layout/__tests__/contentWidth.test.tsx,
    packages/core/src/Layout/__tests__/LayoutContentWidthDefault.a11y.chromium.spec.ts,
    packages/core/src/Layout/__tests__/nestedPadding.test.tsx,
    packages/core/src/Layout/__tests__/LayoutAudit.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    .github/visual-baseline/manifest.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:layout-regions]
design_specs: []
architecture:
  [
    architecture:container-padding,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-038]
---

# Layout component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Five ReactNode slots (`header`, `start`, `content`, `end`, `footer`), `children` as content shorthand, `height`, `padding`, `contentWidth`, `defaultHasDividers`. |
| Behavior                | Layout arranges caller content in five named slots, fills or grows with its container, and sets the inset and content width its region components use.            |
| End-user impact         | People see headers, side panels, content, and footers in stable positions that mirror in right-to-left, with content aligned to one readable width.               |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                      |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. No implementation gap is open (Current-state impact).                                  |
| Review checks           | Reject a target added to arbitrary slot content, an inherited parent Layout padding, a content scrollbar moved off the open edge, or overridable `data-height`.   |
| Governing rules         | `family:layout-regions` FR1–FR12; `architecture:container-padding`; `architecture:component-theming-surface`; `architecture:public-component-api` INV5–INV8.      |

This table is a review projection; the body below is authoritative.

## Intent

Layout is a general layout primitive that arranges five optional named slots —
header, logical-start panel, content, logical-end panel, and footer — within a
page or a bounded container. AppShell owns the page shell.

Consumer syntax and examples belong in `Layout.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — `height="fill"`, no padding override,
  no content width, divider defaults inherited.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

None. A slot whose value is `false`, `true`, or `''` (such as
`isOpen && <LayoutHeader />` while `isOpen` is false) counts as absent, so
its neighbours take the outer inset on that side, and with `contentWidth` a
closed start or end slot gives the same FR6 composition as an omitted one
(FR1).

## Ownership boundary

**Owns**

- The Layout container, its `layout` target, and the five slot positions.
- Height, the Layout-edge inset, content width, and the header and footer
  divider default that its region components read.
- The aggregate consumer document and theming map for the `layout`,
  `layout-header`, `layout-panel`, `layout-content`, and `layout-footer`
  targets.

**Does not own / non-goals**

- The page shell, app-wide navigation, responsive shell substitution, skip
  link, or main landmark — owned by AppShell.
- Product meaning or content in any slot — owned by the caller.
- Region semantics, scrolling, insets, and dividers — owned by
  `component:LayoutHeader`, `component:LayoutContent`,
  `component:LayoutFooter`, and `component:LayoutPanel`.
- Resize interaction — owned by useResizable and ResizeHandle.

## Public concepts

| Concept           | Closed values or states                       | Meaning                                                                 | Availability by variant/orientation/state | Default             | Owner              | Stability | Invalid-value behavior              |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- | ------------------- | ------------------ | --------- | ----------------------------------- |
| Slot topology     | `header`, `start`, `content`, `end`, `footer` | Positions caller content; an omitted slot renders nothing.              | Always                                    | all omitted         | `component:Layout` | Stable    | —                                   |
| Content shorthand | `children`                                    | Fills the content slot when `content` is omitted.                       | Always                                    | omitted             | `component:Layout` | Stable    | `content` wins when both are given. |
| Height            | `fill`, `auto`                                | Fill the container, or grow with content.                               | Always                                    | `fill`              | `component:Layout` | Stable    | Closed union; rejected by types.    |
| Layout-edge inset | spacing step; `0`                             | The inset regions apply at the Layout's outer edges; `0` is full bleed. | Always                                    | inherited or step 4 | `component:Layout` | Stable    | Closed union; rejected by types.    |
| Content width     | number (px); CSS length string                | Width of the aligned content in every slot.                             | Always                                    | none                | `component:Layout` | Stable    | —                                   |
| Divider default   | `true`, `false`, unset                        | Divider default for LayoutHeader and LayoutFooter children.             | Always                                    | inherited           | `component:Layout` | Stable    | —                                   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| FR1 | Layout renders an outer `div` carrying the `layout` target, which reflects `height`, around an inner vertical stack: the header slot, a middle row holding the start slot, the content slot, and the end slot, then the footer slot. An omitted header, start, end, or footer slot renders nothing; a slot whose value is not renderable (`null`, `undefined`, a boolean, or `''`) is absent, so the neighbouring regions take the outer inset on that side (`family:layout-regions` FR3), while an element, fragment, or array counts as present even when it renders nothing; the middle row and the content slot's fill wrapper always render. `content` fills the content slot, and `children` fill it when `content` is omitted. Slot position adds no element, region component, or target to the caller's content. | Current source, docs, and tests; `family:layout-regions` FR1, FR3                              |
| FR2 | The outer `div` escapes the parent's published container padding on all four edges, and the inner stack publishes zero container padding before its regions publish their own. `fill` (the default) makes the Layout fill its container's height, including the escaped block padding; `auto` lets it grow with content, at least as tall as its container.                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current source and tests; `architecture:container-padding`                                     |
| FR3 | `padding` sets the inset that this Layout's own region components apply at its outer edges; `0` is full bleed. A nested Layout does not inherit a parent Layout's padding: without its own `padding`, its regions use the nearest padding container's padding (Card, Section, Dialog, Drawer, or BottomSheet), or spacing step 4. How each region applies and publishes that inset is owned by its record (`component:LayoutHeader`, `component:LayoutContent`, `component:LayoutFooter`, `component:LayoutPanel`).                                                                                                                                                                                                                                                                                                       | Current source, docs, and tests; `family:layout-regions` FR4; `architecture:container-padding` |
| FR4 | When the caller supplies LayoutHeader, LayoutContent, LayoutFooter, or LayoutPanel, that component carries its own `layout-header`, `layout-content`, `layout-footer`, or `layout-panel` target. LayoutPanel at logical start, end, or both is one Panel part and one `layout-panel` target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source, docs, and tests; `family:layout-regions` FR11                                  |
| FR5 | `defaultHasDividers` sets the divider default for LayoutHeader and LayoutFooter descendants; an explicit `hasDivider` wins, and when unset a nested Layout keeps its parent's default within the same layer; the default stops at a Dialog, Drawer, BottomSheet, or other layer boundary (`spec:AST-038` FR7), and at an AppShell root (`component:AppShell` FR18). LayoutPanel does not read the default (`component:LayoutPanel` FR4).                                                                                                                                                                                                                                                                                                                                                                                  | Current source, docs, and tests                                                                |
| FR6 | With `contentWidth` and no panels, LayoutContent spans the middle area and aligns its direct children to the content width, so its scrollbar stays at the outer edge. With exactly one panel, the panel stays aligned while LayoutContent extends through the opposite open side; start and end mirror. With both panels, or a percentage (including percentage-bearing CSS math), intrinsic, or bare-variable width, the whole middle composition stays constrained; a length-valued variable uses `calc(var(...))`. Numbers are pixels. A nested Layout without `contentWidth` does not inherit its parent's.                                                                                                                                                                                                           | Current source, docs, and tests; `family:layout-regions` FR12                                  |
| FR7 | `ref`, DOM, data, ARIA, and event props, `xstyle`, `className`, and `style` reach or compose on the outer `div`; the reflected `data-height` replaces a caller's value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests; `architecture:public-component-api` INV5–INV8                        |
| FR8 | Layout owns the layout reset: one internal export, `layoutReset` (Core's `overlayPaddingReset` plus the values it leaves out), stops at the element it is applied to every layout custom property Layout, its region components, Section, and the container styles publish to descendants. It sets the published container padding to `0px` and the Layout insets and widths, flush values, Section padding propagation, and the container height cap to `initial`. A layout root applies it (`component:AppShell` FR18). It is internal, not theme API or a package export (`architecture:container-padding` INV1, `architecture:public-component-api` INV12). A surface outside Core that needs the same boundary keeps a mirror of its list under a parity test against it.                                            | `component:AppShell` FR18; `architecture:container-padding`                                    |

### Allowed variation

- **AV1 — Slot presence and content.** Any slot may be present or absent and
  hold any ReactNode; content does not become Layout anatomy by position.
- **AV2 — Region composition.** Callers choose which region components to
  supply; Layout does not insert them.

### Representative states

| State                  | Required invariant                                                                             | Allowed variation              |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------ |
| Arbitrary content only | `layout` target on the root; slot content gains no target.                                     | Content and height.            |
| Composed regions       | Each supplied region carries its own target.                                                   | Which regions are supplied.    |
| One panel              | The panel aligns to the content width; content extends to the open side.                       | Start or end; mirrored in RTL. |
| Two panels             | The whole middle composition is constrained to the content width.                              | Panel widths.                  |
| Nested Layout          | No inherited Layout padding or content width; divider default inherited within the same layer. | Its own explicit values.       |

### Transformation and precedence order

- **ORD1 — Content slot.** `content` → `children`.
- **ORD2 — Inset.** This Layout's `padding` → the enclosing Card, Section,
  Dialog, Drawer, or BottomSheet padding → spacing step 4; a parent Layout's padding never applies.
- **ORD3 — Divider default.** A region's `hasDivider` → the nearest
  `defaultHasDividers` in the same layer → no divider.

### Performance and resources

- **PR1 — No external lifecycle.** Layout adds no listener, observer, timer,
  or measurement; content-width alignment is CSS-only.

## Accessibility contract

- **AR1 — No inferred landmarks.** Layout adds no role or name; landmark
  semantics come only from a region component's caller-supplied `role` and
  `label` (`family:layout-regions` FR8).
- **AR2 — Logical order.** Slots render in DOM order header, start, content,
  end, footer, and start and end follow writing direction
  (`family:layout-regions` FR2).

## Design relationships

| Anatomy or state | Design requirement                                     | Representation authority     | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------ | ---------------------------- | -------------- | ------------------ |
| Layout container | Places caller content in five named slots.             | Current source, docs, family | Supporting     | FR1, FR2           |
| Header           | An optional caller-supplied LayoutHeader.              | Current source, docs, family | Supporting     | FR4, FR5           |
| Panel            | A caller-supplied LayoutPanel at logical start or end. | Current source, docs, family | Supporting     | FR4, FR5           |
| Content area     | An optional caller-supplied LayoutContent.             | Current source, docs, family | Prominent      | FR4, FR6           |
| Footer           | An optional caller-supplied LayoutFooter.              | Current source, docs, family | Supporting     | FR4, FR5           |

Slot position is topology, not anatomy.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Layout container": {"target": "layout"},
  "Header": {"target": "layout-header"},
  "Panel": {"target": "layout-panel"},
  "Content area": {"target": "layout-content"},
  "Footer": {"target": "layout-footer"}
}
```

Panel stands for every LayoutPanel, at logical start, end, or both.

## Family and system relationships

- `family:layout-regions` owns region topology, logical direction, boundaries,
  scrolling, landmarks, and content-width scrollbar placement; FR1–FR6 and
  AR1–AR2 apply it.
- `architecture:container-padding` owns publication and escape of container
  inset; FR2 and FR3 apply it.
- `component:LayoutHeader`, `component:LayoutContent`, `component:LayoutFooter`,
  and `component:LayoutPanel` own each region's behavior, including the
  publication gap LayoutPanel records.
- `architecture:component-theming-surface` owns anatomy and target mapping.
- `architecture:public-component-api` owns caller-input routing; FR7 applies
  it.

## Verification map

| Contract            | Verification                                                                                                                                                                                                                                                                                        | Representative states                                                                                            | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                         | Audit section                |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, ORD1, AV1      | `Layout.test.tsx` slot and content tests, including `reports a slot that renders nothing as empty`; `childrenAsContent.test.tsx`; `LayoutAudit.a11y.chromium.spec.ts` `closed-regions` receipts                                                                                                     | Every slot; omitted slots; `false`, `true`, and `''` slots; `content` and `children`                             | A missing slot, `children` beating `content`, or a `false`, `true`, or `''` slot reported as filled fails. Gap: the omitted-slot test checks only the content text, so a wrapper rendered for an omitted slot passes, and no test asserts that slot content gains no target or element. The closed-region geometry has audit receipts only: the browser spec runs only for a Layout audit pull request. | `audit:Layout/anatomy`       |
| FR2                 | `Layout.test.tsx` height-reflection tests; `LayoutAudit.a11y.chromium.spec.ts` escape-margin and zero-publication receipts                                                                                                                                                                          | `fill`, `auto`                                                                                                   | A lost `data-height` reflection fails. Gap: no always-run check covers the escape margins, the zero publication, or the fill and auto heights; the browser spec that measures the margins and the publication runs only for a Layout audit pull request, so they have audit receipts only.                                                                                                              | `audit:Layout/layout`        |
| FR3, ORD2           | `nestedPadding.test.tsx`                                                                                                                                                                                                                                                                            | Inside AppShell, Card, Section; nested full-bleed and padded Layouts; explicit nested padding                    | A nested Layout inheriting a parent Layout's padding, or losing the enclosing Card or Section padding or the default inset, fails. Gap: `Layout.test.tsx` padding tests assert only that rendering succeeds.                                                                                                                                                                                            | `audit:Layout/layout`        |
| FR4                 | `LayoutSlots.test.tsx` class tests; `themingTargets.test.ts`                                                                                                                                                                                                                                        | Each region component; start and end panels                                                                      | A lost region target fails.                                                                                                                                                                                                                                                                                                                                                                             | `audit:Layout/theming`       |
| FR5, ORD3           | `Layout.test.tsx` divider-default tests, including `a nested Layout without defaultHasDividers keeps its parent default` and `stops the default at a layer boundary`                                                                                                                                | Default true; unset; explicit `false`; nested Layout; inside a Dialog                                            | A header or footer that ignores the default, an explicit `hasDivider={false}` that loses, a nested Layout that loses its parent's default, or a default that crosses a layer boundary fails.                                                                                                                                                                                                            | `audit:Layout/layout`        |
| FR6                 | `contentWidth.test.tsx`; stable visual baseline `core-layout--content-width-scrollbar-placement`; `LayoutContentWidthDefault.a11y.chromium.spec.ts`, which fails when a Layout with no `contentWidth` caps its header or footer below the frame's width in a frame wider than the viewport          | No panels, start only, end only, both; zero padding; nested; no content width in a frame wider than the viewport | A no-panel content region that is not full width, a both-panel middle that is not constrained, or a nested Layout inheriting content width fails; a scrollbar moved off its content edge comes back changed for review. A closed start or end slot has audit receipts only (`LayoutAudit.a11y.chromium.spec.ts` `closed-regions`, run only for a Layout audit pull request).                            | `audit:Layout/layout`        |
| FR7                 | `Layout.test.tsx` ref, className, style, passthrough, event-handler, and owned-metadata tests                                                                                                                                                                                                       | Ref; caller inputs; event props; colliding `data-height`                                                         | A ref on another element, a dropped caller input or event handler, or a caller `data-height` that wins fails. Gap: no test pins the `xstyle` merge order.                                                                                                                                                                                                                                               | `audit:Layout/api`           |
| FR8                 | `layoutReset.test.tsx`, which fails when Layout or Section writes a layout custom property the reset does not stop, and reads each reset value back inside a padded Section; the docsite's `example-layout-root.test.ts`, which fails when the docsite example root's mirror differs from the reset | Every custom property Layout and Section write; a padded Section host                                            | A property written but not reset, a reset value an ancestor still overrides, or a docsite mirror that differs from the reset, fails.                                                                                                                                                                                                                                                                    | `audit:Layout/layout`        |
| AR1, AR2, PR1       | Source review                                                                                                                                                                                                                                                                                       | Every slot                                                                                                       | Gap: no automated check fails if Layout adds a role, reorders slots, or adds a listener or measurement.                                                                                                                                                                                                                                                                                                 | `audit:Layout/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                                                                                                                                       | Consumer anatomy and current targets                                                                             | Missing, extra, or stale mappings fail repository validation.                                                                                                                                                                                                                                                                                                                                           | `audit:Layout/theming`       |

## Decision log

### DEC-1 — AppShell owns the page shell; Layout owns five-slot arrangement

**Reference:** `component:Layout/DEC-1`
**Decider:** `cixzhang`, `2026-08-31`

AppShell is the page shell. Layout is the general layout primitive for arranging
the `header`, `start`, `content`, `end`, and `footer` slots within a page or
bounded container. Container-padding participation by Section, Table, Toolbar,
and Divider does not make those components Layout-owned anatomy.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, family region
rules, container-padding mechanics, resize interaction, implementation steps,
or system rules. It links to their owners.

---

<!-- source: docs/specs/components/Layout/LayoutContent.spec.md -->


# LayoutContent component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `isScrollable`, `padding`, `label`, `role`, root `BaseProps`, and a root `ref`.                                                    |
| Behavior                | The main content region fills the Layout's middle area, scrolls by default, and insets its children from neighbouring regions and open edges.  |
| End-user impact         | People scroll the main content while headers, footers, and panels stay put, with the scrollbar at the content area's open edge.                |
| Builder impact          | None: no API change; a scrolling region gains a role and a name with no code change (AR3).                                                     |
| Compatibility/readiness | No API or default changes; the scrolling-region role and name (AR3) are a patch `[fix]`. No implementation gap is open (Current-state impact). |
| Review checks           | Reject an inner wrapper around the children, a scrollbar moved off the open edge, an inferred landmark, or a further publication mismatch.     |
| Governing rules         | `family:layout-regions` FR1, FR3, FR4, FR7, FR8, FR12; `architecture:container-padding`; `architecture:public-component-api` INV5–INV8.        |

This table is a review projection; the body below is authoritative.

## Intent

LayoutContent is the main content region a caller places in a Layout's
`content` slot. It owns the region's scrolling, inset, and caller-supplied
landmark semantics; the caller owns its content.

Consumer syntax and examples belong in `LayoutContent.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — scrollable, automatic inset, no
  landmark role.
- Compatibility class: patch. No public prop, default, target, or styling
  output changes. While it scrolls, a region with no caller `role` gains
  `role="group"` and an `aria-label` (DOM; AR3, `[fix]` under
  `spec:AST-017` FR53).
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

None. Beside a single start panel the open inline-end edge takes the
Layout-edge inset, so `padding={0}` on the Layout makes it full bleed; each
edge publishes the padding it applies, so a full-bleed child lines up beside
an end panel and beside a header or footer without a divider; and each Layout
clears an outer header's or footer's collapse, so a nested Layout, including
one inside a Dialog, Drawer, or BottomSheet, keeps its own block spacing (FR2).

## Ownership boundary

**Owns**

- The content root, which carries the `layout-content` target that
  `component:Layout` maps, and is both the scroll container and the direct
  parent of the children.
- The region's inset, scrolling, and caller-supplied role and label.

**Does not own / non-goals**

- Slot placement, the Layout-edge inset, and content width — owned by
  `component:Layout`.
- Content and its meaning — owned by the caller.

## Public concepts

| Concept   | Closed values or states   | Meaning                                                                     | Availability by variant/orientation/state | Default   | Owner                     | Stability | Invalid-value behavior           |
| --------- | ------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | --------- | ------------------------- | --------- | -------------------------------- |
| Scrolling | `true`, `false`           | Scrolls overflow, or clips it.                                              | Always                                    | `true`    | `component:LayoutContent` | Stable    | —                                |
| Inset     | spacing step; `0`; unset  | Uniform padding that replaces the automatic inset; `0` is full bleed.       | Always                                    | automatic | `component:LayoutContent` | Stable    | Closed union; rejected by types. |
| Landmark  | caller `role` and `label` | Exposes the region as the role the caller names, with that accessible name. | Always                                    | none      | caller                    | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Basis                                                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR1 | LayoutContent renders one `div` carrying the `layout-content` target that fills the middle area's height and remaining width and holds the children directly. It scrolls overflow by default; `isScrollable={false}` clips it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests; `family:layout-regions` FR7                                                                     |
| FR2 | Without `padding`, each edge that faces another region (a panel, header, or footer) has the inner inset, and each open edge has the Layout-edge inset, where the Layout-edge inset comes from the Layout's `padding`, else the nearest padding container, and the inner inset from the nearest padding container (Card, Section, Dialog, Drawer, or BottomSheet), each spacing step 4 otherwise; a block edge beside a header or footer without a divider collapses to zero. A `padding` step replaces all four edges, and `0` removes them. The region publishes container-padding values equal to the padding it applies, excluding the content-width alignment gutter of FR3, which is applied but not published. The collapse applies only to the Layout whose header or footer it sits beside; a nested Layout, including one across a layer boundary, does not inherit it. | Current source and audit receipts; `family:layout-regions` FR4, FR6; `architecture:container-padding`; `spec:AST-038` FR7 |
| FR3 | When the Layout sets a content width, the region keeps its own box and scrollbar where `component:Layout` FR6 places them and aligns its children to that width through its inline padding, never less than its inset. With `padding={0}` it stays full bleed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests; `family:layout-regions` FR12                                                                    |
| FR4 | `role` and `label` set the root's `role` and `aria-label`; LayoutContent adds a role and a name of its own only while it scrolls (AR3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and tests; `family:layout-regions` FR8                                                                     |
| FR5 | `ref` reaches the root. Supported DOM, data, ARIA, and event props reach the root after the component's own attributes; `xstyle`, `className`, and `style` compose after component styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Current source and tests; `architecture:public-component-api` INV5–INV8                                                   |

### Allowed variation

- **AV1 — Content.** Any caller content may fill the region.
- **AV2 — Landmark.** The caller chooses whether the region is a landmark and
  which one.

### Representative states

| State                    | Required invariant                                    | Allowed variation |
| ------------------------ | ----------------------------------------------------- | ----------------- |
| Alone in a Layout        | Layout-edge inset on every edge; scrolls.             | Content.          |
| Beside panels            | Inner inset toward each panel.                        | Panel count.      |
| Content width, no panels | Full-width scrollport; children aligned to the width. | Width.            |
| Full bleed               | No padding; zero published inset.                     | —                 |
| Main landmark            | `role="main"` and the caller's name on the root.      | Name.             |

### Transformation and precedence order

- **ORD1 — Padding.** `padding` → automatic inset per edge (inner toward a
  region, Layout-edge on an open side, zero beside a header or footer without
  a divider); content-width alignment only increases inline padding.

### Performance and resources

- **PR1 — No external lifecycle.** LayoutContent reads which slots its Layout
  fills. It adds no listener, observer, timer, or measurement, except the
  overflow observation of AR3 while it may scroll.

## Accessibility contract

- **AR1 — Explicit landmarks only.** The region is a landmark only when the
  caller supplies `role`, named only by the caller's `label`
  (`family:layout-regions` FR8).
- **AR2 — Keyboard scrolling.** A scrolling region is a browser scroll
  container, so its overflow scrolls with the keyboard once focus is inside
  it or on it.
- **AR3 — A scrolling region is named.** While the region scrolls, its
  scrolling element has `role="group"` (unless the caller sets a `role`) and
  an accessible name (the caller's `label`, or a translated "Content"), so a
  screen reader that reaches it, including as a browser-made Tab stop,
  announces it; Tab behavior is the browser's (owner decision, 2026-11-04).
  A caller's `role` takes only the caller's `label` (AR1), so a single main
  landmark relies on its role (`spec:AST-025` FR12). Where the browser makes no Tab stop of it, a
  scrolling region whose content holds nothing focusable can't be scrolled
  from the keyboard. The caller then adds a focusable child or uses
  ScrollableArea.

## Design relationships

| Anatomy or state | Design requirement                     | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------- | ------------------------ | -------------- | ------------------ |
| Content area     | The main scrolling region of a Layout. | Current source and docs  | Prominent      | FR1–FR3            |

Theming: the root carries the `layout-content` target, which `Layout.doc.mjs`
declares and `component:Layout` maps. `LayoutContent.doc.mjs` declares no
anatomy of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `family:layout-regions` owns region scrolling, padding replacement, divider
  spacing, landmarks, and content-width scrollbar placement; FR1–FR4 and AR1
  apply them.
- `architecture:container-padding` owns inset publication; FR2 applies it.
- `component:Layout` owns slot placement, the Layout-edge inset, content
  width, and the `layout-content` target mapping.

## Verification map

| Contract     | Verification                                                                                                                                                                          | Representative states                                                                                                        | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Audit section                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1          | `LayoutSlots.test.tsx` class, scroll-owner, and Layout-slot tests                                                                                                                     | Alone; in a Layout                                                                                                           | A lost `layout-content` class, a non-scrolling default, or an inner wrapper around the children fails. Gap: `isScrollable={false}` and the fill sizing have no check.                                                                                                                                                                                                                                                                                                                                                                                                           | `audit:LayoutContent/layout`        |
| FR2, ORD1    | `LayoutSlots.test.tsx` padding test; `LayoutContentAudit.a11y.chromium.spec.ts` `content-insets` receipts                                                                             | `padding={0}`; numeric padding; start panel; end panel; header without a divider; full-bleed start panel; nested Layout; RTL | The audit receipts fail when an edge applies an inset other than the expected one, or publishes a value other than the padding it applies. Gap: no always-run check covers the automatic per-edge inset, the start-panel inline-end inset, the collapse beside a header or footer without a divider, the nested Layout, or the published values; the browser spec runs only for a LayoutContent audit pull request, so they have audit receipts only, and no receipt covers a nested Layout across a layer boundary. The padding unit test checks only that the region renders. | `audit:LayoutContent/layout`        |
| FR3          | `contentWidth.test.tsx`; stable visual baseline `core-layout--content-width-scrollbar-placement`                                                                                      | No panels, one panel, both; zero padding                                                                                     | A content region that is not full width without panels, children not aligned, or a lost full bleed fails; a scrollbar moved off its edge comes back changed for review.                                                                                                                                                                                                                                                                                                                                                                                                         | `audit:LayoutContent/layout`        |
| FR4, AR1     | `LayoutSlots.test.tsx` landmark test and `exposes no role or name of its own when it does not scroll`; `Layout.a11y.test.tsx` and `Layout.a11y.chromium.spec.ts` `content-main` state | Caller `main` role and label; no caller role                                                                                 | A lost role or name fails, including at the accessibility tree; a role or name on a region without a caller `role` that does not scroll fails.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `audit:LayoutContent/accessibility` |
| FR5          | `LayoutSlots.test.tsx` ref, className/style, and `forwards DOM, data, and event props to the root` tests                                                                              | Ref; caller class and style; DOM, data, and event props                                                                      | A ref on another element, or a dropped class, style, DOM, data, or event prop, fails. Gap: no test pins the `xstyle` merge order.                                                                                                                                                                                                                                                                                                                                                                                                                                               | `audit:LayoutContent/api`           |
| AR2, PR1     | Source review                                                                                                                                                                         | Scrolling region                                                                                                             | Gap: no automated check covers keyboard scrolling or fails if LayoutContent adds a listener or measurement beyond AR3's.                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `audit:LayoutContent/behavior`      |
| AR3          | `useScrollRegionProps.test.tsx` LayoutContent tests; `scrollRegionName.a11y.chromium.spec.ts`                                                                                         | Scrolling, fitting, labelled, `main`, not scrollable                                                                         | A group role or name missing while it overflows, or present while it fits or cannot scroll, fails, in Chromium's accessibility tree too; a lost caller role or label, a default landmark name, or a tab index fails.                                                                                                                                                                                                                                                                                                                                                            | `audit:LayoutContent/accessibility` |
| RTL relation | RTL audit curated D8 target (`apps/storybook/rtl-audit/targets.json`) on the `Content width with start panel` story                                                                   | Start panel with a centered content width (logical padding 16px start, 144px end); LTR and RTL                               | A logical start/end padding pair that does not swap physical sides in RTL fails D8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `audit:LayoutContent/i18n-rtl`      |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, Layout slot rules, or container-padding
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/Layout/LayoutFooter.spec.md -->


# LayoutFooter component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `hasDivider`, `height`, `padding`, `label`, `role`, root `BaseProps`, and a root `ref`.                                     |
| Behavior                | A non-shrinking footer region whose inner wrapper applies and publishes the Layout inset and aligns to the Layout's content width.      |
| End-user impact         | People see a footer that keeps its height below scrolling content, with content aligned to the page's readable width.                   |
| Builder impact          | None; the record describes shipped behavior.                                                                                            |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. No implementation gap is open (Current-state impact).        |
| Review checks           | Reject a footer that shrinks, a published inset that differs from the applied padding, an inferred landmark, or a lost divider default. |
| Governing rules         | `family:layout-regions` FR1, FR4–FR6, FR8; `architecture:container-padding`; `architecture:public-component-api` INV5–INV8.             |

This table is a review projection; the body below is authoritative.

## Intent

LayoutFooter is the optional footer region a caller places in a Layout's
`footer` slot. It owns the footer's size, inset, divider, and caller-supplied
landmark semantics; the caller owns its content.

Consumer syntax and examples belong in `LayoutFooter.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — no divider unless a Layout default says
  so, automatic inset, no landmark role.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

None.

## Ownership boundary

**Owns**

- The footer root, which carries the `layout-footer` target that
  `component:Layout` maps, and its inner padding wrapper.
- Footer height, divider, inset, and caller-supplied role and label.

**Does not own / non-goals**

- Slot placement, the Layout-edge inset, content width, and the divider
  default — owned by `component:Layout`.
- Footer content and its meaning — owned by the caller.

## Public concepts

| Concept  | Closed values or states               | Meaning                                                                     | Availability by variant/orientation/state | Default                   | Owner                    | Stability | Invalid-value behavior           |
| -------- | ------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- | ------------------------ | --------- | -------------------------------- |
| Divider  | `true`, `false`, unset                | Draws a line on the footer's block-start edge.                              | Always                                    | Layout default, else none | `component:LayoutFooter` | Stable    | —                                |
| Height   | number (px); CSS length string; unset | Fixes the footer's block size.                                              | Always                                    | content height            | `component:LayoutFooter` | Stable    | —                                |
| Inset    | spacing step; `0`; unset              | Uniform padding that replaces the automatic inset; `0` is full bleed.       | Always                                    | automatic                 | `component:LayoutFooter` | Stable    | Closed union; rejected by types. |
| Landmark | caller `role` and `label`             | Exposes the footer as the role the caller names, with that accessible name. | Always                                    | none                      | caller                   | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| FR1 | LayoutFooter renders a root `div` carrying the `layout-footer` target that does not shrink, around an inner `div` that holds the children, has the Layout's content width as its maximum width, and centers within the root. `height` fixes the root's block size, with numbers as pixels.                                                                                                                                                                                                                                                                                                           | Current source and tests                                                                |
| FR2 | Without `padding`, the inner wrapper's inline and block-end padding is the Layout-edge inset and its block-start padding is the inner inset, where the Layout-edge inset comes from the Layout's `padding`, else the nearest padding container, and the inner inset from the nearest padding container (Card, Section, Dialog, Drawer, or BottomSheet), each spacing step 4 otherwise. A `padding` step replaces all four edges, and `0` removes them. The wrapper publishes container-padding values equal to the padding it applies.                                                               | Current source and tests; `family:layout-regions` FR4; `architecture:container-padding` |
| FR3 | A divider draws a 1px solid `--color-border` line on the root's block-start edge and reflects `data-divider="true"`. `hasDivider` decides; when unset, the nearest Layout `defaultHasDividers` in the same layer decides (the default stops at a layer boundary, `spec:AST-038` FR7); otherwise there is no divider. A footer without a divider lets the middle row above it collapse its block-end spacing. The collapse stops at each Layout, so a Layout nested in that middle row, including inside a Dialog, Drawer, or BottomSheet opened from it, keeps its own spacing (`spec:AST-038` FR7). | Current source and tests; `family:layout-regions` FR6                                   |
| FR4 | `role` and `label` set the root's `role` and `aria-label`; LayoutFooter adds no role of its own.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests; `family:layout-regions` FR8                                   |
| FR5 | `ref` reaches the root. Supported DOM, data, ARIA, and event props reach the root, `xstyle`, `className`, and `style` compose after component styles, and the reflected `data-divider` stays component-owned: a caller's `data-divider` never replaces it, so the neighbouring spacing collapse always follows the divider state (`architecture:public-component-api` INV5).                                                                                                                                                                                                                         | Current source and tests; `architecture:public-component-api` INV5–INV8                 |

### Allowed variation

- **AV1 — Content.** Any caller content may fill the footer.
- **AV2 — Landmark.** The caller chooses whether the footer is a landmark and
  which one.

### Representative states

| State                | Required invariant                                      | Allowed variation |
| -------------------- | ------------------------------------------------------- | ----------------- |
| Default in Layout    | Automatic inset, no divider, no role.                   | Content.          |
| With divider         | Block-start line and `data-divider="true"`.             | —                 |
| Explicit padding     | Uniform padding, published to children.                 | Step.             |
| Contentinfo landmark | `role="contentinfo"` and the caller's name on the root. | Name.             |

### Transformation and precedence order

- **ORD1 — Divider.** `hasDivider` → Layout `defaultHasDividers` → none.
- **ORD2 — Padding.** `padding` → the automatic inset.

### Performance and resources

- **PR1 — No external lifecycle.** LayoutFooter reads the divider default from
  its Layout and adds no listener, observer, timer, or measurement.

## Accessibility contract

- **AR1 — Explicit landmarks only.** The footer is a landmark only when the
  caller supplies `role`, and it is named only by the caller's `label`
  (`family:layout-regions` FR8).

## Design relationships

| Anatomy or state | Design requirement                                        | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Footer           | A fixed footer band with an optional block-start divider. | Current source and docs  | Supporting     | FR1–FR3            |

Theming: the root carries the `layout-footer` target, which `Layout.doc.mjs`
declares and `component:Layout` maps. `LayoutFooter.doc.mjs` declares no anatomy
of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `family:layout-regions` owns region boundaries, padding replacement, divider
  spacing, and landmark rules; FR2–FR4 and AR1 apply them.
- `architecture:container-padding` owns inset publication; FR2 applies it.
- `component:Layout` owns slot placement, the Layout-edge inset, content
  width, the divider default, and the `layout-footer` target mapping.
- `architecture:public-component-api` owns caller-input routing; FR5 applies
  it.

## Verification map

| Contract  | Verification                                                                                                                                                                                                                                                                                                                                                 | Representative states                                                                           | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                  | Audit section                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| FR1       | `LayoutSlots.test.tsx` class and `applies a numeric height as pixels on the root` tests; `contentWidth.test.tsx` LayoutFooter inner-wrapper and divider tests; `headerFooterXstyle.test.tsx` `keeps the own styles that xstyle does not set` (non-shrinking root)                                                                                            | Default; numeric height; content width                                                          | A lost `layout-footer` class, a missing pixel height, children placed on the root instead of the inner wrapper, or a divider off the outer element fails. A footer root that shrinks fails. Gap: the content-width maximum and centering have no check.                                                                                                          | `audit:LayoutFooter/layout`        |
| FR2, ORD2 | `LayoutHeaderFooterEdges.a11y.browser.spec.ts` per-case insets and published values                                                                                                                                                                                                                                                                          | Automatic, explicit, and zero padding                                                           | An inset that differs from the expected step on any edge (automatic, `padding`, full bleed, or a nested Layout), or a published value that differs from the applied padding, fails. Gap: the automatic inset taken from a surrounding Card, Section, Dialog, Drawer or BottomSheet has no named check; the edge spec renders each case in a plain frame.         | `audit:LayoutFooter/layout`        |
| FR3, ORD1 | `LayoutSlots.test.tsx` and `Layout.test.tsx` divider tests, including `an explicit hasDivider={false} on a footer overrides the context default` and `stops the footer default at a layer boundary`; `LayoutHeaderFooterEdges.a11y.browser.spec.ts` line paint and the collapse of the content above the footer, including where it stops at a nested Layout | Default; `hasDivider`; Layout default; explicit `false`; Layout default across a layer boundary | A missing or unexpected `data-divider`, an ignored Layout default, an explicit `false` that loses, or a Layout default that crosses a layer boundary fails. A line that is not 1px solid `--color-border`, a line without `data-divider="true"`, or content above the footer that does not collapse without a divider, or collapses past a nested Layout, fails. | `audit:LayoutFooter/layout`        |
| FR4, AR1  | `LayoutSlots.test.tsx` landmark and `exposes no role or name without a caller role` tests; `Layout.a11y.test.tsx` and `Layout.a11y.chromium.spec.ts` `footer-contentinfo` state                                                                                                                                                                              | Caller `contentinfo` role and label; no caller role                                             | A lost role or name fails, including at the accessibility tree. A footer without a caller `role` that exposes a role or name fails.                                                                                                                                                                                                                              | `audit:LayoutFooter/accessibility` |
| FR5       | `LayoutSlots.test.tsx` ref, `passes className, style, DOM, data, and event props to the root`, and `keeps data-divider when a caller passes its own value` tests; `headerFooterXstyle.test.tsx` `xstyle` merge-order tests; `LayoutHeaderFooterEdges.a11y.browser.spec.ts` `caller-attribute` case                                                           | Ref; caller class, style, DOM, data, and event props; caller `data-divider`                     | A ref on another element, a dropped caller prop, or a caller `data-divider` that replaces or removes the reflected value fails. An `xstyle` that loses to the footer's own styles, or a caller `data-divider` that changes the spacing above the footer, fails.                                                                                                  | `audit:LayoutFooter/api`           |
| PR1       | Source review                                                                                                                                                                                                                                                                                                                                                | Every state                                                                                     | Gap: no automated check fails if LayoutFooter adds a listener, timer, or measurement.                                                                                                                                                                                                                                                                            | `audit:LayoutFooter/behavior`      |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, Layout slot rules, or container-padding
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/Layout/LayoutHeader.spec.md -->


# LayoutHeader component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `hasDivider`, `height`, `padding`, `paddingBlockEnd`, `label`, `role`, root `BaseProps`, and a root `ref`.                  |
| Behavior                | A non-shrinking header region whose inner wrapper applies and publishes the Layout inset and aligns to the Layout's content width.      |
| End-user impact         | People see a header that keeps its height above scrolling content, with content aligned to the page's readable width.                   |
| Builder impact          | None; the record describes shipped behavior.                                                                                            |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. No implementation gap is open (Current-state impact).        |
| Review checks           | Reject a header that shrinks, a published inset that differs from the applied padding, an inferred landmark, or a lost divider default. |
| Governing rules         | `family:layout-regions` FR1, FR4–FR6, FR8; `architecture:container-padding`; `architecture:public-component-api` INV5–INV8.             |

This table is a review projection; the body below is authoritative.

## Intent

LayoutHeader is the optional header region a caller places in a Layout's
`header` slot. It owns the header's size, inset, divider, and caller-supplied
landmark semantics; the caller owns its content.

Consumer syntax and examples belong in `LayoutHeader.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — no divider unless a Layout default says
  so, automatic inset, no landmark role.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

None.

## Ownership boundary

**Owns**

- The header root, which carries the `layout-header` target that
  `component:Layout` maps, and its inner padding wrapper.
- Header height, divider, inset, and caller-supplied role and label.

**Does not own / non-goals**

- Slot placement, the Layout-edge inset, content width, and the divider
  default — owned by `component:Layout`.
- Header content and its meaning — owned by the caller.

## Public concepts

| Concept         | Closed values or states               | Meaning                                                                     | Availability by variant/orientation/state | Default                   | Owner                    | Stability | Invalid-value behavior           |
| --------------- | ------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------- | ------------------------ | --------- | -------------------------------- |
| Divider         | `true`, `false`, unset                | Draws a line on the header's block-end edge.                                | Always                                    | Layout default, else none | `component:LayoutHeader` | Stable    | —                                |
| Height          | number (px); CSS length string; unset | Fixes the header's block size.                                              | Always                                    | content height            | `component:LayoutHeader` | Stable    | —                                |
| Inset           | spacing step; `0`; unset              | Uniform padding that replaces the automatic inset; `0` is full bleed.       | Always                                    | automatic                 | `component:LayoutHeader` | Stable    | Closed union; rejected by types. |
| Block-end inset | spacing step; unset                   | Replaces the block-end padding alone.                                       | Always                                    | automatic                 | `component:LayoutHeader` | Stable    | Closed union; rejected by types. |
| Landmark        | caller `role` and `label`             | Exposes the header as the role the caller names, with that accessible name. | Always                                    | none                      | caller                   | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| FR1 | LayoutHeader renders a root `div` carrying the `layout-header` target that does not shrink, around an inner `div` that holds the children, has the Layout's content width as its maximum width, and centers within the root. `height` fixes the root's block size, with numbers as pixels.                                                                                                                                                                                                                                                                                                           | Current source and tests                                                                |
| FR2 | Without `padding`, the inner wrapper's inline and block-start padding is the Layout-edge inset and its block-end padding is the inner inset, where the Layout-edge inset comes from the Layout's `padding`, else the nearest padding container, and the inner inset from the nearest padding container (Card, Section, Dialog, Drawer, or BottomSheet), each spacing step 4 otherwise. A `padding` step replaces all four edges, and `0` removes them. `paddingBlockEnd` replaces the block-end edge alone. The wrapper publishes container-padding values equal to the padding it applies.          | Current source and tests; `family:layout-regions` FR4; `architecture:container-padding` |
| FR3 | A divider draws a 1px solid `--color-border` line on the root's block-end edge and reflects `data-divider="true"`. `hasDivider` decides; when unset, the nearest Layout `defaultHasDividers` in the same layer decides (the default stops at a layer boundary, `spec:AST-038` FR7); otherwise there is no divider. A header without a divider lets the middle row below it collapse its block-start spacing. The collapse stops at each Layout, so a Layout nested in that middle row, including inside a Dialog, Drawer, or BottomSheet opened from it, keeps its own spacing (`spec:AST-038` FR7). | Current source and tests; `family:layout-regions` FR6                                   |
| FR4 | `role` and `label` set the root's `role` and `aria-label`; LayoutHeader adds no role of its own.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests; `family:layout-regions` FR8                                   |
| FR5 | `ref` reaches the root. Supported DOM, data, ARIA, and event props reach the root, `xstyle`, `className`, and `style` compose after component styles, and the reflected `data-divider` stays component-owned: a caller's `data-divider` never replaces it, so the neighbouring spacing collapse always follows the divider state (`architecture:public-component-api` INV5).                                                                                                                                                                                                                         | Current source and tests; `architecture:public-component-api` INV5–INV8                 |

### Allowed variation

- **AV1 — Content.** Any caller content may fill the header.
- **AV2 — Landmark.** The caller chooses whether the header is a landmark and
  which one.

### Representative states

| State             | Required invariant                                 | Allowed variation |
| ----------------- | -------------------------------------------------- | ----------------- |
| Default in Layout | Automatic inset, no divider, no role.              | Content.          |
| With divider      | Block-end line and `data-divider="true"`.          | —                 |
| Explicit padding  | Uniform padding, published to children.            | Step.             |
| `paddingBlockEnd` | Only the block-end edge changes.                   | Step.             |
| Banner landmark   | `role="banner"` and the caller's name on the root. | Name.             |

### Transformation and precedence order

- **ORD1 — Divider.** `hasDivider` → Layout `defaultHasDividers` → none.
- **ORD2 — Padding.** `paddingBlockEnd` for block-end → `padding` → the
  automatic inset.

### Performance and resources

- **PR1 — No external lifecycle.** LayoutHeader reads the divider default from
  its Layout and adds no listener, observer, timer, or measurement.

## Accessibility contract

- **AR1 — Explicit landmarks only.** The header is a landmark only when the
  caller supplies `role`, and it is named only by the caller's `label`
  (`family:layout-regions` FR8).

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Header           | A fixed header band with an optional block-end divider. | Current source and docs  | Supporting     | FR1–FR3            |

Theming: the root carries the `layout-header` target, which `Layout.doc.mjs`
declares and `component:Layout` maps. `LayoutHeader.doc.mjs` declares no anatomy
of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `family:layout-regions` owns region boundaries, padding replacement, divider
  spacing, and landmark rules; FR2–FR4 and AR1 apply them.
- `architecture:container-padding` owns inset publication; FR2 applies it.
- `component:Layout` owns slot placement, the Layout-edge inset, content
  width, the divider default, and the `layout-header` target mapping.
- `architecture:public-component-api` owns caller-input routing; FR5 applies
  it.

## Verification map

| Contract  | Verification                                                                                                                                                                                                                                                                                       | Representative states                                                       | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Audit section                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| FR1       | `LayoutSlots.test.tsx` class, height, and inner-wrapper tests; `contentWidth.test.tsx` LayoutHeader inner-wrapper and divider tests; `headerFooterXstyle.test.tsx` `keeps the own styles that xstyle does not set` (non-shrinking root)                                                            | Default; numeric height                                                     | A lost `layout-header` class, a missing pixel height, children placed directly on the root, or a divider off the outer element fails. A header root that shrinks fails. Gap: the content-width maximum and centering have no check.                                                                                                                                                                                                                                                | `audit:LayoutHeader/layout`        |
| FR2, ORD2 | `Layout.test.tsx` `paddingBlockEnd` tests; `LayoutHeaderFooterEdges.a11y.browser.spec.ts` per-case insets and published values                                                                                                                                                                     | `paddingBlockEnd` alone and with `padding`                                  | A `paddingBlockEnd` that adds no class, changes more than the block-end edge, or leaves the shared per-edge family fails. An inset that differs from the expected step on any edge (automatic, `padding`, full bleed, or a nested Layout), or a published value that differs from the applied padding, fails. Gap: the automatic inset taken from a surrounding Card, Section, Dialog, Drawer or BottomSheet has no named check; the edge spec renders each case in a plain frame. | `audit:LayoutHeader/layout`        |
| FR3, ORD1 | `LayoutSlots.test.tsx` and `Layout.test.tsx` divider tests, including `stops the default at a layer boundary`; `LayoutHeaderFooterEdges.a11y.browser.spec.ts` line paint and the collapse of the content below the header, including where it stops at a nested Layout                             | Default; `hasDivider`; Layout default; explicit `false`                     | A missing or unexpected `data-divider`, an ignored Layout default, or an explicit `false` that loses fails. A line that is not 1px solid `--color-border`, a line without `data-divider="true"`, or content below the header that does not collapse without a divider, or collapses past a nested Layout, fails.                                                                                                                                                                   | `audit:LayoutHeader/layout`        |
| FR4, AR1  | `LayoutSlots.test.tsx` landmark and `exposes no role or name without a caller role` tests; `Layout.a11y.test.tsx` and `Layout.a11y.chromium.spec.ts` `header-banner` state                                                                                                                         | Caller `banner` role and label; no caller role                              | A lost role or name fails, including at the accessibility tree. A header without a caller `role` that exposes a role or name fails.                                                                                                                                                                                                                                                                                                                                                | `audit:LayoutHeader/accessibility` |
| FR5       | `LayoutSlots.test.tsx` ref, className, `passes style, DOM, data, and event props to the root`, and `keeps data-divider when a caller passes its own value` tests; `headerFooterXstyle.test.tsx` `xstyle` merge-order tests; `LayoutHeaderFooterEdges.a11y.browser.spec.ts` `caller-attribute` case | Ref; caller class, style, DOM, data, and event props; caller `data-divider` | A ref on another element, a dropped class or caller prop, or a caller `data-divider` that replaces or removes the reflected value fails. An `xstyle` that loses to the header's own styles, or a caller `data-divider` that changes the spacing below the header, fails.                                                                                                                                                                                                           | `audit:LayoutHeader/api`           |
| PR1       | Source review                                                                                                                                                                                                                                                                                      | Every state                                                                 | Gap: no automated check fails if LayoutHeader adds a listener, timer, or measurement.                                                                                                                                                                                                                                                                                                                                                                                              | `audit:LayoutHeader/behavior`      |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, Layout slot rules, or container-padding
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/Layout/LayoutPanel.spec.md -->


# LayoutPanel component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `width`, `resizable`, `hasDivider`, `isScrollable`, `padding`, `label`, `role`, root `BaseProps`, and a root `ref`.                                                                                         |
| Behavior                | A fixed-width side region at logical start or end that scrolls by default, with an optional divider on its content-facing edge.                                                                                         |
| End-user impact         | People see a side panel that keeps its width, scrolls on its own, and mirrors to the other side in right-to-left.                                                                                                       |
| Builder impact          | `resizable` takes useResizable's output directly, or its `props` as before (FR8); a collapsing resizable panel slides, and a scrolling panel gains a role and a name, with no code change.                              |
| Compatibility/readiness | `resizable` takes useResizable's output too (FR8). A collapsing panel slides (FR7), moves focus out and goes inert (AR2), and a scrolling panel is named (AR3). Patch: `[feat]` type and slide, `[fix]` focus and name. |
| Review checks           | Reject a divider on the outer edge, a panel that shrinks, an inferred landmark, `width` beating `resizable`, or a further publication mismatch.                                                                         |
| Governing rules         | `family:layout-regions` FR1, FR2, FR4–FR8, FR10; `architecture:container-padding`; `architecture:public-component-api` INV5–INV8.                                                                                       |

This table is a review projection; the body below is authoritative.

## Intent

LayoutPanel is the side region a caller places in a Layout's `start` or `end`
slot. It owns the panel's width, inset, scrolling, divider, and
caller-supplied landmark semantics; the caller owns its content.

Consumer syntax and examples belong in `LayoutPanel.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — no divider, scrollable, automatic
  inset, content width.
- Compatibility class: patch. `resizable` also takes useResizable's output (FR8,
  `[feat]`); no other public prop, target, or styling output changes, and
  omitted props behave as before. A collapsing resizable panel now slides (FR7,
  `[feat]`, visual-only under `spec:AST-017/DEC-17`), and focus inside it moves
  to the adjacent ResizeHandle while the collapsed panel becomes inert (DOM:
  `inert` and `aria-hidden`; AR2, `[fix]` under `spec:AST-017` FR53). While it
  scrolls, a panel with no caller `role` gains `role="group"` and an
  `aria-label` (DOM; AR3, `[fix]` under `spec:AST-017` FR53).
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Published inset differs from applied padding (FR3).** On the automatic
  path a panel applies the Layout-edge inset on its outer inline edge and on
  a block edge with no header or footer, but publishes the inner inset on
  every edge. A full-bleed child then lines up against a value that differs
  from the padding the panel applies, where `architecture:container-padding`
  has a region publish its applied padding.
- **Two divider owners can paint one boundary (FR4).** A panel with
  `hasDivider` beside a ResizeHandle that draws the same line paints the
  boundary twice; nothing prevents it, so callers keep `hasDivider={false}`
  when the ResizeHandle owns the line (`family:layout-regions` FR5).

## Ownership boundary

**Owns**

- The panel root, which carries the `layout-panel` target that
  `component:Layout` maps.
- Panel width, inset, scrolling, divider, and caller-supplied role and label.

**Does not own / non-goals**

- Slot placement and the Layout-edge inset — owned by `component:Layout`.
- Resize interaction and the resize handle — owned by useResizable and
  ResizeHandle (`family:layout-regions` FR10).
- Panel content and its meaning — owned by the caller.

## Public concepts

| Concept   | Closed values or states               | Meaning                                                                    | Availability by variant/orientation/state | Default       | Owner                   | Stability | Invalid-value behavior           |
| --------- | ------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- | ------------- | ----------------------- | --------- | -------------------------------- |
| Width     | number (px); CSS length string; unset | The panel's inline size.                                                   | Always                                    | content width | `component:LayoutPanel` | Stable    | —                                |
| Resizable | the value from useResizable           | Supplies a resizable width that wins over `width`.                         | Always                                    | none          | `component:LayoutPanel` | Stable    | —                                |
| Divider   | `true`, `false`                       | Draws a line on the panel's content-facing edge.                           | Start or end slot                         | `false`       | `component:LayoutPanel` | Stable    | —                                |
| Scrolling | `true`, `false`                       | Scrolls overflow, or clips it.                                             | Always                                    | `true`        | `component:LayoutPanel` | Stable    | —                                |
| Inset     | spacing step; `0`; unset              | Uniform padding that replaces the automatic inset; `0` is full bleed.      | Always                                    | automatic     | `component:LayoutPanel` | Stable    | Closed union; rejected by types. |
| Landmark  | caller `role` and `label`             | Exposes the panel as the role the caller names, with that accessible name. | Always                                    | none          | caller                  | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| FR1 | LayoutPanel renders one `div` carrying the `layout-panel` target that does not shrink and holds the children directly. `width` sets its inline size, with numbers as pixels; a `resizable` value's size wins over `width`. It scrolls overflow by default; `isScrollable={false}` clips it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current source and tests; `family:layout-regions` FR7, FR10                   |
| FR2 | In the `start` slot the panel's content-facing edge is its inline end; in the `end` slot it is its inline start; both follow writing direction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests; `family:layout-regions` FR2                         |
| FR3 | Without `padding`, the panel's outer inline edge has the Layout-edge inset, a block edge with no header or footer beside it has the Layout-edge inset, and other edges have the inner inset, where the Layout-edge inset comes from the Layout's `padding`, else the nearest padding container, and the inner inset from the nearest padding container (Card, Section, Dialog, Drawer, or BottomSheet), each spacing step 4 otherwise. A `padding` step replaces all four edges, and `0` removes them. The panel publishes container-padding values equal to the padding it applies. Implementation gap: on the automatic path it publishes the inner inset on every edge (Current-state impact).                                                                                   | Current source; `family:layout-regions` FR4; `architecture:container-padding` |
| FR4 | `hasDivider` draws a 1px solid `--color-border` line on the content-facing edge; LayoutPanel does not read a Layout divider default. Without a divider and with the automatic inset, the panel overlaps the content area by the inner inset so the two share one gap. One boundary has one divider owner (`family:layout-regions` FR5). Implementation gap: nothing prevents a panel divider and an adjacent ResizeHandle line from both painting (Current-state impact).                                                                                                                                                                                                                                                                                                           | Current source and docs; `family:layout-regions` FR5, FR6                     |
| FR5 | `role` and `label` set the root's `role` and `aria-label`; LayoutPanel adds a role and a name of its own only while it scrolls (AR3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current source and tests; `family:layout-regions` FR8                         |
| FR6 | `ref` reaches the root. Supported DOM, data, ARIA, and event props reach the root after the component's own attributes; `xstyle`, `className`, and `style` compose after component styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and tests; `architecture:public-component-api` INV5–INV8       |
| FR7 | A LayoutPanel whose size comes from a resize controller lends its element to the controller of the ResizeHandle on its content-facing edge through an internal channel, so the panel slides closed and open by `spec:AST-105` FR9's edge reveal when its region collapses or opens: its content-facing edge (FR2) moves, and the content on that edge's side moves on the same motion (`component:Resizable` FR8). A panel given the configuration-object form, a hand-built `ResizableProps` object that `useResizable` did not return passed through `resizable`, and a panel with no resize controller, never slide; `useResizable`'s own `props` passed through `resizable` do slide. LayoutPanel adds no prop. A panel at the region's size beside that handle does not slide. | `spec:AST-105` FR9; `component:Resizable` FR8                                 |
| FR8 | `resizable` takes useResizable's output directly; the region's `props` is still accepted (owner decision, 2026-11-04). The panel takes the hook's value through that slot prop (owner decision, 2026-11-04).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `component:Resizable` FR9; `architecture:public-component-api` INV21          |

### Allowed variation

- **AV1 — Content.** Any caller content may fill the panel.
- **AV2 — Position.** The caller places the panel at start, end, or both.

### Representative states

| State               | Required invariant                                                                                                 | Allowed variation                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Start panel         | Divider and shared gap on the inline-end edge.                                                                     | Width.                                                                    |
| End panel           | Divider and shared gap on the inline-start edge.                                                                   | Width.                                                                    |
| Right-to-left       | Start and end mirror.                                                                                              | —                                                                         |
| Resizable           | The resizable size sets the width.                                                                                 | Size.                                                                     |
| Collapsing          | The panel slides closed from its content-facing edge; focus inside it moves to the ResizeHandle; it is then inert. | Start or end; Reduce Motion; configuration-object form without the slide. |
| Navigation landmark | `role="navigation"` and the caller's name on the root.                                                             | Name.                                                                     |

### Transformation and precedence order

- **ORD1 — Width.** `resizable` size → `width` → content width.
- **ORD2 — Padding.** `padding` → automatic inset per edge.

### Performance and resources

- **PR1 — No external lifecycle.** LayoutPanel reads its slot and which slots
  its Layout fills. It adds no listener, observer, timer, or measurement of
  its own, except the overflow observation of AR3 while it may scroll; the
  slide's measurement is the resize controller's (FR7).

## Accessibility contract

- **AR1 — Explicit landmarks only.** The panel is a landmark only when the
  caller supplies `role`, named only by the caller's `label`
  (`family:layout-regions` FR8).
- **AR2 — Focus leaves a collapsing panel.** When a panel's region collapses
  while focus is inside the panel, under any resize controller, the
  configuration-object form (FR7) included, focus moves to
  the adjacent ResizeHandle on the panel's content-facing edge, the control
  that opens it again; the collapsed panel is then inert and `aria-hidden`
  until it opens (`spec:AST-105` FR9). Opening moves no focus. A collapse
  started from the Handle, or from a control outside the panel, leaves focus
  where it is. Only the slide (FR7) excludes the configuration-object form.
- **AR3 — A scrolling panel is named.** While the panel scrolls, its
  scrolling element has `role="group"` (unless the caller sets a `role`) and
  an accessible name (the caller's `label`, or a translated "Content"), so a
  screen reader that reaches it, including as a browser-made Tab stop,
  announces it; Tab behavior is the browser's (owner decision, 2026-11-04).
  A caller's `role` takes only the caller's `label` (AR1). Where the browser makes no Tab stop of it, a
  scrolling region whose content holds nothing focusable can't be scrolled
  from the keyboard. The caller then adds a focusable child or uses
  ScrollableArea.

## Design relationships

| Anatomy or state | Design requirement                                           | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| Panel            | A fixed side region with an optional content-facing divider. | Current source and docs  | Supporting     | FR1–FR4            |

Theming: the root carries the `layout-panel` target, which `Layout.doc.mjs`
declares and `component:Layout` maps. `LayoutPanel.doc.mjs` declares no anatomy
of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `family:layout-regions` owns region direction, padding replacement,
  boundary ownership, divider spacing, scrolling, landmarks, and resize
  delegation; FR1–FR5 and AR1 apply them.
- `spec:AST-105` FR9 owns the edge reveal FR7 plays and the focus rule AR2
  applies; `component:Resizable` FR8 owns when it plays.
- `architecture:container-padding` owns inset publication; FR3 applies it and
  records the gap.
- `component:Layout` owns slot placement, the Layout-edge inset, and the
  `layout-panel` target mapping.

## Verification map

| Contract     | Verification                                                                                                                                                     | Representative states                                                                                | Mutation or failure expectation                                                                                                                                                                                                                                                                          | Audit section                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1, ORD1    | `LayoutSlots.test.tsx` class, width, and resizable tests; `collapsedPanel.interaction.browser.spec.ts` for width 0                                               | Numeric, string and zero width; resizable; a collapsed region                                        | A lost `layout-panel` class, a missing width, or `width` beating `resizable` fails. Gap: the non-shrinking root, scrolling, and `isScrollable={false}` have no check. No requirement or check covers how a keyboard user reaches a scrolling panel's overflow when the panel holds no focusable content. | `audit:LayoutPanel/layout`        |
| FR2          | `LayoutSlots.test.tsx` start- and end-slot tests; `Layout.a11y.chromium.spec.ts` `start-end-navigation-rtl` state                                                | Start and end panels; right-to-left                                                                  | A panel that fails to render in either slot fails. Gap: no check asserts which edge carries the divider or the shared gap.                                                                                                                                                                               | `audit:LayoutPanel/layout`        |
| FR3, ORD2    | Source review                                                                                                                                                    | Automatic, explicit, and zero padding                                                                | Gap: no test covers the automatic per-edge inset, the `padding` replacement, full bleed, or the published values.                                                                                                                                                                                        | `audit:LayoutPanel/layout`        |
| FR4          | Source review                                                                                                                                                    | `hasDivider`; no divider                                                                             | Gap: no test covers the divider line, the shared gap, or a panel divider beside a ResizeHandle.                                                                                                                                                                                                          | `audit:LayoutPanel/layout`        |
| FR5, AR1     | `LayoutSlots.test.tsx` landmark test; `Layout.a11y.test.tsx` and `Layout.a11y.chromium.spec.ts` `start-end-navigation-rtl` and `nested-panel-region` states      | Caller `navigation` and `region` roles and labels                                                    | A lost role or name fails, including at the accessibility tree. Gap: no test asserts that a panel without `role` exposes none.                                                                                                                                                                           | `audit:LayoutPanel/accessibility` |
| FR6          | `LayoutSlots.test.tsx` ref and className tests                                                                                                                   | Ref; caller class                                                                                    | A ref on another element or a dropped class fails. Gap: no test covers `style`, DOM, data, or event props, or the `xstyle` merge order.                                                                                                                                                                  | `audit:LayoutPanel/api`           |
| FR7, AR2     | `paneSlide.interaction.browser.spec.ts`: a start and an end panel collapsing and opening, with focus inside, with the hook's own value and with a hand-built one | Start and end; toggle, Enter and a drag past the threshold; configuration-object form; Reduce Motion | A jump instead of a slide, a gap beside the moving edge, a slide under the configuration-object form, focus left in a collapsed panel, a collapsed panel reachable by Tab or exposed to assistive technology, or a new prop fails.                                                                       | `audit:LayoutPanel/behavior`      |
| AR3          | `useScrollRegionProps.test.tsx` LayoutPanel tests; `scrollRegionName.a11y.chromium.spec.ts` `panel-scrolls`; `collapsedPanel.interaction.browser.spec.ts`        | Scrolling panel; caller `navigation` role and label; a scrolling panel collapsed to width 0          | A group role or name missing while the panel overflows fails, at Chromium's accessibility tree too; a caller's role or label lost fails. A group role kept at width 0 fails.                                                                                                                             | `audit:LayoutPanel/accessibility` |
| PR1          | Source review                                                                                                                                                    | Every state                                                                                          | Gap: no automated check fails if LayoutPanel adds a listener, timer, or measurement.                                                                                                                                                                                                                     | `audit:LayoutPanel/behavior`      |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on the `Content width with start panel` story                                              | Start panel beside the content; LTR and RTL                                                          | A start panel that is not at the inline start of the content in both directions fails D2.                                                                                                                                                                                                                | `audit:LayoutPanel/i18n-rtl`      |
| FR8          | `resizableSlot.test.tsx` region and `props` cases                                                                                                                | The region; its `props`                                                                              | A panel that ignores the region's size, or a collapse that leaves it reachable, fails.                                                                                                                                                                                                                   | `audit:LayoutPanel/api`           |

## Decision log

None recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, Layout slot rules, resize interaction, or
container-padding mechanics. It links to their owners.
