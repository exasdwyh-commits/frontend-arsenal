---
schema_version: 3
template_version: 3
kind: component
id: component:Icon
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/Icon/Icon.test.tsx,
    packages/core/src/Icon/__tests__/IconAudit.a11y.chromium.spec.ts,
    packages/core/src/IconButton/IconButton.test.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-087]
---

# Icon component contract

## Intent

Icon presents one visual symbol with consistent size, color, and accessibility
semantics. Consumer usage remains documented in `Icon.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes` for explicit sizes and standalone Icons
- Compatibility class: component-owned Icon slots may supply a contextual default;
  explicit Icon sizes and the standalone `md` fallback remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: no consumer migration; omit `size` when the owning Astryx
  component should select the contextual default

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Accepting a semantic icon key or a supplied icon component as the glyph source.
- Passing the resolved size and a variant the entry can receive to a registry entry.
- Resolving explicit, component-owned contextual, and standalone size defaults.
- Applying Icon's size, color, theming target, and accessibility semantics to
  the rendered glyph.

**Does not own / non-goals**

- The shared registry's key-resolution and fallback order — owned by the shared
  icon system.
- Which contextual default an owning Astryx component selects for its icon slot —
  owned by that component or family contract.
- The meaning of a glyph in product context or whether nearby text makes it
  decorative — owned by the product callsite.
- Interaction, focus, or control naming — owned by the interactive parent.
- The artwork supplied by a consumer or registered through a theme.
- A public Icon size-provider API; contextual transport is implementation detail.

## Public concepts

| Concept       | Closed values or states                                   | Meaning                                                    | Availability by variant/orientation/state        | Default                                         | Owner            | Stability | Invalid-value behavior                                                            |
| ------------- | --------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- | ---------------- | --------- | --------------------------------------------------------------------------------- |
| Glyph source  | semantic key, namespaced extension key, or icon component | Selects the visual symbol.                                 | Every render                                     | Required                                        | `component:Icon` | Stable    | TypeScript rejects unsupported built-in string values.                            |
| Size          | `xsm`, `sm`, `md`, `lg`                                   | Selects the icon box size.                                 | Every rendered glyph                             | nearest component-owned default; otherwise `md` | `component:Icon` | Stable    | TypeScript rejects unsupported values.                                            |
| Color         | documented semantic and palette values                    | Selects the glyph color or inherits it from context.       | Every rendered glyph                             | `inherit`                                       | `component:Icon` | Stable    | TypeScript rejects unsupported values.                                            |
| Accessibility | decorative or meaningfully labelled                       | Controls whether assistive technology receives the glyph.  | Every rendered glyph                             | Decorative                                      | `component:Icon` | Stable    | Empty labels use the decorative behavior.                                         |
| Variant       | names in `IconVariantMap`; the active theme lists its own | Requests a theme's alternate artwork for a registry glyph. | Registry glyphs only; never a supplied component | None                                            | `component:Icon` | Stable    | TypeScript rejects unknown names; an unlisted variant renders the normal artwork. |

A namespaced key that does not resolve currently renders nothing. This is
existing behavior, not an intentional fallback promise.

## Behavioral and layout contract

Requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                                           | Basis                                                                        | Draft review state                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| FR1 | Icon MUST present at most one glyph from the supplied semantic key, namespaced key, or icon component.                                                                                                                                                                                                                                                                                                                                        | Documented promise and current tests.                                        | Settled intent.                                         |
| FR2 | Every rendered glyph MUST carry the `icon` theming target with its resolved size and selected color reflected as target data.                                                                                                                                                                                                                                                                                                                 | Current source, docs, and theming tests.                                     | Settled intent.                                         |
| FR3 | Icon MUST apply the resolved size as width and height for every glyph, plus font size where needed for 1em-based icon sources. This sizing contract MUST NOT promise an HTML or SVG element type.                                                                                                                                                                                                                                             | Human decision, current source, and tests.                                   | Settled intent.                                         |
| FR4 | Supported SVG and styling escape hatches MUST retain their established merge and override behavior.                                                                                                                                                                                                                                                                                                                                           | Current source and regression tests.                                         | Current compatibility behavior; verify before changing. |
| FR5 | An explicit Icon `size` MUST win. Without one, Icon MUST use the nearest default supplied by an owning Astryx component for its documented icon slot; without such a default, Icon MUST use `md`.                                                                                                                                                                                                                                             | Component-size precedence and Button sizing decision.                        | Settled intent.                                         |
| FR6 | In registry mode, Icon MUST pass `{size, variant}` to the selected entry, where `size` is the size resolved by ORD1 and `variant` is the requested variant when the active theme lists it and, for a theme-supplied entry, the theme that defined the entry lists it too, otherwise `undefined`. A supplied icon component MUST NOT receive `variant`, Icon MUST NOT forward `variant` to the DOM, and the `icon` target MUST NOT reflect it. | `spec:AST-087` FR1–FR5 and FR9.                                              | Settled intent.                                         |
| FR7 | The `icon` target MUST guarantee `width` and `height` on its `size:*` selectors as reviewed target-specific additions, so a theme sets each size's dimension. Without theme styles, sizes are 12, 16, 20, and 24px at a 16px root and scale with the root font size.                                                                                                                                                                          | `spec:AST-087` FR10.                                                         | Settled intent.                                         |
| FR8 | `ref` reaches the svg the resolved glyph renders, for every name; when the glyph renders no svg, `ref` is `null`. A glyph that later replaces its own svg is not followed.                                                                                                                                                                                                                                                                    | Consistency with Icon's public `ref` type, `Ref<SVGSVGElement>`; defect fix. | Settled intent.                                         |

### Allowed variation

- **AV1 — Artwork.** The path, view box, and internal structure may vary by icon
  source or theme without changing Icon's one-part consumer anatomy.
- **AV2 — Rendering strategy.** Icon may render a supplied icon component directly or
  use an internal wrapper for a resolved key; neither element shape is public
  anatomy.
- **AV3 — Theme and consumer styling.** Existing theme and styling escape hatches
  may change visual CSS properties without changing glyph ownership.
- **AV4 — Contextual mapping.** An owning Astryx component may map its own public
  size or variant to an Icon default. That mapping belongs to the owner and MUST
  preserve explicit Icon sizes and the standalone fallback.

### Representative states

| State                            | Required invariant                                                                 | Allowed variation                              |
| -------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| Semantic key                     | One resolved glyph carries the `icon` target.                                      | Theme, registry, or built-in artwork.          |
| Namespaced extension key         | A resolved extension glyph carries the `icon` target.                              | Consumer- or library-owned artwork.            |
| Supplied icon component          | The supplied glyph carries the `icon` target.                                      | Component implementation and SVG internals.    |
| Standalone Icon without `size`   | The resolved size is `md`.                                                         | Glyph source and color.                        |
| Owned icon slot without `size`   | The nearest documented component default is used.                                  | The owning component's declared size mapping.  |
| Explicit Icon size in owned slot | The explicit Icon size wins over the contextual default.                           | Any supported Icon size.                       |
| Unresolved namespaced key        | No glyph is currently rendered.                                                    | No fallback behavior is established by intent. |
| Listed variant                   | The entry receives the size and the variant when its defining theme also lists it. | The theme's artwork for that request.          |
| Unlisted or omitted variant      | The entry receives `variant: undefined`.                                           | The theme's normal artwork.                    |
| Variant on a supplied component  | The component renders as given without `variant`.                                  | Component implementation.                      |

### Transformation and precedence order

- **ORD1 — Size resolution.** Resolve explicit Icon `size` → nearest
  component-owned contextual default → standalone `md` fallback.
- **ORD2 — Presentation.** Apply the target, resolved size, and component color
  styles, then merge consumer `xstyle`, `className`, inline `style`, and supported
  pass-through props in their established order.

### Performance and resources

- **PR1 — Render work.** Icon owns no listeners, observers, or layout
  measurement; semantic and size resolution are synchronous during render.

## Accessibility contract

- **AR1 — Decorative default.** Without a non-empty `label`, Icon MUST hide its
  glyph from assistive technology by default.
