---
schema_version: 3
template_version: 7
kind: component
id: component:Table
authority: current
archive_reason: null
superseded_by: null
approved_by: humbertovirtudes
approved_at: 2026-11-03
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    apps/storybook/stories/Table.stories.tsx,
    packages/core/src/Table/Table.test.tsx,
    packages/core/src/Table/__tests__/TableScroll.a11y.chromium.spec.ts,
    packages/core/src/Table/__tests__/Table.a11y.test.tsx,
    packages/core/src/Table/__tests__/Table.a11y.chromium.spec.ts,
    packages/core/src/Table/Table.perf.test.tsx,
    packages/core/src/Table/TableRowContext.test.tsx,
    packages/core/src/Table/plugins/rowIndex/useTableRowIndex.test.tsx,
    packages/core/src/Table/plugins/selection/useTableSelection.test.tsx,
    packages/core/src/Table/plugins/sortable/useTableSortable.test.tsx,
    packages/core/src/Table/plugins/sortable/__tests__/useTableSortable.a11y.test.tsx,
    packages/core/src/Table/plugins/rowExpansion/useTableRowExpansion.test.tsx,
    packages/core/src/Table/plugins/rowExpansion/useTableRowExpansion.glide.test.tsx,
    packages/core/src/Table/__tests__/TableRowGlide.a11y.browser.spec.ts,
    packages/cli/foundation/discovery/theming-targets.test.mjs,
    packages/cli/api/theme/targets/targets.test.mjs,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules:
  [
    module:Table/useTableActivation,
    module:Table/useTableRowExpansion,
    module:Table/useTableTreeData,
    module:Table/useTableInfiniteScroll,
    module:Table/useTableRowStatus,
    module:Table/useTableRowsVirtualization,
    module:Table/useTableColumnResize,
  ]
families: []
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:interaction-modality,
    architecture:public-component-api,
    architecture:icon-resolution-and-component-slots,
  ]
contributing: []
system_specs: [spec:AST-025]
---

# Table component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | The shared plugin protocol exposes optional immutable render context, declared row-model/whole-row ownership, and an observable `renderState` source with immutable loading/availability snapshots. `Table.virtualization` accepts the opaque capability from `useTableRowsVirtualization` together with data and explicit `idKey`.                              |
| Behavior                | Table validates one canonical identity, admits compatible flat-row compositions, plans windows before cell construction, and coordinates one viewport, logical row sequence and paint resolution.                                                                                                                                                                |
| End-user impact         | Row activation remains independent from selection; loaded rows keep state and focus, and large flat tables bound mounted work without changing native table semantics.                                                                                                                                                                                           |
| Builder impact          | Existing use without the new capabilities is unchanged. Windowing requires explicit identity and fixed-height layout; arbitrary row/detail/tree output does not silently enter the supported mode.                                                                                                                                                               |
| Compatibility/readiness | Opt-in protocol additions preserve legacy row keys and body-relative ARIA without opt-in. New capabilities require their implementation and browser/performance verification before release. The `table-sort-indicator` (FR5) and `table-row-expand` (FR7) icon slots are additive, current, and await implementation; with no theme entry, output is unchanged. |
| Review checks           | Reject a second key extractor, order-selected whole-row owners, rendering all cells before slicing, parallel scroll ownership, independent overlay writers or window-relative accessibility metadata.                                                                                                                                                            |
| Governing rules         | Table owns the parent protocol; module records own capability behavior. Shared viewport behavior follows `spec:AST-025`; API caller burden follows `architecture:public-component-api`.                                                                                                                                                                          |

This table is a review projection; the body below is authoritative.

## Intent

Table presents consistently structured data in semantic rows and columns. It owns
aggregate anatomy, the shared plugin protocol, canonical identity, render admission,
logical row metadata and coordinated scrolling. Each module owns its independent
public behavior and evidence, without privately replacing the Table renderer.

## Compatibility and migration

- Released default preserved: yes for capability opt-in. Without activation or
  virtualization, legacy reconciliation keys, body-relative `rowIndexStart` and
  `rowCount`, children composition, column floors and scroll behavior remain unchanged.
- FR15 retains the approved row-expansion animatedLayout decision, including the no-glide boundary for grid/column dividers; these flat-data capabilities do not implement or amend that motion contract.
- Compatibility class: additive parent protocol and fixed-height windowing opt-in.
  Optional context arguments preserve existing shorter transform callbacks.
- Controlled/uncontrolled behavior: caller data, ordering, selection, activation,
  expansion and loading remain caller-owned. Dataset/order changes use new data
  references in the opt-in identity/windowing path; mutable-compatible `T[]` types
  do not freeze caller data. Adding/removing identity-dependent capability mode
  is an explicit Table remount boundary; changing `activeKey`, eligibility or
  geometry inside that mounted mode is not a remount boundary.
- Retained width compatibility (DEC-2): the compact floor for an explicit column
  with omitted width is 60px rather than a zero-width flexible share. Per-column
  `proportional(value, {minWidth})` overrides that floor; explicit widths remain
  unchanged, except that a windowed table's recognized row-index cell consumer
  widens to fit its last position (FR13), and insufficient room uses the existing
  inline Scroll region. This
  existing default correction is not described as preservation of its former
  floor merely because the new capabilities are opt-in.
- Retained scroll/target compatibility (DEC-1): shared viewport behavior follows
  `spec:AST-025` FR12, FR14, FR19 and FR21. Effective keyboard access, fitting
  pass-through and inline containment remain on the existing wrapper/content box.
  The canonical `table` target replaces the removed `base-table` alias; consumer
  migration instructions remain with the public docs and release owner.
- Additive theme surface (FR5, FR7): a theme may map the Sort indicator glyph
  through `componentIcons['table-sort-indicator']` and the Expansion glyph through
  `componentIcons['table-row-expand']`; with no entry, both glyphs are unchanged.
- Migration decision: DEC-1/DEC-2 govern those retained corrections; DEC-4/DEC-5
  govern the capability additions and their distinct opt-in/remount boundary.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Table, Scroll region and observed content box, Header, Body, conditional Footer,
  Row, Column header cell and Cell, and their eight canonical targets.
- Stable sort/selection/expansion placement and default empty-state composition.
- Shared transforms, sequential phase order, named ordering, slot protocol,
  failure isolation and stable plugin-array identity.
- Canonical key resolution and opt-in validity, row classification, declared
  whole-row conflict handling, immutable transform context and pre-cell render planning.
- The coordinated viewport, logical positions and parent row-paint resolution.

**Does not own / non-goals**

- Module-local callbacks, load completion/retry, active-state meaning, window
  range/focus policy or performance targets; their module records own them.
- CheckboxInput/Icon/EmptyState visuals, caller cell/detail/footer content,
  product ordering, fetching, caching, routing and stale product responses.
- New targets or corrections of existing target-reachability gaps.
- Pagination, filtering, column-management, tree, grouping, sticky-column, or
  context-menu anatomy beyond the stable parts explicitly recorded here.
- Tree, grouping, expanded details, arbitrary structural row replacement or
  variable-height content in the fixed-height v1 admission domain.
- A global correction of legacy nonvirtualized paginated ARIA.
- TableHeader, TableBody, TableFooter, and TableRow element contracts;
  `component:TableHeader`, `component:TableBody`, `component:TableFooter`, and
  `component:TableRow` own them.
- TableCell, TableHeaderCell, and TableSelectionToolbar contracts;
  `component:TableCell`, `component:TableHeaderCell`, and
  `component:TableSelectionToolbar` own them.

## Public concepts

| Concept                    | Closed values or states                                                                       | Meaning                                                                  | Availability by variant/orientation/state                                                 | Default                                  | Owner                 | Stability | Invalid-value behavior                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| Plugin collection          | Named record or absent                                                                        | Ordered `TablePlugin` contributions                                      | Data mode                                                                                 | Absent                                   | Table                 | Stable    | Development warns for unknown transform keys, non-functions and empty plugins; unsupported keys are ignored. |
| Plugin transform           | Column, element, wrapper, context                                                             | One sequential parent phase                                              | Applicable phase                                                                          | Omitted is a no-op                       | Table                 | Stable    | Throw preserves accumulated value                                                                            |
| Render mode                | `data`, `children`                                                                            | Actual parent rendering branch, including empty data                     | Render/wrapper context                                                                    | Parent-derived                           | Table                 | Stable    | New data-only capability is inert in children mode                                                           |
| Canonical key              | String or finite number; missing/invalid/duplicate                                            | One resolved identity for callbacks, state and reconciliation            | Explicit identity opt-in                                                                  | Existing `idKey`                         | Table                 | Stable    | Invalid activation is inert; windowing fully renders with a diagnostic                                       |
| Transform context          | `TableRowContext`, `TableRenderContext`                                                       | Parent-owned immutable semantic facts and stable viewport reference      | Optional fourth row-transform, sixth cell-transform and second wrapper-transform argument | Supplied by Table                        | Table                 | Stable    | Missing context disables the dependent capability                                                            |
| Row model                  | `flat`, `tree`, `grouped`, `detail`, `custom`                                                 | Plugin's declared structural row model                                   | `TablePlugin.rowModel`                                                                    | No claim for an undeclared body modifier | Table                 | Stable    | Unsupported model disables the new flat-only capabilities                                                    |
| Whole-row owner            | `activation`, `expansion`, `navigation`, absent                                               | Plugin's declared whole-row interaction, not ordinary analytics/controls | `TablePlugin.wholeRowOwner`                                                               | Absent                                   | Table                 | Stable    | Competing claims neutralize activation independent of order                                                  |
| Module render-state source | Stable `subscribe`, `getSnapshot`, `getServerSnapshot` with immutable `{isLoading, hasMore?}` | Drives loading-sensitive parent rendering before sections are built      | Optional `TablePlugin.renderState`                                                        | Absent                                   | Table                 | Stable    | Missing source preserves ordinary empty rendering                                                            |
| Windowing capability       | Opaque `TableVirtualizationCapability` or absent                                              | Fixed-height pre-cell planning from `useTableRowsVirtualization`         | `Table.virtualization` in data mode with explicit `idKey`                                 | Absent                                   | Table/module boundary | Stable    | Invalid geometry/content falls back to full rendering                                                        |

Public availability is stable from first release; compatibility is additive.

`TableRowContext` supplies canonical `key`, `identityStatus` (`valid`, `missing`,
`invalid`, `duplicate`), row `kind` (`product`, `synthetic`, `unknown`), zero-based
`logicalIndex`, `logicalRowCount`, `headerRowCount` and the render context.
An admitted flat product dataset has `kind=product`; an unsupported structural
model may expose `unknown` rather than inventing a synthetic/product distinction.
The new flat-only capabilities are inactive for that model before row transforms.
`TableRenderContext` supplies `mode`, admitted row model, logical/header counts
and a stable parent-owned viewport reference. Context is semantic output, not a
caller-maintained second data/key/offset bundle; changing a referenced viewport
notifies resource consumers through the shared owner.

A body-row transform keeps its existing props/item/index arguments and may consume
an optional fourth context; a body-cell transform keeps its existing five arguments
and may consume the same context as an optional sixth argument. A wrapper transform
may consume an optional second render context. The row index is the logical index
in the complete input dataset, never renumbered because only a window is mounted.
Default and recognized row-index cell consumers receive that same parent position,
without building a second sliced-data/key lookup. Legacy row-index configuration
continues outside virtual mode; explicit nondefault position overrides conflict with
the virtual sequence and take the full-render fallback. Missing context from a
manual legacy transform call is not fabricated by a module.

