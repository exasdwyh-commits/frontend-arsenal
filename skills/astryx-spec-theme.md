---
schema_version: 3
template_version: 7
kind: component
id: component:MediaTheme
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-11-01
owners: [cixzhang]
review_triggers: [public-api, behavior, theming]
verified_by:
  [
    packages/core/src/theme/MediaTheme.dom.test.tsx,
    packages/core/src/hooks/useAutoMediaMode.test.ts,
  ]
modules: []
families: []
design_specs: []
architecture: [architecture:theme-application]
contributing: []
system_specs: []
---

# MediaTheme component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `MediaTheme` with a required `mode` (`dark`, `light`, `auto`, `off`), `fallback` (`dark`, `light`; default `dark`), and `children`.             |
| Behavior                | Marks a subtree as sitting on a dark or light surface so tokens switch to match, through a layout-neutral wrapper; `auto` measures the surface. |
| End-user impact         | Text and controls placed over images or video stay readable against that surface while keeping the app's theme.                                 |
| Builder impact          | None.                                                                                                                                           |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact.                                          |
| Review checks           | Reject a wrapper that remounts children when the mode changes, a probe element left behind, or a surface mode that replaces the theme.          |
| Governing rules         | `architecture:theme-application` INV8.                                                                                                          |

This table is a review projection; the body below is authoritative.

## Intent