- **AR2 — Meaningful glyph.** A non-empty `label` MUST expose the glyph as an
  image with that accessible name.
- **AR3 — Parent-owned interaction.** Icon MUST NOT add interactive semantics or
  focus behavior; an interactive parent owns the control and its name.

## Design relationships

| Anatomy or state | Design requirement                                                 | Representation authority                                      | Hierarchy role    | Component contract |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------- | ------------------ |
| Glyph            | Carries the resolved visual symbol at the resolved size and color. | Consumer or registry selects artwork; Icon owns presentation. | Context-dependent | FR1, FR2, FR3, FR5 |

`Glyph` is the single conceptual consumer part in both source modes. Current
implementation may render a supplied icon component directly or place a
registry-resolved icon in an internal wrapper; this contract intentionally does
not promise a `span`, `svg`, or other element type.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Glyph": {"target": "icon"}
}
```

## Family and system relationships

- `architecture:component-size-cascade` owns the shared explicit → nearest
  provider → component fallback pattern and requires provider ownership to be
  declared. Icon retains its own `xsm | sm | md | lg` axis outside the standard
  element-size cascade and adopts that precedence for component-owned defaults.
- `architecture:component-theming-surface` owns the qualification and validation
  rules for the `icon` target.
- `architecture:icon-resolution-and-component-slots` owns semantic-key and
  component-slot resolution before Icon renders the selected source.
- `spec:AST-087` decides the `variant` request, theme-listed variant names, and
  theme-set size dimensions.
- `architecture:public-component-api` owns admission and compatibility rules for
  Icon's public props and observable defaults.
- The owning component or family specifies each contextual Icon-size mapping.
  The Button family currently maps `sm` and `md` controls to `sm` Icons and `lg`
  controls to `md` Icons.
- Icon has no current family contract.

## Verification map

| Contract            | Verification                                                                                              | Representative states                                                                                                                                   | Mutation or failure expectation                                                                                                                                                                                                            | Audit section              |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| FR1, FR3, FR5       | `Icon.test.tsx` sizing suites and `IconButton.test.tsx` contextual-size suites                            | standalone default; Button sizes; explicit override; both modes                                                                                         | Breaking source rendering, standalone fallback, contextual mapping, explicit precedence, or cross-mode sizing fails assertions.                                                                                                            | `audit:Icon/behavior`      |
| FR2, FR4            | `Icon.test.tsx` theming-target reflection and styling-prop suites                                         | both source modes; every color and size; omitted color; `className`, `style`, and `xstyle`                                                              | Removing the target, dropping `data-color` or `data-size` in either mode, or breaking override composition fails assertions.                                                                                                               | `audit:Icon/theming`       |
| FR2, FR3 (rendered) | `IconAudit.a11y.chromium.spec.ts` sensor receipts                                                         | semantic key and icon component; every size and color; Neutral and Butter in light and dark; right-to-left; 320px                                       | A glyph without its target data, a color that does not paint its token, sizes that do not step 12, 16, 20, and 24px at the Neutral theme, registry artwork that does not fill its box, or a transformed glyph fails a receipt.             | `audit:Icon/theming`       |
| AR1, AR2, AR3       | `Icon.test.tsx` accessible-name suites and the `IconAudit.a11y.chromium.spec.ts` accessible-name receipts | decorative, labelled, explicit ARIA override; labelled icon component that writes its own `aria-hidden`                                                 | Changing default or labelled semantics, or leaving a component's own `aria-hidden` on a labelled glyph, fails accessibility assertions.                                                                                                    | `audit:Icon/accessibility` |
| FR6                 | `Icon.test.tsx` variant suite                                                                             | listed, unlisted, and omitted variant; no active list; inherited entry under a replaced list; supplied component                                        | An unlisted variant, or one the entry's defining theme does not list, reaches an entry, or `variant` reaches a supplied component or the DOM.                                                                                              | `audit:Icon/behavior`      |
| FR7                 | `Icon.test.tsx` theme size dimension suite                                                                | each size with and without theme styles, both source modes                                                                                              | A themed size does not change the glyph dimension, or an unstyled size changes.                                                                                                                                                            | `audit:Icon/theming`       |
| FR8                 | `Icon.test.tsx` "ref reaches the rendered svg for every name" suite                                       | icon component; semantic name; namespaced key; text glyph; glyph change (component to component, svg to text); function entry across rerenders; unmount | A ref that stays empty, or holds anything but the rendered `<svg>`, for any name kind fails; so do a non-null ref for a text glyph, a ref left on a replaced glyph, a ref re-attached on every rerender, and a ref left set after unmount. | `audit:Icon/ref`           |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                             | Canonical consumer anatomy and current target                                                                                                           | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                                                                                    | `audit:Icon/theming`       |

## Decision log

### DEC-1 — One conceptual Glyph across source modes

**Reference:** `component:Icon/DEC-1`
**Decider:** cixzhang, 2026-08-30

Consumers theme and reason about one visual symbol regardless of whether it
comes from a semantic key or a supplied component. `Glyph` therefore maps to the
existing `icon` target without freezing either mode's current element shape.
Icon applies width and height for every source and adds font size where a 1em-
based source needs it. This preserves one consistent icon box without promising
a `span`, `svg`, or other element.

Rejected: separate wrapper and SVG anatomy entries, because those describe
implementation strategies rather than stable consumer concepts.

### DEC-2 — Owning components may provide contextual Icon defaults

**Reference:** `component:Icon/DEC-2`
**Decider:** cixzhang, 2026-09-23

A person should see an icon that is proportionate to the Astryx component that
owns its slot without every caller repeating a size. The owning component may
therefore provide the default while an explicit Icon size remains authoritative
and a standalone Icon remains `md`. Provider objects, hooks, and context shape
remain private implementation details rather than public API.

Rejected: an unconditional `md` default inside every composition, forcing every
caller to repeat the owner-derived size, and exposing the provider mechanism as
public API.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or system rules. It links to their owners.

---

<!-- source: docs/specs/components/Icon/Icon.swift.spec.md -->


# Icon (Swift) component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Icon(_ icon: IconName, color: IconColor? = nil, size: IconSize? = nil, label: String? = nil)` and `Icon(_ props: IconProps)`, a SwiftUI `View` in module `Astryx`. `IconName` is a string-backed name with every built-in name as a static member (`.search`, `.close`).                           |
| Behavior                | Draws the image the theme or the platform maps the name to (an SF Symbol, or an asset the app ships), in a square box at core's icon size grown with Dynamic Type, in core's icon color token or the surrounding foreground. A name nothing maps, or an asset the app does not ship, draws nothing. |
| End-user impact         | A person sees the platform's own symbol for each shared icon, or the app's own artwork where its theme maps one, sized and colored as on the web, and VoiceOver reads only icons that carry a label.                                                                                                |
| Builder impact          | An app passes a shared name (`.search`) or a name it maps in its theme (`"acme:rocket"`). An SVG component, which the web also accepts, has no Swift form.                                                                                                                                          |
| Compatibility/readiness | Additive: a new view and a new generated `IconName` type. Draft; built and tested on macOS and the iOS Simulator; device captures are attached to the change.                                                                                                                                       |
| Review checks           | Reject a substitute symbol for an unknown name, an image or attributed-text form of the icon slot, a visual parameter beyond the contract, an unlabeled icon that VoiceOver reads, or an owner's size winning over an explicit `size`.                                                              |
| Governing rules         | `spec:AST-082` FR4, FR7, FR17; `spec:AST-093` FR1–FR5; the Swift component API, styles, slots, theme environment, and accessibility records under `packages/native/specs/swift/library/`.                                                                                                           |