`TablePlugin.renderState` optionally supplies a stable external-store source with
`subscribe`, `getSnapshot` and `getServerSnapshot`. Its immutable snapshot contains
`isLoading: boolean` and optional `hasMore: boolean`; the loading module publishes
both from the same controlled configuration and request lifetime. The snapshot is
referentially stable until either value changes; Table consumes it before building
sections. FR20 owns row-count interpretation: an admitted contribution with
`hasMore=true` marks a windowed table's remote total unknown, independently of its
current busy state. Absent `hasMore` makes no incremental-total claim. The source
introduces no caller-owned loading client, total-count prop or extra hook input.
It communicates a plugin's otherwise opaque in-flight latch before parent section
construction; `emptyState` alone accepts caller content but cannot observe that
module-owned request state without duplicating it in the caller. This is a plugin
protocol capability, not a new specialized caller loading prop. Explicit caller
empty content and `false` retain precedence over automatic default-message
suppression. Without a render-state contribution, ordinary EmptyState behavior is
unchanged. Loading and viewport changes
notify their real shared owner, rather than relying on mutations of a ref as the
sole source of rendered output.

Consumer data, columns, props, module signatures and usage remain documented in
`Table.doc.mjs` and the member and module docs.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Basis                                                                                                                | Evidence state                                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1  | By default, Styled Table renders one named Scroll region around one observed content box and one semantic Table. The Scroll region takes the Table's own name (its `aria-labelledby`, else its `aria-label`), and a generic table name only when the Table has none. Its applicable axis is inline without windowing and both inline/block with admitted windowing. The viewport enters the keyboard order while at least one applicable axis effectively overflows. Inline overscroll is contained only while inline scrolling is effective; block chaining stays allowed, and fitting content passes gestures to its ancestor. Explicit scroll-wrapper plugin HTML attributes remain authoritative.                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `spec:AST-025` FR12, FR14, FR19, FR21; current source, docs, and tests                                               | Legacy inline entry/containment verified; both-axis opt-in entry requires implementation evidence                                                                                    |
| FR2  | Data-driven mode renders a Body section and a Header section with Column header cells when columns are present. Without windowing, each data item renders a standard Row and Cells; FR18 limits row/cell construction to the admitted mounted plan. Empty data renders the configured empty-state row when enabled, subject to FR22's default initial-loading suppression. It never creates a Footer section. Each Column header cell shows its column's `header`, and the column `key` only when `header` is omitted, `null`, or `undefined`; any other `header` renders as React renders it, so `header: ''`, the blank header of an actions column, renders an empty Column header cell, not the key (`architecture:react-component-runtime` INV16).                                                                                                                                                                                                                                                                                                                                                                                                   | Current source, docs, and tests                                                                                      | Legacy rendering verified; FR18/FR22 exceptions require implementation evidence                                                                                                      |
| FR3  | Children mode passes caller composition through to the Table. TableHeader, TableBody, and TableFooter provide the respective sections, and TableRow, TableHeaderCell, and TableCell provide standard rows and cells.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Current source, docs, and tests                                                                                      | Verified current composition; no new API or DOM rule                                                                                                                                 |
| FR4  | `Table.doc.mjs` is the canonical aggregate consumer owner for the eight current targets: `table`, `table-scroll-wrapper`, `table-header`, `table-body`, `table-footer`, `table-row`, `table-cell`, and `table-header-cell`. Member docs retain direct lookup metadata through `subComponentOf: 'Table'`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current docs and CLI target tests                                                                                    | Verified parent ownership; focused placement coverage is partial                                                                                                                     |
| FR5  | For a sortable column, useTableSortable renders a Sort control around the column label, an Icon-owned Sort indicator glyph, and a numeric Sort priority only while multi-sort has more than one active entry. The Sort indicator glyph resolves through the `table-sort-indicator` component icon slot, passing `{direction}`: `ascending`, `descending`, or `none` while the column is unsorted. With no theme entry it is `arrowUp`, `arrowDown`, or `arrowsUpDown`. When the slot resolves to no icon (a theme value of `null`, a slot function that returns `null`, or a request with `icon: null`), only the glyph is hidden: the Sort control, its label, its sorting, and the header's `aria-sort` remain, the hidden glyph takes no space beside the label, and a sorted column then shows no visible sort cue. A request `size` changes only the glyph, never the Sort control or the header row.                                                                                                                                                                                                                                                | Current source, docs, and tests; `architecture:icon-resolution-and-component-slots/INV2,INV4–INV8` for the icon slot | Control and priority are tested; glyph presence is source-inspected only; the icon slot awaits implementation                                                                        |
| FR6  | useTableSelection renders CheckboxInput-owned Selection controls in the generated selection Column header cell and each selectable body Cell; selection remains row state rather than separate anatomy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source, docs, and tests                                                                                      | Verified stable delegated controls; no target or state change                                                                                                                        |
| FR7  | For an expandable row, useTableRowExpansion renders an Expansion control with an Icon-owned Expansion glyph and conditionally appends an Expanded detail panel whose cell spans the column count captured by that plugin's `transformColumns` step. The Expansion glyph resolves through the `table-row-expand` component icon slot, passing `{expanded}`. With no theme entry it is `chevronRight`. Whatever the slot resolves, the control turns the glyph a quarter turn while the row is expanded and mirrors it in right-to-left layouts. When the slot resolves to no icon (a theme value of `null`, a slot function that returns `null`, or a request with `icon: null`), only the glyph is hidden: the Expansion control, its name, `aria-expanded`, and its toggling remain, and the control shows no glyph. A request `size` changes only the glyph.                                                                                                                                                                                                                                                                                            | Current source, docs, and tests; `architecture:icon-resolution-and-component-slots/INV2,INV4–INV8` for the icon slot | Verified stable plugin parts; current target gaps remain; the icon slot awaits implementation                                                                                        |
| FR8  | Empty data renders the default compact EmptyState unless the caller supplies replacement content or disables it, with FR22 suppressing only the default during admitted initial loading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current source, docs, and tests                                                                                      | Legacy delegation verified; FR22 loading exception requires implementation evidence                                                                                                  |
| FR9  | Table converts the caller's named plugin record into one ordered array after its built-in styling plugin. Known names use the current canonical sequence `columnSettings → sort → tree → selection → pagination`; every other name follows that known set while preserving its record insertion order.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Current source and docs                                                                                              | Current shared ordering; canonical-name coverage is source-inspected                                                                                                                 |
| FR10 | Every applicable non-context transform runs sequentially in the resolved plugin-array order, so a later plugin receives the value returned by every earlier successful plugin. A throwing transform reports a development error and leaves the prior accumulated value in the pipeline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Current source and tests                                                                                             | Sequential composition is tested; failure isolation is source-inspected                                                                                                              |
| FR11 | `transformColumns` completes before element transforms. Table then applies table, header-cell/header-row, body-cell/body-row, scroll-wrapper, and context phases at their render points. Header-cell contributions use `before`, `content`, `after`, `overlay`, and `below` slots. Content in a header cell's `overlay` slot never joins the header's accessible name. Context transforms run in reverse so the first plugin becomes the outermost provider.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source, types, and tests                                                                                     | Transform application is tested; complete cross-phase order is source-inspected                                                                                                      |
| FR12 | When built-in and named plugin references are unchanged, Table reuses the resolved plugin array; unknown/custom plugin value identity and insertion order remain stable inputs to memoization.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Current source and performance tests                                                                                 | Current performance contract; focused named-order coverage is partial                                                                                                                |
| FR13 | In data-driven mode, each explicit column whose `width` is omitted keeps one equal flexible share and a 60px readability floor. A column sets its own floor with `proportional(value, {minWidth})`, which replaces the 60px floor for that column; Table has no table-wide floor setting. Resolution is a pure function of the final column definitions: row values, rendered header/body measurement, locale, sorting, filtering, virtualization, and loading state do not change any floor. Explicit pixel and proportional widths retain their authored floors. One exception: in a windowed table, a recognized row-index cell consumer, such as the `useTableRowIndex` column, widens to fit the last position in its own font and padding. Table measures this in its first client layout pass and again whenever the logical row count or the column's font or padding changes, before a wider position paints, so windowing never clips a mounted position or falls back mid-scroll; unwindowed tables keep the authored width. When the resolved floors exceed available inline space, the existing Scroll region provides horizontal overflow.  | `component:Table/DEC-2`; current source and tests                                                                    | Verified by width-resolution unit coverage and the ResponsiveScroll real-browser geometry fixture; the windowed row-position floor awaits implementation evidence                    |
| FR14 | Wherever Table shows a row divider, including while rows glide and in pinned columns, the divider has the width, style and colour the row's border would have: the theme's tokens and any app override on `tr`, `tbody` or `td` borders, so customizations still show.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `component:Table/DEC-3`                                                                                              | Verified by row-expansion glide unit coverage and real-browser divider checks, pinned cells and an open panel included; a transient 1 px WebKit pinned-cell step is a recorded gap   |
| FR15 | `useTableRowExpansion` takes an `animatedLayout` option, the handle `spec:AST-105` FR1 defines: when an Expanded detail row opens, the panel plays in and the rows after it glide to their new places; when one closes, it hides at once and the rows after it glide up into its space (`spec:AST-105` Coverage). The Expansion glyph turns on the same motion; under reduced motion the rows move without travel (`spec:AST-105` FR4). Without the option, rows change at once. A table that draws column lines (`dividers="grid"` or `"columns"`) does not glide yet: with the option its panel and rows change at once, as without it, and the glyph keeps its own turn. A `panelVariant="muted"` panel paints its wash on its cell, so the wash slides in with the panel's content (`spec:AST-105` FR9).                                                                                                                                                                                                                                                                                                                                              | `spec:AST-105` FR1, FR4, FR9; owner decision, 2026-10-26                                                             | Opening and closing glides, the case without a handle, the glyph's turn, reduced motion and column lines are tested; the panel's entrance and its hide on close are source-inspected |
| FR16 | Activation and windowing use one explicit canonical `idKey`. Property keys resolve valid strings/finite numbers through the existing string projection; function keys retain string/finite-number type. Missing, null, nonprimitive, nonfinite and duplicate values are invalid for these opt-ins. Table validates the complete logical dataset on data/key changes and supplies status; activation is inert on invalid rows and windowing falls back to full rendering. Internal type-tagged reconciliation keys distinguish numeric `0` from string `"0"` without changing callback equality. Invalid fallback keys are deterministic per record but promise no preserved state under invalid identity. Legacy keys without these opt-ins remain unchanged.                                                                                                                                                                                                                                                                                                                                                                                             | DEC-4; identity and compatibility boundary                                                                           | Specified; release verification required                                                                                                                                             |
| FR17 | Table supplies immutable `TableRowContext` and `TableRenderContext` rather than requiring module extractors or DOM mode inference. Row model and whole-row owner declarations precede eligibility/element transforms. Flat capability admission excludes tree/grouped/detail/custom structural output and unknown body modifiers without a compatible declaration. First-party `useTableSelection` and `useTableStickyColumns` declare `rowModel: 'flat'`; their selection cells and pinned-cell wrappers preserve flat product-row structure. More than one whole-row owner claim, including repeated activation entries, neutralizes activation in either plugin order, preserves the old owners and non-owning handlers, and emits one development diagnostic. A custom callback that owns a whole-row action must declare it; Table never infers arbitrary callback intent.                                                                                                                                                                                                                                                                           | DEC-4; shared protocol                                                                                               | Specified; release verification required                                                                                                                                             |
| FR18 | `Table.virtualization` is an opaque geometry capability; runtime admission requires data mode, explicit identity and constrained content together. The optional prop preserves the exported Table props interface; invalid combinations take the diagnostic full-render fallback. Table resolves complete input order, columns and identity, then plans mounted keyed records and inaccessible gaps before cell construction. Only mounted product/focus-island records enter element transforms. Default virtualized cells use existing single-line `textOverflow="truncate"`; explicit wrap, arbitrary row/cell renderers or unsafe structural output falls back to full rendering. Without opt-in, default wrapping and ordinary rendering remain unchanged.                                                                                                                                                                                                                                                                                                                                                                                           | DEC-5; native rendering and bounded work                                                                             | Specified; release verification required                                                                                                                                             |
| FR19 | Windowing uses the existing Table viewport/content-box composition on both logical axes with a bounded block size. Effective inline overflow contains chaining; block chaining remains allowed. Keyboard access, logical mapping, sticky/header/column behavior and geometry consumers share that owner, stable refs, pooled resize work and at most one scroll subscription/pending frame. No module creates a parallel ScrollableArea, detector or unknown external root. Modules without a Table block viewport may use viewport intersection; absent wrapper/context does not fabricate an after-table surface.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | DEC-5; `spec:AST-025` FR12/FR18/FR19                                                                                 | Specified; release verification required                                                                                                                                             |
| FR20 | In virtualized flat nonempty data, the parent logical sequence assigns header indices 1 through H and product row i index H+i+1. Table owns `aria-rowcount`: it is `-1` while any currently admitted incremental-loading render-state contribution reports `hasMore=true`, including idle, busy and retry-paused states; otherwise it is the complete current count H+N. Loading publishes availability, not a separate total or ARIA writer, and virtualization consumes this same parent rule. Appending while more data remains does not turn the unknown total into a loaded-row count; exhaustion makes the total exact and renewed availability makes it unknown again. Visible numbering derives i+1 from the same zero-based index. Inaccessible gaps are excluded. Logical parity/final-row state, not gap-relative DOM position, controls striping/dividers. Caller legacy offsets/counts conflict with this mode and cause full-render fallback rather than a second source of truth. Empty data uses the existing placeholder/disabled-empty branch without a virtual metadata override. Nonvirtualized paginated metadata remains unchanged. | DEC-5; complete semantic sequence                                                                                    | Specified; release verification required                                                                                                                                             |
| FR21 | Selection and activation publish semantic row state to one parent-coordinated paint resolution path. Selection wash wins while selected with row highlight enabled; otherwise activation's component fallback may apply, and the activation-owned non-colour cue remains independent. `hasRowHighlight=false` removes only selection wash. One effective overlay reaches ordinary/pinned cells and gives the same output for selection-first or activation-first updates; clearing either state restores the other applicable state, hover/striping and focus. No competing module writer removes another module's overlay or changes selection semantics.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Shared row-state ownership; activation presentation boundary                                                         | Specified; release verification required                                                                                                                                             |
| FR22 | A loading module's stable render-state source notifies Table before section construction. Table resolves current data-mode, flat-model and wrapper admission first and ignores loading contributions from unsupported or no-chrome configurations. While admitted complete data is empty and effective loading is true, Table suppresses only the default EmptyState; explicitly caller-owned empty/error content remains caller-controlled. Completion/reset restores ordinary empty behavior if appropriate. If exhaustion removes the focused manual command, or virtual-row removal otherwise detaches current focus, the existing focus owner moves focus first to the named Table Scroll region with `preventScroll`, using temporary programmatic-only focusability when it has no sequential stop. No move occurs when the caller already moved focus to a surviving successor or focus already left the removed subtree; the temporary attribute is removed/restored on departure without changing explicit caller attributes.                                                                                                                   | Loading/render and focus ownership boundary                                                                          | Specified; release verification required                                                                                                                                             |