MediaTheme marks content that sits on a dark or light surface, such as text
over a photo, so compiled theme CSS switches its surface tokens while keeping
the active theme. Consumer usage lives in `MediaTheme.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: `mode` is caller-owned; `auto` measures
  the surface
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A surface that stops being measurable keeps its old side.** With `auto`,
  once a surface has been measured, a later change that makes it unmeasurable,
  such as a new background image, keeps the last measured side instead of
  `fallback`. The consumer docs promise `fallback` whenever the backdrop is not
  knowable, so text can stay styled for the old surface (FR3).

## Ownership boundary

**Owns**

- The wrapper, its surface marker, and resolving `auto` with `fallback`
  (FR1–FR3).

**Does not own / non-goals**

- What the surface marker does to tokens and component rules — owned by
  `architecture:theme-application` INV8 and the compiled theme CSS.
- The active theme and color mode — owned by `component:Theme`.

## Public concepts

| Concept  | Closed values or states        | Meaning                                                   | Availability by variant/orientation/state | Default  | Owner                  | Stability | Invalid-value behavior           |
| -------- | ------------------------------ | --------------------------------------------------------- | ----------------------------------------- | -------- | ---------------------- | --------- | -------------------------------- |
| Mode     | `dark`, `light`, `auto`, `off` | The surface the subtree sits on, measured, or no marker.  | Every MediaTheme.                         | required | `component:MediaTheme` | Stable    | TypeScript rejects other values. |
| Fallback | `dark`, `light`                | The side `auto` uses when the surface cannot be measured. | `auto` only.                              | `dark`   | `component:MediaTheme` | Stable    | TypeScript rejects other values. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Basis                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | MediaTheme always renders one wrapper with `display: contents`, so switching to or from `off` never remounts its children.                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR2 | `dark` and `light` mark the wrapper with that surface and the primary text color; `off` renders no marker.                                                                                                                                                                                                                                                                                                                                                              | Current source and tests |
| FR3 | `auto` measures the surface behind the wrapper on each render and marks it dark or light, renders no marker when the surface's own text already reads on it at 3:1, and uses `fallback` when the surface cannot be measured; it leaves no probe element. `fallback` is ignored for explicit modes. Implementation gap: once a measurement has succeeded, a surface that becomes unmeasurable keeps the last measured side instead of `fallback` (Current-state impact). | Current source and tests |

### Allowed variation

- **AV1 — Content.** Children vary; components inside adapt through tokens.

### Representative states

| State                      | Required invariant                                                                                   | Allowed variation |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------- |
| `dark` or `light`          | Surface marker set.                                                                                  | Content.          |
| `off`                      | No marker; children not remounted.                                                                   | Content.          |
| `auto`, unmeasured         | Marker from `fallback`; after an earlier measurement, the last measured side (Current-state impact). | Fallback.         |
| `auto`, measured           | Marker from the measured surface.                                                                    | Surface.          |
| `auto`, text already reads | No marker.                                                                                           | Surface.          |

### Transformation and precedence order

- **ORD1 — Mode.** An explicit mode wins; `auto` uses the measurement, then
  `fallback`.

### Performance and resources

- **PR1 — Measurement.** Only `auto` measures the surface.

## Accessibility contract

- **AR1 — No semantics.** The wrapper adds no role, name, or focus target.

## Design relationships

| Anatomy or state | Design requirement                               | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| Wrapper          | Carries the surface marker without a layout box. | Current source           | Supporting     | FR1, FR2           |

MediaTheme renders no themable part of its own, so no anatomy-theming map
applies.

## Family and system relationships

- `architecture:theme-application` INV8 owns what a surface marker changes and
  keeps the active theme.
- `component:Theme` owns the active theme and color mode.

## Verification map

| Contract | Verification                                                                                                                        | Representative states              | Mutation or failure expectation                                | Audit section               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------- | --------------------------- |
| FR1, FR2 | `MediaTheme.dom.test.tsx` explicit-mode marker and `off` tests                                                                      | `dark`; `light`; `off`             | A wrong marker, a marker on `off`, or a missing element fails. | `audit:MediaTheme/behavior` |
| FR3      | `MediaTheme.dom.test.tsx` fallback, explicit-fallback, ignored-fallback, and probe tests                                            | `auto` unmeasured                  | A wrong fallback or a leftover probe fails.                    | `audit:MediaTheme/behavior` |
| FR3      | `useAutoMediaMode.test.ts` surface-picking tests, including "answers off for a chromatic surface its ambient text already reads on" | dark, light, and readable surfaces | A wrong side, or a marker where the text already reads, fails. | `audit:MediaTheme/behavior` |

Read from source, with no focused test yet:

- FR1: `display: contents`, and children not remounting when the mode
  switches to or from `off`.
- FR2: the primary text color.
- FR3: measuring again on each render.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, theme
authoring, token definitions, or compiler output. It links to their owners.

---

<!-- source: docs/specs/components/theme/SyntaxTheme.spec.md -->


# SyntaxTheme component contract

## Contract at a glance

| Area                    | Contract                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public contract         | `SyntaxTheme` with a required `theme` (a syntax preset or a `defineSyntaxTheme()` result) and `children`.                      |
| Behavior                | Applies one syntax highlighting theme to the code components inside it through CSS variables on a wrapper and through context. |
| End-user impact         | Code blocks inside share one set of syntax colors.                                                                             |
| Builder impact          | None.                                                                                                                          |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact.                         |
| Review checks           | Reject a lost syntax variable or a wrapper without the theme name.                                                             |
| Governing rules         | `architecture:theme-authoring-contract`; `architecture:theme-application` INV1.                                                |

This table is a review projection; the body below is authoritative.

## Intent

SyntaxTheme applies one syntax highlighting theme to the code components in
its subtree. How syntax themes are authored is owned by
`architecture:theme-authoring-contract`; this record owns what the component
renders. Consumer usage lives in `SyntaxTheme.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: `theme` is caller-owned
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Canvas colors can disagree with a forced mode.** The syntax theme hook
  picks light or dark from the operating system's `prefers-color-scheme`, not
  from the nearest Theme's mode. Under `<Theme mode="dark">` on a light system,
  a canvas painter using the hook gets light colors while code blocks paint the
  dark side; `architecture:theme-application` INV1 has descendants read the
  nearest provider (FR2).

## Ownership boundary

**Owns**

- The wrapper, its syntax variables, and its theme-name attribute (FR1).
- Providing the syntax theme to descendants (FR2).

**Does not own / non-goals**

- Authoring syntax themes and their presets — owned by
  `architecture:theme-authoring-contract`.
- How a code component paints tokens with these variables — owned by that
  component.

## Public concepts

