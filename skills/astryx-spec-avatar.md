---
schema_version: 3
template_version: 7
kind: component
id: component:Avatar
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-25
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Avatar/Avatar.test.tsx,
    packages/core/src/AvatarGroup/AvatarGroup.test.tsx,
    packages/core/src/Layer/layerScopedContext.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/Avatar.stories.tsx,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:internationalization,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-005, spec:AST-009, spec:AST-038]
---

# Avatar component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | A sized, shaped identity image with `src`, `fallbackSrc`, `name`, `alt`, `status`, `tooltip`, and optional `href`/`as`/`target`/`rel` or `onClick` interaction.                                                                                                                                 |
| Behavior                | The avatar shows the first image that loads, then initials, then a default icon; it is a named image (composing a status label into its name), a link, or a button, and decorative when it has no name.                                                                                         |
| End-user impact         | Screen-reader users hear who an avatar represents and its status in one name; keyboard users can reveal its tooltip and operate interactive avatars.                                                                                                                                            |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                                                                                                                                                    |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. Four implementation gaps are listed under Current-state impact.                                                                                                                                                      |
| Review checks           | Reject a named static avatar that loses its derived `role="img"` without a caller override, a status label unreachable by assistive technology, an ungrouped static avatar whose tooltip only a pointer can reveal, or an interactive avatar that navigates around the shared destination rule. |
| Governing rules         | `family:navigation-destinations`; `spec:AST-005`; `architecture:public-component-api/INV5,INV6,INV8`; `architecture:component-theming-surface/INV2,INV6`; `architecture:internationalization/INV1a`.                                                                                            |

This table is a review projection; the body below is authoritative.

## Intent

Avatar represents a person or entity with an image, or a readable stand-in when
no image loads. It owns the image fallback chain, size and shape, status
placement, the accessible name, the optional name tooltip, and the choice of a
static, link, or button root.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  or styling output changes
- Controlled/uncontrolled behavior: not applicable; image-failure tracking is
  internal state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Caller `tabIndex` replaced on a static avatar (FR9).** A static avatar sets
  its own `tabIndex` after caller props: `0` while it shows a tooltip outside a
  group, otherwise none. A caller `tabIndex` never reaches it, where
  `architecture:public-component-api` INV5 sends supported inputs to the root.
- **Grouped interactive tooltip lost on re-render (FR7, AR4).** In an
  AvatarGroup, a link or button avatar that is not the group's tab stop no
  longer opens its tooltip when keyboard focus reaches it after a re-render that re-attaches its root element: a new `status` element (an inline `status` prop creates one on every parent render), a changed `name`, `alt`, locale, caller ARIA, or caller `ref`, or a tooltip that turns on after mount, so sighted keyboard users lose the name tooltip (WCAG 2.2 2.1.1).
- **Small interactive avatars (AR7).** A link or button avatar at 16 or 20px is
  below the 24 by 24 CSS pixel target of WCAG 2.2 2.5.8, and interactive
  avatars in an AvatarGroup overlap, so they lack the spacing exception.
- **Grouped static avatar tooltip (AR4).** Inside an AvatarGroup, a static
  avatar with a tooltip has no tab stop and is not a roving-focus item, so
  sighted keyboard users cannot reveal its tooltip, where WCAG 2.2 2.1.1 and
  1.4.13 expect hover content to be reachable from the keyboard. A custom
  tooltip string still reaches assistive technology as the avatar's
  description.

## Ownership boundary

**Owns**

- The root, the clipped content area, and the Photo, Initials, and Default icon
  parts.
- The fallback chain, size and shape resolution, and status placement.
- The accessible name, including composing a reported status label.
- The name tooltip and the static tab stop that reveals it.
- The static, link, or button root choice and its focus-visible outline.
- Its adaptations inside an AvatarGroup: group size and shape, the surface
  ring, the overlap offset, the item marker, and dropping its own tab stop.

**Does not own / non-goals**

- The status dot's rendering, size tiers, glyphs, and label reporting — owned by
  `component:AvatarStatusDot`. Avatar owns only where the status slot sits and
  how a reported label enters its name.
- Stacking, overflow, and roving focus across avatars — owned by
  `component:AvatarGroup` and `component:AvatarGroupOverflow`.
- Navigation-destination safety and router substitution — owned by
  `family:navigation-destinations` and `spec:AST-005`.
- Tooltip surface, placement, and open timing — owned by the shared tooltip
  hook.

## Public concepts

