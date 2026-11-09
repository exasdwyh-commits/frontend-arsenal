---
schema_version: 3
template_version: 7
kind: component
id: component:TopNav
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-25
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/TopNav/TopNav.test.tsx,
    packages/core/src/TopNav/__tests__/TopNavMobileLongHeading.a11y.chromium.spec.ts,
    packages/core/src/TopNav/__tests__/TopNavTextSize.interaction.browser.spec.ts,
    packages/core/src/AppShell/AppShell.test.tsx,
    apps/storybook/stories/TopNav.stories.tsx,
    apps/storybook/rtl-audit/targets.json,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:component-theming-surface, architecture:public-component-api]
contributing: []
system_specs: []
---

# TopNav component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNav` with `heading`, `startContent` (alias `children`), `centerContent`, `endContent`, and `label`; target `top-nav` with a `mode` state.                                                                                                                     |
| Behavior                | A labeled navigation landmark with start, optional center, and end regions. Inside AppShell's mobile layout it becomes a compact bar (heading, end content, and, while auto toggles are on, a drawer toggle) and its start and center content move into a drawer. |
| End-user impact         | Screen-reader users get a named navigation landmark; phone-width users keep the product heading, end controls, and, while auto toggles are on, a drawer toggle in view while the navigation items move into the drawer.                                           |
| Builder impact          | None. Callers fill slots; `children` is accepted so nav items are not dropped.                                                                                                                                                                                    |
| Compatibility/readiness | Records shipped behavior; no prop, default, target, or export changes. Two implementation gaps (see Current-state impact).                                                                                                                                        |
| Review checks           | Reject dropping `children` when `startContent` is absent, dropping the three-region layout when `centerContent` is present, an unlabeled landmark, or a mobile bar that hides the toggle while drawer content exists and auto toggles are on (FR5).               |
| Governing rules         | `component:AppShell` FR9–FR10 select the render mode; MobileNav owns the drawer dialog; `architecture:component-theming-surface`.                                                                                                                                 |

This table is a review projection; the body below is authoritative.

## Intent

TopNav is the horizontal navigation bar of an application header. It owns the
bar's landmark, its slot layout, and how the bar and its content render in each
of the three modes AppShell selects: the full bar, the mobile bar, and the
drawer. Consumer usage lives in `TopNav.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, target,
  or export changes
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Caller props can replace the landmark's role and name.** Other DOM props
  spread onto the `<nav>` after `role` and `aria-label`, so a caller `role` or
  `aria-label` replaces them. `architecture:public-component-api` INV5 keeps
  component-owned accessibility from being overwritten by accident.
- **Wide end content shifts the center.** End content wider than its share
  widens the end region and moves the center content toward the start.

## Ownership boundary

**Owns**

- The navigation landmark and its default name (FR1, AR1).
- Slot resolution and the flex and three-region layouts (FR2–FR4).
- The mobile-bar and drawer renderings of the bar itself (FR5, FR6).
- The `<nav>`'s positioning and styling inputs (FR8, FR9).
- The slot each descendant sits in, which TopNav menus read for popover
  alignment (FR7).

**Does not own / non-goals**

- Each item's rendering in each mode — owned by `component:TopNavItem`,
  `component:TopNavMenu`, `component:TopNavMegaMenu`,
  `component:TopNavMegaMenuItem`, `component:TopNavMegaMenuFeaturedCard`, and
  `component:TopNavHeading`.
- Which render mode applies and when — owned by `component:AppShell`.
- The drawer dialog, its header, focus behavior, and dismissal — owned by
  MobileNav; the toggle is MobileNav's `MobileNavToggle`.
- The exported `TopNavRenderContext` and `useTopNavRenderMode` — an uncontracted
  module; this record covers only how TopNav responds to the mode.

## Public concepts

| Concept     | Closed values or states           | Meaning                                         | Availability by variant/orientation/state | Default   | Owner                | Stability | Invalid-value behavior              |
| ----------- | --------------------------------- | ----------------------------------------------- | ----------------------------------------- | --------- | -------------------- | --------- | ----------------------------------- |
| Render mode | `default`, `mobile-bar`, `drawer` | Full bar, compact phone bar, or drawer content. | Set by AppShell or the exported context.  | `default` | `component:AppShell` | Stable    | TypeScript rejects other values.    |
| Slot        | `start`, `center`, `end`          | The region a descendant renders in.             | `default` mode.                           | `start`   | `component:TopNav`   | Stable    | Not caller-settable; set by TopNav. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                             | Basis                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | In `default` and `mobile-bar` modes TopNav renders one `<nav role="navigation">` named by `label`, or by the translated `@astryx.topNav.landmarkLabel` ("Top navigation") when `label` is omitted. It carries `top-nav`, the forwarded `ref`, and other DOM props; `mobile-bar` adds `data-mode="mobile-bar"`.                                                                        | Current source and tests |
| FR2 | `startContent` wins over `children`; `children` render as start content only when `startContent` is `null` or `undefined`.                                                                                                                                                                                                                                                            | Current source and tests |
| FR3 | Without `centerContent` the bar is a flex row: heading then start content at the inline start, end content pushed to the inline end. No region overlaps another; when the regions do not fit one row, the bar wraps and the end content moves to a second line, and a region wider than the whole bar wraps its own items (`spec:AST-102` FR4).                                       | Current source and tests |
| FR4 | With `centerContent` the bar has three regions that center the center content while the start and end regions each fit their equal share of one row; when they do not fit one row, the bar wraps as FR3 describes.                                                                                                                                                                    | Current source and tests |
| FR5 | `mobile-bar` mode renders the heading, then the end content and, when drawer content exists and auto toggles are on, the mobile nav toggle at the inline end. Start and center content do not render. The heading yields width first so end content and the toggle stay on screen. Drawer content exists when start or center content is present or AppShell passes side nav content. | Current source and tests |
| FR6 | `drawer` mode renders a MobileNav whose header is `heading` and whose body is start then center content in a vertical list, a divider when items and side nav content are both present, then any side nav content AppShell passes. With neither, TopNav renders nothing.                                                                                                              | Current source and tests |
| FR7 | In `default` mode TopNav tells start, center, and end descendants which slot they are in.                                                                                                                                                                                                                                                                                             | Current source           |
| FR8 | The `<nav>` itself is not a positioned element, so it creates no stacking context.                                                                                                                                                                                                                                                                                                    | Current source and tests |
| FR9 | `className`, `style`, and `xstyle` merge onto the `<nav>` after component styles in `default` and `mobile-bar` modes.                                                                                                                                                                                                                                                                 | Current source           |

### Allowed variation

- **AV1 — Slot content.** Caller content varies without becoming TopNav anatomy.
- **AV2 — Theme styling.** Themes may restyle `top-nav` per mode without changing
  regions, order, or the landmark.

### Representative states

| State                             | Required invariant                                                   | Allowed variation   |
| --------------------------------- | -------------------------------------------------------------------- | ------------------- |
| Heading and items, no center      | Flex row; end content at the inline end.                             | Gaps and padding.   |
| Center content present            | Three regions; center centered while each side fits its share (FR4). | Column content.     |
| Mobile bar with a long heading    | With auto toggles on, toggle and end content stay inside the bar.    | Heading truncation. |
| Mobile bar with no drawer content | No toggle.                                                           | —                   |
| Drawer with items and side nav    | Items, divider, side nav content.                                    | Item modes.         |

### Transformation and precedence order

- **ORD1 — Start content.** `startContent`, then `children` (FR2).

### Performance and resources

- **PR1 — No measurement.** TopNav observes no size and registers no listener.

## Accessibility contract

- **AR1 — Named landmark.** Every rendered bar is a navigation landmark with an
  accessible name (FR1).
- **AR2 — Toggle reachable.** In `mobile-bar` mode with drawer content and auto
  toggles on, the toggle stays fully on screen, and inside the opened drawer the close button
  stays fully in the viewport, even with a long heading.

## Design relationships

| Anatomy or state      | Design requirement                                | Representation authority       | Hierarchy role | Component contract |
| --------------------- | ------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Product icon and name | Heading slot at the inline start.                 | Current source and public docs | Prominent      | FR3, FR5           |
| Navigation items      | Start or center content.                          | Current source and public docs | Prominent      | FR2–FR4, FR6       |
| More menu             | A caller-placed menu; TopNav renders none itself. | Public docs                    | Supporting     | FR2                |
| Flex area             | End content for search, actions, or profile.      | Current source and public docs | Supporting     | FR3, FR5           |

No anatomy-theming map is recorded yet; the block is optional during migration.
Mapping TopNav's four anatomy parts against the family's seven targets, by
delegation where a part belongs to a sub-component, is deferred. Each family
component's record names its own target.

## Family and system relationships

- `component:AppShell` selects the render mode and passes side nav content.
- MobileNav renders the drawer TopNav fills.
- `architecture:component-theming-surface` owns target qualification.

## Verification map

| Contract      | Verification                                                                                      | Representative states                           | Mutation or failure expectation                                                                               | Audit section                |
| ------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, AR1      | `TopNav.test.tsx` landmark tests                                                                  | Default and mobile-bar; default and custom name | A missing role or name fails.                                                                                 | `audit:TopNav/accessibility` |
| FR2–FR4, FR8  | `TopNav.test.tsx` slot tests                                                                      | Each slot; all slots; center without start/end  | A dropped slot, wrong precedence, or positioned nav fails.                                                    | `audit:TopNav/layout`        |
| FR3, FR4 wrap | `TopNavTextSize.interaction.browser.spec.ts` at 1280 px and 100%, 200% and 250% default font size | Full Example; Centered With Start Content       | A navigation item covered by another region, a page that scrolls sideways, or a changed layout at 100% fails. | `audit:TopNav/layout`        |
| FR5, FR6      | `AppShell.test.tsx` mobile suites                                                                 | Heading-only; items; items with side nav        | A missing toggle or duplicated items fails.                                                                   | `audit:TopNav/behavior`      |
| AR2           | `TopNavMobileLongHeading.a11y.chromium.spec.ts`                                                   | Long heading at phone width                     | The toggle or close button leaves the viewport.                                                               | `audit:TopNav/accessibility` |
| RTL relation  | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TopNav / Full example`  | Heading and first navigation item; LTR and RTL  | A heading that is not at the inline start of the navigation items fails D2.                                   | `audit:TopNav/i18n-rtl`      |

