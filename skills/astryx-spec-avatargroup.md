---
schema_version: 3
template_version: 7
kind: component
id: component:AvatarGroup
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-26
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/AvatarGroup/AvatarGroup.test.tsx,
    packages/core/src/AvatarGroup/AvatarGroupOverflow.test.tsx,
    packages/core/src/Avatar/Avatar.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/AvatarGroup.stories.tsx,
    apps/storybook/stories/AvatarGroupOverflow.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:internationalization,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-009, spec:AST-038]
---

# AvatarGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | A labelled group of caller-supplied Avatar children, optionally ending in one AvatarGroupOverflow, with a uniform `size` and `shape`.                          |
| Behavior                | Members overlap by a quarter of the avatar size; interactive members share one tab stop with arrow-key roving and a translated keyboard hint.                  |
| End-user impact         | Screen-reader users hear a named group; keyboard users Tab into the group once and move between interactive avatars with arrow keys.                           |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                   |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. One implementation gap is listed under Current-state impact.                        |
| Review checks           | Reject a member whose own size or shape wins inside the group, more than one tab stop over interactive members, or a keyboard hint with no interactive member. |
| Governing rules         | `architecture:public-component-api/INV5,INV6,INV7,INV8`; `architecture:component-theming-surface/INV2,INV6`; `architecture:internationalization/INV1a`.        |

This table is a review projection; the body below is authoritative.

## Intent

AvatarGroup shows several people as one compact, overlapping row. It owns the
group's name, the uniform size and shape it passes to its members, the overlap
geometry, and keyboard movement between interactive members.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  or styling output changes
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Stale hint and tab stop (FR5, AR2, AR3).** When a member becomes a link or
  button, or turns static, through its own state while the group does not
  render, the group keeps its previous hint and tab stop. New interactive
  members get no hint and are separate Tab stops until focus enters the group;
  a group left with no interactive members keeps a stale hint; and when the
  member holding the tab stop turns static, the remaining links keep
  `tabindex="-1"`, so Tab skips the group and keyboard users cannot reach them
  until it renders again.

## Ownership boundary

**Owns**

- The group root, its role and name, and its `avatar-group` target.
- Size, shape, overlap, and numeric size supplied to members through context.
- The start padding that keeps the first overlapped member inside the group.
- Roving focus over members carrying the avatar item marker, and the keyboard
  hint.

**Does not own / non-goals**

- Which avatars are visible and the hidden count — owned by the product
  callsite, which slices its list.
- Each member's rendering, name, tooltip, and in-group ring — owned by
  `component:Avatar`.
- The "+N" indicator — owned by `component:AvatarGroupOverflow`.

## Public concepts