| Concept | Closed values or states                                                                                                  | Meaning                                                                | Availability by variant/orientation/state        | Default  | Owner              | Stability | Invalid-value behavior                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ | -------- | ------------------ | --------- | ---------------------------------------------- |
| Size    | `xsm` (20), `sm` (24), `md` (36), `lg` (48), `xl` (128), or 16, 20, 24, 32, 36, 40, 48, 60, 64, 72, 96, 128, 144, 180 px | Square box size in CSS pixels.                                         | Outside a group; a group's size wins inside one  | `md`     | `component:Avatar` | Stable    | TypeScript rejects other values.               |
| Shape   | `circle`, `rounded`, `square`                                                                                            | Corner radius `--radius-full`, `--radius-element`, or `--radius-none`. | Outside a group; a group's shape wins inside one | `circle` | `component:Avatar` | Stable    | TypeScript rejects other values.               |
| Visual  | photo; fallback photo; initials; default icon                                                                            | What the content area shows (FR2).                                     | All roots                                        | —        | `component:Avatar` | Stable    | —                                              |
| Root    | static; link; button                                                                                                     | Which element the avatar is (FR6).                                     | Resolved from `href` and `onClick`               | static   | `component:Avatar` | Stable    | `href` wins over `onClick`.                    |
| Tooltip | name (default); custom string; none                                                                                      | Text revealed on hover and keyboard focus.                             | All roots                                        | name     | `component:Avatar` | Stable    | A blank name or blank string shows no tooltip. |
| Status  | node or absent                                                                                                           | Corner content, typically an AvatarStatusDot.                          | All roots and shapes                             | absent   | `component:Avatar` | Stable    | A falsy value renders no status slot.          |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Basis                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root is a relative, non-shrinking inline-flex box of the resolved size with the shape's radius; it carries the `avatar` target, which reflects `size` and `shape`. A clipped content area fills it with the same radius and suppresses text selection.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Current source and tests |
| FR2 | The content area shows `src` while it has not failed, then `fallbackSrc` while it has not failed, then initials when the name yields any, then a default person icon at 60% of the box. Each image renders with empty `alt` and `object-fit: cover`. A failure is tracked per source, so a changed `src` or `fallbackSrc` is tried again.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR3 | Initials are the first letter, digit, or emoji of the first and last words of the trimmed `name`, uppercased; leading punctuation in a word is skipped, words with none are dropped, one qualifying word yields one initial, and grapheme clusters are never split. A whitespace-only name counts as absent. Initials and the default icon paint on the `avatar-fallback` target (reflecting `size`) with `--color-neutral` and primary text, a pair at 4.5:1 or more in light and dark mode, body family, medium weight, and initials at 40% of the box. In forced colors, a lone Avatar's initials and default icon take the surrounding color (`currentColor`): the forced foreground by default, and the system color of a control that paints one around it (GrayText, HighlightText); inside an AvatarGroup they keep the forced foreground on the group's ring. | Current source and tests |
| FR4 | A truthy `status` renders in an absolutely positioned slot outside the clipped content area. On a circle it centers on the circle's edge at the bottom inline-end 45° point; on other shapes it sits at the bottom inline-end corner, offset outward by a quarter of its size. Placement mirrors in right-to-left documents.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Current source and tests |
| FR5 | The resolved name is `alt`, else `name` (blank strings count as absent), composed with the status label as the translated "{name}, {status}" when both exist; a status label alone also names the avatar. The status label comes from a string `label` on the passed element, read on every render, and from a label an AvatarStatusDot reports at any wrapper depth, which wins and updates the root before paint without a second render.                                                                                                                                                                                                                                                                                                                                                                                                                            | Current source and tests |
| FR6 | `href` renders the shared link component (or `as`) with `target` and `rel`; otherwise `onClick` renders a `button type="button"`; otherwise the root is a `div`. Link and button roots carry the `data-avatar-item` marker and the shared focus-visible outline; `onClick` attaches to the link or button. In development, an interactive avatar whose only name is a status label, or that has no name and no caller `aria-label`/`aria-labelledby`, logs a warning.                                                                                                                                                                                                                                                                                                                                                                                                  | Current source and tests |
| FR7 | The tooltip shows the trimmed custom string, else the meaningful `name`, placed above, on hover and keyboard focus; `tooltip={false}` or a blank result shows none. A static avatar with a tooltip and outside a group gets `tabIndex={0}` so keyboard users can reveal it. A custom string is added to `aria-describedby` after any caller value; the default name tooltip is not, because it repeats the name. Implementation gap: a grouped link or button avatar that is not the group's tab stop stops opening its tooltip on focus after a re-render that re-attaches its root element: a new `status` element (an inline `status` prop creates one on every parent render), a changed `name`, `alt`, locale, caller ARIA, or caller `ref`, or a tooltip that turns on after mount (Current-state impact).                                                       | Current source and tests |
| FR8 | Inside an AvatarGroup in the same layer (`spec:AST-038` FR7, FR8), the group's size and shape win over the avatar's own props; the root gains a 2px surface-colored ring outside its box and the group's negative inline-start overlap; a static avatar adds no tooltip tab stop, and link and button roots keep the `data-avatar-item` marker so they join the group's roving set. An avatar in a hover card, popover, or other layer opened from a group keeps its own size and shape, gets no ring or overlap, and keeps its tooltip tab stop; a link or button avatar there still carries the marker, so the group's roving focus, which selects marked elements in its DOM subtree, still includes it.                                                                                                                                                            | Current source and tests |
| FR9 | `ref` reaches the root of every variant. Supported DOM, ARIA, data, and event props reach the root after the derived ARIA, so a caller `aria-label`, `role`, or `aria-hidden` wins (`architecture:public-component-api` INV5); `data-testid` reaches the root; `xstyle`, `className`, and `style` merge in that order after component styles. Implementation gap: on the static root the component sets `tabIndex` after caller props, so a caller `tabIndex` is replaced (Current-state impact).                                                                                                                                                                                                                                                                                                                                                                      | Current source and tests |

### Allowed variation

- **AV1 — Theme paint.** A theme may restyle `avatar` per `size` and `shape` and
  `avatar-fallback` per `size` without changing the fallback chain or the name.
- **AV2 — Router link.** A `LinkProvider` or `as` component may replace the
  native anchor under `family:navigation-destinations`.

### Representative states

| State                 | Required invariant                                                                    | Allowed variation |
| --------------------- | ------------------------------------------------------------------------------------- | ----------------- |
| Photo, named          | `role="img"` root named by `alt` or `name`; inner image has empty `alt`.              | Size, shape.      |
| Failed photo          | Fallback photo, then initials or icon; a new `src` retries.                           | —                 |
| Initials              | Uppercase initials on `avatar-fallback`.                                              | Name.             |
| Unnamed, no status    | `role="presentation"` and `aria-hidden="true"`; default icon; no tooltip.             | —                 |
| Named with status dot | Name reads "{name}, {status}"; the dot sits on the edge or corner.                    | Shape, direction. |
| Link                  | Link root with marker, outline, and `aria-label`.                                     | Router component. |
| Button                | `button type="button"` root with marker, outline, and `aria-label`.                   | —                 |
| Static with tooltip   | `tabIndex={0}`; tooltip on hover and focus.                                           | Tooltip text.     |
| In a group            | Group size and shape; surface ring; overlap; no own tab stop (AR4 gap for a tooltip). | Group overlap.    |

### Transformation and precedence order

- **ORD1 — Visual.** `src` → `fallbackSrc` → initials → default icon.
- **ORD2 — Name.** `alt` → `name`; then compose with status label; a reported
  label → a passed element's `label`. A caller `aria-label` replaces the result.
- **ORD3 — Root.** `href` → `onClick` → static.
- **ORD4 — Size and shape.** An AvatarGroup in the same layer → the avatar's
  own prop → default.

### Performance and resources

- **PR1 — Name updates without re-rendering.** A status label that a wrapped
  AvatarStatusDot reports, or that changes later, updates the avatar's name
  before paint without an extra render of the avatar.

## Accessibility contract

- **AR1 — Named image.** A static avatar with a name is `role="img"` with that
  name; without one, and without a status label, it is `role="presentation"`
  with `aria-hidden="true"`. Inner images and the default icon are decorative.
- **AR2 — Status reaches assistive technology.** Because a `role="img"` root
  prunes its descendants, the status label is composed into the avatar's own
  name (FR5).
- **AR3 — Interactive roots.** Link and button roots keep their native roles and
  take only the `aria-label`; they draw the shared focus-visible outline.
- **AR4 — Keyboard-reachable tooltip.** An avatar's tooltip can be revealed
  from the keyboard (WCAG 2.2 2.1.1, 1.4.13): it opens on keyboard focus, and a
  static avatar outside a group gains a tab stop while it has a tooltip.
  Implementation gaps: inside an AvatarGroup in the same layer a static avatar
  drops that tab stop
  and the group's roving focus covers only link and button avatars, so its
  tooltip opens on hover only; and a grouped link or button avatar that is not the group's tab stop stops opening its tooltip on keyboard focus after a re-render that re-attaches its root element: a new `status` element (an inline `status` prop creates one on every parent render), a changed `name`, `alt`, locale, caller ARIA, or caller `ref`, or a tooltip that turns on after mount.

- **AR5 — Description without duplication.** Only a custom tooltip string
  describes the root; the default name tooltip adds no description.