Read from source, with no focused test yet: the mobile bar's part order (FR5); the drawer's `heading` header (FR6); other DOM props reaching the `<nav>` (FR1); the auto-toggle condition (FR5); rendering nothing in `drawer` mode with no content (FR6); the `top-nav` target and its `mode` state (FR1); the flex and three-region layout geometry at the default text size (FR3, FR4); that start and center content do not render in the mobile bar (FR5); the drawer's content order and divider (FR6); FR7; and FR9.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, item behavior, or
the drawer's dialog behavior. It links to their owners.

---

<!-- source: docs/specs/components/TopNav/TopNavHeading.spec.md -->


# TopNavHeading component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavHeading` with `logo`, `logoLabel`, `heading`, `superheading`, `subheading`, their `*Href` links, `headerEndContent`, `menu`, and `as`; target `top-nav-heading`. |
| Behavior                | The product identity block. Which parts are links and which part opens the menu follows from which `*Href` props and `menu` are set (FR2).                              |
| End-user impact         | Users reach product, suite, and account destinations and a product switcher menu; screen-reader users hear a named logo link and a named menu.                          |
| Builder impact          | None.                                                                                                                                                                   |
| Compatibility/readiness | Shipping FR5 delays the first hover-open for mouse and pen users; no public API change. Six implementation gaps (see Current-state impact).                             |
| Review checks           | Reject a logo link without an accessible name, a menu popup wrapped in a modal dialog, or a heading button placed inside `role="menu"`.                                 |
| Governing rules         | `architecture:public-component-api` INV5; `architecture:interaction-modality` (shared focus indicator); `architecture:component-theming-surface`.                       |

This table is a review projection; the body below is authoritative.

## Intent

TopNavHeading presents the product's logo and name, with optional suite and
account lines, in the TopNav heading slot. It owns how those parts become links
or a menu trigger and the product menu popover. Consumer usage lives in
`TopNavHeading.doc.mjs`.

## Compatibility and migration

- Released default preserved: `no`; shipping FR5 delays the first hover-open
  for mouse and pen users
- Compatibility class: records shipped behavior except FR5's first-open delay;
  no public API change
- Controlled/uncontrolled behavior: the menu's open state is internal
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Heading menu entry delay (FR5).** The menu opens on the first hover with
  no entry delay. FR5 requires the shared delay, with no wait only for a
  hand-off from another open menu in the same navigation.
- **Menu configurations drop DOM props.** When `menu` is set, other DOM props
  passed to TopNavHeading (beyond `data-testid`, `className`, `style`, `xstyle`,
  and `ref`) do not reach any element. `architecture:public-component-api` INV5
  requires accepted DOM, data, ARIA, and event inputs to reach the owning
  element.
- **Browser default focus rings.** The chevron menu button, the whole-heading
  link, the linked logo, the logo-only link, the menu-configuration heading
  link, and the popover's heading button do not use the shared focus outline;
  keyboard focus on them paints the browser's default ring.
  `architecture:interaction-modality` provides the shared focus indicator these
  controls bypass.

- **NavHeadingMenu nests a second menu.** The heading wraps `menu` in its own
  `role="menu"`; NavHeadingMenu, the documented `menu` content, adds another
  `role="menu"` inside it. WAI-ARIA 1.2 allows a `menu` to own only
  `menuitem`-family items and groups.
- **Links nested in the popover's heading button.** In the links-plus-trigger
  configuration, the popover's heading button repeats the superheading,
  heading, and subheading links inside itself, so interactive content is nested
  inside a button. HTML forbids interactive content inside a `<button>`.
- **The open menu repeats the identity row.** While the menu is open, its
  heading button repeats the logo and text that stay mounted in the bar's block,
  so that content renders twice. `architecture:component-style-authoring` INV7
  has content render once.

## Ownership boundary

**Owns**

- The identity block layout and its link and trigger configurations (FR1–FR6,
  FR11).
- The product menu popover and its close behavior (FR7–FR9).

**Does not own / non-goals**

- Destination acceptance and blocking for every `href` this component renders —
  owned by `family:navigation-destinations`.
- Menu content — owned by the caller; NavHeadingMenu items read the close action this
  component provides (NavHeadingMenu).
- The logo artwork — owned by the caller, typically NavIcon.
- The TopNav heading slot and mobile-bar placement — owned by `component:TopNav`.
- Popover positioning and layer hosting — owned by the shared popover and layer
  runtime.

## Public concepts