This table is a review projection; the body below is authoritative.

## Intent

Icon on Apple platforms draws Astryx's shared icon names as SF Symbols, or as
images the app ships where its theme maps them, so an
icon beside system controls looks like the platform's own while its size, color,
and accessibility follow the core `Icon` contract.

## Compatibility and migration

- Released default preserved: `not yet released`
- Compatibility class: additive
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- Resolving a shared icon name to an image: the theme's mapping (an SF Symbol
  or an app asset), else the platform's default SF Symbol.
- Drawing the image in a square box at core's icon size, grown with Dynamic
  Type, in core's icon color token. An asset takes the color token when its
  asset catalog renders it as a template image, and keeps its own colors when
  it renders as an original image.
- The icon's VoiceOver exposure.

**Does not own / non-goals**

- The meaning of `icon`, `color`, `size`, and `label` and the built-in names —
  owned by `component:Icon` and `spec:AST-082` FR17.
- Which size an owner gives the icons in its icon slot — owned by each owning
  component and `architecture:component-size-cascade`.
- The default SF Symbol for each name — owned by `@astryxdesign/native`'s icon
  defaults, which a test keeps equal to the Swift map.

## Public concepts

| Concept       | Closed values or states                                                                                           | Meaning                                                                                           | Availability by variant/orientation/state | Default                    | Owner                  | Stability    | Invalid-value behavior                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------------------- | ---------------------- | ------------ | ----------------------------------------------------------------------- |
| icon name     | the built-in names; a `<library>:<name>` the theme maps                                                           | `IconName`, a string on the wire, with each built-in as a static member                           | always                                    | required                   | `component:Icon`       | experimental | an unmapped name stops a development build and draws nothing in release |
| symbol source | theme mapping; platform default                                                                                   | `Theme(icons:)` replaces a built-in or registers a library name with an SF Symbol or an app asset | always                                    | platform default           | `component:swift/Icon` | experimental | a theme entry wins over the default                                     |
| size          | `xsm`, `sm`, `md`, `lg`; unset                                                                                    | 12, 16, 20, 24 points at the default text size                                                    | always                                    | owner's icon size, else md | `component:Icon`       | experimental | unset takes the owner's size, then `md`                                 |
| color         | `primary`, `secondary`, `tertiary`, `disabled`, `accent`, `info`, `success`, `error`, `warning`, `inherit`; unset | core's icon color tokens; `inherit` keeps the surrounding foreground                              | always                                    | `inherit`                  | `component:Icon`       | experimental | unset is `inherit`                                                      |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                               | Basis                                                       | Draft review state |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------ |
| FR1 | The view MUST draw the image the theme's `icons` maps the name to, an SF Symbol or an asset the app ships, else the platform default for a built-in name. A name neither maps, or an asset the app does not ship, MUST stop a development build with a message naming it and draw nothing in a release build, never a substitute. | `spec:AST-082` FR17; Swift slots S2                         | verify             |
| FR2 | The symbol MUST fit a square box whose side is core's size in points (12, 16, 20, 24 for `xsm`, `sm`, `md`, `lg`), multiplied by the Dynamic Type scale the theme environment reads.                                                                                                                                              | core `Icon` sizes; `spec:AST-093` FR3; theme environment E1 | verify             |
| FR3 | The view MUST use its own `size`, else the size its owning component gives icons in its documented icon slot, else `md`.                                                                                                                                                                                                          | `architecture:component-size-cascade`; Swift slots S4       | verify             |
| FR4 | The view MUST draw in core's token for its `color` — primary and secondary icon tokens, the secondary icon token for `tertiary`, the disabled icon token, the accent color, and the `info`, `success`, `error`, and `warning` status icon roles — and, for `inherit` or no color, MUST keep the surrounding foreground style.     | core `Icon` color map; `spec:AST-093` FR4                   | verify             |
| FR5 | Both initializers MUST build the same `IconProps`; the labeled initializer takes the contract's props with the generated types and defaults, and base props (`id`, `isHidden`) come through `IconProps`. With `isHidden` the view draws nothing; `id` becomes the accessibility identifier.                                       | Swift component API A2, A3, A7; `spec:AST-082` FR7          | verify             |