- **AR6 — Caller ARIA wins.** A caller `aria-label`, `role`, or `aria-hidden`
  overrides the derived value on first render and on later status updates.
- **AR7 — Target size.** An interactive avatar's target is at least 24 by 24
  CSS pixels or has the spacing WCAG 2.2 2.5.8 allows. Implementation gap: a
  link or button avatar at `xsm` (20px) or at 16 or 20px is smaller, and
  interactive avatars in an AvatarGroup overlap their neighbors.

## Design relationships

| Anatomy or state | Design requirement                                                     | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Photo            | The person's image, cropped to fill the shape.                         | Current source and docs  | Prominent      | FR1, FR2           |
| Initials         | A readable stand-in derived from the name.                             | Current source and docs  | Prominent      | FR2, FR3           |
| Default icon     | A generic silhouette when there is no image or name.                   | Current source and docs  | Supporting     | FR2, FR3           |
| Status dot       | Availability shown at the bottom inline-end, outside the clipped area. | Current source and docs  | Supporting     | FR4, FR5, AR2      |

Theming: the root is the `avatar` target and the initials and default icon
surface is the `avatar-fallback` target; the photo inherits the root. The status
dot's targets belong to `component:AvatarStatusDot`. The consumer anatomy names
no root part, so no anatomy-theming block is declared.

## Family and system relationships

- `family:navigation-destinations` and `spec:AST-005` own destination checks for
  the link root; Avatar adopts them through the shared link component.
- `component:AvatarStatusDot` reports its label to the owning Avatar, which composes
  it (FR5) and places the slot (FR4).
- `spec:AST-038` FR7 and FR8 stop the group's context-carried membership at a
  layer boundary; FR8's size, shape, ring, overlap, and tab-stop adaptations
  apply only within one layer, while keyboard ownership is unchanged.
- `component:AvatarGroup` supplies size, shape, and overlap to its members and
  owns roving focus over `data-avatar-item` roots (FR8).
- `architecture:internationalization` owns the catalog behind the composed
  name.

## Verification map

| Contract           | Verification                                                                                                                                                | Representative states                                                                                                                   | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                              | Audit section           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| FR1–FR3            | `Avatar.test.tsx` fallback, initials, retry, and target tests; `AvatarForcedColors.a11y.chromium.spec.ts` in real Chromium with forced colors emulated      | Photo, failure, initials, punctuation, emoji, blank name; `lg` box; forced colors alone, inside GrayText and HighlightText, and grouped | A wrong initials-or-icon fallback, split grapheme, lost retry, missing target, wrong `lg` box size, or forced-colors initials that miss the surrounding system color (lone) or leave the forced foreground (grouped) fails. Gap: no test sets `src` and `fallbackSrc` together, so the `src`-first order is unchecked, and sizes other than `lg` and numeric sizes are visible only in `Avatar.stories.tsx`. | `audit:Avatar/behavior` |
| FR4                | `Avatar.test.tsx` shape and status tests; `Avatar.stories.tsx` status fixtures                                                                              | Every shape with a status; RTL                                                                                                          | A missing status slot fails. Gap: the tests assert presence only, so the slot's position, mirroring, and offset are visible only in the rendered fixtures.                                                                                                                                                                                                                                                   | `audit:Avatar/layout`   |
| FR5, AR1, AR2, PR1 | `Avatar.test.tsx` status-name and wrapper suites                                                                                                            | Direct, wrapped, changing, removed labels                                                                                               | A lost composed name, extra render, or stale label fails.                                                                                                                                                                                                                                                                                                                                                    | `audit:Avatar/a11y`     |
| FR6, AR3           | `Avatar.test.tsx` interactivity suite                                                                                                                       | Link, button, static, dev warnings                                                                                                      | A wrong root, a missing marker, or a missing warning fails. Gap: no test checks the focus-visible outline.                                                                                                                                                                                                                                                                                                   | `audit:Avatar/behavior` |
| FR7, AR4, AR5      | `Avatar.test.tsx` name-tooltip suite                                                                                                                        | Default, custom, disabled, blank                                                                                                        | A missing tab stop, a duplicated description, or a lost ref fails. Gap: no test covers a grouped avatar's tooltip after a re-render that re-attaches its root element: a new `status` element (an inline `status` prop creates one on every parent render), a changed `name`, `alt`, locale, caller ARIA, or caller `ref`, or a tooltip that turns on after mount.                                           | `audit:Avatar/a11y`     |
| FR8                | `Avatar.test.tsx` group shape tests; `AvatarGroup.test.tsx` size-cascade, overlap, and roving suites; `layerScopedContext.test.tsx` AvatarGroup layer tests | Inside a group; in a layer opened from a group; outside a group                                                                         | An avatar size or shape prop winning inside a group, a lost overlap, an interactive avatar missing from the roving set, or a static avatar in a layer losing its tooltip tab stop fails. Gap: no test asserts the ring, or size and shape inside a layer.                                                                                                                                                    | `audit:Avatar/behavior` |
| FR9, AR6           | `Avatar.test.tsx` consumer-ARIA override suite                                                                                                              | Static and interactive roots                                                                                                            | A derived value replacing a caller `aria-label`, `role`, or `aria-hidden` fails. Gap: no test covers a caller `tabIndex`.                                                                                                                                                                                                                                                                                    | `audit:Avatar/a11y`     |
| AR1–AR3, AR5       | Accessibility-tree evidence (`spec:AST-009` FR3)                                                                                                            | Named, decorative, status-composed, interactive                                                                                         | Gap: no accessibility-tree check proves the computed roles, names, or description; the unit tests query the DOM.                                                                                                                                                                                                                                                                                             | `audit:Avatar/a11y`     |
| AR7                | `Avatar.stories.tsx` interactive and size fixtures in a browser                                                                                             | Interactive avatars at every size                                                                                                       | Gap: no automated target-size check; the undersized targets are the recorded gap.                                                                                                                                                                                                                                                                                                                            | `audit:Avatar/a11y`     |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Avatar/Avatar.swift.spec.md -->


# Avatar (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Avatar(_ name: String? = nil, src:, fallbackSrc:, alt:, size: AvatarSize?, shape: AvatarShape?, tooltip: AvatarTooltip?, href:, status:, onClick:)` and `Avatar(_ props: AvatarProps, status:)`, a SwiftUI `View` in module `Astryx`. `size` is the named sizes `xsm` to `xl`. |
| Behavior                | Draws the image at `src`, else `fallbackSrc`, else initials from `name` on the theme's neutral plate, else a person symbol, clipped to its shape. With `href` it is a SwiftUI `Link`; with only `onClick` it is a button; it draws the same either way.                         |
| End-user impact         | A person sees the same picture, initials, and shape as on the web, and VoiceOver reads the avatar's name, or skips a decorative one.                                                                                                                                            |
| Builder impact          | An app passes a name and an image URL, and optionally tooltip words and an `AvatarStatusDot`. Pixel sizes, `target`, and `rel` have no Swift form; an `href` must be an absolute URL.                                                                                           |
| Compatibility/readiness | Additive: a new view and generated `AvatarProps`. Draft; built and tested on macOS and the iOS Simulator; device captures are attached to the change.                                                                                                                           |
| Review checks           | Reject a size or shape beyond the contract, a disabled state, a link or button that draws differently from the static avatar, a layout that grows for the touch target, or a static avatar VoiceOver reads without a name.                                                      |
| Governing rules         | `spec:AST-082` FR3, FR4, FR7; `spec:AST-093` FR1–FR5; the Swift component API (A1–A9), theme environment, and accessibility records under `packages/native/specs/swift/library/`.                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