| Concept       | Closed values or states                                                            | Meaning                                                    | Availability by variant/orientation/state | Default | Owner                     | Stability | Invalid-value behavior |
| ------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- | ------- | ------------------------- | --------- | ---------------------- |
| Configuration | logo only, plain, whole link, independent links, whole trigger, links plus trigger | Derived from which `*Href` props and `menu` are set (FR2). | All.                                      | Plain   | `component:TopNavHeading` | Stable    | Not applicable.        |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Basis                    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1  | The root carries `top-nav-heading` and shows, in order: the logo, a text column (superheading, a heading row, subheading; plain-text lines and the menu-configuration heading link stay on one line with ellipsis, while lines rendered through the Link component wrap), and `headerEndContent` at the inline end. With `menu`, the heading row holds the heading then the chevron button; without `menu` there is no chevron. When the start region is crowded, a heading text column holding independent links keeps its longest word and wraps, and the row wraps before any link is clipped; a heading with no links still truncates first. The logo never shrinks.                              | Current source and tests |
| FR2  | Configuration: no `heading` and no `menu` → logo only, a link named by `logoLabel` when `headingHref` is set, else a `div`; `headingHref` alone without `menu` → the whole block is one link; other `*Href` props without `menu` → each line with an href is its own link and a linked logo is named by `logoLabel`, else `heading`; `menu` without any href → the whole block opens the menu; `menu` with hrefs → the links stay independent, and the chevron button and the rest of the block open the menu; otherwise a plain `div`.                                                                                                                                                               | Current source and tests |
| FR3  | The logo link, the whole-heading link, the logo-only link, and the menu-configuration heading link use the `as` component, else the `LinkProvider` link, else `<a>`. Supporting lines, and the heading line in the independent-links configuration, use the Link component, which does not receive `as`.                                                                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR4  | In both menu configurations, the chevron is a button named by the translated `@astryx.topNav.heading.openMenu` that toggles the menu; it is at least 28 by 28 px.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests |
| FR5  | On a hover-capable pointer, a first hover-open of the block waits the menu hover delay (150 ms by default, as in `TopNavMenu`), and moving to it from another open menu in the same navigation opens it at once (`architecture:interaction-modality` INV11; owner decision, Nov 6 2026 (Cindy); proposed in `design:motion` DEC-1). A hover-open does not move focus. A click within 500 ms of a hover-open keeps the menu open and moves focus to the first menu item, and a later click closes it.                                                                                                                                                                                                  | Cindy, 2026-11-06        |
| FR6  | Clicking a link inside a menu configuration navigates without toggling the menu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current source           |
| FR7  | The menu is a non-modal popover below the block, aligned to its start and overlapping it. It contains a heading button that closes the menu (see Current-state impact for its content), then a `role="menu"` region named by `heading` (or `@astryx.topNav.heading.dialogLabel`) that holds `menu`.                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests |
| FR8  | Escape closes the menu and returns focus to the trigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR9  | Descendants of `menu` receive a close action, which NavHeadingMenu items call on selection.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Current source           |
| FR10 | In the product menu's `role="menu"` region, a press (finger, pen or mouse) that lands on an enabled item and slides across the items acts on the one it lifts on, once, through that item's own activation, with the highlight following the pointer; a lift outside acts on nothing, and a mouse released outside closes the menu. The menu adopts `module:DropdownMenu/useMenuPress` for this (`family:action-groups` FR1–FR5; `module:DropdownMenu/useMenuPress` DEC-7). A press on caller content that is not an item, and a Ctrl-, Cmd- or Shift-click or a middle click on a link item, stays that content's or the browser's own, and keyboard and assistive-technology behavior is unchanged. | Current source and tests |
| FR11 | In both menu configurations, the chevron button's accessible name contains the visible `heading` when one is set, so a person who identifies the control by the product or workspace name they see hears that name (`family:buttons` FR1; WCAG 2.2 Label in Name). The name is one translated message, `@astryx.topNav.heading.openMenu`: "Acme, Open menu" in English for the heading "Acme". With no `heading`, or an empty one, it is the translated generic action, "Open menu", with no separator. Every shipped locale's message carries `{heading}` unchanged.                                                                                                                                 | Current source and tests |

### Allowed variation

- **AV1 — Logo artwork and lines.** Any combination of lines may be present; the
  block keeps its order.

### Representative states

| State                      | Required invariant                                            | Allowed variation |
| -------------------------- | ------------------------------------------------------------- | ----------------- |
| Heading with `headingHref` | One link wrapping logo and text.                              | —                 |
| Suite and product links    | Independent links; logo link named.                           | Line content.     |
| Menu, no hrefs             | Whole block triggers; chevron button named.                   | Menu content.     |
| Menu with hrefs            | Links independent; chevron and the rest of the block trigger. | Menu content.     |
| Logo only with href        | Link named by `logoLabel`.                                    | Artwork.          |

### Transformation and precedence order

- **ORD1 — Logo link name.** `logoLabel`, then `heading`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Named links.** A linked logo without adjacent link text is named by
  `logoLabel` or `heading`.
- **AR2 — Menu semantics.** The popup is not a modal dialog; `role="menu"`
  wraps only the menu content, never the popover's heading button.
- **AR3 — Named trigger.** The chevron button has a translated name and exposes
  the popover's expanded state.

## Design relationships

| Anatomy or state | Design requirement                                                     | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Logo             | Leading product mark.                                                  | Current source and public docs | Prominent      | FR1, FR2           |
| Heading lines    | Superheading, heading, subheading; plain lines stay on one line (FR1). | Current source and public docs | Prominent      | FR1                |
| Menu popover     | Overlaps the block; a heading button closes it.                        | Current source                 | Supporting     | FR7                |

`TopNavHeading.doc.mjs` declares no anatomy of its own, so no anatomy-theming map
is recorded.

## Family and system relationships

- `family:overlay-dismissal` owns Escape and close-request ordering for this
  component's popover.
- `family:navigation-destinations` owns the accept/block decision for each
  destination this component renders.
- `component:TopNav` places the heading in its heading slot and mobile bar.
- NavHeadingMenu items close this menu through the provided close action.
- `architecture:public-component-api` INV5 and `architecture:interaction-modality`
  govern the gaps under Current-state impact.

## Verification map

| Contract          | Verification                                                                                                                                                                                                                                                                                                       | Representative states                                                   | Mutation or failure expectation                                                                                                     | Audit section                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1–FR3, AR1      | `TopNav.test.tsx` TopNavHeading render and logo-name tests                                                                                                                                                                                                                                                         | Each configuration                                                      | A wrong element or unnamed logo link fails.                                                                                         | `audit:TopNavHeading/behavior`      |
| FR4, FR7, AR2–AR3 | `TopNav.test.tsx` menu popover semantics tests                                                                                                                                                                                                                                                                     | Whole trigger; links plus trigger                                       | A modal wrapper or misplaced menu role fails.                                                                                       | `audit:TopNavHeading/accessibility` |
| FR5, FR8          | `TopNav.test.tsx` hover/click guard tests. Evidence gap: no test of FR5's first-open delay or the hand-off                                                                                                                                                                                                         | Hover-open, click, late click, Escape                                   | Losing the guard or focus return fails.                                                                                             | `audit:TopNavHeading/behavior`      |
| FR10              | `TopNav.test.tsx` TopNavHeading menu-popover suite (touch and mouse slides)                                                                                                                                                                                                                                        | Touch and mouse slides across items                                     | Removing the adoption fails the slide tests.                                                                                        | —                                   |
| FR11              | `TopNav.test.tsx` TopNavHeading cases "includes the visible heading in the menu trigger name without hrefs", "includes the heading in the translated menu trigger name with independent links", and "keeps the translated generic menu trigger name when the optional heading is absent or empty" (Korean catalog) | Whole trigger; links plus trigger; no heading; empty heading            | A name without the heading, a translated name that drops it, or a dangling separator without a heading fails.                       | `audit:TopNavHeading/accessibility` |
| RTL relation      | RTL audit curated D2 and D8 target (`apps/storybook/rtl-audit/targets.json`) on `TopNav / Full example`                                                                                                                                                                                                            | Heading logo and title, with 0px start and 8px end padding; LTR and RTL | A logo that is not at the inline start of the title, or an end padding that stays on the same physical side in RTL, fails D2 or D8. | `audit:TopNavHeading/i18n-rtl`      |

Read from source, with no focused test yet: that clicking the block itself opens the menu in the menu-without-hrefs configuration (FR2); the `dialogLabel` fallback name of the menu (FR7); that the rest of the block opens the menu in the links-plus-trigger configuration (FR2); the `top-nav-heading` target (FR1); line truncation, part order, and `headerEndContent` (FR1); `as` and `LinkProvider` rendering (FR3); the chevron button's size (FR4); FR6; the popover's placement (FR7); and FR9.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, or popover
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/TopNav/TopNavItem.spec.md -->


# TopNavItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavItem` with `label`, `href`, `target`, `as`, `isSelected`, `isDisabled`, `isIconOnly`, `icon`, `children`, and `size`; target `top-nav-item` with `mode` and `selected` states.                                       |
| Behavior                | A link in the TopNav bar or drawer. Selected marks the current page; disabled drops the destination; in the drawer, activating it closes the drawer.                                                                        |
| End-user impact         | Users see and hear which destination is current; a disabled item cannot navigate by any input; drawer users return to the page after choosing a destination.                                                                |
| Builder impact          | None.                                                                                                                                                                                                                       |
| Compatibility/readiness | Records shipped behavior; no prop, default, target, or export changes. Two implementation gaps (see Current-state impact).                                                                                                  |
| Review checks           | Reject a disabled item that keeps an `href` or fires `onClick`, a selected item without `aria-current="page"`, an icon-only item without an accessible name, or a drawer item that leaves the drawer open after navigating. |
| Governing rules         | `component:TopNav` render modes; `spec:AST-085` (disabled items); `architecture:interaction-modality` (shared focus indicator); `architecture:component-theming-surface`.                                                   |

This table is a review projection; the body below is authoritative.

## Intent

TopNavItem is one destination link inside TopNav. It owns the link's selected,
disabled, and icon-only states and its rendering in the bar and in the mobile
drawer. Consumer usage lives in `TopNavItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; selection is caller-owned
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Caller props can replace item state.** Other DOM props spread onto the link
  after `aria-current`, `aria-disabled`, and `tabIndex`, so a caller value
  replaces them; a caller `aria-disabled` can hide a disabled item's state.
  `architecture:public-component-api` INV5 keeps component-owned accessibility
  from being overwritten by accident.
- **Color transition under reduced motion.** The bar link's background and text
  color still animate when reduced motion is requested; `design:reduced-motion`
  DR3 allows no animated property for a fine pointer.

## Ownership boundary

**Owns**

- The link element, its selected, disabled, and icon-only states, and its
  bar and drawer renderings (FR1–FR7).

**Does not own / non-goals**

- Destination acceptance and blocking for every `href` this component renders —
  owned by `family:navigation-destinations`.
- Which item is selected — owned by the caller.
- The bar's slots and render mode — owned by `component:TopNav` and
  `component:AppShell`.
- Router link rendering — owned by `LinkProvider` and the `as` component.

## Public concepts

| Concept   | Closed values or states | Meaning                                         | Availability by variant/orientation/state | Default | Owner                  | Stability | Invalid-value behavior            |
| --------- | ----------------------- | ----------------------------------------------- | ----------------------------------------- | ------- | ---------------------- | --------- | --------------------------------- |
| Selected  | `true`, `false`         | The item is the current page.                   | All modes.                                | `false` | `component:TopNavItem` | Stable    | Not applicable.                   |
| Disabled  | `true`, `false`         | The item cannot navigate.                       | All modes.                                | `false` | `component:TopNavItem` | Stable    | Not applicable.                   |
| Icon only | `true`, `false`         | Hides the visible text; `label` names the link. | All modes.                                | `false` | `component:TopNavItem` | Stable    | Without `icon` the link is empty. |
| Size      | `sm`, `md`, `lg`        | Drawer row height and padding.                  | Drawer mode only; no effect in the bar.   | `md`    | `component:TopNavItem` | Stable    | TypeScript rejects other values.  |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                | Basis                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | An enabled item renders the `as` component, else the `LinkProvider` link component, else `<a>`, with `href` and `target`, the forwarded `ref`, and other DOM props. It shows `icon`, then `children` if given, else `label`.                             | Current source and tests |
| FR2 | `isSelected` sets `aria-current="page"` and the selected treatment; the selected fill stays under hover and touch press with no overlay.                                                                                                                 | Current source and tests |
| FR3 | `isDisabled` renders a plain `<a>` with no `href` and no `target` and `aria-disabled="true"`, and suppresses clicks, so no input can navigate or fire `onClick`. A disabled item MUST keep the tab stop it has when enabled (`spec:AST-085` FR1).        | Current source and tests |
| FR4 | `isIconOnly` hides the text and sets `aria-label` to `label`.                                                                                                                                                                                            | Current source and tests |
| FR5 | In `default` and `mobile-bar` modes the item is a horizontal bar link with `top-nav-item`. In `drawer` mode it is a full-width row sized by `size`, carries `data-mode="drawer"`, and on activation calls `onClick` and then closes the AppShell drawer. | Current source and tests |
| FR6 | Both renderings paint the shared focus outline on keyboard focus and use the shared press feedback.                                                                                                                                                      | Current source           |
| FR7 | `className`, `style`, and `xstyle` merge after component styles.                                                                                                                                                                                         | Current source           |

### Allowed variation

- **AV1 — Theme styling.** Themes may restyle `top-nav-item` per mode and
  selected state.

### Representative states

| State     | Required invariant                            | Allowed variation |
| --------- | --------------------------------------------- | ----------------- |
| Rest      | Link with label.                              | Theme styling.    |
| Selected  | `aria-current="page"`; selected fill.         | Fill color.       |
| Disabled  | No `href`, no click; keeps its tab stop.      | Muted styling.    |
| Icon only | `aria-label` from `label`; no visible text.   | Icon.             |
| Drawer    | Full-width row; activation closes the drawer. | Row size.         |

### Transformation and precedence order

- **ORD1 — Root element.** Disabled `<a>`, then `as`, then `LinkProvider`, then
  `<a>`.
- **ORD2 — Content.** `children`, then `label`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Current page.** The selected item exposes `aria-current="page"`.
- **AR2 — Disabled.** A disabled item is exposed as disabled and keeps its tab
  stop (`spec:AST-085` FR1, FR5).
- **AR3 — Name.** An icon-only item is named by `label`.

## Design relationships

| Anatomy or state | Design requirement                | Representation authority       | Hierarchy role | Component contract |
| ---------------- | --------------------------------- | ------------------------------ | -------------- | ------------------ |
| Link             | Label with optional leading icon. | Current source and public docs | Prominent      | FR1, FR4           |
| Selected state   | Neutral fill and stronger text.   | Current source                 | Prominent      | FR2                |

`TopNavItem.doc.mjs` declares no anatomy of its own, so no anatomy-theming map
is recorded.

## Family and system relationships

- `family:navigation-destinations` owns the accept/block decision for each
  destination this component renders.
- `component:TopNav` supplies the render mode; `component:AppShell` supplies
  the drawer close action.
- `architecture:interaction-modality` provides the shared focus indicator.

## Verification map

| Contract           | Verification                                                                                     | Representative states                            | Mutation or failure expectation                                      | Audit section                    |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------- | -------------------------------- |
| FR1, ORD1          | `TopNav.test.tsx` TopNavItem anchor, `as`, LinkProvider tests                                    | Default, `as`, provider                          | Wrong element or lost precedence fails.                              | `audit:TopNavItem/behavior`      |
| FR2–FR4, AR1–AR3   | `TopNav.test.tsx` TopNavItem state tests                                                         | Selected, disabled, icon only                    | Missing attribute or a navigating disabled item fails.               | `audit:TopNavItem/accessibility` |
| FR5                | `TopNav.test.tsx` disabled-navigation tests in both modes                                        | Default and drawer                               | Lost click forwarding or href handling fails.                        | `audit:TopNavItem/behavior`      |
| RTL relation (FR1) | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TopNav / Full example` | The `Dashboard` item's leading icon; LTR and RTL | A leading icon that is not at the inline start of its item fails D2. | `audit:TopNavItem/i18n-rtl`      |

Read from source, with no focused test yet: the disabled plain `<a>` taking precedence over `as` and `LinkProvider` (ORD1, FR3); other DOM props reaching the link (FR1); the `top-nav-item` target and its `mode` and `selected` states (FR5); the selected fill under hover and press (FR2); the drawer row size, `data-mode="drawer"`, and closing the drawer on activation (FR5); FR6; and FR7.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples. It links to
their owners.

---

<!-- source: docs/specs/components/TopNav/TopNavMegaMenu.spec.md -->