### Current evidence and gaps

- The `table`, `table-scroll-wrapper`, `table-row`, `table-cell`, and
  `table-header-cell` placements have focused runtime assertions. The
  `table-header`, `table-body`, and `table-footer` placements are source-inspected;
  existing section tests assert element structure and prop forwarding but not the
  target classes.
- Sort tests assert the Sort control, labels, state, and conditional priority, but
  the test named `renders sort icon for sortable columns` checks only the buttons.
  Sort indicator glyph presence is source-inspected and lacks focused regression
  evidence. Selection and expansion suites assert their stable controls, states,
  and panel structure; delegated Icon and CheckboxInput target classes also remain
  source-inspected.
- The Expanded detail panel uses raw `tr` and `td` elements rather than TableRow
  and TableCell, so the existing `table-row` and `table-cell` targets do not reach
  that panel wrapper. Its `colSpan` comes from the column count captured when the
  expansion plugin runs `transformColumns`; a later custom plugin can add or remove
  columns and leave the span stale. The current full-span test covers only the case
  where expansion captures the final column set. This contract records both gaps
  and does not correct them.
- While rows glide, WebKit can draw a row's divider (FR14) one pixel higher or
  lower under a pinned cell than under the scrolling cells: at some fractional
  positions of the gliding row, the two parts round to different pixels. The step
  lasts only while the row glides; at rest the divider is level. This contract
  records the gap and does not correct it.

### Allowed variation

- **AV1 - Rendering mode.** Data-driven mode generates sections, rows, and cells;
  children mode uses the caller-supplied composition without changing aggregate
  ownership.
- **AV2 - Repetition and content.** Column, Row, and Cell counts and caller-owned
  content may vary without creating new anatomy parts.
- **AV3 - Optional parts.** Header section, Footer section, default EmptyState,
  Sort, Selection, and Expansion parts may be absent according to columns,
  rendering mode, plugin configuration, data, and row eligibility. The Sort
  indicator glyph and the Expansion glyph are also absent when their icon slot
  resolves to no icon (FR5, FR7).
- **AV4 - Delegated rendering.** CheckboxInput, Icon, and EmptyState may change
  internal element shape while preserving their own public contracts.
- **AV5 - Module participation.** Any named module may omit transform phases it does
  not need. Unknown/custom plugin names remain valid and follow the shared fallback
  ordering without acquiring module-local semantics here.

### Representative states

| State                       | Required invariant                                                                                                                                                                                                                           | Allowed variation                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Data-driven rows            | Scroll region contains Table, Header when columns exist, and Body; one Row with Cells per item without windowing, or only FR18's mounted plan with windowing.                                                                                | Counts, values, density, dividers, and cell content.                                                                           |
| Width-less explicit columns | Every omitted-width column remains equally flexible above a 60px floor; combined floors trigger the existing Scroll region only when they no longer fit.                                                                                     | Row values, header nodes, sorting/filtering, virtualization, loading or empty rows, direction, and responsive container width. |
| Empty data                  | Default EmptyState is present unless replaced/disabled or FR22 suppresses it during admitted initial loading; ordinary empty output resumes on completion.                                                                                   | Caller replacement content or no empty state.                                                                                  |
| Children mode               | Caller-supplied sections are passed directly to Table.                                                                                                                                                                                       | Header, Body, and Footer section presence and content.                                                                         |
| Sortable column             | Column header cell contains the Sort control and, unless the `table-sort-indicator` slot resolves to no icon (FR5), the Sort indicator glyph.                                                                                                | Direction and conditional multi-sort priority.                                                                                 |
| Selectable rows             | Selection controls occupy generated header and body cells.                                                                                                                                                                                   | Checked, indeterminate, disabled, or absent per row.                                                                           |
| Expandable row              | Expansion control occupies a generated Cell and, unless the `table-row-expand` slot resolves to no icon (FR7), holds the Expansion glyph; open state adds the detail panel after its row using the expansion plugin's captured column count. | Expanded state, caller detail content, and later plugin column transforms.                                                     |
| Multiple plugins            | Built-in styling runs first, then named plugins compose in the resolved order; later transforms receive earlier results.                                                                                                                     | Supported transform subset, custom names, and omitted phases.                                                                  |

### Transformation and precedence order

- **ORD1 - Plugin array.** Built-in plugins precede named consumer plugins. Known
  names sort by the canonical list; unknown/custom names retain record insertion
  order after the known set.
- **ORD2 - Sequential transforms.** Each non-context phase reduces over that array
  from first to last. A later plugin receives the earlier accumulated value.
- **ORD3 - Render phases.** Column transforms complete before element transforms;
  element transforms run at the table, header, body, and scroll-wrapper render
  points. Context transforms run from last to first so array priority and provider
  nesting agree: the first plugin is outermost.
- **ORD4 - Module boundary.** Module records may rely on this protocol and state the
  transforms they contribute, but they do not redefine aggregate phase or
  named-plugin ordering.

- **ORD5 - Opt-in preparation.** Resolve declared row-model/whole-row admission and
  canonical identity, consume stable render-state sources, and prepare the logical
  window/gap plan before section/cell construction. Row/cell contexts derive from
  that same plan; wrapper chrome does not privately slice already-built rows.
- **ORD6 - Empty/loading and focus.** FR22 gates effective loading by admitted mode,
  replaces only the default initial empty message, and keeps exhaustion focus
  return with the existing command/Scroll-region owner.

### Performance and resources

- **PR1 - Stable plugin array.** Table reuses the resolved plugin array while the
  built-in array and named plugin values are referentially unchanged, including
  when the caller recreates the containing record.
- **PR2 - Module ownership.** Each module owns any stronger render, allocation,
  listener, observer, or initialization constraint created by its transforms.
  Table owns the common array/transform pipeline, opt-in O(N) canonical-identity
  validation on data/key changes, the pre-cell mounted render plan, and its one
  shared viewport/content observation and bounded pending frame. A current-window
  scroll performs no O(N) identity pass. The virtualization module's PR budgets
  constrain its use of that parent path; stronger independent module work remains
  with that module.
- **PR3 - Static width resolution.** Explicit-column floors resolve in the existing
  O(column count) pass without DOM measurement, observers, extra render passes, or
  dependence on row values. The server and client therefore derive the same inline
  width styles from the same column definitions. FR13's windowed row-position floor
  is the one exception: server output and the first client render use the authored
  width, and Table measures the floor in its first client layout pass and again
  whenever the logical row count or the column's font or padding changes, before a
  wider position paints.

## Accessibility contract

The Scroll region is named as a `group`. Without windowing, inline is its
applicable axis; admitted windowing makes inline and block applicable. The default
viewport is a sequential keyboard stop while at least one applicable axis can
scroll, so fitting columns never hide a vertically windowed Table's Arrow/Page
scrolling path. A fitting viewport has no default sequential stop. Explicit
scroll-wrapper accessibility props remain authoritative, and removing overflow
does not move or blur existing focus. Effective inline overflow contains
overscroll; block chaining remains allowed. On focused-command or virtual-row
removal, the shared focus owner may use temporary programmatic-only focusability
as FR22 specifies without adding a lasting tab stop or stealing caller-moved
focus. Native Table structure, header scope, sort/selection/expansion semantics
remain independently owned; the shared pipeline never confers correctness on a
module's output.

## Design relationships

