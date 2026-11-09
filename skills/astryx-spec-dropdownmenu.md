---
schema_version: 3
template_version: 7
kind: component
id: component:DropdownMenu
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-31
owners: [cixzhang]
review_triggers: [accessibility, behavior, layout, public-api, theming]
verified_by:
  [
    packages/core/src/DropdownMenu/DropdownMenu.test.tsx,
    packages/core/src/DropdownMenu/DropdownMenuSubMenu.test.tsx,
    packages/core/src/DropdownMenu/__tests__/DropdownMenuDrillIn.a11y.chromium.spec.ts,
    packages/core/src/DropdownMenu/__tests__/MenuPress.a11y.chromium.spec.ts,
    packages/core/src/DropdownMenu/__tests__/MenuHeaderFooter.a11y.chromium.spec.ts,
    packages/core/src/DropdownMenu/__tests__/SubMenuHeaderFooter.a11y.chromium.spec.ts,
    packages/core/src/ContextMenu/ContextMenu.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: [module:DropdownMenu/useMenuPress, module:DropdownMenu/useMenuHover]
families: [family:overlay-dismissal, family:navigation-destinations]
design_specs: [design:reduced-motion]
architecture:
  [
    architecture:component-theming-surface,
    architecture:interaction-modality,
    architecture:layer-runtime,
  ]
contributing: []
system_specs: [spec:AST-020/FR15, spec:AST-094, spec:AST-102]
---

# DropdownMenu component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. DropdownMenu takes a `button` (Button props) or `renderTrigger`, data-driven `items` or compound children, `presentation`, `isMenuOpen` and `onOpenChange`, placement and alignment, `menuMaxHeight`, `header`, and `footer`.                                                                                                     |
| Behavior                | A Menu Button trigger opens an anchored pointer menu or a bottom-sheet action list. Rows act on the release under the shared press model; sub-menus fly out beside their row or drill in on a compact touch display; a header or footer makes the pointer popover a modal dialog around the menu.                                               |
| End-user impact         | People pick actions by mouse, finger, or keyboard; keyboard users get a focus return with a ring and pointer users without one; on a phone sub-menus replace the rows instead of flying off-screen. Under a finger the menu opens after a 500 ms hold or at a tap's click, does not grow from its trigger, and a pan outside does not close it. |
| Builder impact          | Builders choose the trigger, the rows, and the regions; rows stay menu items and every non-item control goes in `header` or `footer`.                                                                                                                                                                                                           |
| Compatibility/readiness | Records shipped behavior; no API change; a disabled row gains `tabindex="-1"`; the released behavior under a finger moves as `spec:AST-094` FR25 lists, with `presentation="popover"` keeping it. Finger press-open (FR8), touch grow and pan dismissal (FR21), the still mouse (FR22), and Trigger Button gaps are in Current-state impact.    |
| Review checks           | Reject a control placed among the rows, a lost trigger ARIA wiring, a drilled-in view that leaves the menu box, a header or footer without the dialog, a lost focus-return modality, or a target moved off its painted element.                                                                                                                 |
| Governing rules         | `spec:AST-020` FR15; `spec:AST-094` FR26–FR35; `module:DropdownMenu/useMenuPress`; `architecture:interaction-modality` INV1; `architecture:component-theming-surface`; `architecture:layer-runtime`; `family:overlay-dismissal`; `family:navigation-destinations`.                                                                              |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenu presents actions from a visible trigger in either an anchored
pointer menu or a BottomSheet-hosted touch action list. Its press model — the
row under the release acts and the highlight follows the pointer — is
contracted by `module:DropdownMenu/useMenuPress`, which both presentations
mount.

## Compatibility and migration

- Released default preserved: `no` under a finger: the omitted `presentation`
  follows `spec:AST-094` FR29, FR31, and FR32 (FR8, FR21);
  `presentation="popover"` keeps the released behavior (`spec:AST-094` FR25);
  and `no` for disabled rows on every pointer: the keyboard reaches a disabled
  row and the row carries `tabindex="-1"` (FR17), a defect fix under DEC-11
  (owner decision, 2026-11-04)
- Compatibility class: records shipped behavior; no public prop or export
  change; a disabled row gains `tabindex="-1"` (FR17)
- Controlled/uncontrolled behavior: `isMenuOpen` with `onOpenChange`, or
  uncontrolled
- Migration decision: `spec:AST-094` FR25 and DEC-4

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Pointer menu surface and Touch menu surface and their shared
  `dropdown-menu` target.
- Pointer action rows, pointer-only section headings and dividers, radio marker
  specialization, and submenu indicator presentation through the other five
  DropdownMenu targets.
- Selecting between the pointer and touch render paths after presentation
  policy resolves.
- Mounting the shared press model on both menu surfaces and on the Trigger
  button; the model itself is owned by `module:DropdownMenu/useMenuPress`.
- The `header` and `footer` regions, the dialog around them, and the drilled-in
  view.

**Does not own / non-goals**

- Trigger-button presentation — delegated to `component:Button`.
- The Touch sheet frame — delegated to `component:BottomSheet`.
- Touch action-list and row presentation — delegated to `component:List`.
- Shared checkbox-indicator and ordinary icon presentation — delegated to
  `component:Indicator` and `component:Icon`.
- Each row's own contract — owned by `component:DropdownMenuItem`,
  `component:DropdownMenuCheckboxItem`, `component:DropdownMenuRadioGroup`,
  `component:DropdownMenuRadioItem`, `component:DropdownMenuSubMenu`,
  `component:DropdownMenuGroup`, and `component:DropdownMenuDivider`.
- The flyout hover timing — owned by the menu hover module (`useMenuHover`).
- Shared layer lifecycle or dismissal policy.

## Public concepts

Consumer props, item shapes, subcomponents, and presentation policy remain
documented in `DropdownMenu.doc.mjs` and the subcomponent docs. These are the
component-local concepts; each keeps its released default.

| Concept               | Closed values or states                                            | Meaning                                                                                                                                                                                          | Availability by variant/orientation/state                       | Default              | Owner                    | Stability | Invalid-value behavior                                           |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------------------- | ------------------------ | --------- | ---------------------------------------------------------------- |
| Menu height cap       | `menuMaxHeight`: a number of pixels                                | Lifts the 300px cap for a menu that must fit its rows; the viewport still bounds it.                                                                                                             | Pointer presentation                                            | `300px`              | `component:DropdownMenu` | stable    | Ignored by the touch sheet.                                      |
| Trigger source        | `button` (Button props) or `renderTrigger` (render prop)           | Which control the menu hangs off. `renderTrigger` receives `DropdownMenuTriggerProps` — the press model, keyboard opens, toggle click and ARIA wiring — and names the menu.                      | Both presentations                                              | `button`             | `component:DropdownMenu` | stable    | Both given: `renderTrigger` wins and a dev warning fires.        |
| Header and footer     | `header`, `footer`: any React node                                 | Content above and below the rows, beside the menu inside the same popover or sheet — never inside the `role="menu"` element. With either, the pointer popover is a modal dialog around the menu. | Both presentations                                              | none                 | `component:DropdownMenu` | stable    | A false or empty value renders no region.                        |
| Sub-menu regions      | `header`, `footer` on a sub-menu: any React node                   | Content above and below a sub-menu's rows, beside its menu inside its own surface; with either, that surface is a modal dialog named by the row (FR20).                                          | Popover presentation                                            | none                 | `component:DropdownMenu` | stable    | A false or empty value renders no region.                        |
| Row destination       | `href` (+ `target`, `rel`) on an action item                       | The row's act is navigation: the row itself is the link (`family:navigation-destinations`).                                                                                                      | Pointer action row and Touch action row, compound and data mode | none (an action row) | `component:DropdownMenu` | stable    | Blocked schemes follow the family rule; a disabled row has none. |
| Sub-menu presentation | `presentation` on a sub-menu row: `flyout`, `drill-in`, `adaptive` | Whether a sub-menu opens beside its row or replaces the menu's rows with its own and a Back row, in the same box. `adaptive` drills in when a compact touch display opened the menu.             | Pointer presentation, compound and data mode                    | `adaptive`           | `component:DropdownMenu` | stable    | An unknown value reads as `adaptive`.                            |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| FR1  | Every render contains a Trigger button. Pointer presentation renders a Pointer menu surface with pointer-owned rows and optional pointer headings, dividers, indicators, and nested flyouts. Touch presentation renders a Touch sheet frame containing a Touch menu surface, Touch heading, Touch action list, and Touch action rows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Current source, docs, and tests                                                |
| FR2  | The six local targets are `dropdown-menu`, `dropdown-menu-item`, `dropdown-menu-radio`, `dropdown-menu-section-heading`, `dropdown-menu-divider`, and `dropdown-menu-indicator-icon`; every target stays on its painted element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `architecture:component-theming-surface`; current source                       |
| FR3  | Button owns the Trigger button, BottomSheet owns the Touch sheet frame, List owns the Touch action list and Touch action rows, Indicator owns checkbox chrome, and Icon owns ordinary rendered icons. The Trigger button carries `component:Button`'s gaps: its press scale applies under reduced motion (`design:reduced-motion` DR1) and its height is fixed (`spec:AST-102` FR4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Current source and owner docs; `design:reduced-motion` DR1; `spec:AST-102` FR4 |
| FR4  | The same `dropdown-menu` target reaches the alternative Pointer menu surface and Touch menu surface. Pointer action rows carry `dropdown-menu-item`; touch action rows instead use List's `list-item` target.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Current source and tests                                                       |
| FR5  | Both menu surfaces carry `data-astryx-menu-press` and follow `module:DropdownMenu/useMenuPress` FR1–FR7, FR10, and FR11: the row under the release acts, the highlight follows a held pointer, a mouse released outside closes and a finger leaves the menu open, the browser's stray click never acts, and the Pointer menu surface declares `touch-action` by overflow. The grow, collapse, and pan dismissal under a finger are FR21.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `module:DropdownMenu/useMenuPress`; `spec:AST-094` FR26–FR28                   |
| FR6  | When the pointer menu closes, focus returns to the Trigger button with a visible ring only when the menu was driven by keyboard, and after a pointer pick the returned focus opens no trigger tooltip (`component:Tooltip` FR4); a press outside that landed on a focusable control keeps focus there.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `architecture:interaction-modality` INV1; DEC-1                                |
| FR7  | `menuMaxHeight` replaces the 300px term of the menu's and its popover viewport's block-size cap while the viewport gutters still bound both; the touch sheet ignores it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | DEC-2                                                                          |
| FR8  | The Trigger button opens the pointer menu on a mouse press-down, with a settle rule on the opening release, and pressing the trigger of an open menu closes it without reopening in the same gesture; a mouse click and the keyboard open as before. The mouse press-open is shipped behavior, not a requirement until `module:DropdownMenu/useMenuPress` DEC-4 is ruled. Under a finger the trigger MUST open the menu as `spec:AST-094` FR29 states: as the finger presses in a fixed bar, after the 150 ms content-touch delay or at a tap's lift inside a scroll view; `presentation="popover"` keeps the tap open. Implementation gap: a held finger opens it after a 500 ms hold, and a tap opens it at its click.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `module:DropdownMenu/useMenuPress` FR8, FR9; `spec:AST-094` FR29               |
| FR9  | With `renderTrigger`, the rendered control carries `aria-haspopup`, `aria-expanded`, `aria-controls` and the `id` the menu's `aria-labelledby` points at, and receives the same press-model, keyboard-open and toggle-click handlers as the Button path; the menu is named by that control. A disabled custom trigger never opens the menu or the sheet. `button` and `renderTrigger` are mutually exclusive: both given, `renderTrigger` wins and a dev warning fires, in both presentations. A drilled-in Back row (FR11) returns to the menu by that same name: the caller's `aria-label` when given, else the control's accessible name, read as the menu opens.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | DEC-3                                                                          |
| FR10 | An action row with `href` renders as one anchor carrying `role="menuitem"` (the pointer menu) or the touch sheet's link row, routed through `LinkProvider`; a plain click runs `onClick`, then closes the menu (`hasCloseOnSelect`), then lets the browser navigate; a modified click does not run `onClick`, closes the menu, and is left to the browser; in the pointer menu a middle click closes the menu (`hasCloseOnSelect`), then runs the caller's `onAuxClick`, while the touch sheet leaves a middle click to the browser and stays open; a right click is left to the context menu; Enter and Space activate through a synthesized click that carries the key's modifiers. A disabled link row has no `href`; a blocked destination renders inertly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current behavior; `family:navigation-destinations`                             |
| FR11 | When a compact touch display opened the pointer menu (the query the root presentation uses for its bottom sheet, sampled once as it opens), an `adaptive` sub-menu row drills in: its rows and a leading Back row named "Back to <parent>" replace the menu's rows in the same Pointer menu surface, no flyout opens, the drilled list is a `menu` named by the row's label, and Back, Escape and ArrowLeft return to the row with focus on it; a pick inside closes the whole menu, and closing the menu resets the drilled view. Roving focus and typeahead scope to the shown rows; sibling rows and dividers need no knowledge of it. `presentation="flyout"` keeps the flyout; `"drill-in"` drills in on any pointer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | DEC-4; `spec:AST-094` FR34                                                     |
| FR12 | In the pointer menu ArrowDown on the last row wraps to the first and ArrowUp on the first to the last; PageDown and PageUp move to the last and first fully visible row and, pressed there again, one viewport further without wrapping; disabled rows count as rows for every one of these keys (FR17); ArrowUp on the trigger opens with the last enabled row highlighted; the key that opened the menu and its auto-repeats do not activate; typeahead matches the row's label element alone and ignores Control/Command chords and input-method composition.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Current source and tests                                                       |
| FR13 | On a mouse, a nested flyout stays open while the pointer is inside the triangle from where it left its row to the flyout's near edge — including while the pointer is paused there — and closes after the existing delay once the pointer has left both the row and that triangle. The row's click toggle and its guard window are unchanged.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Current behavior                                                               |
| FR14 | Compound groups follow `component:DropdownMenuGroup`; a data-mode `{type: 'section'}` entry is a `role="group"` named by its title, and an untitled section renders its rows without a heading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | DEC-6; current tests                                                           |
| FR15 | With `header` or `footer`, the pointer popover is a `role="dialog"` with `aria-modal="true"`, named like the menu, holding the header, then the `role="menu"` element, then the footer; the menu element holds only its rows. The trigger says `aria-haspopup="dialog"` and its `aria-controls` names the popover that holds the dialog. A region keeps its own keys and presses: neither the menu's key handling nor its press model claims an event that begins there. The menu is one Tab stop between the regions. Tab and Shift+Tab move through the header's controls, the menu, then the footer's controls, and wrap at either end; a control that is hidden, or under a hidden ancestor within its region, is not a stop. From a row, or a row of an open sub-menu, Tab and Shift+Tab close every open flyout and continue from the menu's stop. With no other stop, focus stays in the menu. Escape closes from anywhere in the popover, and focus returns to the trigger. The bottom sheet, already a dialog, shows the header above the actions and the footer below them. Without either prop, the menu renders and behaves exactly as it does without them: no dialog, `aria-haspopup="menu"`, and Tab closes the menu. | DEC-8, DEC-10                                                                  |
| FR16 | Checkbox rows follow `component:DropdownMenuCheckboxItem`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Current source                                                                 |
| FR17 | A disabled menu row MUST be reached by the keyboard and stay inert (DEC-11): in DropdownMenu, its sub-menus, MoreMenu, ContextMenu and NavHeadingMenu, ArrowDown, ArrowUp, Home, End and type-ahead visit a disabled row as they visit any other row, the row takes focus and exposes `aria-disabled="true"`, and Enter, Space or a click on it does nothing and leaves the menu open. Opening a menu from the keyboard still lands on an enabled row: the first, or the last after ArrowUp on the trigger (FR12, AR4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | DEC-11; WAI-ARIA Menu pattern                                                  |
| FR20 | With `header` or `footer` on a sub-menu (`DropdownMenuSubMenu`), its surface is a modal dialog named by its row (AR7), holding the header, the sub-menu's `role="menu"` (rows only), then the footer. It sits in a host `DropdownMenu` renders beside its menu, never inside a menu; under a root with no such host (`ContextMenu`) the sub-menu shows its rows alone. On a fine pointer the dialog is the flyout; on a compact touch display, the drilled-in view, which replaces the root's menu and regions until popped. A region keeps its own keys and presses. The rows are one Tab stop: Tab and Shift+Tab walk the header's controls, the rows, then the footer's, and wrap; from a deeper flyout, that flyout closes and the walk goes on from the rows. An open lands as for any sub-menu (FR11, FR12), not on a region. Escape in the dialog, outside an IME composition and unless a control there handled it, returns focus to the row and leaves the root open. A pointer leaving the flyout keeps it open until focus leaves, and it closes with the flyout holding its row. Without either prop nothing changes.                                                                                                    | Current behavior; FR15; AR5                                                    |
| FR21 | Under a finger, in the touch modes (`presentation` not pinned to `'popover'`), the pointer menu MUST grow out of the Trigger button on the theme's entrance duration and easing tokens and collapse back into it on the theme's exit duration and easing (`spec:AST-094` FR7, FR31, FR45), and MUST close as a pan that starts outside it begins (FR32); a pinned `'popover'` keeps the layer's own entrance. A pan dismissal is the menu's own close: focus that was in the menu returns to the Trigger button, whose `aria-expanded` turns false. A mouse keeps the layer's own entrance and exit. Implementation gap: the menu keeps the layer's own entrance and exit under a finger too, and has no pan-outside dismissal of its own.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `spec:AST-094` FR31, FR32; `family:overlay-dismissal` AV6                      |
| FR22 | Under a finger, in the touch modes, where the primary pointer is coarse (a phone or a tablet), a tap or a drag that lands while the pointer menu enters MUST reach nothing: it closes nothing, scrolls nothing, moves no focus and clicks nothing (`spec:AST-094` FR35). The finger that opened the menu still picks the row it lifts on (FR8). Keys and assistive technology stay live. A mouse, a pinned `'popover'` and a finger where the primary pointer is fine (a touchscreen laptop) hold nothing, as for `component:Drawer`. Implementation gap: after a finger, a still mouse's first press lands on the entering menu's shield unless the mouse rests where the page last heard it when the shield came up (`spec:AST-094` FR35).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `spec:AST-094` FR35; `architecture:layer-runtime`                              |
| FR23 | Tab or Shift+Tab on a row at any level of a menu without `header` or `footer`, its own rows or an open sub-menu flyout's at any depth, closes every open level and the menu, calls `onOpenChange(false)` once, and leaves focus to move on from the trigger in page order (WAI-ARIA Menu Button). A level with a header or footer keeps FR15's and FR20's Tab cycle within it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | WAI-ARIA Menu Button pattern; current tests                                    |

### Allowed variation

- **AV1 — Presentation.** `popover`, `bottom-sheet`, and resolved `adaptive`
  presentation may select the pointer or touch anatomy without changing the
  ownership of either branch.
- **AV2 — Content mode.** Data-driven and compound pointer menus may vary their
  rows while preserving the target owners. Touch presentation remains
  data-driven.
- **AV3 — Optional content.** Icons, selectable indicators, headings, dividers,
  and nested actions render only when the supplied menu content requires them.

### Representative states

| State                       | Required invariant                                                                                                              | Allowed variation                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Anchored root menu          | Trigger button and Pointer menu surface render with pointer-owned rows.                                                         | Width, placement, alignment, and optional item content vary.     |
| Anchored nested flyout      | Pointer action row opens another Pointer menu surface and may show the submenu indicator icon.                                  | Loading may replace the indicator with the Spinner.              |
| Drilled-in sub-menu         | The Pointer menu surface shows a Back row then the sub-menu's rows; the parent rows are hidden, not unmounted.                  | Depth; which pointer opened the menu; a forced `presentation`.   |
| Bottom-sheet root actions   | Trigger button opens Touch sheet frame, Touch menu surface, heading, action list, and action rows.                              | Icons, sections, dividers, and action descriptions may vary.     |
| Bottom-sheet nested actions | The same frame and list owners remain while heading and rows change to the selected action level.                               | Back control and drill-in indicator follow navigation.           |
| Selectable pointer action   | Pointer action row may contain shared checkbox or radio chrome.                                                                 | Checked and disabled state follow the item contracts.            |
| Custom-trigger menu         | The caller's control carries the trigger ARIA and names the menu; the Pointer menu surface is unchanged.                        | Any focusable control: icon button, chip, avatar, list row.      |
| Link row                    | The Pointer action row (or Touch action row) is the anchor; `onClick`, close and navigation run in that order on a plain click. | `target`, `rel`, icon, description and destructive variant vary. |
| Header or footer            | The popover is a named modal dialog holding header, menu, and footer; Tab wraps.                                                | Region content.                                                  |

### Transformation and precedence order

- **ORD1 — Link row activation.** modified click → no `onClick`, close
  (`hasCloseOnSelect`), the browser opens it; else `onClick` → close
  (`hasCloseOnSelect`) → the browser navigates.
- **ORD2 — Trigger source.** `renderTrigger` → `button`.

### Performance and resources

- **PR1 — Bounded resources.** While open, the pointer menu observes its own
  size and content changes and listens for window and visual-viewport resizes
  and image loads to decide whether it scrolls. A press-open, by a mouse press or a
  held finger, adds document pointer-up and pointer-cancel listeners for the
  length of the press. With
  `presentation="adaptive"` the root subscribes to the compact-touch query while
  mounted; the drill-in reads it once as the menu opens.

## Accessibility contract

While a pointer is held, the highlight is DOM focus per
`module:DropdownMenu/useMenuPress` AR1. Focus return on close follows FR6 and
`architecture:interaction-modality` INV1 through the shared focus-return
visibility helper.

- **AR1 — A custom trigger still names the menu.** With `renderTrigger`, the
  menu carries `aria-labelledby` pointing at the control's `id` (the Button path
  keeps `aria-label`), and the control carries `aria-haspopup="menu"`,
  `aria-expanded` and `aria-controls`.
- **AR2 — A row that navigates is a link element.** A row with an `href` is
  the anchor itself: in the pointer menu it keeps `role="menuitem"` so the menu
  stays one menu, while a modified click or Enter keeps the browser's link
  meaning; in the bottom sheet the row is a plain link; a disabled link row is
  not activatable.
- **AR3 — A drilled-in sub-menu stays one menu.** On a compact touch display a
  sub-menu replaces the rows in the same menu box with a "Back to <parent>" row
  and its own rows; after a keyboard open focus lands on the first enabled row
  after Back, after a pointer open on the drilled list (the `menu`); Back, Escape, or
  ArrowLeft return to the parent view with focus restored.
- **AR4 — The anchored trigger adopts the APG Menu Button pattern's required
  parts** (`spec:AST-020/FR15`): the control that opens the anchored pointer
  menu is a `button` with an accessible name, `aria-haspopup="menu"`,
  `aria-expanded` reflecting the menu, and `aria-controls` naming it; Enter or
  Space opens the menu with focus on the first enabled row. As a named
  exception under that rule, the trigger also opens on ArrowDown (focus on the
  first enabled row) and ArrowUp (focus on the last enabled row), the keyboard
  this component already ships (DEC-9). A `renderTrigger` control receives
  `aria-haspopup`, `aria-expanded`, `aria-controls`, and the keyboard and focus
  handlers through the spread props (FR9); the caller's control supplies its
  own `button` role and accessible name. The bottom-sheet presentation and a
  pointer menu with `header` or `footer` are outside this pattern: their
  trigger opens a dialog and says `aria-haspopup="dialog"` (AR5).
- **AR5 — With a header or footer, the pointer popover adopts the APG Dialog
  (Modal) pattern's required parts** (`spec:AST-020/FR15`): `role="dialog"`,
  `aria-modal="true"`, and an accessible name, the menu's; focus moves into
  the dialog on open, to the menu or its first enabled row as FR6 and FR12
  state; Tab and Shift+Tab cycle within it (FR15); Escape closes it and focus
  returns to the trigger. The menu inside keeps AR1–AR3. The trigger keeps
  `aria-expanded`; its `aria-haspopup` says `dialog`, and its `aria-controls`
  names the popover that holds the dialog rather than the menu, as Popover's
  own trigger does.
- **AR6 — Disabled rows are inert.** A disabled row runs no caller activation
  handler and does not close the menu; FR17 records that the keyboard reaches
  it.
- **AR7 — A sub-menu with a header or footer adopts the same APG Dialog
  (Modal) parts for its own surface** (`spec:AST-020/FR15`): `role="dialog"`,
  `aria-modal="true"`, and an accessible name, its row's; focus moves into the
  dialog on open, to the sub-menu's first enabled row or its menu as FR11 and
  FR12 state; Tab and Shift+Tab cycle within it (FR20); Escape closes it and focus
  returns to the row. The sub-menu's menu inside keeps AR3. The row keeps
  `aria-expanded`; its `aria-haspopup` says `dialog` and its `aria-controls`
  names the dialog.

## Design relationships

| Anatomy or state                   | Design requirement                                                            | Representation authority       | Hierarchy role    | Component contract |
| ---------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Trigger button                     | Provides the visible control that opens and closes the selected presentation. | `component:Button`             | Supporting        | FR1, FR3           |
| Trigger indicator icon             | Communicates disclosure on labeled triggers when enabled.                     | `component:Icon`               | Supporting        | FR1, FR3           |
| Pointer menu surface               | Paints the anchored root or nested pointer menu panel.                        | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Pointer action row                 | Presents one action, selectable option, or nested-menu entry.                 | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Icon-rendered item icon            | Adds an optional semantic or component icon to an action row through Icon.    | `component:Icon`               | Supporting        | FR1, FR3           |
| Caller-rendered item start content | Presents arbitrary React content directly in an action-row start slot.        | Caller-supplied content        | Context-dependent | FR1, FR3           |
| Checkbox indicator                 | Draws the decorative checkbox state for a checkbox action row.                | `component:Indicator`          | Supporting        | FR1, FR3           |
| Radio indicator                    | Draws shared radio chrome with the current menu-specific radio target.        | Current source and Indicator   | Supporting        | FR1, FR2, FR3      |
| Pointer section heading            | Labels a grouped set of pointer action rows.                                  | Current source and public docs | Supporting        | FR1, FR2           |
| Pointer divider                    | Separates groups of pointer action rows.                                      | Current source and public docs | Supporting        | FR1, FR2           |
| Pointer submenu indicator icon     | Identifies a pointer action row that opens a nested flyout.                   | Current source and public docs | Supporting        | FR1, FR2           |
| Touch sheet frame                  | Supplies the touch panel, scrolling area, handle, and optional scrim.         | `component:BottomSheet`        | Prominent         | FR1, FR3           |
| Touch menu surface                 | Arranges menu-owned heading and action content inside the sheet.              | Current source and public docs | Prominent         | FR1, FR2, FR4      |
| Touch heading                      | Names the current root or drill-in action view.                               | Current source and tests       | Supporting        | FR1                |
| Touch action list                  | Groups touch actions using the spacious List presentation.                    | `component:List`               | Prominent         | FR1, FR3           |
| Touch action row                   | Presents one touch action or drill-in entry using ListItem.                   | `component:List`               | Prominent         | FR1, FR3, FR4      |
| Touch divider                      | Separates groups in the touch action list.                                    | `component:Divider`            | Supporting        | FR1, FR3           |

The `dropdown-menu` target intentionally appears on both alternative menu
surfaces. The radio element also carries Indicator's shared radio target, and
the pointer divider also carries Divider's target; their local targets remain
valid distinct contracts. Touch headings retain the shared `heading` target documented by Text rather
than adding a DropdownMenu-owned heading target.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Trigger button": {
    "delegatesTo": {"owner": "component:Button", "target": "button"}
  },
  "Trigger indicator icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Pointer menu surface": {"target": "dropdown-menu"},
  "Pointer action row": {"target": "dropdown-menu-item"},
  "Icon-rendered item icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Caller-rendered item start content": {
    "none": {
      "reason": "intentional: Arbitrary ReactNode item content is caller-owned and receives no DropdownMenu target."
    }
  },
  "Checkbox indicator": {
    "delegatesTo": {
      "owner": "component:Indicator",
      "target": "checkbox-indicator"
    }
  },
  "Radio indicator": {"target": "dropdown-menu-radio"},
  "Pointer section heading": {"target": "dropdown-menu-section-heading"},
  "Pointer divider": {"target": "dropdown-menu-divider"},
  "Pointer submenu indicator icon": {
    "target": "dropdown-menu-indicator-icon"
  },
  "Touch sheet frame": {
    "delegatesTo": {"owner": "component:BottomSheet", "target": "bottom-sheet"}
  },
  "Touch menu surface": {"target": "dropdown-menu"},
  "Touch heading": {
    "delegatesTo": {"owner": "component:Text", "target": "heading"}
  },
  "Touch action list": {
    "delegatesTo": {"owner": "component:List", "target": "list"}
  },
  "Touch action row": {
    "delegatesTo": {"owner": "component:List", "target": "list-item"}
  },
  "Touch divider": {
    "delegatesTo": {"owner": "component:Divider", "target": "divider"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, presentation-specific rows, and delegation rules.
- `architecture:interaction-modality` owns the shared pointer, touch, keyboard,
  and adaptive-presentation boundaries.
- `architecture:layer-runtime` owns the popover host, native light-dismiss
  reconciliation, anchor positioning, and nested flyout layers. Touch
  presentation delegates hosting to BottomSheet.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering.
  The DropdownMenu root participates through its popover focus trap; the
  composed BottomSheet and DropdownMenuSubMenu retain their recorded local-only
  adoption gaps.
- `family:navigation-destinations` owns link-row destinations and blocked
  schemes (FR10).
- `spec:AST-094` owns the touch press, open, grow, entrance, and dismissal
  rules (FR5, FR8, FR11, FR21, FR22).

## Verification map

| Contract            | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Representative states                                                                  | Mutation or failure expectation                                                                                                                                                                                                                                                                  | Audit section                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| FR1, FR4            | `DropdownMenu.test.tsx` rendering cases ("renders menu with role=\"menu\"", "renders data-driven actions in a bottom sheet when requested", "uses the BottomSheet for adaptive presentation on compact touch", "uses the shared menu BottomSheet frame", "keeps adaptive presentation anchored without compact touch") and section, divider, and compound cases                                                                                               | Root pointer, root touch, adaptive                                                     | A missing surface, sheet frame, or menu role fails. Evidence gap: no test asserts the `dropdown-menu` target on the Touch menu surface or `list-item` on touch rows.                                                                                                                             | `audit:DropdownMenu/anatomy`       |
| FR2                 | `DropdownMenu.test.tsx` theming-slot cases ("exposes a themeable slot on the section heading", "exposes a themeable slot on the menu divider"); `DropdownMenuSubMenu.test.tsx` "exposes a themeable slot on the submenu indicator icon"; `themingTargets.test.ts`                                                                                                                                                                                             | Heading, divider, submenu indicator                                                    | A missing heading, divider, or indicator target fails; a rendered class absent from the documented targets fails. Evidence gap: no test asserts `dropdown-menu`, `dropdown-menu-item`, or `dropdown-menu-radio` placement.                                                                       | `audit:DropdownMenu/theming`       |
| FR3                 | `DropdownMenu.test.tsx` button customization, icon-only, and hasChevron cases                                                                                                                                                                                                                                                                                                                                                                                 | Button variants and sizes; icon-only; no chevron                                       | A Button prop that stops reaching the trigger fails. Evidence gap: the delegated Trigger Button gaps are asserted by `component:Button`'s own records, and no test here asserts the BottomSheet, List, Indicator, or Icon delegation beyond rendering.                                           | `audit:DropdownMenu/theming`       |
| FR5                 | `DropdownMenu.test.tsx` press-model cases ("a finger that lands on one row and lifts on another acts on the second, once", "a mouse released outside closes the menu; a finger released outside leaves it open", "marks the menu as carrying the press model and owns touch scrolling"); `MenuPress.a11y.chromium.spec.ts`; the module record's own map                                                                                                       | Finger and mouse release; scrolling menu                                               | A row that acts on press-down, a mouse release outside that keeps the menu, or a missing press marker fails.                                                                                                                                                                                     | `audit:DropdownMenu/behavior`      |
| FR6                 | `DropdownMenu.test.tsx` focus-return cases ("restores focus to the trigger after keyboard dismissal", "returns focus to the trigger after pointer dismissal without a focus ring", "leaves focus on the control a press outside landed on") and the "focus return after a pointer pick" and "a trigger the caller renders" cases                                                                                                                              | Keyboard and pointer close; Button and custom trigger                                  | A lost focus return, a ring after a pointer close, no ring after a keyboard close, or focus pulled off a control pressed outside fails.                                                                                                                                                          | `audit:DropdownMenu/accessibility` |
| FR7                 | `DropdownMenu.test.tsx` menuMaxHeight cases                                                                                                                                                                                                                                                                                                                                                                                                                   | A cap above 300px; viewport bound                                                      | A menu clipped to 300px under a raised cap, or one that escapes the viewport, fails. Evidence gap: no test asserts that the touch sheet ignores the cap.                                                                                                                                         | `audit:DropdownMenu/layout`        |
| FR8                 | `DropdownMenu.test.tsx` press-model trigger cases ("a mouse press on the trigger opens the menu and a drag-release acts on the row under it", "the opening release before the settle time acts on nothing and the menu stays", "pressing the trigger of an open menu closes it and does not reopen it in the same gesture", "a held touch on the trigger opens with the finger down and a slide picks", "a tap on the trigger still opens through its click") | Mouse press-open; held finger; tap                                                     | A mouse that opens only on click, an opening release that acts early, or a re-open in the closing gesture fails. The held-touch case asserts the current 500 ms hold, the FR8 gap pending conformance.                                                                                           | `audit:DropdownMenu/behavior`      |
| FR8                 | `DropdownMenuOpeningRelease.interaction.browser.spec.ts` (Chromium, WebKit): an opening release off the trigger, under a trigger that moved away, or on the trigger after a show that waited leaves the menu open; a settled release outside closes it                                                                                                                                                                                                        | Mouse release off the trigger                                                          | An opening release before the settle time that the browser's light dismiss closes fails                                                                                                                                                                                                          | `audit:DropdownMenu/behavior`      |
| FR9, AR1            | `DropdownMenu.test.tsx` custom trigger cases; `DropdownMenuSubMenu.test.tsx` "a menu hung off a custom trigger" cases                                                                                                                                                                                                                                                                                                                                         | Custom trigger open, keyboard, mouse, disabled; both props given; Back row names       | A custom trigger that does not open, toggle, or name the menu, a disabled one that opens, a missing warning, or a wrong Back row name fails.                                                                                                                                                     | `audit:DropdownMenu/accessibility` |
| FR10, AR2, ORD1     | `DropdownMenu.test.tsx` "DropdownMenuItem href" and "link rows — the browser's own clicks" cases                                                                                                                                                                                                                                                                                                                                                              | Plain, modified, middle, and right click; Enter; bottom sheet; disabled; blocked       | A row that is not an anchor, a modified click that runs `onClick`, a middle click that does not close, a disabled row with an address, or a live blocked destination fails. Evidence gap: no test asserts the order of `onClick`, close, and navigation.                                         | `audit:DropdownMenu/behavior`      |
| FR11, AR3           | `DropdownMenuSubMenu.test.tsx` "drill-in on a phone" cases; `DropdownMenuDrillIn.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                                                                                       | Phone and laptop; forced presentations; theme breakpoint; reset on close               | A flyout on a phone, a drill-in on a laptop by default, a wrong name, a Back that loses focus, or a drilled view that survives a close fails.                                                                                                                                                    | `audit:DropdownMenu/accessibility` |
| FR12, AR4           | `DropdownMenu.test.tsx` keyboard cases ("ArrowDown on the last row wraps to the first, ArrowUp on the first to the last", "ArrowUp on the trigger opens with the last row highlighted", "PageDown moves to the last row and PageUp back to the first", "the opening key's auto-repeat does not act on the highlighted row"), open-focus cases, typeahead cases, and "has aria-haspopup and aria-expanded attributes"                                          | Wrap, Page keys, open keys, auto-repeat, typeahead                                     | A missing wrap, a Page key that does not move, an ArrowUp open on the first row, an auto-repeat that acts, or a missing typeahead match fails. Evidence gap: no test asserts PageDown past the visible rows, typeahead ignoring chords or composition, or `aria-controls` on the Button trigger. | `audit:DropdownMenu/accessibility` |
| FR13                | `DropdownMenuSubMenu.test.tsx` safe-triangle cases                                                                                                                                                                                                                                                                                                                                                                                                            | Diagonal path, pause inside, leaving both                                              | A flyout that closes inside the triangle or stays open after leaving it fails.                                                                                                                                                                                                                   | `audit:DropdownMenu/behavior`      |
| FR14                | `DropdownMenu.test.tsx` section cases                                                                                                                                                                                                                                                                                                                                                                                                                         | Titled and untitled sections                                                           | A missing group role or title fails.                                                                                                                                                                                                                                                             | `audit:DropdownMenu/accessibility` |
| FR15, AR5           | `DropdownMenu.test.tsx` header and footer cases, including the hidden-control, open-sub-menu, and header radio-group cases; `MenuHeaderFooter.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                          | Regions present and absent; hidden controls; open flyout; custom trigger; bottom sheet | A region inside the menu, a missing or unnamed dialog, a wrong `aria-haspopup`, a Tab that leaves the popover, a hidden control taken as a stop, or a region whose keys the menu takes fails.                                                                                                    | `audit:DropdownMenu/accessibility` |
| FR17, AR6           | DropdownMenu, MoreMenu, ContextMenu and NavHeadingMenu keyboard tests, plus a real-browser keyboard check of focus order and blocked activation and a real-browser accessibility-tree check that a focused disabled row is announced as disabled (`spec:AST-085` Platform support); disabled-row cases                                                                                                                                                        | Disabled rows                                                                          | A disabled row that runs a caller handler, closes the menu, is skipped by the arrow keys or type-ahead, or is not announced as disabled fails.                                                                                                                                                   | `audit:DropdownMenu/accessibility` |
| FR20, AR7           | `DropdownMenuSubMenu.test.tsx` header and footer cases, including "on a phone"; `SubMenuHeaderFooter.a11y.chromium.spec.ts`; `ContextMenu.test.tsx` "shows a sub-menu with a header or footer as its rows alone, and says why in development"                                                                                                                                                                                                                 | Fine pointer and phone; Escape paths; nested flyouts; pointer leaving                  | A region inside a menu, an unnamed dialog, a Tab walk that does not wrap, an Escape that closes the root, or a flyout that closes while focus is inside fails.                                                                                                                                   | `audit:DropdownMenu/accessibility` |
| FR21                | Evidence gap: no test, matching the FR21 gap                                                                                                                                                                                                                                                                                                                                                                                                                  | —                                                                                      | —                                                                                                                                                                                                                                                                                                | `audit:DropdownMenu/behavior`      |
| FR22                | `DropdownMenu.test.tsx` "DropdownMenu entrance under a finger" cases; `useMenuPress.test.tsx` "an input hold over the menu" cases; `DropdownMenuEntranceHold.interaction.browser.spec.ts`                                                                                                                                                                                                                                                                     | A tap outside and a finger's slide while the menu enters; a mouse click                | A tap during the entrance that closes the menu, clicks the page or moves focus, a slide that picks nothing, or a held mouse fails.                                                                                                                                                               | `audit:DropdownMenu/behavior`      |
| FR23                | `DropdownMenu.test.tsx` Tab cases; `DropdownMenuSubMenu.test.tsx` "Tab from a flyout leaves the whole menu" suite                                                                                                                                                                                                                                                                                                                                             | top level, one and two levels down, Shift+Tab                                          | A Tab that leaves any level open, a second `onOpenChange(false)`, or a prevented Tab fails.                                                                                                                                                                                                      | `audit:DropdownMenu/accessibility` |
| PR1                 | Evidence gap: no test asserts the listener and observer bounds                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                      | —                                                                                                                                                                                                                                                                                                | `audit:DropdownMenu/behavior`      |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                 | Canonical anatomy and targets                                                          | Missing, extra, prefixed, stale, or alias-backed mappings fail repository validation.                                                                                                                                                                                                            | `audit:DropdownMenu/theming`       |

## Current-state impact

- **Finger press-open (FR8).** A held finger opens the menu after a 500 ms
  hold, and a tap at its click, instead of as `spec:AST-094` FR29 states.
- **Touch grow and pan dismissal (FR21).** Under a finger the menu appears and
  leaves with the layer's own entrance and exit instead of growing out of and
  back into the Trigger button, and a pan that starts outside does not close
  it, against `spec:AST-094` FR31 and FR32.
- **Still mouse after a finger (FR22).** Known gap: after a finger, a still
  mouse's first press does nothing unless the mouse rests where the page last
  heard it when the entering menu's shield came up.
- **Delegated Trigger Button gaps (FR3).** The Trigger button scales on a press
  under reduced motion and holds a fixed height, as `component:Button` records,
  against `design:reduced-motion` DR1 and `spec:AST-102` FR4.
- **Rich sheet heading for caller-rendered triggers (OQ2).** With
  `renderTrigger`, the bottom-sheet heading shows only the flattened text of
  the trigger's accessible name, and a trigger with no name gets no heading.
- **Deferred show.** When the menu's show waits for another popover operation,
  its opening release off the trigger closes it, against FR8.

## Decision log

### DEC-1 — Pointer dismissal returns focus to the trigger, ring suppressed

**Reference:** `component:DropdownMenu/DEC-1`

**Decider:** `cixzhang`, 2026-10-02

Blurring the trigger after a pointer dismissal would keep Safari from painting
a ring after a touch pick, but focus falling to the page loses a keyboard user
who reaches for the arrows next. Focus returns to the trigger and the shared focus-return visibility helper suppresses the ring
after pointer input (`architecture:interaction-modality` INV1), as the
bottom-sheet presentation already did. The press model's own decisions remain
in `module:DropdownMenu/useMenuPress`.

### DEC-2 — `menuMaxHeight` is a number of pixels

**Reference:** `component:DropdownMenu/DEC-2`
**Decider:** `cixzhang`, `2026-10-02`

`menuMaxHeight` replaces only the 300px term of the cap; the viewport gutters
still bound the menu, so a menu that must show all of its rows (a docked phone
menu of eleven 44px rows) can, without ever overflowing the screen. The dynamic
value uses `100dvb` alone; every browser with anchor positioning has it.

A prop rather than a theme variable, because the need is situational — one
menu with many rows — rather than a product-wide preference, and a prop reads
more clearly at the callsite that has the problem.

The value is a number of pixels. Rejected: an arbitrary CSS length (`50vh`,
`calc(...)`), which is product-shaped tuning on a shared component that
`spec:AST-002` does not admit, and which lets a caller write a cap the
viewport term cannot reason about.

### DEC-3 — Any control can open a menu

**Reference:** `component:DropdownMenu/DEC-3`

**Decider:** `cixzhang`, 2026-10-02

`renderTrigger` is a render prop handing the caller `DropdownMenuTriggerProps`
to spread, so the press model, the keyboard opens and the ARIA wiring ride the
same code path as the built-in Button, and the menu is named by the control
through `aria-labelledby`. `button` and `renderTrigger` are mutually exclusive
(a dev warning); the Button path is unchanged.

The prop is named for `spec:AST-055` DEC-5 and DEC-6: `render<X>` is the
prefix for every render prop in the system, and a bare `trigger` is already
public with a different shape on `Collapsible`, where it is a `ReactNode`
slot, so one word would otherwise mean two things.

Rejected: a content slot taking a rendered element. A slot cannot hand the
caller the props the control must carry, so the component would have to
reach into the element to attach them.

The open state reaches the caller's control as `aria-expanded` on the spread
props, and the prop's documentation shows styling from that attribute. A
pressed look keyed to `:active` is not a substitute: `:active` does not
behave the same under a coarse pointer, which is why menu rows drop
coarse-pointer `:active` paint entirely.

Rejected: an `as` prop on the Button — an icon button, a chip, an avatar and a
list row are not Button variants; a slot component — hides which props must
reach the control.

### DEC-4 — Sub-menus drill in on a phone

**Reference:** `component:DropdownMenu/DEC-4`

**Decider:** `cixzhang`, 2026-10-02

A flyout beside a phone-width menu has no room. When a compact touch display
opened the menu — sampled once, as it opens, so the menu never changes shape
under a pointer — a sub-menu row pushes its view onto a stack the root keeps
(`useMenuDrillIn`, internal) and the root shows that view in place of its rows:
a "Back to <parent>" row, then the sub-menu's rows, inside the same menu box.
The sub-menu portals its list into the root's host so the row stays mounted,
its rows stay live, and Back has something to return focus to; sibling rows
and dividers need no knowledge of it. Works in compound and data mode and in
`ContextMenu`; `presentation` overrides the policy.

The query is `COMPACT_TOUCH_PRESENTATION_QUERY`, the one the root
presentation already uses to decide its bottom sheet, so one component
carries one meaning of "adaptive". A bare `(pointer: coarse)` disagreed with
it on a large touch tablet: the menu stayed an anchored popover while its
sub-menus replaced rows in place, a combination nobody designed.

The public surface is `presentation` alone. `useMenuDrillIn` and its
`DropdownMenuDrillIn` view-stack controller stay internal: exporting them
would make internal machinery permanent API that nothing here requires a
caller to touch. A product that later needs to drive the stack earns a
deliberate component or hook then, with its own contract.

Rejected: a flipped flyout — lands over the parent rows and reads as a second
menu; drill-in in data mode only — every menu in the app is compound; a
`{label, children}` snapshot pushed onto the stack — unmounts the row and
breaks focus return.

### DEC-6 — A titled group of rows is `DropdownMenuGroup`

**Reference:** `component:DropdownMenu/DEC-6`

**Decider:** `cixzhang`, 2026-10-03

Data mode could title a run of rows through `{type: 'section', title}` and
compound mode could not, so the menus that most need grouping — checkbox
rows, radio groups, rows mounted conditionally, all of which must be
compound — left a screen reader a run of loose rows where a sighted user saw
two clusters. The compound peer names its rows through `aria-labelledby` on
the visible heading and reuses the `dropdown-menu-section-heading` treatment,
so one heading looks and reads the same in both modes.

The component is named for the `role="group"` it renders. The data model
keeps `DropdownMenuSection` for its `{type: 'section'}` entry: the two words
describe the same concept, and one name across both would collide with that
exported type. Rejected: renaming the component to `DropdownMenuSection`,
which collides; renaming both, which breaks a public type for a wording
change.

`title` is `ReactNode`. A rich heading is a legitimate need, and the data
mode's string title is the narrower case rather than the model to match. A
focusable node inside a heading lands in the group but outside the roving
focus order, so the arrow keys cannot reach it; the type does not prevent
that and a case pins the behavior instead.

### DEC-8 — Controls beside the rows go in `header` and `footer`

**Reference:** `component:DropdownMenu/DEC-8`
**Decider:** `cixzhang`, 2026-10-11

`role="menu"` admits only menu items, groups and separators. A filter field
or a "Create" button placed among the rows makes the menu invalid to a screen
reader, and makes the menu's key handling and press model fight the control.
The control belongs beside the menu, not in it. `header` and `footer` place it
there: in the same popover or sheet, outside the menu element. Outside the
menu element, the menu never claims the control's keys or presses. Because
`children` stay rows only, nothing can be placed between rows; the component
needs no inspection of its children to keep that true.

The menu becomes one Tab stop between the regions, so the popover reads as
one Tab sequence: header, menu, footer, inside the dialog of DEC-10. Focus on
open is unchanged. Rejected:
letting the menu's handlers step aside for controls placed among the rows —
that makes invalid structure work instead of fixing it; and a caller-wrapped
items element, which leaves "nothing between the rows" to convention.

### DEC-9 — The trigger is a Menu Button, arrow-key opening included

**Reference:** `component:DropdownMenu/DEC-9`
**Decider:** `cixzhang`, `2026-10-13`

The pointer trigger already plays the Menu Button's role, so it carries the pattern's required parts (AR4). ArrowDown and ArrowUp opening go beyond the adoption rule's required set and stay as a named exception because the component shipped them (FR12 keeps the wrap once the menu is open) and removing a working keyboard path would cost the users who have it. ContextMenu and NavMenu are not covered by this decision.

Rejected: dropping arrow-key opening to match the rule's default; adopting the pattern for every control that opens any layer.

### DEC-10 — A popover with a header or footer is a modal dialog, and Tab wraps

**Reference:** `component:DropdownMenu/DEC-10`
**Decider:** `cixzhang`, 2026-10-13

A popover that holds a menu and controls that are not menu items is not a
menu: a trigger exposing `aria-haspopup="menu"` promises a menu, and the
popover then holds a field or a button that is not one. With `header` or
`footer`, the popover is therefore exposed as a named modal dialog with the
menu inside it, the trigger says `aria-haspopup="dialog"`, and
`aria-controls` names the popover that holds the dialog. Moving the
menu role inward keeps every row a menu item and every other control outside
the menu. Tab and Shift+Tab wrap within the dialog, as the APG Dialog
pattern requires; Escape and a press outside close it. Without either prop
the component is unchanged: a Menu Button whose Tab closes the menu. Rejected:
closing on Tab past either end, which leaves a modal dialog by Tab.

### DEC-11 — A disabled menu row is reached by the keyboard and stays inert

**Reference:** `component:DropdownMenu/DEC-11`
**Decider:** `cixzhang`, owner decision, 2026-11-04

In a menu, a disabled row stays in the keyboard path so a person learns it
exists and why it is unavailable, as the WAI-ARIA Menu pattern and its keyboard
guidance recommend for disabled menu items. Arrow keys, Home, End and
type-ahead visit it; it takes focus and is announced as disabled; it does
nothing when activated and does not close the menu. Opening a menu from the
keyboard still lands on an enabled row: the first, or the last after ArrowUp
on the trigger. The rule covers DropdownMenu, its sub-menus, MoreMenu,
ContextMenu and NavHeadingMenu; other menus are out of scope for this decision.
Other composites, such as a toolbar, a button group or a
listbox, keep their own navigation. Rejected: skipping disabled rows, which
hides an unavailable action and its reason from keyboard and screen-reader
users.

## Open questions

- **OQ2 — Rich sheet heading for caller-rendered triggers.** (`human-api`)
  With `renderTrigger`, the bottom-sheet heading and the dialog's name come from
  the trigger's accessible name read from the page, so a rich trigger (an avatar
  and a name, an icon and a label) shows only flattened text in the sheet
  heading, and a trigger with no name gets no heading. Open: whether
  DropdownMenu takes an explicit heading (a node), reuses the trigger's rendered
  content, or keeps the plain-text name; and whether that name should come from
  an explicit source rather than a read from the page.

## Content boundary

This file does not duplicate consumer prop tables, item examples, focus and
positioning algorithms, implementation steps, or shared modality, layer,
dismissal, and theming rules. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuCheckboxItem.spec.md -->


# DropdownMenuCheckboxItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One pointer-menu row that toggles an independent boolean: `label`, `description`, `icon`, `endContent`, controlled `value` and `onChange`, `isDisabled`, `hasCloseOnSelect` (default `false`), root inputs, and a ref. |
| Behavior                | The row is one `menuitemcheckbox` whose `aria-checked` is its `value`; an enabled activation reports `!value` and keeps the menu open unless asked to close; a disabled row is inert.                                  |
| End-user impact         | People toggle options without the menu closing on each change, and screen-reader users hear one checkbox per row.                                                                                                      |
| Builder impact          | Builders own the value; the row composes their click and pointer-move handlers with its own activation and hover focus.                                                                                                |
| Compatibility/readiness | Records shipped behavior; no API change; a disabled row gains `tabindex="-1"` (FR3). Enter keeping the menu open is listed under Current-state impact (OQ1).                                                           |
| Review checks           | Reject a nested announced checkbox, a row that closes by default, a dropped caller handler, or an activation while disabled.                                                                                           |
| Governing rules         | `spec:AST-020` FR15; `architecture:public-component-api` INV5–INV8; `architecture:interaction-modality`.                                                                                                               |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuCheckboxItem renders one compound-mode row that toggles an
independent boolean inside the pointer presentation of DropdownMenu.
DropdownMenu owns focus movement, typeahead, keyboard click synthesis, and the
close lifecycle.

## Compatibility and migration

- Released default preserved: yes (`hasCloseOnSelect=false`).
- Compatibility class: records shipped behavior; no public prop or export
  change; a disabled row gains `tabindex="-1"` (FR3).
- Controlled/uncontrolled behavior: controlled; `value` is caller-owned.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="menuitemcheckbox"` root, its `aria-checked`, label, description,
  icon, end content, disabled state, ref, supported host inputs, and styling
  inputs.
- Activation: reporting `!value`, the close policy, and composing the caller's
  click and pointer-move handlers.
- The decorative checkbox marker and the row's `dropdown-menu-item` target.

**Does not own / non-goals**

- Focus entry, roving focus, typeahead, and Enter/Space click synthesis — owned
  by `component:DropdownMenu`.
- Checkbox chrome — delegated to `component:Indicator`.
- How the keyboard reaches a disabled row — `component:DropdownMenu` FR17.

## Public concepts

| Concept       | Closed values or states | Meaning                                    | Availability      | Default     | Owner     | Stability | Invalid-value behavior        |
| ------------- | ----------------------- | ------------------------------------------ | ----------------- | ----------- | --------- | --------- | ----------------------------- |
| Checked state | `true`, `false`         | The boolean the row shows and toggles.     | Every row         | required    | caller    | stable    | Required by the public type.  |
| Close policy  | close; remain open      | Whether an enabled toggle closes the menu. | Every enabled row | remain open | component | stable    | Omission keeps the menu open. |
| Availability  | enabled; disabled       | Whether the row can activate.              | Every row         | enabled     | component | stable    | Disabled blocks activation.   |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| FR1 | The row renders one element with `role="menuitemcheckbox"` whose `aria-checked` equals `value`; the checkbox marker is decorative (`aria-hidden`), so the row is the only announced control.                                                                                                                                                                                                                                                                                             | `spec:AST-020` FR15; current source and tests                                |
| FR2 | An enabled activation, by pointer or by the parent's synthesized Enter/Space click, calls `onChange(!value)`, then closes the menu when `hasCloseOnSelect` is set, then calls the caller's `onClick`; without `hasCloseOnSelect` the menu stays open. The APG Menu pattern's Enter closes the menu, and `spec:AST-020` FR15 requires this record to name any required part it does not adopt. Implementation gap: Enter keeps the menu open by default, and no exception is named (OQ1). | `spec:AST-020` FR15; `architecture:public-component-api` INV7; current tests |
| FR3 | A disabled row exposes `aria-disabled="true"`, carries `tabindex="-1"` like an enabled row so the parent's keyboard model reaches it (`component:DropdownMenu` FR17), and on any activation calls neither `onChange` nor the caller's activation handlers and does not close the menu.                                                                                                                                                                                                   | Current source and tests                                                     |
| FR4 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` reach or compose on the row root; caller `onPointerMove` composes with the row's hover focus.                                                                                                                                                                                                                                                                                                            | `architecture:public-component-api` INV5–INV8; current tests                 |
| FR5 | The marker is the shared checkbox Indicator, `sm` in a small menu; the row carries the `dropdown-menu-item` target with the menu size.                                                                                                                                                                                                                                                                                                                                                   | `architecture:component-theming-surface`; current source and tests           |
| FR6 | The row adds no key handler or tab stop of its own: every row, disabled included, is `tabindex="-1"` for the parent's roving focus, and the parent's keyboard reaches a disabled row (`component:DropdownMenu` FR17).                                                                                                                                                                                                                                                                    | `architecture:interaction-modality`; parent tests                            |

### Allowed variation

- **AV1 — Content.** Label, description, icon, and end content are caller
  content.
- **AV2 — Theme paint.** Themes may restyle the row and marker targets.

### Representative states

| State           | Required invariant                     | Allowed variation      |
| --------------- | -------------------------------------- | ---------------------- |
| Unchecked       | `aria-checked="false"`; marker empty.  | Content.               |
| Checked         | `aria-checked="true"`; marker checked. | Content.               |
| Close on select | An enabled toggle closes the menu.     | —                      |
| Disabled        | `aria-disabled="true"`; no activation. | Content stays visible. |

### Transformation and precedence order

- **ORD1 — Activation.** Disabled guard → `onChange(!value)` → close when
  `hasCloseOnSelect` → caller `onClick`.

### Performance and resources

- **PR1 — Shared press listeners.** The row shares the press controller's
  window and document listeners; it adds no per-row listener, observer, timer,
  or request.

## Accessibility contract

- **AR1 — One checkbox control.** The row owns `menuitemcheckbox`, its
  accessible name, checked state, focus, and activation; the marker is
  decorative.
- **AR2 — Disabled state.** A disabled row is inert.
- **AR3 — Focus visibility.** Keyboard focus draws the shared focus ring
  inside the row, inset by the ring's own width, in every color mode, forced
  colors included; after pointer input the row shows only the overlay tint
  (`architecture:interaction-modality` INV1, INV3). The shared row treatment is
  `component:DropdownMenuItem` FR8.

## Design relationships

| Anatomy or state | Design requirement         | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------- | ------------------------ | -------------- | ------------------ |
| Row              | One full-width toggle row. | Current source           | Prominent      | FR1, FR5           |
| Marker           | Shows the checked state.   | `component:Indicator`    | Supporting     | FR1, FR5           |

The shared `DropdownMenu.doc.mjs` anatomy and `component:DropdownMenu` theming
anatomy map the row and checkbox indicator, so this record carries no
anatomy-theming map.

## Family and system relationships

- `component:DropdownMenu` owns the keyboard model and close lifecycle.
- `component:Indicator` owns the checkbox chrome.
- `architecture:public-component-api` owns root composition and handler order.

## Verification map

| Contract  | Verification                                                                                                                                                                                                                                                                                                                                                                        | Representative states                  | Mutation or failure expectation                                                                                                                       | Audit section                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| FR1, AR1  | `DropdownMenuSelectable.test.tsx` "keeps the checkbox indicator decorative (row is the only announced control)"; "a ref reaches the menuitemcheckbox element"                                                                                                                                                                                                                       | Checked and unchecked                  | An announced marker or a row that is not `menuitemcheckbox` fails.                                                                                    | `audit:DropdownMenuCheckboxItem/semantics`     |
| FR2, ORD1 | `DropdownMenuSelectable.test.tsx` "calls onChange with the toggled value on click", "composes the caller click handler with the checked-state change", "composes the caller click handler on keyboard activation", "closes after a successful toggle only when requested"; `DropdownMenu.test.tsx` "activates a focused menuitemradio with Enter and a menuitemcheckbox with Space" | Pointer and keyboard; close on and off | A wrong value, a dropped caller `onClick`, or a close without the opt-in fails. Evidence gap: no test asserts the `onChange`, close, `onClick` order. | `audit:DropdownMenuCheckboxItem/behavior`      |
| FR3, AR2  | `DropdownMenuSelectable.test.tsx` "does not call consumer activation handlers when disabled" and "does not toggle when disabled"                                                                                                                                                                                                                                                    | Disabled                               | A toggle, a close, or a caller handler while disabled fails. Evidence gap: no test asserts the disabled row's `tabindex="-1"`.                        | `audit:DropdownMenuCheckboxItem/behavior`      |
| FR4       | `DropdownMenuSelectable.test.tsx` "composes the caller pointer-move handler with menu hover focus" and "a ref reaches the menuitemcheckbox element"                                                                                                                                                                                                                                 | Ref; pointer move                      | A dropped ref or handler fails. Evidence gap: no test asserts host attributes, `className`, `style`, or `xstyle` on the row.                          | `audit:DropdownMenuCheckboxItem/api`           |
| FR5       | `DropdownMenuSelectable.test.tsx` "maps a small menu to the small shared checkbox marker"                                                                                                                                                                                                                                                                                           | Small menu                             | A marker that ignores the menu size fails. Evidence gap: no test asserts the `dropdown-menu-item` target on this row.                                 | `audit:DropdownMenuCheckboxItem/theming`       |
| FR6       | `DropdownMenu.test.tsx` "arrow navigation reaches consumer-rendered menuitemradio and menuitemcheckbox items" and the disabled-row keyboard cases (`component:DropdownMenu` FR17)                                                                                                                                                                                                   | Enabled and disabled rows              | A row the arrows miss, a disabled row they skip, or a disabled row that toggles or closes the menu fails.                                             | `audit:DropdownMenuCheckboxItem/accessibility` |
| AR3, PR1  | `DropdownMenuForcedColors.test.tsx` (the row's `:focus-visible` ring and token inset); `DropdownMenuAudit.a11y.chromium.spec.ts` forced-colors frames. Evidence gap: no test asserts the listener bound                                                                                                                                                                             | —                                      | —                                                                                                                                                     | `audit:DropdownMenuCheckboxItem/behavior`      |

## Current-state impact

- **Enter keeps the menu open (FR2).** Enter on a checkbox row toggles it and
  leaves the menu open by default, against the Menu pattern's Enter that
  `spec:AST-020` FR15 adopts, with no named exception (OQ1).

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Does a checkbox row keep the menu open on Enter as a named
  exception to the Menu pattern, or close like other rows?** (`human-api`)
  Keeping it open lets a person toggle several options in one visit; closing
  matches the pattern's Enter and the other row types.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or parent contracts. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuDivider.spec.md -->


# DropdownMenuDivider component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `DropdownMenuDivider` / `DropdownMenuDividerProps`, plus the `ContextMenuDivider` and `BreadcrumbMenuDivider` aliases and their props; `BaseProps<HTMLDivElement>` minus caller-owned `role` and `aria-orientation`; a root `ref`. |
| Behavior                | One unlabelled horizontal separator divides pointer-menu rows and stays out of arrow-key order; data and compound pointer modes render the same component.                                                                         |
| End-user impact         | Pointer-menu sections remain visually separated without adding a focus stop or changing row operation.                                                                                                                             |
| Builder impact          | No new caller choice. Host attributes, handlers, and styling inputs continue to compose on the separator.                                                                                                                          |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change.                                                                                                                                                                          |
| Review checks           | Reject a focusable separator, changed role/orientation, pointer data/compound divergence, dropped root inputs, or a target moved off the visible separator.                                                                        |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; `spec:AST-020`.                                                                                                            |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuDivider provides the visual and programmatic boundary between groups
of rows in pointer-menu presentations. It ships directly under the DropdownMenu
name and through ContextMenu and Breadcrumbs aliases. It owns the separator
semantics, menu spacing, root input composition, and the
`dropdown-menu-divider` theme target. The surrounding DropdownMenu, ContextMenu,
or BreadcrumbItem owns menu lifecycle and row navigation; Divider supplies the
base rule geometry and paint.

Consumer syntax and examples belong in `DropdownMenuDivider.doc.mjs`.

## Compatibility and migration

- Released default preserved: yes — one horizontal, unlabelled separator.
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One horizontal separator root and its public ref, DOM/data/ARIA, class, style,
  event, and `xstyle` composition.
- Menu-specific block-axis spacing.
- The `dropdown-menu-divider` target on the same visible root.
- Pointer-menu data/compound rendering parity for the divider row across
  DropdownMenu, ContextMenu, and breadcrumb menus.

**Does not own / non-goals**

- Menu open state, focus entry, row activation, or arrow-key navigation — owned by
  DropdownMenu, ContextMenu, BreadcrumbItem, and their shared hooks.
- Touch and bottom-sheet data dividers — those presentations render Divider
  directly and are owned by their parent menu surface.
- Base separator rule geometry and token paint — delegated to Divider.
- Caller-authored grouping meaning — owned by the product callsite.

## Public concepts

| Concept       | Closed values or states                       | Meaning                                                                        | Availability by variant/orientation/state | Default                | Owner                | Stability | Invalid-value behavior                                                          |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- | ---------------------- | -------------------- | --------- | ------------------------------------------------------------------------------- |
| Separator row | one horizontal unlabelled separator           | Divides adjacent pointer-menu row groups without becoming a row or focus stop. | Data and compound pointer-menu modes      | present where authored | component            | stable    | Role and orientation are excluded from caller props and remain component-owned. |
| Root surface  | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the separator root while preserving component semantics.               | Every separator row                       | omitted                | public component API | stable    | Accepted inputs compose; role and orientation remain authoritative.             |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                     | Basis                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1 | The component renders one unlabelled horizontal separator with pointer-menu-specific block spacing.                                                                           | Released source/docs and focused tests                             |
| FR2 | The root exposes `role="separator"` and `aria-orientation="horizontal"`, stays outside menu-item collection and arrow-key order, and is never focusable.                      | `spec:AST-020`; current tests                                      |
| FR3 | In pointer-menu presentation, `{type: "divider"}` in the data API and the compound divider component or alias render the same component DOM, spacing, semantics, and targets. | Released docs/source; data/compound parity test                    |
| FR4 | The visible root carries both the delegated `divider` target and the menu-specific `dropdown-menu-divider` target; menu spacing applies before caller `xstyle`.               | `architecture:component-theming-surface`; current source and tests |
| FR5 | Accepted ref, DOM/data/ARIA, class, style, events, and `xstyle` reach or compose on the separator root without replacing component-owned role or orientation.                 | `architecture:public-component-api` INV5–INV8; current tests       |

### Allowed variation

- **AV1 — Theme paint.** The delegated Divider and menu-specific targets may restyle
  their owned surface without changing separator semantics or focus behavior.
- **AV2 — Caller root inputs.** Supported host attributes, handlers, and styling
  inputs may vary while the owned role and orientation remain fixed.

### Representative states

| State                     | Required invariant                                                   | Allowed variation                                             |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| Pointer data-mode divider | One horizontal separator between data-driven rows.                   | Adjacent row content and active theme may vary.               |
| Pointer compound divider  | DOM and behavior match the pointer data-mode divider.                | Host attributes and supported styling inputs may be supplied. |
| Public aliases            | ContextMenuDivider and BreadcrumbMenuDivider render this component.  | The containing menu owns lifecycle and navigation.            |
| Touch data divider        | Outside this component; the parent surface renders Divider directly. | Touch-menu layout follows the parent contract.                |
| RTL                       | The horizontal, full-width rule remains direction-neutral.           | Surrounding text and menu alignment may mirror.               |
| Narrow viewport           | The rule remains inside the menu without horizontal overflow.        | Menu width follows its owner.                                 |

### Transformation and precedence order

- **ORD1 — Root composition.** Apply menu spacing, then caller `xstyle`; combine the
  menu-specific target class with caller `className`; preserve caller `style` and
  host props; keep role and orientation component-owned.

### Performance and resources

- **PR1 — No external lifecycle.** DropdownMenuDivider installs no listener,
  observer, timer, request, state machine, or Effect.

## Accessibility contract

- **AR1 — Separator semantics.** The root exposes a horizontal separator and no
  interactive role or tab stop.
- **AR2 — Navigation exclusion.** Menu navigation collects menu-item roles only, so
  ArrowDown and ArrowUp pass across the separator without focusing it.

## Design relationships

| Anatomy or state | Design requirement                                                              | Representation authority                                                              | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------- | ------------------ |
| Menu separator   | Visually separates adjacent menu row groups without competing with row content. | Current source and delegated Divider tokens; no component-local visual decision added | supporting     | FR1–FR4            |

No component-local visual decision is recorded.

## Family and system relationships

- `architecture:public-component-api` owns exports and root input composition.
- `architecture:component-theming-surface` owns target placement and composed target
  ownership.
- `architecture:component-test-sufficiency` owns proportionate, observable evidence.
- DropdownMenu exports the implementation directly. ContextMenu and Breadcrumbs
  re-export it as `ContextMenuDivider` and `BreadcrumbMenuDivider`, with matching
  props aliases; their pointer presentations retain the same component contract.
- Touch and bottom-sheet data dividers bypass this component and delegate directly
  to Divider under the parent menu contract.
- Divider provides the base separator implementation.

## Verification map

| Contract           | Verification                                                                                                                                                                                                                                                                                                                                                                                                     | Representative states                                     | Mutation or failure expectation                                                                                                                                                                                          | Audit section                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| FR1, FR2, AR1, AR2 | `DropdownMenu.test.tsx` divider and parity cases ("renders dividers between items", "renders an identical divider from either mode", "skips a compound divider in the arrow-key order", "forwards host attributes to a compound divider while keeping its role"); `ContextMenu.test.tsx` divider cases; `Breadcrumbs.test.tsx` "renders the separator and props types through the BreadcrumbMenuDivider aliases" | Data and compound pointer menus; aliases; arrow traversal | A missing separator, a changed role, a separator in the arrow-key order, or a lost alias fails. Evidence gap: no test asserts `aria-orientation` or the menu block spacing.                                              | `audit:DropdownMenuDivider/semantics` |
| FR3                | `DropdownMenu.test.tsx` "renders an identical divider from either mode"                                                                                                                                                                                                                                                                                                                                          | Data and compound                                         | Different DOM between the modes fails.                                                                                                                                                                                   | `audit:DropdownMenuDivider/behavior`  |
| FR4, FR5           | `DropdownMenu.test.tsx` "composes the complete public root surface on the separator" and the parity case's `dropdown-menu-divider` class assertion; `themingTargets.test.ts`                                                                                                                                                                                                                                     | Ref, class, style, xstyle, handler                        | A dropped ref, class, style, `xstyle`, or handler, or a missing `dropdown-menu-divider` target, fails. Evidence gap: no test asserts the delegated `divider` target or that menu spacing applies before caller `xstyle`. | `audit:DropdownMenuDivider/api`       |
| PR1                | Evidence gap: no test asserts the absence of lifecycle resources                                                                                                                                                                                                                                                                                                                                                 | —                                                         | —                                                                                                                                                                                                                        | `audit:DropdownMenuDivider/behavior`  |

## Decision log

No component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or system rules. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuGroup.spec.md -->


# DropdownMenuGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | A compound-mode group of rows with an optional `title`, `children`, root inputs, and a ref.                                                                                                |
| Behavior                | Renders one `role="group"` named by its visible heading; the heading is plain text that roving focus and typeahead skip. An untitled group is an unnamed group unless the caller names it. |
| End-user impact         | Screen-reader users hear a titled cluster of rows as one named group, as sighted users see it; arrow keys move across group boundaries as if the rows were flat.                           |
| Builder impact          | Builders title compound rows with the same heading look as a data-mode section.                                                                                                            |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change.                                                                                                                                  |
| Review checks           | Reject a heading that becomes a menu item or a focus stop, a titled group not named by its heading, or a lost section-heading target.                                                      |
| Governing rules         | `component:DropdownMenu/DEC-6`; `architecture:public-component-api`; `architecture:component-theming-surface`.                                                                             |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuGroup gives compound-mode menus the titled grouping that data-mode
`{type: 'section'}` entries already have (`component:DropdownMenu/DEC-6`).

## Compatibility and migration

- Released default preserved: yes.
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="group"` root, its name from the heading, and the heading itself
  with the `dropdown-menu-section-heading` target.
- Root composition of ref, host attributes, and handlers.

**Does not own / non-goals**

- Roving focus and typeahead — owned by `component:DropdownMenu`.
- The rows inside — owned by each row component.
- Focusable content inside the heading: arrow keys cannot reach it.

## Public concepts

| Concept | Closed values or states | Meaning                                 | Availability  | Default | Owner     | Stability | Invalid-value behavior                            |
| ------- | ----------------------- | --------------------------------------- | ------------- | ------- | --------- | --------- | ------------------------------------------------- |
| Title   | absent; any React node  | A visible heading that names the group. | Compound mode | absent  | component | stable    | Absent renders no heading and no name of its own. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                    | Basis                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| FR1 | With a `title`, the group is one `role="group"` whose `aria-labelledby` names its visible heading; the heading carries `dropdown-menu-section-heading`, is plain text rather than a menu item, and is skipped by roving focus and typeahead. | DEC-6 of `component:DropdownMenu`; current tests   |
| FR2 | Without a `title`, the group is an unnamed `role="group"`, or takes the name a caller supplies.                                                                                                                                              | Current tests                                      |
| FR3 | Arrow keys step across a group boundary as if the rows were flat; a focusable node inside the heading is not reachable by them.                                                                                                              | Current tests                                      |
| FR4 | A ref and host attributes and handlers reach the group element while it keeps its role and heading name.                                                                                                                                     | `architecture:public-component-api`; current tests |

### Allowed variation

- **AV1 — Heading content.** The title may be any React node.

### Representative states

| State    | Required invariant               | Allowed variation |
| -------- | -------------------------------- | ----------------- |
| Titled   | Named by its heading.            | Title content.    |
| Untitled | Unnamed, or named by the caller. | —                 |

### Transformation and precedence order

- **ORD1 — Name.** Title heading → caller name → none.

### Performance and resources

- **PR1 — Render only.** The group owns no state, effect, listener, or
  observer.

## Accessibility contract

- **AR1 — Named group.** A titled group is announced with its heading's text;
  the heading is not a menu item.

## Design relationships

| Anatomy or state | Design requirement                                         | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Heading          | Labels a cluster of rows like a data-mode section heading. | `component:DropdownMenu` | Supporting     | FR1                |

`component:DropdownMenu` maps the `dropdown-menu-section-heading` target in its
theming anatomy, so this record carries no anatomy-theming map.

## Family and system relationships

- `component:DropdownMenu` owns the keyboard model and the section-heading
  target mapping.
- `architecture:public-component-api` owns root composition.

## Verification map

| Contract       | Verification                                                                                                                                                                                                                                               | Representative states                    | Mutation or failure expectation                                                                                       | Audit section                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1, AR1, ORD1 | `DropdownMenu.test.tsx` DropdownMenuGroup cases ("renders a role=\"group\" named by its heading", "renders the heading with the data-mode theme class", "the heading is not a menuitem and roving focus skips it", "typeahead never lands on the heading") | Titled group                             | A group not named by its heading, a missing heading target, or a heading that takes focus or a typeahead match fails. | `audit:DropdownMenuGroup/semantics`     |
| FR2            | `DropdownMenu.test.tsx` "an untitled group is an unnamed role=\"group\"" and "an untitled group takes a caller-supplied accessible name"                                                                                                                   | Untitled, with and without a caller name | A name invented for an untitled group, or a dropped caller name, fails.                                               | `audit:DropdownMenuGroup/semantics`     |
| FR3            | `DropdownMenu.test.tsx` "arrow navigation steps across a group boundary as if the rows were flat" and "a focusable node in the heading is not reachable by the arrow keys"                                                                                 | Two groups; focusable heading content    | A stop at the boundary or a focusable heading node reached by arrows fails.                                           | `audit:DropdownMenuGroup/accessibility` |
| FR4            | `DropdownMenu.test.tsx` "forwards a ref to the group element" and "forwards host attributes to the group while keeping its role and heading name"                                                                                                          | Ref; host attributes                     | A dropped ref or attribute, or a replaced role or name, fails.                                                        | `audit:DropdownMenuGroup/api`           |
| PR1            | Evidence gap: no test asserts the absence of lifecycle resources                                                                                                                                                                                           | —                                        | —                                                                                                                     | `audit:DropdownMenuGroup/behavior`      |

## Decision log

No component-local decision; `component:DropdownMenu/DEC-6` decides the
component.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or parent contracts. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuItem.spec.md -->


# DropdownMenuItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One compound pointer-menu row for an action or destination, with label, supporting content, disabled state, destructive paint, optional close suppression, root inputs, and a forwarded ref.       |
| Behavior                | The parent menu owns roving focus and keyboard activation; the row owns click order, disabled suppression, close-on-select, destination handoff, hover focus, and its visible content composition. |
| End-user impact         | Actions and destinations preserve keyboard, pointer, and browser link behavior while unavailable rows remain inert and destructive actions remain identifiable.                                    |
| Builder impact          | Destinations use `href`; supporting content stays non-interactive; `hasCloseOnSelect=false` is reserved for in-place result feedback.                                                              |
| Compatibility/readiness | Records shipped behavior; no API change; a disabled row gains `tabindex="-1"` (FR7).                                                                                                               |
| Review checks           | Reject nested controls, disabled activation, lost destination safety, broken modified-click behavior, dropped root inputs, a second keyboard owner, or state/target reflection moved off the row.  |
| Governing rules         | `family:navigation-destinations/FR1–FR5`; `architecture:public-component-api/INV5–INV9`; `architecture:component-theming-surface/INV3–INV6`; `spec:AST-020/FR1,FR2,FR6,FR15`.                      |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuItem renders one compound-mode row in the pointer presentation of
DropdownMenu. It owns the row element, content slots, action-versus-destination
branch, activation order, disabled and destructive state, root composition, and
`dropdown-menu-item` theme target. DropdownMenu owns the surrounding menu,
keyboard collection, focus movement, typeahead, presentation choice, and close
lifecycle.

## Compatibility and migration

- Released default preserved: yes.
- Compatibility class: records shipped behavior; no public prop or export
  change; a disabled row gains `tabindex="-1"` (FR7).
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="menuitem"` root and its label, description, icon, end content,
  disabled state, destructive variant, ref, supported host inputs, and styling inputs.
- Action callback order and `hasCloseOnSelect` behavior.
- Link-row rendering, destination handoff, modified/middle-click preservation,
  target and relationship handling, and disabled-link inertness.
- Pointer hover focus and the row's press/hover/focus paint.
- The `dropdown-menu-item` target and its size/variant state reflection.

**Does not own / non-goals**

- Menu naming, open/close state, focus entry, roving focus, typeahead, and keyboard
  click synthesis — owned by DropdownMenu and its shared hooks.
- Touch and bottom-sheet row rendering — the parent presentation delegates those
  rows to List.
- Destination acceptance and blocking — owned by `family:navigation-destinations`.
- Interactive controls inside label, description, or end content. Controls belong
  beside the menu or as separate rows.

## Public concepts

| Concept      | Closed values or states                             | Meaning                                                                                 | Availability                | Default | Owner                           | Stability | Invalid-value behavior                                              |
| ------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------- | ------- | ------------------------------- | --------- | ------------------------------------------------------------------- |
| Row act      | action; destination                                 | Runs a callback or exposes a browser/router destination from the row itself.            | Every enabled row           | action  | component and navigation family | stable    | A blocked destination is inert; a disabled link has no href.        |
| Availability | enabled; disabled                                   | Controls whether the row can activate; a disabled row still takes keyboard focus (FR7). | Every row                   | enabled | component and parent menu       | stable    | Disabled suppresses activation and destination, not keyboard focus. |
| Close policy | close; remain open                                  | Whether successful activation closes the parent menu.                                   | Action and destination rows | close   | component                       | stable    | Omission closes.                                                    |
| Visual state | default; destructive; hover; focus; press; disabled | Paints row meaning and interaction state without changing menuitem semantics.           | Pointer row                 | default | component                       | stable    | Unknown variants are rejected by the public type.                   |
| Root surface | ref; DOM/data/ARIA; class/style/xstyle/events       | Extends the row root while preserving component-owned role and keyboard state.          | Every pointer row           | omitted | public component API            | stable    | Accepted inputs compose; owned role/tab stop remain fixed.          |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1 | The pointer row exposes one `role="menuitem"` root. Label, description, icon, and end content are presentational content of that row rather than nested controls.                                                                                                                                                                                                                                         | `spec:AST-020` FR15; current source and docs                       |
| FR2 | Enabled activation runs the row callback before optional close. Disabled rows expose `aria-disabled=true`, remove link destinations, and run neither callback nor close.                                                                                                                                                                                                                                  | Current behavior and tests                                         |
| FR3 | A destination row renders as the link root through LinkProvider. Plain activation runs the callback then closes and navigates; a modified click does not run the callback, closes the menu, and is left to the browser; a middle click closes the menu (`hasCloseOnSelect`), then runs the caller's `onAuxClick`; blocked schemes are inert.                                                              | `family:navigation-destinations` FR1–FR5; current tests            |
| FR4 | The parent menu is the only keyboard owner. It synthesizes click activation with modifiers, moves focus, and runs typeahead; the row focuses itself on mouse hover and creates no second roving-focus model.                                                                                                                                                                                              | `architecture:interaction-modality`; current parent tests          |
| FR5 | The visible root carries `dropdown-menu-item`; size and destructive state reflect on it (`data-size`, `data-variant`); semantic tokens own layout and paint before caller styling inputs compose.                                                                                                                                                                                                         | `architecture:component-theming-surface`; current source and tests |
| FR6 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` reach or compose on the row root without replacing owned role, tab stop, disabled behavior, destination handling, or activation order.                                                                                                                                                                                    | `architecture:public-component-api` INV5–INV9; current tests       |
| FR7 | Disabled menu rows remain inert, and the parent menu's keyboard reaches them as `component:DropdownMenu` FR17 states.                                                                                                                                                                                                                                                                                     | `component:DropdownMenu` FR17, DEC-11                              |
| FR8 | Keyboard focus draws the shared focus ring inside the row, inset by the ring's own width, in every color mode; forced colors keep that ring as the focus indicator. After pointer input the row shows only its hover background (`architecture:interaction-modality` INV1), or the pressed overlay while a held finger or pen lights it (`spec:AST-094` FR27); the focused row owns the indicator (INV3). | Current source; `architecture:interaction-modality` INV1, INV3     |

### Allowed variation

- **AV1 — Content.** Non-interactive icons, text, descriptions, shortcuts, badges,
  and status text may vary without changing the row's menuitem semantics.
- **AV2 — Theme paint.** A theme may restyle the target's admitted properties while
  preserving visible state distinctions and forced-colors focus.
- **AV3 — Parent size.** The parent menu supplies `sm`, `md`, or `lg`; the row reflects
  that state and may vary its tokenized insets.

### Representative states

| State                  | Required invariant                                                                  | Allowed variation                            |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------- |
| Enabled action         | Callback runs, then close follows the close policy.                                 | Content, size, and visual variant.           |
| In-place result action | Callback runs and the menu remains open.                                            | Label/end content may update.                |
| Disabled action        | `aria-disabled=true`; callback, hover focus, and close are suppressed.              | Content remains visible.                     |
| Destination            | One anchor root preserves safe destination and browser activation behavior.         | Target, rel, router provider, and content.   |
| Destructive            | Error-role paint applies to label, icon, and description without changing behavior. | Other row content remains consumer-authored. |
| Keyboard focus         | Parent focus lands on the row and remains visible.                                  | Exact theme-owned paint may vary.            |
| RTL / narrow viewport  | Logical insets and start alignment follow direction without horizontal overflow.    | Menu placement remains parent-owned.         |

### Transformation and precedence order

- **ORD1 — Activation.** Disabled guard → browser-navigation classification → row
  callback where applicable → close policy → browser/router navigation.
- **ORD2 — Root composition.** Parent size → base row styles → variant/disabled state
  → caller `xstyle`; target metadata and caller class/style compose on the same root.

### Performance and resources

- **PR1 — Shared press listeners.** The row shares the press controller's
  window and document listeners; it adds no per-row listener, observer, timer,
  or request.

## Accessibility contract

- **AR1 — Menu item semantics.** The root is one named `menuitem`; supporting content
  does not introduce a nested interactive descendant.
- **AR2 — Disabled state.** Disabled rows expose state and cannot activate or navigate.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus collection and activation;
  the item remains a single row in that model.
- **AR4 — Focus perception.** After keyboard input the focused row draws the
  shared focus ring inside its edge in every color mode, forced colors
  included; after pointer input its background follows FR8.

## Design relationships

| Anatomy or state | Design requirement                                                                  | Representation authority                        | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- | -------------- | ------------------ |
| Row              | One full-width action/destination target with tokenized insets and start alignment. | Current source and parent menu composition      | prominent      | FR1–FR6            |
| Supporting text  | Description and end content remain subordinate to the row label.                    | Delegated Item layout and current consumer docs | supporting     | FR1                |
| Interaction      | Hover, focus, press, disabled, and destructive states remain distinguishable.       | Current source; FR8                             | prominent      | FR5, FR8, AR4      |

No component-local visual decision is recorded.

## Family and system relationships

- `family:navigation-destinations` owns destination acceptance and blocked-scheme
  behavior; this component supplies the destination-bearing row.
- `architecture:public-component-api` owns root input composition, refs, and released
  compatibility.
- `architecture:component-theming-surface` owns target placement and state reflection.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `architecture:interaction-modality` and DropdownMenu own parent keyboard behavior.
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.

## Verification map

| Contract       | Verification                                                                                                                                                                                                                                                                                                               | Representative states                                     | Mutation or failure expectation                                                                                                                                                                | Audit section                          |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1, AR1       | `DropdownMenu.test.tsx` compound-mode cases ("renders JSX children as menu items", "renders endContent after the item label"); `Menu.a11y.test.tsx` menu binding cases                                                                                                                                                     | Action row with content                                   | A row that is not a `menuitem` or loses its content fails. Evidence gap: no test asserts that supporting content holds no nested control.                                                      | `audit:DropdownMenuItem/semantics`     |
| FR2, AR2, ORD1 | `DropdownMenu.test.tsx` item cases ("calls onClick when item is clicked", "closes the menu after an item is activated", "keeps the menu open when the item opts out of closing", "does not call onClick when disabled"), "has aria-disabled on disabled compound items", and "a disabled href row renders no address"      | Enabled, disabled, close and stay-open                    | A callback while disabled, a missing `aria-disabled`, a close that ignores the policy, or a disabled row with an address fails. Evidence gap: no test asserts the callback-before-close order. | `audit:DropdownMenuItem/behavior`      |
| FR3            | `DropdownMenu.test.tsx` "DropdownMenuItem href" and "link rows — the browser's own clicks" cases; "a middle click on a link row runs the caller's onAuxClick and still closes the menu"                                                                                                                                    | Plain, modified, middle, right click; blocked destination | A non-anchor row, a modified click that runs the callback, a middle click that does not close, or a live blocked destination fails.                                                            | `audit:DropdownMenuItem/behavior`      |
| FR4, AR3       | `DropdownMenu.test.tsx` keyboard-access cases ("moves focus to the item the mouse hovers, keeping a single highlight", "does not move focus on hover for a disabled item", "does not move focus for a non-mouse (touch) pointer") and "keeps the row's own role, tab stop and hover focus beside a caller's onPointerMove" | Mouse hover, touch, disabled                              | A second highlight, hover focus on a disabled row or under touch, or a lost tab stop fails.                                                                                                    | `audit:DropdownMenuItem/accessibility` |
| FR5            | `DropdownMenu.test.tsx` destructive-variant cases; `themingTargets.test.ts`                                                                                                                                                                                                                                                | Default and destructive; data and compound mode           | A missing `data-variant` fails; a rendered class absent from the documented targets fails. Evidence gap: no test asserts the `dropdown-menu-item` class or `data-size`.                        | `audit:DropdownMenuItem/theming`       |
| FR6            | `DropdownMenu.test.tsx` ref and host-attribute cases ("a ref reaches the menuitem element", "puts aria-\*, data-\* and id on the row root, a link row included", "runs the DOM handlers the caller attaches, such as a drop target")                                                                                       | Ref; host attributes; caller handlers                     | A dropped ref, attribute, or handler fails. Evidence gap: no test asserts `className`, `style`, or `xstyle` on the row.                                                                        | `audit:DropdownMenuItem/api`           |
| FR7            | `DropdownMenu.test.tsx` disabled-row keyboard cases (`component:DropdownMenu` FR17)                                                                                                                                                                                                                                        | Disabled rows                                             | A disabled row that activates, closes the menu, or is skipped by the parent's arrow keys or type-ahead fails.                                                                                  | `audit:DropdownMenuItem/accessibility` |
| FR8, AR4, PR1  | `DropdownMenuForcedColors.test.tsx` (each row's `:focus-visible` ring and token inset); `DropdownMenuAudit.a11y.chromium.spec.ts` forced-colors frames                                                                                                                                                                     | Action and destructive rows; light, dark, forced colors   | A row without the ring after keyboard input, or a ring not inset by the ring width, fails. Evidence gap: no test asserts the listener bound.                                                   | `audit:DropdownMenuItem/visual`        |
| RTL            | `apps/storybook/rtl-audit/verified-not-applicable.json` DropdownMenuItem entry                                                                                                                                                                                                                                             | LTR and RTL                                               | A changed source hash fails the receipt.                                                                                                                                                       | `audit:DropdownMenuItem/rtl`           |

## Current-state impact

None.

## Decision log

No component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or family/system rules. It links to
their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuRadioGroup.spec.md -->


# DropdownMenuRadioGroup component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One controlled, named single-selection group of `DropdownMenuRadioItem` children with value, change callback, close policy, root inputs, and a ref.      |
| Behavior                | The group supplies selection and close-policy context; radio items emit values; the parent DropdownMenu owns keyboard navigation and menu lifecycle.     |
| End-user impact         | Assistive technology encounters one named group with exactly one current choice when a value matches, while pointer and keyboard selection stay aligned. |
| Builder impact          | Keep the value controlled, provide a stable accessible label, and place only DropdownMenuRadioItem options inside the group.                             |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change.                                                                                                |
| Review checks           | Reject unnamed groups, local selection state, dropped root inputs, a second keyboard owner, or a close policy that bypasses the controlled callback.     |
| Governing rules         | `spec:AST-020`; `architecture:public-component-api/INV5–INV9`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-020/FR1,FR2,FR6`.          |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuRadioGroup renders one named `role="group"` wrapper inside the
pointer presentation of DropdownMenu. It owns controlled selection context,
close policy, root composition, and the tokenized gap between children.
DropdownMenuRadioItem owns each `menuitemradio` row and its checked state;
DropdownMenu owns focus movement, typeahead, keyboard activation, presentation,
and menu open/close lifecycle.

## Compatibility and migration

- Released default preserved: yes (`hasCloseOnSelect=true`).
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change.
- Controlled behavior: `value` is caller-owned and `onChange` is the only commit path.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One `role="group"` root with an `aria-label` from the required `label` prop.
- Controlled `value`, `onChange`, and `hasCloseOnSelect` context for radio items.
- Composition of `children`, supported host inputs, ref, `className`, `style`, and
  `xstyle` on the group root.
- Column layout and the semantic menu inter-item gap.

**Does not own / non-goals**

- The `menuitemradio` role, `aria-checked`, disabled behavior, indicator paint,
  label, description, icon, or end content — owned by DropdownMenuRadioItem.
- Focus entry, arrow-key navigation, typeahead, Enter/Space synthesis, and menu
  close implementation — owned by DropdownMenu and shared menu hooks.
- Touch and bottom-sheet selectable-row rendering — owned by the parent presentation.
- Uncontrolled selection state or child-value registration.

## Public concepts

| Concept         | Closed values or states                       | Meaning                                                              | Default  | Owner                    | Stability | Invalid-value behavior                                |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------- | -------- | ------------------------ | --------- | ----------------------------------------------------- |
| Selection       | matching value; no matching value             | Controls which child reports checked.                                | none     | caller and radio item    | stable    | No match leaves every child unchecked.                |
| Commit          | child value                                   | Emits the selected child value through `onChange`.                   | required | group context            | stable    | Children outside the group throw from the item owner. |
| Close policy    | close; remain open                            | Controls whether an item asks DropdownMenu to close after selection. | close    | group context and parent | stable    | Omission closes.                                      |
| Accessible name | required label; optional labelledby           | Names the group; `aria-labelledby` may point at visible text.        | label    | group root               | stable    | `label` remains required by the public type.          |
| Root surface    | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the group root while preserving its role and name.           | omitted  | public component API     | stable    | Accepted inputs compose; owned role and label win.    |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                              | Basis                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| FR1 | The root exposes `role="group"` and a non-empty accessible name. The required `label` supplies `aria-label`; a caller `aria-labelledby` may reference visible text.                    | `spec:AST-020`; current source and tests                     |
| FR2 | The group is controlled. It compares each radio item's value with caller `value` and emits a selected child value only through caller `onChange`; a radio item outside a group throws. | Current public API and tests                                 |
| FR3 | `hasCloseOnSelect` defaults to true. When false, a selection updates through `onChange` while the parent menu stays open.                                                              | Current behavior and tests                                   |
| FR4 | DropdownMenu is the only keyboard owner. The group adds no tab stop, key handler, typeahead, or click synthesis; it only provides context to child rows.                               | `architecture:interaction-modality`; parent tests            |
| FR5 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` reach or compose on the group root without replacing the owned role or `aria-label`.                   | `architecture:public-component-api` INV5–INV9; current tests |
| FR6 | The wrapper is a logical column whose tokenized gap matches the surrounding menu's item rhythm; it adds no component-specific directional paint or navigation.                         | Current source                                               |

### Allowed variation

- **AV1 — Children.** The number, labels, descriptions, icons, and supporting
  content of DropdownMenuRadioItem children may vary.
- **AV2 — Selection.** Any string value, including no matching value, may be
  caller-controlled without adding local group state.
- **AV3 — Root styling.** Caller style inputs may extend the wrapper while the
  role, accessible label, column flow, and child semantics remain intact.

### Representative states

| State             | Required invariant                                                         | Allowed variation                    |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| Matching value    | Exactly the matching child reports `aria-checked=true`.                    | Child content and menu size.         |
| No matching value | Every child reports `aria-checked=false`.                                  | Empty or unmatched caller value.     |
| Default close     | Selection emits the value and closes through the parent.                   | Pointer or synthesized keyboard act. |
| Retained open     | Selection emits the value, updates controlled state, and leaves menu open. | Result copy and selected child.      |
| RTL / narrow      | Column order and tokenized gap hold with no horizontal overflow.           | Parent menu placement.               |

### Transformation and precedence order

- **ORD1 — Selection.** Child activation → disabled guard in the item owner →
  group `onChange(value)` → optional parent close.
- **ORD2 — Root composition.** Base column/gap → caller `xstyle`; supported host
  inputs and class/style compose while owned role and label remain fixed.

### Performance and resources

- **PR1 — Context only.** The group memoizes a small context value and owns no
  Effect, listener, observer, timer, request, DOM read, or resource lifecycle.

## Accessibility contract

- **AR1 — Named group.** The wrapper is one named `group` inside the parent menu.
- **AR2 — Radio rows.** Child items own `menuitemradio` and `aria-checked`; the
  group does not add nested native inputs or duplicate row semantics.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus collection and activation;
  the group itself never enters the tab or arrow-key sequence.

## Design relationships

| Anatomy or state | Design requirement                                               | Representation authority           | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------- | -------------- | ------------------ |
| Group wrapper    | Logical column with the menu's semantic inter-item gap.          | Current source and spacing tokens  | structural     | FR1, FR5, FR6      |
| Selected child   | One child reflects caller value through `aria-checked`.          | DropdownMenuRadioItem              | prominent      | FR2, AR2           |
| Direction/narrow | Child order and gap hold without physical-direction assumptions. | Bidirectionality and parent layout | structural     | FR6                |

No component-local visual decision is recorded.

## Family and system relationships

- `architecture:public-component-api` owns root input composition and released compatibility.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `architecture:interaction-modality` and DropdownMenu own keyboard behavior.
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.

## Verification map

| Contract      | Verification                                                                                                                                                                                                    | Representative states                                | Mutation or failure expectation                                                                                                              | Audit section                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| FR1, AR1      | `DropdownMenuSelectable.test.tsx` "names and composes the group root when no value matches"                                                                                                                     | Label and caller `aria-labelledby`                   | A missing group role, `aria-label`, or caller `aria-labelledby` fails.                                                                       | `audit:DropdownMenuRadioGroup/semantics`     |
| FR2           | `DropdownMenuSelectable.test.tsx` "calls onChange with the selected value", "names and composes the group root when no value matches" (no item checked), and "throws when a radio item is used outside a group" | Matching and no matching value; item outside a group | A wrong checked row, a selection that skips `onChange`, or an item that works outside a group fails.                                         | `audit:DropdownMenuRadioGroup/behavior`      |
| FR3           | `DropdownMenuSelectable.test.tsx` "keeps the menu open while controlled selection updates when requested"                                                                                                       | `hasCloseOnSelect={false}`                           | A close despite the opt-out fails. Evidence gap: no test here asserts the default close after a selection.                                   | `audit:DropdownMenuRadioGroup/behavior`      |
| FR4, AR2, AR3 | `DropdownMenu.test.tsx` "arrow navigation reaches consumer-rendered menuitemradio and menuitemcheckbox items" and "activates a focused menuitemradio with Enter and a menuitemcheckbox with Space"              | Arrow keys and Enter on radio rows                   | A radio row the arrows skip or Enter does not activate fails. Evidence gap: no test asserts that the group adds no tab stop or key handler.  | `audit:DropdownMenuRadioGroup/accessibility` |
| FR5           | `DropdownMenuSelectable.test.tsx` "names and composes the group root when no value matches"                                                                                                                     | Ref, host attribute, class, style, handler           | A dropped ref, attribute, class, style, or handler, or a replaced role or label, fails. Evidence gap: no test asserts `xstyle` on the group. | `audit:DropdownMenuRadioGroup/api`           |
| FR6, PR1      | `apps/storybook/rtl-audit/verified-not-applicable.json` DropdownMenuRadioGroup entry. Evidence gap: no test asserts the column gap or the absence of lifecycle resources                                        | LTR and RTL                                          | A changed source hash fails the receipt.                                                                                                     | `audit:DropdownMenuRadioGroup/layout`        |

## Decision log

No component-local decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or parent/item contracts. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuRadioItem.spec.md -->


# DropdownMenuRadioItem component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One `menuitemradio` row inside a DropdownMenuRadioGroup with a required value and label, optional description, icon, end content, disabled state, root inputs, and a ref.               |
| Behavior                | Enabled activation emits the row value through the group, applies the group close policy, then runs the caller click handler; disabled activation does none of these.                   |
| End-user impact         | Assistive technology hears one radio option with its checked state; pointer and keyboard selection commit the same value, and a disabled option cannot be chosen.                       |
| Builder impact          | Place the row inside a DropdownMenuRadioGroup and give it a unique value and a label; caller handlers run alongside the row's own behavior.                                             |
| Compatibility/readiness | Records shipped behavior; no API change; a disabled row gains `tabindex="-1"` (FR4).                                                                                                    |
| Review checks           | Reject a nested semantic radio, a second keyboard owner, local selection state, a dropped caller input, or disabled activation that selects, closes, or calls the caller click handler. |
| Governing rules         | `spec:AST-020` FR15; `architecture:public-component-api/INV5–INV8`; `architecture:component-theming-surface/INV4–INV6`; `spec:AST-020/FR1,FR2`.                                         |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuRadioItem renders one selectable option of a single-choice group in
the pointer presentation of DropdownMenu. The row owns its `menuitemradio`
semantics, checked state, decorative radio marker, visible content, disabled
paint, and activation order. DropdownMenuRadioGroup owns the controlled value
and close policy; DropdownMenu owns focus movement, typeahead, keyboard
activation, and the menu lifecycle.

## Compatibility and migration

- Released default preserved: yes (`isDisabled=false`).
- Compatibility class: records shipped behavior; no public prop or export
  change; a disabled row gains `tabindex="-1"` (FR4).
- Controlled behavior: the checked state always derives from the group `value`;
  the row holds no selection state.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One row root with `role="menuitemradio"` and `aria-checked` derived from the
  group value.
- Selection order: disabled guard, group `onChange(value)`, optional close, then
  the caller click handler.
- The decorative shared radio marker, its size, and its inline placement.
- Label, description, icon, and end content composition through Item.
- Disabled state exposure and paint, and hover focus for enabled rows.
- Root composition of ref, supported host inputs, `className`, `style`, and
  `xstyle`.

**Does not own / non-goals**

- The selected value, change callback, and close policy — owned by
  `component:DropdownMenuRadioGroup`.
- Focus entry, arrow-key navigation, typeahead, Enter/Space click synthesis,
  press gestures, and closing — owned by `component:DropdownMenu`.
- Touch bottom-sheet rendering of selectable rows — owned by the parent
  presentation.
- The radio marker's paint — owned by the shared radio Indicator.

## Public concepts

| Concept      | Closed values or states                        | Meaning                                                           | Availability by variant/orientation/state | Default  | Owner                             | Stability | Invalid-value behavior                                   |
| ------------ | ---------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | -------- | --------------------------------- | --------- | -------------------------------------------------------- |
| Option value | any string                                     | The value the group emits and compares to decide the checked row. | Every row                                 | required | `component:DropdownMenuRadioItem` | stable    | A value no group value matches leaves the row unchecked. |
| Checked      | checked; unchecked                             | Whether the group value equals this row's value.                  | Every row                                 | derived  | group context and row             | stable    | No local override exists.                                |
| Availability | enabled; disabled                              | Whether the row can take hover focus and commit its value.        | Every row                                 | enabled  | `component:DropdownMenuRadioItem` | stable    | Disabled blocks every activation path.                   |
| Content      | label; description; icon; end content          | Visible identification of the option, in reading order.           | Every row                                 | label    | row through Item                  | stable    | `label` is required by the public type.                  |
| Root surface | ref; DOM/data/ARIA; class/style/xstyle; events | Extends the row root while preserving its role and checked state. | Every row                                 | omitted  | public component API              | stable    | `role`, `aria-checked`, and `tabIndex` are not accepted. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                   | Basis                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| FR1 | The row renders one element with `role="menuitemradio"` whose `aria-checked` is true exactly when the group value equals the row value. It nests no native or ARIA radio.                                                                                                                                                                                                                   | `spec:AST-020`; current source and tests                             |
| FR2 | Rendering the row outside a DropdownMenuRadioGroup throws.                                                                                                                                                                                                                                                                                                                                  | Current source and focused tests                                     |
| FR3 | Enabled activation, by pointer or by the parent's synthesized Enter/Space click, calls the group `onChange` with the row value, then asks DropdownMenu to close when the group's close policy is on, then calls the caller `onClick`.                                                                                                                                                       | `architecture:public-component-api` INV7; current behavior and tests |
| FR4 | A disabled row exposes `aria-disabled="true"`, carries `tabindex="-1"` like an enabled row so the parent's keyboard model reaches it (`component:DropdownMenu` FR17), takes no hover focus, and on any activation, including an assistive-technology click, calls neither `onChange` nor the caller `onClick` and does not close the menu. It paints at half opacity with a default cursor. | Current source and tests                                             |
| FR5 | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` reach or compose on the row root. Caller `onPointerMove` runs after the row's hover focus, and caller handlers do not replace the row's own behavior.                                                                                                                                                       | `architecture:public-component-api` INV5–INV8; current tests         |
| FR6 | The marker is the shared radio Indicator, hidden from assistive technology, never the pointer target, sized `sm` in a small menu and `md` otherwise, at the row's inline start on a fine pointer and its inline end on a coarse pointer.                                                                                                                                                    | Current source and tests                                             |
| FR7 | The row carries the `dropdown-menu-item` target with the menu size and the marker carries the `dropdown-menu-radio` target with size, checked, and disabled reflections.                                                                                                                                                                                                                    | `architecture:component-theming-surface`; current source and docs    |
| FR8 | The row adds no key handler or tab stop of its own: every row, disabled included, is `tabindex="-1"` for the parent's roving focus, and keyboard selection arrives as the parent's synthesized click.                                                                                                                                                                                       | `architecture:interaction-modality`; parent keyboard tests           |

### Allowed variation

- **AV1 — Content.** Label, description, icon, and end content may vary in
  length and kind; long string labels truncate on one line.
- **AV2 — Size.** The marker follows the parent menu size: `sm` in a small
  menu, `md` otherwise. Row padding does not currently vary with the menu size,
  unlike action rows; this is an observation, not an invariant.
- **AV3 — Root styling.** Caller style inputs may extend the row while its role,
  checked state, and marker remain intact.

### Representative states

| State          | Required invariant                                                        | Allowed variation                                      |
| -------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Checked        | `aria-checked=true`; the marker shows its checked dot.                    | Content, size, theme, and mode.                        |
| Unchecked      | `aria-checked=false`; the marker shows an empty circle.                   | Content, size, theme, and mode.                        |
| Focused        | The row holds focus.                                                      | Pointer hover or keyboard arrival; focus paint is AR4. |
| Disabled       | `aria-disabled=true`, no tab stop, half opacity, and no activation.       | Checked or unchecked value.                            |
| Coarse pointer | The marker sits at the inline end of the row.                             | Direction mirrors the placement.                       |
| RTL / narrow   | Content and marker follow logical order with no horizontal page overflow. | Parent menu placement and width.                       |

### Transformation and precedence order

- **ORD1 — Activation.** Disabled guard → group `onChange(value)` → close when
  the group's close policy is on → caller `onClick`.
- **ORD2 — Pointer move.** Hover focus for an enabled row → caller
  `onPointerMove`.
- **ORD3 — Root composition.** Base row styles → disabled paint → caller
  `xstyle`; caller `className` and `style` merge with the row target.

### Performance and resources

- **PR1 — Render only.** The row owns no Effect, listener, observer, timer,
  request, or local state.

## Accessibility contract

- **AR1 — One radio option.** The row is the only announced control; its
  accessible name comes from its visible content and its state from
  `aria-checked`.
- **AR2 — Disabled state.** A disabled row exposes `aria-disabled` and cannot
  commit a value through any input.
- **AR3 — Keyboard ownership.** DropdownMenu owns focus movement and activation;
  the row adds no key handling. The keyboard reaches a disabled row as
  `component:DropdownMenu` FR17 states.
- **AR4 — Focus visibility.** Keyboard focus draws the shared focus ring
  inside the row, inset by the ring's own width, in every color mode, forced
  colors included; after pointer input the row shows only the overlay tint
  (`architecture:interaction-modality` INV1, INV3). The shared row treatment is
  `component:DropdownMenuItem` FR8.

## Design relationships

| Anatomy or state | Design requirement                                        | Representation authority         | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------- | -------------------------------- | -------------- | ------------------ |
| Row              | Menu row paint and radius; focus paint is AR4.            | Current source and menu tokens   | structural     | FR7, AR4           |
| Radio marker     | Shared radio Indicator at the menu's control size.        | Shared radio Indicator           | prominent      | FR1, FR6           |
| Disabled         | Half-opacity row with a default cursor.                   | Current source                   | supporting     | FR4                |
| Direction/touch  | Logical marker placement that mirrors and moves on touch. | Bidirectionality and current CSS | structural     | FR6                |

No component-local visual decision is recorded.

## Family and system relationships

- `component:DropdownMenuRadioGroup` owns value, change callback, and close policy.
- `component:DropdownMenu` owns keyboard navigation, the press model, the
  `dropdown-menu-item` and `dropdown-menu-radio` target inventory, disabled-row
  keyboard reach (its FR17), and the shared row focus treatment
  together with `component:DropdownMenuItem` (its FR8).
- `architecture:public-component-api` owns root input and handler composition.
- `architecture:component-theming-surface` owns target placement and state
  reflection.
- `architecture:component-test-sufficiency` owns proportionate observable evidence.
- `spec:AST-020` supplies WCAG/APG adoption and evidence-layer boundaries.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                                                                                      | Representative states                            | Mutation or failure expectation                                                                                                                                                                                                                                      | Audit section                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1, AR1 | `DropdownMenuSelectable.test.tsx` "renders the shared radio indicator in the menu marker" and "composes caller root inputs without replacing the row semantics"; `Menu.a11y.test.tsx` menu binding cases                                                                                                                                                                          | Checked and unchecked                            | A row that is not `menuitemradio` or a wrong `aria-checked` fails. Evidence gap: no test asserts the absence of a nested radio.                                                                                                                                      | `audit:DropdownMenuRadioItem/semantics` |
| FR2      | `DropdownMenuSelectable.test.tsx` "throws when a radio item is used outside a group"                                                                                                                                                                                                                                                                                              | Outside a group                                  | A row that renders outside a group fails.                                                                                                                                                                                                                            | `audit:DropdownMenuRadioItem/behavior`  |
| FR3, FR8 | `DropdownMenuSelectable.test.tsx` "calls onChange with the selected value", "composes the caller click handler with the selection", "composes the caller click handler on keyboard activation", "keeps the menu open while controlled selection updates when requested"; `DropdownMenu.test.tsx` "activates a focused menuitemradio with Enter and a menuitemcheckbox with Space" | Pointer and keyboard activation; close off       | A missing `onChange`, a dropped caller `onClick`, or a close despite the opt-out fails. Evidence gap: no test asserts the `onChange`, close, `onClick` order or the `tabindex="-1"` on enabled rows.                                                                 | `audit:DropdownMenuRadioItem/behavior`  |
| FR4, AR2 | `DropdownMenuSelectable.test.tsx` "does not select, close, or call the caller click handler when disabled"; `DropdownMenu.test.tsx` "does not move focus on hover for a disabled item"                                                                                                                                                                                            | Disabled                                         | A selection, close, or caller `onClick` while disabled, or hover focus on a disabled row, fails. Evidence gap: no test asserts the disabled row's `tabindex="-1"`, that the parent's keyboard reaches it (`component:DropdownMenu` FR17), or the half-opacity paint. | `audit:DropdownMenuRadioItem/behavior`  |
| FR5      | `DropdownMenuSelectable.test.tsx` "composes caller root inputs without replacing the row semantics", "composes the caller pointer-move handler with menu hover focus", and "a ref reaches the menuitemradio element"                                                                                                                                                              | Ref, host attributes, class, style, pointer move | A dropped ref, attribute, class, style, or handler fails. Evidence gap: no test asserts `xstyle` on the row.                                                                                                                                                         | `audit:DropdownMenuRadioItem/api`       |
| FR6, FR7 | `DropdownMenuSelectable.test.tsx` "renders the shared radio indicator in the menu marker"; `DropdownMenuRadioItemAudit.a11y.chromium.spec.ts`                                                                                                                                                                                                                                     | Marker in the row                                | A missing shared radio marker fails. Evidence gap: no test asserts the marker size by menu size, its fine and coarse placement, or the `dropdown-menu-radio` reflections.                                                                                            | `audit:DropdownMenuRadioItem/visual`    |
| AR4, PR1 | `DropdownMenuForcedColors.test.tsx` (the row's `:focus-visible` ring and token inset); `DropdownMenuAudit.a11y.chromium.spec.ts` forced-colors frames. Evidence gap: no test asserts the absence of lifecycle resources                                                                                                                                                           | —                                                | —                                                                                                                                                                                                                                                                    | `audit:DropdownMenuRadioItem/visual`    |

## Current-state impact

None.

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Should the shared `dropdown-menu-item` target reflect the disabled
  state its rows paint?** (`human-api`) Selectable and action rows paint disabled
  rows at half opacity, but the target reflects only size and variant, so a theme
  cannot style disabled rows through it. The target inventory is owned by
  `component:DropdownMenu`.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or group/parent contracts. It links to their owners.

---

<!-- source: docs/specs/components/DropdownMenu/DropdownMenuSubMenu.spec.md -->


# DropdownMenuSubMenu component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | One `menuitem` row: label, children; optional icon, description, loading caret, disabled state, flyout width, presentation, `delay`, `hideDelay`, header, footer, open callback, test ids, root inputs, a ref. |
| Behavior                | The row reveals its children as a flyout beside it or as a drilled-in view led by a Back row; with a header or footer that surface is a modal dialog named by the row.                                         |
| End-user impact         | Pointer, keyboard, and touch users reach nested commands from one row; assistive technology hears the row's popup kind and expanded state, and Escape or the close arrow returns to the row.                   |
| Builder impact          | Place the row inside a DropdownMenu or ContextMenu and give it a label and rows; data-driven menus get it from a nested `items` array.                                                                         |
| Compatibility/readiness | Records shipped behavior; adds optional `delay` and `hideDelay` (FR11) at the released timing; a disabled row gains `tabindex="-1"` (FR7).                                                                     |
| Review checks           | Reject a second keyboard owner, a lost popup state, a flyout that does not flip under RTL, a disabled row that opens, dropped caller inputs, or an open callback that misses a transition.                     |
| Governing rules         | `spec:AST-020` FR15; `architecture:public-component-api/INV5–INV8`; `architecture:react-component-runtime/INV2`; `architecture:layer-runtime`; `spec:AST-020/FR1,FR2`; `spec:AST-086/FR8`.                     |

This table is a review projection; the body below is authoritative.

## Intent

DropdownMenuSubMenu turns one menu row into the entry point of a nested menu.
The row owns its `menuitem` semantics, popup state, caret or spinner, disabled
paint, and the surface its children render in: a flyout positioned beside the
row by the layer runtime, or a view the root menu shows in place of its own
rows. Each level owns its own roving focus, typeahead, and press model.
DropdownMenu owns the root surface, the drill-in view stack, and the surface
host that a sub-menu with a header or footer renders into.

## Compatibility and migration

- Released default preserved: yes (`isDisabled=false`, `hasSpinner=false`,
  `presentation='adaptive'`, `delay=150`, `hideDelay=200`).
- Compatibility class: additive; the row adds optional `delay` and `hideDelay`
  (FR11), whose defaults are the released timing; a disabled row gains
  `tabindex="-1"` (FR7).
- Controlled behavior: the open state is internal; `onOpenChange` reports it.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One row root with `role="menuitem"`, `aria-haspopup` (`menu`, or `dialog`
  with a header or footer), `aria-expanded`, and `aria-controls` while open.
- The flyout menu, its viewport-capped size, its keyboard handling, and its
  hover intent; the drilled-in list and its Back row.
- The header and footer regions and the modal dialog that holds them.
- Root composition of ref, supported host inputs, `className`, `style`,
  `xstyle`, and the composed `onClick`, `onKeyDown`, `onPointerMove`,
  `onMouseEnter`, and `onMouseLeave` handlers.

**Does not own / non-goals**

- The root menu surface, the drill-in view stack and its reset when the menu
  closes, and the surface host — owned by `component:DropdownMenu`.
- Leaf row behavior — owned by `component:DropdownMenuItem` and the selectable
  item contracts.
- Placement, flipping, and viewport insets — owned by
  `architecture:layer-runtime`.

## Public concepts

| Concept      | Closed values or states                          | Meaning                                                                      | Availability by variant/orientation/state | Default  | Owner                           | Stability | Invalid-value behavior                                   |
| ------------ | ------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------- | -------- | ------------------------------- | --------- | -------------------------------------------------------- |
| Presentation | flyout; drill-in; adaptive                       | Where the children render; adaptive drills in when a finger opened the menu. | Every row; drill-in needs a menu root     | adaptive | `component:DropdownMenuSubMenu` | stable    | Unknown values are rejected by the public type.          |
| Availability | enabled; disabled                                | Whether the row can open.                                                    | Every row                                 | enabled  | `component:DropdownMenuSubMenu` | stable    | A disabled row never opens.                              |
| Loading      | caret; spinner                                   | Whether the row's end shows a spinner while its rows load.                   | Every row                                 | caret    | `component:DropdownMenuSubMenu` | stable    | The row still opens; an empty flyout takes focus itself. |
| Regions      | none; header; footer; both                       | Content beside the sub-menu's menu that turns its surface into a dialog.     | Inside a DropdownMenu root                | none     | `component:DropdownMenuSubMenu` | stable    | Without a surface host the regions are not rendered.     |
| Open report  | open; close                                      | `onOpenChange` reports each transition of the row's surface.                 | Every row                                 | omitted  | `component:DropdownMenuSubMenu` | stable    | See FR6 for the recorded gap.                            |
| Root surface | ref; DOM/data/ARIA; class/style/xstyle; handlers | Extends the row root while preserving its role and popup wiring.             | Every row                                 | omitted  | public component API            | stable    | `role` and `tabIndex` are not accepted.                  |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                              | Basis                                                              |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| FR1  | The row exposes `role="menuitem"`, `aria-haspopup="menu"` (`"dialog"` with a header or footer), `aria-expanded` matching its surface, and `aria-controls` naming the surface while open. The surface is labelled by the row.                                           | `spec:AST-020`; current source and tests                           |
| FR2  | A click, Enter, Space, or the inline-end arrow (inline-start under RTL) opens the surface; a keyboard open focuses its first enabled row. Escape or the close arrow closes only this level and returns focus to the row. A hover opens a flyout after an intent delay. | `spec:AST-020`; `architecture:interaction-modality`; current tests |
| FR3  | A flyout sits beside the row on the inline-end side, flips with direction, and stays within the viewport; its block size caps at the smaller of its own cap and the viewport.                                                                                          | `architecture:layer-runtime`; current source                       |
| FR4  | A drilled-in view replaces the root's rows with a Back row named after the parent menu and then this row's children; Back, Escape, and the close arrow return to the row.                                                                                              | Current source and focused tests                                   |
| FR5  | Selecting a leaf row inside the surface closes every level and the root menu.                                                                                                                                                                                          | Current source and tests                                           |
| FR6  | `onOpenChange` MUST report `true` once when the surface opens and `false` once when it closes, from the action that caused the change. Implementation gap: a drilled-in view reset by the root menu closing reports no `false` (OQ1).                                  | Documented promise; `architecture:react-component-runtime` INV2    |
| FR7  | A disabled row exposes `aria-disabled="true"`, carries `tabindex="-1"` so the parent's keyboard model reaches it (`component:DropdownMenu` FR17), takes no hover focus, opens on no input, and runs no caller `onClick`.                                               | Current source and tests                                           |
| FR8  | With `hasSpinner` the row shows a decorative spinner in place of the caret and announces the busy start once the root menu shows.                                                                                                                                      | `spec:AST-086` FR8; current source and tests                       |
| FR9  | Ref, supported host attributes and handlers, `className`, `style`, and `xstyle` reach or compose on the row root after the row's own behavior; the open keys and a disabled click stop before the caller's handler.                                                    | `architecture:public-component-api` INV5–INV8; current tests       |
| FR10 | Without its own `header` or `footer` and with none on a level above it, Tab or Shift+Tab on a row in the flyout closes this level as the key bubbles to the menu, which closes the whole menu (`component:DropdownMenu` FR23, `component:ContextMenu` FR11).           | WAI-ARIA Menu Button pattern; current tests                        |
| FR11 | On a hover-capable pointer, the flyout opens after `delay` and closes `hideDelay` after the pointer has left the row, the flyout and the path toward it (`component:DropdownMenu` FR13), in milliseconds (defaults 150 and 200). Keyboard focus and touch never wait.  | Owner decision, 2026-11-06                                         |

### Allowed variation

- **AV1 — Content.** Label, icon, description, and children vary; long string
  labels truncate on one line.
- **AV2 — Size.** The row's padding follows the parent menu size.
- **AV3 — Width.** `menuWidth` sets the flyout's minimum width within the
  viewport cap.

### Representative states

| State    | Required invariant                                                    | Allowed variation                     |
| -------- | --------------------------------------------------------------------- | ------------------------------------- |
| Closed   | `aria-expanded=false`; caret or spinner at the row's end.             | Content, size, theme, and mode.       |
| Open     | `aria-expanded=true`; flyout beside the row, labelled by it.          | Pointer, keyboard, or press opening.  |
| Drilled  | Back row first, then the children, in the root's box.                 | Nested drill-in depth.                |
| Regions  | Modal dialog named by the row; Tab walks header, rows, footer, wraps. | Header or footer only.                |
| Disabled | `aria-disabled=true`, no tab stop, half opacity, no opening.          | Loading or not.                       |
| RTL      | Caret mirrors once; flyout opens toward the inline end.               | Placement flips at the viewport edge. |

### Transformation and precedence order

- **ORD1 — Click.** Disabled guard → drill-in push or flyout toggle → caller
  `onClick`.
- **ORD2 — Key.** Open keys handled and stopped → caller `onKeyDown` for any
  other key.
- **ORD3 — Leaf selection.** Leaf action → this level closes → parent levels
  close → root menu closes.

### Performance and resources

- **PR1 — Owned resources.** The row's only timers are the hover intent and a
  zero-delay focus check on blur; the flyout's overflow observation follows
  the shared menu overflow hook.

## Accessibility contract

- **AR1 — One entry row.** The row is one menu item whose popup kind and state
  are exposed through ARIA; its caret and spinner are decorative.
- **AR2 — Level-scoped keys.** Each level owns its own arrows, typeahead, and
  Escape; a deeper level's keys never act on its parent.
- **AR3 — Disabled discoverability.** The keyboard reaches a disabled row as
  `component:DropdownMenu` FR17 states.
- **AR4 — Focus visibility.** Keyboard focus draws the shared focus ring
  inside the row, inset by the ring's own width, in every color mode, forced
  colors included; after pointer input the row shows only the overlay tint
  (`architecture:interaction-modality` INV1, INV3). The shared row treatment is
  `component:DropdownMenuItem` FR8.

## Design relationships

| Anatomy or state | Design requirement                                            | Representation authority         | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------------------- | -------------------------------- | -------------- | ------------------ |
| Row              | Menu row paint, radius, and size padding; focus paint is AR4. | Current source and menu tokens   | structural     | FR1, AR4           |
| Caret / spinner  | Mirrored caret, or a decorative spinner while loading.        | Icon and Spinner owners          | supporting     | FR3, FR8           |
| Flyout           | Popover surface, low shadow, container radius, viewport caps. | Current source and layer runtime | prominent      | FR3                |
| Drilled view     | Rows inside the root's box, led by a mirrored Back row.       | Current source                   | structural     | FR4                |
| Disabled         | Half-opacity row with a default cursor.                       | Current source                   | supporting     | FR7                |

No component-local visual decision is recorded.

## Family and system relationships

- `component:DropdownMenu` owns the root surface, the drill-in stack, the
  surface host, the `dropdown-menu`, `dropdown-menu-item`, and
  `dropdown-menu-indicator-icon` target inventory, and disabled-row keyboard
  reach (its FR17).
- `architecture:layer-runtime` owns flyout placement, flipping, and insets.
- `architecture:public-component-api` owns root input and handler composition.
- `architecture:react-component-runtime` owns callback timing.
- `spec:AST-086` owns the loading announcement.

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Representative states                      | Mutation or failure expectation                                                                                                                                                                                                                                          | Audit section                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| FR1, AR1 | `DropdownMenuSubMenu.test.tsx` "renders the trigger with aria-haspopup and collapsed aria-expanded", "names the flyout from its trigger via aria-labelledby", "the row keeps its own popup state and tab stop"; header-and-footer case "holds the header, the rows and the footer in a dialog named by the row, outside every menu"                                                                                                                                                                                          | Closed and open; with regions              | A missing `aria-haspopup`, `aria-expanded`, or row label on the surface fails. Evidence gap: no test asserts `aria-controls` while open.                                                                                                                                 | `audit:DropdownMenuSubMenu/semantics`     |
| FR2, AR2 | `DropdownMenuSubMenu.test.tsx` "opens the flyout on trigger click and exposes its items", "opens on ArrowRight and returns focus to the trigger on ArrowLeft", "mirrors its indicator and keyboard directions under RTL", "closes only the submenu on Escape and restores focus to the trigger", "supports first-character type-ahead within the flyout", "navigates a two-level nested submenu without double-stepping", "moves focus to the submenu trigger on hover, keeping a single highlight"; hover/click-guard cases | Click, arrows, RTL, Escape, hover, nesting | A key that does not open or close, a wrong focus target, a double-stepped level, or a reversed RTL arrow fails. Evidence gap: no test asserts Enter or Space opening the row.                                                                                            | `audit:DropdownMenuSubMenu/accessibility` |
| FR3      | `DropdownMenuSubMenu.test.tsx` "caps the flyout width and height to the available viewport"; `apps/storybook/rtl-audit/targets.json` DropdownMenuSubMenu entry                                                                                                                                                                                                                                                                                                                                                               | Viewport cap; RTL                          | A flyout that escapes the viewport fails. Evidence gap: no test asserts the inline-end placement or its flip.                                                                                                                                                            | `audit:DropdownMenuSubMenu/layout`        |
| FR4      | `DropdownMenuSubMenu.test.tsx` drill-in cases; `DropdownMenuDrillIn.a11y.chromium.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                   | Drilled view; Back                         | A missing Back row or a Back that does not return fails.                                                                                                                                                                                                                 | `audit:DropdownMenuSubMenu/behavior`      |
| FR5      | `DropdownMenuSubMenu.test.tsx` "closes the whole menu after selecting a nested item" and "activates a nested item with the Enter key and closes the menu"                                                                                                                                                                                                                                                                                                                                                                    | Pointer and Enter                          | A level left open after a leaf pick fails.                                                                                                                                                                                                                               | `audit:DropdownMenuSubMenu/behavior`      |
| FR6      | `DropdownMenuSubMenu.test.tsx` "reports each flyout open and close to onOpenChange once"                                                                                                                                                                                                                                                                                                                                                                                                                                     | Flyout open and close                      | A missing or repeated report fails. Evidence gap: the drill-in reset gap is not asserted.                                                                                                                                                                                | `audit:DropdownMenuSubMenu/behavior`      |
| FR10     | `DropdownMenuSubMenu.test.tsx` "Tab from a flyout leaves the whole menu" suite; `ContextMenu.test.tsx` matching case                                                                                                                                                                                                                                                                                                                                                                                                         | one and two levels down, Shift+Tab         | A flyout left open after Tab fails.                                                                                                                                                                                                                                      | `audit:DropdownMenuSubMenu/accessibility` |
| FR11     | `DropdownMenuSubMenu.test.tsx` "opens 150 ms after a hover and closes 200 ms after the pointer leaves by default", "waits the `delay` it is given before a hover opens the flyout" and "keeps the flyout open for the `hideDelay` it is given after the pointer leaves"                                                                                                                                                                                                                                                      | `delay`; `hideDelay`; defaults             | A flyout that opens before `delay` or closes before `hideDelay` fails.                                                                                                                                                                                                   | `audit:DropdownMenuSubMenu/behavior`      |
| FR7, FR9 | `DropdownMenuSubMenu.test.tsx` "does not open a disabled submenu", "a disabled row does not pass a click on to the caller's onClick", host-attribute and ref cases ("aria-\*, data-\* and id reach the trigger row, and the flyout stays labelled by it", "a ref reaches the trigger row", "a caller's handlers run after the row's own, and the row still opens and takes the hover focus")                                                                                                                                 | Disabled; caller handlers and attributes   | A disabled open or caller click, or a dropped attribute, ref, or handler, fails. Evidence gap: no test asserts `className`, `style`, or `xstyle` on the row, a disabled row's `tabindex="-1"`, or that the parent's keyboard reaches it (`component:DropdownMenu` FR17). | `audit:DropdownMenuSubMenu/api`           |
| FR8      | `BusyOwnerAnnouncement.test.tsx` "DropdownMenuSubMenu loading state" cases; `DropdownMenuSubMenu.test.tsx` loading-flyout cases                                                                                                                                                                                                                                                                                                                                                                                              | Loading closed and open                    | A busy start announced while closed, twice, or not at all, or an announced Spinner, fails.                                                                                                                                                                               | `audit:DropdownMenuSubMenu/accessibility` |
| AR4, PR1 | `DropdownMenuForcedColors.test.tsx` (the row's `:focus-visible` ring and token inset); `DropdownMenuAudit.a11y.chromium.spec.ts` forced-colors frames. Evidence gap: no test asserts the timer bounds                                                                                                                                                                                                                                                                                                                        | —                                          | —                                                                                                                                                                                                                                                                        | `audit:DropdownMenuSubMenu/visual`        |

## Current-state impact

- **Drill-in close report (FR6).** When the root menu closes a drilled-in view,
  `onOpenChange(false)` does not run (OQ1).

## Decision log

No component-local decision.

## Open questions

- **OQ1 — Which owner reports a drilled-in view's close when the root menu
  closes?** (`human-api`) The flyout reports every close through its layer, but
  the root resets the drill-in stack without telling the row, so
  `onOpenChange(false)` never runs for that close. The stack is owned by
  `component:DropdownMenu`.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or root/leaf contracts. It links to their owners.