# TopNavMegaMenu component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavMegaMenu` with `label`, `items` and `featured` slots, `delay` (150), `hideDelay` (250), and `onOpenChange`; target `top-nav-mega-menu` with a `mode` state.                                                                                    |
| Behavior                | In the bar, a button that opens a wide panel of links below the whole TopNav on hover or click; the panel is a labeled group, not an ARIA menu. In the drawer, a disclosure that expands items and featured content inline. Hidden in the mobile bar. |
| End-user impact         | Users browse a grid of destinations with descriptions and a featured card; keyboard users reach the panel's links from the trigger; drawer users expand the group in place.                                                                           |
| Builder impact          | None.                                                                                                                                                                                                                                                 |
| Compatibility/readiness | Records shipped behavior; no public change. Four current-state gaps (see Current-state impact).                                                                                                                                                       |
| Review checks           | Reject exposing the panel as `role="menu"`, wrapping it in a modal dialog, keyboard activation that closes an open panel, or a collapsed drawer group that stays reachable.                                                                           |
| Governing rules         | `architecture:public-component-api` INV5 and INV7; `architecture:interaction-modality`; `component:TopNav` render modes.                                                                                                                              |

This table is a review projection; the body below is authoritative.

## Intent

TopNavMegaMenu is a TopNav entry that reveals a large panel of destinations and
featured content. It owns the trigger, the panel's open, close, and dismissal
behavior, the panel layout, and the expandable drawer group. Consumer usage
lives in `TopNavMegaMenu.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: open state is internal; `onOpenChange`
  reports it
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The trigger announces a menu.** The trigger carries `aria-haspopup="true"`,
  which WAI-ARIA 1.2 defines as a menu popup, while the panel is a
  `role="group"` (FR5).
- **Motion under reduced motion.** The panel's fade and 4 px slide, the drawer
  group's height, the chevrons' rotation, and the trigger's background and text
  color still animate when reduced motion is requested. `design:reduced-motion` DR1–DR3 allow no animated property for a
  fine pointer and only a short opacity change for touch.
- **Same-label drawer groups share an id.** The drawer group's id is derived
  from `label`, so two mega menus with the same label in one drawer produce
  duplicate ids.
- **The drawer trigger drops the ref.** In `drawer` mode the disclosure button
  receives the caller's other DOM props but not `ref`.
  `architecture:public-component-api` INV8 has the ref reach the element the
  contract promises.

## Ownership boundary

**Owns**

- The trigger, panel, open/close and dismissal behavior, panel layout, and
  drawer group (FR1–FR11).

**Does not own / non-goals**

- Item rendering — owned by `component:TopNavMegaMenuItem`; featured cards —
  owned by `component:TopNavMegaMenuFeaturedCard` or the caller.
- Render mode and slot — owned by `component:TopNav`.
- Native popover dismissal and layer hosting — owned by the shared popover and
  layer runtime.

## Public concepts

No component-local concept beyond the consumer props in
`TopNavMegaMenu.doc.mjs`.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| FR1  | In `default` mode the trigger is a `<button>` showing `label` and a chevron that turns when open; it carries `top-nav-mega-menu`, the forwarded `ref`, and other DOM props, exposes `aria-expanded`, and its `aria-controls` names the panel.                                                                                                                                                                                                                                                                      | Current source and tests |
| FR2  | The panel is an auto popover with the trigger as its native invoker, anchored below the closest enclosing `<nav>` and aligned to the trigger's TopNav slot. The browser's light dismiss closes it, and opening a sibling mega menu closes it.                                                                                                                                                                                                                                                                      | Current source and tests |
| FR3  | On a hover-capable pointer, hovering opens after `delay` ms and the panel stays transient: leaving the trigger and panel closes it after `hideDelay` ms, and re-entering the trigger cancels a pending close. A click pins it open. A click within 500 ms of a hover-open pins rather than closes; re-hovering an open panel does not restart that window. After a close, the pointer entering the panel does not reopen it.                                                                                       | Current source and tests |
| FR4  | Enter and Space open the panel and never close an open one. Escape closes it and returns focus to the trigger.                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests |
| FR5  | The panel is a `role="group"` named by `label`, not a `menu` and not a modal dialog. The group is followed by a close button named by `@astryx.popover.close` that stays visually hidden until it holds focus. A click-open moves focus to the panel's first link or button; a hover-open does not move focus.                                                                                                                                                                                                     | Current source and tests |
| FR6  | The panel paints its own surface: `items` in a two-column grid, then `featured` beside it, wrapping on narrow widths. The panel is at most `min(960px, 100dvw − 16px)` wide and at most the space below the nav tall; taller content scrolls inside the panel. Without a reduced-motion preference, opening fades and slides in from 4 px above.                                                                                                                                                                   | Current source           |
| FR7  | `onOpenChange` fires `true` when the panel shows and `false` when it hides, whatever the cause.                                                                                                                                                                                                                                                                                                                                                                                                                    | Current source           |
| FR8  | Caller `onClick`, `onMouseEnter`, and `onMouseLeave` on the trigger run before the built-in behavior and compose with it; a caller handler that calls `preventDefault()` cancels the built-in open or toggle for that event.                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR9  | In `drawer` mode the trigger is a full-width disclosure button with `aria-expanded` and `aria-controls` and `data-mode="drawer"`; activating it toggles the group, which holds `items` (rendering their drawer form) then `featured`. Collapsed content is `inert` and `aria-hidden`, and the group clips while collapsed and while it expands, and stops clipping once fully expanded. Without a reduced-motion preference, expansion animates the group's height. The trigger's `aria-controls` names the group. | Current source and tests |
| FR10 | In `mobile-bar` mode TopNavMegaMenu renders nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Current source and tests |
| FR11 | The bar trigger and drawer trigger paint the shared focus outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source and tests |

### Allowed variation

- **AV1 — Slot content.** `items` may be any nodes; `featured` may be any nodes.

### Representative states

| State            | Required invariant                              | Allowed variation |
| ---------------- | ----------------------------------------------- | ----------------- |
| Hover-open       | Transient; closes when the pointer leaves.      | Delays.           |
| Click-open       | Pinned; stays open when the pointer leaves.     | —                 |
| Keyboard-open    | Opens on Enter or Space; Escape returns focus.  | —                 |
| Tall content     | Panel scrolls inside; surface edges stay fixed. | Height.           |
| Drawer collapsed | Content inert and hidden.                       | —                 |

### Transformation and precedence order

- **ORD1 — Trigger handlers.** Caller handler first, then the built-in handler.

### Performance and resources

- **PR1 — Timers.** Hover timers clear on close and unmount.

## Accessibility contract

- **AR1 — Group, not menu.** A link grid is exposed as a named group, not an
  ARIA menu, and not a modal dialog.
- **AR2 — Trigger state.** The trigger exposes its expanded state and the panel
  it controls.
- **AR3 — Drawer disclosure.** The drawer trigger exposes its expanded state;
  collapsed content is unreachable.

## Design relationships

| Anatomy or state | Design requirement                                       | Representation authority       | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Trigger          | Bar-item styling with a chevron.                         | Current source and public docs | Prominent      | FR1                |
| Panel            | Wide surface below the nav: item grid and featured area. | Current source and public docs | Prominent      | FR6                |
| Drawer group     | Disclosure row with items and featured content.          | Current source                 | Supporting     | FR9                |

`TopNavMegaMenu.doc.mjs` declares no anatomy of its own, so no anatomy-theming
map is recorded.

## Family and system relationships

- `family:overlay-dismissal` owns Escape and close-request ordering for this
  component's popover.
- `component:TopNav` supplies the render mode and slot and is the panel's anchor.
- `architecture:public-component-api` INV5 and INV7 govern forwarding and
  handler composition.

## Verification map

| Contract          | Verification                                                                                                     | Representative states                              | Mutation or failure expectation                                              | Audit section                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| FR1, FR5, AR1–AR2 | `TopNavMegaMenu.test.tsx` default-mode and popup-semantics suites                                                | Closed and open                                    | A menu role, dialog wrapper, or broken link fails.                           | `audit:TopNavMegaMenu/accessibility` |
| FR2, FR3          | `TopNavMegaMenu.test.tsx` hover/click guard and dismissal suites                                                 | Hover, click, leave, sibling, light dismiss        | A lost guard or stale open state fails.                                      | `audit:TopNavMegaMenu/behavior`      |
| FR4               | `TopNavMegaMenu.test.tsx` keyboard suite                                                                         | Enter, Space, Escape                               | Toggling closed or lost focus return fails.                                  | `audit:TopNavMegaMenu/accessibility` |
| FR8               | `TopNavMegaMenu.test.tsx` pass-through and owned-handler suites                                                  | Bar and drawer                                     | A replaced handler fails.                                                    | `audit:TopNavMegaMenu/behavior`      |
| FR9–FR11, AR3     | `TopNavMegaMenu.test.tsx` mobile-bar, drawer, and focus-ring suites                                              | Collapsed and expanded                             | Reachable collapsed content or a missing ring fails.                         | `audit:TopNavMegaMenu/behavior`      |
| RTL relation      | RTL audit curated D4 target (`apps/storybook/rtl-audit/targets.json`) on `TopNavMenu / Mega menu` (panel opened) | An open start-aligned mega menu panel; LTR and RTL | A panel that does not move to the mirrored side of the page in RTL fails D4. | `audit:TopNavMegaMenu/i18n-rtl`      |

Read from source, with no focused test yet: the visually hidden close button after the group (FR5); the forwarded `ref`, the `top-nav-mega-menu` target and its `mode` state, and the bar and drawer chevrons' turn (FR1, FR9); the drawer group's clipping while it expands and its height animation (FR9); where a click-open puts focus (FR5); the caller `preventDefault()` cancellation (FR8); anchoring below the enclosing `<nav>` and slot alignment (FR2); FR6; FR7; and the bar trigger's focus outline (FR11).

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, or popover
mechanics. It links to their owners.

---

<!-- source: docs/specs/components/TopNav/TopNavMegaMenuFeaturedCard.spec.md -->


# TopNavMegaMenuFeaturedCard component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavMegaMenuFeaturedCard` with `title`, `description`, `image`, `imageAlt`, `linkLabel`, `linkHref`, and `children`; target `top-nav-mega-menu-featured-card`. |
| Behavior                | A promotional card for a mega menu's featured slot: optional image, title, description, an optional call-to-action link, then caller content.                     |
| End-user impact         | Users see a highlighted destination; screen-reader users skip a decorative image unless `imageAlt` names it.                                                      |
| Builder impact          | None.                                                                                                                                                             |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap (see Current-state impact).                                                                    |
| Review checks           | Reject an image without `imageAlt` that is exposed to assistive technology, or a link rendered when only one of `linkLabel` and `linkHref` is set.                |
| Governing rules         | `design:bidirectionality` DR4; `architecture:interaction-modality`; `architecture:component-theming-surface`.                                                     |