| Anatomy or state      | Design requirement                                                                                                  | Representation authority       | Hierarchy role | Component contract |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------- | ------------------ |
| Table                 | Groups the semantic table structure.                                                                                | Current source and public docs | Supporting     | FR1-FR4            |
| Scroll region         | Provides keyboard-reachable overflow on applicable axes; inline normally, inline and block with admitted windowing. | Current source and public docs | Supporting     | FR1, FR4           |
| Header section        | Groups Column header cells separately from body data.                                                               | Current source and public docs | Supporting     | FR2-FR4            |
| Column header cell    | Identifies one column and hosts optional header controls.                                                           | Current source and public docs | Prominent      | FR2-FR6            |
| Sort control          | Activates sorting for one sortable column.                                                                          | Current source and public docs | Prominent      | FR5                |
| Sort indicator glyph  | Shows the current sort direction through Icon; absent when the `table-sort-indicator` slot resolves to no icon.     | `component:Icon`               | Supporting     | FR5                |
| Sort priority         | Shows a column's position in active multi-sort order.                                                               | Current source and public docs | Supporting     | FR5                |
| Selection control     | Selects all eligible rows or one eligible row through CheckboxInput.                                                | `component:CheckboxInput`      | Prominent      | FR6                |
| Body section          | Groups data, empty-state, and expanded-detail rows.                                                                 | Current source and public docs | Supporting     | FR2-FR4, FR7, FR8  |
| Row                   | Groups standard header, body, or footer cells.                                                                      | Current source and public docs | Supporting     | FR2-FR4, FR6       |
| Cell                  | Contains one value or caller-provided content in a standard body or footer row.                                     | Current source and public docs | Prominent      | FR2-FR4, FR6, FR7  |
| Default empty state   | Communicates that the current data array has no rows through EmptyState.                                            | `component:EmptyState`         | Prominent      | FR8                |
| Expansion control     | Expands or collapses one eligible row.                                                                              | Current source and public docs | Prominent      | FR7                |
| Expansion glyph       | Shows the current expansion direction through Icon; absent when the `table-row-expand` slot resolves to no icon.    | `component:Icon`               | Supporting     | FR7                |
| Expanded detail panel | Presents caller-provided detail content in a spanning row below the expanded row.                                   | Current source and public docs | Prominent      | FR7                |
| Footer section        | Groups caller-supplied summary or total rows below the body.                                                        | Current source and public docs | Supporting     | FR3, FR4           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Table": {"target": "table"},
  "Scroll region": {"target": "table-scroll-wrapper"},
  "Header section": {"target": "table-header"},
  "Column header cell": {"target": "table-header-cell"},
  "Sort control": {"inherits": "table-header-cell"},
  "Sort indicator glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Sort priority": {
    "none": {
      "reason": "unsettled: The multi-sort rank has no direct public target and uses a component-owned accent style; future exposure still needs an owner decision"
    }
  },
  "Selection control": {
    "delegatesTo": {
      "owner": "component:CheckboxInput",
      "target": "checkbox-input"
    }
  },
  "Body section": {"target": "table-body"},
  "Row": {"target": "table-row"},
  "Cell": {"target": "table-cell"},
  "Default empty state": {
    "delegatesTo": {"owner": "component:EmptyState", "target": "empty-state"}
  },
  "Expansion control": {
    "none": {
      "reason": "unsettled: The expansion button has no direct public target and uses component-owned styles; future exposure still needs an owner decision"
    }
  },
  "Expansion glyph": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Expanded detail panel": {
    "none": {
      "reason": "reachability-gap: The plugin renders its detail row and cell as raw elements, so the current table-row and table-cell targets do not reach the panel wrapper"
    }
  },
  "Footer section": {"target": "table-footer"}
}
```

The exact map records all eight canonical Table targets once. TableHeader,
TableBody, TableFooter, TableRow, TableCell, and TableHeaderCell retain direct docs
linked by `subComponentOf: 'Table'`; they do not need independent component specs
for this aggregate ownership.

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, exact
  target mapping, delegation, inheritance, factual `none` classifications, and
  canonical target naming.
- `architecture:container-padding` owns the inherited inset protocol consumed by
  the Scroll region and Cell edge compensation. This container-system
  participation does not make Table a structural member of
  `family:layout-regions`.
- `architecture:interaction-modality` owns shared keyboard and pointer modality;
  Table and its plugins retain their current local interactions.
- `spec:AST-105` and FR15 retain the independently approved row-expansion animatedLayout decision.
- `architecture:public-component-api` owns stable public compatibility. Table's
  additions are optional transform context, the `rowModel`, `wholeRowOwner` and
  `renderState` plugin fields, and the atomic data-mode windowing opt-in;
  ordinary Table callers do not acquire new required fields.
- `module:Table/useTableRowStatus` owns the row-status module's API, generated
  anatomy, resolution and warning precedence, accessibility, performance,
  migration, and evidence. Table owns only the shared plugin protocol and its
  aggregate composition order.

## Verification map

| Contract               | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Representative states                                                                                                                                                                                                                                | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Audit section               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| FR1-FR3                | `Table.test.tsx` render, structure, fit/overflow transitions, children-mode, section, and target assertions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fitting and inline-overflowing data-driven tables, empty data, and children composition                                                                                                                                                              | Removing Table, Scroll region, observed content box, conditional keyboard access, or effective-axis containment fails existing role, structure, state, class, style, or prop-forwarding assertions; Row and Cell are conditional on rendered data or caller composition. Evidence gap: FR2's column `header` rule (the `key` fallback only when `header` is omitted, `null`, or `undefined`, so `header: ''` renders a blank header) is source-inspected; no test passes `header: ''`. | `audit:Table/anatomy`       |
| FR4                    | CLI discovery and API target tests plus source inspection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Direct member docs and unfiltered/scoped target output                                                                                                                                                                                               | Duplicating a parent/member target or changing the canonical owner fails parent-aware discovery assertions; section target placement remains source-inspected.                                                                                                                                                                                                                                                                                                                         | `audit:Table/theming`       |
| FR5                    | `plugins/sortable/useTableSortable.test.tsx`; the sort module contract (`plugins/sortable/__tests__/useTableSortable.a11y.ts`, self-tested by `useTableSortable.a11y.test.tsx`), which the Table binding composes onto the base Table contract for its sorted state (`__tests__/Table.a11y.test.tsx`, `__tests__/Table.a11y.chromium.spec.ts`); plus source inspection; for the icon slot, a `useTableSortable.test.tsx` slot suite, a real-browser check that a larger glyph keeps the Sort control's and header row's height and that a hidden glyph leaves no gap, and the slot inventory test | Unsorted, ascending, descending, and multi-sort; the theme slot unset, a slot function, `null`, and a size request                                                                                                                                   | Removing the Sort control, conditional priority, or ARIA state fails existing assertions. Removing the Sort indicator glyph does not currently fail a focused test; glyph presence and delegated Icon target placement remain source-inspected. For the icon slot, drawing the wrong fallback for a direction, ignoring the theme slot or its direction, letting `null` remove the control or its sorting, or a size request that grows the Sort control or the header row fails.      | `audit:Table/anatomy`       |
| FR6                    | `plugins/selection/useTableSelection.test.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Select all, individual, disabled, and non-selectable                                                                                                                                                                                                 | Removing header/body Selection controls or row selection state fails existing structure, label, interaction, and ARIA assertions; delegated CheckboxInput target placement remains source-inspected.                                                                                                                                                                                                                                                                                   | `audit:Table/anatomy`       |
| FR7                    | `plugins/rowExpansion/useTableRowExpansion.test.tsx` plus source inspection; for the icon slot, a `useTableRowExpansion.test.tsx` slot suite and the slot inventory test                                                                                                                                                                                                                                                                                                                                                                                                                          | Collapsed, expanded, and non-expandable rows; the theme slot unset, a slot function, `null`, and a size request                                                                                                                                      | Removing the Expansion control, conditional detail panel, captured-count `colSpan`, or ARIA state fails existing assertions in the covered plugin order; later column transforms, delegated Icon target placement, and untargeted panel wrappers remain source-inspected. For the icon slot, ignoring the theme slot or its `expanded` state, dropping the turn, or letting `null` remove the control, its name, or its toggling fails.                                                | `audit:Table/anatomy`       |
| FR8                    | `Table.test.tsx` empty-state suite plus EmptyState public target metadata                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Default, custom, disabled, and non-empty                                                                                                                                                                                                             | Removing conditional empty behavior fails existing assertions; default EmptyState delegation remains source-inspected.                                                                                                                                                                                                                                                                                                                                                                 | `audit:Table/anatomy`       |
| FR9-FR11               | `Table.test.tsx`, `types.ts`, `BaseTable.tsx`, and `useBaseTablePlugins.ts`; `useTableColumnResize.test.tsx` "the handle never adds to its column header\'s name (AR1)" and `TableColumnResizeName.a11y.chromium.spec.ts` for the `overlay` slot\'s name                                                                                                                                                                                                                                                                                                                                          | Built-in plus known and custom named plugins; every transform phase                                                                                                                                                                                  | Sequential composition, base-before-user behavior, transform application, and slot output have focused coverage; complete known-name sorting, phase order, exception continuation, and context nesting remain source-inspected.                                                                                                                                                                                                                                                        | `audit:Table/plugins`       |
| FR12, PR1              | `Table.perf.test.tsx` plus `useBaseTablePlugins.ts` source inspection                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Same plugin references, recreated record, and changed plugin value                                                                                                                                                                                   | Unchanged plugin values must preserve the resolved array and representative no-op row-update budgets; focused named-record identity coverage remains partial.                                                                                                                                                                                                                                                                                                                          | `audit:Table/performance`   |
| FR13, PR3              | `Table.test.tsx`, `plugins/columnResize/useTableColumnResize.test.tsx`, `plugins/stickyColumns/useTableStickyColumns.test.tsx`, and `Table.stories.tsx` ResponsiveScroll play assertions; for the windowed row-position floor, `plugins/rowIndex/useTableRowIndex.test.tsx` and a real-browser windowing check, including an append from 999 to 1,000 rows while scrolled to the end, re-measurement after a font, theme, density or host-inset change, and a pinned column after a widened row-number column keeping its inline start at the end of the columns before it (an overlap fails)     | Width-less columns with empty, short, and long-token rows; mixed explicit widths; pinned columns; narrow and fitting containers; windowed numbering at each density's first 48px overflow: compact row 10,000, balanced row 1,000, spacious row 100  | Removing the 60px floor, deriving it from row content, changing explicit width semantics, desynchronizing resize bounds or sticky offsets, or preventing the existing Scroll region from activating fails focused unit or real-browser geometry assertions. A windowed number column that clips a number, falls back when a longer number mounts or its font or padding changes (host inset included), or narrows below its authored width, or an unwindowed one that widens, fails.   | `audit:Table/layout`        |
| FR14                   | `__tests__/TableRowGlide.a11y.browser.spec.ts` screenshot checks of the divider mid-glide, in pinned columns, and under an open detail panel; `plugins/rowExpansion/useTableRowExpansion.glide.test.tsx` for the divider an open panel carries                                                                                                                                                                                                                                                                                                                                                    | a theme with a custom divider colour; an app override of a row's border; both mid-glide and on a pinned cell; an open detail panel's divider under the same theme and override                                                                       | a divider whose width, style or colour differs from the row's border, or that drops a theme or app override, fails                                                                                                                                                                                                                                                                                                                                                                     | `audit:Table/theming`       |
| FR15                   | `plugins/rowExpansion/useTableRowExpansion.glide.test.tsx` and `__tests__/TableRowGlide.a11y.browser.spec.ts`: row expansion with and without `animatedLayout`, plus source inspection of the panel's entrance and its hide on close                                                                                                                                                                                                                                                                                                                                                              | open and close with the handle; without it; reduced motion under a coarse and a fine pointer; a glyph turn beside the glide; a `dividers="grid"` and a `dividers="columns"` table with the option; a muted panel mid-open                            | rows that jump with the handle in a table without column lines, a closing panel that animates or leaves its space empty before the rows arrive, a panel and rows on different motion, a glyph on its own timing beside the glide, travel under reduced motion, or any motion without the handle a table with column lines that glides or animates its panel, or one whose glyph does not keep its own turn, fails                                                                      | `audit:Table/plugins`       |
| Accessibility contract | `__tests__/Table.a11y.test.tsx` and `__tests__/Table.a11y.chromium.spec.ts` bind Table to the base Table contract (`internal/a11y-spec`), composing each module's contract only for the states rendered with that module: the sort module contract (`plugins/sortable/__tests__/useTableSortable.a11y.ts`) for the sorted state; `__tests__/TableScroll.a11y.chromium.spec.ts` keeps the Scroll region evidence                                                                                                                                                                                   | Labelled data-driven, sorted descending, composed RTL with row headers, and empty data                                                                                                                                                               | Losing the table role or declared name, row, header, or cell roles, or a part leaving its row or the table, fails the base binding; a missing or stale `aria-sort` fails the composed sort module contract.                                                                                                                                                                                                                                                                            | `audit:Table/accessibility` |
| FR17 transform context | `TableRowContext.test.tsx` and `plugins/rowIndex/useTableRowIndex.test.tsx`: row, cell and scroll-wrapper contexts, row-model admission, read-tracked re-rendering, and row numbering from the context                                                                                                                                                                                                                                                                                                                                                                                            | Keys with and without `idKey`; flat, undeclared and declared row models; a re-sort with and without an index read; an appended row with a count read; numbering after a re-sort without `data`                                                       | A missing or mutable context, a renumbered or stale index, a moved row re-rendered for a plugin that never reads its index, or numbering from a data lookup fails                                                                                                                                                                                                                                                                                                                      | `audit:Table/plugins`       |
| FR16-FR22              | Pending parent protocol, render-count, API-compile, lifecycle and browser tests plus the module verification maps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Canonical type/key collisions; first-party flat declarations and diagnostic full-render fallbacks; invalid/unknown modes; both owner orders; optional context arities; full/empty/loading/windowed data; pinned paint; native focus and no-op frames | A second key/offset/renderer, order-selected owner, full cell work before slicing, stale source/ref, empty-loading contradiction, or removed focus destination fails                                                                                                                                                                                                                                                                                                                   | `audit:Table/plugins`       |
| Module backlink        | `scripts/check-knowledge.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Active parent and colocated module record                                                                                                                                                                                                            | A missing, duplicate, mis-parented, wrong-kind, misnamed, or undiscovered module record fails knowledge validation.                                                                                                                                                                                                                                                                                                                                                                    | `audit:Table/modules`       |
| Theming anatomy map    | `scripts/check-knowledge.mjs`, `themingTargets.test.ts`, and CLI parent-aware target discovery tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Canonical anatomy and eight current targets                                                                                                                                                                                                          | Missing, extra, duplicated, prefixed, stale, or independently owned member mappings fail repository validation or discovery coverage.                                                                                                                                                                                                                                                                                                                                                  | `audit:Table/theming`       |

## Decision log

### DEC-1 — Table adopts the shared scroll behavior on its owned viewport

**Reference:** `component:Table/DEC-1`
**Decider:** `cixzhang`, 2026-09-20

Table uses `useScrollableArea` on its existing Scroll region with a private observed
content box. Inline overflow remains native and keyboard reachable. Containment is
active only while that axis can scroll, so a fitting Table does not create a dead
scroll zone for an ancestor. This keeps one Table-owned viewport and adds no public
prop or parallel overflow detector.

### DEC-2 — Width-less explicit columns use a compact static floor

**Reference:** `component:Table/DEC-2`
**Decider:** `cixzhang`, 2026-10-07

A data-driven column with omitted `width` resolves as one flexible share with a
60px minimum. The floor is configured per column: `proportional(value,
{minWidth})` sets that column's floor, and `proportional()` without `minWidth`
keeps its 120px default. Resolution uses only column definitions, so pagination,
sorting, filtering, virtualization, empty and loading states, SSR, and hydration
cannot change any floor. One exception applies while `Table.virtualization`
windows a table: a recognized row-index cell consumer, such as the
`useTableRowIndex` column, keeps at least its authored width and widens to fit the
last position, the logical row count, in the column's own font and padding at the
active density. Table measures that width in its first client layout pass and
again whenever the logical row count or the column's font or padding changes,
before a wider position paints, because windowing must never clip a mounted
position or fall back to full rendering mid-scroll; unwindowed tables keep the
authored width. Rejected: deriving the floor from rendered or sampled content,
because it shifts with data and view state.

### DEC-3 — A drawn divider keeps the row border's source

**Reference:** `component:Table/DEC-3`
**Decider:** `cixzhang`, `2026-10-26`

A divider drawn in place of the real border, during a row glide or in a
pinned column, reads the row border's width, style and colour, from theme tokens and app overrides alike, so a
themed or customized table looks the same while rows move and where columns
are pinned.

Rejected: a drawn divider with its own fixed look.

### DEC-4 - Canonical identity and declared row ownership

**Reference:** `component:Table/DEC-4`
**Decider:** `humbertovirtudes`, `2026-11-03`

Identity, rendering mode and row classification are parent facts. Opt-in activation
and windowing consume one validated canonical key and immutable context; they do
not derive another key or use plugin names/private data prefixes to classify rows.
Type-tagged internal reconciliation keys preserve distinct valid canonical types.
Whole-row owners declare intent and conflicts neutralize activation independently
of insertion order, while non-owning handlers retain cancellation and side effects.
Legacy rendering is unchanged without these capabilities.

Rejected: inferring action ownership from arbitrary callback code or adding a second product-key extractor.

### DEC-5 - Window planning, logical positions and viewport stay in Table

**Reference:** `component:Table/DEC-5`
**Decider:** `humbertovirtudes`, `2026-11-03`

Table consumes the geometry-only virtualization capability with its complete data,
identity and columns. Admission and logical render planning happen before cells are
constructed; BaseTable remains the single native renderer. Context, full-table
positions, logical appearance and shared viewport/resize ownership are one parent
protocol. Fixed-height opt-in uses constrained truncation and full-render fallback
rather than clipping arbitrary content or silently altering legacy pagination.
The same coordinated row-paint path preserves selection and activation in either
update order.

Rejected: wrapper-only slicing, caller-spread data/offset bundles or a parallel Table/scroll renderer.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, module-local API or
generated anatomy, plugin usage recipes, container-padding mechanics, shared
modality rules, current audit results, or implementation steps. It links to their
owners.

---

<!-- source: docs/specs/components/Table/TableBody.spec.md -->


# TableBody component contract

## Contract at a glance

| Area                    | Contract                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Public contract         | `children`, root `BaseProps`, and a `ref`.                                                   |
| Behavior                | Renders the table's body section as a native `tbody` carrying the `table-body` target.       |
| End-user impact         | Assistive technology reads the body section as part of the table's structure.                |
| Builder impact          | None; the record describes shipped behavior.                                                 |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                   |
| Review checks           | Reject a non-`tbody` element, a lost target, or caller props or `ref` that miss the element. |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.     |

This table is a review projection; the body below is authoritative.

## Intent

TableBody is the body section a caller composes inside a children-mode Table. It
owns the native `tbody` element; the caller owns the rows inside it.

Consumer syntax and examples belong in `TableBody.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `tbody` element, which carries the `table-body` target that `component:Table`
  owns and maps.