### Allowed variation

- **AV1 — Glyph shape.** The glyph is the platform's SF Symbol, not the web's
  SVG; a theme may map any name to another SF Symbol or to an image the app
  ships (`spec:AST-082` FR17).

### Representative states

| State                       | Required invariant                            | Allowed variation            |
| --------------------------- | --------------------------------------------- | ---------------------------- |
| every size                  | box side 12, 16, 20, 24 points at Large text  | glyph proportions per symbol |
| every color, light and dark | the color's token in the current mode         | none                         |
| inside an owner's icon slot | the owner's size unless the icon sets its own | none                         |
| largest text size           | the box grows with Dynamic Type               | none                         |
| labeled and unlabeled       | VoiceOver reads only the labeled icon         | none                         |

### Transformation and precedence order

- **ORD1 — Image.** Theme mapping (SF Symbol or app asset) → platform default
  SF Symbol → nothing.
- **ORD2 — Size.** Explicit `size` → owner's icon size → `md`, then × Dynamic
  Type scale.

### Performance and resources

- **PR1 — No image data of its own.** The view draws a system symbol by name,
  or an asset from the app's main bundle by name; it holds no image data and
  loads nothing from the network.

## Accessibility contract

- **AR1 — Decorative unless labeled.** With no `label`, or an empty one, the
  view is hidden from VoiceOver. With a label, it is one image element named by
  the label, keeping SwiftUI's image trait and adding none (`spec:AST-082` FR17;
  Swift accessibility X1, X4).
  In an avatar's status slot a labeled icon also names the status, which joins
  the avatar's name (`component:swift/Avatar` AR6).