No component-local concept beyond the consumer props.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Basis                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | SyntaxTheme renders one block `div` wrapper carrying `data-astryx-syntax-theme` with the theme's name and, as inline custom properties, every syntax token the definition carries. Presets and `defineSyntaxTheme()` fill every diff slot; only a hand-built definition missing a slot leaves it to the CSS default.                                                                                                                                                                                           | Current source and tests |
| FR2 | Descendants read the syntax theme through context. The syntax theme hook resolves each token for the nearest Theme's effective mode (`architecture:theme-application` INV1); unset marker slots take the theme's own punctuation, and unset `added` and `removed` derive from the page theme. Implementation gap: the hook reads the operating system's `prefers-color-scheme` instead, so under a Theme with a forced mode it can resolve the other side from the wrapper's variables (Current-state impact). | Current source and tests |

### Allowed variation

- **AV1 — Theme.** Any preset or defined syntax theme.

### Representative states

| State                                     | Required invariant                                                                                                     | Allowed variation |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Preset theme                              | Wrapper carries the preset's variables and name.                                                                       | Preset.           |
| Hand-built definition missing a diff slot | No variable written; the hook derives a missing marker or row paint, and a missing header resolves to an empty string. | Theme.            |

### Transformation and precedence order

- **ORD1 — Nearest provider.** The nearest SyntaxTheme supplies the theme.

### Performance and resources

- **PR1 — Memoized values.** The wrapper style and context value recompute only
  when `theme` changes.

## Accessibility contract

- **AR1 — No semantics.** The wrapper adds no role, name, or focus target.

## Design relationships

| Anatomy or state | Design requirement                           | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Wrapper          | Carries syntax variables and the theme name. | Current source           | Supporting     | FR1                |

SyntaxTheme renders no themable part of its own, so no anatomy-theming map
applies.

## Family and system relationships

- `architecture:theme-authoring-contract` owns syntax theme construction and
  presets.

## Verification map

| Contract | Verification                                                                                                     | Representative states    | Mutation or failure expectation                                    | Audit section                |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------ | ---------------------------- |
| FR1      | `defineSyntaxTheme.diff.test.ts` "skips unset diff slots in the CSS and style output of a hand-built definition" | set and unset diff slots | A style value written for an unset slot, or a set one lost, fails. | `audit:SyntaxTheme/behavior` |
| FR2      | `useSyntaxTheme.diff.test.tsx` "resolves unset marker slots to the theme's own punctuation colour"               | unset marker slots       | A wrong derived slot fails.                                        | `audit:SyntaxTheme/behavior` |

Read from source, with no focused test yet:

- FR1: the block wrapper, its `data-astryx-syntax-theme` attribute, and the
  wrapper applying the theme's style values.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, theme
authoring, token definitions, or compiler output. It links to their owners.

---

<!-- source: docs/specs/components/theme/Theme.spec.md -->


# Theme component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Theme` with a required `theme` (a defined theme), `mode` (`light`, `dark`, `system`; default `system`), and `children`.                                 |
| Behavior                | Applies a theme and color mode to its subtree through a layout-neutral wrapper. The outermost Theme also writes the theme and a forced mode to `<html>`. |
| End-user impact         | Everything inside renders in the chosen theme and in light, dark, or the system's mode; browser chrome follows the root Theme.                           |
| Builder impact          | None.                                                                                                                                                    |
| Compatibility/readiness | Records shipped behavior; no public change.                                                                                                              |
| Review checks           | Reject a wrapper that affects layout, a nested Theme that changes `<html>`, or a `system` mode that writes a forced mode.                                |
| Governing rules         | `architecture:theme-application` INV1–INV9; `architecture:theme-compilation`.                                                                            |

This table is a review projection; the body below is authoritative.

## Intent