This table is a review projection; the body below is authoritative.

## Intent

TopNavMegaMenuFeaturedCard fills a TopNavMegaMenu's featured slot with a card
that promotes one destination. Consumer usage lives in
`TopNavMegaMenuFeaturedCard.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Browser default focus ring.** The call-to-action link does not use the shared
  focus outline; keyboard focus paints the browser's default ring.
  `architecture:interaction-modality` provides the shared indicator it bypasses.

## Ownership boundary

**Owns**

- The card's content order, image semantics, and link condition (FR1–FR4).

**Does not own / non-goals**

- Destination acceptance and blocking for every `href` this component renders —
  owned by `family:navigation-destinations`.
- Placement in the panel and drawer — owned by `component:TopNavMegaMenu`.
- Caller `children` content.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                        | Basis                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root `div` carries `top-nav-mega-menu-featured-card`, the forwarded `ref`, and other DOM props, and shows: the image (full width, 140 px tall) when `image` is set, then the title, description, link, and `children`.       | Current source and tests |
| FR2 | Without `imageAlt` the image is decorative: `alt=""`, `role="presentation"`, and `aria-hidden="true"`. With `imageAlt` it is a normal image with that alternative text.                                                          | Current source and tests |
| FR3 | The link renders only when both `linkLabel` and `linkHref` are set, through the `LinkProvider` link component, as `linkLabel` followed by ` →`; the arrow mirrors once in right-to-left layouts (`design:bidirectionality` DR4). | Current source and tests |
| FR4 | `className`, `style`, and `xstyle` merge after component styles.                                                                                                                                                                 | Current source           |

### Allowed variation

- **AV1 — Optional parts.** Image, description, link, and children may each be
  absent.

### Representative states

| State            | Required invariant                      | Allowed variation |
| ---------------- | --------------------------------------- | ----------------- |
| Decorative image | Image hidden from assistive technology. | Image.            |
| Described image  | Image exposed with `imageAlt`.          | —                 |
| With link        | Link after the description.             | Label.            |

### Transformation and precedence order

- No precedence rule.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Image semantics.** FR2.

## Design relationships

| Anatomy or state | Design requirement                              | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Card             | Image above a body of title, description, link. | Current source and public docs | Supporting     | FR1, FR3           |

`TopNavMegaMenuFeaturedCard.doc.mjs` declares no anatomy of its own, so no
anatomy-theming map is recorded.

## Family and system relationships

- `family:navigation-destinations` owns the accept/block decision for each
  destination this component renders.
- `component:TopNavMegaMenu` renders the card in its featured area.
- `design:bidirectionality` DR4 governs the link glyph.

## Verification map

| Contract           | Verification                                                                                                       | Representative states                                                                       | Mutation or failure expectation                                                                                                                                                                                            | Audit section                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| FR1                | `TopNav.test.tsx` featured-card rest-forwarding test                                                               | Root props                                                                                  | Dropped props fail.                                                                                                                                                                                                        | `audit:TopNavMegaMenuFeaturedCard/behavior`      |
| FR2, FR3           | `TopNav.test.tsx` featured-card image tests                                                                        | With and without `imageAlt`                                                                 | Exposed decorative image or lost link fails.                                                                                                                                                                               | `audit:TopNavMegaMenuFeaturedCard/accessibility` |
| FR3 (RTL arrow)    | `TopNav.test.tsx` featured-card arrow-mirror test, plus real-browser evidence                                      | Link with a label, LTR and RTL                                                              | An arrow that points right in RTL, or a link name that changes, fails. Gap: the unit test sees the mirror class but not the inline-block box the transform needs; no committed browser check fails on an unmirrored arrow. | `audit:TopNavMegaMenuFeaturedCard/i18n-rtl`      |
| RTL relation (FR3) | RTL audit curated D4 target (`apps/storybook/rtl-audit/targets.json`) on `TopNavMenu / Featured card / Link arrow` | The link arrow against its label (the fixture link box is the label and arrow); LTR and RTL | An arrow that keeps its LTR side of the label in RTL fails D4. The glyph mirror itself is covered by the FR3 (RTL arrow) row.                                                                                              | `audit:TopNavMegaMenuFeaturedCard/i18n-rtl`      |

Read from source, with no focused test yet: the content order (FR1); the forwarded `ref` and the `top-nav-mega-menu-featured-card` target (FR1); that the link renders only when both `linkLabel` and `linkHref` are set (FR3); the image size (FR1), the `LinkProvider` link (FR3), and FR4.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples. It links to their
owners.

---

<!-- source: docs/specs/components/TopNav/TopNavMegaMenuItem.spec.md -->


# TopNavMegaMenuItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavMegaMenuItem` with `title`, `description`, `icon`, `href`, `onClick`, and `as`; target `top-nav-mega-menu-item` with a `mode` state.                                   |
| Behavior                | One destination in a mega menu: a rich tile in the desktop panel and a row in the drawer. A drawer row closes the drawer on activation.                                       |
| End-user impact         | Users see a title, description, and icon per destination. Keyboard users cannot reach or activate a desktop item that has `onClick` but no `href` (see Current-state impact). |
| Builder impact          | None.                                                                                                                                                                         |
| Compatibility/readiness | Records shipped behavior; no public change. Two implementation gaps (see Current-state impact).                                                                               |
| Review checks           | Reject a drawer item that leaves the drawer open after activation or drops caller props and styling.                                                                          |
| Governing rules         | `architecture:interaction-modality` INV4; WCAG 2.1.1; `component:TopNav` render modes.                                                                                        |