- **AR2 — Rendered tree not measured.** Tests assert what the view sets; the
  rendered accessibility tree is not measured until an app-hosted target exists.

## Design relationships

| Anatomy or state | Design requirement                                             | Representation authority   | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------- | -------------------------- | -------------- | ------------------ |
| Glyph            | SF Symbols (Apple Human Interface Guidelines), or an app asset | prescribed by the platform | supporting     | FR1, FR2           |

The component implements design requirements without copying their rationale.

Platform control: SwiftUI `Image(systemName:)`, or `Image(_:bundle:)` for an
app asset. It is the platform's own icon view and satisfies the contract, so no custom drawing is needed (`spec:AST-093`
FR2). Guideline pages: SF Symbols and Accessibility in the Apple Human
Interface Guidelines.

Theme values read: `color.iconPrimary`, `color.iconSecondary`,
`color.iconDisabled`, `color.accent`, `color.iconInfo`, `color.iconSuccess`,
`color.iconError`, `color.iconWarning`, the theme's `icons` map, and the
Dynamic Type scale.

## Family and system relationships

- `component:Icon` owns the props, the built-in names, the size scale, and the
  color map; this record states only how Swift draws them.
- `architecture:component-size-cascade` owns when an owner's icon size applies;
  owners set it through an internal environment value this view reads.

## Verification map

| Contract | Verification                                                                                                        | Representative states                                                                                                                   | Mutation or failure expectation                                                                                          | Audit section              |
| -------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| FR1      | `IconTests.swift` symbol and asset tests (a test bundle stands in for the app's); `contracts.test.ts` IconName test | every built-in; theme replacement; library name; a shipped asset; a missing asset drawing nothing and reported (the release-build path) | a missing default, a symbol absent on the platform, a missing asset that draws or goes unreported, or a substitute fails | `audit:swift/Icon/symbols` |
| FR2, FR3 | `IconTests.swift` size and Dynamic Type renders                                                                     | each size; owner size; explicit size; AX5                                                                                               | a wrong side or an owner size beating an explicit size fails                                                             | `audit:swift/Icon/size`    |
| FR4      | `IconTests.swift` color map and two-theme render                                                                    | every color; neutral and butter                                                                                                         | a wrong token or a color of the view's own fails                                                                         | `audit:swift/Icon/color`   |
| FR5      | `IconTests.swift` initializer and hidden tests                                                                      | both initializers; `isHidden`                                                                                                           | differing props or a drawn hidden icon fails                                                                             | `audit:swift/Icon/api`     |
| AR1      | `IconTests.swift` accessibility assertions                                                                          | labeled, unlabeled, empty label                                                                                                         | an unlabeled icon with a label, or a labeled one without, fails                                                          | `audit:swift/Icon/a11y`    |

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