**Does not own / non-goals**

- Rows — owned by `component:TableRow`; cells — owned by `component:TableCell`
  and `component:TableHeaderCell`; and the caller's content.
- Table appearance, data mode, and plugins — owned by `component:Table`.

## Public concepts

| Concept | Closed values or states | Meaning                       | Availability by variant/orientation/state | Default | Owner  | Stability | Invalid-value behavior |
| ------- | ----------------------- | ----------------------------- | ----------------------------------------- | ------- | ------ | --------- | ---------------------- |
| Content | ReactNode (rows)        | The rows of the body section. | Children-mode Table                       | none    | caller | Stable    | —                      |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                          | Basis                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1 | TableBody renders one `tbody` carrying the `table-body` target and holding its children, and adds no styles of its own.                                            | Current source and tests                                                |
| FR2 | `ref` reaches the `tbody`; supported DOM, data, ARIA, and event props reach it after the component's attributes; `xstyle`, `className`, and `style` compose on it. | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Rows.** Any rows may fill the body section.

### Representative states

| State      | Required invariant                 | Allowed variation |
| ---------- | ---------------------------------- | ----------------- |
| In a Table | A `tbody` in the table's children. | Rows.             |

### Transformation and precedence order

- **ORD1 — Root composition.** Target and caller styling compose, then caller
  props apply.

### Performance and resources

- **PR1 — No resources.** TableBody holds no state and adds no listener or
  observer.

## Accessibility contract

- **AR1 — Native section semantics.** The `tbody` keeps its native table
  section role; TableBody adds no role of its own.

## Design relationships

| Anatomy or state | Design requirement        | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------- | ------------------------ | -------------- | ------------------ |
| Body section     | The table's body section. | Current source and docs  | Supporting     | FR1                |

Theming: the `tbody` carries the `table-body` target, which `Table.doc.mjs`
maps as the Body section part of `component:Table`. `TableBody.doc.mjs` declares no
anatomy of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Table` owns appearance, data mode, plugins, and the target
  mapping.
- `architecture:public-component-api` owns caller-input routing; FR2 applies
  it.

## Verification map

| Contract  | Verification                                                           | Representative states | Mutation or failure expectation                                                                                                                                                                                | Audit section              |
| --------- | ---------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1, AR1  | `Table.test.tsx` children-mode section tests; `themingTargets.test.ts` | Children mode         | A missing `tbody` in the table's children fails. Gap: no test asserts the `table-body` class or that TableBody adds no role or styles. `themingTargets.test.ts` catches only a renamed or undocumented target. | `audit:TableBody/anatomy`  |
| FR2, ORD1 | `Table.test.tsx` section rest-forwarding test                          | `data-testid`, `id`   | A dropped `data-testid` or `id` fails. Gap: no test covers `ref`, event props, `className`, `style`, or `xstyle`.                                                                                              | `audit:TableBody/api`      |
| PR1       | Source review                                                          | Every state           | Gap: no automated check fails if TableBody adds state or a listener.                                                                                                                                           | `audit:TableBody/behavior` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableCell.spec.md -->


# TableCell component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `scope`, `headers`, `colSpan`, `rowSpan`, `contextMenuActions`, `xstyle` (one style or a list), root `BaseProps`, and a `ref`.                                         |
| Behavior                | A native `td` carrying the `table-cell` target that takes the enclosing Table's density, overflow, alignment, and divider treatment, optionally inside a context menu.             |
| End-user impact         | People read cell content with consistent spacing that lines up with the surrounding container, and can open row or cell actions from the cell.                                     |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                                       |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. One implementation gap is listed under Current-state impact.                                            |
| Review checks           | Reject a lost target or density reflection, edge padding that ignores the container inset, a context menu trigger that does not fill the cell, or caller props that miss the cell. |
| Governing rules         | `architecture:container-padding`; `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.                                                         |

This table is a review projection; the body below is authoritative.

## Intent

TableCell is the body cell a caller composes inside a children-mode Table, and
the cell Table renders in data mode. It owns the `td` and the cell treatment
the Table asks for; the caller owns the content.

