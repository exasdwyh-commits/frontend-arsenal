---
schema_version: 3
template_version: 7
kind: component
id: component:Button
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-25
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Button/Button.test.tsx,
    packages/core/src/Button/Button.hitArea.test.tsx,
    packages/core/src/ButtonGroup/ButtonGroup.test.tsx,
    packages/core/src/Button/__tests__/Button.a11y.test.tsx,
    packages/core/src/Button/__tests__/Button.a11y.chromium.spec.ts,
    packages/core/src/Button/__tests__/ButtonTextSize.interaction.browser.spec.ts,
    packages/core/src/__tests__/ReducedMotionPress.a11y.chromium.spec.ts,
    packages/core/src/Layout/__tests__/edgeCompensation.test.tsx,
    packages/core/src/utils/pressFeedback.test.ts,
  ]
modules: []
families: [family:buttons, family:navigation-destinations]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-005, spec:AST-085, spec:AST-086]
---

# Button component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. This record states the shipped Button surface: `label`, variant, size, elevation, content mode, loading and `clickAction`, `isInterruptible`, disabled, tooltip, width, form attributes, and link mode.                                                                                                                        |
| Behavior                | A named native `<button type="button">` by default. Pending work shows a centered Spinner over content that keeps its space, sets `aria-busy`, and stays focusable. `href` renders a link unless the Button is truly disabled.                                                                                                               |
| End-user impact         | Everyone gets one action control whose size does not move when it loads. Keyboard users keep focus on a busy Button. A disabled Button without a tooltip is still removed from the tab order, so keyboard users cannot find it or hear that it is disabled.                                                                                  |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                                                        |
| Compatibility/readiness | Records shipped behavior, except FR15's mouse and pen press (Current-state impact); no API, default, or DOM change. Native `disabled` on a truly disabled Button conflicts with `spec:AST-085` FR1 and FR4, and the Spinner fade under reduced motion conflicts with `design:reduced-motion` DR3; all are listed under Current-state impact. |
| Review checks           | Reject a Button with no accessible name, a pending state that changes outer size or drops focus, a fire-once `clickAction` that runs twice for one double-click, a disabled link that still navigates, or `data-*` theme state that disagrees with painted state.                                                                            |
| Governing rules         | `family:buttons` FR1–FR10; `family:navigation-destinations` FR1–FR7; `spec:AST-085` FR1–FR7; `spec:AST-086` FR3–FR4; `architecture:component-size-cascade` INV3–INV5; `architecture:interaction-modality` INV1, INV5; `design:reduced-motion` DR1, DR3.                                                                                      |

This table is a review projection; the body below is authoritative.

## Intent