Avatar on Apple platforms shows a person's or an entity's picture with core's
fallback order, sizes, shapes, and naming, drawn with SwiftUI's own image
loading and link and button controls.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Loading `src`, then `fallbackSrc`, with SwiftUI `AsyncImage`.
- Initials, the person symbol, the plate color, and the shape clip.
- Switching to a SwiftUI `Link` or `Button` for `href` or `onClick` without
  changing the drawing.
- The avatar's VoiceOver name and its touch target.

**Does not own / non-goals**

- The meaning of the props, the initials rule, and the size scale — owned by
  `component:Avatar`.
- Avatar groups, which have no Swift view.

## Public concepts

| Concept | Closed values or states                        | Meaning                                             | Availability by variant/orientation/state | Default  | Owner                    | Stability    | Invalid-value behavior                                                     |
| ------- | ---------------------------------------------- | --------------------------------------------------- | ----------------------------------------- | -------- | ------------------------ | ------------ | -------------------------------------------------------------------------- |
| size    | `xsm`, `sm`, `md`, `lg`, `xl`                  | 20, 24, 36, 48, 128 points at the default text size | always                                    | `md`     | `component:Avatar`       | experimental | core's pixel sizes have no Swift form                                      |
| shape   | `circle`, `rounded`, `square`                  | full round, the theme's element radius, no radius   | always                                    | `circle` | `component:Avatar`       | experimental | none                                                                       |
| picture | image, fallback image, initials, person symbol | the first that is available, in that order          | always                                    | —        | `component:Avatar`       | experimental | an empty or unloadable URL moves to the next                               |
| control | static, link (`href`), button (`onClick`)      | how a tap behaves; the drawing is the same          | always                                    | static   | `component:swift/Avatar` | experimental | an `href` that is not an absolute URL leaves the avatar static or a button |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Basis                                                       | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| FR1 | The view MUST show the image at `src`; when it is absent or fails, the image at `fallbackSrc`; then initials from a `name` that is not blank; then a person symbol. The fallback image loads only after `src` fails or when there is no `src`; while an image loads, the initials or the person symbol show.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | core `Avatar` fallback order; `spec:AST-093` FR2            | verify             |
| FR2 | Initials MUST follow core's rule: the first letter, digit, or emoji of the first and last words that have one, uppercased, skipping leading punctuation, keeping a whole emoji, flag, or joined emoji sequence. A name with none shows the person symbol and still names the avatar.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | core `Avatar` initials                                      | verify             |
| FR3 | The avatar MUST be a square of 20, 24, 36, 48, or 128 points for `xsm` to `xl` at the default text size, grown with Dynamic Type up to 1.6 times and never shrunk, so it and its initials grow with the name beside them without swallowing a row (`spec:AST-082` FR11). It is clipped to a circle, to the theme's `radius.element`, or to a square.                                                                                                                                                                                                                                                                                                                                                                                                                             | core `Avatar` sizes and shapes                              | verify             |
| FR4 | Initials and the person symbol MUST draw in `color.textSecondary` on `color.neutral`; initials use the theme's body family at medium weight and 40% of the side.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | core `Avatar` fallback styles; `spec:AST-093` FR4           | verify             |
| FR5 | With an `href` that is an absolute URL (it has a scheme), the avatar MUST be a SwiftUI `Link`, except that a script URL (`javascript:`, `vbscript:`) or an HTML document in a `data:` URL MUST leave it without a link, as a button with `onClick` or static (`family:navigation-destinations` FR4); with `onClick` too, `onClick` runs as it opens and the URL then goes to the app's own URL handler, or the system's. An `href` that is not an absolute URL, such as a web path, MUST stop a development build with a message naming it; a release build draws the avatar without a link, as a button with `onClick` or static. With only `onClick`, a SwiftUI `Button`. Either draws exactly as the static avatar, and the avatar has no disabled state.                     | Swift component API A4                                      | verify             |
| FR6 | Both initializers MUST build the same `AvatarProps`; `name` is the unlabeled first parameter, a single trailing closure is the status, and `onClick` comes last. Base props come through `AvatarProps`: with `isHidden` the view draws nothing; `id` becomes the accessibility identifier.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Swift component API A2–A4, A7; `spec:AST-082` FR7           | verify             |
| FR7 | The `status` slot MUST draw its content, usually one `AvatarStatusDot`, outside the avatar's clip, placed from the content's own size, in the same layout pass, as core places any status: on a circle centered on the circle's edge at the bottom trailing 45° point, on a rounded or square avatar overhanging the bottom trailing corner by a quarter of its size, mirrored in right-to-left layouts. It MUST NOT change the avatar's size or layout, gives a dot the avatar's side for its size tier, and lets other content grow with Dynamic Type no faster than the avatar, up to the text size at its 1.6 times growth: the content still grows with Dynamic Type (`spec:AST-082` FR11), up to its owner's growth, since the owner sizes what it holds (Swift slots S4). | core `Avatar` status position; Swift slots S4               | verify             |
| FR8 | `tooltip` MUST resolve, as core does, to the name for `nil` or `true`, the given words for a string, and nothing for `false` or blank words, and MUST show through the Astryx tooltip (`architecture:native-swift-library-tooltip`), with the focus and touch the Tooltip by input table below states: a static avatar is a tab stop exactly when it shows a tooltip, as core gives its root a tab stop only then, and opens on a tap; a link or button keeps its focus and its tap. A focused avatar shows the platform's focus ring, as core shows its focus-visible ring. Given words are the VoiceOver hint. On the wire it is the web value, a string or a Bool.                                                                                                            | core `Avatar` `tooltip`; core `Tooltip`; `spec:AST-082` FR3 | verify             |

**Tooltip by input (FR8).** The Astryx tooltip's rules apply; this table
states Avatar's choices.

| Input          | Default name                                                                                                                                                                                                                               | Given words                                                  | Off (`false` or blank)                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------ |
| Pointer        | the bubble shows the name above the avatar after 200 ms, stays while the pointer is on it, and a press hides it                                                                                                                            | the same, with the words                                     | nothing                                    |
| Keyboard focus | the bubble shows the name at once and Escape hides it; a static avatar is a tab stop                                                                                                                                                       | the same, with the words                                     | nothing; a static avatar is not a tab stop |
| Touch tap      | a direct tap on a static avatar opens the bubble with the name; another tap on it, or a tap anywhere else, closes it, and that tap still reaches what it lands on; the tap is shared with an enclosing row; a link or button keeps its tap | the same, with the words                                     | nothing                                    |
| VoiceOver      | the name is read once, as the avatar's own; the bubble is hidden and the tap is left alone                                                                                                                                                 | the words are the hint, as core puts them in the description | nothing                                    |