Consumer syntax and examples belong in `TableCell.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Edge cells with actions keep their edge padding outside the trigger (FR3,
  FR4).** In the first and last cells of a row, the container-inset padding
  stays on the `td` while the context menu trigger carries its own density
  padding, so a secondary click on that strip opens the browser's menu and the
  content sits one density padding inside the inset.

## Ownership boundary

**Owns**

- The `td` element, which carries the `table-cell` target that `component:Table`
  owns and maps.
- Applying the Table's density, overflow, vertical alignment, and dividers, and
  wrapping content in a context menu when actions are given.

**Does not own / non-goals**

- Density, overflow, alignment, and divider settings — owned by
  `component:Table`.
- The context menu's behavior — owned by `component:ContextMenu`.
- Cell content — owned by the caller.

## Public concepts

| Concept             | Closed values or states                  | Meaning                                      | Availability by variant/orientation/state | Default | Owner  | Stability | Invalid-value behavior         |
| ------------------- | ---------------------------------------- | -------------------------------------------- | ----------------------------------------- | ------- | ------ | --------- | ------------------------------ |
| Table relationships | `scope`, `headers`, `colSpan`, `rowSpan` | Native cell associations and spans.          | Always                                    | none    | caller | Stable    | —                              |
| Context actions     | action list or getter; unset             | Actions shown in a context menu on the cell. | Always                                    | none    | caller | Stable    | An empty list renders no menu. |
| Content             | ReactNode                                | The cell's content.                          | Always                                    | —       | caller | Stable    | —                              |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Basis                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR1 | TableCell renders one `td` carrying the `table-cell` target, which reflects the Table's density, and holds its content. Outside a Table it adds no cell treatment.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current source and tests                                                |
| FR2 | Inside a Table, the cell pads by density (`compact` `--spacing-1` by `--spacing-2`, `balanced` `--spacing-2` by `--spacing-3`, `spacious` `--spacing-3` by `--spacing-4`) at body size, wraps or truncates text per the Table's `textOverflow`, aligns vertically per its `verticalAlign`, and draws dividers per its `dividers`: with `rows` or `grid`, a `--border-width` bottom border in `--color-border`, none in the section's last row; with `columns` or `grid`, an inline-end border, none on the row's last cell. While a glide moves its row, the bottom border goes transparent and one cell of the row draws a stand-in across the row's bottom edge (`component:Table` FR14). | Current source and tests                                                |
| FR3 | The first and last cells of a row pad their outer inline edge to the enclosing container's published inset, at least `--spacing-2`, falling back to the density padding outside a container. Implementation gap: in a first or last cell with context actions, the edge padding stays on the `td` outside the trigger, so the content sits one density padding inside the inset (FR4; Current-state impact).                                                                                                                                                                                                                                                                                | Current source; `architecture:container-padding`                        |
| FR4 | With context actions (a non-empty list or a getter), the content sits in a context menu trigger that fills the cell and carries the density padding, so the whole cell opens the menu; a getter resolves the actions when the menu opens. Implementation gap: in the first and last cells, the edge padding stays on the `td` outside the trigger, so a secondary click on that strip opens the browser's menu instead (Current-state impact).                                                                                                                                                                                                                                              | Current source and tests                                                |
| FR5 | `ref` reaches the `td`; supported DOM, data, ARIA, and event props reach it before the component's target and styles; `xstyle` (one style or a list), `className`, and `style` compose after component styles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Content.** Any content may fill the cell.

### Representative states

| State          | Required invariant                             | Allowed variation |
| -------------- | ---------------------------------------------- | ----------------- |
| Standalone     | A `td` with the target and no treatment.       | —                 |
| Each density   | Density padding and `data-density`.            | —                 |
| In a container | Outer edge cells align to the container inset. | —                 |
| With actions   | A full-cell context menu trigger.              | Actions.          |

### Transformation and precedence order

- **ORD1 — Styles.** Table treatment → context-menu adjustment → the glide's
  divider handling → caller `xstyle`, `className`, and `style`.

### Performance and resources

- **PR1 — No resources.** TableCell reads the Table's appearance; a context
  menu loads only when actions are given.

## Accessibility contract

- **AR1 — Native cell semantics.** The `td` keeps its native cell role and the
  caller's `scope`, `headers`, and spans; TableCell adds no role.

## Design relationships

| Anatomy or state | Design requirement                             | Representation authority | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Cell             | A body cell with density padding and dividers. | Current source and docs  | Supporting     | FR1–FR4            |

Theming: the `td` carries the `table-cell` target, which `Table.doc.mjs` maps as
the Cell part of `component:Table`. `TableCell.doc.mjs` declares no anatomy of
its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Table` owns appearance settings and the target mapping.
- `architecture:container-padding` owns the published inset FR3 reads.
- `component:ContextMenu` owns the context menu.

## Verification map

| Contract     | Verification                                                                                                                                           | Representative states                                                                                                             | Mutation or failure expectation                                                                                                                                                                                                                                                                                                                                           | Audit section              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR1, AR1     | `Table.test.tsx` children-mode and density-reflection tests; `themingTargets.test.ts`                                                                  | Children mode; each density                                                                                                       | A missing cell, a lost target, or a missing `data-density` fails. `themingTargets.test.ts` catches only a renamed or undocumented target.                                                                                                                                                                                                                                 | `audit:TableCell/anatomy`  |
| FR2          | `Table.test.tsx` density, overflow, divider, and vertical-alignment tests; `TableRowGlide.a11y.browser.spec.ts`; `useTableRowExpansion.glide.test.tsx` | Densities; wrap and truncate; dividers; mid-glide, pinned cells, themed and overridden dividers                                   | A mid-glide divider that does not move with its row, or the line on the wrong cell, fails in the glide checks. A truncating Table whose data-mode cells lose their truncating text wrapper, or a cell without the requested `vertical-align`, fails. Gap: the density and divider tests assert only that the table renders, and no test covers the cell's own truncation. | `audit:TableCell/layout`   |
| FR3          | Source review                                                                                                                                          | Inside Card, Section, Layout                                                                                                      | Gap: no test covers edge cells aligning to the container inset.                                                                                                                                                                                                                                                                                                           | `audit:TableCell/layout`   |
| FR4          | `tableContextMenu.test.tsx` body-cell row-actions and full-cell tests; `useTableRowExpansion.test.tsx` context-menu action test                        | Body cell with a list; body cell with a getter (expandable rows); full-cell trigger                                               | A body cell that ignores its action list or getter fails. Gap: the full-cell test checks only that the trigger has a class, so a trigger that does not fill the cell passes; no test covers an empty list or the edge-cell padding outside the trigger.                                                                                                                   | `audit:TableCell/behavior` |
| FR5, ORD1    | `Table.test.tsx` TableCell ref, `colSpan`, and `rowSpan` tests                                                                                         | `ref`; `colSpan`, `rowSpan`                                                                                                       | A ref off the `td` or a dropped `colSpan` or `rowSpan` fails. Gap: no TableCell test covers event props, `xstyle`, `className`, `style`, or the order in which caller styles follow the Table's treatment.                                                                                                                                                                | `audit:TableCell/api`      |
| PR1          | Source review                                                                                                                                          | Every state                                                                                                                       | Gap: no automated check covers lazy context-menu loading.                                                                                                                                                                                                                                                                                                                 | `audit:TableCell/behavior` |
| RTL relation | RTL audit curated D2 and D8 targets (`apps/storybook/rtl-audit/targets.json`) on the `In Card` story                                                   | A Card with `padding={0}`, where the first column's logical inline-start padding differs from its inline-end padding; LTR and RTL | A first column not at the inline start, or an edge padding that stays on the same physical side in RTL, fails D2 or D8.                                                                                                                                                                                                                                                   | `audit:TableCell/i18n-rtl` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableFooter.spec.md -->


# TableFooter component contract

## Contract at a glance

| Area                    | Contract                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Public contract         | `children`, root `BaseProps`, and a `ref`.                                                   |
| Behavior                | Renders the table's footer section as a native `tfoot` carrying the `table-footer` target.   |
| End-user impact         | Assistive technology reads the footer section as part of the table's structure.              |
| Builder impact          | None; the record describes shipped behavior.                                                 |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                   |
| Review checks           | Reject a non-`tfoot` element, a lost target, or caller props or `ref` that miss the element. |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.     |

This table is a review projection; the body below is authoritative.

## Intent

TableFooter is the footer section a caller composes inside a children-mode Table. It
owns the native `tfoot` element; the caller owns the rows inside it.

Consumer syntax and examples belong in `TableFooter.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `tfoot` element, which carries the `table-footer` target that `component:Table`
  owns and maps.

**Does not own / non-goals**

- Rows — owned by `component:TableRow`; cells — owned by `component:TableCell`
  and `component:TableHeaderCell`; and the caller's content.
- Table appearance, data mode, and plugins — owned by `component:Table`.

## Public concepts

| Concept | Closed values or states | Meaning                         | Availability by variant/orientation/state | Default | Owner  | Stability | Invalid-value behavior |
| ------- | ----------------------- | ------------------------------- | ----------------------------------------- | ------- | ------ | --------- | ---------------------- |
| Content | ReactNode (rows)        | The rows of the footer section. | Children-mode Table                       | none    | caller | Stable    | —                      |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                          | Basis                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1 | TableFooter renders one `tfoot` carrying the `table-footer` target and holding its children, and adds no styles of its own.                                        | Current source and tests                                                |
| FR2 | `ref` reaches the `tfoot`; supported DOM, data, ARIA, and event props reach it after the component's attributes; `xstyle`, `className`, and `style` compose on it. | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Rows.** Any rows may fill the footer section.

### Representative states

| State      | Required invariant                 | Allowed variation |
| ---------- | ---------------------------------- | ----------------- |
| In a Table | A `tfoot` in the table's children. | Rows.             |

### Transformation and precedence order

- **ORD1 — Root composition.** Target and caller styling compose, then caller
  props apply.

### Performance and resources

- **PR1 — No resources.** TableFooter holds no state and adds no listener or
  observer.

## Accessibility contract

- **AR1 — Native section semantics.** The `tfoot` keeps its native table
  section role; TableFooter adds no role of its own.

## Design relationships

| Anatomy or state | Design requirement          | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------- | ------------------------ | -------------- | ------------------ |
| Footer section   | The table's footer section. | Current source and docs  | Supporting     | FR1                |

Theming: the `tfoot` carries the `table-footer` target, which `Table.doc.mjs`
maps as the Footer section part of `component:Table`. `TableFooter.doc.mjs` declares no
anatomy of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Table` owns appearance, data mode, plugins, and the target
  mapping.
- `architecture:public-component-api` owns caller-input routing; FR2 applies
  it.

## Verification map

| Contract  | Verification                                                            | Representative states  | Mutation or failure expectation                                                                                                                                                                                                | Audit section                |
| --------- | ----------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| FR1, AR1  | `Table.test.tsx` section rest-forwarding test; `themingTargets.test.ts` | Inside a plain `table` | A missing `tfoot` fails. Gap: no test renders TableFooter inside a Table, asserts its `table-footer` class, or asserts that it adds no role or styles. `themingTargets.test.ts` catches only a renamed or undocumented target. | `audit:TableFooter/anatomy`  |
| FR2, ORD1 | `Table.test.tsx` section rest-forwarding test                           | `data-testid`, `id`    | A dropped `data-testid` or `id` fails. Gap: no test covers `ref`, event props, `className`, `style`, or `xstyle`.                                                                                                              | `audit:TableFooter/api`      |
| PR1       | Source review                                                           | Every state            | Gap: no automated check fails if TableFooter adds state or a listener.                                                                                                                                                         | `audit:TableFooter/behavior` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableHeader.spec.md -->


# TableHeader component contract

## Contract at a glance

| Area                    | Contract                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Public contract         | `children`, root `BaseProps`, and a `ref`.                                                   |
| Behavior                | Renders the table's header section as a native `thead` carrying the `table-header` target.   |
| End-user impact         | Assistive technology reads the header section as part of the table's structure.              |
| Builder impact          | None; the record describes shipped behavior.                                                 |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                   |
| Review checks           | Reject a non-`thead` element, a lost target, or caller props or `ref` that miss the element. |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.     |

This table is a review projection; the body below is authoritative.

## Intent

TableHeader is the header section a caller composes inside a children-mode Table. It
owns the native `thead` element; the caller owns the rows inside it.