| Concept  | Closed values or states         | Meaning                                             | Availability by variant/orientation/state | Default  | Owner                   | Stability | Invalid-value behavior           |
| -------- | ------------------------------- | --------------------------------------------------- | ----------------------------------------- | -------- | ----------------------- | --------- | -------------------------------- |
| Size     | Any `component:Avatar` size     | Applied to every member and the overflow indicator. | All groups                                | `md`     | `component:AvatarGroup` | Stable    | TypeScript rejects other values. |
| Shape    | `circle`, `rounded`, `square`   | Applied to every member and the overflow indicator. | All groups                                | `circle` | `component:AvatarGroup` | Stable    | TypeScript rejects other values. |
| Keyboard | static group; interactive group | Whether any member carries the avatar item marker.  | Read at each of the group's own renders   | static   | `component:AvatarGroup` | Stable    | —                                |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Basis                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | The root is an inline-flex, vertically centered `div` with `role="group"`, named by the caller's `aria-label` or `aria-labelledby`, else the translated "Avatars". It carries the `avatar-group` target reflecting `size` and `shape`, and renders children in order.                                                                                                                                                                                                                                                             | Current source and tests |
| FR2 | The group supplies its `size`, `shape`, numeric size, and an overlap of a quarter of the numeric size, rounded, to every Avatar and AvatarGroupOverflow below it in the same layer (`spec:AST-038` FR7, FR8; a member in a hover card, popover, or other layer keeps its own size and shape, though a marked member there stays in the FR4 roving set); a member's own size and shape never win, including when the group uses its defaults.                                                                                      | Current source and tests |
| FR3 | Every member takes the negative overlap as its inline-start margin, including the first; the group pads its inline start by the same amount so the first member stays inside it, and an empty group has no start padding. The overlap holds when members are wrapped in a HoverCard or Tooltip.                                                                                                                                                                                                                                   | Current source and tests |
| FR4 | Elements carrying `data-avatar-item` — link and button avatars and a clickable overflow indicator — form one horizontal roving set with a single tab stop: arrow keys move between them following the rendered direction and wrap at the ends, and Home and End jump to the first and last. Other focusable content in a member, such as a button in a status slot, is not in the set.                                                                                                                                            | Current source and tests |
| FR5 | The hint and tab stop follow whether any member carries the item marker as read at the group's own last render: while one does, a visually hidden translated hint ("Use arrow keys to move between avatars") renders inside the group and is appended to `aria-describedby` after any caller value; a purely static group has no tab stop and no hint. Implementation gap: a member that gains or loses the marker through its own state, without the group rendering, leaves the hint and tab stop stale (Current-state impact). | Current source and tests |
| FR6 | `ref` reaches the root. Supported DOM, ARIA, data, and event props reach the root; the component's role, name, description, and `data-testid` apply after them; caller `onKeyDown` and `onFocus` run before the roving handlers, and one that calls `preventDefault()` skips the roving handler for that event (`architecture:public-component-api` INV7); `xstyle`, `className`, and `style` merge in that order after component styles.                                                                                         | Current source and tests |

### Allowed variation

- **AV1 — Theme paint.** A theme may restyle `avatar-group` per `size` and
  `shape` without changing membership, overlap ownership, or focus behavior.
- **AV2 — Membership.** The number and kind of members vary per callsite.

### Representative states

| State                | Required invariant                                                         | Allowed variation |
| -------------------- | -------------------------------------------------------------------------- | ----------------- |
| Static group         | Named group; no tab stop; no hint.                                         | Members.          |
| Interactive group    | One member has `tabIndex={0}`, the rest `-1`; arrows rove; hint described. | Members.          |
| With overflow button | The overflow indicator is the last roving item.                            | Count.            |
| Empty group          | Renders with no start padding.                                             | —                 |
| Right-to-left        | Overlap and arrow movement follow the rendered direction.                  | —                 |

### Transformation and precedence order

- **ORD1 — Member size and shape.** Group value → member's own prop (ignored
  inside a group).
- **ORD2 — Description.** Caller `aria-describedby` → keyboard hint id.
- **ORD3 — Key and focus handling.** Caller `onKeyDown` or `onFocus` → roving
  handler; a caller handler that calls `preventDefault()` skips the roving
  handler for that event.

### Performance and resources

- **PR1 — Member detection.** Detecting interactive members adds no observer or
  listener; the group re-reads its members after each of its own renders, and a change in
  whether any member is interactive re-renders the group before paint.

## Accessibility contract

- **AR1 — Named group.** The root is `role="group"` with a translated default
  name the caller can replace.
- **AR2 — One tab stop.** Interactive members share a single tab stop and are
  reached with arrow keys, Home, and End, in visual order in both directions,
  as read at the group's own last render (FR5 gap for member-local changes).
- **AR3 — Keyboard hint.** The hint describes the group only while roving
  applies, as read at the group's own last render (FR5 gap for member-local
  changes).
- **AR4 — Static members.** Static avatars are not roving items and have no tab
  stop inside a group; `component:Avatar` records the effect on their tooltips.

## Design relationships

| Anatomy or state   | Design requirement                              | Representation authority | Hierarchy role | Component contract |
| ------------------ | ----------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Avatar children    | Uniformly sized members overlapping in one row. | Current source and docs  | Prominent      | FR1–FR3            |
| Overflow indicator | An optional "+N" member at the end of the row.  | Current source and docs  | Supporting     | FR2, FR4           |