### Allowed variation

- **AV1 — Loading.** While an image loads, the initials or the person symbol
  show instead of an empty plate.
- **AV2 — Glyph.** The person symbol is the SF Symbol `person.fill`, not core's
  SVG.

- **AV3 — Tooltip surface.** The tooltip is the Astryx tooltip's bubble in
  core's tooltip colors on every input. SwiftUI's `.help` does not fit: it is
  also the VoiceOver hint, so it would read the name twice, and it shows with
  the system's look and delay, never on keyboard focus or a tap.

### Representative states

| State                          | Required invariant                     | Allowed variation |
| ------------------------------ | -------------------------------------- | ----------------- |
| image                          | the image fills the shape              | image content     |
| failed image with a fallback   | the fallback image                     | none              |
| initials, every size and shape | initials centered on the neutral plate | glyph metrics     |
| no name                        | the person symbol at 60% of the side   | none              |
| link and button                | the same drawing as static             | none              |
| light and dark, two themes     | each theme's plate and text color      | none              |

### Transformation and precedence order

- **ORD1 — Picture.** `src` → `fallbackSrc` → initials → person symbol.
- **ORD2 — Name.** `alt` → `name`, where a blank string is none; then
  compose with the status label (AR6), a dot's label before another
  element's.
- **ORD3 — Control.** `href` (link) → `onClick` (button) → static.

### Performance and resources

- **PR1 — System loading.** Images load through `AsyncImage` and the system
  URL cache; the view keeps no image cache of its own.

## Accessibility contract

- **AR1 — Named or decorative.** A static avatar with a name is one image
  element named by `alt`, else `name`, composed with its status label (AR6);
  without a name and without a status label it is hidden from VoiceOver.
  A link or button avatar is one element with the link or button trait and the
  same name; the initials are never an element of their own (Swift
  accessibility X1, X5).
- **AR2 — Touch target.** A link or button avatar, and a static avatar whose
  tap opens its tooltip, answers taps across at least 44 by 44 points without
  changing its drawn size or layout (X7).
- **AR3 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree and the hit region are not measured until an
  app-hosted target exists.
- **AR4 — Unnamed taps are flagged.** A link or button avatar without `alt`
  or `name` logs a development warning, as core warns.
- **AR5 — Initials contrast.** The initials draw in core's tokens,
  `color.textSecondary` on `color.neutral`, as core's Avatar does. In the
  default and neutral themes' dark appearance that pair is below 4.5:1, in
  core as well; the fix belongs to the theme tokens.
- **AR6 — Status in the name.** The status label joins the avatar's name as
  core's message composes it ("Ada Lovelace, Online"); a status label alone
  names an otherwise unnamed avatar. The label comes from an `AvatarStatusDot` or a labeled `Icon` in the slot, at any depth, as core reads the `label` of the element passed as `status`, and a dot's label wins, as core's reported dot label does; SwiftUI cannot read a label from other
  views, so theirs does not join.

## Design relationships

| Anatomy or state | Design requirement                       | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------- | ------------------------ | -------------- | ------------------ |
| Photo, initials  | Apple Human Interface Guidelines, Images | prescribed by core       | prominent      | FR1–FR4            |

The component implements design requirements without copying their rationale.

Platform controls: SwiftUI `AsyncImage` for the images, SwiftUI `Link` for
`href`, and SwiftUI `Button` for `onClick` (`spec:AST-093` FR2). SwiftUI has no
avatar control, so the plate, initials, and clip are drawn here. Guideline
pages: Images, Buttons, and Accessibility in the Apple Human Interface
Guidelines.

Theme values read: `color.neutral`, `color.textSecondary`, `radius.element`,
`font.family.body`, `font.weight.medium`, and Bold Text; for the tooltip bubble,
`color.textPrimary`, `color.backgroundSurface`, `space.s1`, `space.s2`,
`radius.container`, and the body text size and weight.

## Family and system relationships

- `component:Avatar` owns the props, the sizes, the initials rule, and the
  fallback order; this record states only how Swift draws them.
- An owner that holds an Avatar in a slot leaves an unsized Avatar at `md`
  (Swift slots S4).

## Verification map

| Contract      | Verification                                                                                                                                                                                                                                                                | Representative states                                                                                               | Mutation or failure expectation                                                                                                                                                                                                                                                               | Audit section                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, FR2      | `AvatarTests.swift` initials and fallback tests                                                                                                                                                                                                                             | core's initials cases; blank and symbol names                                                                       | a wrong initial or a missing person symbol fails                                                                                                                                                                                                                                              | `audit:swift/Avatar/picture` |
| FR3, FR4      | `AvatarTests.swift` size, text-size growth, shape, and two-theme renders                                                                                                                                                                                                    | each size; xx-large and the largest text size; circle and square; light, dark, butter                               | a wrong side, no growth or growth past 1.6 times, an unclipped corner, or a color of its own fails                                                                                                                                                                                            | `audit:swift/Avatar/look`    |
| FR5, AR2, AR4 | `AvatarTests.swift` link and button renders; tap, trait, tap-area, warning, `linkURL`, web-path, and refused-destination tests                                                                                                                                              | static, link, button; malformed, relative, and empty `href`; `javascript:`, `vbscript:`, and `data:text/html` hrefs | a link or button that draws differently, a malformed `href` made a link, a web path not flagged, an unflagged unnamed tap, or a refused destination made a link fails                                                                                                                         | `audit:swift/Avatar/control` |
| FR8           | `AvatarTests.swift` tooltip words, focus and touch, VoiceOver hint, and wire tests; `TooltipPresenterTests.swift` for each input; `contracts.test.ts`; `parseDocType.test.ts`                                                                                               | name, `true`, words, `false`, blank, no name; static, link, button                                                  | a wrong tooltip, a static avatar that is not a tab stop or does not open on a tap, a control that loses its tap, or a wire value that is not the web's fails; not measured until a test exists: a static avatar that shows no tooltip and takes focus, or a focused avatar with no focus ring | `audit:swift/Avatar/tooltip` |
| FR6           | `AvatarTests.swift` initializer and hidden tests; `contracts.test.ts`                                                                                                                                                                                                       | both initializers; `isHidden`; named sizes                                                                          | differing props, a drawn hidden avatar, or a pixel size in Swift fails                                                                                                                                                                                                                        | `audit:swift/Avatar/api`     |
| FR7, AR6      | `AvatarStatusDotTests.swift` placement renders of a dot and of other content at its measured place, size, an icon's growth at the largest text size, dot-label-wins, and name tests; the label preference that carries a label into the rendered name is not measured (AR3) | circle and square at `lg`; name with and without a status                                                           | a dot that changes the avatar's size, sits off the edge, or leaves the name without its label fails                                                                                                                                                                                           | `audit:swift/Avatar/status`  |
| AR1           | `AvatarTests.swift` naming and trait tests                                                                                                                                                                                                                                  | `alt`, `name`, blank, none                                                                                          | a wrong name or a named decorative avatar fails                                                                                                                                                                                                                                               | `audit:swift/Avatar/a11y`    |
| AR5           | `AvatarTests.swift` two-theme renders draw the initials in core's tokens                                                                                                                                                                                                    | default and neutral, light and dark                                                                                 | initials in tokens other than core's fail                                                                                                                                                                                                                                                     | `audit:swift/Avatar/look`    |

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Avatar/AvatarStatusDot.spec.md -->