Consumer syntax and examples belong in `TableHeader.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `thead` element, which carries the `table-header` target that `component:Table`
  owns and maps.

**Does not own / non-goals**

- Rows — owned by `component:TableRow`; cells — owned by `component:TableCell`
  and `component:TableHeaderCell`; and the caller's content.
- Table appearance, data mode, and plugins — owned by `component:Table`.

## Public concepts

| Concept | Closed values or states | Meaning                         | Availability by variant/orientation/state | Default | Owner  | Stability | Invalid-value behavior |
| ------- | ----------------------- | ------------------------------- | ----------------------------------------- | ------- | ------ | --------- | ---------------------- |
| Content | ReactNode (rows)        | The rows of the header section. | Children-mode Table                       | none    | caller | Stable    | —                      |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                          | Basis                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1 | TableHeader renders one `thead` carrying the `table-header` target and holding its children, and adds no styles of its own.                                        | Current source and tests                                                |
| FR2 | `ref` reaches the `thead`; supported DOM, data, ARIA, and event props reach it after the component's attributes; `xstyle`, `className`, and `style` compose on it. | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Rows.** Any rows may fill the header section.

### Representative states

| State      | Required invariant                 | Allowed variation |
| ---------- | ---------------------------------- | ----------------- |
| In a Table | A `thead` in the table's children. | Rows.             |

### Transformation and precedence order

- **ORD1 — Root composition.** Target and caller styling compose, then caller
  props apply.

### Performance and resources

- **PR1 — No resources.** TableHeader holds no state and adds no listener or
  observer.

## Accessibility contract

- **AR1 — Native section semantics.** The `thead` keeps its native table
  section role; TableHeader adds no role of its own.

## Design relationships

| Anatomy or state | Design requirement          | Representation authority | Hierarchy role | Component contract |
| ---------------- | --------------------------- | ------------------------ | -------------- | ------------------ |
| Header section   | The table's header section. | Current source and docs  | Supporting     | FR1                |

Theming: the `thead` carries the `table-header` target, which `Table.doc.mjs`
maps as the Header section part of `component:Table`. `TableHeader.doc.mjs` declares no
anatomy of its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Table` owns appearance, data mode, plugins, and the target
  mapping.
- `architecture:public-component-api` owns caller-input routing; FR2 applies
  it.

## Verification map

| Contract  | Verification                                                           | Representative states | Mutation or failure expectation                                                                                                                                                                                    | Audit section                |
| --------- | ---------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| FR1, AR1  | `Table.test.tsx` children-mode section tests; `themingTargets.test.ts` | Children mode         | A missing `thead` in the table's children fails. Gap: no test asserts the `table-header` class or that TableHeader adds no role or styles. `themingTargets.test.ts` catches only a renamed or undocumented target. | `audit:TableHeader/anatomy`  |
| FR2, ORD1 | `Table.test.tsx` section rest-forwarding test                          | `data-testid`, `id`   | A dropped `data-testid` or `id` fails. Gap: no test covers `ref`, event props, `className`, `style`, or `xstyle`.                                                                                                  | `audit:TableHeader/api`      |
| PR1       | Source review                                                          | Every state           | Gap: no automated check fails if TableHeader adds state or a listener.                                                                                                                                             | `audit:TableHeader/behavior` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableHeaderCell.spec.md -->


# TableHeaderCell component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `children`, `scope`, `contextMenuActions`, `xstyle` (one style or a list), root `BaseProps`, and a `ref`.                                                          |
| Behavior                | A native `th` carrying the `table-header-cell` target that takes the Table's density and column dividers, always draws its bottom divider, and truncates its text. |
| End-user impact         | People see column headings set apart by weight, color, and a rule, aligned with the cells below.                                                                   |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                       |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                                                                                         |
| Review checks           | Reject a missing bottom divider, a `scope` the caller did not set, a lost target or density reflection, or caller `xstyle` that loses to context styling.          |
| Governing rules         | `architecture:container-padding`; `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.                                         |

This table is a review projection; the body below is authoritative.

## Intent

TableHeaderCell is the header cell a caller composes inside a children-mode
Table, as a column header or, with `scope="row"`, a row header, and the column
header cell Table renders in data mode. It owns
the `th` and its header treatment; the caller owns the heading content.

Consumer syntax and examples belong in `TableHeaderCell.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — no `scope` unless given.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `th` element, which carries the `table-header-cell` target that
  `component:Table` owns and maps.
- Header weight, color, bottom divider, truncation, and the Table's density and
  column dividers on the header cell.

**Does not own / non-goals**

- Sorting, filtering, resizing, and selection controls in headers — owned by
  `component:Table` and its plugins.
- Heading content — owned by the caller.

## Public concepts

| Concept         | Closed values or states                     | Meaning                                        | Availability by variant/orientation/state | Default | Owner  | Stability | Invalid-value behavior         |
| --------------- | ------------------------------------------- | ---------------------------------------------- | ----------------------------------------- | ------- | ------ | --------- | ------------------------------ |
| Scope           | `col`, `row`, `colgroup`, `rowgroup`; unset | Native header scope.                           | Always                                    | unset   | caller | Stable    | Closed union.                  |
| Context actions | action list or getter; unset                | Actions shown in a context menu on the header. | Always                                    | none    | caller | Stable    | An empty list renders no menu. |
| Content         | ReactNode                                   | The heading.                                   | Always                                    | —       | caller | Stable    | —                              |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                            | Basis                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR1 | TableHeaderCell renders one `th` carrying the `table-header-cell` target, which reflects the Table's density, holding its content, with `scope` only when given. Outside a Table it adds no header treatment.                                                                                                                                                                                                                                        | Current source and tests                                                |
| FR2 | Inside a Table, the header cell uses semibold `--color-text-secondary` text aligned to the start, pads by the Table's density, truncates its text, aligns its outer edge cells to the container inset like `component:TableCell` FR3, and always draws a `--border-width` `--color-border` bottom divider, even when the Table's dividers are off. With `columns` or `grid` dividers it draws an inline-end divider that the last header cell omits. | Current source and tests                                                |
| FR3 | With context actions, the content sits in a context menu trigger.                                                                                                                                                                                                                                                                                                                                                                                    | Current source and tests                                                |
| FR4 | `ref` reaches the `th`; supported DOM, data, ARIA, and event props reach it before the component's target and styles; `xstyle` (one style or a list) wins over the context styling, and `className` and `style` compose alongside the target.                                                                                                                                                                                                        | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Content.** Any heading content may fill the cell.

### Representative states

| State           | Required invariant                                 | Allowed variation |
| --------------- | -------------------------------------------------- | ----------------- |
| Standalone      | A `th` with the target and no treatment.           | —                 |
| Each density    | Density padding and `data-density`.                | —                 |
| Dividers off    | The bottom divider still draws.                    | —                 |
| Column dividers | Inline-end divider except on the last header cell. | —                 |

### Transformation and precedence order

- **ORD1 — Styles.** Header treatment → column divider → caller `xstyle`,
  `className`, and `style`.

### Performance and resources

- **PR1 — No resources.** TableHeaderCell reads the Table's appearance and
  holds no state.

## Accessibility contract

- **AR1 — Native header semantics.** The `th` keeps its native header role — a
  column header, or a row header under `scope="row"` or `"rowgroup"` — with the
  caller's `scope` when given; truncation is visual only, so the full heading
  remains its accessible content.

## Design relationships

| Anatomy or state   | Design requirement                                            | Representation authority | Hierarchy role | Component contract |
| ------------------ | ------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Column header cell | A heading cell set apart by weight, color, and a bottom rule. | Current source and docs  | Supporting     | FR1, FR2           |

Theming: the `th` carries the `table-header-cell` target, which `Table.doc.mjs`
maps as the Column header cell part of `component:Table`.
`TableHeaderCell.doc.mjs` declares no anatomy of its own, so no anatomy-theming
block is declared here.

## Family and system relationships

- `component:Table` owns appearance settings, header controls, and the target
  mapping.
- `component:TableCell` FR3 defines the edge alignment the header cell shares.

## Verification map

| Contract     | Verification                                                                                                                           | Representative states                                                                                                             | Mutation or failure expectation                                                                                                                                                                      | Audit section                    |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1, AR1     | `TableHeaderCell.test.tsx` element, scope, and outside-Table tests; `Table.test.tsx` density-reflection test; `themingTargets.test.ts` | Default; `scope`; standalone; densities                                                                                           | A non-`th` element, an unrequested or missing `scope`, styling outside a Table, or a missing target or `data-density` fails. `themingTargets.test.ts` catches only a renamed or undocumented target. | `audit:TableHeaderCell/anatomy`  |
| FR2          | `TableHeaderCell.test.tsx` density, weight and color, bottom divider, and column divider tests                                         | Three densities; dividers off, rows, columns, grid                                                                                | Wrong density padding, weight, or color, a missing bottom divider, or a wrong column divider fails. Gap: truncation and edge alignment have no check.                                                | `audit:TableHeaderCell/layout`   |
| FR3          | `tableContextMenu.test.tsx` header context-menu tests                                                                                  | Header cell with actions                                                                                                          | A header cell with actions that does not open its menu, or one without actions that does, fails.                                                                                                     | `audit:TableHeaderCell/behavior` |
| FR4, ORD1    | `TableHeaderCell.test.tsx` xstyle, array xstyle, ref, attribute, and className and style tests                                         | Caller inputs                                                                                                                     | A ref off the `th`, a dropped attribute, context styling that beats `xstyle`, or a lost caller class or style fails.                                                                                 | `audit:TableHeaderCell/api`      |
| PR1          | Source review                                                                                                                          | Every state                                                                                                                       | Gap: no automated check fails if TableHeaderCell adds state.                                                                                                                                         | `audit:TableHeaderCell/behavior` |
| RTL relation | RTL audit curated D2 and D8 targets (`apps/storybook/rtl-audit/targets.json`) on the `In Card` story                                   | A Card with `padding={0}`, where the first column's logical inline-start padding differs from its inline-end padding; LTR and RTL | A first column not at the inline start, or an edge padding that stays on the same physical side in RTL, fails D2 or D8.                                                                              | `audit:TableHeaderCell/i18n-rtl` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableRow.spec.md -->


# TableRow component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `isHeaderRow`, `xstyle` (a list of StyleX styles), root `BaseProps`, and a `ref`.                                                            |
| Behavior                | A native `tr` carrying the `table-row` target that takes the enclosing Table's striping and hover treatment and holds its cells' divider during a glide. |
| End-user impact         | People can follow a row across the table by its stripe or hover highlight, and assistive technology reads it as a row.                                   |
| Builder impact          | None; the record describes shipped behavior.                                                                                                             |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes.                                                                               |
| Review checks           | Reject striping that counts an expansion panel, hover or striping on a header row, a lost target, or caller props that miss the row.                     |
| Governing rules         | `architecture:public-component-api` INV5–INV8; `architecture:component-theming-surface`.                                                                 |

This table is a review projection; the body below is authoritative.

## Intent

TableRow is the row a caller composes inside a children-mode Table, and the row
Table renders in data mode. It owns the `tr` and the row treatment the Table
asks for; the caller owns the cells.