This table is a review projection; the body below is authoritative.

## Intent

TopNavMegaMenuItem is one destination inside a TopNavMegaMenu. It renders itself
for the desktop panel or the mobile drawer from the TopNav render mode. Consumer
usage lives in `TopNavMegaMenuItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Desktop action items are not keyboard operable.** In the desktop panel, an
  item with `onClick` and no `href` renders a `div` with no role and no tab
  stop, so keyboard users cannot reach or activate it. WCAG 2.1.1 and
  `architecture:interaction-modality` INV4 require an operable keyboard path.
- **Color transition under reduced motion.** The desktop tile's background color
  still animates when reduced motion is requested; `design:reduced-motion` DR3
  allows no animated property for a fine pointer.

## Ownership boundary

**Owns**

- The item element in both modes, its content order, and drawer close on
  activation (FR1–FR4).

**Does not own / non-goals**

- Destination acceptance and blocking for every `href` this component renders —
  owned by `family:navigation-destinations`.
- Panel layout, grid, and the drawer group — owned by
  `component:TopNavMegaMenu`.
- Router link rendering — owned by `LinkProvider` and `as`.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                       | Basis                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | Outside the drawer the item is the `as` component, else the `LinkProvider` link, else `<a>` when `href` is set, and a `div` otherwise. It shows an icon box, then the title and the description, carries `top-nav-mega-menu-item`, and runs `onClick` on click. | Current source and tests |
| FR2 | In `drawer` mode the item is a link when `href` is set and a `<button type="button">` otherwise, carries `data-mode="drawer"`, and on activation runs `onClick` and then closes the AppShell drawer.                                                            | Current source and tests |
| FR3 | Both modes forward the `ref`, `tabIndex`, other DOM props, and event handlers, and merge `className`, `style`, and `xstyle` after component styles.                                                                                                             | Current source and tests |
| FR4 | Both modes paint the shared focus outline on keyboard focus and use the shared press feedback.                                                                                                                                                                  | Current source and tests |

### Allowed variation

- **AV1 — Optional parts.** Icon and description may be absent.

### Representative states

| State         | Required invariant                        | Allowed variation |
| ------------- | ----------------------------------------- | ----------------- |
| Desktop link  | Link tile with title and description.     | Icon.             |
| Drawer link   | Row link; activation closes the drawer.   | —                 |
| Drawer action | Button row; activation closes the drawer. | —                 |

### Transformation and precedence order

- **ORD1 — Link element.** `as`, then `LinkProvider`, then `<a>`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Drawer actions are buttons.** A drawer item without `href` is a native
  button.
- **AR2 — Link names.** A link item's name is its title and description text.

## Design relationships

| Anatomy or state | Design requirement                         | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------ | ------------------------------ | -------------- | ------------------ |
| Tile             | Icon box, title, description.              | Current source and public docs | Supporting     | FR1                |
| Drawer row       | Nav-row styling with optional description. | Current source                 | Supporting     | FR2                |

`TopNavMegaMenuItem.doc.mjs` declares no anatomy of its own, so no
anatomy-theming map is recorded.

## Family and system relationships

- `family:navigation-destinations` owns the accept/block decision for each
  destination this component renders.
- `component:TopNavMegaMenu` places items in its panel grid and drawer group.

## Verification map

| Contract     | Verification                                                                                                     | Representative states           | Mutation or failure expectation                               | Audit section                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| FR1, FR2     | `TopNavMegaMenu.test.tsx` TopNavMegaMenuItem and drawer-item tests                                               | Desktop; drawer link/button     | Wrong element or lost description fails.                      | `audit:TopNavMegaMenuItem/behavior`      |
| FR3          | `TopNavMegaMenu.test.tsx` TopNavMegaMenuItem pass-through tests                                                  | Both modes                      | Dropped props or styling fails.                               | `audit:TopNavMegaMenuItem/behavior`      |
| FR4          | `TopNavMegaMenu.test.tsx` drawer focus-ring test                                                                 | Drawer item                     | Missing shared ring classes fail.                             | `audit:TopNavMegaMenuItem/accessibility` |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TopNavMenu / Mega menu` (panel opened) | Item icon and text; LTR and RTL | An icon that is not at the inline start of its text fails D2. | `audit:TopNavMegaMenuItem/i18n-rtl`      |

Read from source, with no focused test yet: the drawer button's `type="button"` (FR2); a desktop item's `onClick` and icon box (FR1); press feedback (FR4); the `div` for a desktop item without `href` (FR1); the desktop item's forwarded `tabIndex` (FR3); the forwarded `ref` and the `top-nav-mega-menu-item` target and its `mode` state (FR1–FR3); the `as` and `LinkProvider` precedence (FR1, ORD1); closing the drawer on activation (FR2) and the desktop focus outline (FR4).

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples. It links to their
owners.

---

<!-- source: docs/specs/components/TopNav/TopNavMenu.spec.md -->


# TopNavMenu component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `TopNavMenu` with `label`, `items` (`{title, description?, icon?, href?, onClick?}`), `delay` (150), and `hideDelay` (200); target `top-nav-menu`.                                           |
| Behavior                | In the bar, a button that opens a menu of rich items on hover or click, with APG menu keyboard support. In the drawer, a disclosure that expands its items inline. Hidden in the mobile bar. |
| End-user impact         | Mouse users preview destinations on hover; keyboard users move through items with arrows and typeahead; drawer users expand the group in place.                                              |
| Builder impact          | None.                                                                                                                                                                                        |
| Compatibility/readiness | Records shipped behavior; no public change. Three current-state gaps (see Current-state impact).                                                                                             |
| Review checks           | Reject wrapping the popup in a modal dialog, more than one tab stop among items, a collapsed drawer group that stays reachable, or caller trigger handlers that replace the built-in ones.   |
| Governing rules         | `architecture:public-component-api` INV5 and INV7; `architecture:interaction-modality`; `component:TopNav` render modes.                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