Button is the family's momentary action control. It owns the shared action
surface `family:buttons` assigns to it: native button semantics, accessible
naming, size, visual variant, press and focus feedback, pending presentation,
link mode, and resting elevation. Consumer usage lives in `Button.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `variant="secondary"`, `size="md"`,
  `elevation="none"`, and `type="button"` are the defaults
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change
- Controlled/uncontrolled behavior: not applicable; Button holds no value.
  Pending state comes from `isLoading` or an in-flight `clickAction`
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The action surface: root element choice, accessible name, content order,
  size, width and truncation, variant paint, hover, press, and focus feedback.
- Click and `clickAction` sequencing, fire-once deduplication, and the
  interruptible opt-out.
- Pending presentation: Spinner overlay, hidden content, `aria-busy`, and the
  loading announcement region.
- The touch band under a coarse pointer (`spec:AST-094` FR42), carried by the
  content wrapper's `::after`; the root's `::before` and `::after` stay as FR15
  and callers use them.
- Busy-only and disabled operability guards.
- Link mode's rendering choice and its disabled fallback.
- Standalone resting elevation and the `button` theme target.
- The ghost variant's edge-compensation marker.

**Does not own / non-goals**

- Connected-group corners, dividers, inherited disabled state, roving focus,
  and shared elevation — owned by `component:ButtonGroup` under
  `family:buttons` FR8 and FR12. Button paints what the group context
  supplies.
- InputGroup addon geometry — owned by `component:InputGroup`.
- Icon-only as a dedicated component — owned by `component:IconButton`.
- Persistent pressed state — owned by `component:ToggleButton`.
- Destination acceptance and custom-router handoff — owned by
  `family:navigation-destinations` and `spec:AST-005`.
- Tooltip appearance, timing, and dismissal — owned by `component:Tooltip`.
- Spinner, Icon, and Badge rendering — owned by those components.
- The touch press controller and `usePressFeedback` — uncontracted shared
  hooks; Button only composes them.

## Public concepts

| Concept       | Closed values or states                                                       | Meaning                                                | Availability by variant/orientation/state                                             | Default                   | Owner              | Stability | Invalid-value behavior                                                                                                            |
| ------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- | ------------------------- | ------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Variant       | `primary`, `secondary`, `ghost`, `destructive`, plus module-augmented entries | Visual emphasis of the action.                         | Every mode.                                                                           | `secondary`               | `component:Button` | Stable    | TypeScript rejects values absent from `ButtonVariantMap`. An augmented value paints the base surface and reflects `data-variant`. |
| Size          | `sm`, `md`, `lg`                                                              | Control height.                                        | Every mode.                                                                           | Inherited size, else `md` | `family:buttons`   | Stable    | TypeScript rejects other values.                                                                                                  |
| Elevation     | `none`, `low`, `med`, `high`                                                  | Resting shadow depth.                                  | Standalone only; inside a ButtonGroup the effective value is `none`.                  | `none`                    | `family:buttons`   | Stable    | TypeScript rejects other values.                                                                                                  |
| Content mode  | visible label, custom visible content, icon-only                              | What is visible; the accessible name follows ORD4.     | Icon-only drops the visible label and end content.                                    | visible label             | `family:buttons`   | Stable    | Icon-only with no `icon` renders an empty square.                                                                                 |
| Pending       | idle, loading, action pending                                                 | Work is in flight.                                     | `isLoading`, or while a `clickAction` promise is unsettled.                           | idle                      | `component:Button` | Stable    | Not applicable.                                                                                                                   |
| Interruptible | off, on                                                                       | Pending work does not block a new activation.          | Only changes pending behavior.                                                        | off                       | `component:Button` | Stable    | Not applicable.                                                                                                                   |
| Availability  | operable, busy-only, disabled                                                 | Whether activation runs, and why not.                  | Disabled comes from `isDisabled` or an enclosing ButtonGroup; busy-only from pending. | operable                  | `component:Button` | Stable    | Not applicable.                                                                                                                   |
| Link mode     | off, on                                                                       | Renders the surface as a navigation link.              | On when `href` is supplied and the Button is not disabled.                            | off                       | `component:Button` | Stable    | A rejected destination renders inertly under `family:navigation-destinations`.                                                    |
| Width         | content-sized, explicit length                                                | Inline size; numbers are pixels, strings pass through. | Every mode; still capped at the container except icon-only.                           | content-sized             | `component:Button` | Stable    | Not applicable.                                                                                                                   |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| FR1  | Without link mode Button renders one native `<button>` with `type="button"` unless `type` says otherwise; `name`, `value`, and `form` reach that element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `family:buttons` FR2; current source and tests                                       |
| FR2  | Content renders in this order: the leading `icon` slot, the label text (`children` when supplied, else `label`), then `endContent`. Icon-only renders the icon alone and omits the label text and `endContent`. `endContent` inherits the Button's text color.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `family:buttons` AV2; current source and tests                                       |
| FR3  | An Astryx Icon in the `icon` slot without an explicit size renders `sm` in `sm` and `md` Buttons and `md` in `lg` Buttons; an explicit Icon size wins.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `family:buttons` FR7; current source                                                 |
| FR4  | Height comes from the shared element size for the resolved size: an explicit `size` wins, then the nearest size provider, then `md`. A labelled button's height is that element size, or one line of its label when the line is taller, so under a set text size (`spec:AST-102` FR4) the label stays inside its own button; at the default text size the height is the element size, and a caller's height replaces it. Icon-only is square (`--button-icon-only-aspect`, default `1 / 1`) with no padding and keeps the element size, since its glyph does not grow with the text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `family:buttons` FR7; `architecture:component-size-cascade` INV3–INV5                |
| FR5  | The label stays on one line. A labelled Button may shrink in a row, never exceeds its container's inline size, and truncates the label with an ellipsis. An explicit `width` applies in button and link modes and is still capped at the container. Icon-only does not shrink and is not capped.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests                                                             |
| FR6  | On activation `onClick` runs first. If it calls `preventDefault()`, `clickAction` does not run. Otherwise `clickAction` runs, and the Button is pending until its promise settles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `family:buttons` FR5; current source and tests                                       |
| FR7  | A fire-once `clickAction` runs once per in-flight action: a second activation while it is pending, including a same-tick double-click, does nothing. With `isInterruptible`, a pending Button stays operable and each activation starts a new `clickAction`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `family:buttons` FR5; current source and tests                                       |
| FR8  | While pending, Button sets `aria-busy="true"`, hides its content from assistive technology, makes content that takes the Button's text color transparent while it keeps its place in layout, and centers a small Spinner in the inherited foreground color over it. Outer size does not change. On a Button that is not interruptible and has no action pending, explicit `isLoading` hides the content and shows the Spinner at once. For a pending `clickAction`, or any pending state on an interruptible Button, the content stays painted and the content hide and the Spinner reveal both wait the medium motion delay, so a fast action never flashes a Spinner or an empty Button. The Spinner fades in over the fast duration. Under reduced motion there is no delay, and with a fine pointer the Spinner MUST appear at once (`design:reduced-motion` DR3). `aria-busy` is set at once in every case. Implementation gap: under reduced motion the Spinner still fades in over the fast duration with every pointer. Implementation gap: content that paints its own colors, such as a Badge in `endContent`, stays visible beside the Spinner.                                                                                                                                           | `family:buttons` FR4; current source and tests                                       |
| FR9  | Busy-only (pending, not disabled, not interruptible): Button exposes `aria-disabled="true"`, keeps its tab stop, renders no native `disabled`, and keeps full opacity. Pointer activation is cancelled and does not reach ancestor click handlers; Enter and Space are suppressed; other keys still reach the caller's `onKeyDown`. A link-mode Button stays a link while busy-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `spec:AST-085` FR1, FR2, FR6; current source and tests                               |
| FR10 | Disabled (`isDisabled`, or a disabled enclosing ButtonGroup) MUST stay focusable with `aria-disabled="true"`, keep its tab stop and focus, apply FR9's guards, never run `onClick` or `clickAction`, and paint at half opacity. Disabled wins over pending: a disabled, loading Button shows the Spinner and `aria-busy` but follows this row. Implementation gap: only a disabled Button with a `tooltip` renders this shape; without a tooltip it renders native `disabled`, which removes it from the tab order and drops focus when it becomes disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `family:buttons` FR3; `spec:AST-085`; current source and tests                       |
| FR11 | With `href` and not disabled, Button renders the link component resolved from `as`, then `LinkProvider`, then a native anchor, with `target` and `rel`, full button styling, and no text decoration. Destination handling follows `family:navigation-destinations`. A disabled Button with `href` renders a `<button>` that follows FR10 and never navigates. Implementation gap: a focused link Button that becomes disabled is replaced by that new `<button>`, so focus falls to the page with or without a `tooltip`; without a `tooltip` the `<button>` also carries native `disabled` (FR10).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `family:navigation-destinations` FR1–FR7; current source and tests                   |
| FR12 | With `tooltip`, the tooltip attaches to the Button element itself (no wrapper element), opens above it, and its content is added to `aria-describedby` after any caller value, unless its trimmed text equals the Button's accessible name as its props decide it (the derived or caller `aria-label`, or `label` when `icon` and `endContent` render nothing or a decorative Icon), as Avatar AR5 does, so a tooltip that repeats the name is not read twice. When the name comes from elsewhere (`aria-labelledby`, or other content in `icon` or `endContent`), the tooltip still describes the Button. IconButton inherits this.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source; real-browser accessibility test                                      |
| FR13 | A standalone Button paints the shadow token for its `elevation`. Inside a ButtonGroup it paints no shadow and reflects `data-elevation="none"`, whatever `elevation` says.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `family:buttons` FR8–FR10; current source and tests                                  |
| FR14 | The root carries `astryx-button` and reflects the effective `data-variant`, `data-size`, and `data-elevation`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `family:buttons` FR10; `architecture:component-theming-surface`; tests               |
| FR15 | Hover paints the shared interaction overlay on hover-capable pointers, and a press paints the shared pressed overlay through the press controller: at once under a mouse or a pen (`spec:AST-094` FR11's fine-pointer profile) and on FR11's control profile under a finger, fading out on release on the theme's exit motion tokens (`--duration-exit`, `--ease-exit`; `spec:AST-094` FR5). Under a coarse pointer, while a press is on or fading, Button paints the press on its own `::before`; a caller's `::before` styles apply on top of that layer and win where they overlap, so a decoration that must stay through a touch press belongs on a child element. Without a reduced-motion preference, a standalone Button also scales to 0.98 on a mouse press, or while the touch press reads on; under reduced motion it MUST NOT scale (`design:reduced-motion` DR1). All of this paint follows the element's exposed disabled state: a Button that is natively disabled or exposes `aria-disabled="true"` (busy-only, disabled with a tooltip, or a caller's own `aria-disabled`) shows no overlay and no press scale, even when it stays operable. Inside a ButtonGroup the press scale does not apply. Button's hover and press transitions are fast, and instant under reduced motion. | Current source and tests; `spec:AST-094` FR11 and DEC-21 for the mouse and pen press |
| FR16 | The ghost variant carries the edge-compensation marker so an enclosing container can align it flush with its edge; other variants do not.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Current source; edge-compensation tests                                              |
| FR17 | `ref`, `className`, `style`, `xstyle`, and other DOM props reach the root element. A caller's own `aria-busy` and `aria-disabled` are kept beside Button's own (either one sets the attribute); a caller `aria-disabled` changes exposure and paint only and does not make the Button inert. The tooltip trigger shares the caller's `ref`, which stays attached across rerenders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests                                                             |

### Allowed variation

- **AV1 — Theme paint.** Themes may change variant colors, radius (through the
  `button` target), focus offset (`--button-focus-offset`), and the icon-only
  aspect without changing anatomy, naming, or operability.
- **AV2 — Custom variants.** A module-augmented variant may be painted entirely
  by the theme through `data-variant`; Button supplies only the base surface.
- **AV3 — Visible content.** `children` and `endContent` may be any caller
  content; Button does not inspect them.

### Representative states

| State                  | Required invariant                                                                                                               | Allowed variation                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Text, at rest          | Native button named from its rendered content (icon-slot text, the label, and end-content text), or by a caller `aria-label`.    | Variant, size, theme paint.                 |
| Icon-only              | Square; `aria-label` is `label`; no visible text or end content.                                                                 | Icon content.                               |
| Custom visible content | Visible `children`; `aria-label` is `label`.                                                                                     | Content shape.                              |
| Loading                | Spinner centered; text-colored content hidden but in layout, on the Spinner's schedule; `aria-busy`; focusable; same outer size. | Delay per FR8.                              |
| Disabled with tooltip  | `aria-disabled`; focusable; dimmed; inert; described by the tooltip.                                                             | Tooltip text.                               |
| Disabled, no tooltip   | Same as with a tooltip: `aria-disabled`; focusable; dimmed; inert. Implementation gap: native `disabled` (FR10).                 | —                                           |
| Link mode              | Link element with button styling; busy-only stays a link.                                                                        | Link component from `as` or `LinkProvider`. |
| In a ButtonGroup       | Group corners and dividers; no press scale; effective elevation `none`.                                                          | Orientation.                                |

### Transformation and precedence order

- **ORD1 — Size.** Explicit `size`, then the nearest size provider, then `md`.
- **ORD2 — Availability.** Disabled, then busy-only, then operable.
  Interruptible pending is operable.
- **ORD3 — Element.** Link mode only when `href` is supplied and the Button is
  not disabled; otherwise `<button>`.
- **ORD4 — Accessible name.** Button sets `aria-label` to `label` when it is
  icon-only with a non-empty label, when it is pending and not icon-only, or
  when `children` differs from `label`; that value wins over a caller
  `aria-label`. Otherwise a caller `aria-label`, when given, names the Button,
  and without one the Button is named from its rendered content: any text in the
  `icon` slot, the label text, and any text in `endContent`. A decorative Astryx
  Icon adds nothing to that name.
- **ORD5 — Styling.** Variant paint applies over the shared focus outline, so
  the destructive focus ring takes the error color; caller `xstyle` applies
  after Button's own styles, then `className` and `style` merge.

### Performance and resources

- **PR1 — No idle work.** A Button that mounts idle schedules nothing for its
  loading region. Only a Button first rendered pending defers the region's
  text by one animation frame (AR4).

## Accessibility contract

- **AR1 — Name.** Every Button has an accessible name (ORD4), as
  `family:buttons` FR1 requires: `label` when Button sets `aria-label`, otherwise
  a caller `aria-label` or the rendered content, which includes the label text.
  An icon-only icon never substitutes for the name.
- **AR2 — Keyboard.** A `<button>` activates with Enter and Space; a link
  activates with Enter. Focus order is the DOM order.
- **AR3 — Focus indicator.** Keyboard focus paints the shared focus outline at
  `--button-focus-offset`; the destructive variant colors it with the error
  color. Visibility follows `architecture:interaction-modality` INV1.
- **AR4 — Loading announcement.** Button renders one persistent, visually
  hidden `role="status"` `aria-live="polite"` region. It holds the localized
  loading string while pending and is empty otherwise. A Button first rendered
  pending mounts the region empty and fills it on the next frame
  (`spec:AST-086` FR3). Inside a live container it keeps its role and urgency
  (`spec:AST-086` FR4). Spoken output follows `spec:AST-009`.
- **AR5 — Busy and disabled exposure.** Pending sets `aria-busy`. Busy-only and
  disabled Buttons MUST expose `aria-disabled="true"` on the focusable element
  (`spec:AST-085` FR5). Implementation gap: a disabled Button without a tooltip
  exposes native `disabled` instead (FR10).
- **AR6 — Target size.** Every Button is at least 28 CSS pixels tall, unless a
  caller's height replaces its size (FR4). With the
  default square aspect and no `width`, an icon-only Button is at least 28 by
  28; a labelled Button can shrink in a crowded row only down to its 24 CSS
  pixels of inline padding. Both meet the WCAG 2.5.8 24 by 24 minimum. A caller
  `width` or a theme icon-only aspect that makes a Button narrower than 24 CSS
  pixels, or a caller height under 24 CSS pixels, leaves its target size to that
  caller or theme.

Implementation gap: Button's hover and pressed overlays on the dark accent give
its label 4.35:1 and 4.02:1, under 4.5:1.

## Design relationships

| Anatomy or state    | Design requirement                                                                                                | Representation authority                    | Hierarchy role | Component contract |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------- | ------------------ |
| Primary surface     | Accent fill with on-accent text.                                                                                  | Current source                              | Prominent      | FR14               |
| Secondary surface   | Neutral fill with primary text.                                                                                   | Current source                              | Supporting     | FR14               |
| Ghost surface       | Transparent fill with primary text; edge-compensatable.                                                           | Current source                              | Supporting     | FR14, FR16         |
| Destructive surface | Error fill with on-error text and an error-colored focus ring.                                                    | Current source                              | Prominent      | FR14, AR3          |
| Press               | Pressed overlay on a Button not exposed as disabled, plus a 0.98 scale when standalone and motion is not reduced. | Current source; `design:reduced-motion` DR1 | Supporting     | FR15               |
| Disabled            | Half opacity; no hover or press paint.                                                                            | Current source                              | Supporting     | FR10, FR15         |
| Pending             | Spinner over hidden content; full opacity when busy-only.                                                         | Current source                              | Supporting     | FR8, FR9           |

`design:reduced-motion` governs Button's press scale (FR15). No other design
record governs Button; exact paint stays in code and visual evidence.

The root carries the one `button` target (FR14). Icon, Label, and End content
have no target of their own and take color from `button`; the Spinner is a
Spinner instance with the inherited shade. The touch band has no target. The
consumer anatomy names no root part, so this record carries no
anatomy-theming map.

## Family and system relationships

- `family:buttons` owns the shared naming, size, pending, callback-order,
  elevation, and state-agreement rules; Button adopts them and is the surface
  IconButton and ToggleButton reuse.
- `family:navigation-destinations` and `spec:AST-005` own link-mode
  destination handling.
- `spec:AST-085` owns disabled focusability; Button meets it for busy-only and
  tooltip-disabled states and not for other disabled states (FR10).
- `spec:AST-086` owns the loading region's live-region rules (AR4).
- `architecture:component-size-cascade` owns size inheritance (ORD1).
- `architecture:component-theming-surface` owns target and `data-*` rules
  (FR14).
- `architecture:interaction-modality` owns focus-indicator visibility (AR3).

## Verification map

| Contract                     | Verification                                                                                                                                                                                                                                                                                                                                                                                 | Representative states                                                                           | Mutation or failure expectation                                                                                                                                               | Audit section                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, FR2, AR1                | `Button.test.tsx` label, children, icon-only, end-content presence, and `type` cases; `Button.a11y.test.tsx`; `Button.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                 | Text, icon-only, composed label, end content, submit type                                       | A lost name, a wrong default `type`, or end content in icon-only fails.                                                                                                       | `audit:Button/anatomy`       |
| FR1, FR2 (gaps)              | Evidence gap: no test passes `name`, `value`, or `form`, or asserts the order of icon, label, and end content                                                                                                                                                                                                                                                                                | —                                                                                               | —                                                                                                                                                                             | `audit:Button/anatomy`       |
| FR3                          | Evidence gap: no Button-level test of the text-mode icon slot default                                                                                                                                                                                                                                                                                                                        | `sm`, `md`, `lg` with an unsized Icon                                                           | —                                                                                                                                                                             | `audit:Button/anatomy`       |
| FR4                          | `ButtonTextSize.interaction.browser.spec.ts` (a label larger than the element size grows its button; at the default text size the Neutral and Butter themes' labelled buttons keep their element heights); `Button.test.tsx` default size geometry (a caller's height and the block padding hold). Evidence gap: no test asserts the explicit `size`, then nearest provider, then `md` order | `sm`, `md`, `lg`; inside a size provider                                                        | —                                                                                                                                                                             | `audit:Button/layout`        |
| FR5                          | `Button.test.tsx` width and narrow-row suites; InputGroup addon case                                                                                                                                                                                                                                                                                                                         | Numeric and string width, link mode, icon-only, grouped                                         | A Button that overflows its row, stops truncating, or squeezes icon-only fails.                                                                                               | `audit:Button/layout`        |
| FR6, FR7                     | `Button.test.tsx` click, double-click, and interruptible suites                                                                                                                                                                                                                                                                                                                              | onClick then clickAction; preventDefault; double-click; re-click                                | Order flips, a prevented click runs the action, or a fire-once action runs twice fails.                                                                                       | `audit:Button/behavior`      |
| FR8, AR4                     | `Button.test.tsx` loading, spinner shade, and live-region suites                                                                                                                                                                                                                                                                                                                             | `isLoading`; pending `clickAction`; first render loading                                        | Missing `aria-busy`, a wrong Spinner shade, or a live region mounted with text fails.                                                                                         | `audit:Button/behavior`      |
| FR8 (hide and delay)         | Evidence gap: no test asserts the hidden content, the reveal delay, or the reduced-motion path; the shipped Spinner fade fails the fine-pointer reduced-motion clause (Current-state impact)                                                                                                                                                                                                 | `isLoading`; pending `clickAction`; interruptible                                               | Under reduced motion with a fine pointer, a Spinner opacity below 1 after the loading state starts.                                                                           | `audit:Button/behavior`      |
| FR8 (outer size)             | Evidence gap: no test measures that a pending Button keeps its outer size                                                                                                                                                                                                                                                                                                                    | Loading text, icon-only, and end-content Buttons                                                | —                                                                                                                                                                             | `audit:Button/layout`        |
| FR9, FR10, AR5               | `Button.test.tsx` aria-disabled, busy-only, and native-disabled suites; `Button.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                       | Busy-only, tooltip-disabled, disabled, disabled and loading                                     | A busy Button loses focus, an inert Button fires, or a click reaches an ancestor fails. Native-disabled assertions match the FR10 gap.                                        | `audit:Button/accessibility` |
| FR11                         | `Button.test.tsx` link-mode suites                                                                                                                                                                                                                                                                                                                                                           | Link, busy-only link, disabled `href`                                                           | A disabled link navigates or a busy link turns into a `<button>` fails.                                                                                                       | `audit:Button/behavior`      |
| FR12                         | `Button.a11y.chromium.spec.ts` described state                                                                                                                                                                                                                                                                                                                                               | Disabled with tooltip                                                                           | A tooltip that does not describe the Button fails.                                                                                                                            | `audit:Button/accessibility` |
| FR12 (placement and order)   | Evidence gap: no test asserts that the tooltip opens above the Button or that its id follows a caller `aria-describedby`                                                                                                                                                                                                                                                                     | Tooltip with and without a caller description                                                   | —                                                                                                                                                                             | `audit:Button/accessibility` |
| FR13, FR14                   | `Button.test.tsx` theme-target and elevation suites; `ButtonGroup.test.tsx` "reports flat on a member, since the group owns the surface" for the grouped `data-elevation="none"`                                                                                                                                                                                                             | `secondary` target attributes; every elevation tier                                             | A missing target, or a `data-elevation` other than the effective tier, fails.                                                                                                 | `audit:Button/theming`       |
| FR13 (painted shadow)        | Evidence gap: no test reads the painted shadow, so a grouped Button that paints its own shadow, or swapped tier shadows, would pass                                                                                                                                                                                                                                                          | Standalone tiers; grouped member                                                                | —                                                                                                                                                                             | `audit:Button/theming`       |
| FR14 (per variant)           | Evidence gap: `data-variant` is asserted for `secondary` only                                                                                                                                                                                                                                                                                                                                | Other variants                                                                                  | —                                                                                                                                                                             | `audit:Button/theming`       |
| FR15                         | `Button.test.tsx` touch pressed-state suite                                                                                                                                                                                                                                                                                                                                                  | Touch press on and fading                                                                       | Losing the touch press arm or its release fade fails.                                                                                                                         | `audit:Button/behavior`      |
| FR15 (disabled paint)        | `pressFeedback.test.ts` "paints nothing on a disabled surface, and does not light the row around it" for the touch press. Evidence gap: no test of the hover and pressed overlays or the mouse scale on a Button exposed as disabled                                                                                                                                                         | Native disabled; `aria-disabled`                                                                | A disabled surface that takes the touch press fails.                                                                                                                          | `audit:Button/behavior`      |
| FR15 (reduced motion)        | `ReducedMotionPress.a11y.chromium.spec.ts` ("a pressed button never scales under reduced motion, with a mouse or a finger (DR1)")                                                                                                                                                                                                                                                            | Mouse press; touch press                                                                        | A computed transform other than `none` or `scale(1)` during the press.                                                                                                        | `audit:Button/behavior`      |
| `spec:AST-094` FR42          | `Button.hitArea.test.tsx`: a standalone and a link Button take the touch band on their content wrapper, and a caller's `::after` stays on the button; a disabled, busy-only or grouped Button, or a Button whose tracking group draws its band, takes none                                                                                                                                   | standalone; link; caller `::after`; disabled; busy-only; grouped; tracking group draws the band | A Button without the band fails. So does a disabled, busy-only or grouped Button with its own, or a Button with its own whose tracking group draws its band.                  | `audit:Button/behavior`      |
| FR15 (hover and mouse scale) | Evidence gap: no test asserts the hover overlay or the 0.98 mouse-press scale                                                                                                                                                                                                                                                                                                                | Hover; mouse press, standalone and grouped                                                      | —                                                                                                                                                                             | `audit:Button/behavior`      |
| FR16                         | `edgeCompensation.test.tsx` Button data-attribute suite                                                                                                                                                                                                                                                                                                                                      | Ghost and primary                                                                               | A ghost Button without the marker, or a primary Button with it, fails.                                                                                                        | `audit:Button/layout`        |
| FR17                         | `Button.test.tsx` ref suites and the caller `aria-disabled`/`aria-busy` case                                                                                                                                                                                                                                                                                                                 | Initial render and rerender; caller `aria-busy` and `aria-disabled`                             | A dropped or detached ref, or a dropped caller `aria-busy` or `aria-disabled`, fails. Evidence gap: no test asserts that a caller `aria-disabled` leaves the Button operable. | `audit:Button/behavior`      |
| ORD1, ORD5                   | Evidence gap: no test asserts size precedence (see FR4) or that caller `xstyle`, `className`, and `style` win over Button's own styles                                                                                                                                                                                                                                                       | —                                                                                               | —                                                                                                                                                                             | `audit:Button/behavior`      |
| ORD4                         | `Button.test.tsx` icon-only and composed-label cases. Evidence gap: no test asserts the `aria-label` set while pending or when `children` differs from `label`, or the content name with icon-slot or end-content text                                                                                                                                                                       | Icon-only; composed label                                                                       | An icon-only Button without `aria-label`, or a composed label that gains one, fails.                                                                                          | `audit:Button/accessibility` |
| AR2                          | `Button.a11y.chromium.spec.ts` activation and tab-reachability checks. Evidence gap: no test of Enter activation in link mode                                                                                                                                                                                                                                                                | Text and icon-only Buttons                                                                      | A Button that Enter or Space does not activate, or that Tab skips, fails.                                                                                                     | `audit:Button/accessibility` |
| AR3                          | Evidence gap: no test asserts the focus outline or the destructive error-colored ring                                                                                                                                                                                                                                                                                                        | Keyboard focus; destructive                                                                     | —                                                                                                                                                                             | `audit:Button/accessibility` |
| AR6, PR1                     | Evidence gap: no test measures the target size or asserts that an idle Button schedules nothing                                                                                                                                                                                                                                                                                              | —                                                                                               | —                                                                                                                                                                             | `audit:Button/behavior`      |

## Current-state impact

- FR15's mouse and pen press through the press controller is not implemented:
  a mouse press still paints with `:active` (`spec:AST-094` DEC-21).
- **Disabled focusability (FR10, FR11, AR5).** A Button disabled by
  `isDisabled` or a ButtonGroup without a tooltip, including one with `href`,
  renders native `disabled`. It leaves the tab order and drops focus when it
  becomes disabled, against `spec:AST-085` FR1 and FR4 and `family:buttons`
  FR3. The shared button-pattern browser states record this state as not
  focusable. A focused link Button that becomes disabled also loses focus with a
  `tooltip`, because its anchor is replaced by a `<button>`.
- **Consumer docs.** `Button.doc.mjs` describes the Spinner as replacing the
  icon; it overlays all content (FR8). The Chinese `isLoading` text says
  loading disables interaction, and its `icon` text says an icon without
  children renders a square button; icon-only depends on `isIconOnly` (FR2).
- **End-content doc type (AV3).** `Button.doc.mjs` types `endContent` as
  `ReactElement<IconProps> | ReactElement<BadgeProps>`, and its Chinese text says
  it accepts only an Icon or a Badge, while `ButtonProps` types it `ReactNode`
  and any caller content renders.
- **Spinner fade under reduced motion (FR8).** With a fine pointer the Spinner
  still fades in over the fast duration when the person prefers reduced motion,
  against `design:reduced-motion` DR3.
- **Self-colored end content while loading (FR8).** A Badge or other content
  that paints its own colors stays visible beside the Spinner.

## Decision log

No component-local decision. Button applies the family and system decisions
linked above.

## Open questions

None. The content wrapper is a real box, so no `display: contents` element
stands between the Button and its label for WebKit to drop the name through.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Button/Button.swift.spec.md -->


# Button (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Button(label:variant:size:elevation:isLoading:isInterruptible:isDisabled:width:tooltip:href:base:onClick:)` and `Button(_ props: ButtonProps)`, a SwiftUI `View` in module `Astryx`.                                                                                                                                                                                                                                                                                        |
| Behavior                | A SwiftUI `Button` drawn with the Astryx button style, or a SwiftUI `Link` when an enabled Button has `href`. While loading, a spinner covers the label, which keeps its place, and presses wait unless it is interruptible. On iOS and iPadOS 26 and later, in a system bar or under the floating-glass opt-in, it draws the system's Liquid Glass in place of its own fill: an unset `variant` is `secondary`, as in core, and every `variant` keeps its meaning in glass. |
| End-user impact         | A person gets one action control whose width holds while it loads and which never runs twice by accident; a link Button stays a link while busy, so VoiceOver and keyboard focus stay on it. In bars and floating controls it looks and behaves like the system's buttons beside it, one layer of glass rather than a fill inside glass, and a main or destructive action still reads as one.                                                                                |
| Builder impact          | An app passes core's Button props; `href` makes the same view open a destination through the system. A Button in a bar needs no extra code; `.astryxFloating()` on a floating container opts its Buttons into glass. A `variant` the callsite sets is always obeyed.                                                                                                                                                                                                         |
| Compatibility/readiness | Breaking for canary callers: `action:`, `fillsWidth:`, `icon:`, and the hand-written `AstryxButtonVariant` and `AstryxButtonSize` give way to the generated `ButtonProps` (`onClick:`, `width:`, `ButtonVariant`, `ButtonSize`). Draft; built and tested on macOS and the iOS Simulator.                                                                                                                                                                                     |
| Review checks           | Reject a loading link that swaps to a button, a loading Button that runs `onClick` or opens its link while not interruptible, a size change while loading, or a disabled Button with `href` that opens. Reject an Astryx fill drawn inside a bar's glass, a set `variant` that glass overrides or drops, glass drawn under Reduce Transparency or Increase Contrast, or a glass change merged without the simulator capture gate.                                            |
| Governing rules         | `component:Button` FR7–FR11; `spec:AST-082` FR3; `spec:AST-093` FR1–FR5; the Swift component API record (A2–A5) under `packages/native/specs/swift/library/`; DEC-1 below.                                                                                                                                                                                                                                                                                                   |