# AvatarStatusDot component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | A status dot for Avatar's `status` slot with `variant` (default `success`), optional `label`, and optional `icon`.                              |
| Behavior                | The dot sizes itself from the owning Avatar in three tiers, pairs each built-in variant with a distinct shape, and reports its label to Avatar. |
| End-user impact         | Screen-reader users hear the status in the avatar's name; sighted users can tell statuses apart by shape as well as color.                      |
| Builder impact          | None; the record describes shipped behavior.                                                                                                    |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. One implementation gap is listed under Current-state impact.         |
| Review checks           | Reject a built-in variant that differs only by color, an exposed glyph or icon, or a label that stops reaching the owning Avatar.               |
| Governing rules         | `architecture:component-theming-surface/INV2,INV6,INV14`; `architecture:public-component-api/INV5,INV6,INV8`; WCAG 2.2 1.4.1.                   |

This table is a review projection; the body below is authoritative.

## Intent

AvatarStatusDot renders the compact status indicator composed through Avatar's
`status` slot. It owns the dot's size tiers, its built-in non-color marks, and
reporting its label into the owning Avatar's accessible name.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Augmented variant without a fallback (FR6).** `AvatarStatusDotVariantMap`
  admits theme-added names, but a name with no built-in rule renders the dot's
  geometry and `data-variant` with no fill, ink, or glyph. A caller `icon` with
  a `style` color covers the medium and large tiers, but the small tier drops
  the icon, and nothing paints a theme-independent baseline.
  `architecture:component-theming-surface` INV14 requires an extensible visual
  axis to have a safe theme-independent baseline.

## Ownership boundary

**Owns**

- The painted status-dot root and its `avatar-status-dot` target.
- The built-in filled, ring, and minus visual branches and the
  `avatar-status-dot-glyph` target.
- Size-tier resolution from Avatar's resolved numeric size.
- Reporting its optional status label into Avatar's accessible name.

**Does not own / non-goals**

- Avatar identity, image fallback, shape, status placement, or interactive behavior
  — owned by `component:Avatar`.
- The meaning or artwork of caller-supplied icon content.

## Public concepts

Consumer syntax remains in `AvatarStatusDot.doc.mjs`.

| Concept        | Closed values or states                                                               | Meaning                                                             | Availability by variant/orientation/state | Default               | Owner                                                               | Stability | Invalid-value behavior                                                                                                              |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- | --------------------- | ------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Status variant | Built-ins `success`, `neutral`, `error`; the released map also admits augmented names | Selects the plate color and built-in non-color mark.                | All size tiers; LTR and RTL.              | `success`             | `component:AvatarStatusDot`                                         | Stable    | An augmented name is reflected as `data-variant` and keeps a safe theme-independent baseline (FR6); today it has none, the FR6 gap. |
| Status label   | String or absent                                                                      | Names a standalone dot and is reported into the owning Avatar name. | Every variant and size.                   | Absent                | Caller supplies meaning; component exposes and reports it           | Stable    | Empty or absent label emits no role or accessible name on the dot and reports no status name.                                       |
| Custom icon    | Renderable React content or absent                                                    | Replaces the built-in glyph where the size tier has room.           | Medium and large tiers; hidden on small.  | Absent                | Caller owns artwork; component owns placement and suppression rules | Stable    | Booleans and empty strings are ignored; a component that renders no DOM still suppresses the built-in glyph.                        |
| DOM extension  | Supported BaseProps inputs and ref                                                    | Extends the root and combines consumer styles.                      | Every render branch.                      | No additional inputs. | `architecture:public-component-api`                                 | Stable    | BaseProps omissions remain unsupported.                                                                                             |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| FR1 | Avatar sizes up to 36px resolve a 10px dot with a 1px border and no custom icon; 40–72px resolve a 20px dot, 2px border, and 12px icon; 96px and above resolve a 32px dot, 4px border, and 18px icon. The border is the surface color. Outside an Avatar in the same layer (`spec:AST-038` FR7, FR8) the dot uses the 36px tier.                                                                                                                                                                                                                                   | Current source, tests, and stories                                                     |
| FR2 | `success` paints a filled `--color-success` plate with no inner glyph; `neutral` paints a surface plate with a ring in secondary text color; `error` paints a `--color-error` plate with a minus bar in `--color-on-error`, and `success` sets `--color-on-success` as its ink. Glyphs are stroked in `currentColor` at 1, 1.5, or 2px by tier; the minus spans 75% of the inner field with round caps. The plates are the strong status fills and their ink is the matching content role (`architecture:theme-tokens` INV11).                                     | Current source, tests, and consumer docs                                               |
| FR3 | At medium and large tiers, renderable `icon` content replaces the built-in glyph and is centered in an assistive-technology-hidden wrapper sized to the tier's icon size. At the small tier the icon is omitted and the built-in glyph remains. Booleans and empty strings are not renderable.                                                                                                                                                                                                                                                                     | Current source and tests                                                               |
| FR4 | A non-empty `label` adds `role="img"` and `aria-label` to the dot. The dot reports the same label to the owning Avatar before paint, at any wrapper depth, and withdraws it when it unmounts.                                                                                                                                                                                                                                                                                                                                                                      | Current source and Avatar integration tests                                            |
| FR5 | The root carries `avatar-status-dot` with `variant`; ring and minus SVGs carry `avatar-status-dot-glyph` with `shape`. Supported consumer props and ref reach the root; the dot's own role, name, and styling apply after caller props, and `xstyle`, `className`, and `style` merge in that order.                                                                                                                                                                                                                                                                | Current source, docs, and target tests                                                 |
| FR6 | The released `AvatarStatusDotVariantMap` admits augmented names, and an extensible visual axis has a safe theme-independent baseline (`architecture:component-theming-surface` INV14). For an unmatched name, root geometry and reflected `data-variant` remain while built-in fill, ink, and glyph are absent; at the medium and large tiers a caller `icon` with a `style` color supplies a color and a mark, and at the small tier the icon is not rendered. Implementation gap: no theme-independent baseline paints an unmatched name (Current-state impact). | Current source, docs, focused test, and `architecture:component-theming-surface/INV14` |

### Allowed variation