Theming: the root is the `avatar-group` target. Members keep their own targets;
the overflow indicator's `avatar-group-overflow` target belongs to
`component:AvatarGroupOverflow`. The consumer anatomy names no root part, so no
anatomy-theming block is declared.

## Family and system relationships

- `component:Avatar` reads the group context and applies the ring, overlap, and
  item marker on its own root.
- `component:AvatarGroupOverflow` reads the same context and joins the roving
  set when clickable.
- `architecture:internationalization` owns the catalog behind the group name
  and hint.

## Verification map

| Contract       | Verification                                                                                                                                     | Representative states                                             | Mutation or failure expectation                                                                                                                                                                                                                 | Audit section                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| FR1, AR1       | `AvatarGroup.test.tsx` render, label, size-reflection, test-id, and empty-group tests                                                            | Default and custom `aria-label`; sizes; empty                     | A missing `group` role, default or custom name, `data-size` reflection, or child fails. Gap: no test asserts the inline-flex centering, `data-shape`, child order, a caller `aria-labelledby`, or a caller `role` being replaced.               | `audit:AvatarGroup/a11y`     |
| FR2, ORD1      | `AvatarGroup.test.tsx` size-cascade and overlap suites; `Avatar.test.tsx` group shape tests; `AvatarGroupOverflow.test.tsx` size and shape tests | Group size and shape, defaults, outside a group; `md` overlap     | A member's own size or shape winning inside the group, or a wrong `md` overlap value, fails. Gap: no test asserts the overlap value for sizes other than `md`, or that a member in another layer keeps its own size and shape.                  | `audit:AvatarGroup/behavior` |
| FR3            | `AvatarGroup.test.tsx` overlap suite                                                                                                             | Plain and wrapped members, overflow indicator, empty group        | A missing member margin, a missing start padding, or start padding on an empty group fails.                                                                                                                                                     | `audit:AvatarGroup/layout`   |
| FR3 (layout)   | `AvatarGroup.stories.tsx` sizes; `AvatarGroupOverflow.stories.tsx` AllShapes                                                                     | Sizes and shapes, LTR and RTL                                     | Gap: no automated check; a clipped first member or an unmirrored overlap is visible only in the rendered fixtures.                                                                                                                              | `audit:AvatarGroup/layout`   |
| FR4, AR2, AR4  | `AvatarGroup.test.tsx` roving-focus suite                                                                                                        | Interactive avatars, overflow button, status button, static group | More than one tab stop, lost ArrowRight/ArrowLeft movement, a missing overflow item, a status button in the set, or a tab stop on a static group fails. Gap: wrapping, Home and End, and right-to-left arrow direction have no automated check. | `audit:AvatarGroup/a11y`     |
| FR5, AR3, ORD2 | `AvatarGroup.test.tsx` hint tests                                                                                                                | Interactive and static groups                                     | A missing hint on an interactive group, or a hint on a static one, fails. Gap: no test covers the hint's order after a caller `aria-describedby` or a member changing interactivity through its own state.                                      | `audit:AvatarGroup/a11y`     |
| FR6, ORD3      | `AvatarGroup.test.tsx` test-id test                                                                                                              | Caller `data-testid`                                              | A lost test id fails. Gap: no test covers the ref, DOM passthrough, attribute order, caller handler order and cancellation, or the styling-input merge.                                                                                         | `audit:AvatarGroup/api`      |
| PR1            | Source review                                                                                                                                    | Interactive and static groups                                     | Gap: no automated check fails if member detection adds an observer or listener.                                                                                                                                                                 | `audit:AvatarGroup/behavior` |
| AR1, AR3       | Accessibility-tree evidence (`spec:AST-009` FR3)                                                                                                 | Static and interactive groups                                     | Gap: no accessibility-tree check proves the group role, name, or description; the unit tests query the DOM.                                                                                                                                     | `audit:AvatarGroup/a11y`     |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/AvatarGroup/AvatarGroupOverflow.spec.md -->