TopNavMenu is a TopNav entry that groups several destinations under one label.
It owns the trigger, the hover or click menu popover in the bar, and the
expandable group in the mobile drawer. Consumer usage lives in
`TopNavMenu.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: open and expanded states are internal
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Drawer action items are not keyboard operable.** A drawer item with only
  `onClick` renders a link without `href`, so keyboard users cannot reach or
  activate it. WCAG 2.1.1 and `architecture:interaction-modality` INV4 require an
  operable keyboard path.
- **Motion under reduced motion.** The drawer group's height, the bar and
  drawer chevrons' rotation, the trigger's background and text color, and each
  bar item's background color still animate when reduced motion is requested;
  `design:reduced-motion` DR1–DR3 allow no animated property for a fine pointer
  and only a short opacity change for touch.
- **The drawer trigger drops the ref.** In `drawer` mode the disclosure button
  receives the caller's other DOM props but not `ref`.
  `architecture:public-component-api` INV8 has the ref reach the element the
  contract promises.

## Ownership boundary

**Owns**

- The trigger button, the menu popover and its items, keyboard handling, and the
  drawer group (FR1–FR10).

**Does not own / non-goals**

- Destination acceptance and blocking for every `href` this component renders —
  owned by `family:navigation-destinations`.
- Render mode and slot — owned by `component:TopNav`.
- Popover positioning, native light dismiss, and layer hosting — owned by the
  shared popover and layer runtime.
- Rich panel layouts — owned by `component:TopNavMegaMenu`.

## Public concepts

| Concept   | Closed values or states                                    | Meaning                    | Availability by variant/orientation/state | Default | Owner                  | Stability | Invalid-value behavior               |
| --------- | ---------------------------------------------------------- | -------------------------- | ----------------------------------------- | ------- | ---------------------- | --------- | ------------------------------------ |
| Menu item | `title`, optional `description`, `icon`, `href`, `onClick` | One destination or action. | Bar and drawer.                           | —       | `component:TopNavMenu` | Stable    | A rejected `href` renders no `href`. |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Basis                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1  | In `default` mode the trigger is a `<button>` showing `label` and a chevron that turns when open; it carries `top-nav-menu`, the forwarded `ref`, and other DOM props, and announces a menu popup with its expanded state.                                                                                                                                                                                                                                                                                                                                                                                                                                    | Current source and tests |
| FR2  | On a hover-capable pointer, hovering the trigger opens the menu after `delay` ms and leaving the trigger and the menu closes it after `hideDelay` ms; a hover-open does not move focus. A click opens the menu and moves focus to the first item; a click within 500 ms of a hover-open keeps it open.                                                                                                                                                                                                                                                                                                                                                        | Current source and tests |
| FR3  | The popup is a non-modal popover below the trigger, aligned to the trigger's TopNav slot (start, center, or end). It contains one `role="menu"` named by `label`, followed by a close button named by `@astryx.popover.close` that stays visually hidden until it holds focus.                                                                                                                                                                                                                                                                                                                                                                                | Current source and tests |
| FR4  | Each item is a `role="menuitem"`: an `<a>` when `href` is set (rendering its `href` only when the URL is accepted), else a `div`. Bar items render a native `<a>`, not the `LinkProvider` link. It shows an icon box, the title, and the description, and runs the item's `onClick` on activation.                                                                                                                                                                                                                                                                                                                                                            | Current source and tests |
| FR5  | Items use a roving tab index with exactly one tab stop. ArrowDown and ArrowUp move focus and wrap at both ends; typing a character moves to the matching item; Enter or Space activates the focused item; Escape closes the menu and returns focus to the trigger.                                                                                                                                                                                                                                                                                                                                                                                            | APG menu pattern; tests  |
| FR6  | Caller `onClick`, `onMouseEnter`, and `onMouseLeave` on the trigger run before the built-in open behavior and compose with it instead of replacing it; a caller handler that calls `preventDefault()` cancels the built-in open or toggle for that event. Caller attributes never override the popup wiring.                                                                                                                                                                                                                                                                                                                                                  | Current source and tests |
| FR7  | In `drawer` mode the trigger is a full-width disclosure button with `aria-expanded` and `aria-controls`; activating it toggles the group. Collapsed items are `inert` and `aria-hidden`, and the group clips while collapsed and while it expands, and stops clipping once fully expanded. Without a reduced-motion preference, expansion animates the group's height.                                                                                                                                                                                                                                                                                        | Current source and tests |
| FR8  | Drawer items render through the `LinkProvider` link component; activating one runs the item's `onClick` and then closes the AppShell drawer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source           |
| FR9  | In `mobile-bar` mode TopNavMenu renders nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source           |
| FR10 | The trigger, each bar item, and each drawer control paint the shared focus outline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Current source and tests |
| FR11 | In the open menu, a press (finger, pen or mouse) that lands on an enabled item and slides across the items acts on the one it lifts on, once, through that item's own activation, with the highlight following the pointer; a lift outside acts on nothing, and a mouse released outside closes the menu. The menu adopts `module:DropdownMenu/useMenuPress` for this (`family:action-groups` FR1–FR5; `module:DropdownMenu/useMenuPress` DEC-7). Link items are undraggable, so a mouse slide is not a drag; a Ctrl-, Cmd- or Shift-click or a middle click on a link item stays the browser's; and keyboard and assistive-technology behavior is unchanged. | Current source and tests |

### Allowed variation

- **AV1 — Timing.** `delay` and `hideDelay` vary per caller.

### Representative states

| State            | Required invariant                                | Allowed variation |
| ---------------- | ------------------------------------------------- | ----------------- |
| Closed           | Trigger with collapsed state.                     | Theme styling.    |
| Hover-open       | Menu open; focus does not move.                   | Delay.            |
| Click-open       | Menu open; focus on the first item.               | —                 |
| Drawer collapsed | Items inert and hidden from assistive technology. | —                 |
| Drawer expanded  | Items reachable; activation closes the drawer.    | Animation.        |

### Transformation and precedence order

- **ORD1 — Trigger handlers.** Caller handler first, then the built-in handler
  (FR6).

### Performance and resources

- **PR1 — Timers.** Hover timers clear on close and on unmount.

## Accessibility contract

- **AR1 — Menu semantics.** The popup is not a modal dialog; the trigger
  announces a menu popup; items are `menuitem`s inside one named `menu`.
- **AR2 — Keyboard.** FR5's keys follow the APG menu pattern.
- **AR3 — Drawer disclosure.** The drawer trigger exposes its expanded state and
  controls the group; collapsed items are unreachable.

## Design relationships

| Anatomy or state | Design requirement                  | Representation authority       | Hierarchy role | Component contract |
| ---------------- | ----------------------------------- | ------------------------------ | -------------- | ------------------ |
| Trigger          | Bar-item styling with a chevron.    | Current source and public docs | Prominent      | FR1                |
| Menu item        | Icon box, title, description.       | Current source and public docs | Supporting     | FR4                |
| Drawer group     | Disclosure row with indented items. | Current source                 | Supporting     | FR7                |

`TopNavMenu.doc.mjs` declares no anatomy of its own, so no anatomy-theming map is
recorded.

## Family and system relationships

- `family:overlay-dismissal` owns Escape and close-request ordering for this
  component's popover.
- `family:navigation-destinations` owns the accept/block decision for each
  destination this component renders.
- `component:TopNav` supplies the render mode and slot.
- `architecture:public-component-api` INV5 and INV7 govern forwarding and
  handler composition.
- `architecture:interaction-modality` provides the shared focus indicator.

## Verification map

| Contract          | Verification                                                                                                  | Representative states                                       | Mutation or failure expectation                                               | Audit section                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| FR1, FR3, AR1     | `TopNavMenu.test.tsx` trigger and semantics tests                                                             | Closed and open                                             | A dialog wrapper or wrong popup type fails.                                   | `audit:TopNavMenu/accessibility` |
| FR4, FR5, AR2     | `TopNavMenu.test.tsx` keyboard tests                                                                          | Arrows, wrap, typeahead, Enter, Escape                      | Extra tab stops or lost activation fails.                                     | `audit:TopNavMenu/accessibility` |
| FR6               | `TopNavMenu.test.tsx` pass-through and owned-handler tests                                                    | Bar and drawer triggers                                     | A replaced built-in handler or lost prop fails.                               | `audit:TopNavMenu/behavior`      |
| FR7, FR10, AR3    | `TopNavMenu.test.tsx` drawer tests                                                                            | Collapsed and expanded                                      | Reachable collapsed items or a missing ring fails.                            | `audit:TopNavMenu/behavior`      |
| Shared menu focus | `useMenuHover.test.tsx`                                                                                       | Hover-open, click-open, Escape, Enter and Space             | Focus moved on hover, not moved in on click, or not returned on Escape fails. | `audit:TopNavMenu/accessibility` |
| FR11              | `TopNavMenu.test.tsx` action-group suite (touch and mouse slides)                                             | Touch and mouse slides across items; undraggable link items | Removing the adoption fails the slide tests.                                  | —                                |
| RTL relation      | RTL audit curated D4 target (`apps/storybook/rtl-audit/targets.json`) on `TopNavMenu / Default` (menu opened) | An open start-aligned menu panel; LTR and RTL               | A panel that does not move to the mirrored side of the page in RTL fails D4.  | `audit:TopNavMenu/i18n-rtl`      |

Read from source, with no focused test yet: the visually hidden close button after the menu (FR3); the native `<a>` for bar items, the icon box, and the description (FR4); the forwarded `ref`, the `top-nav-menu` target, and the bar and drawer chevrons' turn (FR1, FR7); the drawer group's clipping while it expands and its height animation (FR7); the caller `preventDefault()` cancellation (FR6); hover opening and closing with `delay` and `hideDelay` (FR2); slot alignment (FR3); FR8; FR9; and the bar trigger and item parts of FR10.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Should bar menu items render through the `LinkProvider` link, as the
  drawer items do?** (`human-api`) Today bar items render a native `<a>` and
  drawer items the `LinkProvider` link (FR4, FR8).

## Content boundary

This file does not duplicate consumer prop tables, examples, or popover
mechanics. It links to their owners.