- **AV1 — Identity and meaning.** The status label and caller icon artwork may vary.
- **AV2 — Theme output.** Targets and reflected axes may vary through the public
  theming system without moving target ownership.
- **AV3 — Consumer styling.** Supported BaseProps inputs may vary on the root
  while component-owned size and reporting behavior remain.

### Representative states

| State                  | Required invariant                                                                                     | Allowed variation                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Built-in variants      | Fill, ring, and minus branches and reflected `variant` remain.                                         | Label, Avatar content, size, theme, and direction may vary. |
| Small tier             | Dot and built-in shape remain; custom icon is omitted.                                                 | Built-in variant and label may vary.                        |
| Medium and large tiers | Tier dimensions apply; renderable custom icon replaces the glyph.                                      | Icon artwork, variant, label, and theme may vary.           |
| Labelled               | Dot exposes its label and reports it to Avatar.                                                        | The caller-authored label may vary.                         |
| Unlabelled             | Dot has no role or name and reports no status label.                                                   | Visual variant and icon may still render.                   |
| Augmented variant      | Root geometry and reflected `data-variant` render; built-in fill, ink, and glyph are absent (FR6 gap). | A theme may paint the added name.                           |
| RTL                    | Dot content is direction-neutral; Avatar owns logical corner placement.                                | Theme, variant, size, label, and icon may vary.             |

### Transformation and precedence order

- **ORD1 — Resolve size.** Take the owning Avatar's resolved size (36px outside
  an Avatar in the same layer), then select the discrete size tier and dimensions.
- **ORD2 — Resolve mark.** A renderable icon wins when the tier permits it;
  otherwise the built-in variant glyph is selected when one exists.
- **ORD3 — Resolve root.** Caller props → role and name → component target and
  styles → `xstyle` → `className` → `style`.

### Performance and resources

- **PR1 — Reporting without re-rendering.** Reporting or withdrawing the label
  causes no extra render of the dot or the avatar and leaves no listener,
  observer, or timer behind.

## Accessibility contract

- **AR1 — Accessible name.** A non-empty `label` names a standalone dot and is
  composed into the owning Avatar's name.
- **AR2 — Decorative visual marks.** The built-in SVG and custom-icon wrapper are
  hidden from assistive technology because the root or Avatar name carries status.
- **AR3 — Built-in non-color cues.** The three built-in variants use filled,
  ring, and minus topologies in addition to semantic color (WCAG 2.2 1.4.1). A
  caller icon replaces that mark at medium and large tiers, so the non-color
  distinction then depends on the caller using a different icon per status.

## Design relationships

| Anatomy or state | Design requirement                                             | Representation authority                                             | Hierarchy role             | Component contract |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------- | ------------------ |
| Status-dot root  | Compact semantic-status plate on Avatar's edge.                | Current source and consumer docs; no current component design record | Supporting indicator       | FR1, FR2, FR5      |
| Built-in glyph   | Ring or minus supplements color for neutral/error.             | WCAG 2.2 SC 1.4.1 plus current shipped representation                | Meaningful non-text cue    | FR2, AR3           |
| Custom icon      | Caller artwork replaces the built-in mark where space permits. | Caller owns artwork; current source owns placement                   | Conditional meaningful cue | FR3, AR2, AR3      |

## Family and system relationships

- `architecture:component-theming-surface` owns painting-target qualification,
  reflected axes, and the reliable theme-independent fallback required for an
  extensible visual axis; FR6 records the gap against it.
- `architecture:component-style-authoring` owns StyleX lowering and permits the
  component-owned non-glyph SVG shapes used here.
- `architecture:public-component-api` owns the released subpath, BaseProps
  passthrough, styling composition, ref reachability, and compatibility boundary.
- `architecture:theme-tokens` owns the semantic color and radius vocabulary.
- `spec:AST-002` owns API admission and requires future public behavior or default
  changes to identify current authority.

## Verification map

| Contract          | Verification                                                              | Representative states                                                | Mutation or failure expectation                                                                                                                                        | Audit section                         |
| ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| FR1–FR3, AR2, AR3 | `AvatarStatusDot.test.tsx` and `AvatarStatusDot.stories.tsx` in a browser | Three size tiers, three built-ins, custom icon present/absent        | Size-tier, mark-selection, hidden-icon, or built-in-shape drift fails focused assertions or the rendered fixture.                                                      | `audit:AvatarStatusDot/behavior`      |
| FR4, AR1          | `Avatar.test.tsx` status-name suites and `AvatarStatusDot.test.tsx`       | Direct/wrapped/changing/removed labels; labelled and unlabelled dots | Losing the standalone or composed status name, commit-phase update, or cleanup fails role/name assertions.                                                             | `audit:AvatarStatusDot/accessibility` |
| FR5               | `themingTargets.test.ts` and `extensibleAxes.test.ts`                     | Built-in and augmented variants, glyph ring/minus                    | Missing target metadata or axis wiring fails the structural checks. Gap: no test renders the dot to check that consumer props, ref, and styling inputs reach the root. | `audit:AvatarStatusDot/theming`       |
| FR6               | `AvatarStatusDot.test.tsx` augmented-variant test                         | Augmented name without a matching built-in rule                      | A glyph appearing for an unmatched name fails. Gap: a fill appearing, and the caller `icon` path, have no automated check.                                             | `audit:AvatarStatusDot/api`           |
| RTL relation      | `AvatarStatusDot.stories.tsx` in a browser in both directions             | Built-ins across all size tiers                                      | New directional glyph, physical positioning, or unmatched transform is visible in the rendered fixture.                                                                | `audit:AvatarStatusDot/i18n-rtl`      |
| Record structure  | `scripts/check-knowledge.mjs`                                             | This record                                                          | Missing required structure or relationships fails repository validation.                                                                                               | `audit:AvatarStatusDot/docs`          |
| PR1               | `Avatar.test.tsx` no-extra-render test                                    | Wrapped status label                                                 | An extra render or a reporting loop fails.                                                                                                                             | `audit:AvatarStatusDot/behavior`      |
| AR1, AR2          | Accessibility-tree evidence (`spec:AST-009` FR3)                          | Labelled and unlabelled standalone dots                              | Gap: no accessibility-tree check proves the standalone image role and name or the hidden marks; the unit tests query the DOM.                                          | `audit:AvatarStatusDot/accessibility` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer examples, current audit scores, screenshots,
run inventories, eligibility data, or shared API/theming rules. It links to their
owners.

---

<!-- source: docs/specs/components/Avatar/AvatarStatusDot.swift.spec.md -->