# AvatarGroupOverflow component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | An overflow indicator with a required `count`, optional `onClick`, and optional custom `children` that replace the visible "+N".                                                    |
| Behavior                | Without `onClick` it is a named image; with `onClick` it is a native button in the group's roving set. Its name is the translated count unless a caller `aria-labelledby` names it. |
| End-user impact         | Screen-reader users hear how many people are hidden ("5 more"); keyboard users reach a clickable indicator as the last item in the group.                                           |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                                        |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. Two implementation gaps are listed under Current-state impact.                                           |
| Review checks           | Reject a negative displayed count, a name taken from custom children, a static indicator in the roving set, or an indicator that ignores the group's size or shape.                 |
| Governing rules         | `architecture:public-component-api/INV5,INV6,INV8`; `architecture:component-theming-surface/INV2,INV6`; `architecture:internationalization/INV1a`.                                  |

This table is a review projection; the body below is authoritative.

## Intent

AvatarGroupOverflow tells the reader how many members an AvatarGroup does not
show, and optionally lets them open the rest. It owns the indicator's count
label, its static and button forms, and its geometry within the group.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  accessibility, target, or styling output changes
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Default count outside the catalog (FR2).** The visible "+N" is assembled
  from the raw number, so it is never locale-formatted: the chip shows "+4912"
  where the name reads "4,912 more", and under a locale with its own digits the
  digits differ as well (`architecture:internationalization` INV1a).
- **Overflow button target (AR4).** In a 16px group the clickable indicator is
  20px tall, below the 24 by 24 CSS pixels of WCAG 2.2 2.5.8.

## Ownership boundary

**Owns**

- The indicator element and its `avatar-group-overflow` target.
- The default visible "+N" content and the translated count name.
- The static image and native button forms.
- The medium, circle, no-overlap presentation used outside an AvatarGroup.

**Does not own / non-goals**

- Choosing visible avatars and computing the hidden count — owned by the
  product callsite.
- Avatar rendering and theming — owned by `component:Avatar`.
- The group's name, context, member order, and roving-focus algorithm — owned
  by `component:AvatarGroup`; a clickable indicator joins through the item
  marker.
- Caller-supplied children beyond placing them in the indicator.

## Public concepts

| Concept         | Closed values or states         | Meaning                                                                         | Availability by variant/orientation/state | Default                  | Owner                           | Stability | Invalid-value behavior                       |
| --------------- | ------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ | ------------------------------- | --------- | -------------------------------------------- |
| Count           | A number supplied by the caller | Drives the translated name and the default "+N".                                | Both forms; inside or outside a group     | Required                 | `component:AvatarGroupOverflow` | Stable    | A negative count is shown and named as zero. |
| Display content | default "+N"; caller children   | The visible content; the name stays count-derived.                              | Both forms                                | "+N"                     | `component:AvatarGroupOverflow` | Stable    | —                                            |
| Activation      | static; clickable               | `onClick` selects the button form and is called on activation.                  | Both inside and outside a group           | static                   | `component:AvatarGroupOverflow` | Stable    | —                                            |
| Presentation    | group-supplied; standalone      | Size, shape, and overlap from AvatarGroup, else medium, circle, and no overlap. | All sizes and shapes; both directions     | standalone medium circle | `component:AvatarGroupOverflow` | Stable    | —                                            |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Basis                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| FR1 | Without `onClick` the indicator is a `span` with `role="img"`, which a caller `role` replaces. With `onClick` it is a native `button type="button"` that calls `onClick` on activation and draws the shared focus-visible outline and the shared hover and pressed overlays.                                                                                                                                                                                                                                                                                                                                                               | Current source and tests             |
| FR2 | A negative `count` is clamped to zero before both the name and the default content are produced. The name is the translated "{count} more" in both forms and replaces a caller `aria-label`, while a caller `aria-labelledby` reaches the root and names it instead; caller children replace only the visible "+N". Runtime counts are formatted through the catalog (`architecture:internationalization` INV1a). Implementation gap: the default "+N" is assembled outside the catalog, so the visible count is never locale-formatted: grouping separators, and in some locales the digits, differ from the name (Current-state impact). | Current source and tests             |
| FR3 | Inside an AvatarGroup in the same layer (`spec:AST-038` FR7, FR8) the indicator uses the group's size, shape, numeric size, and overlap; outside one, including in a layer opened from a group, it uses `md`, `circle`, and no overlap.                                                                                                                                                                                                                                                                                                                                                                                                    | Current source and tests             |
| FR4 | The indicator is at least the avatar size plus a 2px surface-colored border on each side wide, exactly that tall, grows inline for wider content with `--spacing-2` inline padding, and takes the group's negative inline-start overlap. It paints the neutral color over the surface with secondary text, body family, medium weight, and a font size of the larger of `--text-supporting-size` and 35% of the avatar size. Its radius follows the shape.                                                                                                                                                                                 | Current source, tests, and stories   |
| FR5 | The root carries the `avatar-group-overflow` target reflecting `size` and `shape`. Supported DOM, ARIA, data, and event props and `ref` reach the root; `xstyle`, `className`, and `style` merge in that order after component styles.                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests             |
| FR6 | The button form carries the `data-avatar-item` marker, so AvatarGroup includes it in its roving set; the static form carries no marker, and a caller `tabIndex` on it is forwarded without adding it to that set.                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and AvatarGroup tests |