Theme is the provider that applies one defined theme and a color mode to the
part of the tree it wraps. How providers nest, share runtime styles, and sync
the document is owned by `architecture:theme-application`; this record owns
what the component itself renders. Consumer usage lives in `Theme.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: `theme` and `mode` are caller-owned
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The wrapper element, its theme and mode attributes, and its color scheme
  (FR1, FR2).
- Providing the theme and mode to descendants (FR3).

**Does not own / non-goals**

- Provider nesting, root document sync, runtime style sharing and removal, and
  `system` resolution — owned by `architecture:theme-application`.
- The CSS a theme compiles to — owned by `architecture:theme-compilation`.
- Theme authoring and tokens — owned by their architecture records.

## Public concepts

| Concept | Closed values or states   | Meaning                                    | Availability by variant/orientation/state | Default  | Owner             | Stability | Invalid-value behavior                                                                                                      |
| ------- | ------------------------- | ------------------------------------------ | ----------------------------------------- | -------- | ----------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Mode    | `light`, `dark`, `system` | Forces a color mode or follows the system. | Every Theme.                              | `system` | `component:Theme` | Stable    | TypeScript rejects other values; at runtime any other value is treated as `system` (`architecture:theme-application` INV7). |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                                         | Basis                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | Theme renders one wrapper with `display: contents`, so it adds no layout box, carrying `data-astryx-theme` with the theme's name and the primary text color and body font.                                                                                                                                                                                        | Current source and tests |
| FR2 | `mode="light"` or `"dark"` sets that `data-theme` and color scheme on the wrapper; `system` sets no `data-theme` and a `light dark` color scheme. A nested Theme sets its own wrapper's mode. A Theme given any other value still writes it unchanged to its own wrapper's `data-theme`, with the `light dark` color scheme, though nothing reads that attribute. | Current source and tests |
| FR3 | Descendants read the theme and mode through Theme context; the nearest Theme wins (`architecture:theme-application` INV1).                                                                                                                                                                                                                                        | Current source and tests |
| FR4 | The outermost Theme writes the theme name and any forced mode to `<html>` and removes them on unmount; a nested Theme never changes `<html>` (`architecture:theme-application` INV2, INV7).                                                                                                                                                                       | Current source and tests |

### Allowed variation

- **AV1 — Theme.** Any defined theme, built or runtime.

### Representative states

| State        | Required invariant                               | Allowed variation |
| ------------ | ------------------------------------------------ | ----------------- |
| Root, system | No `data-theme` on the wrapper or `<html>`.      | Theme.            |
| Root, dark   | `data-theme="dark"` on the wrapper and `<html>`. | Theme.            |
| Nested       | Own wrapper attributes; `<html>` unchanged.      | Theme, mode.      |

### Transformation and precedence order

- **ORD1 — Nearest provider.** The nearest Theme supplies context; only the
  outermost writes to `<html>`.

### Performance and resources

- Runtime style generation and sharing follow `architecture:theme-application`
  INV4–INV5.

## Accessibility contract

- **AR1 — No semantics.** The wrapper adds no role, name, or focus target.

## Design relationships

| Anatomy or state | Design requirement                                    | Representation authority | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Wrapper          | Carries theme identity and mode without a layout box. | Current source           | Supporting     | FR1, FR2           |

Theme renders no themable part of its own, so no anatomy-theming map applies.

## Family and system relationships

- `architecture:theme-application` owns provider scope, root sync, style
  lifetime, and `system` resolution.
- `architecture:theme-compilation` owns the CSS Theme mounts.

## Verification map

| Contract | Verification                                                                | Representative states                     | Mutation or failure expectation                                    | Audit section          |
| -------- | --------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------ | ---------------------- |
| FR1      | `Theme.test.tsx` "sets data-astryx-theme on wrapper div"                    | any theme                                 | A missing theme attribute fails.                                   | `audit:Theme/behavior` |
| FR2, FR4 | `Theme.test.tsx` root and nested `data-theme` and `data-astryx-theme` tests | root light, dark, system; nested; unmount | Wrong mode attributes, or a nested Theme changing `<html>`, fails. | `audit:Theme/behavior` |

Read from source, with no focused test yet:

- FR1: `display: contents`, the text color, and the body font.
- FR2: the color scheme for each mode, and the wrapper's `data-theme` for a
  value outside the three.
- FR3: descendants reading the nearest Theme's context.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, theme
authoring, token definitions, or compiler output. It links to their owners.