# AvatarStatusDot (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `AvatarStatusDot(variant: AvatarStatusDotVariant? = nil, label: String? = nil)` and `AvatarStatusDot(_ props: AvatarStatusDotProps)`, a SwiftUI `View`, placed in `Avatar`'s `status` slot.                     |
| Behavior                | Draws core's dot at the tier for its avatar's size: `success` filled, `neutral` a ring, `error` a minus bar, each in theme tokens with a surface border. Its label joins the avatar's name.                     |
| End-user impact         | A person sees who is online, away, or busy by shape as well as color, and VoiceOver reads it with the person's name ("Ada Lovelace, Online").                                                                   |
| Builder impact          | An app puts the dot in the avatar's trailing closure with a label. A custom icon inside the dot has no Swift form.                                                                                              |
| Compatibility/readiness | Additive: a new view, generated `AvatarStatusDotProps`, and core's name-with-status message in the Swift string catalogs. Draft; built and tested on macOS and the iOS Simulator; device captures are attached. |
| Review checks           | Reject a status shown by color alone, a dot that resizes or moves the avatar, a dot that VoiceOver reads separately inside an avatar, or a color that is not a theme token.                                     |
| Governing rules         | `spec:AST-082` FR4, FR7; `spec:AST-093` FR1–FR5; the Swift component API, slots (S4), theme environment, and accessibility (X1, X6) records under `packages/native/specs/swift/library/`.                       |

This table is a review projection; the body below is authoritative.

## Intent

AvatarStatusDot on Apple platforms shows a person's status on their avatar by
shape and color, sized from the avatar, and gives the avatar its words.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The dot's size tier, fill, border, and shape glyph per variant.
- Reporting its label to the avatar that holds it.

**Does not own / non-goals**

- Where the dot sits and how the name is composed — owned by
  `component:swift/Avatar` (FR7, AR6).
- The meaning of the variants — owned by `component:AvatarStatusDot`.

## Public concepts

| Concept | Closed values or states       | Meaning                                                  | Availability by variant/orientation/state | Default   | Owner                       | Stability    | Invalid-value behavior |
| ------- | ----------------------------- | -------------------------------------------------------- | ----------------------------------------- | --------- | --------------------------- | ------------ | ---------------------- |
| variant | `success`, `neutral`, `error` | filled dot, ring, minus bar                              | always                                    | `success` | `component:AvatarStatusDot` | experimental | none                   |
| tier    | small, medium, large          | 10, 20, 32 point dot for avatars up to 36, 72, and above | from the avatar; small alone              | small     | `component:AvatarStatusDot` | experimental | none                   |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                             | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------ |
| FR1 | The dot MUST take core's tier for its avatar's side: up to 36 points a 10-point dot with a 1-point border and 1-point glyph stroke; up to 72 a 20-point dot, 2-point border, 1.5-point stroke; larger a 32-point dot, 4-point border, 2-point stroke. Outside an avatar it is small.                                                                                                                                                                                                                                                                                         | core `AvatarStatusDot` size tiers | verify             |
| FR2 | `success` MUST fill with `color.success` and draw no glyph; `neutral` MUST fill with `color.backgroundSurface` and draw a ring in `color.textSecondary` on the inner field; `error` MUST fill with `color.error` and draw a round-capped bar in `color.onError` across three quarters of the inner field. Every dot has a `color.backgroundSurface` border. The plates are the strong status fills, `color.success` and `color.error`, and their ink is the matching content role, `color.onSuccess` and `color.onError`, as core's are (`architecture:theme-tokens` INV11). | core `AvatarStatusDot` styles     | verify             |
| FR3 | Both initializers MUST build the same `AvatarStatusDotProps`. Base props come through `AvatarStatusDotProps`: with `isHidden` the view draws nothing; `id` becomes the accessibility identifier.                                                                                                                                                                                                                                                                                                                                                                             | Swift component API A2, A3, A7    | verify             |

### Allowed variation

- **AV1 — Glyph drawing.** The ring and bar are SwiftUI shapes at core's stroke
  widths, not core's SVG.

### Representative states

| State                      | Required invariant                 | Allowed variation |
| -------------------------- | ---------------------------------- | ----------------- |
| each variant               | its fill, glyph, and border        | AV1               |
| each tier                  | its dot, border, and stroke        | none              |
| on a circle and a square   | placed by `component:swift/Avatar` | none              |
| light and dark, two themes | each theme's colors                | none              |

### Transformation and precedence order

- **ORD1 — Tier.** The avatar's side → small outside an avatar.

### Performance and resources

- **PR1 — Shapes only.** The dot draws SwiftUI shapes and loads nothing.

## Accessibility contract

- **AR1 — Inside an avatar.** The dot's label reaches VoiceOver through the
  avatar's name, and the dot is not a separate element (Swift accessibility
  X5).
- **AR2 — Alone.** A labeled dot outside an avatar is one image element named
  by its label; an unlabeled one is hidden (X1).
- **AR3 — Not by color alone.** Each variant has its own shape (X6, Differentiate
  Without Color).
- **AR4 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target
  exists.

## Design relationships

| Anatomy or state | Design requirement                              | Representation authority | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Dot and glyph    | Apple Human Interface Guidelines, Accessibility | prescribed by core       | supporting     | FR1, FR2           |

The component implements design requirements without copying their rationale.

Platform control: SwiftUI has no status badge control for an image, so the dot
is drawn from SwiftUI shapes (`spec:AST-093` FR2). Guideline page:
Accessibility in the Apple Human Interface Guidelines.

Theme values read: `color.success`, `color.error`, `color.onSuccess`, `color.onError`, `color.backgroundSurface`,
`color.textSecondary`.

## Family and system relationships

- `component:AvatarStatusDot` owns the variants and tiers; this record states
  only how Swift draws them.
- `component:swift/Avatar` owns the dot's placement and the composed name.

## Verification map

| Contract | Verification                                                                                                                                                                              | Representative states                                                                                   | Mutation or failure expectation                                                                        | Audit section                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| FR1      | `AvatarStatusDotTests.swift` tier test                                                                                                                                                    | 36, 48, 128 points; no avatar                                                                           | a wrong dot, border, or stroke fails                                                                   | `audit:swift/AvatarStatusDot/tier` |
| FR2      | `AvatarStatusDotTests.swift` variant render, ring sides, and the busy bar in Y2K                                                                                                          | each variant at the large tier; neutral, butter, dark; Y2K light, where on-error and the surface differ | a wrong fill, a missing ring side or glyph, a bar not in on-error, or a glyph on success fails         | `audit:swift/AvatarStatusDot/look` |
| FR3      | `AvatarStatusDotTests.swift` initializer test; `contracts.test.ts`                                                                                                                        | both initializers                                                                                       | differing props fail                                                                                   | `audit:swift/AvatarStatusDot/api`  |
| AR1, AR2 | `AvatarStatusDotTests.swift` composed-name, standalone-trait, and hidden tests; the label the dot reports to its avatar in a rendered tree is not measured (`component:swift/Avatar` AR3) | name with and without a status; a dot alone with and without a label                                    | a composed name without the status label, or a standalone dot without its label and image trait, fails | `audit:swift/AvatarStatusDot/a11y` |

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — A custom icon in the dot.** (`human-api`) Core's `icon` is free-form
  content; it reaches Swift once the contract has the shared icon-name slot.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