### Allowed variation

- **AV1 — Count and content.** The count and caller content vary; wider content
  grows the indicator inline.
- **AV2 — Theme paint.** A theme may restyle `avatar-group-overflow` per `size`
  and `shape` without moving the target.

### Representative states

| State                 | Required invariant                                                       | Allowed variation   |
| --------------------- | ------------------------------------------------------------------------ | ------------------- |
| Static count          | `role="img"` span named "{count} more", showing "+N"; not a roving item. | Count, size, shape. |
| Static custom content | Count-derived name; caller content visible.                              | Content.            |
| Clickable             | Button named "{count} more"; last roving item when grouped.              | Count, content.     |
| Negative count        | Named and shown as zero.                                                 | Caller content.     |
| Wide count            | Grows inline at the resolved height.                                     | Width.              |
| Standalone            | `md` circle with no overlap.                                             | Count, activation.  |
| Right-to-left         | Overlap and order follow the document direction.                         | —                   |

### Transformation and precedence order

- **ORD1 — Presentation.** AvatarGroup context → `md`, `circle`, no overlap.
- **ORD2 — Content.** Clamp `count` at zero → translated name; caller children
  → else "+N".
- **ORD3 — Root attributes.** Static: `role="img"` → caller props → name →
  component class and styles. Button: `type` and `onClick` → caller props →
  name and item marker → press markers → component class and styles.

### Performance and resources

- **PR1 — No local resources.** The indicator holds no state, listener,
  observer, or timer of its own. Both forms install the shared document-level
  press controller on mount; only the button carries its press marker.

## Accessibility contract

- **AR1 — Count name.** Both forms are named by the translated count, never by
  custom children; a caller `aria-labelledby` reaches the root and names either
  form instead, while a caller `aria-label` is replaced.
- **AR2 — Roles.** The static form is an image unless the caller supplies a
  role; the clickable form is a native button with the shared focus-visible
  outline.
- **AR3 — Group participation.** Only the clickable form joins AvatarGroup's
  roving set.
- **AR4 — Target size.** A clickable indicator's target is at least 24 by 24
  CSS pixels or has the spacing WCAG 2.2 2.5.8 allows. From `xsm` up the
  button is at least 24 by 24 and paints above the avatar it overlaps.
  Implementation gap: in a group sized 16px the button is 20px tall.

## Design relationships

| Anatomy or state | Design requirement                                               | Representation authority            | Hierarchy role    | Component contract |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------- | ----------------- | ------------------ |
| Count label      | Compact supporting count on a neutral chip matching the avatars. | Current source and docs             | Supporting        | FR2, FR4, AR1      |
| Button behavior  | Native button with shared overlay and focus-visible treatments.  | Current source and shared utilities | Supporting action | FR1, FR6, AR2, AR3 |

Theming: the root is the `avatar-group-overflow` target; the count label
inherits it. The consumer anatomy names no root part, so no anatomy-theming
block is declared.