This table is a review projection; the body below is authoritative.

## Intent

Button on Apple platforms is core's action control drawn with SwiftUI's own
button and link, so presses, focus, and VoiceOver work the platform's way while
its look, loading, and link behavior follow the core `Button` contract.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: breaking for canary callers (hand-written parameters → generated `ButtonProps`)
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- How Swift draws core's Button: the SwiftUI control it uses, the loading
  presentation, when presses land, and when `href` makes it a link.
- How Button meets the system's Liquid Glass on Apple platforms: in system bars,
  under the floating-glass opt-in, and under Reduce Transparency or Increase
  Contrast (FR7–FR11).

**Does not own / non-goals**

- The meaning of Button's props, its variants and sizes, and its pending and
  disabled states — owned by `component:Button`.
- Which destinations a link may open — owned by
  `family:navigation-destinations`.
- How a prop switches to a different SwiftUI control in general — owned by the
  Swift component API record (A2).
- The glass itself, how a bar groups its items, and the scroll edge effect —
  owned by the system.
- Search in a navigation context — not a Button concern.
- macOS toolbars and floating controls — FR7–FR10 cover iOS and iPadOS 26;
  on macOS the token look stays (FR10).

## Public concepts

| Concept       | Closed values or states                 | Meaning                                                              | Availability by variant/orientation/state        | Default  | Owner                    | Stability    | Invalid-value behavior                      |
| ------------- | --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ | -------- | ------------------------ | ------------ | ------------------------------------------- |
| control       | button; link                            | a SwiftUI `Button`, or a SwiftUI `Link` for an enabled `href`        | always                                           | button   | `component:swift/Button` | experimental | an `href` that is not a URL leaves a button |
| loading       | idle; loading                           | `isLoading`: spinner over the label, presses wait                    | always                                           | idle     | `component:Button`       | experimental | none                                        |
| interruptible | off; on                                 | `isInterruptible`: presses and link opens land while loading         | while loading                                    | off      | `component:Button`       | experimental | none                                        |
| availability  | operable; busy-only; disabled           | disabled wins over loading                                           | always                                           | operable | `component:Button`       | experimental | none                                        |
| surface       | token; bar glass; floating glass; solid | where the Button sits decides what draws behind its label (FR7–FR10) | iOS and iPadOS 26 and later for the glass values | token    | `component:swift/Button` | experimental | none                                        |

