---
schema_version: 3
template_version: 5
kind: component
id: component:List
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-21
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming]
verified_by:
  [
    packages/core/src/List/List.test.tsx,
    packages/core/src/Item/Item.test.tsx,
    packages/core/src/List/ListItem.hitArea.test.tsx,
    packages/core/src/List/__tests__/ListTouchHitArea.interaction.browser.spec.ts,
    packages/core/src/List/__tests__/ListDividers.interaction.browser.spec.ts,
    packages/core/src/List/listLayoutUpdates.test.tsx,
    packages/core/src/List/__tests__/ListUpdates.interaction.browser.spec.ts,
    packages/core/src/List/__tests__/ListReorder.test.tsx,
    packages/core/src/List/__tests__/ListReorderLayout.test.tsx,
    packages/core/src/List/__tests__/ListReorderTouch.interaction.browser.spec.ts,
    packages/core/src/List/__tests__/ListReorderPointer.interaction.browser.spec.ts,
    packages/core/src/List/__tests__/ListReorderMode.interaction.browser.spec.ts,
    packages/core/src/List/__tests__/reorderModel.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    packages/core/src/theme/generateThemeRules.test.ts,
    apps/storybook/stories/List.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [architecture:container-padding, architecture:public-component-api]
contributing: [contributing:api-conventions]
system_specs:
  [
    spec:AST-107,
    spec:AST-002/DEC-1,
    spec:AST-002/DEC-2,
    spec:AST-017/FR4,
    spec:AST-057/FR9,
    spec:AST-061/FR11,
    spec:AST-094,
    spec:AST-103,
    spec:AST-105,
  ]
---

# List component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | Optional `edge?: 'padded' \| 'flush' \| 'outset' \| 'bleed'`, default `'padded'`. Deprecated `edgeCompensation?: 'inline'` resolves to `'outset'`. Optional `reorderable` takes the object `createReorderable` returns, and ListItem's `itemKey` identifies each row (`spec:AST-103`). Optional `animatedLayout` takes the handle `useAnimatedLayout` returns (`spec:AST-105`).                                                                                                                                                |
| Behavior                | One edge treatment applies to every ListItem row and decides where row content and row paint sit relative to the list's edges and the host's padding. With `reorderable`, rows reorder by dragging a handle or through reorder mode (`spec:AST-103` FR3, FR4). Under a coarse pointer a row's press follows the cell profile (`spec:AST-094` FR11); with `animatedLayout`, row updates animate (`spec:AST-105`). A row menu opens from the row's own `<li>` on the context request (FR13).                                     |
| End-user impact         | Row text can share the line of the list header and a heading above, with row paint stopping at the text, reaching into the host padding, or reaching the host edges. Touch users get a 44 px row target (FR10) and the cell press (FR11), and every pointer keeps a highlighted row's dividers visible (FR11); with `animatedLayout`, row updates animate for every pointer (FR12). A row with a menu opens it by a long press, a right click, or Shift+F10, or through its More actions button (FR13).                        |
| Builder impact          | One `edge` choice per list. `flush` works anywhere; `outset` and `bleed` act only inside a host that publishes container padding. Passing an `animatedLayout` handle is one new choice, and a row menu is the other: the caller passes a ListItem's ref to `useContextMenu` (FR13), and who draws a plain row's More actions button is open (OQ2); and rows animate only with an `itemKey`; the touch target and press need none.                                                                                              |
| Compatibility/readiness | Additive; omission keeps current geometry; `edgeCompensation` keeps working with a codemod to `edge`. `reorderable` is stable and built, but for its `labels` and `positions`. `itemKey` and `animatedLayout`'s row updates (FR12) are implemented; its start and end content motion is not. The touch target (FR10) and the press's compositor release (FR11) are implemented under coarse primary pointers. Neither changes anything under a fine pointer. Row menus (FR13) are additive and specified, not implemented yet. |
| Review checks           | Reject header movement, row paint past the host's padding edge, duplicated padding values, physical-edge logic, automatic opt-in, a ListItem-level edge prop, or a second prop that can contradict `edge`.                                                                                                                                                                                                                                                                                                                     |
| Governing rules         | `architecture:container-padding/INV3`, `INV9–INV11`; `spec:AST-002/DEC-1–DEC-2`; `spec:AST-017/FR4`; `spec:AST-057/FR9`. `spec:AST-103`. `spec:AST-094` FR4, FR5, FR11, FR13; `spec:AST-105` FR1–FR5, FR8. `spec:AST-107` FR8 (row menus).                                                                                                                                                                                                                                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

Every ListItem keeps Item's inline inset so hover, press, and selection paint has
room around row content. That inset leaves row text off the line of the List
header, a heading above the list, and the host container's padding. How a
collection resolves that depends on its rows and its host: static rows need no
room around paint, interactive rows do, and a list inside a padded container can
reach into that padding. The caller knows which applies; List cannot derive it
from its rows, and the choice must hold for the whole collection.

## Compatibility and migration

- Released default preserved: `yes`; omission keeps current List and ListItem geometry.
- Compatibility class: additive optional prop; `edgeCompensation` is a deprecated
  alias with the same meaning as `edge="outset"`. Its `@deprecated` type reports
  plain use; development warns only when both props are set, naming
  `astryx upgrade` (`spec:AST-017` FR29–FR29b).
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: `component:List/DEC-3`; an `astryx upgrade` codemod renames
  static `edgeCompensation="inline"` to `edge="outset"`, removes
  `edgeCompensation` beside an `edge` string that no later spread can override,
  and keeps the old prop with a TODO where `edge` is computed, on a dynamic value,
  and where the List also spreads props (`spec:AST-017` FR29c–FR29d). A spread onto a
  List that never writes `edgeCompensation` stays unchanged (`spec:AST-040` FR1);
  the `@deprecated` type reports a typed use where the props are written.
- Current state: Under a finger, a caller's `::after` on an interactive ListItem
  row is replaced by the touch hit area.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The collection-wide `edge` treatment and its application to every ListItem row.
- The deprecated `edgeCompensation` alias and its resolution.
- Keeping the optional header in place for every treatment.
- The relationship between row geometry and Item's density- and theme-aware
  inline inset.
- Its rows' 44 px touch target under a coarse pointer (FR10).
- Its rows' press paint under a coarse pointer, and a highlighted row's
  dividers for every pointer (FR11).
- Its rows' update motion with an `animatedLayout` handle: entering, exiting,
  and crossing (FR12).
- Its rows' menus attaching to the row's own `<li>` (FR13); the More actions
  button, focus return, and a plain row's press paint are open (OQ2).

**Does not own / non-goals**

- Container padding values, nesting, or overlay resets — owned by
  `architecture:container-padding`.
- A ListItem-level edge prop, per-edge or arbitrary inset values, automatic host
  detection, or block-axis bleed.
- TabList or Button projections.

## Public concepts

| Concept                        | Closed values or states              | Meaning                                                                                                                                          | Availability by variant/orientation/state                                                | Default  | Owner            | Stability  | Invalid-value behavior                       |
| ------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------- | ---------------- | ---------- | -------------------------------------------- |
| Edge treatment                 | `padded`, `flush`, `outset`, `bleed` | Where row content and row paint sit relative to the list's edges and the host's padding                                                          | Every density, marker style, and divider setting; `outset` and `bleed` read host padding | `padded` | `component:List` | accepted   | Other values are rejected by the public type |
| Edge compensation (deprecated) | omitted, `inline`                    | Same as `edge="outset"`                                                                                                                          | As `outset`                                                                              | omitted  | `component:List` | deprecated | Other values are rejected by the public type |
| Animated layout                | absent, a `useAnimatedLayout` handle | Inserted, removed, and moved rows animate, and the rows after a change glide to their new places (FR12)                                          | Every density, marker style, edge treatment, and divider setting                         | absent   | `spec:AST-105`   | accepted   | Other values are rejected by the public type |
| Reordering                     | absent, a `createReorderable` object | Rows can be reordered by handle, keyboard, and assistive technology; `onReorder` receives the moved row's key and its new index (`spec:AST-103`) | Every density, marker style, edge treatment, and divider setting                         | absent   | `spec:AST-103`   | accepted   | Other values are rejected by the public type |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Basis                                                                                                                             | Status                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| FR1  | List MUST own `edge` and apply one treatment to every ListItem row, interactive or not; ListItem MUST NOT expose a parallel public prop. A defined `edge` MUST win over `edgeCompensation`, and `edgeCompensation="inline"` with `edge` undefined MUST resolve to `outset`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `component:List/DEC-1`, `component:List/DEC-3`                                                                                    | Accepted contract                                     |
| FR2  | `padded` MUST preserve current header, list, and row geometry, apart from FR10's hit target under a coarse pointer. No treatment MAY move the header or change row block padding, gap, markers, start and end content, semantics, or hit target relative to the row box.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Owner direction                                                                                                                   | Accepted contract                                     |
| FR3  | `flush` MUST resolve each row's inline inset to zero through the private source that supplies Item's applied inline padding, so row content and row paint share the list's inline edges. It reads no host padding. A theme override of row inline padding takes precedence over the zero (FR7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `component:List/DEC-3`                                                                                                            | Accepted contract                                     |
| FR4  | `outset` MUST place each row so it reaches past the host content line by the smaller of its own inline inset and the matching host inset, per logical edge, keeping its inset inside. Content reaches the host line when the host inset is at least the row inset.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `architecture:container-padding/INV9–INV10`; `component:List/DEC-2`                                                               | Accepted contract                                     |
| FR5  | `bleed` MUST place each row so it reaches the host's padding edge on each logical edge, with square corners, except that, when the list is a rounded host's first or last child, its first or last row takes that host's corner less the host block padding it keeps (`architecture:container-padding` Corner geometry). Row content sits on the host content line, or at the row's own inset from its edge when the host inset is smaller. A theme override of row inline padding sets the content's inset instead (FR7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `architecture:container-padding/INV3`; `component:List/DEC-4`                                                                     | Accepted contract                                     |
| FR6  | Missing or reset host inset MUST resolve to zero, so `outset` and `bleed` place content as `padded` does outside a padded host. No row paint MAY reach past the host's padding edge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `architecture:container-padding/INV6`, `INV9`                                                                                     | Accepted contract                                     |
| FR7  | Each row's retained inset MUST come from the same private density- and theme-derived source as Item's applied inline padding. A theme `item.paddingInline` override takes precedence over every treatment's row padding, as it does over density. A consumer override of row padding through `xstyle`, `className`, or `style` is outside the alignment guarantee.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Shared two-owner geometry contract                                                                                                | Accepted contract                                     |
| FR8  | `outset` and `bleed` are valid only under a host state whose published inline inset matches its applied padding: a visually neutral host, such as a Layout region with explicit padding or a padded ScrollableArea, or the content area of a Card, Section (any variant), Dialog, or BottomSheet. Those hosts bound their padding with a border, background, or clip; FR6 keeps row paint inside the padding edge, so it never covers the border or changes the host's outline. Automatic LayoutContent/LayoutPanel states with a known publication mismatch are not eligible until that gap is fixed, and Drawer's content area is not admitted until it has its own evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `architecture:container-padding/INV8–INV11`; real-browser evidence in each admitted host                                          | Accepted contract                                     |
| FR9  | The list element containing the rows MUST clip in the inline axis with `overflow-inline: clip`, never `hidden`, except for static Markdown document lists that expose no swipe actions (DEC-5). Those Markdown lists, ordered or unordered, MAY use visible inline overflow so their own or descendant number markers remain whole while retaining AST-061 FR11's text starts and nested insets. General Lists and any collection with swipe-capable rows MUST retain the clip. Under `outset` and `bleed` its inline edges MUST reach the host's padding edge, so the clip never cuts resting row paint and a swiped row paints no further than that edge.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `spec:AST-057/FR9`; `component:List/DEC-5`; `spec:AST-061/FR11`                                                                   | Verified by `List.test.tsx` and real-browser geometry |
| FR10 | Under a coarse primary pointer (`spec:AST-094` FR13), every ListItem row MUST offer a hit target at least 44 px tall, through its padding or an invisible hit area, with no visual change, where its neighbors leave room: the hit area never overlaps a neighboring row's or control's target, and between close neighbors it is clamped to half the gap; row height and geometry stay as they are at every density. A fine pointer keeps today's hit target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Owner decision, 2026-10-26: no row-height change, a 44 px touch target                                                            | Accepted contract                                     |
| FR11 | Under a coarse primary pointer, an interactive row's press MUST follow the cell profile (`spec:AST-094` FR11): it paints the `--color-overlay-pressed` token above the row's background and below its content without adding an element, and its release fades on the theme's exit motion tokens (`--duration-exit`, `--ease-exit`) on the compositor (`spec:AST-094` FR5). A highlighted row (hovered, or pressed by any pointer) keeps both dividers visible in `--color-border` through its translucent tint; no divider hides or changes color for highlight (Owner decision, Nov 6 2026 (Cindy)). At rest the row's paint and stacking are as they were. Under the touch presentation, an interactive Item, ListItem or TreeList row uses its `::before` as the press layer, and a pressed row's divider keeps its resting colour. A caller's own `::before` on such a row merges into the press layer only while it is pressed; use `::after` or a child for decoration. An interactive ListItem row also uses its `::after` as its touch hit area (FR10), so decorate such a row with a child.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `spec:AST-094` FR5, FR11; `component:List/DEC-6`                                                                                  | Accepted contract                                     |
| FR12 | List MUST take an `animatedLayout` handle (`spec:AST-105` FR1) and report each row inserted, removed, or moved between renders. With a handle, an inserted row enters, a removed row collapses in place, inert and hidden from assistive technology until it is gone, and a row crossing rows moving the other way rides above them on the list's surface, while the rows after a change glide to their new places (`spec:AST-105` FR3), all starting on one frame on the shared motion role (`spec:AST-105` FR4). Without a handle the list changes at once (`spec:AST-105` FR2). A row's identity is its `itemKey` (`spec:AST-103` DEC-4); a row without one changes at once. With a handle, a row also reports a change to its start or end content: content that appears enters, content that leaves exits (a slot that sets the row's height hides at once instead, and the row's other content and the rows after it take their final places at once, as `spec:AST-105`'s Coverage states), content replaced in the same slot swaps in place (`spec:AST-105` FR4, FR8), and the row's other content glides within the row; a slot whose content changes without changing size does not animate. The reorder handle's appearance (`spec:AST-103`) is such a change. A slot control that leaves is inert and hidden from assistive technology as its exit starts; if it held focus, focus moves to the row's focus target (or to the row, which takes focus programmatically for the handoff) without scrolling.                                                                                  | `spec:AST-105` FR1–FR5; `spec:AST-103` DEC-4; `spec:AST-105` FR8; `spec:AST-103` FR2 (the handle renders only with `reorderable`) | Accepted contract                                     |
| FR13 | A row menu on a ListItem attaches to the row's own `<li>`, keeping `ul > li` with no wrapper element: the caller passes the ListItem's ref to `useContextMenu` (`spec:AST-107` FR8), with no ListItem prop of its own; the whole row is its hit area, it opens on the context request (a long press, a right click, or Shift+F10), under a finger, the row takes the press paint (FR11; on a plain row, part of OQ2) and lifts as the menu grows from it, `useContextMenu` lifting the element it is attached to (`spec:AST-094` FR31, FR33), while a mouse, the keyboard, and `presentation: 'popover'` open the released menu without the lift (`spec:AST-094` FR41), and focus returns to the row's focus target when the menu closes. A row that is already focusable (`onClick` or `href`) takes Shift+F10 and the context-menu key directly, and a row with an `interactiveRef` takes them on that element; neither shows a "More actions" button; a row with none of these shows a visible "More actions" button named with the row's label, such as "More actions for Inbox", its keyboard and screen-reader path to the menu. When a menu opens, focus moves into it; when it closes, focus returns to the row's focus target, or to the "More actions" button on a row that shows one. Who moves focus there, since `useContextMenu` returns focus to the `<li>`, which takes none, is part of OQ2. A reorderable row always has its handle (`spec:AST-103` FR3), so when it also has a row menu, a hold on the handle picks the row up and a hold anywhere else on the row opens the menu. | Owner decision, 2026-10-26; `spec:AST-107` FR8                                                                                    | Accepted contract                                     |

### Allowed variation

- Density and `item.paddingInline` theme overrides may change the retained inset;
  every treatment follows the same derived value. A theme override of row inline
  padding takes precedence over every treatment, as it does over density.
- Host padding may be uniform, asymmetric, zero, or absent; each logical edge
  resolves independently.
- Labels, descriptions, markers, start/end content, interactivity, and selection
  may vary without changing the collection-wide treatment.
- Static Markdown document lists MAY omit inline clipping under DEC-5, including
  unordered ancestors of numbered lists. The exception does not apply to general
  Lists or to a list whose rows expose swipe actions.
- Under a coarse primary pointer, a row's hit target grows toward 44 px where
  its neighbors leave room (FR10); row geometry and appearance are unchanged.

### Representative states

| State                                                  | Required invariant                                                                     | Allowed variation                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------- |
| `padded` (default)                                     | Header and every row keep current geometry.                                            | Any content, density, or host.      |
| `flush`                                                | Row content and paint share the list's inline edges with the header and divider ends.  | Any host, including none.           |
| `outset`, host inset at least row inset                | Row content reaches the host content line; row paint reaches past it by the row inset. | Uniform or asymmetric host padding. |
| `bleed`, host inset at least row inset                 | Row paint reaches the host's padding edge; row content sits on the host content line.  | Uniform or asymmetric host padding. |
| `outset` or `bleed`, host inset smaller than row inset | Row paint stops at the host's padding edge; content keeps the row inset.               | Either logical edge independently.  |
| `outset` or `bleed`, no host inset                     | Content placed as `padded`; `bleed` rows are square.                                   | Standalone lists and overlays.      |
| LTR or RTL                                             | Logical start/end mapping follows direction.                                           | Writing direction.                  |
| `animatedLayout`, rows change                          | Staying rows move to their new places; a removed row collapses; new rows fade in.      | Reduced motion: the role's policy.  |

### Transformation and precedence order

- **ORD1 — Treatment.** Resolve `edge`, else `outset` for `edgeCompensation="inline"`,
  else `padded`.
- **ORD2 — Host bound.** Read the matching published host inset for each logical
  edge, with missing values falling back to zero.
- **ORD3 — Local inset.** Resolve Item's inline inset through the private value
  that supplies applied padding: density sets it, `flush` replaces it with zero,
  and a theme `item.paddingInline` override replaces either.
- **ORD4 — Placement.** Apply the treatment's geometry from those values; then
  compose supported consumer styles without claiming alignment for a consumer
  override of row inline padding.

### Performance and resources

- **PR1 — CSS geometry only.** Every treatment MUST add no measurement, observer,
  listener, state, Effect, or render pass. Deprecation warnings are dev-only.
- **PR2 — Motion only where it applies.** FR11 adds no listener, observer,
  measurement, or animation under a fine pointer, and FR12 measures rows only
  with a handle. Every motion runs on transform and opacity.

## Accessibility contract

- **AR1 — Interaction geometry remains local.** No treatment MAY change the
  interactive element, accessible role/name/state, focus target, or tab order.
- **AR2 — Direction remains logical.** Each treatment MUST produce the mirrored
  geometry under RTL without changing DOM order.

## Design relationships

| Anatomy or state   | Design requirement                                                                                                                                                                      | Representation authority | Hierarchy role     | Component contract |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------ | ------------------ |
| Optional header    | Stays on the host content line for every treatment.                                                                                                                                     | `component:List/DEC-1`   | Context            | FR2                |
| ListItem row paint | Stops at the content (`flush`), reaches past it by the row inset (`padded`, `outset`), or reaches the host edge (`bleed`).                                                              | `component:List/DEC-3`   | Supporting surface | FR3–FR6            |
| Row content        | The row's first content (its marker, start content, or label) sits inside the row inset (`padded`) or on the host content line when the host inset allows (`flush`, `outset`, `bleed`). | `component:List/DEC-3`   | Prominent          | FR2–FR5            |

## Family and system relationships

- `architecture:container-padding` owns host publication, eligibility,
  logical-edge semantics, overlay reset, and the shared `edge` vocabulary. List's
  `edge` projects all four values onto both inline edges of every row.
- `architecture:public-component-api`, `spec:AST-002`, and `spec:AST-017` own
  public API admission and the deprecation lifecycle.
- Item remains the implementation owner of row padding and interaction paint;
  List owns the collection-level treatment, row placement, and its rows' own
  entering, exiting, and crossing (FR12).
- `spec:AST-057` owns swipe actions on `Item` and the rule that the element
  containing swipe-capable rows clips in the inline axis; List carries that clip
  (FR9) and `ListItem` passes `swipe` through to `Item` unchanged. Static Markdown document lists follow DEC-5's narrow exception;
  `spec:AST-061` FR11 owns their whole counters and cross-renderer indentation.
- `spec:AST-094` owns the touch presentation gate (FR13), the press model
  (FR11), and motion roles (FR4); FR10 and FR11 apply the gate and the press
  model to list rows, and FR12's motion plays an FR4 role.
- `spec:AST-105` owns the animated layout handle and its shared motion; List
  adopts it for row updates (FR12).
- `spec:AST-103` owns reordering. List is its first adopter: it
  takes the `reorderable` object, a row's key is its `ListItem`'s `itemKey`
  and its position is its index, and the
  handle is the one element reordering adds to a row, at its trailing edge
  (`spec:AST-103` FR5).

## Verification map

| Contract                  | Verification                                                                                 | Representative states                                                                                                                                                                                                                                                                                                                | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Audit section       |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| FR1–FR7, FR9              | List, Item, and theme-registry tests                                                         | every treatment; all densities; static and interactive rows; header; deprecated alias alone and with `edge`; ListItem outside a List                                                                                                                                                                                                 | Removing context propagation, using one host edge for both inline edges, zeroing padding without the shared inset source, or dropping the list's reach or its clip outside DEC-5's static Markdown exception fails                                                                                                                                                                                                                                                                                                                                                                                                        | `audit:List/layout` |
| FR2–FR6, FR8–FR9, AR1–AR2 | Real-browser List geometry evidence                                                          | each treatment in a Card at two paddings, a Section, an inline Dialog with and without Layout, a BottomSheet, a padded ScrollableArea scrolling vertically and in both axes, a LayoutContent with explicit padding, and standalone; header and dividers; LTR/RTL; hovered and selected rows; a swiped row under `outset` and `bleed` | Header movement, content off the expected line, paint past the host's padding edge, clipped resting paint, or a changed row box fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `audit:List/visual` |
| FR10                      | List tests of the touch hit target and real-browser hit-testing                              | every density; a row with a description; compact rows packed closer than 44 px; a row with an end control; a coarse and a fine pointer; a theme row padding                                                                                                                                                                          | A coarse-pointer row whose target stays at its box where its neighbors leave room, a target that reaches a neighboring row's or control's target, a changed row box, or a changed fine-pointer target fails                                                                                                                                                                                                                                                                                                                                                                                                               | `audit:List/layout` |
| FR11                      | Item press-layer tests and real-browser pixel evidence                                       | press, hold, and release; a release while the main thread is blocked; a mouse; a pressed row between two divided rows                                                                                                                                                                                                                | A release that stops while script runs, an element added for the press, a divider hidden during a press, or paint or stacking changed at rest fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `audit:List/visual` |
| FR11 dividers             | Real-browser pixel evidence of each divider against the tint                                 | a hovered row; a row pressed by a mouse and by a finger, and its release; light and dark                                                                                                                                                                                                                                             | A divider whose contrast against the tint beside it drifts more than 0.05 from its rest contrast, a changed computed border, or an unpainted tint fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `audit:List/visual` |
| FR12                      | List update-motion tests and real-browser frame evidence                                     | an insert, a removal, and a reorder, with and without a handle; reduced motion; a mouse; a start or end slot gaining, losing, and replacing content, and changing content at the same size; the reorder handle appearing; a focused slot control leaving; a leaving slot that sets the row's height                                  | A staying row that jumps with a handle (other than after a leaving slot that sets the row's height), motion without one, a collapsing removed row that takes focus, pointer input or an accessibility-tree node, a removed row left after its collapse ends, or layout or paint per frame fails. Also fails: a slot change that jumps with a handle (other than a leaving slot that sets the row's height), a same-size slot change that animates, a leaving slot control that keeps focus or stays reachable, a focus move that scrolls, focus that lands on the page body, or a height-setting slot that plays an exit. | `audit:List/visual` |
| Migration                 | `astryx upgrade` codemod tests                                                               | static, aliased, already-migrated, dynamic, and computed-`edge` callsites; a second run                                                                                                                                                                                                                                              | A dynamic value or a computed `edge` rewritten, a static one missed, or a second run that changes output fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `audit:List/docs`   |
| Documentation             | `List.doc.mjs`, Storybook, and `scripts/check-knowledge.mjs`                                 | public prop, values, default, deprecation, and representative composition                                                                                                                                                                                                                                                            | Missing or stale contract, docs, or example fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `audit:List/docs`   |
| FR13                      | List tests and real-browser tests of a row menu with a mouse, a finger, and the keyboard     | a plain row, a row with `onClick`, a row with `href`; a right click, a long press, Shift+F10, the context-menu key; close by Escape and by choice; a finger's hold, a mouse's right click, the keyboard, and `presentation: 'popover'`                                                                                               | A wrapper element around the `<li>`, a row a context request does not open, focus left in a closed menu or not returned to the row or its button, a plain row without a named "More actions" button, or a focusable row that ignores Shift+F10 fails. A lift or press paint under a mouse, the keyboard, or `presentation: 'popover'`, or a finger's hold on a focusable row without them, fails.                                                                                                                                                                                                                         | `audit:List/layout` |
| FR13 reorder              | Real-browser tests with a finger and a mouse on a reorderable row with a menu                | a hold on the handle and on the row body of a reorderable row with a menu                                                                                                                                                                                                                                                            | A handle hold that opens the menu, or a body hold that picks the row up, fails                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `audit:List/layout` |
| FR9, DEC-5                | Real-browser whole-counter ink, unordered-parent renderer parity and read-only task geometry | Static Markdown ordered lists nested in unordered and read-only task lists, LTR/RTL; general and swipe-capable Lists                                                                                                                                                                                                                 | Reinstating a Markdown ancestor clip cuts leading counter ink. Under unordered parents, mismatched Markdown/RichText text starts or nested insets fail. Under read-only task parents, checkbox occlusion of counters, changed checked states or incorrect Markdown parent-text anchors fail; this row does not claim task-parent cross-renderer parity coverage. Removing general List clipping lets moving rows paint outside their group.                                                                                                                                                                               | `audit:List/visual` |

## Decision log

### DEC-1 — List owns the collection-wide opt-in

**Reference:** `component:List/DEC-1`

**Decider:** cixzhang, 2026-09-21

The List header and ListItem rows otherwise begin on different content lines.
Only the caller knows when the containing composition requires alignment, while
List can apply one consistent decision to every row without exposing Item-level
configuration.

### DEC-2 — Compensation is row-local and bounded

**Reference:** `component:List/DEC-2`

**Decider:** cixzhang, 2026-09-21

Each row cancels no more than its own component-owned inline inset or the
matching host inset. When the host inset is at least the row inset, content
reaches the host content line. When it is smaller, content moves toward that line
without pulling row paint beyond the host boundary.

Rejected: `isFullBleed`, because the row may stop inside the host padding and the
name would promise outer-edge bleed that the component does not provide.

### DEC-3 — One edge prop names every row edge treatment

**Reference:** `component:List/DEC-3`

**Decider:** cixzhang, 2026-10-15

`padded`, `flush`, `outset`, and `bleed` are mutually exclusive answers to one
question, so one closed-value prop carries them and no combination can
contradict. The names are the shared edge vocabulary of
`architecture:container-padding`. `outset` is the bounded compensation of DEC-2;
`edgeCompensation` remains its deprecated alias.

Rejected: separate boolean props beside `edgeCompensation`, because they could
request two treatments at once.

### DEC-4 — Bleed reaches the host edge and keeps content on its padding line

**Reference:** `component:List/DEC-4`

**Decider:** cixzhang, 2026-10-15

`bleed` matches Table rows in a padded host: row paint reaches the host's padding
edge with square corners, except that, when the list is a rounded host's first or
last child, its first or last row takes that host's corner less the host block
padding it keeps (FR5). Content sits on the host content line, never closer to the
row edge than the row's own inset. It is opt-in, so existing lists keep
their geometry.

Rejected: bleed as the default inside padded hosts, because it would move every
existing list in a container.

### DEC-5 — Static Markdown lists preserve complete outside counters

**Reference:** `component:List/DEC-5`

**Decider:** imdreamrunner, 2026-10-29

Static Markdown document lists, ordered and unordered, MAY omit inline clipping
when their rows expose no swipe actions. Full number markers may paint toward
inline-start beyond their own list and any enclosing Markdown list, while text
starts and nested anchors follow `spec:AST-061` FR11. General Lists and
collections with swipe-capable rows retain FR9's inline clip so moving row paint
stays inside the collection's bounds. The exception does not remove a host's own
clipping or change list source, numbering, marker styles, or public APIs.

Rejected: widening a finite marker gutter, because it only moves the counter-width failure threshold.

### DEC-6 — A touch press takes the row's `::before`

**Reference:** `component:List/DEC-6`

**Decider:** cixzhang, 2026-10-25

Under the touch presentation, an interactive row paints its press on its own
`::before`, the one paint the compositor can fade while script runs. A caller's
own `::before` on the row merges into that layer only while the row is pressed,
so decoration that must stay through a press goes on a child, or on `::after`
where it is free. An interactive ListItem row's `::after` is its touch hit area
(FR10). A pressed row's divider keeps its resting colour.

Rejected: leaving a caller's `::before` intact through a press, because the
row then needs a second element or a main-thread paint for its press.

## Open questions

- **OQ2 — Who renders a plain row's More actions button and returns focus.** `useContextMenu`
  returns `open` and `close` but no trigger, so FR13's More actions button on a
  row with no `onClick`, `href`, or `interactiveRef` has no owner yet: (a) the
  caller renders a Button in the row's end content that calls `open`, named
  with the row's label; (b) ListItem renders it when its ref carries a menu; (c)
  `useContextMenu` returns the trigger's props. The same answer decides who
  returns focus to the row's focus target or that button on close, since the
  hook returns it to the `<li>`, and who paints a plain row's press under a
  finger's hold, since FR11 paints only an interactive row's press.

## Content boundary

This claim-scoped contract does not duplicate List's complete prop table,
container-padding internals, consumer examples, implementation steps, or future
TabList/Button projections. Those remain with their named owners.

---

<!-- source: docs/specs/components/List/ListItem.spec.md -->


# ListItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ListItem` with `label`, `description`, `startContent`, `endContent`, `onClick`, `interactiveRef`, `href`, `target`, `rel`, `align`, `isDisabled`, `isSelected`, `itemKey`, `swipe`, `xstyle`, `className`, `style`, and `ref`, with the deprecated `swipeActions` and `swipeBehavior` until `spec:AST-057` CLN-0025; the row carries `component:List`'s `list-item` target. `itemKey` is the item's key (`spec:AST-103` DEC-4). |
| Behavior                | One `<li>` row rendered by `component:Item`, which receives every row prop. Inside a List the row takes the list's density, dividers, edge treatment, and marker; outside a List it uses Item's defaults and draws no marker.                                                                                                                                                                                                    |
| End-user impact         | Each list entry reads as one list item, with the list's bullet, number, or task checkbox before it and the same interaction Item gives any row.                                                                                                                                                                                                                                                                                  |
| Builder impact          | The deprecated `swipeActions` and `swipeBehavior` move to `swipe={createSwipe(…)}` under `spec:AST-057` DEP-0017; its `astryx upgrade` codemod is an opt-in early migration from the deprecating release and runs again in 0.8.0's upgrade with CLN-0025's removal.                                                                                                                                                              |
| Compatibility/readiness | Records shipped behavior; `itemKey` is additive. Two implementation gaps, listed under Current-state impact.                                                                                                                                                                                                                                                                                                                     |
| Review checks           | Reject a row that is not an `<li>`, a ListItem-level edge, density, or divider prop, a marker drawn outside a marked List, or a dropped Item prop.                                                                                                                                                                                                                                                                               |
| Governing rules         | `component:Item` (`align` for start and end content); `component:List`; `family:navigation-destinations`; `spec:AST-057`; `spec:AST-103`; `architecture:component-theming-surface`; `architecture:component-style-authoring` INV7.                                                                                                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

ListItem is the row a List renders for each entry. It owns turning a row into
a list item: the `<li>` element, what it reads from its List, the marker drawn
before it, and how it applies `component:List`'s `list-item` target. Everything a row does as a row comes
from `component:Item`. Consumer usage lives in `ListItem.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; `isSelected` and
  `isDisabled` are caller-owned
- Migration decision: `spec:AST-057` DEP-0017, whose `astryx upgrade` codemod
  rewrites `swipeActions` and `swipeBehavior` to `swipe={createSwipe(…)}`; it
  is an opt-in early migration from the deprecating release and runs again in 0.8.0's upgrade with
  `spec:AST-057` CLN-0025's removal

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Markers are extra elements.** A bullet marker is drawn as two decorative
  `span` elements, and a number marker as one `span` carrying a counter
  pseudo-element, beside the row's content. `architecture:component-style-authoring`
  INV7 carries decoration with no semantic role on a pseudo-element rather than
  an added element.
- **ListItem has no `swipe` yet.** `spec:AST-057` FR1 has ListItem pass
  `swipe` through to `Item`, which replaces the deprecated `swipeActions`
  and `swipeBehavior` (`spec:AST-057` DEP-0017); `swipe` is not built, so
  `ListItemProps` has no `swipe` yet and FR1's pass-through of it is not
  current source.

## Ownership boundary

**Owns**

- Rendering the row as an `<li>` through `component:Item` and passing it every
  row prop (FR1).
- Reading density, dividers, edge treatment, and marker from the enclosing
  List, and the defaults outside one (FR2, FR3).
- Drawing the marker or a task item's read-only checkbox (FR4).
- Applying `component:List`'s `list-item` target to the row (FR5).

**Does not own / non-goals**

- `align`, the start and end content's alignment — owned by `component:Item`; swipe actions — owned by
  `spec:AST-057`; link destinations — owned by
  `family:navigation-destinations`, of which ListItem is a member.
- Item's label, description, slots, invisible button, delegated activation,
  and disabled and selected semantics — Item's shipped behavior, uncontracted
  here.
- What each edge treatment does to row geometry and the row inset, the touch
  target, press paint, row motion, and row menus — owned by `component:List`.
- The `ListMarkerScope` that sets a marker or task state for Markdown's nested
  lists — internal and uncontracted here.
- Whole number markers and text alignment for Markdown lists — owned by
  `spec:AST-061` FR11 and `component:List` DEC-5.

## Public concepts

No component-local concept beyond the consumer props; row props are
`component:Item`'s.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | ListItem renders `component:Item` as an `<li>` and passes `label`, `description`, `startContent`, `endContent`, `onClick`, `interactiveRef`, `href`, `target`, `rel`, `align`, `isDisabled`, `isSelected`, `swipe`, the deprecated `swipeActions` and `swipeBehavior` (`spec:AST-057` DEP-0017), and `ref` to it unchanged, with other DOM and data props reaching the row.                                                                             | Current source and tests |
| FR2 | Inside a List, the row takes the list's `density`, its `hasDividers` setting, which draws a divider between rows with no extra element and square corners (except that a `bleed` list's first or last row takes a rounded host's corner, `component:List` FR5), and its `edge` treatment.                                                                                                                                                               | Current source and tests |
| FR3 | Outside a List, the row uses `balanced` density, no dividers, the `padded` treatment, and no marker, keeping Item's inline inset.                                                                                                                                                                                                                                                                                                                       | Current source and tests |
| FR4 | In a List whose `listStyle` is `disc`, `circle`, or `decimal`, the row draws that marker before its content: a disc or circle shape, or a counter number. A task state set for the row draws a read-only, labelled checkbox in the marker's place. Each marker and the task checkbox sit on the label's first line. A List whose `listStyle` is `none` draws neither. Other markers, set internally for Markdown's nested lists, are uncontracted here. | Current source and tests |
| FR5 | The row carries `component:List`'s `list-item` target, merged with the caller's `className` and `style`; `xstyle` applies after ListItem's own styles.                                                                                                                                                                                                                                                                                                  | Current source           |

### Allowed variation

- **AV1 — Row content.** Label, description, and slot content vary.
- **AV2 — Theme styling.** Themes restyle `list-item`.

### Representative states

| State                | Required invariant                                                                                                 | Allowed variation |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------- |
| Static row in a List | One `<li>`; no button or anchor.                                                                                   | Content.          |
| Interactive row      | Item's invisible button or anchor; one tab stop.                                                                   | Content.          |
| Divided list         | A divider between rows; square corners, except a `bleed` list's end rows in a rounded host (`component:List` FR5). | Density.          |
| Numbered list        | A counter number before each row.                                                                                  | Number style.     |
| Task row             | A read-only checkbox in the marker's place.                                                                        | Checked state.    |
| Row outside a List   | Item's inline inset; no marker.                                                                                    | Content.          |

### Transformation and precedence order

- **ORD1 — Marker.** No marker when the List's `listStyle` is `none`; otherwise
  a task checkbox when the row has a task state, then the marker.
- **ORD2 — Styling.** ListItem's own styles, then the caller's `xstyle`.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — List semantics.** Inside a List, each row is an `<li>` in the List's
  `<ul>` or `<ol>` (FR1).
- **AR2 — Row semantics.** Item's interaction, disabled, and selected semantics
  apply unchanged; they are Item's shipped behavior, uncontracted here.
- **AR3 — Task state.** A task row's checkbox is read-only and labelled (FR4).

## Design relationships

| Anatomy or state | Design requirement                              | Representation authority | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Row              | Presents one list entry through Item.           | `component:Item`         | Prominent      | FR1, FR5           |
| Marker           | Shows the list's bullet, number, or task state. | Current source           | Supporting     | FR4                |

No anatomy-theming map is recorded yet; the block is optional during
migration, so the map is deferred.

## Family and system relationships

- `component:Item` owns `align`, the start and end content's alignment; its
  other row behavior is
  uncontracted. `spec:AST-057` owns swipe actions and
  `family:navigation-destinations` owns link destinations.
- `component:List` owns the edge treatment and its row geometry and inset;
  its record leaves the density, divider, and marker-style settings
  uncontracted, and FR2 and FR4 here cover what a row does with them.
- `architecture:component-theming-surface` owns target qualification;
  `component:List` owns the `list-item` target, and FR5 covers how the row
  applies it.

## Verification map

| Contract     | Verification                                                                                  | Representative states                          | Mutation or failure expectation                                              | Audit section                  |
| ------------ | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| FR1, AR1     | `List.test.tsx` row element, align, data attribute, and swipe pass-through tests              | Static and interactive rows                    | A row that is not an `<li>`, or a dropped prop, fails.                       | `audit:ListItem/behavior`      |
| FR2          | `List.test.tsx` density, divider, radius, and edge treatment tests                            | Each density; dividers on and off; each edge   | A row that ignores its List's settings fails.                                | `audit:ListItem/layout`        |
| FR3          | `List.test.tsx` "keeps the inset of a ListItem outside a List"                                | Row outside a List                             | A row outside a List that loses its inset fails.                             | `audit:ListItem/layout`        |
| FR4, AR3     | `List.test.tsx` marker and ListMarkerScope tests                                              | Presence of a marker, none, scope marker, task | A missing, extra, or unlabelled marker fails.                                | `audit:ListItem/anatomy`       |
| AR2          | `List.test.tsx` invisible button, anchor, disabled, and selection tests                       | Click, href, disabled, selected                | Lost row semantics fail.                                                     | `audit:ListItem/accessibility` |
| RTL relation | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `List / Interactive` | Start icon and end chevron; LTR and RTL        | A start content that is not at the inline start of the end content fails D2. | `audit:ListItem/i18n-rtl`      |

Read from source, with no focused test yet:

- FR1: `interactiveRef`, `rel`, and `ref` reaching the Item row.
- FR2: the divider border and square corners. The `bleed` end-row corner exception is checked by `ContainerCorners.a11y.chromium.spec.ts` (`component:List` FR5).
- FR4: each marker and the task checkbox sitting on the label's first line.
- FR3: `balanced` density, no dividers, and no marker outside a List.
- FR4: the shape of each bullet marker (the disc's fill, the circle's ring),
  and the number marker and its counter.
- FR5: the `list-item` target, and `xstyle` applying after ListItem's styles.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, Item's row behavior, or
List's edge and geometry rules. It links to their owners.

---

<!-- source: docs/specs/components/List/ListItem.swift.spec.md -->


# ListItem (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ListItem(_ label:, description:, align:, href:, isDisabled:, isSelected:, startContent:, endContent:, onClick:)` and `ListItem(_ props: ListItemProps, startContent:, endContent:)`, a generic SwiftUI `View`.              |
| Behavior                | Draws `component:swift/Item` with the density, marker, dividers, and edge of the `List` around it: a dot, a ring, or its number on the label's first line; square corners between dividers; no inline inset in a flush list. |
| End-user impact         | A person sees bulleted and numbered lists, settings lists, and divided lists on iPhone laid out as on the web, with each marker beside its row's first line however the row wraps.                                           |
| Builder impact          | An app puts `ListItem`s in a `List`; the row takes the list's look. Swipe actions, `target`, and `rel` have no Swift form.                                                                                                   |
| Compatibility/readiness | Additive: a new view and generated `ListItemProps`, and internal list hooks on `Item`. Draft; built and tested on macOS and the iOS Simulator; device captures are attached to the change.                                   |
| Review checks           | Reject a marker that leaves the label's first line, a row that ignores its list's density, dividers with rounded corners, an inset in a flush list, or list styling that leaks into rows nested in a slot.                   |
| Governing rules         | `spec:AST-082` FR3, FR4, FR7; `spec:AST-093` FR1–FR5; `component:swift/Item`; the Swift component API, slots, theme environment, and accessibility records under `packages/native/specs/swift/library/`.                     |

This table is a review projection; the body below is authoritative.

## Intent

ListItem on Apple platforms is a row that belongs to a list: it draws as
`Item` and takes the list's density, marker, dividers, and edge, so every row
of a list matches without the app repeating them.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Reading the list around it and handing `Item` its density, marker, inline
  inset, and corners.
- Drawing the marker: a dot, a ring, or the row's number.

**Does not own / non-goals**

- The row's layout, words, states, and taps — owned by `component:swift/Item`.
- Numbering, dividers between rows, and the list's edge — owned by the list
  that holds the rows.
- Swipe actions — web-only for now (`component:swift/Item` DEC-1).

## Public concepts

| Concept | Closed values or states | Meaning                                                          | Availability by variant/orientation/state | Default | Owner                      | Stability    | Invalid-value behavior |
| ------- | ----------------------- | ---------------------------------------------------------------- | ----------------------------------------- | ------- | -------------------------- | ------------ | ---------------------- |
| marker  | none, dot, ring, number | the list's marker for this row, from its list style              | inside a list with a marker style         | none    | `component:ListItem`       | experimental | none                   |
| list    | inside a list; alone    | inside a list the row takes its look; alone it is a plain `Item` | always                                    | alone   | `component:swift/ListItem` | experimental | none                   |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Basis                                      | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------ |
| FR1 | The row MUST draw as `component:swift/Item` with its own label, description, alignment, link, tap, and states, and with the density of the list around it; alone it MUST draw exactly as that `Item`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | core `ListItem`                            | verify             |
| FR2 | In a list with a marker style, the row MUST draw a marker in a column `space.s4` wide, grown with Dynamic Type and the same on every row, before its start content: a 6-point dot filled with `color.textPrimary` for `disc`, a 6-point ring stroked 1 point in `color.textPrimary` for `circle`, or its number and a period in the body type with tabular figures for `decimal`, ending at the column's end so every period in the list lines up, as core's numbered markers do. A number wider than the column reaches into the row's inline inset; a number wider than both widens the column on every row of the list alike, so no number moves its own row's words, overlaps them, or is cut, and every row keeps the list's text edge. The marker's center sits on the center of the label's first line box for every alignment. | core `ListItem` markers                    | verify             |
| FR3 | In a list with dividers the row MUST draw its background with square corners; in a flush list it MUST have no inline inset, so its content and background reach the list's edges.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | core `ListItem` `withDivider`, `edgeFlush` | verify             |
| FR4 | The list's treatment, look, and numbering MUST apply to this row only, not to rows nested in its start or end content.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | core `ListContext` scope                   | verify             |
| FR5 | Both initializers MUST build the same `ListItemProps`. Slots are generic `@ViewBuilder` closures with empty defaults; a single trailing closure is the start content and `onClick` comes last. Base props come through `ListItemProps`. A ListItem node sent by a logic core draws its start and end content nodes in those slots (`spec:AST-082` FR19).                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Swift component API A2–A4, A7; slots S3    | verify             |

### Allowed variation

- **AV1 — Marker drawing.** The dot and ring are SwiftUI shapes at core's size,
  not CSS boxes.

### Representative states

| State                         | Required invariant                            | Allowed variation |
| ----------------------------- | --------------------------------------------- | ----------------- |
| alone                         | the same as `Item`                            | none              |
| in a list: each density       | the list's padding                            | none              |
| disc, circle, decimal markers | on the label's first line for every alignment | AV1               |
| dividers; flush               | square corners; no inline inset               | none              |
| light and dark                | each theme's colors                           | none              |

### Transformation and precedence order

- **ORD1 — Density.** The list's density → `balanced`.

### Performance and resources

- **PR1 — One extra measure.** Inside a list with markers, a centre-aligned row
  measures its words to place the marker on the first line; other rows measure
  nothing.
- **PR2 — Numbering.** Inside a list, the row reports its identity to the list
  once, and the list numbers its rows in the order they appear. A numbered row
  also reports its number's width, from which the list sizes one shared column.

## Accessibility contract

- **AR1 — One row.** The row is the `Item`'s one element; a number marker is
  read first, as part of the row ("3. Mix the batter"); a dot or ring is hidden
  (Swift accessibility X5).
- **AR2 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target
  exists.

## Design relationships

| Anatomy or state | Design requirement                                 | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Row and marker   | Apple Human Interface Guidelines, Lists and tables | prescribed by core       | supporting     | FR1–FR3            |

The component implements design requirements without copying their rationale.

Platform control: none of its own; the row is `component:swift/Item`, which
names the SwiftUI controls it uses (`spec:AST-093` FR2). Guideline pages:
Lists and tables, and Accessibility in the Apple Human Interface Guidelines.

Theme values read: `space.s4`, `color.textPrimary`, the body type, and through
`Item` its tokens.

## Family and system relationships

- `component:swift/Item` owns the row; this record states only what a list
  row adds.
- `component:ListItem` owns the props and markers.

## Verification map

| Contract | Verification                                                                                                                                | Representative states                                                                                                                                                                         | Mutation or failure expectation                                                                                                                                                                                     | Audit section                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FR1      | `ListItemTests.swift` alone and density renders                                                                                             | alone; compact and spacious lists                                                                                                                                                             | a row that differs from `Item` alone or ignores density fails                                                                                                                                                       | `audit:swift/ListItem/row`    |
| FR2, AR1 | `ListItemTests.swift` number, numbering, column, period-alignment, shared-column, first-line, largest-text, two-theme, and read-aloud tests | decimal; numbering from 3; "1." and "10."; a number wider than the column and inset; "9." at the largest text size; disc with each alignment and at the largest text size; neutral and butter | a missing or wrong number, periods that do not line up, a column that widens for a number that fits the inset or does not widen for every row, a marker off the first line, a color of its own, or a read dot fails | `audit:swift/ListItem/marker` |
| FR3      | `ListItemTests.swift` flush and divider renders                                                                                             | padded and flush; with and without dividers                                                                                                                                                   | an inset in a flush list or a rounded corner between dividers fails                                                                                                                                                 | `audit:swift/ListItem/edge`   |
| FR4      | `ListItemTests.swift` nested-row test                                                                                                       | a row in a row's end content                                                                                                                                                                  | a nested row with the list's marker or inset fails                                                                                                                                                                  | `audit:swift/ListItem/scope`  |
| FR5      | `ListItemTests.swift` initializer and wire-slot tests; `contracts.test.ts`                                                                  | both initializers; a wire node with start content                                                                                                                                             | differing props, or a wire node whose slots do not draw, fail                                                                                                                                                       | `audit:swift/ListItem/api`    |

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