## Family and system relationships

- `component:AvatarGroup` supplies size, shape, and overlap and owns the roving
  set the clickable form joins.
- `architecture:component-theming-surface` owns target qualification and
  reflection.
- `architecture:public-component-api` owns passthrough, styling composition, and
  ref rules.
- `spec:AST-002` owns admission of any change to this public surface.

## Verification map

| Contract       | Verification                                                                                   | Representative states                            | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                    | Audit section                             |
| -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| FR1, AR2       | `AvatarGroupOverflow.test.tsx` render, role, and callback tests                                | Static, caller role, clickable                   | A wrong element, a lost `img` role or caller role, a missing button, or a lost callback fails. Gap: the button's `type="button"`, its focus outline and hover and pressed overlays have no automated check.                                                                                                                                                        | `audit:AvatarGroupOverflow/behavior`      |
| FR2, AR1, ORD2 | `AvatarGroupOverflow.test.tsx` count, content, and locale tests                                | Zero, negative, large, custom content, localized | A negative count, a wrong default "+N" or name, missing custom content, or an untranslated name fails. Gap: no test asserts the name with custom children, a caller `aria-label` being replaced, a caller `aria-labelledby`, or a locale with its own digits; the large-count test asserts the unformatted "+4912" beside "4,912 more", which is the recorded gap. | `audit:AvatarGroupOverflow/behavior`      |
| FR3, ORD1      | `AvatarGroupOverflow.test.tsx` size and shape tests                                            | Grouped; standalone                              | Lost group size or shape fails. Gap: no test asserts the standalone `md`, `circle`, and no-overlap fallback, or the layer clause.                                                                                                                                                                                                                                  | `audit:AvatarGroupOverflow/layout`        |
| FR4            | `AvatarGroup.test.tsx` overlap test; `AvatarGroupOverflow.stories.tsx`                         | Grouped, wide count, every shape                 | A lost overlap margin fails. Gap: the box size, border, inline growth and padding, paint, font-size floor, and radius are visible only in the rendered fixture.                                                                                                                                                                                                    | `audit:AvatarGroupOverflow/layout`        |
| FR5, ORD3      | `themingTargets.test.ts`; `AvatarGroupOverflow.test.tsx` ref, className, and caller-role tests | Both forms                                       | Target drift, a lost ref, a dropped `className`, or caller props that stop reaching the static form or land before its `role="img"` fail. Gap: no test covers `xstyle`, `style`, the button form's passthrough, or the rest of ORD3's order.                                                                                                                       | `audit:AvatarGroupOverflow/theming`       |
| FR6, AR3       | `AvatarGroup.test.tsx` overflow roving test                                                    | Button after an interactive avatar               | A button missing from the roving set fails. Gap: no test asserts that the static form carries no marker or that a caller `tabIndex` on it is forwarded.                                                                                                                                                                                                            | `audit:AvatarGroupOverflow/accessibility` |
| Right-to-left  | `apps/storybook/rtl-audit/targets.json` entry                                                  | Grouped overflow in both directions              | Gap: the audit lists the fixture, but no automated check fails on an unmirrored avatar-to-overflow order.                                                                                                                                                                                                                                                          | `audit:AvatarGroupOverflow/i18n-rtl`      |
| PR1            | Source review                                                                                  | Both forms                                       | Gap: no automated check fails if the indicator adds state, a listener, an observer, or a timer of its own.                                                                                                                                                                                                                                                         | `audit:AvatarGroupOverflow/behavior`      |
| AR1, AR2       | Accessibility-tree evidence (`spec:AST-009` FR3)                                               | Static and clickable forms                       | Gap: no accessibility-tree check proves the image or button role and the count name; the unit tests query the DOM.                                                                                                                                                                                                                                                 | `audit:AvatarGroupOverflow/accessibility` |
| AR4            | `AvatarGroupOverflow.stories.tsx` in a browser                                                 | Clickable indicator in a group                   | Gap: no automated target-size check; the 16px group is the recorded gap.                                                                                                                                                                                                                                                                                           | `audit:AvatarGroupOverflow/accessibility` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