Consumer syntax and examples belong in `TableRow.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — a body row.
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The `tr` element, which carries the `table-row` target that `component:Table`
  owns and maps.
- Applying the Table's striping and hover treatment to the row, and holding its
  cells' stand-in divider while a glide moves it.

**Does not own / non-goals**

- Whether the Table is striped, hoverable, or divided — owned by
  `component:Table`.
- Cells, which draw the row divider — owned by `component:TableCell`,
  `component:TableHeaderCell`, and the caller.

## Public concepts

| Concept  | Closed values or states | Meaning                              | Availability by variant/orientation/state | Default | Owner                | Stability | Invalid-value behavior |
| -------- | ----------------------- | ------------------------------------ | ----------------------------------------- | ------- | -------------------- | --------- | ---------------------- |
| Row kind | body; header            | Header rows skip striping and hover. | Inside a Table                            | body    | `component:TableRow` | Stable    | —                      |
| Content  | ReactNode (cells)       | The row's cells.                     | Always                                    | —       | caller               | Stable    | —                      |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                      | Basis                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| FR1 | TableRow renders one `tr` carrying the `table-row` target and holding its children. Outside a Table it adds no row treatment.                                                                                                                                                                                                                                                                                                  | Current source and tests                                                |
| FR2 | Inside a Table, a body row takes the Table's treatment: with striping, every even body row paints `--color-background-muted`, counting body rows only, so an expansion panel row does not shift the stripes; with hover, a hover-capable pointer paints `--color-overlay-hover`; with both, the hover color replaces the stripe; a row with `aria-disabled="true"` takes no hover. A header row (`isHeaderRow`) takes neither. | Current source and tests                                                |
| FR3 | Inside a Table with `rows` or `grid` dividers, every row, header rows included, is the containing block for its cells' stand-in divider while a glide moves it; the cells draw the divider (`component:Table` FR14).                                                                                                                                                                                                           | Current source and tests; `component:Table` FR14                        |
| FR4 | `ref` reaches the `tr`; supported DOM, data, ARIA, and event props reach it before the component's target and styles; `xstyle`, `className`, and `style` compose on it.                                                                                                                                                                                                                                                        | Current source and tests; `architecture:public-component-api` INV5–INV8 |

### Allowed variation

- **AV1 — Cells.** Any cells may fill the row.

### Representative states

| State            | Required invariant                                  | Allowed variation |
| ---------------- | --------------------------------------------------- | ----------------- |
| Standalone       | A `tr` with the target and no treatment.            | —                 |
| Striped body row | Even body rows muted; expansion panels not counted. | —                 |
| Hover body row   | Hover overlay under a hover-capable pointer.        | —                 |
| Header row       | No striping or hover.                               | —                 |

### Transformation and precedence order

- **ORD1 — Treatment.** Header row → no striping or hover; otherwise striping,
  then hover, from the Table; every row → the glide's containing block for its
  cells' divider; then the caller's `xstyle`, `className`, and `style`.

### Performance and resources

- **PR1 — No resources.** TableRow reads the Table's appearance and holds no
  state.

## Accessibility contract

- **AR1 — Native row semantics.** The `tr` keeps its native row role; striping
  and hover are visual only.

## Design relationships

| Anatomy or state | Design requirement                          | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Row              | A table row with optional stripe and hover. | Current source and docs  | Supporting     | FR1–FR3            |

Theming: the `tr` carries the `table-row` target, which `Table.doc.mjs` maps as
the Row part of `component:Table`. `TableRow.doc.mjs` declares no anatomy of
its own, so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Table` owns striping, hover, and divider settings and the target
  mapping.
- `architecture:public-component-api` owns caller-input routing; FR4 applies
  it.

## Verification map

| Contract  | Verification                                                                                  | Representative states                                          | Mutation or failure expectation                                                                                                                                                                                                                                                                        | Audit section             |
| --------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- |
| FR1, AR1  | `Table.test.tsx` row-count, row-class, and standalone-row tests; `themingTargets.test.ts`     | Data mode; standalone                                          | A missing row or lost `table-row` class fails. `themingTargets.test.ts` catches only a renamed or undocumented target; no check fails if a standalone row stops carrying its target.                                                                                                                   | `audit:TableRow/anatomy`  |
| FR2, ORD1 | `Table.test.tsx` header-hover and striped tests                                               | Hover on; striped                                              | A header row that takes hover styling fails. Gap: the striped test asserts only that rows render, and no test covers stripe parity around an expansion panel or the stripe and hover colors. No test covers the hover color replacing the stripe or a row with `aria-disabled="true"` taking no hover. | `audit:TableRow/visual`   |
| FR3       | `TableRowGlide.a11y.browser.spec.ts`; `useTableRowExpansion.glide.test.tsx`                   | Mid-glide; pinned cells; themed and overridden dividers        | A divider that does not move with its gliding row, or the line on the wrong cell, fails. Gap: no check isolates a header row as the containing block during a glide.                                                                                                                                   | `audit:TableRow/visual`   |
| FR4       | `Table.test.tsx` row className and style tests, and the TableRow ref and HTML-attribute tests | Inside a Table; standalone; `ref`; `aria-label`, `data-testid` | A caller class, style, ref, or DOM attribute that misses the row fails. Gap: no test covers `xstyle` or the order in which caller styles follow the Table's treatment.                                                                                                                                 | `audit:TableRow/api`      |
| PR1       | Source review                                                                                 | Every state                                                    | Gap: no automated check fails if TableRow adds state or a listener.                                                                                                                                                                                                                                    | `audit:TableRow/behavior` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.

---

<!-- source: docs/specs/components/Table/TableSelectionToolbar.spec.md -->


# TableSelectionToolbar component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `selection` (from useTableSelectionState), `startContent`, `label`, `renderSelectionLabel`, `clearLabel`, `size`, `variant`, and the other Toolbar props except `endContent`. |
| Behavior                | A bulk-actions Toolbar that appears while rows are selected, showing the caller's actions, the selected count, and a command that clears the selection.                       |
| End-user impact         | People act on selected rows together, see how many are selected, and clear the selection in one step.                                                                         |
| Builder impact          | None; the record describes shipped behavior.                                                                                                                                  |
| Compatibility/readiness | Released behavior recorded as current; no API, default, or output changes. One implementation gap is listed under Current-state impact.                                       |
| Review checks           | Reject a toolbar shown without a selection, an unlocalized default label, count, or clear label, or a clear command that leaves rows selected.                                |
| Governing rules         | `architecture:internationalization` INV1a; `spec:AST-085` FR4; `architecture:public-component-api`.                                                                           |

This table is a review projection; the body below is authoritative.

## Intent

TableSelectionToolbar is the bulk-actions bar for a Table with row selection.
It owns when the bar shows, the selection status, and the clear command; the
caller owns the actions.

Consumer syntax and examples belong in `TableSelectionToolbar.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` — `sm`, `muted`, localized "Bulk
  actions", "{count} selected", and "Unselect All".
- Compatibility class: records shipped behavior; no public prop, default, DOM,
  target, or styling output changes.
- Controlled/uncontrolled behavior: the selection is the shared state the
  caller passes.
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Focus lost after clearing (FR2).** Activating the clear command clears the
  selection, which removes the toolbar and the focused button with it; focus
  falls to the page, so keyboard users lose their place, where `spec:AST-085`
  FR4 has a component that removes a focused control name its destination.

## Ownership boundary

**Owns**

- Showing the toolbar only while rows are selected, the selected-count status,
  and the clear command.

**Does not own / non-goals**

- Toolbar layout, size, and variant — owned by `component:Toolbar`.
- The selection state — owned by useTableSelectionState.
- Bulk actions in `startContent` — owned by the caller.

## Public concepts

| Concept         | Closed values or states                       | Meaning                                                               | Availability by variant/orientation/state | Default            | Owner               | Stability | Invalid-value behavior               |
| --------------- | --------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- | ------------------ | ------------------- | --------- | ------------------------------------ |
| Selection       | shared selection state                        | Whether to show and what to count and clear.                          | Always                                    | —                  | caller              | Stable    | —                                    |
| Labels          | `label`, `clearLabel`, `renderSelectionLabel` | The toolbar's name, the clear command's label, and the count content. | Always                                    | localized defaults | caller              | Stable    | A count renderer may return nothing. |
| Toolbar options | `size`, `variant`, other Toolbar props        | Passed to the Toolbar.                                                | Always                                    | `sm`, `muted`      | `component:Toolbar` | Stable    | —                                    |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Basis                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | With no selection, TableSelectionToolbar renders nothing. With a selection, it renders a Toolbar named by `label` (localized "Bulk actions" by default) holding the caller's `startContent`, and at its end the selected-count content (localized "{count} selected" by default, or `renderSelectionLabel`'s result) and a ghost button labelled `clearLabel` (localized "Unselect All"). Default text comes from the catalog (`architecture:internationalization` INV1a). | Current source and tests |
| FR2 | The clear button clears the whole selection through the shared state, which removes the toolbar while the clear button holds focus. `spec:AST-085` FR4 has this record name where focus goes; the destination is open (OQ1). Implementation gap: focus is lost when the toolbar unmounts (Current-state impact).                                                                                                                                                           | Current source and tests |
| FR3 | `size` defaults to `sm` and `variant` to `muted`; other Toolbar props pass to the Toolbar, and `endContent` is not accepted.                                                                                                                                                                                                                                                                                                                                               | Current source           |

### Allowed variation

- **AV1 — Actions and labels.** Any actions and product-specific labels.

### Representative states

| State              | Required invariant                           | Allowed variation |
| ------------------ | -------------------------------------------- | ----------------- |
| No selection       | Nothing renders.                             | —                 |
| Selection          | Named toolbar, actions, count, clear button. | Labels.           |
| Custom empty count | The count renderer may render nothing.       | —                 |

### Transformation and precedence order

- **ORD1 — Labels.** Caller labels → catalog defaults.

### Performance and resources

- **PR1 — No resources.** TableSelectionToolbar holds no state of its own.

## Accessibility contract

- **AR1 — Named toolbar.** The bar is a Toolbar with an accessible name, and
  the clear command is a native button with its label.

## Design relationships

| Anatomy or state | Design requirement                                       | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Bulk actions bar | Actions, count, and clear command for the selected rows. | Current source and docs  | Supporting     | FR1–FR3            |

Theming: TableSelectionToolbar adds no target; the Toolbar and Button it
renders carry their own. `TableSelectionToolbar.doc.mjs` declares no anatomy,
so no anatomy-theming block is declared here.

## Family and system relationships

- `component:Toolbar` owns layout and theming.
- `spec:AST-085` FR4 owns focus after a focused control is removed; FR2
  records the gap.
- `architecture:internationalization` owns default text; FR1 applies INV1a.

## Verification map

| Contract       | Verification                                                                                             | Representative states                  | Mutation or failure expectation                                                                                                             | Audit section                          |
| -------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1, ORD1, AR1 | `TableSelectionToolbar.test.tsx` no-selection, actions and status, empty count, and custom-label tests   | No selection; selection; custom labels | A toolbar without a selection, a missing name, count, action, or clear button, or ignored custom labels fail.                               | `audit:TableSelectionToolbar/behavior` |
| FR2            | `TableSelectionToolbar.test.tsx` clear test                                                              | Clear                                  | A clear that leaves rows selected fails. Gap: no test covers where focus goes after clearing.                                               | `audit:TableSelectionToolbar/a11y`     |
| FR3, PR1       | `TableSelectionToolbar.test.tsx` defaults test; source review                                            | Defaults                               | A toolbar that does not default to `sm` and `muted` fails. Gap: no automated check fails if TableSelectionToolbar adds state or a listener. | `audit:TableSelectionToolbar/api`      |
| RTL relation   | RTL audit curated D2 target (`apps/storybook/rtl-audit/targets.json`) on `TableSelection / Bulk actions` | One row selected; LTR and RTL          | A selected count that is not at the inline start of "Unselect All" fails D2.                                                                | `audit:TableSelectionToolbar/i18n-rtl` |

## Decision log

None recorded. The record describes shipped behavior.

## Open questions

- **OQ1 — Where does focus go when Clear removes the toolbar?** (`human-api`)
  `spec:AST-085` FR4 has this record name the destination; until it does, a
  keyboard user who clears the selection loses their place.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or Table rules. It links to their owners.