## Behavioral and layout contract

| ID   | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                                            | Draft review state |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| FR1  | Both initializers MUST build the same `ButtonProps`; base props (`id`, `isHidden`) come through `ButtonProps`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Swift component API A2, A3                                                       | verify             |
| FR2  | While loading, the view MUST draw a spinner over the label, keep the label's place so its size does not change, stay at full opacity, and read as busy ("Loading", core's catalog message) to VoiceOver. It MUST NOT run `onClick` while loading unless it is interruptible; an interruptible loading Button runs `onClick` on each press.                                                                                                                                                                                                                                                                                                                                                                                                                   | `component:Button` FR7–FR9                                                       | verify             |
| FR3  | An enabled Button with `href` MUST draw a SwiftUI `Link` to that destination, in the Astryx button style, which VoiceOver reads as a link. A disabled Button with `href` MUST draw its disabled button, which never opens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `component:Button` FR11; `spec:AST-082` FR3                                      | verify             |
| FR4  | A loading Button with `href` MUST stay a `Link`: it keeps focus, shows its spinner, reads as busy, and does not open its destination until loading ends, unless the Button is interruptible, in which case each activation opens it. It never swaps to a button while busy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `component:Button` FR9 ("a link-mode Button stays a link while busy-only"), FR11 | verify             |
| FR5  | A Button whose `href` is a script URL (`javascript:`, `vbscript:`) or an HTML document in a `data:` URL MUST NOT open it, after core's normalization (control characters removed, whitespace trimmed, the scheme compared in lowercase without spaces after its colon): it draws its enabled button, which runs `onClick` and does not look disabled.                                                                                                                                                                                                                                                                                                                                                                                                        | `component:Button` FR11; `family:navigation-destinations`                        | verify             |
| FR6  | A disabled Button MUST keep its keyboard focus stop and show its tooltip on focus, draw its disabled look, read as a dimmed button to VoiceOver, and never run `onClick`; a focused Button that becomes disabled keeps one view structure and its focus. A Button with `href` keeps its `Link` and its disabled button in one structure, and focus moves from the link to the button when it becomes disabled, and back when it is enabled, so focus stays inside the component.                                                                                                                                                                                                                                                                             | `component:Button` FR10; `family:buttons` FR3                                    | verify             |
| FR7  | On iOS and iPadOS 26 and later, a Button hosted in a system bar (navigation bar or toolbar) MUST draw no fill or border of its own, so the bar's glass is its only chrome (a set `elevation` still paints its shadow, FR11); its label and any tint follow FR8. An unset `variant` is `secondary`, as in core, so it draws `secondary`'s bar treatment: label only, in `color.textPrimary`, on the bar's glass. This needs no new prop or modifier.                                                                                                                                                                                                                                                                                                          | DEC-1; Apple's Liquid Glass guidance (remove custom backgrounds in bars)         | verify             |
| FR8  | A `variant` the callsite sets MUST always be obeyed. On iOS and iPadOS 26 and later, in a system bar and under the floating opt-in (FR9), it maps to the closest glass treatment that keeps its meaning, and is never drawn with another variant's treatment (in a bar, `secondary` and `ghost` share the bar's glass): `primary` → prominent glass tinted `color.accent`, label `color.onAccent`; `destructive` → prominent glass tinted `color.error`, label `color.onError`; `secondary` → regular glass (in a bar, the bar's own glass), label `color.textPrimary`, no `color.neutral` fill; `ghost` → floating: clear glass, label `color.textPrimary`; in a bar: the bar's own glass, label `color.textPrimary` (the bar owns its items' backgrounds). | DEC-1                                                                            | verify             |
| FR9  | On iOS and iPadOS 26 and later, the Apple-only modifier `.astryxFloating()` MUST only mark a container as floating (controls over scrolling content); the Buttons inside it draw FR8's floating treatment, subject to the theme's `material` (ORD2) and FR10, with an unset `variant` drawn as `secondary`. Without the modifier, a Button outside a system bar keeps its token look. The modifier is not a prop and changes no `ButtonProps` (Swift component API A2).                                                                                                                                                                                                                                                                                      | DEC-1; Swift component API A1c (a modifier's `astryx` prefix)                    | verify             |
| FR10 | Under Reduce Transparency or Increase Contrast, a Button that would draw glass (FR7–FR9) MUST draw no glass: its variant's token fill (`color.accent` for `primary`, `color.error` for `destructive`, `color.neutral` for `secondary` and an unset `variant`, `color.backgroundSurface` for `ghost`) with a `color.borderEmphasized` edge, so its label keeps a solid, visible background. Before iOS 26, and on macOS, which FR7–FR9 do not cover, the token look stays.                                                                                                                                                                                                                                                                                    | DEC-1; `spec:AST-093` FR2                                                        | verify             |
| FR11 | In glass, every prop keeps core's meaning: `isLoading`, `isInterruptible`, `isDisabled`, `href`, and `tooltip` behave as FR2–FR6; `size` sets the control's minimum height and label type (`component:Button` FR4); an explicit `width` applies, capped at what the bar or container offers (`component:Button` FR5); and `elevation` paints its shadow beneath the glass (`component:Button` FR13). A Button's label MUST NOT be truncated by Astryx padding inside a bar that has room for it.                                                                                                                                                                                                                                                             | `component:Button` FR4, FR5, FR7–FR11, FR13; DEC-1                               | verify             |

### Variant mapping in glass

FR7–FR9 in one table. "Least surprising" means a callsite gets what its
`variant` already promises, with the system's glass as its surface.

| `variant`     | In a system bar (iOS and iPadOS 26)                                              | Floating, opted in (iOS and iPadOS 26)                    | Least surprising because                                                                                              |
| ------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| not set       | as `secondary`: the bar's glass, label `color.textPrimary`, no fill              | regular glass, label `color.textPrimary` (as `secondary`) | core's default is `secondary`, so an unset Button is a secondary one on every platform                                |
| `primary`     | prominent glass tinted `color.accent`, label `color.onAccent`                    | the same                                                  | still the one filled, accent-colored main action, as the system's prominent bar buttons are                           |
| `secondary`   | the bar's glass, label `color.textPrimary`, no `color.neutral` fill              | regular glass, label `color.textPrimary`                  | still a neutral action; the glass takes the place of the neutral fill, so there is one surface, not two               |
| `ghost`       | the bar's glass, label `color.textPrimary` (the bar owns its items' backgrounds) | clear glass, label `color.textPrimary`                    | still the quietest action; clear glass is the least visible surface that keeps the label readable over moving content |
| `destructive` | prominent glass tinted `color.error`, label `color.onError`                      | the same                                                  | still reads as destructive before it is pressed                                                                       |

### Allowed variation

- **AV1 — Platform controls.** The control is SwiftUI's `Button` or `Link`, so
  focus rings, press feedback, and how the system opens a destination are the
  platform's own.
- **AV2 — The system's glass.** In glass (FR7–FR9), refraction, how a bar groups
  and morphs its items, press effects, and the scroll edge effect are the
  system's own and may change with each iOS release.

### Representative states

| State                                    | Required invariant                             | Allowed variation               |
| ---------------------------------------- | ---------------------------------------------- | ------------------------------- |
| loading                                  | same size as idle; spinner; busy; presses wait | spinner is the system's         |
| loading and interruptible                | presses land                                   | none                            |
| enabled with `href`                      | a `Link`                                       | none                            |
| disabled with `href`                     | a dimmed button that never opens               | none                            |
| loading with `href`                      | a `Link` that does not open until loading ends | none                            |
| in a bar, `variant` unset                | `secondary`'s bar treatment; no Astryx fill    | the system's glass and grouping |
| in a bar, `variant` set                  | FR8's treatment for that variant               | the system's glass and grouping |
| floating, opted in                       | FR8's treatment; unset takes `secondary`'s     | the system's glass              |
| Reduce Transparency or Increase Contrast | solid token fill with an edge, no glass        | none                            |

### Transformation and precedence order

- **ORD1 — Availability.** Disabled, then loading (busy-only unless
  interruptible), then operable, as in core.
- **ORD2 — Surface.** Reduce Transparency or Increase Contrast (solid, FR10);
  then the theme's `material` (`spec:AST-082` FR10): `opaque` draws FR10's
  solid surface wherever floating glass (FR9) would draw, while a Button in a
  bar still draws no fill of its own, and `translucent`, an `ios` entry's
  `liquidGlass`, or an absent `material` keeps FR7–FR9; then the `variant`'s treatment (FR8, an unset `variant` as
  `secondary`); then the token look outside bars and floating containers.
  Placement never overrides a set `variant`.

### Performance and resources

- **PR1 — No work while idle.** The view holds no timers or tasks; loading is a
  prop the caller sets.

## Accessibility contract

- **AR1 — Name and state.** The label names the control in every state; a
  loading Button adds core's "Loading" message as its value and announces it
  when loading starts. A link Button reads as a link, a disabled one as dimmed.
- **AR3 — Glass keeps the name and role.** In glass the Button keeps its label,
  its button or link role, and its loading and disabled states (AR1); the system
  draws only what is behind the label.
- **AR2 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target exists.

## Design relationships

| Anatomy or state | Design requirement                                    | Representation authority   | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------- | -------------------------- | -------------- | ------------------ |
| Spinner          | the system's activity indicator                       | prescribed by the platform | supporting     | FR2, FR4           |
| Glass surface    | the system's Liquid Glass (regular, clear, prominent) | prescribed by the platform | supporting     | FR7–FR10           |

The component implements design requirements without copying their rationale.

Platform control: SwiftUI `Button` and `Link` with `ProgressView`; they are the
platform's own controls and satisfy the contract (`spec:AST-093` FR2). A
`tooltip` shows through the shared Astryx tooltip (`library/tooltip.spec.md`).
Guideline pages: Buttons, Progress indicators, Materials (Liquid Glass),
Toolbars, and Accessibility (Reduce Transparency, Increase Contrast) in the
Apple Human Interface Guidelines (`spec:AST-093` FR3).

Theme values read (`spec:AST-093` FR4): `color.accent`, `color.onAccent`,
`color.error`, `color.onError`, `color.neutral`, `color.textPrimary`,
`color.backgroundSurface` and `color.borderEmphasized` (the solid fallback),
the native theme's `material` intent, including an `ios` entry's `material`
(`spec:AST-082` FR10; ORD2),
`size.elementSm`, `size.elementMd`, `size.elementLg`, `radius.element`,
`space` steps for padding, `font.label` and `font.family.body`, the
`shadow.low`, `shadow.med`, and `shadow.high` layers, and the Dynamic Type
scale.

## Family and system relationships

- `component:Button` owns the props, the pending and disabled states, and link
  mode; this record states only how Swift draws them.
- `family:navigation-destinations` owns destination handling for links.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                             | Representative states                                                                                                                                  | Mutation or failure expectation                                                                                                                  | Audit section                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| FR1      | `ButtonTests.swift` initializer test                                                                                                                                                                                                                                                                                     | both initializers                                                                                                                                      | differing props fail                                                                                                                             | `audit:swift/Button/api`      |
| FR2      | `ButtonTests.swift` loading, width, and interruptible tests                                                                                                                                                                                                                                                              | loading; loading and interruptible                                                                                                                     | a press that lands while loading, a size change, or dimming fails                                                                                | `audit:swift/Button/loading`  |
| FR3      | `ButtonTests.swift` `href` test                                                                                                                                                                                                                                                                                          | enabled and disabled with `href`                                                                                                                       | a disabled Button that opens, or an enabled one that is not a link, fails                                                                        | `audit:swift/Button/link`     |
| FR4      | `ButtonTests.swift` `href` test with loading, and with loading and interruptible                                                                                                                                                                                                                                         | loading with `href`; interruptible                                                                                                                     | a busy link that swaps to a button or opens before loading ends fails                                                                            | `audit:swift/Button/link`     |
| FR5      | `ButtonTests.swift` refused-destination and normalization tests                                                                                                                                                                                                                                                          | `javascript:`, `vbscript:`, `data:text/html`, padded, mixed case, with controls, and `data: text/html`; a `data:image` and a `mailto:` that still open | a refused destination that opens, an unnormalized one that slips through, or a refused one that looks disabled, fails                            | `audit:swift/Button/link`     |
| FR6      | `ButtonTests.swift` disabled tests, including a disabled Button with `href` keeping its destination for one structure; the focus stop and the focus move are not measured until an app-hosted test can observe them                                                                                                      | disabled with and without a tooltip; disabled with `href`                                                                                              | a disabled Button that runs `onClick` or opens its link, or one marked without its focus stop, fails                                             | `audit:swift/Button/disabled` |
| AR1      | `ButtonTests.swift` accessibility assertions                                                                                                                                                                                                                                                                             | idle; loading; link                                                                                                                                    | a missing name, value, or announcement fails                                                                                                     | `audit:swift/Button/a11y`     |
| FR7      | Simulator capture gate: an unset Button in the navigation bar and in the bottom toolbar, light and dark, on each new iOS; a unit test that a bar Button draws no fill. Evidence gap: SwiftUI has no public signal that a view sits in a bar, so the bottom toolbar is unverified until a detection passes the gate there | navigation bar; bottom toolbar                                                                                                                         | an Astryx fill inside the bar's glass fails                                                                                                      | `audit:swift/Button/glass`    |
| FR8      | Simulator capture gate: each variant in a bar and floating, light and dark; a unit test of the variant-to-treatment mapping                                                                                                                                                                                              | primary; secondary; ghost; destructive                                                                                                                 | a set variant drawn with another variant's treatment fails, except `secondary` and `ghost` sharing the bar's glass in a bar                      | `audit:swift/Button/glass`    |
| FR9      | Simulator capture gate: floating Buttons with and without the modifier; a unit test that the modifier changes no `ButtonProps`                                                                                                                                                                                           | opted in; not opted in                                                                                                                                 | glass without the modifier, or a token fill with it, fails                                                                                       | `audit:swift/Button/glass`    |
| FR10     | Simulator capture gate with Reduce Transparency and with Increase Contrast on                                                                                                                                                                                                                                            | each variant in a bar and floating                                                                                                                     | any glass drawn, or a label without a solid background, fails                                                                                    | `audit:swift/Button/glass`    |
| FR11     | `ButtonTests.swift` loading and disabled tests in glass; simulator capture gate for label truncation, `size`, `width`, and `elevation` in a bar and floating                                                                                                                                                             | loading; disabled; long label; each size; fill width; each elevation                                                                                   | a truncated label with room, a lost loading or disabled state, or a `size`, `width`, or `elevation` that core would honor and glass drops, fails | `audit:swift/Button/glass`    |

## Decision log

### DEC-1 — Button meets the system's glass, and a set variant is always obeyed

**Reference:** `component:swift/Button/DEC-1`
**Decider:** cixzhang, 2026-10-31

On iOS and iPadOS 26 and later, a Button in a system bar draws no fill of its
own, so the bar's glass is its only chrome; a Button in a container the
Apple-only modifier marks as floating draws SwiftUI's glass; and Reduce
Transparency or Increase Contrast draws a solid token surface. A `variant` the
callsite sets keeps its meaning in glass (FR8): `primary` and `destructive`
stay the one filled, colored action, and `secondary` and `ghost` stay neutral.
An unset `variant` is `secondary`, as core defines it, so an unset bar Button
has a neutral label where a native bar item takes the tint.

Rejected: no Astryx glass, with apps using SwiftUI's own buttons in bars and
floating controls.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
