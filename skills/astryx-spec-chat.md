---
schema_version: 3
template_version: 7
kind: component
id: component:ChatComposer
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-31
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Chat/ChatComposer.test.tsx,
    packages/core/src/Chat/ChatComposerInput.test.tsx,
    packages/core/src/Chat/ChatSendButton.test.tsx,
    apps/storybook/stories/ChatComposer.stories.tsx,
    apps/storybook/stories/ChatComposerCustomInput.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:component-test-sufficiency,
    architecture:component-theming-surface,
    architecture:public-component-api,
    architecture:interaction-modality,
    architecture:react-component-runtime,
    architecture:component-style-authoring,
    architecture:knowledge-contracts,
  ]
contributing: []
system_specs:
  [
    spec:AST-002,
    spec:AST-009,
    spec:AST-017,
    spec:AST-020,
    spec:AST-027,
    spec:AST-029,
  ]
---

# ChatComposer component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatComposer` with a controlled or uncontrolled draft (`value`, `onChange`), `onSubmit`, `placeholder`, `isDisabled`, `isStopShown`, `onStop`, `density`, `elevation`, `status`, `statusPosition`, the drawer, header, input, footer, and send slots, and BaseProps; the exported composition context. |
| Behavior                | ChatComposer coordinates a controlled or uncontrolled draft, trims a submitted value, clears through the existing value channel, composes caller slots, and keeps the default send/stop action synchronized with context.                                                                               |
| End-user impact         | Screen-reader users can identify the disabled editor, pointer and touch users can stop an interruptible response, and users of a custom editor send the draft that editor supplied instead of stale composer state.                                                                                     |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                   |
| Compatibility/readiness | Records shipped behavior; no public change. Two implementation gaps are listed under Current-state impact; four owner questions stay open. Evidence still pending for parts of FR1, FR5–FR7, FR10, and PR1–PR2 (read from source; see the verification map).                                            |
| Review checks           | Reject ignored context submission arguments, a disabled state hidden from the default textbox, an ancestor that blocks an enabled Stop action, or a change that settles an open question without its owner.                                                                                             |
| Governing rules         | `architecture:interaction-modality/INV4, INV7, INV9`; `architecture:public-component-api/INV5–INV6, INV9, INV12`; `architecture:component-theming-surface/INV4, INV6`; `spec:AST-020/FR1`; `spec:AST-029/DEC-4`.                                                                                        |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposer is the message-entry shell for a chat surface. It coordinates the
current draft and submission operation, lays out an optional drawer, header,
status, footer, and send-area content around a default or caller-supplied input,
and owns keyboard-only editor focus indication. Products own message transport,
streaming state, validation policy, and the content placed in each slot.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: a successful submission clears through
  `onChange` in controlled mode and local state otherwise
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The public target does not reach the painted body.** The `chat-composer`
  target sits on the outer frame, so a theme cannot select the body's elevation
  and border. `architecture:component-theming-surface` INV4 puts each themable
  part's paint on its target (FR7, OQ1).
- **Styling inputs split across two elements.** `ref`, DOM props and events,
  `className`, and `style` reach the outer frame while `xstyle` reaches the
  painted body. `architecture:public-component-api` INV6 has styling inputs
  compose on one element (FR10, OQ2).

## Ownership boundary

**Owns**

- Coordinating a controlled or uncontrolled serialized draft value with the input and submit action.
- Providing the default token-capable editor and send/stop action while allowing either to be replaced.
- Laying out the drawer, header, input, footer, send, and status regions.
- Applying composer density, elevation, disabled presentation, and keyboard-only editor focus indication.
- Publishing the composition context used by custom inputs and send controls.

**Does not own / non-goals**

- Sending, retrying, cancelling, or persisting a message — owned by the product callsite.
- Deciding when a response is streaming or whether it is interruptible — owned by the product callsite.
- Attachment data, model selection, speech recognition, or validation policy — owned by the supplied slot components and product callsite.
- A product's accessible conversation transcript or live response announcements — owned by the surrounding chat surface.

## Public concepts

| Concept                 | Closed values or states                                      | Meaning                                                                                          | Availability by variant/orientation/state        | Default                     | Owner                               | Stability | Invalid-value behavior                                                        |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------- | ----------------------------------- | --------- | ----------------------------------------------------------------------------- |
| Draft ownership         | uncontrolled; controlled `value` + `onChange`                | Selects where the serialized input draft is stored and how clearing is reported.                 | Every ChatComposer                               | uncontrolled empty string   | `component:ChatComposer`            | stable    | Controlled `value` without an updating owner remains caller-controlled.       |
| Submission              | input submit; default send; custom context `onSubmit(value)` | Delivers one trimmed, non-empty supplied value and clears the draft through the current channel. | Enabled composer with a non-empty supplied value | no submission               | `component:ChatComposer`            | stable    | Empty values and submissions while disabled are ignored.                      |
| Input composition       | default ChatComposerInput; custom React node                 | Supplies the editing surface and optional registered focus control.                              | Every ChatComposer                               | ChatComposerInput           | `component:ChatComposer`            | stable    | A custom input without a registered control gets textarea focus fallback.     |
| Editing availability    | enabled; disabled                                            | Controls whether the draft can be edited or submitted.                                           | Every ChatComposer                               | enabled                     | `component:ChatComposer`            | stable    | Disabled submission is ignored.                                               |
| Primary action          | send; stop                                                   | Sends the current draft or requests interruption.                                                | Default ChatSendButton or a custom sendButton    | send                        | `component:ChatComposer`            | stable    | A shown Stop action without `onStop` renders but does nothing (OQ4).          |
| Density                 | compact; balanced; spacious                                  | Selects composer spacing.                                                                        | Every ChatComposer                               | balanced                    | `component:ChatComposer`            | stable    | Unknown values are rejected by TypeScript.                                    |
| Elevation               | low; none                                                    | Selects a raised body or a flat bordered body.                                                   | Every ChatComposer                               | low                         | `component:ChatComposer`            | stable    | Unknown values are rejected by TypeScript.                                    |
| Status                  | absent; error; warning; top; bottom                          | Adds announced feedback before or after the body.                                                | Optional status object                           | absent; bottom when present | `component:ChatComposer`            | stable    | An omitted message renders the bar and announces nothing.                     |
| Named composition slots | drawer; header actions/context; input; footer/send actions   | Lets callers compose supporting controls and information around the draft.                       | Optional, independently supplied                 | omitted                     | `component:ChatComposer`            | stable    | Omitted slot groups emit no empty header; footer remains for the send action. |
| BaseProps surface       | ref; DOM props/events; className/style; xstyle               | Extends the component with DOM identity, behavior, and styling.                                  | Every ChatComposer                               | omitted                     | `architecture:public-component-api` | stable    | Split between the frame and the body (FR10, OQ2).                             |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                | Basis                                                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FR1  | Controlled mode MUST report changes through `onChange`; uncontrolled mode MUST retain them locally. Every successful submit MUST trim and deliver the value supplied to that operation, then clear through the same value channel.                                                                                                                                                                                                                       | public types and docs; `architecture:public-component-api/INV3, INV9, INV12`; focused tests                                              |
| FR2  | The default editor MUST serialize its current text/tokens, submit Enter without Shift, preserve Shift+Enter, defer during IME composition, and allow a caller key handler to prevent the default operation.                                                                                                                                                                                                                                              | implementation, docs, and focused tests                                                                                                  |
| FR3  | `isDisabled` MUST prevent draft edits and submissions and MUST expose `aria-disabled="true"` on the default textbox; removing the prop MUST remove that state.                                                                                                                                                                                                                                                                                           | `spec:AST-020/FR1` (WCAG 2.2 4.1.2); `architecture:interaction-modality/INV5`; red/green focused test                                    |
| FR4  | When `isStopShown` is true, the default primary action MUST remain an enabled, named Stop button and call `onStop`; if editing is also disabled, ancestor styling MUST NOT block its pointer, touch, or keyboard activation.                                                                                                                                                                                                                             | `architecture:interaction-modality/INV4, INV7, INV9`; red/green focused and browser-story tests                                          |
| FR5  | Omitted header slots MUST omit the header row; the drawer precedes the body; input fills the body between header and footer; footer actions precede send actions and the primary action; status follows `statusPosition`.                                                                                                                                                                                                                                | implementation, props, stories, and blocks                                                                                               |
| FR6  | `compact` reduces body padding and gap; `balanced` and `spacious` produce the same body spacing. Whether `spacious` should differ is open (OQ3).                                                                                                                                                                                                                                                                                                         | implementation and published union; no current owner selects distinct spacious geometry                                                  |
| FR7  | `low` applies low rest and medium hover and focus-within elevation; `none` applies no shadow and a border. Implementation gap: the public target does not reach the painted body (Current-state impact; OQ1).                                                                                                                                                                                                                                            | implementation; `architecture:component-theming-surface/INV4, INV6`; the `chat-composer` target sits on the frame (Current-state impact) |
| FR8  | Keyboard focus entering the registered/default editor MUST add the shared focus indication to the body; pointer focus MUST not add that extra ring. Clicking non-interactive body space MUST focus the registered control, then a textarea fallback; a click inside an open Tooltip or HoverCard surface is not body space (`component:Tooltip` FR11, `component:HoverCard` FR11), a clause `architecture:layer-runtime` INV17 subsumes for every layer. | implementation; `architecture:interaction-modality/INV1–INV3, INV9`; focused tests                                                       |
| FR9  | Error status is announced assertively and warning status politely through the shared announcement channel, once per occasion: one state transition, which a rerender or an update to the same value does not repeat (`spec:AST-086` FR6); the status bar itself carries no live role. Both pair a semantic icon with color and can render above or below the body.                                                                                       | implementation, docs, and stories; `spec:AST-020/FR1`; `spec:AST-086/FR2, FR5, FR6`                                                      |
| FR10 | `ref`, DOM props and events, `className`, and `style` reach the outer frame; `xstyle` reaches the painted body. Implementation gap: the styling inputs split across two elements (Current-state impact; OQ2).                                                                                                                                                                                                                                            | implementation; `architecture:public-component-api/INV5–INV6, INV8`                                                                      |
| FR11 | The exported context MUST expose the current value, change and submit operations, placeholder, disabled/stop/send state, stop callback, and mutable input focus control to custom composition.                                                                                                                                                                                                                                                           | public export, types, docs, stories, and focused tests; `architecture:public-component-api/INV12`                                        |

### Allowed variation

- **AV1 — Slot content.** Callers may omit or replace each named slot while preserving the composer's value, submit, focus, and disabled contracts.
- **AV2 — Product workflow.** Callers decide when to show status or Stop and what their callbacks do; ChatComposer owns only the local affordance and dispatch.
- **AV3 — Editor implementation.** A custom input may be a textarea, contenteditable editor, or other control when it follows the exported context and focus-control contract.

### Representative states

| State                        | Required invariant                                                                                  | Allowed variation                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Empty draft                  | Default send action is disabled and submission does not fire.                                       | Placeholder and optional slots vary.                         |
| Non-empty draft              | Enter or Send submits one trimmed value and clears through the active ownership channel.            | Serialized token representation and transport behavior vary. |
| Controlled draft             | Caller value remains authoritative; onChange receives edits and clear requests.                     | The caller may accept or defer each update.                  |
| Custom input                 | Context operations act on the supplied value and body click uses its registered focus control.      | DOM/editor implementation varies.                            |
| Disabled editing             | Default textbox exposes disabled state and cannot edit or submit.                                   | Supporting content remains visible.                          |
| Disabled, interruptible work | Stop remains named, enabled, and reachable by pointer, touch, and keyboard.                         | Product cancellation behavior varies.                        |
| Flat elevation               | Body has no shadow and uses its bordered presentation; keyboard focus indication remains available. | Theme tokens vary.                                           |
| Status above or below        | Announcement urgency, icon, color, and selected placement remain synchronized.                      | Message content and status type vary.                        |
| Narrow viewport              | Composer remains within its containing inline size and the primary action remains operable.         | Available inline size and optional slot content vary.        |

### Transformation and precedence order

- **ORD1 — Value update.** Receive an editor value → publish through `onChange` when controlled or update local state when uncontrolled → derive current context value and send availability.
- **ORD2 — Submission.** Receive the operation's supplied value → trim → reject empty or disabled submission → call public `onSubmit` once → request clearing through the current value channel.
- **ORD3 — Primary action.** Resolve `isStopShown` → expose Stop and dispatch `onStop`, otherwise derive send availability from current draft and disabled state → submit the current context value.
- **ORD4 — Composition order.** Optional top status → drawer → body header → input → footer actions → send actions → primary action → optional bottom status.

### Performance and resources

- **PR1 — Context stability.** The exported context value SHOULD retain referential stability while none of its public members changes.
- **PR2 — Focus coordination.** The component adds no document listener or observer of its own for body-click focus or focus indication; it mounts the shared interaction-modality tracker, which adds document-level `pointerdown` and `keydown` listeners (`architecture:interaction-modality`).

## Accessibility contract

- **AR1 — Editing state.** The default contenteditable surface acts as the textbox and MUST expose disabled state through `aria-disabled` when editing is unavailable.
- **AR2 — Native actions.** The default Send and Stop controls remain native buttons with translated accessible names; disabled Send uses native disabled behavior, while explicit Stop remains operable.
- **AR3 — Keyboard editing.** Enter submission MUST preserve Shift+Enter newline behavior, IME composition, and caller cancellation through `preventDefault()`.
- **AR4 — Focus indication.** Keyboard focus in the editor MUST produce the shared visible focus treatment; pointer focus does not claim keyboard modality, and focus on an internal action remains owned by that action.
- **AR5 — Status feedback.** Error feedback is announced assertively and warning feedback politely through the shared announcement channel (`spec:AST-086` FR2, FR5); the visible status bar carries no live role and stays readable. Visible icon and color do not replace the caller's message content.

## Design relationships

| Anatomy or state    | Design requirement                                                  | Representation authority                                                                                   | Hierarchy role | Component contract |
| ------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- | ------------------ |
| Composer frame      | Groups body and optional status into one compositional shell.       | Current source                                                                                             | container      | FR5                |
| Composer body       | Provides the painted rounded input/action surface and elevation.    | elevation is shipped; public theme reachability is unsettled                                               | prominent      | FR7                |
| Drawer              | Places attachment/context content before the body.                  | delegated to `component:ChatComposerDrawer`                                                                | supporting     | FR5                |
| Header              | Places caller actions at start and caller context at end.           | Current source                                                                                             | supporting     | FR5                |
| Input               | Owns or hosts the editing surface and its focus control.            | delegated to `component:ChatComposerInput` or caller custom input                                          | prominent      | FR1–FR3, FR8, FR11 |
| Footer              | Places caller actions and the primary action on the final body row. | Current source                                                                                             | supporting     | FR4–FR5            |
| Send or stop action | Presents the current primary operation.                             | delegated to `component:ChatSendButton` or caller custom send button                                       | prominent      | FR1, FR4           |
| Status message      | Adds error or warning feedback before or after the body.            | shared-channel announcement and color are shipped; separate public theme reachability is not asserted here | supporting     | FR5, FR9, AR5      |

The public `chat-composer` target sits on the frame and cannot select the body's
elevation and border (Current-state impact). No anatomy-theming map is recorded
yet; the block is optional during migration, so the map is deferred.

## Family and system relationships

- No current family or design record governs ChatComposer-specific behavior.
- `architecture:public-component-api` owns BaseProps element ownership, callback semantics, and the exported composition context.
- `architecture:interaction-modality` owns modality parity, focus ownership, and the requirement that enabled Stop remain reachable.
- `architecture:component-theming-surface` owns the anatomy-to-target disposition and makes the current body reachability mismatch blocking without deciding its repair shape.
- `architecture:component-test-sufficiency` owns public-state partitions, negative assertions, observable output, and the exact-head browser boundary.
- `architecture:react-component-runtime` owns render-derived state and browser/server boundaries.
- `architecture:knowledge-contracts` keeps consumer syntax in `ChatComposer.doc.mjs` and system behavior in this record.
- `spec:AST-020/FR1` carries the current WCAG 2.2 accessibility baseline.
- `spec:AST-029` owns the audit evidence inventory this record's verification map follows.

## Verification map

| Contract  | Verification                                                                                                                                                       | Representative states                                                           | Mutation or failure expectation                                                                          | Audit section                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1, FR11 | `ChatComposer.test.tsx` input composition tests                                                                                                                    | context-supplied value, custom input reading value, change, and disabled        | A context submission that ignores its argument, or a context member a custom input cannot read, fails.   | `audit:ChatComposer/api-behavior`   |
| FR2, AR3  | `ChatComposerInput.test.tsx`                                                                                                                                       | Enter, Shift+Enter, composing, cancelled keydown                                | A key path that sends during composition or loses a newline fails.                                       | `audit:ChatComposer/input-behavior` |
| FR3, AR1  | `ChatComposer.test.tsx` "exposes disabled state on the default textbox and clears it when enabled"                                                                 | disabled and re-enabled default textbox                                         | A textbox that loses or keeps its disabled state wrongly fails.                                          | `audit:ChatComposer/accessibility`  |
| FR4, AR2  | `ChatComposer.test.tsx` "keeps the Stop action pointer-operable while editing is disabled"; the `DisabledStreamingNarrow` story play in `ChatComposer.stories.tsx` | disabled editing with Stop shown; a narrow viewport with no horizontal overflow | A Stop action an ancestor blocks, or one that does not call `onStop`, fails.                             | `audit:ChatComposer/modality`       |
| FR7       | `ChatComposer.test.tsx` elevation tests                                                                                                                            | `low` default, `none`                                                           | Levels that share a body class, or a default other than `low`, fail.                                     | `audit:ChatComposer/theming`        |
| FR8, AR4  | `ChatComposer.test.tsx` focus indication tests and custom-input focus tests; "keeps a click on an open tooltip in the body from focusing the input"                | keyboard, pointer, programmatic after each, internal button, body click         | A ring on pointer focus, a missing ring on keyboard focus, or a body click that skips the control fails. | `audit:ChatComposer/focus`          |
| FR9, AR5  | `ChatComposer.test.tsx` status announcement tests                                                                                                                  | error, warning, StrictMode mount, repeat after clear, no message, page load     | A live role on the bar, a repeated or missing announcement, or the wrong urgency fails.                  | `audit:ChatComposer/accessibility`  |

Read from source, with no focused test yet:

- FR1: controlled and uncontrolled draft storage, trimming, rejecting an empty
  or disabled submission, and clearing through the active channel.
- FR5: slot order, the omitted header row, and status placement above or below
  the body.
- FR6: the density spacing.
- FR7: the shadow and border values for each elevation.
- FR10: where each BaseProps input lands.
- PR1–PR2: context stability, and no document listener or observer of the
  component's own.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Body theming reachability.** Should a new stable body target be added, should the released `chat-composer` target move, or should elevation be projected through the existing root target by another compatible mechanism? (`human-api`)
- **OQ2 — BaseProps owner.** Should ref, neutral DOM props/events, `className`, `style`, and `xstyle` all own the outer frame or the painted body, and what compatibility path preserves existing consumers? (`human-api`)
- **OQ3 — Spacious density.** Should `spacious` intentionally alias `balanced`, or should it receive distinct spacing selected by design? (`human-design`)
- **OQ4 — Stop callback invariant.** When `isStopShown` is true without `onStop`, should the component reject the combination, disable or hide Stop, or keep the currently inert action? (`human-api`)

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or shared system rules. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatComposerDrawer.spec.md -->


# ChatComposerDrawer component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Add one optional `collapsedSummary?: ReactNode` slot, named from the canonical **Collapsed summary** anatomy part, for caller-composed visual content.                                                                      |
| Behavior                | `count` continues to enable the disclosure. Omitting `collapsedSummary` keeps the neutral Badge count plus resolved label; providing it replaces that complete visual summary without changing collapse behavior or naming. |
| End-user impact         | People retain the established Badge hierarchy by default. Products that need a quieter or differently composed collapsed row may provide one localized visual summary without weakening disclosure semantics.               |
| Builder impact          | Existing callsites do not change. A builder choosing the slot owns its visual content and localization, while `label` continues to identify the controlled content for the component-owned accessible name.                 |
| Compatibility/readiness | Additive and default-preserving. This record is current authority; the slot and its mapped implementation, consumer docs, tests, and rendered evidence have not shipped yet.                                                |
| Review checks           | Reject a plain-text default, a second summary API, custom content that changes naming or collapse state, reachable interactive descendants inside the visual summary, or any regression to the no-slot and no-count paths.  |
| Governing rules         | `component:ChatComposerDrawer/FR1–FR10, AR1–AR4, DEC-1–DEC-2`; `architecture:public-component-api/INV3–INV4, INV9, INV13`; `spec:AST-002/DEC-1, DEC-2`.                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposerDrawer composes supplementary content above ChatComposer input. When
`count` is present, builders may let people collapse that content while keeping a
compact summary available.

Two otherwise identical drawers may need different visual hierarchy in the
collapsed state. The product builder knows whether the established count Badge or
a quieter, product-specific summary fits that context, and ChatComposerDrawer
cannot derive that distinction from count, content, layout, locale, or collapse
state. The component therefore exposes one visual composition seam while retaining
its existing default and owning all disclosure behavior.

## Compatibility and migration

- Released default preserved: yes. Omitting `collapsedSummary` keeps the neutral
  count Badge followed by the resolved label.
- Compatibility class: additive optional composition slot with no default change.
- Controlled/uncontrolled behavior: unchanged.
- Migration decision: none. Existing callsites require no edits.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The drawer surface, optional disclosure state, disclosure association, and
  availability of collapsed descendants.
- Controlled and uncontrolled collapse requests.
- The Badge-preserving default summary and the presentation-only boundary for one
  caller-composed collapsed summary.
- The disclosure's localized accessible name, independently of visual summary
  content.

**Does not own / non-goals**

- The meaning, styling, or localization of caller-provided drawer children or custom
  summary content.
- Interactive behavior inside the custom summary; the summary is visual-only and
  never creates another focus or activation target.
- ChatComposer input, submission, status, and action behavior.
- A presentation enum, Badge toggle, render callback, summary-specific theme target,
  or a second accessible-name prop.

## Public concepts

| Concept           | Closed values or states          | Meaning                                                                                     | Availability by state               | Default                  | Owner                          | Stability           | Invalid-value behavior                                             |
| ----------------- | -------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------ | ------------------------------ | ------------------- | ------------------------------------------------------------------ |
| drawer content    | any React node                   | Supplementary content composed above the chat input.                                        | always                              | none                     | `component:ChatComposerDrawer` | stable              | Missing content is rejected by the required type.                  |
| collapse support  | unavailable, expanded, collapsed | Presence of `count`, including zero, enables one disclosure and supplies its summary count. | unavailable when `count` is omitted | unavailable              | `component:ChatComposerDrawer` | stable              | Collapse inputs have no visible effect without `count`.            |
| collapse control  | uncontrolled, controlled         | Internal state or `isCollapsed` determines the current disclosure state.                    | when collapse support is available  | uncontrolled             | `component:ChatComposerDrawer` | stable              | Controlled state wins over the initial default.                    |
| collapsed summary | default, caller-composed         | Visual content shown for the collapsed disclosure.                                          | when collapse support is available  | neutral Badge plus label | caller choice; component seam  | accepted, unshipped | Omission uses the default; without `count`, no summary is exposed. |
| collapse request  | next state                       | Activation asks for the opposite effective collapsed state.                                 | when collapse support is available  | none                     | `component:ChatComposerDrawer` | stable              | No request is emitted without a disclosure.                        |

`collapsedSummary` is the camelCase public API projection of the canonical
**Collapsed summary** anatomy part. It is the complete custom visual summary, not
an addition before or after the default. The component does not parse, clone,
decorate, or supply data to the node. Builders already own the values they pass as
`count` and `label`; when a custom summary forms a sentence or formats a number,
its callsite owns the complete localized message.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                         | Basis                                                                                |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| FR1  | When `count` is present, including when it is `0`, the component MUST expose one named disclosure control with `aria-expanded` and a resolvable `aria-controls` relationship.                                                                                                                                                     | released API and implementation; WAI-ARIA disclosure semantics                       |
| FR2  | Pointer activation, Enter, and Space MUST request the opposite effective collapsed state exactly once.                                                                                                                                                                                                                            | released implementation and public callback contract                                 |
| FR3  | In controlled mode, `isCollapsed` MUST remain authoritative; in uncontrolled mode, activation MUST update internal state before the next render.                                                                                                                                                                                  | released implementation and consumer docs                                            |
| FR4  | Collapsed drawer content MAY remain mounted for the grid transition, but its descendants MUST be absent from keyboard and assistive-technology navigation.                                                                                                                                                                        | WAI-ARIA disclosure semantics; WCAG 2.4.3 and 2.4.7                                  |
| FR5  | Keyboard focus on the disclosure MUST remain visibly perceivable through the shared focus-indicator mechanism.                                                                                                                                                                                                                    | `architecture:interaction-modality/INV1–INV4`                                        |
| FR6  | Omitting `count` MUST render drawer content directly, MUST NOT create a disclosure control, and MUST NOT expose `collapsedSummary`. Existing collapse inputs continue to have no visible effect in this state.                                                                                                                    | released no-count behavior and compatibility                                         |
| FR7  | The root MUST continue forwarding its ref, BaseProps attributes, and styling seams without moving them to an internal child.                                                                                                                                                                                                      | released public surface and `architecture:public-component-api/INV5–INV6, INV8–INV9` |
| FR8  | `collapsedSummary` MUST remain the camelCase public name of the canonical **Collapsed summary** anatomy part. When omitted, the collapsed disclosure MUST preserve the existing neutral Badge containing `count`, followed by the resolved `label`; when provided, the node MUST replace that complete anatomy part exactly once. | approved anatomy-aligned caller-composition boundary and released default            |
| FR9  | The custom summary MUST affect visual content only. It MUST NOT change whether collapse is available, effective collapse state, toggle activation, callback values, the controlled region, or the component-owned accessible name.                                                                                                | constrained slot contract and `spec:AST-002/DEC-2`                                   |
| FR10 | The summary subtree MUST remain presentation-only: the disclosure is the sole focus and activation target, summary descendants MUST be absent from the tab order and accessibility tree, and custom content MUST NOT add another action.                                                                                          | WAI-ARIA disclosure semantics and component-owned accessibility boundary             |

### Allowed variation

- **AV1 — Drawer child composition.** Builders choose the drawer content and its own
  semantics.
- **AV2 — Custom summary composition.** Builders may compose any visual content that
  fits the presentation-only boundary, including localized text or existing Astryx
  display components.
- **AV3 — Summary lifecycle.** The component may keep the default or custom summary
  mounted while visually expanded to preserve animation. Callers MUST NOT depend on
  mount or unmount timing.
- **AV4 — Custom summary styling.** Caller-composed content retains the styling and
  theme seams of the components it uses. ChatComposerDrawer adds no summary-specific
  target.

### Representative states

| State                            | Required invariant                                                                                                      | Allowed variation                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `count` omitted                  | Content is visible; no disclosure or summary is exposed.                                                                | Child content and root styling.                   |
| default summary, collapsed       | One disclosure shows the neutral count Badge plus resolved label.                                                       | Count value and localized label.                  |
| custom summary, collapsed        | One disclosure shows the caller node instead of both default summary parts.                                             | Presentation-only custom content and styling.     |
| custom summary, expanded         | The disclosure retains its state and name; the custom summary may stay mounted but is visually and semantically hidden. | Internal crossfade and mount timing.              |
| controlled expanded or collapsed | Rendered state follows `isCollapsed`; activation reports the requested next state.                                      | Parent timing and whether it accepts the request. |

### Transformation and precedence order

- **ORD1 — Collapse availability.** `count` present → disclosure enabled; `count`
  omitted → no disclosure or collapsed summary.
- **ORD2 — Effective state.** `isCollapsed` when defined → otherwise internal state
  initialized from `defaultIsCollapsed`.
- **ORD3 — Visual summary.** Caller-provided `collapsedSummary` → otherwise the
  neutral Badge for `count` followed by the resolved `label`.
- **ORD4 — Accessible name.** Resolve `label` from the prop or locale catalog → use
  the catalog's expand or collapse action message for the effective state. Visual
  summary content never enters or overrides this pipeline.

### Performance and resources

- **PR1 — Local state only.** The summary seam MUST NOT require an Effect, observer,
  listener, timer, or external resource.

## Accessibility contract

- **AR1 — Disclosure relationship.** The toggle exposes one localized name, expanded
  state, and a resolvable controlled-content ID.
- **AR2 — Naming stays component-owned.** `label` identifies the controlled drawer
  content in the expand/collapse catalog message. Default or custom visual summary
  text MUST NOT replace, duplicate, or concatenate into that accessible name.
- **AR3 — Hidden content is unavailable.** Visually collapsed drawer descendants are
  unavailable until expansion.
- **AR4 — Custom summary remains presentation-only.** Custom content cannot add a
  second focus stop, activation target, role, or announcement inside the disclosure.

## Design relationships

No current design specification governs this component-local representation.

| Anatomy or state  | Design requirement                                                                   | Representation authority                         | Hierarchy role | Component contract |
| ----------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ | -------------- | ------------------ |
| root surface      | Existing released surface remains unchanged by this decision.                        | released behavior                                | supporting     | FR7                |
| disclosure toggle | One operable, named control owns collapse interaction.                               | component-owned                                  | supporting     | FR1–FR5, AR1       |
| collapsed summary | Badge hierarchy remains the default; callers may choose one visual composition slot. | component default or caller-selected composition | supporting     | FR8–FR10, AR2–AR4  |
| content area      | Collapsed descendants remain unavailable to keyboard and assistive technology.       | component-owned                                  | supporting     | FR4, FR6, AR3      |

The existing `chat-composer-drawer` target remains on the painted root. The
Badge-preserving default delegates count paint to Badge. Caller-composed summary
content retains the theme ownership of the components it supplies. This decision
adds no ChatComposerDrawer summary target and does not make arbitrary slot internals
part of ChatComposerDrawer's theming API.

## Family and system relationships

- `architecture:public-component-api` owns reachability, naming grammar, and
  compatibility of the additive slot; this component owns its local meaning and
  default.
- `architecture:interaction-modality` owns shared focus-visibility mechanics; this
  component owns the disclosure as its semantic focus owner.
- `architecture:component-theming-surface` owns target and anatomy mapping rules; the
  custom summary does not create a new target or transfer ownership of caller
  content.
- `architecture:knowledge-contracts` limits this current authority to the explicit
  claims in this record.
- `spec:AST-002/DEC-1` admits the slot because otherwise-identical drawers may need
  a caller-owned visual hierarchy the component cannot derive. `DEC-2` requires the
  seam to preserve a dependable, accessibility-safe outcome.

## Verification map

| Contract                 | Verification                                                            | Representative states                                                      | Mutation or failure expectation                                                                                                    | Audit section                            |
| ------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| FR1–FR3, FR6, ORD1–2     | focused ChatComposerDrawer state and keyboard tests                     | no count; zero count; controlled; uncontrolled; pointer; Enter; Space      | Presence/truthiness changes collapse availability, state authority changes, or callback reports the wrong next state.              | `audit:ChatComposerDrawer/behavior`      |
| FR8–FR9, ORD3            | focused default/custom summary tests and consumer-doc projection checks | default; custom node; expanded; collapsed; no count                        | The default Badge disappears, default and custom content render together, custom content changes behavior, or no-count exposes it. | `audit:ChatComposerDrawer/api`           |
| FR4, FR10, AR2–AR4       | focused inert-state and custom-descendant tests plus exact-head a11y CI | default text; custom text; custom focusable descendant; collapsed/expanded | Hidden drawer content or custom summary becomes focusable, announced, or a second action; visual text replaces the catalog name.   | `audit:ChatComposerDrawer/accessibility` |
| FR5, AR1                 | `KeyboardFocus` Storybook play and exact-head visual/a11y gates         | keyboard focus in representative light and dark themes                     | Focus has no shared visible indicator or the disclosure relationship/name breaks.                                                  | `audit:ChatComposerDrawer/accessibility` |
| FR7                      | focused DOM/type tests and package checks                               | ref, BaseProps, xstyle, className, style                                   | Root ownership or a styling seam moves or disappears.                                                                              | `audit:ChatComposerDrawer/api`           |
| AV4 and theming boundary | source/runtime theme inspection of default and custom summaries         | default Badge; caller-composed Astryx content                              | A new summary target appears, Badge loses its target, or caller-owned content is retargeted as ChatComposerDrawer anatomy.         | `audit:ChatComposerDrawer/theming`       |

## Decision log

### DEC-1 — One visual slot preserves the Badge default

**Reference:** `component:ChatComposerDrawer/DEC-1`
**Decider:** `cixzhang`, `2026-09-21`

ChatComposerDrawer admits one optional `collapsedSummary` node for the complete
visual summary. Product builders own whether a particular collapsed row needs the
established Badge hierarchy or a quieter localized composition, and the component
cannot derive that visual hierarchy. Omitting the slot preserves the existing
neutral Badge plus label, so no current builder receives a new choice or migration.

Rejected: replacing the default with a `{count} {label}` sentence, adding a Badge
boolean or finite presentation enum, adding a render callback for values already
owned by the caller, or exposing parallel summary seams. Those shapes either break
the released default, encode presentation machinery, invite locale-unsafe string
concatenation, or add more API than the caller-owned distinction requires.

### DEC-2 — Visual composition does not own disclosure semantics

**Reference:** `component:ChatComposerDrawer/DEC-2`
**Decider:** `cixzhang`, `2026-09-21`

The custom summary is presentation-only. The existing `label` and locale catalog
continue to name the expand/collapse action; `count` continues to enable the
disclosure; and the component keeps summary descendants out of focus, activation,
and assistive-technology navigation. The seam cannot replace these obligations.

Rejected: deriving the accessible name from arbitrary summary content or letting a
custom summary introduce another action inside the disclosure. Both make correct
semantics depend on caller markup the component cannot verify.

## Open questions

None for this contract slice.

## Content boundary

This file owns ChatComposerDrawer's collapsed-summary composition boundary,
Badge-preserving default, collapse gating and state behavior, accessible naming,
compatibility, and required evidence. It does not duplicate the complete consumer
prop reference, implementation steps, current audit score, or unrelated component
gaps. Current authority is claim-scoped to the explicit requirements above and does
not certify every ChatComposerDrawer behavior.

---

<!-- source: docs/specs/components/Chat/ChatComposerInput.spec.md -->


# ChatComposerInput component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | ChatComposerInput remains the optional rich editing surface for ChatComposer, with controlled draft, trigger, history, paste, file, and imperative seams. Each trigger definition may opt into multi-word queries with `hasMultiWordQuery`, default `false`. `enterKeyHint` (`EnterKeyHint`, default `send`) labels the touch keyboard's Return key (FR17).                                                                                                                                                                                                   |
| Behavior                | Every edit path keeps the serialized draft observable. Files pasted or dropped reach `onFiles`; consumer `onPaste` receives first refusal over plain text before optional paste-as-token conversion.                                                                                                                                                                                                                                                                                                                                                          |
| End-user impact         | Dictated or otherwise programmatically inserted text is sendable and never hidden behind the empty placeholder; dropped files reach the product attachment flow. On a phone, the Return key says Send, which is what Enter does.                                                                                                                                                                                                                                                                                                                              |
| Builder impact          | Existing props, callback signatures, exports, and token serialization are unchanged. Builders relying on the documented `onPaste` and `onFiles` paths receive those callbacks except where FR5 and FR6 record implementation gaps; `hasMultiWordQuery` is an added optional trigger field, and `enterKeyHint` an added optional prop whose `send` default a composer that makes Enter insert a line break replaces with `enter` (FR17). Every trigger receives the trigger-key corrections listed under Compatibility and migration (FR10, FR13, FR15, FR16). |
| Compatibility/readiness | Patch-compatible. One additive optional trigger field (DEC-1), one additive optional prop with a keyboard-hint default (DEC-2, a patch `[feat]` under `spec:AST-017` FR5, FR7), plus trigger-key corrections that apply to every trigger (FR10, FR13, FR15, FR16); no visual decision. Implementation gaps are recorded inline on FR5, FR6, FR10, and PR2.                                                                                                                                                                                                    |
| Review checks           | Reject an edit path that mutates the DOM without updating the serialized draft, a file drop that can navigate away or bypass `onFiles`, a text paste that bypasses consumer interception, changed submit/token semantics, a trigger query that alters typed text, a key that picks a row from an earlier trigger query, a menu that reopens after a send, a Return key label that changes what Enter does, or an `enterKeyHint` type that accepts any string.                                                                                                 |
| Governing rules         | `architecture:public-component-api/INV1`, `INV2`–`INV4`, `INV25`; `architecture:interaction-modality/INV1–INV4`; `architecture:knowledge-contracts/INV11, INV16`; `spec:AST-002`; `spec:AST-029`; `component:TextInput/FR16, DEC-1`; rubric B15.                                                                                                                                                                                                                                                                                                              |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposerInput supplies ChatComposer's rich editing surface when a plain custom
textarea is insufficient. It owns contenteditable text and selection, serialized
inline tokens, trigger menus, history recall, paste and file intake, and the
imperative editing handle.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: patch-compatible; one additive optional trigger field, one additive optional prop, `enterKeyHint`, whose `send` default is a touch-keyboard hint that leaves what Enter does unchanged (patch `[feat]`, `spec:AST-017` FR5, FR7; `enterKeyHint="enter"` keeps the plain Return key), and trigger-key corrections for every trigger
- Controlled and composition behavior: unchanged
- Migration decision: none
- Trigger query shape: `hasMultiWordQuery` is an additive optional trigger field; omitting it keeps single-token queries
- Every trigger, opted in or not, also receives these patch-compatible corrections:
  - FR13, correction: a key never picks a row returned for an earlier query, and a result arriving after a send, clear, pick, or dismissal is discarded instead of reopening the menu.
  - FR15, correction: IME composition keys never pick a row or move the highlighted row.
  - FR16, correction: after Escape, the menu stays hidden while the same query keeps growing instead of reopening on the next keystroke.
  - FR10, correction: a tab before the trigger character is a boundary, like a space or line break.

## Ownership boundary

**Owns**

- The contenteditable surface, its accessible editing semantics, and serialization.
- Trigger-menu invocation and token insertion inside the editor.
- Enter submission, history navigation, paste precedence, file intake, and imperative edit observability.
- Registration of the editing focus control with ChatComposer.
- The touch keyboard's Return key label on the editor (FR17).

**Does not own / non-goals**

- ChatComposer layout, send-button state, status placement, or shell elevation.
- Product validation, upload, progress, or error handling for files.
- Search result data, custom token meaning, or custom token interaction semantics supplied by callers.
- A new visual representation for the editor, token, menu, or drop target.

## Public concepts

| Concept            | Closed values or states                                                     | Meaning                                                                                     | Availability by state           | Default                     | Owner                         | Stability | Invalid-value behavior                                                |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------- | ----------------------------- | --------- | --------------------------------------------------------------------- |
| draft storage      | DOM-owned; `value` controlled; ChatComposer context controlled              | Selects the serialized draft source and observable change channel.                          | every editor                    | context or empty DOM        | `component:ChatComposerInput` | stable    | Explicit `value` wins; unsupported values are rejected by TypeScript. |
| submission         | Enter; Shift+Enter; IME Enter; consumer-cancelled Enter                     | Submits one trimmed non-empty draft only on uncancelled Enter without Shift or composition. | enabled editor                  | Enter submits               | `component:ChatComposerInput` | stable    | Empty or composing submission is ignored.                             |
| trigger menu       | omitted; one or more trigger definitions                                    | Opens suggestions at a configured character and inserts text or a serialized token.         | when triggers are configured    | omitted                     | `component:ChatComposerInput` | stable    | Unknown trigger characters remain ordinary text.                      |
| trigger query      | single-token; multi-word                                                    | Sets where an active trigger query ends, as FR10 and FR11 state.                            | while a trigger is active       | single-token                | `component:ChatComposerInput` | stable    | Omitting `hasMultiWordQuery` keeps single-token queries.              |
| history            | enabled; disabled                                                           | Recalls submitted drafts at text boundaries with ArrowUp and ArrowDown.                     | when enabled and history exists | enabled                     | `component:ChatComposerInput` | stable    | Mid-text arrow keys retain native caret behavior.                     |
| text paste         | consumer-handled; paste-as-token; plain text                                | Gives `onPaste` first refusal, then optional token conversion, then inserts plain text.     | enabled editor                  | long-paste token conversion | `component:ChatComposerInput` | stable    | A handled callback stops later insertion paths.                       |
| file intake        | pasted; dropped                                                             | Prevents browser navigation and passes the files to `onFiles`.                              | when files are supplied         | no callback                 | `component:ChatComposerInput` | stable    | Empty drops do nothing; disabled input does not emit files.           |
| imperative editing | insert token; expand token; insert text; focus; get value                   | Lets composing features such as dictation operate through the editor's owned behavior.      | while mounted                   | none                        | `component:ChatComposerInput` | stable    | Calls without a mounted editor are no-ops or return an empty value.   |
| Return key label   | `EnterKeyHint`: `enter`, `done`, `go`, `next`, `previous`, `search`, `send` | What the touch keyboard's Return key says; it does not change what Enter does.              | every editor                    | `send`                      | `component:ChatComposerInput` | stable    | TypeScript rejects other values.                                      |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Basis                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| FR1  | Every user or imperative edit that changes serialized content MUST update empty state and emit the effective value through the active `onChange` channel. An imperative `handleRef.insertToken` emits once, as typing does.                                                                                                                                                                                                                                                                                                                                                       | Shipped `onChange` contract, imperative handle, and ChatDictation callsite. |
| FR2  | Enter without Shift MUST submit one trimmed non-empty draft and clear it unless the event is composing, the trigger menu consumes it, or a consumer prevents default.                                                                                                                                                                                                                                                                                                                                                                                                             | Shipped implementation and consumer docs.                                   |
| FR3  | Shift+Enter and mid-text history arrows MUST retain native multiline editing behavior.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Shipped implementation and focused tests.                                   |
| FR4  | `value` supplied directly on ChatComposerInput MUST win over ChatComposer context, while an emitted echo MUST NOT rebuild the DOM or move the caret.                                                                                                                                                                                                                                                                                                                                                                                                                              | Shipped controlled precedence and regression tests.                         |
| FR5  | Plain-text paste precedence MUST be consumer `onPaste` → configured/default paste-as-token → plain insertion. Implementation gap: a paste whose selection starts inside a token inserts the text after that token without calling `onPaste`.                                                                                                                                                                                                                                                                                                                                      | Public callback meaning and objective callback composition.                 |
| FR6  | File paste and file drop MUST prevent native insertion/navigation and deliver the same ordered `File[]` to `onFiles`; disabled editors MUST NOT emit file callbacks. Implementation gap: a file paste whose selection starts inside a token never reaches `onFiles`.                                                                                                                                                                                                                                                                                                              | Shipped public `onFiles` contract and consumer docs.                        |
| FR7  | Trigger-menu keyboard handling MUST run before consumer and built-in editor handling; IME composition MUST never submit.                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Shipped interaction contract and tests.                                     |
| FR8  | History recall MUST operate only at the draft boundaries and MUST restore the pending draft after stepping past the newest item.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Shipped behavior and tests.                                                 |
| FR9  | The root MUST keep forwarding its ref, BaseProps attributes, and styling seams; the imperative handle remains separate in `handleRef`.                                                                                                                                                                                                                                                                                                                                                                                                                                            | Released public API and `architecture:public-component-api`.                |
| FR10 | A trigger activates when its character starts the text or follows a space, a tab, or a line break, and its query runs from after that character to the caret. Inside an active multi-word query, FR11 limits which characters activate. A no-break space, such as the one after an inserted token, is not a boundary. A single-token query ends at a space, a tab, or a line break. Implementation gap: a trigger character that begins a text node activates whatever precedes it, such as an `@` typed directly after an inserted token and before its trailing no-break space. | Shipped trigger detection; DEC-1.                                           |
| FR11 | A trigger with `hasMultiWordQuery: true` keeps its query through spaces and punctuation. The query ends only at a line break, past an implementation-owned length bound of at least 64 characters, or where the same trigger's character after a space, a tab, or a line break starts a new query; no word count, punctuation list, or termination callback applies. Inside an active multi-word query, another trigger's character does not activate under FR10, so the query continues through it.                                                                              | DEC-1.                                                                      |
| FR12 | Ending a trigger query MUST leave the typed text unchanged. Only an explicit pick of a current row replaces the range from the trigger character to the caret.                                                                                                                                                                                                                                                                                                                                                                                                                    | DEC-1.                                                                      |
| FR13 | While a newer search for the active query is pending, Enter without Shift submits the draft as typed and MUST NOT pick a row; no key picks a row returned for an earlier query. Results for a superseded query, or arriving after a pick, dismissal, submission, or the query ending, are discarded, so the menu never reopens over a sent or cleared draft. This applies to every trigger.                                                                                                                                                                                       | DEC-1; reference chat composer behavior.                                    |
| FR14 | When a multi-word query settles with no matches, the menu is hidden unless the trigger supplies `emptySearchText`. A single-token query with no matches shows the empty message.                                                                                                                                                                                                                                                                                                                                                                                                  | DEC-1.                                                                      |
| FR15 | Keys pressed during IME composition MUST NOT pick a row or move the highlighted row.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | DEC-1; FR7.                                                                 |
| FR16 | Escape on a visible menu dismisses it, and the menu stays hidden while the same query keeps growing from the same trigger. While open, the menu stays open for a press on the editor or in the menu and closes for a press elsewhere (`architecture:layer-runtime`).                                                                                                                                                                                                                                                                                                              | DEC-1.                                                                      |
| FR17 | The editor carries `enterkeyhint`: the `enterKeyHint` value when one is set, otherwise `send`, because Enter sends (FR2). `enterKeyHint` takes the closed union `EnterKeyHint` (`component:TextInput` FR16), so TypeScript rejects any other value. The hint only labels the key: FR2 and FR3 decide what Enter and Shift+Enter do whatever it says, so a composer whose `onKeyDown` makes Enter insert a line break passes `enter`. ChatComposer's default input carries the same default.                                                                                       | DEC-2; `component:TextInput` DEC-1                                          |

### Allowed variation

- **AV1 — Search content.** Builders own trigger characters, search sources, item rendering, and inserted values.
- **AV2 — Token content.** Builders may use the structured Badge form or the custom render escape hatch and own custom semantics.
- **AV3 — Product file workflow.** Builders own accepted types, validation, upload, progress, and errors after `onFiles` receives the files.

### Representative states

| State                               | Required invariant                                                                                                                   | Allowed variation                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| empty                               | Placeholder is visible and the serialized value is empty.                                                                            | Placeholder copy.                      |
| typed or imperatively inserted text | Placeholder is absent and the same serialized value is observable to ChatComposer and callbacks, an imperative token included (FR1). | Draft content.                         |
| controlled update                   | External value is reflected without corrupting a live caret or treating a stale echo as authoritative.                               | Parent update timing.                  |
| trigger menu open                   | Combobox semantics and active option wiring are exposed; menu interaction owns its keys.                                             | Search source and item rendering.      |
| trigger search pending              | Enter submits the draft as typed; no earlier query's row can be picked.                                                              | Loading copy and source latency.       |
| trigger menu hidden                 | The editor reports a collapsed combobox and the menu consumes no keys.                                                               | Why the menu is hidden.                |
| file paste or drop                  | Native insertion/navigation is prevented and files reach `onFiles` once (FR6 records an implementation gap).                         | File types and product handling.       |
| disabled                            | Editing and file callbacks are unavailable and disabled state is exposed.                                                            | Product reason and surrounding status. |

### Transformation and precedence order

- **ORD1 — Draft source.** Explicit `value` → ChatComposer context value → editor DOM.
- **ORD2 — Change channel.** Explicit controlled input callback when `value` is explicit → ChatComposer context callback → distinct local callback.
- **ORD3 — Key handling.** Trigger menu → consumer `onKeyDown` → IME/submit/history behavior.
- **ORD4 — Plain paste.** Consumer `onPaste` → paste-as-token behavior → plain insertion (FR5 records an implementation gap).
- **ORD5 — File intake.** Files on clipboard or data transfer → prevent native behavior → emit `onFiles` when enabled (FR6 records an implementation gap).

### Performance and resources

- **PR1 — Selection work.** Selection reads and writes are scoped to the mounted editable and run only for direct editing actions or controlled synchronization.
- **PR2 — Async trigger work.** Search cancellation goes through the supplied `SearchSource` and its optional `cancel`, and `debounceMs` sets the delay before an async search starts. Implementation gap: each keystroke that changes the query also calls `search('')` at once to detect whether the source is async, so an async source receives an undelayed search.
- **PR3 — Portal cleanup.** Token portals are cleaned through the existing token hook when content changes or unmounts.

## Accessibility contract

- **AR1 — Editing semantics.** Without triggers, the surface is a named multiline textbox; with triggers, it exposes the adopted combobox semantics without invalid multiline ARIA.
- **AR2 — Disabled state.** Disabled editing is exposed with `aria-disabled` and cannot accept content or file callbacks.
- **AR3 — Keyboard ownership.** IME, trigger-menu keys, consumer cancellation, Enter submission, and boundary-only history do not steal one another's keys.
- **AR4 — Focus visibility.** When composed in ChatComposer, the semantic editor focus owner drives the shell's shared keyboard focus indicator.
- **AR5 — Collapsed suggestions.** While the menu is hidden, the editor reports `aria-expanded="false"`, exposes no active descendant, and arrow keys, Enter, and Escape reach the editor and its surroundings.

## Design relationships

| Anatomy or state | Design requirement                 | Representation authority | Hierarchy role | Component contract  |
| ---------------- | ---------------------------------- | ------------------------ | -------------- | ------------------- |
| input root       | existing themed target             | observed implementation  | supporting     | FR9                 |
| editable surface | ordinary composer editing surface  | ChatComposer family      | prominent      | FR1–FR4, AR1–AR4    |
| placeholder      | secondary text while empty         | current token role       | supporting     | FR1                 |
| trigger menu     | delegated Typeahead behavior       | Typeahead owner          | floating       | FR7, FR10–FR16, AR5 |
| inline token     | structured Badge or caller content | Badge or caller owner    | supporting     | AV2                 |

The existing `chat-composer-input` target remains on the root. This record does not
add a theming target or decide a new visual state.

## Family and system relationships

- `component:ChatComposer` owns layout, submission orchestration, send state, and the shell focus ring; this component owns the editing surface and its change channel.
- Typeahead and SearchSource own result collection behavior; ChatComposerInput owns when the trigger menu participates in editor key precedence.
- `architecture:interaction-modality` owns the shared focus-visibility mechanics.
- `spec:AST-029` owns the observational audit-backfill boundary.

## Verification map

| Contract              | Verification                                                                                                                                                                                                                                                                                                                                                                                           | Representative states                                                                       | Mutation or failure expectation                                                                                                                                                                  | Audit section                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| FR1, ORD1–ORD2        | focused imperative insertion (text and token) and controlled-sync tests; `ImperativeInsertion` play                                                                                                                                                                                                                                                                                                    | empty → inserted text; controlled echo; external override                                   | Text appears only in the DOM, placeholder remains, callback is stale, or the caret jumps.                                                                                                        | `audit:ChatComposerInput/behavior`      |
| FR2–FR3, FR7–FR8, AR3 | focused keyboard, IME, trigger, and history tests                                                                                                                                                                                                                                                                                                                                                      | Enter; Shift+Enter; composition; cancelled key; boundary and mid-text arrows                | A key submits twice, submits during composition, or steals native editing.                                                                                                                       | `audit:ChatComposerInput/interaction`   |
| FR10–FR16, AR5        | focused trigger-query and trigger keyboard tests; "keeps the trigger menu open on a press in the editor or the menu, closes it on a press elsewhere"                                                                                                                                                                                                                                                   | single-token; multi-word; line break; length bound; pending search; no matches; IME; Escape | A query ends early or alters text, Enter picks an earlier query's row or fails to submit while a search is pending, a late result reopens the menu after a send, or a hidden menu consumes keys. | `audit:ChatComposerInput/interaction`   |
| FR5, ORD4             | focused long-paste interception tests                                                                                                                                                                                                                                                                                                                                                                  | consumer handled; token conversion; plain insertion                                         | Consumer interception is skipped or multiple insertion paths run.                                                                                                                                | `audit:ChatComposerInput/behavior`      |
| FR6, ORD5, AR2        | focused paste/drop tests and `FileDrop` play                                                                                                                                                                                                                                                                                                                                                           | paste; drop; disabled                                                                       | Files navigate away, insert into the editor, bypass `onFiles`, or emit while disabled.                                                                                                           | `audit:ChatComposerInput/behavior`      |
| AR1, AR4              | role/name/ARIA tests plus exact-head accessibility and visual gates                                                                                                                                                                                                                                                                                                                                    | textbox; combobox; disabled; keyboard focus                                                 | Name, role, multiline, expanded, disabled, or visible focus semantics regress.                                                                                                                   | `audit:ChatComposerInput/accessibility` |
| FR9                   | ref, target, package, and repository checks                                                                                                                                                                                                                                                                                                                                                            | ref; BaseProps; xstyle; className; style                                                    | Root ownership or a styling seam moves or disappears.                                                                                                                                            | `audit:ChatComposerInput/api`           |
| FR17                  | `ChatComposerInput.test.tsx` touch keyboard Return key suite (`send` by default, the set value, `send` inside ChatComposer's default input, Enter submits under every label); `ChatComposerInput.public.test.ts`, run by `pnpm typecheck`, for `EnterKeyHint` rejecting an arbitrary or unnarrowed string; `ChatComposerReturnKey.a11y.chromium.spec.ts` for the attribute on the editor a tap focuses | default; `enter`; inside ChatComposer; a phone viewport with touch emulation                | A missing or wrong `enterkeyhint`, a label that stops Enter from submitting, or a type that accepts `string` fails.                                                                              | `audit:ChatComposerInput/api`           |

## Decision log

### DEC-1 — Trigger queries are non-destructive and act only on current results

**Reference:** `component:ChatComposerInput/DEC-1`
**Decider:** `cixzhang`, `2026-10-06`; pending-search Enter, `2026-10-14`; cross-trigger continuation applies the same reference-composer direction, `2026-10-14`

Only the caller knows whether its suggestions contain spaces, so multi-word
queries are a per-trigger opt-in and single-token triggers such as commands keep
ending at whitespace. A multi-word query never changes what the person typed: it
ends as FR11 states, and only an explicit pick replaces text. Suggestions act
only on the current query: while a search is pending, Enter sends the message as
typed and never picks a row from an earlier query, and results that arrive after
the send are dropped so the menu never reopens over the cleared composer. This
matches the reference chat composer, where a message may simply start with a
trigger. An unmatched multi-word phrase hides the menu instead of covering prose
with an empty panel. Inside an active multi-word query another trigger's
character does not start a query, so `@Jordan /` keeps the mention query, while
the same trigger's character starts a new query as FR11 states; both match the
reference chat composer.

Rejected: word caps, punctuation terminators, or a termination callback; they cut off real names and depend on language.

Rejected: holding Enter until a pending search settles; it blocks sending a message that only starts with a trigger.

### DEC-2 — The Return key says Send

**Reference:** `component:ChatComposerInput/DEC-2`
**Decider:** `cixzhang`, `2026-11-01`

Enter sends the draft (FR2), so the editor labels the touch keyboard's Return key
Send itself, as a component decides what it can derive
(`architecture:public-component-api` INV4). A caller whose Enter does something
else passes its own `enterKeyHint`.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, current audit scores,
or visual design rationale. It records shipped behavior, objective corrections, and
the trigger-query contract in DEC-1, without deciding a new visual representation.

---

<!-- source: docs/specs/components/Chat/ChatComposerTokenElement.spec.md -->


# ChatComposerTokenElement component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatComposerTokenElement` with a required `token`: structured, which is `value` plus Badge props, of which only `label`, `variant`, and `icon` render and the rest are accepted and ignored; or custom `{value, render}`, `ref`, `xstyle`, `className`, `style`, and neutral span props. |
| Behavior                | A structured token renders Badge content; a custom token renders caller content. Both retain the serialized value marker and stay non-editable when placed inside a contenteditable composer.                                                                                             |
| End-user impact         | Token labels and caller content remain visible without becoming editable text.                                                                                                                                                                                                            |
| Builder impact          | None.                                                                                                                                                                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no public change. Evidence still pending for AR1 and parts of FR1, FR2, and FR4 (read from source; see the verification map).                                                                                                                                   |
| Review checks           | Reject a token wrapper that loses its serialized value, becomes editable, drops accepted span props, or changes the structured/custom rendering split.                                                                                                                                    |
| Governing rules         | `architecture:public-component-api/INV1, INV5–INV6, INV8–INV9, INV12`; `architecture:component-test-sufficiency/INV1–INV8, INV10–INV11`; `spec:AST-029/FR3–FR5, FR7`.                                                                                                                     |

This table is a review projection; the body below is authoritative.

## Intent

ChatComposerTokenElement renders one already-defined `ChatComposerToken` outside the
editor insertion machinery. It supplies the same serialization marker used by
ChatComposerInput while leaving structured Badge presentation or custom content to
their existing owners.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The span carrying `data-astryx-token` and the token's serialized value.
- Keeping that wrapper non-editable when composed inside a contenteditable region.
- Choosing the existing structured Badge or custom-render branch.
- Forwarding the wrapper ref and accepted neutral span props.

**Does not own / non-goals**

- Token value grammar or product semantics.
- Badge colors, iconography, or sizing.
- Accessibility semantics and interaction behavior inside caller custom content.
- Token insertion, deletion, expansion, or composer selection management.

## Public concepts

| Concept          | Closed values or states                          | Meaning                                                               | Default        | Owner                                | Stability |
| ---------------- | ------------------------------------------------ | --------------------------------------------------------------------- | -------------- | ------------------------------------ | --------- |
| token form       | structured Badge config; custom render function  | Selects caller content without changing serialization.                | none; required | `component:ChatComposerTokenElement` | stable    |
| serialized value | non-empty or empty string supplied by caller     | Value stored in `data-astryx-token-value` for composer serialization. | none; required | caller value through this component  | stable    |
| wrapper surface  | ref; DOM/data/ARIA props; className/style/xstyle | Extends the serialization span without replacing owned markers.       | omitted        | `architecture:public-component-api`  | stable    |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                  | Basis                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR1 | The root MUST expose `data-astryx-token` and the exact supplied `token.value`, and MUST remain `contentEditable={false}`.                                                  | Current source, docs, and tests                     |
| FR2 | Structured tokens MUST delegate label, variant, and icon rendering to Badge without changing the token value.                                                              | shipped implementation and public token type        |
| FR3 | Custom tokens MUST render the caller function result without adding component-owned semantics or interaction.                                                              | shipped implementation and public token type        |
| FR4 | Accepted ref, DOM/data/ARIA, className, style, and xstyle inputs MUST reach and compose on the root span while component-owned serialization attributes retain precedence. | `architecture:public-component-api/INV5–INV6, INV8` |

### Allowed variation

- Structured Badge labels, variants, and icons remain caller supplied.
- Custom rendered content and its semantics remain caller owned.
- The wrapper may be used inside or outside a contenteditable surface.

### Representative states

| State            | Required invariant                                                        | Allowed variation               |
| ---------------- | ------------------------------------------------------------------------- | ------------------------------- |
| structured token | Visible Badge content and exact serialized value.                         | Badge label, variant, and icon. |
| custom token     | Caller output and exact serialized value.                                 | Any caller-owned React node.    |
| extended wrapper | Neutral DOM props and ref reach the span without replacing owned markers. | Supported BaseProps values.     |

## Accessibility contract

- **AR1 — No owned semantics.** The wrapper owns no interactive role or
  accessible name beyond accepted caller props.
- **AR2 — Visible content.** Structured Badge text remains visible content;
  custom content semantics remain caller owned.
- **AR3 — Atomic token.** `contentEditable={false}` keeps the token atomically
  non-editable when nested in an editor.

## Design relationships

| Anatomy or state   | Design requirement        | Representation authority | Hierarchy role | Component contract |
| ------------------ | ------------------------- | ------------------------ | -------------- | ------------------ |
| token wrapper      | Inline alignment only     | Current source           | supporting     | FR1, FR4           |
| structured content | Badge presentation        | `component:Badge`        | supporting     | FR2                |
| custom content     | caller-owned presentation | caller                   | supporting     | FR3                |

The wrapper does not paint a component-owned visual surface or introduce a public theme
target. Badge theming remains owned by Badge, and custom content remains caller owned.

## Family and system relationships

- `component:ChatComposerInput` owns insertion, serialization traversal, deletion, and selection behavior.
- `architecture:public-component-api` owns the public props type, ref, and BaseProps composition.
- `architecture:component-test-sufficiency` owns direct evidence for the established public serialization seam.
- `spec:AST-029` owns the audit evidence inventory this record's verification map follows.

## Verification map

| Contract         | Verification                                                  | Representative states                        | Mutation or failure expectation                                                                 | Audit section                             |
| ---------------- | ------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1–FR3, AR2–AR3 | `ChatComposerTokenElement.test.tsx`; direct Storybook stories | structured and custom tokens                 | A marker/value disappears, the wrapper becomes editable, or the wrong rendering branch appears. | `audit:ChatComposerTokenElement/behavior` |
| FR4              | focused ref and DOM-passthrough test; public typecheck        | ref, ARIA/data props, styling seams          | An accepted input is dropped or an owned serialization marker is replaced.                      | `audit:ChatComposerTokenElement/api`      |
| rendered states  | direct Storybook stories                                      | Badge and custom content in supported themes | An unreachable story fails the story checks.                                                    | `audit:ChatComposerTokenElement/rendered` |

Read from source, with no focused test yet:

- AR1: the wrapper adding no role or accessible name of its own.
- FR1: `contentEditable` staying `false` when a caller passes it.
- FR2: `variant` and `icon` reaching the Badge.
- FR4: `className`, `style`, and `xstyle` composing on the span.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer examples, current audit scores, Badge policy, or
ChatComposerInput selection mechanics.

---

<!-- source: docs/specs/components/Chat/ChatDictationButton.spec.md -->


# ChatDictationButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatDictationButton` with a required `dictation` state (`isSupported`, `isListening`, `volume`, `bands`, `toggle`), `size` (`sm`, `md`; default `md`), `isHiddenWhenUnsupported` (default true), `label`, `ref`, `xstyle`, `className`, `style`, and span props. |
| Behavior                | An icon-only microphone Button that toggles dictation. While listening it shows five volume-reactive bars instead of the microphone; unsupported dictation renders nothing, or a disabled Button when kept visible.                                               |
| End-user impact         | Voice input is one labelled button that says whether it starts or stops dictation; browsers without speech recognition see no action that cannot run.                                                                                                             |
| Builder impact          | None.                                                                                                                                                                                                                                                             |
| Compatibility/readiness | Records shipped behavior; no public change. Two implementation gaps, listed under Current-state impact.                                                                                                                                                           |
| Review checks           | Reject an enabled unsupported action, a missing or stale start/stop name, bars exposed to assistive technology, or clipping color that a theme cannot retint.                                                                                                     |
| Governing rules         | `architecture:public-component-api`; `architecture:theme-tokens` INV3; `architecture:component-style-authoring` INV7; `design:reduced-motion`.                                                                                                                    |

This table is a review projection; the body below is authoritative.

## Intent

ChatDictationButton is the visible control for a speech-recognition state
owner. It turns that owner's support and listening state into one icon-only
Button and a five-bar volume display. Consumer usage lives in
`ChatDictationButton.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: listening state is owned by the supplied
  `dictation` value
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The volume bars are extra elements.** The listening display is a container
  and five bar `span` elements that no theme target paints.
  `architecture:component-style-authoring` INV7 renders one element per
  semantic role or themable part.

- **The bars set a z-index without isolation.** The bar container carries
  `z-index: 1` and the wrapper does not isolate it, so the bars take part in
  the page's stacking order. `spec:AST-027` FR1 keeps z-index local and lists
  this case as a containment gap.

## Ownership boundary

**Owns**

- The start and stop name, and the caller's `label` override (FR1, FR2).
- Hiding or disabling the control when speech recognition is unsupported
  (FR3).
- The five-bar display of the supplied bands and its clipping color (FR2, FR4).
- The wrapper span's ref, props, and styling (FR5).

**Does not own / non-goals**

- Speech recognition support detection, lifecycle, transcripts, errors, and
  microphone permission — owned by the `dictation` state owner.
- Activation, focus, disabled semantics, and icon-only presentation — owned by
  `component:Button`.
- Placement in ChatComposer — the caller's composition.
- A public color, threshold, or bar-shape option.

## Public concepts

| Concept   | Closed values or states                                  | Meaning                                                    | Availability by variant/orientation/state | Default                 | Owner                           | Stability | Invalid-value behavior           |
| --------- | -------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- | ----------------------- | ------------------------------- | --------- | -------------------------------- |
| Support   | supported; unsupported and hidden; unsupported and shown | Whether the control renders and whether it can operate.    | Every control.                            | hidden when unsupported | `component:ChatDictationButton` | Stable    | TypeScript rejects other values. |
| Listening | idle; listening                                          | Selects the start or stop name and the microphone or bars. | Supported controls.                       | idle                    | `dictation` owner               | Stable    | Not applicable.                  |
| Size      | `sm`, `md`                                               | Sizes the Button and bars together.                        | Every control.                            | `md`                    | `component:ChatDictationButton` | Stable    | TypeScript rejects other values. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                          | Basis                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FR1 | When supported and idle, the control is an enabled, icon-only ghost Button with the microphone icon, named by `label` or the translated start label, that calls `dictation.toggle` when activated. | Current source and tests                |
| FR2 | While listening, the Button is named by `label` or the translated stop label and shows no icon, and five bars, hidden from assistive technology, scale with the supplied `bands`.                  | Current source and tests                |
| FR3 | When dictation is unsupported, the control renders nothing; with `isHiddenWhenUnsupported={false}` it renders a disabled Button.                                                                   | Current source and tests                |
| FR4 | The bars use `--color-accent`, blending toward `--color-error` as `volume` passes the clipping threshold, so a theme retints both ends (`architecture:theme-tokens` INV3).                         | Current source and tests                |
| FR5 | `ref`, DOM, data, and ARIA props, `className`, `style`, and `xstyle` reach the wrapper span, which carries the `chat-dictation-button` target; `size` sizes the Button and the bars together.      | Current source and tests                |
| FR6 | Under reduced motion the bars change scale and color at once, with no transition.                                                                                                                  | `design:reduced-motion`; current source |

### Allowed variation

- **AV1 — Label.** Callers may replace the translated start and stop name.
- **AV2 — Bars.** Bar heights and clipping strength follow the supplied
  `bands` and `volume`.
- **AV3 — Theme colors.** Themes may change the accent and error colors.

### Representative states

| State                     | Required invariant                             | Allowed variation |
| ------------------------- | ---------------------------------------------- | ----------------- |
| Supported, idle           | Enabled microphone Button with the start name. | Label, size.      |
| Listening                 | Stop name; five hidden bars.                   | Bar heights.      |
| Clipping                  | Bars blend from accent toward error.           | Theme colors.     |
| Unsupported, default      | Nothing renders.                               | —                 |
| Unsupported, kept visible | A disabled Button.                             | Label.            |

### Transformation and precedence order

- **ORD1 — Name.** The caller's `label`, then the translated start or stop
  label for the listening state.
- **ORD2 — Support.** Unsupported and hidden renders nothing before any other
  state applies.

### Performance and resources

- No resource rule.

## Accessibility contract

- **AR1 — Name.** The control always has a name that says whether it starts or
  stops dictation, unless the caller overrides it (FR1, FR2).
- **AR2 — Decorative bars.** The bars are hidden from assistive technology
  (FR2).
- **AR3 — Unavailable action.** A visible unsupported control is disabled
  (FR3); Button owns how disabled is conveyed.

## Design relationships

| Anatomy or state | Design requirement                                 | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Button           | Icon-only microphone action.                       | `component:Button`       | Prominent      | FR1, FR3           |
| Volume bars      | Five bars that show live input level and clipping. | Current source           | Supporting     | FR2, FR4, FR6      |

No anatomy-theming map is recorded yet; the block is optional during
migration, so the map is deferred.

## Family and system relationships

- `component:Button` owns activation, focus, disabled semantics, and icon-only
  presentation.
- `architecture:theme-tokens` owns the accent and error roles the bars use.
- `design:reduced-motion` owns the reduced-motion rule FR6 follows.
- The glyph and centered bars are direction-neutral; the RTL audit records
  this as not applicable.

## Verification map

| Contract | Verification                                                                                          | Representative states         | Mutation or failure expectation                                         | Audit section                             |
| -------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| FR1, AR1 | `ChatDictationButton.test.tsx` "labels and toggles the idle button"                                   | Idle                          | A missing name, or activation that does not toggle, fails.              | `audit:ChatDictationButton/behavior`      |
| FR2, AR2 | `ChatDictationButton.test.tsx` "shows five hidden visualizer bars and the stop label while listening" | Listening                     | A wrong bar count, exposed bars, or a start name while listening fails. | `audit:ChatDictationButton/behavior`      |
| FR3, AR3 | `ChatDictationButton.test.tsx` unsupported tests                                                      | Unsupported, hidden and shown | A rendered or enabled unsupported control fails.                        | `audit:ChatDictationButton/accessibility` |
| FR4      | `ChatDictationButton.test.tsx` "uses theme-owned colors for clipping feedback"                        | Clipping                      | A raw color in place of the theme roles fails.                          | `audit:ChatDictationButton/theming`       |
| FR5      | `ChatDictationButton.test.tsx` "forwards the root ref and accepted span props"                        | Ref and span props            | A dropped ref or prop fails.                                            | `audit:ChatDictationButton/api`           |
| RTL N/A  | `apps/storybook/rtl-audit/verified-not-applicable.json`                                               | —                             | —                                                                       | `audit:ChatDictationButton/rtl`           |

Read from source, with no focused test yet:

- FR1: the ghost variant and the microphone icon.
- FR2: no icon while listening, the bars scaling with `bands`, and the
  caller's `label` while listening.
- FR4: the plain accent below the clipping threshold.
- FR5: ARIA props reaching the wrapper, `className`, `style`, and `xstyle` composing on the wrapper, the
  `chat-dictation-button` target, and `sm` sizing.
- FR6: the reduced-motion transition removal.

## Decision log

No component-local decision is recorded.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, speech-recognition
behavior, or Button's rules. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatLayout.spec.md -->


# ChatLayout component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `composer`, `emptyState`, `scrollButton`, `scrollRef`, `density`, plus `BaseProps<HTMLDivElement>` and `ref` on the layout root.                                              |
| Behavior                | The root is a flex column; the message area grows and never shrinks; the dock is sticky when the root scrolls and fixed when `scrollRef` names an outer scroller.                         |
| End-user impact         | A chat transcript scrolls under a composer that stays reachable, auto-follows streaming output, and offers a scroll-to-bottom affordance when the reader has moved away from the bottom.  |
| Builder impact          | None.                                                                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no public change. Two owner questions stay open.                                                                                                                |
| Review checks           | Reject any row that states unshipped behavior, promises a default this component does not apply, or resolves OQ1 or OQ2 without an owner decision.                                        |
| Governing rules         | `architecture:public-component-api/INV1, INV5–INV6, INV8`; `architecture:component-style-authoring/INV1–INV3, INV5`; `architecture:theme-tokens/INV3`; `spec:AST-025/FR12` (not adopted). |

This table is a review projection; the body below is authoritative.

## Intent

ChatLayout is the structural shell for a chat surface. It owns one job: place a
scrolling transcript above a docked composer so that short conversations do not
overflow, long ones scroll, and the composer stays at the bottom edge of
whichever element actually scrolls. Scroll mechanics live in
`useChatStreamScroll` and `useChatNewMessages`; this component wires them to the
DOM it owns and publishes the resulting refs through `ChatLayoutContext`.

Consumer usage, prop syntax, and examples belong in `ChatLayout.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component holds no
  controllable value.
- Migration decision: none.

## Ownership boundary

**Owns**

- The layout root: flex column, relative positioning, `container-type:
inline-size`, and the `chat-layout` theming target with its `density` axis.
- Which element scrolls: the root itself, or the element named by `scrollRef`.
- Dock positioning — `sticky` in self-scroll mode, `fixed` in external-scroll
  mode — and the frosted glass layer painted behind it.
- Density geometry: dock padding, message-column max-width and inline padding,
  and the blur layer's height and mask.
- Empty-state substitution and its centering box.
- The default scroll-to-bottom affordance and the visibility signal it receives.
- Publication of `scrollContainerRef` and `contentRef` through `ChatLayoutContext`.

**Does not own / non-goals**

- Scroll measurement, spring animation, lock behavior, or new-message detection —
  owned by `useChatStreamScroll` and `useChatNewMessages`.
- Turning the browser's scroll anchoring off while following — owned by
  `useChatStreamScroll`, which writes it only through Core's scroll-anchoring
  owner module (`privateAttributes/scrollAnchoring.stylex.ts`), the one owner
  of that rule (`architecture:public-component-api` INV23).
- Message presentation, grouping, or sender semantics — owned by
  `component:ChatMessageList` and `component:ChatMessage`.
- Composer behavior, sizing, or status — owned by `component:ChatComposer`.
- The scroll-to-bottom control's own presentation — owned by
  `component:ChatLayoutScrollButton`.
- Page shell, navigation, and landmark assignment — the caller's.
- The shared effective-axis scroll capability defined by `spec:AST-025`. This
  component predates it and has not adopted it; see OQ1.

## Public concepts

| Concept        | Closed values or states                                  | Meaning                                                                            | Default     | Owner                | Stability | Invalid-value behavior                     |
| -------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------- | -------------------- | --------- | ------------------------------------------ |
| `children`     | any `ReactNode`                                          | Transcript content placed in the message area.                                     | required    | caller               | stable    | n/a — required                             |
| `composer`     | any `ReactNode`                                          | Content placed inside the dock.                                                    | required    | caller               | stable    | n/a — required                             |
| `emptyState`   | `ReactNode`; omitted                                     | Rendered centred in place of `children` when `children` is empty.                  | omitted     | caller               | stable    | omitted renders `children` unchanged       |
| `scrollButton` | `undefined`; `null`; any `ReactNode`                     | `undefined` selects the wired default, `null` renders nothing, a node replaces it. | `undefined` | component/caller     | stable    | any node renders as given                  |
| `scrollRef`    | `RefObject<HTMLElement \| null>`; omitted                | Names the scrolling element; omitted makes the root scroll.                        | omitted     | caller               | stable    | a null `current` leaves scrolling inactive |
| `density`      | `compact`; `balanced`; `spacious`                        | Selects dock padding, message-column width, and blur-layer size.                   | `balanced`  | component            | stable    | closed union; rejected by types            |
| root surface   | `ref`; DOM/data/ARIA props; `className`/`style`/`xstyle` | Extends the layout root.                                                           | omitted     | public component API | stable    | n/a                                        |

`density` is a closed union. It is a documented `visualProps` axis of the
`chat-layout` target, and it is not theme-extensible: no unavailable custom value
has a safe theme-independent baseline, so it stays closed under
`architecture:component-theming-surface/INV14`.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                           | Basis                                               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR1 | The root MUST be a flex column, so an in-flow sticky dock's height is part of the root's height rather than added on top of it.                                                                                                     | Current source and tests                            |
| FR2 | The message area MUST grow into leftover space and MUST NOT shrink below its content height, so short transcripts fill the root exactly and long ones overflow it.                                                                  | Current source and tests                            |
| FR3 | With no `scrollRef`, the root MUST be the scroll container and the dock MUST be `position: sticky`.                                                                                                                                 | Current source and tests                            |
| FR4 | With a `scrollRef`, the root MUST NOT become a scroll container and the dock MUST be `position: fixed`. The message area's end padding MUST hold the dock's height, so the newest message rests above the dock at the scroll's end. | Current source and tests                            |
| FR5 | `emptyState` MUST replace `children` exactly when `children` is `null`, `undefined`, `false`, or an empty array, and MUST NOT replace any other children.                                                                           | Current source and tests                            |
| FR6 | `scrollButton` MUST distinguish three cases: omitted selects the wired default, `null` renders nothing, and a supplied node replaces the default.                                                                                   | Current source and tests                            |
| FR7 | `density` MUST reflect on the root as the `chat-layout` target's `data-density`, and MUST select the dock, message-area, dock-inner, and blur-layer geometry together.                                                              | Current source, tests, and docs                     |
| FR8 | The layout MUST publish its scroll container and message content refs through `ChatLayoutContext` so the message list can register the observed content box.                                                                        | Current source                                      |
| FR9 | Accepted `ref`, DOM/data/ARIA props, `className`, `style`, and `xstyle` MUST reach and compose on the layout root.                                                                                                                  | `architecture:public-component-api/INV5–INV6, INV8` |

### Allowed variation

- **AV1 — Scroll ownership.** The caller chooses between root-owned and
  externally-owned scrolling; the dock's positioning strategy follows that choice.
- **AV2 — Scroll affordance.** The caller may keep the wired default, remove it,
  or substitute any node.
- **AV3 — Transcript content.** Any content is allowed in the message area;
  ChatMessageList is a convention, not a requirement.
- **AV4 — Density geometry.** Resolved spacing and widths follow the active
  theme's spacing scale; only the relationships between the three steps are fixed.

### Representative states

| State                               | Required invariant                                                                                                     | Allowed variation                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Self-scroll, short transcript       | Root fills without overflowing; dock sticky at the block end                                                           | Empty state may occupy the message area       |
| Self-scroll, overflowing transcript | Root scrolls; message area keeps content height                                                                        | Scroll affordance becomes visible             |
| External `scrollRef`                | Root does not scroll; dock is fixed to the viewport's block end; the newest message rests above it at the scroll's end | The named element may be the document element |
| Empty children with `emptyState`    | Centred empty state replaces the transcript                                                                            | Any node may be the empty state               |
| `scrollButton={null}`               | No scroll affordance renders                                                                                           | Auto-scroll behavior is unchanged             |

### Performance and resources

- **PR1 — No layout measurement in the component.** Density is a prop. ChatLayout
  MUST NOT add a `ResizeObserver`, media query, or animation frame of its own for
  presentation the CSS container/flex model already resolves
  (`architecture:component-style-authoring/INV2`). A fixed dock is out of
  flow, so flex layout cannot reserve its height. That height reaches the
  message area through PR2's pooled observer. Its first call carries no size,
  so the mount reads the dock's height once.
- **PR2 — Shared observation only.** Content-size observation reaches the browser
  through the pooled `observeResize` utility used by `useChatNewMessages`, never a
  per-instance observer.

## Accessibility contract

- **AR1 — The wired default scroll affordance MUST NOT be focusable while it is
  visually hidden.** The hidden pill paints nothing, so focus landing on it would
  have no visible indicator (WCAG 2.2 SC 2.4.7, Level AA). `opacity` and
  `pointer-events` do not remove an element from sequential focus navigation.
- **AR2 — The scroll affordance MUST remain keyboard reachable and operable while
  visible**, with its accessible name supplied by the catalog and replaced by the
  new-messages label when new messages have arrived.
- **AR3 — All user-visible and AT-facing strings MUST come from the catalog**:
  `@astryx.chatLayout.newMessages` and
  `@astryx.chatLayoutScrollButton.scrollToBottom`.
- **AR4 — The layout MUST NOT assign a landmark role or accessible name to the
  caller's regions.** Region semantics stay caller-owned.
- The self-scroll root carries no `tabIndex`, role, or accessible name of its
  own; the keyboard path into scrolled content comes from whatever `children`
  supplies. Which layer should own that guarantee is unresolved; see OQ1.

## Design relationships

- The dock paints a `backdrop-filter` blur with a block-start mask so the
  transcript fades out behind the composer rather than ending at a hard edge.
  Blur height and mask distance step with `density`.
- The scroll affordance is a pill whose height tracks `--size-element-md`, the
  same token that sizes the `md` Button it wraps, so the pill's `overflow: hidden`
  cannot clip that Button under a theme that retunes the element scale
  (`architecture:theme-tokens/INV3`).
- Spacing, radius, shadow, duration, and easing all resolve from portable
  semantic tokens. Component-local geometry that has no semantic role — the
  message-column and dock-inner caps, the blur heights, and the empty-state
  minimum height — remains a named component design decision.
- The component declares no portable token and no public custom property.

### Theming reachability

Dispositions for ChatLayout's five anatomy parts. This record carries no
`anatomy-theming:v1` block; the block is optional during migration, and see OQ2.

| Anatomy part            | Disposition                                                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Message area            | `none` — reachability-gap: an internal element with no `themeProps` call. `chat-layout` sits on the scrolling root, so a theme cannot reach the transcript column's own padding or width cap. |
| Frosted glass dock      | `none` — unsettled: the dock, its inner column, and the blur layer paint the signature surface and carry no target; see OQ2.                                                                  |
| Scroll-to-bottom button | `delegatesTo` the `chat-layout-scroll-button` target, whose canonical owner in the current inventory is `component:Chat`.                                                                     |
| Composer                | `delegatesTo` the `chat-composer` target, whose canonical owner in the current inventory is `component:Chat`.                                                                                 |
| Empty state             | `none` — intentional: the empty-state box only centres caller content, which is layout plumbing.                                                                                              |

The `chat-layout` target itself is declared on the Chat family document
(`Chat.doc.mjs`) rather than on `ChatLayout.doc.mjs`.

## Family and system relationships

- There is no `family:chat` record. The Chat components share the `Chat.doc.mjs`
  family document and its theming target inventory, which is not a knowledge-record
  family contract.
- `component:ChatLayoutScrollButton` owns the scroll affordance's presentation,
  label, and focus behavior. ChatLayout owns only when it is visible.
- `component:ChatMessageList` consumes `ChatLayoutContext.contentRef`.
- `spec:AST-025` owns the shared effective-axis scroll capability. ChatLayout
  does not adopt it today: it declares `overflow-y: auto` unconditionally in
  self-scroll mode rather than resolving an effective axis, and it assigns no
  keyboard access to the viewport itself. FR12 accepts an existing focusable
  descendant as the keyboard path; see OQ1 for the open ownership question.

## Verification map

| Contract | Verification                                                                                                                                 | Representative states                                    | Mutation or failure expectation                                                                                                                      | Audit section         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| FR1, FR2 | `ChatLayout.test.tsx` self-scroll layout contract                                                                                            | self-scroll, short and long transcript                   | Restoring `min-height: 100%` on the message area re-adds the dock's height and the root overflows                                                    | `audit:ChatLayout/§4` |
| FR3, FR4 | `ChatLayout.test.tsx` dock positioning and the room for a fixed dock                                                                         | no `scrollRef`; external `scrollRef`; a growing composer | Swapping sticky and fixed detaches the dock from the element that actually scrolls; dropping the room leaves the newest message under the fixed dock | `audit:ChatLayout/§4` |
| FR5      | `ChatLayout.test.tsx` empty-state cases; `useChatNewMessages.test.tsx` conditional list case                                                 | empty array; populated children                          | Treating populated children as empty hides the transcript                                                                                            | `audit:ChatLayout/§4` |
| FR6      | `ChatLayout.test.tsx` scroll-button cases                                                                                                    | custom node                                              | Rendering the default in place of a supplied node fails                                                                                              | `audit:ChatLayout/§4` |
| FR7      | `ChatLayout.test.tsx` density cases; `themingTargets.test.ts`                                                                                | compact; balanced; spacious                              | Dropping the reflected attribute makes the theming axis unselectable                                                                                 | `audit:ChatLayout/§2` |
| FR8      | `ChatLayout.test.tsx` "first-fill scroll positioning" cases; `useChatNewMessages.test.tsx` conditional-list case                             | first fill; streaming growth                             | Losing the published refs stops auto-scroll from observing content growth                                                                            | `audit:ChatLayout/§7` |
| AR1, AR2 | `ChatLayoutScrollButton.test.tsx` and `ChatLayout.test.tsx` tab-order cases; `ChatLayoutScrollButton.a11y.chromium.spec.ts` in real Chromium | hidden at rest; visible; re-hidden after activation      | Reverting to `opacity`-only hiding puts an invisible control back in the tab order                                                                   | `audit:ChatLayout/§1` |

Read from source, with no focused test yet:

- FR3, FR4: whether the root is the scroll container.
- FR5: `null` and `undefined` children selecting the empty state.
- FR6: `null` rendering nothing, an omitted `scrollButton` selecting the wired
  default, and the default not rendering beside a supplied node.
- FR8: the published scroll container.
- FR7: the dock, message-area, dock-inner, and blur geometry for each density.
- FR9: `ref`, DOM props, `className`, `style`, and `xstyle` on the root.
- AR2: the new-messages label replacing the catalog name.
- AR3: the catalog strings; AR4: no landmark or name on caller regions.
- PR1–PR2: no layout measurement of the component's own, and the pooled
  observer.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Which layer owns the keyboard path to scrolled content, and should
  ChatLayout guarantee it?** (`human-api`) In self-scroll mode the root is the
  scroll container and carries no `tabIndex`, role, or accessible name of its
  own. `component:ChatMessageList`, the documented child, carries `role="log"`
  and `tabIndex={0}`, and `spec:AST-025/FR12` accepts such an existing
  focusable descendant instead of a named viewport. `children` is typed
  `ReactNode`, so whether a composition supplying no focusable descendant is
  also covered is unresolved, as is which layer should own the guarantee. This
  record states the arrangement and asserts no defect.
- **OQ2 — Should the frosted dock be themeable?** (`human-api`) The dock, its
  inner column, and the blur layer paint the component's signature surface, and
  no current target reaches them.

## Content boundary

This file does not duplicate `ChatLayout.doc.mjs` prop tables or examples, the
audit's scores and evidence, or the scroll, message, and composer contracts owned
by their own components and hooks.

---

<!-- source: docs/specs/components/Chat/ChatLayoutScrollButton.spec.md -->


# ChatLayoutScrollButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatLayoutScrollButton` with required `isVisible` and `onClick`, optional `label`, and root `div` passthrough, styles, and ref.                                                                                                                   |
| Behavior                | A pill holding one ghost Button. Hidden state paints nothing and leaves the tab order; a non-empty `label` expands the pill and becomes the visible text; omitted or empty renders icon-only.                                                      |
| End-user impact         | Readers who scrolled up get one control back to the newest message, which is hidden and out of the tab order when they are already there; a theme that restyles its target repaints the pill they see.                                             |
| Builder impact          | None.                                                                                                                                                                                                                                              |
| Compatibility/readiness | Records shipped behavior; no public change. Three implementation gaps (FR1a, FR3a, FR6a) are listed under Current-state impact; eight owner questions stay open.                                                                                   |
| Review checks           | Reject a target on the centring row, a hidden pill that keeps keyboard focus, a non-empty label that is not also the accessible name, or a state that paints identically to its opposite. FR1a, FR3a, and FR6a are recorded gaps, not acceptances. |
| Governing rules         | `architecture:component-theming-surface/INV4`; `architecture:component-style-authoring/INV1, INV5`; `architecture:public-component-api/INV5, INV6, INV8`; WCAG 2.2 SC 2.4.7 and SC 2.5.8 (AA).                                                     |

This table is a review projection; the body below is authoritative.

## Intent

ChatLayoutScrollButton is the floating return-to-newest affordance for a chat
transcript. It owns the pill's appearance and its visible/hidden presentation;
it owns no scroll state. ChatLayout composes it with `useChatStreamScroll` and
`useChatNewMessages` by default, and a caller may replace or remove it through
`ChatLayout`'s `scrollButton` slot.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: visibility is a required caller input, and
  the component holds no state
- Migration decision: none; DEC-1 records where the target sits

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **An empty label leaves the control unnamed (FR1a).** `label=''` renders an
  icon-only control with an empty accessible name; WCAG 2.2 SC 4.1.2 requires a
  name (OQ7).
- **The focus ring is clipped away (FR3a).** The pill's `overflow: hidden`
  clips the Button's outset focus ring, so a focused control looks the same as
  a resting one; WCAG 2.2 SC 2.4.7 requires a visible indicator (OQ8).
- **A theme cannot address the pill's states (FR6a).** The pill's visible and
  expanded states change its paint, but the target exposes neither, so a theme
  can restyle the pill only as a whole (OQ1).

## Ownership boundary

**Owns**

- The pill surface: its fill, elevation, radius, resolved height, and the
  collapsed/expanded width ceiling.
- The visible/hidden presentation, including removal from sequential focus
  navigation while hidden.
- The default accessible name when the caller supplies no `label`.
- Centring within its parent, and the gap between the pill and what sits below.

**Does not own / non-goals**

- Scroll position, lock state, and new-message detection — owned by
  `useChatStreamScroll` and `useChatNewMessages`.
- Placement in the chat dock and whether the affordance renders at all — owned
  by `component:ChatLayout` through its `scrollButton` slot.
- Action semantics, focus ring, press feedback, size geometry, and variant
  surface — owned by `component:Button`, which this component composes.

## Public concepts

| Concept             | Closed values or states     | Meaning                                                              | Availability by variant/orientation/state | Default             | Owner                               | Stability | Invalid-value behavior                            |
| ------------------- | --------------------------- | -------------------------------------------------------------------- | ----------------------------------------- | ------------------- | ----------------------------------- | --------- | ------------------------------------------------- |
| `isVisible`         | `true`, `false`             | Whether the affordance is presented and operable                     | always                                    | required            | `component:ChatLayoutScrollButton`  | stable    | required boolean; no fallback                     |
| `label` — omitted   | `undefined`                 | Icon-only; the translated default becomes the accessible name        | always                                    | this is the default | `component:ChatLayoutScrollButton`  | stable    | —                                                 |
| `label` — non-empty | any non-empty string        | Visible text, which is also the accessible name                      | always                                    | —                   | `component:ChatLayoutScrollButton`  | stable    | —                                                 |
| `label` — empty     | `''`                        | Icon-only with an empty accessible name — see FR1a                   | always                                    | —                   | `component:ChatLayoutScrollButton`  | stable    | no fallback is applied; the control is unnamed    |
| `onClick`           | `() => void`                | Activation callback; its type declares no arguments                  | always                                    | required            | `component:ChatLayoutScrollButton`  | stable    | required; no default action                       |
| root `div`          | `BaseProps<HTMLDivElement>` | `ref`, `xstyle`, `className`, `style`, and remaining DOM passthrough | always                                    | none                | `architecture:public-component-api` | stable    | `onClick` is omitted from the inherited DOM props |

Consumer syntax and prop defaults remain in `ChatLayoutScrollButton.doc.mjs`.

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                            | Basis                                                                          |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| FR1  | The control MUST expose a non-empty accessible name in every reachable state.                                                                                                                                        | WCAG 2.2 SC 4.1.2                                                              |
| FR1a | `label` omitted uses the translated default; a non-empty `label` is the name. Implementation gap: `label=''` satisfies neither (Current-state impact).                                                               | Current source                                                                 |
| FR2  | While `isVisible` is false the pill MUST paint nothing and MUST NOT accept focus, programmatic or sequential.                                                                                                        | Current source and tests; WCAG 2.2 SC 2.4.7                                    |
| FR3  | While `isVisible` is true the pill MUST remain keyboard reachable and activate on Enter.                                                                                                                             | Current source and tests; WCAG 2.2 SC 2.1.1                                    |
| FR3a | A focused control MUST paint a visible focus indicator. Implementation gap: the ring is clipped away entirely (Current-state impact).                                                                                | WCAG 2.2 SC 2.4.7; `spec:AST-020/FR1`                                          |
| FR4  | A **non-empty** `label` MUST render as visible text; omitted or empty renders icon-only with no visible text.                                                                                                        | Current source and tests                                                       |
| FR5  | The pill MUST take its resolved height from the element-size token so no theme scale makes it clip the Button it wraps.                                                                                              | Current source and tests                                                       |
| FR6  | The public theming target MUST sit on the pill — the element painting fill, elevation, and radius — not on the row that centres it.                                                                                  | `architecture:component-theming-surface/INV4`                                  |
| FR6a | The target reflects neither the visible nor the expanded state that drives its paint. Implementation gap: a theme cannot address either state; whether the target should reflect them is OQ1 (Current-state impact). | Current source                                                                 |
| FR7  | The transition between states MUST collapse to `0s` under `prefers-reduced-motion: reduce`.                                                                                                                          | Current source                                                                 |
| FR8  | The collapsed control MUST be at least 24 by 24 CSS pixels.                                                                                                                                                          | WCAG 2.2 SC 2.5.8 (AA)                                                         |
| FR9  | Consumer `ref`, styles, and remaining DOM props MUST reach the component's outer element.                                                                                                                            | Current source and tests; `architecture:public-component-api/INV5, INV6, INV8` |

**FR1a — the empty-label naming gap.** `label=''` is permitted by the public
type and is what ordinary caller code produces from an empty or not-yet-loaded
string. It reaches the Button as `label=''`, `aria-label=''`, and
`isIconOnly={true}`, because `??` passes an empty string through. Button sets
its own `aria-label` only when `label !== ''`, so the caller's empty
`aria-label` survives; icon-only renders no visible text; and the chevron Icon
carries no `label`, so it is `aria-hidden="true"`. The result is a focusable,
operable control with no accessible name.

This record states the obligation and records the current behavior as violating
it. Closing the gap means choosing between falling back to the default name,
rejecting the value, or treating an empty label as a caller error — a public
API and compatibility decision that belongs to the owner. See OQ7.

**FR3a — the clipped focus ring.** The composed Button draws its focus ring as
an `outline` at a positive `outline-offset`, outside its border box. The button
fills the pill, and the pill clips with `overflow: hidden` to keep the
collapse/expand animation inside its rounded shape, so none of the ring is
painted.

Keyboard access itself is intact — the control takes focus and activates — so
this is a visibility defect, not a reachability one. The remedy is a production
change to how the pill clips or where the ring is drawn, and the choice between
those changes rendered geometry, so it needs a visual review. Recorded as OQ8.

**FR6a — the unreflected state axes.** `isVisible` selects visible/hidden
styles and `label` selects collapsed/expanded styles, both on the painting
target, and `themeProps('chat-layout-scroll-button')` is called with no state
argument. A theme can therefore restyle the pill but cannot address either
state. Naming those axes is new public theming surface, so the shape belongs to
the owner. See OQ1.

### Allowed variation

- **AV1 — Expanded width.** The labelled pill's width ceiling is a component
  design decision, not a theme value. What happens to a label past that ceiling
  is not settled here; see OQ3.
- **AV2 — Resolved geometry.** Height, radius, spacing, and duration resolve
  from theme tokens, so absolute values differ by theme without becoming
  regressions.
- **AV3 — Composition.** ChatLayout renders this by default, but a caller may
  substitute any node or remove the affordance entirely.

### Representative states

| State                     | Required invariant                                                                                           | Allowed variation                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| hidden                    | paints nothing, refuses focus, keeps its layout box (FR2)                                                    | transition duration               |
| visible, label omitted    | named from the default, focusable, at least 24 by 24 CSS pixels, no visible text (FR1, FR3, FR4, FR8)        | resolved pill size                |
| visible, non-empty label  | the label is both the visible text and the accessible name (FR1, FR4)                                        | expanded width up to the ceiling  |
| visible, empty label      | **fails FR1** — icon-only with an empty accessible name (FR1a)                                               | none; this is a recorded defect   |
| visible, hovered          | the pointer paints a state distinct from rest                                                                | the overlay the theme resolves    |
| visible, keyboard-focused | **fails FR3a** — focus is held and `:focus-visible` matches, but the ring is clipped away and paints nothing | none; this is a recorded defect   |
| visible, pressed          | the press paints a state distinct from hover and rest                                                        | the pressed treatment             |
| any visible state, themed | the documented target repaints the pill (FR6); its state axes are unreachable (FR6a)                         | which properties a theme declares |

### Performance and resources

- **PR1 — No state, no effects, no observers.** The component derives every
  rendered difference from its props during render and registers no listener,
  timer, observer, or animation frame.

## Accessibility contract

- **AR1 — Named.** The control MUST expose a non-empty accessible name in every
  reachable state (WCAG 2.2 SC 4.1.2) (FR1). Omitted and non-empty `label`
  satisfy this; `label=''` does not, and that gap is recorded as FR1a rather
  than resolved here.
- **AR2 — Focus follows paint.** A control that paints nothing MUST NOT be
  focusable, because focus landing on it would have no visible indicator
  (WCAG 2.2 SC 2.4.7). `opacity` and `pointer-events` do not achieve this;
  `visibility` does (FR2).
- **AR3a — Focus is visible.** A focused control MUST paint a focus indicator
  (WCAG 2.2 SC 2.4.7). The ring is declared but clipped away; recorded as FR3a
  rather than resolved here.
- **AR3 — Target size.** The collapsed control MUST be at least 24 by 24 CSS
  pixels (WCAG 2.2 SC 2.5.8 AA) (FR8).
- **AR4 — Reduced motion.** The state transition MUST collapse to `0s` under
  `prefers-reduced-motion: reduce` (FR7).
- **AR5 — Translated strings.** The default accessible name MUST resolve through
  the translator catalog, never a literal.

## Design relationships

| Anatomy or state | Design requirement                          | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------- | ------------------------ | -------------- | ------------------ |
| pill surface     | floating affordance over the transcript     | unsettled                | supporting     | FR5, FR6           |
| hidden state     | absent rather than dimmed                   | unsettled                | supporting     | FR2, AR2           |
| labelled state   | text accompanies the glyph on the same pill | unsettled                | supporting     | FR4                |

The component implements design requirements without copying their rationale.
An `unsettled` representation remains a human decision; principles do not let an
agent invent the answer. No `authority: current` design record covers a floating
scroll affordance today, so these rows record the gap rather than a requirement.

## Family and system relationships

- `family:buttons` owns the action surface this component composes through
  `component:Button`. This component is not a member: its public purpose is a
  transcript affordance that contains a button, and the family's membership rule
  excludes components that merely use a Button as an action slot. See OQ4.
- `architecture:component-theming-surface` owns the target/anatomy relationship
  this component's theming must satisfy; FR6 adopts INV4 directly.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract       | Verification                                                                                                                                                                                                                                                                                        | Representative states                  | Mutation or failure expectation                                                                            | Audit section                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| FR1, FR4       | `ChatLayoutScrollButton.test.tsx` role/name and visible-text cases                                                                                                                                                                                                                                  | label omitted; non-empty label         | dropping `isIconOnly` renders the translated name as clipped visible text, and the name case still passes  | `audit:ChatLayoutScrollButton/a11y`       |
| FR1a           | No focused test; read from source across three files (`??` passing `''` through, Button's `label !== ''` guard, the Icon's decorative default).                                                                                                                                                     | label empty                            | a fallback added here would make the derivation stale without any test failing                             | `audit:ChatLayoutScrollButton/a11y`       |
| FR2, FR3       | `ChatLayoutScrollButton.test.tsx` tab cases; `ChatLayoutScrollButton.a11y.chromium.spec.ts`                                                                                                                                                                                                         | hidden at rest; scrolled up; re-hidden | replacing `visibility` with `opacity` alone leaves the invisible control in the tab order                  | `audit:ChatLayoutScrollButton/a11y`       |
| FR3a           | `ChatLayoutScrollButtonSurface.a11y.chromium.spec.ts` interaction pass: the focused frame's bytes are compared with a rest frame captured from the same page, and the ring's outward reach is measured against the clipping ancestor's room (recorded as `ringChangedPixels`, `outreach`, `roomPx`) | collapsed and labelled, light and dark | the result is recorded and annotated, never asserted, so repairing the clip cannot turn this check red     | `audit:ChatLayoutScrollButton/a11y`       |
| FR5            | `ChatLayoutScrollButton.a11y.chromium.spec.ts` two-theme geometry pair                                                                                                                                                                                                                              | neutral and butter                     | a literal height lets a larger element scale clip the Button the pill wraps                                | `audit:ChatLayoutScrollButton/theming`    |
| FR6            | `ChatLayoutScrollButtonSurface.a11y.chromium.spec.ts` placement and probe-theme reach tests                                                                                                                                                                                                         | visible, collapsed, neutral and probe  | moving the target back to the centring row leaves the pill unchanged under the probe theme                 | `audit:ChatLayoutScrollButton/theming`    |
| FR6a           | source: `themeProps()` is called with no state argument, and `Chat.doc.mjs` declares the target with no `visualProps`/`states`                                                                                                                                                                      | visible/hidden; collapsed/expanded     | adding either axis is new public theming surface, so no test may assert its shape before the owner decides | `audit:ChatLayoutScrollButton/theming`    |
| hover, pressed | `ChatLayoutScrollButtonSurface.a11y.chromium.spec.ts` interaction pass — each frame asserts the pseudo-class matched and that the captured bytes differ from a rest frame of the same page                                                                                                          | collapsed and labelled, light and dark | a frame captured after release, or with the pointer elsewhere, fails its own engagement assertion          | `audit:ChatLayoutScrollButton/design`     |
| FR8            | `ChatLayoutScrollButtonSurface.a11y.chromium.spec.ts` measured target box                                                                                                                                                                                                                           | visible, collapsed                     | a smaller resolved size drops the control below the AA minimum                                             | `audit:ChatLayoutScrollButton/a11y`       |
| FR9            | `ChatLayoutScrollButton.test.tsx` passthrough case                                                                                                                                                                                                                                                  | any                                    | dropping `...rest` silently discards `data-*`, `id`, and ARIA the caller set                               | `audit:ChatLayoutScrollButton/public-api` |

Read from source, with no focused test yet:

- FR1a: `label=''` producing an empty accessible name.
- FR6a: the target reflecting no state.
- FR7: the transition collapsing to `0s` under reduced motion.

## Decision log

### DEC-1 — The public theming target rides the pill, not the row that centres it

**Reference:** `component:ChatLayoutScrollButton/DEC-1`
**Decider:** `cixzhang`, `2026-09-23`

The component renders two elements: a full-width row that centres the pill and
holds the gap below it, and the pill, which paints the fill, elevation, and
radius. The public target sits on the pill, the element a theme restyles, as
`architecture:component-theming-surface/INV4` requires. Consumer `ref`, styles,
and DOM props stay on the outer row (FR9).

Rejected: a second target for the pill — new theming surface for one painted part.

Rejected: moving consumer passthrough to the pill — it changes where a caller's `id` and ref resolve.

## Open questions

- **OQ1 — Should the target reflect its style-driving states?** (`human-api`)
  The pill selects between visible/hidden and collapsed/expanded style objects,
  and `themeProps` reflects neither, so a theme cannot address either state.
  Exposing them means adding `visualProps`/`states` to a public target, which is
  new theming surface rather than a repair.
- **OQ2 — Is `isVisible` the right name on a non-layer component?** (`human-api`)
  The shared convention reserves `isOpen`/`isVisible` for layer components. The
  prop is released in `@astryxdesign/core@0.6.3`, so any change is breaking and
  needs a compatibility decision.
- **OQ3 — What should happen to a label past the expanded ceiling?** (`human-design`)
  The pill clips at its width ceiling with no ellipsis and no wrap. The
  accessible name survives, so only sighted readers lose text, and locale
  expansion is the realistic trigger. No `authority: current` design record
  covers truncation for this surface.
- **OQ4 — Does this component belong to `family:buttons`?** (`human-api`)
  Its public purpose is a transcript affordance, and it is absent from the
  family's member list, but it is a single composed Button with no other
  content. The family contract's exclusion for "components that merely use a
  Button as a trigger or action slot" is the reading applied above.
- **OQ5 — Is animating the pill's `max-width` acceptable?** (`human-design`)
  Expanding and collapsing animates a layout property. Reduced motion is
  honored and the subtree is one button, but the record that would govern
  animated properties, `design:motion`, is `authority: draft`.
- **OQ6 — The consumer doc has no anatomy inventory.** (`human-api`)
  `architecture:component-theming-surface` records this as open migration work
  across Core, so no `### Theming anatomy` block is written here: there are no
  published anatomy names for it to map.

- **OQ8 — How should the focus ring escape the pill's clip?** (`human-design`)
  The pill needs `overflow: hidden` for its collapse/expand animation, and the
  Button's ring is drawn outside its border box, so the two are in direct
  conflict. Candidate answers — inset the button so the ring fits, draw the
  ring on the pill, or clip on a different element — each change rendered
  geometry and belong to a visual review.
- **OQ7 — What should `label=''` do?** (`human-api`)
  It produces an unnamed control (FR1a). The candidate answers — fall
  back to the translated default, reject the value in the type, or treat it as
  a caller error — are a public API and compatibility decision on a released
  prop, so this record states the gap without choosing one.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatMessage.spec.md -->


# ChatMessage component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `sender`, `children`, `avatar`, `name`, `metadata`, `density`, plus `BaseProps<HTMLElement>` and `ref` on the message article.                                                  |
| Behavior                | Sender controls logical alignment and system-message suppression; density resolves explicit prop → message-list context → `balanced`; descendants receive the resolved context. |
| End-user impact         | People reading a conversation can distinguish user, assistant, and system messages while names and translated fallback labels preserve each article's sender identity.          |
| Builder impact          | None.                                                                                                                                                                           |
| Compatibility/readiness | Records shipped behavior; no public change. No implementation gap; one owner question stays open.                                                                               |
| Review checks           | Reject a change that alters sender or density meaning, treats caller content as component-owned, or turns the unresolved theming question into new API.                         |
| Governing rules         | `architecture:public-component-api/INV1, INV3, INV5–INV6, INV8–INV9`; `architecture:component-theming-surface/INV3–INV6`; `spec:AST-029/FR3–FR6`.                               |

This table is a review projection; the body below is authoritative.

## Intent

ChatMessage is the sender-aware article wrapper for one message in a
conversation. It owns logical alignment, optional sender identity slots, the
resolved density context supplied to message descendants, and the article's
accessible name. Message content and its own interactions remain caller-owned.

Consumer syntax and examples belong in `ChatMessage.doc.mjs` and the Chat family
document.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component owns no
  controllable value.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One semantic `<article>` root and its public ref, DOM, data, ARIA, class, and
  style passthrough.
- Logical start, end, or centered alignment selected by `sender`.
- Optional avatar, name, and metadata placement for non-system messages,
  including collapsing a slot whose content renders nothing (DEC-1).
- Density resolution and the `ChatMessageContext` value supplied to descendants.
- The `chat-message` target with its `sender` and resolved `density` axes.
- The article's visible-name or translated fallback accessible label.

**Does not own / non-goals**

- Bubble presentation, grouping, width, name, or metadata — owned by
  `component:ChatMessageBubble` when a bubble supplies them.
- Avatar appearance — owned by the caller's supplied node, commonly
  `component:Avatar`.
- Metadata content, timestamp formatting, status, or footer actions — owned by
  the supplied node and its components.
- Message-list ordering, spacing between messages, streaming announcements, or
  scroll behavior — owned by `component:ChatMessageList` and
  `component:ChatLayout`.
- Interactions inside `children`; descendants retain their own semantic and
  accessibility contracts.

## Public concepts

| Concept      | Closed values or states                                   | Meaning                                                                                 | Availability by variant/orientation/state | Default   | Owner                  | Stability | Invalid-value behavior          |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------- | --------- | ---------------------- | --------- | ------------------------------- |
| `sender`     | `assistant`; `user`; `system`                             | Selects logical alignment, article identity, and whether auxiliary identity slots show. | required in every message                 | required  | component              | stable    | closed union; rejected by types |
| `children`   | any `ReactNode`                                           | Message body passed through inside the aligned content column.                          | every sender                              | required  | caller                 | stable    | n/a — required                  |
| `avatar`     | renders content; renders nothing; skipped scalar; omitted | Optional identity node beside a non-system message.                                     | assistant and user; suppressed for system | omitted   | caller                 | stable    | renders nothing: slot collapses |
| `name`       | renders text; renders nothing; skipped scalar; omitted    | Optional visible sender name and article label source.                                  | assistant and user; suppressed for system | omitted   | caller/component       | stable    | renders no text: fallback label |
| `metadata`   | renders content; renders nothing; skipped scalar; omitted | Optional content below the message body.                                                | assistant and user; suppressed for system | omitted   | caller                 | stable    | renders nothing: slot collapses |
| `density`    | `compact`; `balanced`; `spacious`; omitted                | Selects gaps and becomes descendant message context.                                    | every sender                              | inherited | component/list context | stable    | closed union; rejected by types |
| root surface | `ref`; DOM/data/ARIA props; `className`/`style`/`xstyle`  | Extends the message article.                                                            | every sender                              | omitted   | public component API   | stable    | n/a                             |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                   | Basis                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| FR1 | `assistant` MUST align to inline start, `user` to inline end, and `system` to the centre; the root MUST reflect the sender on the `chat-message` target.                                                                                                                                                    | shipped implementation; consumer docs; focused tests                   |
| FR2 | `system` MUST suppress the supplied avatar, name, and metadata while continuing to render `children`.                                                                                                                                                                                                       | shipped implementation; Chat family anatomy; focused tests             |
| FR3 | A non-system message MUST render supplied avatar, name, children, and metadata in that visual order. `null`, boolean, and empty-string auxiliary values MUST NOT create wrappers; a wrapper whose content renders nothing MUST collapse (DEC-1).                                                            | owner direction; focused tests                                         |
| FR4 | Density MUST resolve explicit `density` → nearest `ChatMessageList` density → `balanced`, and the resolved value MUST reflect on the root target.                                                                                                                                                           | shipped implementation; consumer docs; focused tests; theming metadata |
| FR5 | Descendants MUST receive the resolved `{sender, density}` value through `ChatMessageContext`.                                                                                                                                                                                                               | shipped implementation; descendant composition                         |
| FR6 | The article MUST carry the translated sender fallback as `aria-label`, and a non-system `name` that is not a skipped scalar MUST also label it through `aria-labelledby`. A name that renders text names the article; one that renders none leaves the fallback (accessible name computation 1.2, step 2B). | owner direction; accessible name computation 1.2; focused tests        |
| FR7 | Accepted `ref`, DOM/data/ARIA props, `className`, `style`, and `xstyle` MUST reach and compose on the same article that carries the `chat-message` target, except `aria-label` and `aria-labelledby`, which the component owns for naming (FR6, AR1).                                                       | `architecture:public-component-api/INV5–INV6, INV8`; focused tests     |

### Allowed variation

- **AV1 — Message content.** `children` may be bubbles, rich content, tool output,
  media, or any other caller-owned React node.
- **AV2 — Identity content.** Avatar, name, and metadata are caller-owned nodes
  passed to React unchanged; the wrapper controls placement, system suppression,
  and collapse of a slot whose content renders nothing.
- **AV3 — Density geometry.** Resolved gaps follow the active theme's spacing
  scale; the compact → balanced → spacious ordering is fixed.

### Representative states

| State                                       | Required invariant                                                | Allowed variation                                   |
| ------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Assistant with avatar, name, and metadata   | Inline-start layout; visible name labels the article              | Any caller-owned node may fill the slots            |
| Skipped scalar auxiliary values             | No slot or naming reference is created                            | `null`, booleans, empty strings                     |
| Auxiliary content that renders nothing      | The slot collapses; a name of this kind leaves the fallback label | Empty array or Fragment, component returning `null` |
| Numeric auxiliary values                    | `0` remains visible and a numeric name labels the article         | Any non-system sender                               |
| User without a name                         | Inline-end layout; translated sender fallback labels the article  | Avatar and metadata may be present or omitted       |
| System with auxiliary props supplied        | Centre layout; avatar, name, and metadata remain suppressed       | Any children continue to render                     |
| Standalone message                          | Resolved density is `balanced`                                    | Any sender and content                              |
| Message inside a density-providing list     | Inherits the list density                                         | Any sender and content                              |
| Message with explicit density inside a list | Explicit density wins                                             | Any supported density                               |
| Narrow container with long content          | Root stays within the container and content remains available     | Descendant content chooses its own wrap policy      |
| RTL container                               | Logical user/assistant alignment mirrors with document direction  | System remains centred                              |

### Transformation and precedence order

- **ORD1 — Density.** Resolve the explicit message prop first, then the nearest
  message-list context, then `balanced`; use that single result for layout,
  target reflection, and descendant context.
- **ORD2 — Accessible name.** A system `name` or a skipped scalar creates no
  name wrapper. Otherwise the article references the name wrapper's generated
  id; the rendered text there names the article, and empty text yields to the
  translated fallback carried as `aria-label`. A caller `aria-label` or
  `aria-labelledby` does not override this naming.

### Performance and resources

- **PR1 — No external resources.** ChatMessage installs no listener, timer,
  observer, request, or Effect.
- **PR2 — Stable broadcast.** The descendant context value changes only when the
  resolved sender or density changes.

## Accessibility contract

- **AR1 — Article naming mechanism.** Every article carries the translated
  sender fallback as `aria-label`. A name wrapper, when present, is referenced
  through `aria-labelledby`; its rendered text names the article, and when it
  renders no text the accessible name falls back to `aria-label`.
- **AR2 — No inspection.** Slot content is never inspected, cloned, or
  executed to decide whether it renders; collapse and the naming fallback follow
  the rendered DOM.
- **AR3 — Descendant ownership.** ChatMessage is non-interactive and introduces no
  keyboard model. Interactive descendants remain responsible for their own roles,
  names, states, focus, and activation.

## Design relationships

| Anatomy or state | Design requirement                                                                                                               | Representation authority | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| Assistant        | Align the message column to logical start                                                                                        | Current source           | content        | FR1                |
| User             | Align the message column to logical end                                                                                          | Current source           | content        | FR1                |
| System           | Centre the content column and suppress identity slots                                                                            | Current source           | supporting     | FR1–FR2            |
| Name             | `none` — unsettled: the built-in name paints explicit supporting type and secondary colour on an untargeted descendant; see OQ1. | Current source           | supporting     | FR3                |
| Density          | Increase root and child gaps across the three-step axis                                                                          | Current source           | structure      | FR4                |

No component-local design decision is recorded.

### Theming reachability

| Anatomy part | Disposition                                                                                                                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Message root | `target` — the `chat-message` target sits on the article and reflects `sender` and resolved `density`; the Chat family document owns its consumer metadata. |
| Avatar       | `delegatesTo` the supplied node, commonly the `avatar` target owned by `component:Avatar`.                                                                  |
| Name         | `none` — reachability-gap: the built-in name paints explicit supporting type and secondary colour on an untargeted descendant; see OQ1.                     |
| Content      | `delegatesTo` caller-owned children and their targets; custom content has no component-owned target.                                                        |
| Metadata     | `none` — intentional current boundary: the caller supplies the complete rendered node, while the wrapper contributes placement only.                        |

## Family and system relationships

- There is no current `family:chat` record. `Chat.doc.mjs` is the consumer-facing
  family document and owns the shared target inventory; it is not product authority.
- `component:ChatMessageList` supplies optional density context and owns list
  spacing, log semantics, streaming state, and message ordering.
- `component:ChatMessageBubble` consumes sender and density context when present
  and owns bubble presentation.
- There is no current direct owner for ChatMessage's
  `compact | balanced | spacious` density vocabulary or ordering. FR4–FR5 record
  the shipped axis and precedence; routed global layout claims do not settle
  that component-specific vocabulary.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract     | Verification                                                                   | Representative states                                                                      | Mutation or failure expectation                                                    | Audit section          |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------- |
| FR1–FR3      | `ChatMessage.test.tsx`; `ChatMessage.stories.tsx`                              | all senders; skipped scalar, renders-nothing, numeric, content, and suppressed slot states | Removing the scalar skip or the CSS collapse leaves an empty slot or a gap         | `audit:ChatMessage/§4` |
| FR4–FR5      | `ChatMessage.test.tsx`; `ChatMessageBubble.test.tsx`; `themingTargets.test.ts` | standalone; inherited density; explicit override                                           | Changing precedence or reflection gives descendants and themes a different density | `audit:ChatMessage/§2` |
| FR6, AR1–AR2 | `ChatMessage.test.tsx`                                                         | visible, omitted, skipped-scalar, renders-nothing, and system names                        | Dropping the fallback `aria-label` or the name reference leaves an article unnamed | `audit:ChatMessage/§1` |
| FR7          | `ChatMessage.test.tsx`; public export and theming-target checks                | ref; data prop; class; style                                                               | Moving passthrough or ref off the target article breaks the public root contract   | `audit:ChatMessage/§3` |
| RTL          | `ChatMessage.stories.tsx`                                                      | all senders; narrow long content                                                           | Physical direction keeps user or assistant on the same side in both directions     | `audit:ChatMessage/§9` |

Read from source, with no focused test yet:

- FR1: start, end, and centre alignment by sender.
- FR2: a system message still rendering its children.
- FR3: the visual slot order.
- FR7: a caller `aria-label` or `aria-labelledby` not overriding the naming,
  and `xstyle` composing on the article.
- ORD1: root and children gaps following the resolved density.
- FR6: a name that renders no text leaving the fallback name.
- PR1–PR2: no listener or Effect, and a context value that changes only with
  sender or density.
- AR3: no keyboard model of the component's own.

## Decision log

- **DEC-1 — Slot emptiness follows the rendered DOM.** (`cixzhang`,
  2026-10-31) ChatMessage skips only `null`, boolean, and empty-string
  slot values. Any other content is passed to React unchanged; its wrapper
  collapses with `:empty` when it renders nothing, and the article's naming
  falls back to `aria-label` when the referenced name renders no text.
  Rejected: inspecting arrays, Fragments, or iterables, which cannot see
  component output and consumes one-shot iterators.

## Open questions

- **OQ1 — Should the built-in name become a separately themeable anatomy part?**
  (`human-api`) The released family inventory exposes only the aggregate
  `chat-message` target, while the name's explicit type and colour prevent a root
  override from reaching it by inheritance. Adding or splitting a target changes
  public theming API, so this record states the reachability gap without choosing
  a remedy.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit
scores, screenshot matrices, or shared-system rules. The audit PR owns the closed
run evidence required by `spec:AST-029/FR5`.

---

<!-- source: docs/specs/components/Chat/ChatMessageBubble.spec.md -->


# ChatMessageBubble component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Required `children`; optional `variant`, `name`, `metadata`, `group`, and `width`; root `div` passthrough, styles, and ref.                                                                                                                                |
| Behavior                | The bubble derives sender and density from Chat message context, paints filled or ghost content, groups logical sender-side corners, and keeps renderable scalar name/metadata content inside aligned wrappers.                                            |
| End-user impact         | Conversation content reads as sender-aware bubbles; numeric zero stays aligned with its bubble, and slot values that paint nothing leave no empty gap.                                                                                                     |
| Builder impact          | None.                                                                                                                                                                                                                                                      |
| Compatibility/readiness | Records shipped behavior; no public change. No implementation gap; three owner questions stay open.                                                                                                                                                        |
| Review checks           | Reject a dropped root passthrough/ref, missing target metadata, physical grouped-corner logic, an explicit width that retains the default cap, scalar `0` outside its wrapper, empty scalar wrappers, or a claim that settles the open composite boundary. |
| Governing rules         | `architecture:public-component-api/INV1, INV5, INV6, INV8–INV9`; `architecture:component-theming-surface/INV4, INV6–INV8`; `architecture:component-test-sufficiency/INV1–INV7, INV10–INV11`; WCAG 2.2 SC 1.4.10.                                           |

This table is a review projection; the body below is authoritative.

## Intent

ChatMessageBubble is the optional sender-aware painted content surface inside a
ChatMessage. It gives conversation content a bubble boundary, text inset,
grouped-corner treatment, and aligned name/metadata placement that raw message
content does not have.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component owns no state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The bubble root's fill, text color, typography, radius, padding, wrapping, and
  width cap.
- Mapping message sender and density context to bubble paint and geometry.
- Grouped corner geometry on the sender side, using logical corners.
- The aligned wrappers around optional `name` and `metadata` content.
- Root DOM passthrough, consumer style composition, and the root ref.

**Does not own / non-goals**

- Message semantics, sender layout, avatar placement, or message-level names and
  metadata — owned by ChatMessage or the shared Chat composition surface.
- Timestamp, delivery status, and footer semantics — owned by
  ChatMessageMetadata.
- The meaning, accessibility, lifetime, or eventual rendered output of
  caller-supplied React nodes.
- List scrolling, transcript semantics, composer behavior, or system notices —
  owned by their Chat components.

## Public concepts

| Concept                      | Closed values or states                                                                                           | Meaning                                                                                  | Availability by variant/orientation/state | Default                | Owner                                    | Stability     | Invalid-value behavior                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- | ---------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| `children`                   | any `ReactNode`                                                                                                   | Content rendered inside the bubble root                                                  | always                                    | required               | caller                                   | stable        | n/a — required                                                                   |
| `variant`                    | `filled`, `ghost`                                                                                                 | Selects a filled sender-aware boundary or transparent aligned content                    | always                                    | `filled`               | component                                | stable        | closed union; rejected by types                                                  |
| `name`                       | omitted; any `ReactNode`                                                                                          | Optional content above the bubble in an aligned wrapper                                  | always                                    | omitted                | caller/component wrapper                 | stable        | non-rendering scalars omit; visible scalars including `0` align; see FR7 and OQ1 |
| `metadata`                   | omitted; any `ReactNode`                                                                                          | Optional content below the bubble in an aligned wrapper                                  | always                                    | omitted                | caller/component wrapper                 | stable        | non-rendering scalars omit; visible scalars including `0` align; see FR7 and OQ1 |
| `group`                      | omitted, `first`, `middle`, `last`                                                                                | Tightens sender-side corners for consecutive bubbles                                     | filled, ghost                             | omitted                | component                                | stable        | omitted keeps full radius; other values rejected by types                        |
| `width`                      | omitted; any `SizeValue`                                                                                          | Replaces the default width cap with an explicit width                                    | filled, ghost                             | omitted                | caller                                   | stable        | numbers become CSS pixels; strings pass through                                  |
| message context              | sender `user`, `assistant`, `system`; density `compact`, `balanced`, `spacious`; absent                           | Selects reflected sender/density and corresponding paint and geometry                    | when nested or standalone                 | assistant and balanced | Chat context / this projection           | observational | absent context uses component fallbacks                                          |
| root `div`                   | `BaseProps<HTMLDivElement>` and `ref`                                                                             | Extends and references the element carrying children, paint, target, and bubble geometry | always                                    | none                   | `architecture:public-component-api`      | stable        | component target data and consumer styling compose                               |
| `chat-message-bubble` target | sender, variant, and density reflected as `data-*`; exact guaranteed-property set not separately declared in docs | Public selector for the painting bubble root                                             | always                                    | one target per bubble  | `architecture:component-theming-surface` | stable        | undeclared generic properties remain best effort                                 |

Consumer syntax and prop defaults remain in `ChatMessageBubble.doc.mjs`.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                   | Basis                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| FR1 | The component MUST always render one root `div` for `children`, including when the caller supplies non-rendering child content.                                                                                                             | Current source and tests                                                   |
| FR2 | The root MUST reflect the resolved sender. `user` selects user paint; `assistant`, `system`, and absent context use the non-user paint path; absent context reflects `assistant`.                                                           | Current source and tests                                                   |
| FR3 | The root MUST reflect the resolved density. `compact` uses the compact radius and inset; `balanced` is the fallback; `spacious` uses its wider block and inline inset.                                                                      | Current source and tests                                                   |
| FR4 | `filled` MUST paint sender-aware bubble styles; `ghost` MUST remove the fill and block-axis padding while preserving inline alignment.                                                                                                      | Current source and tests                                                   |
| FR5 | `first`, `middle`, and `last` MUST tighten the logical sender-side end, both, and start corner respectively. User uses inline-end; every non-user sender uses inline-start.                                                                 | Current source and tests                                                   |
| FR6 | Omitted `width` MUST keep `max(80%, 280px)`. An explicit number or string MUST set width and replace the default cap with `none`.                                                                                                           | Current source and tests                                                   |
| FR7 | `name` and `metadata` MUST omit their aligned wrappers for null, undefined, booleans, and the empty string. Visible scalar values, including numeric zero, MUST remain inside their aligned wrappers. Non-scalar React nodes remain opaque. | Current source and tests                                                   |
| FR8 | Root `ref`, neutral DOM/data/ARIA props, class, style, and `xstyle` MUST reach or combine on the painting root without losing the component target or owned styles.                                                                         | `architecture:public-component-api/INV5, INV6, INV8`                       |
| FR9 | Exactly one `chat-message-bubble` target MUST ride the painting root and reflect sender, variant, and density.                                                                                                                              | `architecture:component-theming-surface/INV4, INV6–INV8`; public Chat docs |

The public type also admits arrays, Fragments, elements, one-shot iterables,
lazy content, and promises. FR7 does not traverse, clone,
consume, await, or materialize those values: each remains caller-owned opaque
content. Whether any composite or asynchronous category should be normalized is
OQ1.

### Allowed variation

- **AV1 — Theme tokens.** Resolved colors, radii, spacing, and typography may vary
  by theme while the semantic token roles remain.
- **AV2 — Caller content.** Child, name, and metadata node structure and semantics
  remain caller-owned.
- **AV3 — Absolute geometry.** Token-resolved padding and radius may vary; logical
  sender-side grouping and width precedence do not.

### Representative states

| State                     | Required invariant                                                   | Allowed variation                  |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| standalone                | assistant sender and balanced density fallback; one painting target  | caller content                     |
| assistant/system, filled  | non-user paint; inline-start grouped corners                         | token-resolved paint               |
| user, filled              | user paint; inline-end grouped corners                               | token-resolved paint               |
| any sender, ghost         | transparent surface; inline inset retained; block inset removed      | themed text and padding            |
| compact/balanced/spacious | reflected density and corresponding padding/radius path              | resolved token scale               |
| group first/middle/last   | logical sender-side corner sequence in LTR and RTL                   | token-resolved radii               |
| numeric slot `0`          | visible zero remains inside the aligned wrapper                      | none                               |
| non-rendering scalar slot | null, undefined, booleans, and empty string emit no aligned wrapper  | none                               |
| opaque name/metadata      | non-scalar inputs emit wrappers without traversal or materialization | eventual caller-owned React output |
| width omitted/explicit    | default cap retained / explicit width replaces cap                   | valid CSS length                   |
| narrow/long text          | text wraps with no horizontal overflow at 320 CSS px                 | line breaks and resulting height   |

### Transformation and precedence order

- **ORD1 — Context to paint.** Resolve sender/density from the nearest message
  context or local fallback, select paint and geometry, then merge component
  theme props, StyleX output, and consumer styling inputs through the shared
  `mergeProps` contract.
- **ORD2 — Width.** Apply the default maximum width when omitted; when explicit,
  set width and replace that cap before consumer styling composition.
- **ORD3 — Grouping.** Resolve sender side first, then group position, then use
  logical corner properties so CSS direction mirrors the physical edge.

### Performance and resources

- **PR1 — Pure render derivation.** The component owns no state, Effect, event
  listener, observer, timer, or animation frame. Every output derives from props
  and context during render.
- **PR2 — Caller content is not inspected.** The component does not
  traverse, clone, consume, await, or materialize caller-supplied React nodes.
  Whether to preserve that boundary or normalize selected inputs is OQ1.

## Accessibility contract

- **AR1 — Display surface.** ChatMessageBubble adds no widget role, tab stop,
  keyboard behavior, focus management, announcement, or accessible name of its
  own. Semantics belong to the enclosing ChatMessage and caller content.
- **AR2 — Content preservation.** Caller DOM and ARIA passthrough reach the bubble
  root under FR8; component target metadata MUST NOT overwrite neutral caller ARIA.
- **AR3 — Reflow.** At a 320 CSS-px parent width, long content and the documented
  full-width case MUST wrap without horizontal page overflow (WCAG 2.2 SC 1.4.10).
- **AR4 — Color.** Bubble text remains meaningful content and requires WCAG 2.2
  AA text contrast against the final rendered bubble/backdrop in light and dark.
  The component uses semantic token pairs.

## Design relationships

| Anatomy or state | Design requirement                                    | Representation authority | Hierarchy role | Component contract |
| ---------------- | ----------------------------------------------------- | ------------------------ | -------------- | ------------------ |
| bubble content   | sender-aware filled boundary or aligned ghost surface | unsettled                | primary        | FR2–FR4            |
| grouped corners  | visually connect consecutive bubbles on sender side   | unsettled                | supporting     | FR5                |
| name             | align auxiliary content with bubble text inset        | unsettled                | supporting     | FR7                |
| metadata         | align auxiliary content with bubble text inset        | unsettled                | supporting     | FR7                |

No `authority: current` design record owns ChatMessageBubble's local
representation (OQ3). These rows describe shipped appearance; they do not
authorize a redesign.

## Family and system relationships

- The shared Chat consumer docs own composition guidance across message, bubble,
  metadata, list, layout, and composer components.
- `architecture:public-component-api` owns export, passthrough, styling-input,
  and ref behavior.
- `architecture:component-theming-surface` owns the painting target and reflected
  axes. It does not independently require this closed variant axis to become
  extensible; that would need a component-level public API decision.
- `architecture:component-test-sufficiency` owns the risk-based evidence
  inventory.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract | Verification                                                                                                    | Representative states                                 | Mutation or failure expectation                                                     | Audit section                           |
| -------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| FR1–FR3  | `ChatMessageBubble.test.tsx` children, sender, fallback, and compact density tests                              | standalone; user and assistant; compact               | A missing root, fallback, or reflected axis fails.                                  | `audit:ChatMessageBubble/behavior`      |
| FR4, FR9 | `ChatMessageBubble.test.tsx` variant and ghost tests; `themingTargets.test.ts`                                  | filled; ghost                                         | Dropping reflection, removing the ghost inset entirely, or losing the target fails. | `audit:ChatMessageBubble/theming`       |
| FR5      | `ChatMessageBubble.a11y.chromium.spec.ts` visible-state and RTL grouped-corner tests                            | user and assistant × first, middle, last; LTR and RTL | Physical corner logic or the wrong sender side fails the corner assertions.         | `audit:ChatMessageBubble/rtl`           |
| FR6      | `ChatMessageBubble.test.tsx` width tests                                                                        | omitted; string; number                               | Retaining the cap or changing numeric pixels fails.                                 | `audit:ChatMessageBubble/behavior`      |
| FR7      | `ChatMessageBubble.test.tsx` slot tests; the Chromium visible-state test's numeric alignment                    | zero; true; false; empty string; nullish              | A truthiness check loses zero's alignment or restores an empty wrapper.             | `audit:ChatMessageBubble/behavior`      |
| FR8, AR2 | `ChatMessageBubble.test.tsx` "forwards the ref and neutral DOM props to the bubble root" and `data-testid` test | ref; DOM, data, and ARIA props                        | Dropped forwarding fails.                                                           | `audit:ChatMessageBubble/public-api`    |
| AR3      | `ChatMessageBubble.a11y.chromium.spec.ts` "keeps long content inside a 320px fixture"                           | 320 CSS px                                            | Horizontal overflow fails.                                                          | `audit:ChatMessageBubble/accessibility` |
| AR4      | `ChatMessageBubble.a11y.chromium.spec.ts` visible-state test's contrast assertion                               | light and dark                                        | Bubble text below 4.5:1 fails.                                                      | `audit:ChatMessageBubble/accessibility` |

Read from source, with no focused test yet:

- FR1: rendering one root when `children` is `null`.
- FR2: the `system` sender taking the non-user paint path.
- FR3: the standalone `balanced` fallback, the compact radius, and the
  `spacious` inset.
- FR4: `filled` painting the sender fill; `ghost` removing the fill and
  block-axis padding, and its inline alignment matching each density.
- FR8: `className`, `style`, and `xstyle` composition.
- AR1: no role, tab stop, or name of the component's own.
- PR1–PR2: no state or Effect, and no inspection of caller content.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Should ChatMessageBubble keep every non-scalar `ReactNode`
  name/metadata value as caller-owned opaque content, or normalize selected
  arrays, Fragments, one-shot iterables, lazy values, or promises into a stable,
  rerender-safe empty/non-empty contract?** (`human-api`)
- **OQ2 — Should the aligned name and metadata wrappers become independently
  themeable, inherit a current owner, or remain intentionally unreachable?**
  (`human-api`)
- **OQ3 — Which current design owner, if any, should make filled/ghost usage and
  grouped-corner representation durable?**
  (`human-design`)

## Content boundary

This file does not duplicate the consumer prop table/examples, implementation steps, or shared architecture rules. Those remain in
`ChatMessageBubble.doc.mjs` and their canonical owners.

---

<!-- source: docs/specs/components/Chat/ChatMessageList.spec.md -->


# ChatMessageList component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `children`, `emptyState`, `scrollToTopAction`, `density`, `gap`, `align`, `isStreaming`, the root's `BaseProps<HTMLDivElement>`, and `ref`.                                            |
| Behavior                | A polite log holds caller messages. Density selects row spacing and passes through context. A top sentinel can request older messages. A short list rests at the block end by default. |
| End-user impact         | Readers get one focusable, polite log of the conversation that reports when a response is streaming; older messages load when they scroll to the top.                                  |
| Builder impact          | None.                                                                                                                                                                                  |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact; two owner questions stay open.                                                  |
| Review checks           | Reject a claim that the list owns ChatLayout auto-scroll, that this record settles the loading-overlap policy, or that DOM `aria-busy` proves spoken output.                           |
| Governing rules         | `architecture:public-component-api/INV1, INV5–INV8`; `architecture:react-component-runtime/INV3, INV5–INV6`; `spec:AST-029/FR2–FR5`.                                                   |

This table is a review projection; the body below is authoritative.

## Intent

ChatMessageList is the presentational message container within the Chat
composition. It owns a flex-column transcript, spacing/density context, an
optional empty state and older-message sentinel, and the log's rendered ARIA
attributes. `ChatLayout` owns auto-follow scrolling and the dock; message and
bubble components own sender presentation and content.

Consumer prop syntax and examples remain in `ChatMessageList.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; there is no controlled
  value on this component.
- Migration decision: none.

## Current-state impact

- **Bottom alignment uses an extra element.** `align="bottom"` renders a flex
  spacer element before the messages to push a short list down. When the list
  overflows, the collapsed spacer still leaves one row gap above the first
  message.
  With no messages, the spacer takes the upper half of the free space, so the
  empty state sits about three-quarters of the way down instead of centered.
  `architecture:component-style-authoring` INV7 expresses layout through styles
  on the elements a component already owns, not added elements.

## Ownership boundary

**Owns**

- The outer log element, its public DOM/ref/style passthrough, and the
  `chat-message-list` target with its `density` selector.
- The inner flex-column message box and density-based padding and gap.
- Where a short list rests: the block end for `bottom`, the block start for `top`.
- The optional `emptyState` substitution and older-message sentinel/loading
  indicator.
- Passing the inner content element to `ChatLayoutContext.contentRef` while a
  layout is present.

**Does not own / non-goals**

- Auto-scroll, scroll-to-bottom, dock, and scroll-owner selection, which belong
  to `component:ChatLayout` and its scroll hooks.
- Sender identity, message alignment, bubbles, metadata, and text semantics,
  which belong to their child components.
- The caller's region landmark or an accessible name for arbitrary transcript
  context; this record makes no naming policy.

## Public concepts

| Concept             | Closed values or states                         | Meaning                                                         | Availability  | Default    | Owner     | Stability | Invalid-value behavior                             |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------- | ------------- | ---------- | --------- | --------- | -------------------------------------------------- |
| `children`          | `ReactNode`                                     | Top-level transcript content                                    | every render  | required   | caller    | stable    | null, false, or `[]` counts empty at the top level |
| `emptyState`        | `ReactNode`; omitted                            | Substitutes for top-level empty children                        | empty state   | omitted    | caller    | stable    | absent renders no substitute                       |
| `scrollToTopAction` | async function; omitted                         | Invoked when the top sentinel intersects                        | when supplied | omitted    | caller    | stable    | absent creates no sentinel or observer             |
| `density`           | `compact`; `balanced`; `spacious`               | Chooses message spacing and child density context               | every render  | `balanced` | component | stable    | closed type union                                  |
| `gap`               | published `SpacingStep`; omitted                | Overrides the list's top-level row gap independently of density | every render  | omitted    | caller    | stable    | closed type union                                  |
| `align`             | `top`; `bottom`                                 | Positions short content at the start or block end               | every render  | `bottom`   | component | stable    | closed type union                                  |
| `isStreaming`       | `true`; `false`                                 | Exposes `aria-busy` on the polite log while streaming           | every render  | `false`    | caller    | stable    | boolean                                            |
| root passthrough    | `ref`, accepted DOM/data/ARIA and styling props | Extends the outer log element                                   | every render  | omitted    | caller    | stable    | owned role/live/busy attributes retain precedence  |

The table records the implementation's top-level emptiness test; it does not
promise recursive child inspection or resolve the meaning of arbitrary
non-rendering React nodes.

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                                                                                  | Basis                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| FR1 | The outer root renders `role="log"`, `aria-live="polite"`, and `tabIndex=0`; `isStreaming=true` adds `aria-busy="true"`, which is absent otherwise.                                                                                                                                                                                        | Current source, tests, and docs                     |
| FR2 | The chosen density is reflected as `data-density` on the root and flows to child messages through `ChatListContext`; it selects three spacing groups.                                                                                                                                                                                      | Current source, tests, and docs                     |
| FR3 | The optional `gap` replaces only the top-level row gap; density still selects padding and context.                                                                                                                                                                                                                                         | Current source, tests, and docs                     |
| FR4 | `emptyState` renders only when `children` is nullish, `false`, or an empty top-level array. Otherwise the passed children render unchanged.                                                                                                                                                                                                | Current source and tests                            |
| FR5 | With `align="bottom"` a short list rests at the block end; with `align="top"` it rests at the block start. Overflowing content takes the same rendering path. Implementation gap: the bottom placement uses an added spacer element, which also leaves one row gap above the first message when the list overflows (Current-state impact). | Current source and tests                            |
| FR6 | Supplying `scrollToTopAction` creates an observed top sentinel. An intersection starts its async transition, and a top-positioned spinner renders while it is pending.                                                                                                                                                                     | Current source, tests, and docs                     |
| FR7 | Inside ChatLayout, the inner content element is passed to the layout's `contentRef` and removed from that registration on cleanup; standalone lists have no layout ref.                                                                                                                                                                    | Current source                                      |
| FR8 | The root receives `ref`, accepted DOM/data/ARIA props, and composed `className`, `style`, and `xstyle`; component-owned log semantics are applied after forwarded props.                                                                                                                                                                   | Current source; `architecture:public-component-api` |

For the `emptyState` slot, numeric `0` is visible content. Nullish values,
booleans, and an empty string do not create an empty wrapper. This describes
scalar output only; it does not decide how to inspect nested children.

### Allowed variation

- **AV1 - Content.** Any caller-owned ReactNode may be placed in the list; the
  list does not infer sender metadata from children.
- **AV2 - Spacing.** Density selects token-based defaults; the optional `gap`
  selects a published spacing step without changing the child density.
- **AV3 - Scroll ownership.** The list may be used alone or inside ChatLayout;
  auto-follow behavior remains outside this component.

### Representative states

| State                         | Required invariant                                                                                                                     | Allowed variation                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Two messages and a system row | Polite log with messages in source order                                                                                               | Caller controls row content                |
| Empty top-level children      | The optional empty state is centered in the whole list for `top`; for `bottom`, it is centered below the spacer (Current-state impact) | An omitted empty state leaves an empty log |
| Compact/balanced/spacious     | Different token-derived row spacing and child density                                                                                  | `gap` may override only row spacing        |
| Short top/bottom list         | Bottom rests at the block end, top at the block start                                                                                  | Container height is caller-owned           |
| Streaming                     | Log has `aria-busy=true`                                                                                                               | Message content remains caller-owned       |
| Top action pending            | Spinner above content while transition is pending                                                                                      | Async action result is caller-owned        |

### Performance and resources

- **PR1 — Sentinel observer.** An `IntersectionObserver` is installed only when
  `scrollToTopAction` exists, and disconnected on cleanup. Its root is ChatLayout's scroll container when
  available, otherwise the document viewport.
- **PR2 — Layout registration.** The inner content element is registered with
  ChatLayout, and the registration is cleared on cleanup.

## Accessibility contract

- **AR1 — Log semantics.** The root is a focusable polite log with `aria-busy`
  reflecting `isStreaming` (FR1); this states browser-exposed semantics, not a
  screen-reader announcement transcript.
- **AR2 — No keyboard model.** The loading spinner is a separate child of the
  log. The list adds no interactive button or directional keyboard behavior of
  its own.
- **AR3 — Caller content.** Caller-supplied content remains responsible for
  names and semantics inside messages.

## Design relationships

No component-local design decision is recorded. Spacing uses portable semantic token steps. The family consumer doc
owns the published `chat-message-list` theme target and its `density` axis.
No anatomy-theming map is recorded yet; the block is optional during
migration, so the map is deferred.

## Family and system relationships

- No `family:chat` authority record currently exists. `Chat.doc.mjs` is the
  consumer family document, not a product-authority family contract.
- `ChatLayout` owns the scroll container and provides `contentRef`; the list
  registers its content element without taking over ChatLayout's scrolling.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract | Verification                                                                                                                                              | Representative states      | Mutation or failure expectation                              | Audit section              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------ | -------------------------- |
| FR1, AR1 | `ChatMessageList.test.tsx` role and `aria-busy` tests; `ChatMessageList.a11y.chromium.spec.ts` `aria-live` assertion                                      | rest, streaming            | A dropped log role or busy state fails.                      | `audit:ChatMessageList/§1` |
| FR2–FR3  | `ChatMessageList.test.tsx` density and gap tests                                                                                                          | densities; gap override    | Lost density reflection or a gap that changes density fails. | `audit:ChatMessageList/§2` |
| FR2      | `ChatMessage.test.tsx` "inherits list density and lets an explicit prop override it"; `ChatMessageBubble.test.tsx` list-density case                      | child message in a list    | Density that stops reaching child messages fails.            | `audit:ChatMessageList/§2` |
| FR7      | `ChatLayout.test.tsx` "first-fill scroll positioning" cases; `useChatNewMessages.test.tsx` "works end-to-end with ChatLayout conditional ChatMessageList" | list inside ChatLayout     | A list that stops registering its content element fails.     | `audit:ChatMessageList/§7` |
| FR4      | `ChatMessageList.test.tsx` empty-state tests                                                                                                              | empty; numeric empty state | A missing empty state, or a dropped numeric one, fails.      | `audit:ChatMessageList/§4` |
| FR6      | `ChatMessageList.test.tsx` "loads older messages through the top sentinel and exposes pending status"                                                     | pending, settled           | A lost action or stuck spinner fails.                        | `audit:ChatMessageList/§6` |

Read from source, with no focused test yet:

- FR1: `tabIndex=0` on the log.
- FR2: the spacing each density selects.
- FR3: `gap` replacing the top-level row gap.
- FR4: `null` and `false` children selecting the empty state.
- FR5: where a short list rests; the spacer tests count the added element
  behind the Current-state impact gap.
- FR7: removing the registration on cleanup.
- FR8: `ref`, DOM, data, and ARIA props, `className`, `style`, and `xstyle` on
  the root, and owned log semantics winning over forwarded props.
- PR1–PR2: the observer's root, and registration cleanup.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 - What is the intended overlap policy for repeated top-sentinel
  intersections while an async load remains pending?** (`human-api`) The current
  source invokes the action on intersection; this record does not add a
  single-flight, initial-load, or exhaustion guarantee.
- **OQ2 - Should emptiness inspect nested non-rendering ReactNode values?**
  (`human-api`) The shipped test is limited to the top-level `children` value.
  Do not reinterpret that test as a policy about generators, fragments,
  promised children, or arrays of non-rendering values.

## Content boundary

This file does not duplicate consumer prop tables or examples, ChatLayout's
scroll behavior, or cross-component visual policy. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatMessageMetadata.spec.md -->


# ChatMessageMetadata component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | Optional `timestamp` and `footer` ReactNode slots, optional closed `status` union, root `BaseProps<HTMLDivElement>` and `ref`, exported through `./Chat`.                                                           |
| Behavior                | The row renders its present slots in timestamp, footer, status order, with a separator only between present slots; user sender reverses the flex row. Five delivery statuses have localized icon-and-text displays. |
| End-user impact         | Readers see a compact line of time, extra details, and delivery status in reading order, with a dot only between items that show something and a caption beside each status icon.                                   |
| Builder impact          | None.                                                                                                                                                                                                               |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact; two owner questions stay open.                                                                               |
| Review checks           | Reject a lost visible zero, stranded separator, omitted translated status caption or title, dropped root passthrough, or claim that a static DOM attribute proves an AT announcement.                               |
| Governing rules         | `architecture:public-component-api/INV1, INV3, INV5–INV9`; `architecture:component-test-sufficiency/INV1–INV7`; `spec:AST-029/FR2–FR5`.                                                                             |

This table is a review projection; the body below is authoritative. Consumer
syntax belongs in `ChatMessageMetadata.doc.mjs`.

## Intent

ChatMessageMetadata is the optional compact line below a chat message. It
projects caller-owned timestamp/footer content and an optional delivery status
inside the sender-aware Chat composition. It is not the message article, the
bubble surface, the transcript, or the footer control owner.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component stores no
  delivery state.
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The status label may not be read.** The status span carries a translated
  `aria-label` but no role. WAI-ARIA 1.2 prohibits naming an element with the
  generic role, so assistive technology may ignore that label and read only
  the visible caption (FR6).

## Ownership boundary

**Owns**

- The optional metadata root, its `chat-message-metadata` painting target,
  ref, neutral DOM passthrough, and composed styling inputs.
- Presence checks and separators among timestamp, footer, and status.
- Sender-relative row order from the nearest Chat message context, with an
  assistant fallback outside that context.
- Status-to-glyph and translated-caption selection and the local sending/error
  paint path.

**Does not own / non-goals**

- Sender identity, article semantics, avatar, name, and body alignment:
  `ChatMessage` owns these.
- Bubble inset and placement: `ChatMessageBubble` owns these.
- Footer action semantics, button focus, and callback behavior: the caller's
  supplied content owns them.
- Transcript scrolling, loading, or delivery-state transitions: the surrounding
  composition owns these.
- A new public rule for inspecting composite, lazy, or asynchronous ReactNode
  values, or a screen-reader announcement-timing guarantee.

## Public concepts

| Concept        | Closed values or states                                            | Meaning                                                           | Availability                                        | Default                                     | Owner                               | Stability | Invalid-value behavior                                                                               |
| -------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------- | ----------------------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `timestamp`    | Omitted or caller ReactNode                                        | Optional first item, normally a time                              | Any composition                                     | Omitted                                     | Caller                              | Stable    | Null, booleans, and empty string do not render a scalar slot; `0` renders; non-scalars remain opaque |
| `footer`       | Omitted or caller ReactNode                                        | Optional middle item such as model information or caller controls | Any composition                                     | Omitted                                     | Caller                              | Stable    | Same scalar treatment as timestamp                                                                   |
| `status`       | `sending`, `sent`, `delivered`, `read`, `error`, omitted           | Optional delivery caption and glyph                               | Any composition                                     | Omitted                                     | Component/caller input              | Stable    | Closed type union; omitted contributes no item                                                       |
| Sender context | `user`, `assistant`, `system`, absent                              | Selects user-reversed or other forward row order                  | Within `ChatMessage` or standalone                  | Assistant when absent                       | `ChatMessage` / local fallback      | Stable    | Non-user values share the forward path                                                               |
| Root surface   | `BaseProps<HTMLDivElement>`, `ref`, `xstyle`, `className`, `style` | Extends the metadata row when it exists                           | Slot passes scalar-presence check or status present | Absent for empty scalar slots and no status | `architecture:public-component-api` | Stable    | Non-scalar values remain opaque; target and consumer styles combine                                  |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                     | Basis                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| FR1 | The root appears when at least one slot passes the shared scalar-presence predicate or `status` is present. Non-scalar values are treated as present without inspecting their inner content.                                                                  | Current source and tests          |
| FR2 | Accepted slot values render in timestamp, footer, status order with dots between values considered present; numeric `0` is visible in either slot, and non-scalar nodes remain opaque.                                                                        | Current source and tests          |
| FR3 | A `user` message reverses row direction; `assistant`, `system`, and absent context use the forward path.                                                                                                                                                      | Current source                    |
| FR4 | Status selects one of four registry icons (`delivered` and `read` share `checkDouble`) and localized labels; failure uses the error text token, and sending has a CSS pulse suppressed under reduced motion.                                                  | Current source and locale catalog |
| FR5 | The root merges the target, default StyleX output, and consumer `xstyle`, `className`, and `style`; accepted neutral DOM/ARIA inputs and `ref` reach that root.                                                                                               | Current source and tests          |
| FR6 | A status item has a translated title, an icon, and visible localized text. The row declares no live-region role or imperative announcement. Implementation gap: the status span also carries a translated `aria-label` without a role (Current-state impact). | Current source and tests          |

### Allowed variation

- **AV1 - Slot content.** The caller decides the structure and semantics inside
  timestamp and footer slots. This component does not inspect non-scalar nodes.
- **AV2 - Theme.** Semantic colors, typography, and spacing resolve through the
  active Theme; the root remains the public metadata painting target.
- **AV3 - Context.** Standalone use takes the assistant ordering fallback.

### Representative states

| State                       | Required invariant                                                          | Allowed variation                      |
| --------------------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| Standalone timestamp        | One root and one visible item                                               | Caller content                         |
| User or assistant message   | Sender-relative row order                                                   | Text direction inherited from the page |
| Timestamp + footer + status | Items separated according to scalar presence; composite nodes remain opaque | Caller footer content                  |
| Each delivery status        | Distinct localized caption and mapped icon                                  | Active translation and theme tokens    |
| Non-rendering scalar slots  | No stranded dot; no row when all items are empty                            | Composite nodes remain opaque          |
| Numeric `0`                 | Visible content, not an empty marker                                        | Either slot                            |
| Long footer at narrow width | Content reflows within its container                                        | Caller text may wrap                   |

### Transformation and precedence order

- **ORD1 - Presence before separators.** Decide scalar presence with the shared
  predicate while treating non-scalar caller nodes as opaque, then place
  punctuation between values considered present. The status check remains
  independent of the slot checks.
- **ORD2 - Composition.** Resolve sender context, select flex order, and compose
  component StyleX and theme target with consumer styling inputs on one root.

### Performance and resources

- **PR1 - Render derivation.** The component creates no local React state,
  Effects, timers, observer, or event listeners. Its local animation is CSS and
  suppressed for reduced motion.

## Accessibility contract

- **AR1 - Display semantics.** The metadata line does not add a button, focus
  target, list role, or live region of its own. Interactive footer content retains
  its own semantics and keyboard behavior.
- **AR2 - Visible delivery state.** The status caption accompanies the glyph so
  state identification does not rely on color or the icon alone.
- **AR3 - Evidence boundary.** Browser-exposed markup and axe coverage do not
  establish spoken output or announcement timing; any such future claim follows
  `spec:AST-009` and its named AT evidence rule.

## Design relationships

| Anatomy or state | Design requirement                                               | Representation authority                     | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------------ |
| Metadata row     | Semantic supporting typography and sender-relative reading order | Local representation unsettled               | Supporting     | FR2–FR3            |
| Delivery status  | Registry glyph, caption, and semantic error token                | Local prominence and motion choice unsettled | Supporting     | FR4, AR2           |

No component-local design decision is recorded.

## Family and system relationships

- There is no current `family:chat` product-authority record. `Chat.doc.mjs` is
  consumer composition guidance, not a family contract.
- `architecture:public-component-api` owns root export and passthrough;
  `architecture:component-theming-surface` owns the public painting target;
  `architecture:component-test-sufficiency` owns bounded evidence coverage.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract      | Verification                                                                                                                                                                  | Representative states                          | Mutation or failure expectation                                                                                                   | Audit section                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| FR1–FR2       | `ChatMessageMetadata.test.tsx` separator, empty-row, and numeric-zero tests; `ChatMessageMetadata.a11y.chromium.spec.ts` `narrow-overflow` and `status-*` cases               | empty scalar; zero; timestamp, footer, status  | A stray separator, a blank row, or a hidden zero fails.                                                                           | `audit:ChatMessageMetadata/behavior`   |
| FR5           | `ChatMessageMetadata.test.tsx` `forwards rest props (data-*, aria-*, id) to the root element`                                                                                 | data and id props                              | A dropped prop fails.                                                                                                             | `audit:ChatMessageMetadata/public-api` |
| FR3, FR4, FR6 | `ChatMessageMetadata.a11y.chromium.spec.ts` status and RTL sender-ordering tests; `ChatMessageBubble.test.tsx` "renders status" and "renders timestamp and status on one row" | each status; user and assistant in LTR and RTL | A wrong sender order, or a missing caption or title, fails; the bubble tests also pin the status `aria-label` behind the FR6 gap. | `audit:ChatMessageMetadata/behavior`   |

Read from source, with no focused test yet:

- FR2: the separator before `status` after an empty scalar slot.
- FR3, AV3: the forward row for `system` and standalone use.
- FR4: each status's icon, the error color, and the sending pulse and its
  reduced-motion suppression.
- FR5: ARIA passthrough, `ref`, `className`, `style`, and `xstyle`
  composition, and the target.
- FR6, AR1: no live region of the row's own.
- PR1: no state, Effect, timer, observer, or listener.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 - Should non-scalar ReactNode slots ever be normalized for emptiness?**
  (`human-api`) Arrays, Fragments, lazy content, and promises remain opaque under
  the existing scalar predicate; the component does not consume or inspect them.
- **OQ2 - Should standalone delivery-status changes be announced, and if so by
  which owner?** (`human-api`) The current row is display-only. No spoken-timing
  claim is made without a current owner and applicable AT evidence.

## Content boundary

This file does not duplicate consumer prop tables or examples, or shared visual
policy. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatSendButton.spec.md -->


# ChatSendButton component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | The exported control selects send or stop presentation from props over ChatComposer context, accepts `sm` or `md`, supports icon overrides, and extends the rendered Button with supported Button DOM, event, styling, and ref inputs.  |
| Behavior                | Send is disabled from explicit or composer readiness, stop remains enabled, state-specific actions run before a composed generic click handler, and current send artwork resolves from an explicit override before the shared fallback. |
| End-user impact         | People receive a translated, state-appropriate send or stop action whose availability follows composer readiness.                                                                                                                       |
| Builder impact          | None.                                                                                                                                                                                                                                   |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact.                                                                                                                                  |
| Review checks           | Reject lost send/stop routing, consumer events that replace the state action, a disabled stop action, unlabelled icon-only output, dropped root inputs, or a lost explicit-first send icon or `arrowUp` fallback.                       |
| Governing rules         | `spec:AST-032` FR2–FR3; `architecture:public-component-api` INV5–INV8; `architecture:interaction-modality`; `architecture:component-test-sufficiency`; `spec:AST-020`; `spec:AST-029`.                                                  |

This table is a review projection; the body below is authoritative.

## Intent

ChatSendButton is the compact action control used by ChatComposer. It translates
composer readiness and streaming state into a shared Button while keeping action,
icon, styling, and ref seams available for standalone composition.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; explicit props take
  precedence over context-derived values
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **The send icon has no component-slot stage.** Send artwork resolves from
  `sendIcon`, then the shared `arrowUp`. `spec:AST-032` FR2–FR3 put a
  component-icon slot stage in that resolution; ChatSendButton does not offer
  it yet (FR3).

## Ownership boundary

**Owns**

- Selection of the send or stop state.
- State-specific translated accessible names and Button variants.
- Composer-context fallback for readiness and actions.
- Send and stop icon selection at the component seam.
- Composition of the state action with an accepted generic click handler.
- The `chat-send-button` theme target and circular root treatment.

**Does not own / non-goals**

- ChatComposer value editing, submission lifecycle, streaming lifecycle, or placement.
- Shared Button activation, focus, disabled semantics, hit area, or base styling.
- Shared icon artwork or theme icon registration.
- A public policy for whether `isStopShown` may appear without a stop action.

## Public concepts

Consumer syntax remains in `ChatSendButton.doc.mjs`. This inventory closes the
observable semantic surface without duplicating the prop table.

| Concept      | Closed values or states                                        | Meaning                                                                                | Availability by variant/orientation/state | Default                                                     | Owner                               | Stability | Invalid-value behavior                                                                      |
| ------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- | ----------------------------------- | --------- | ------------------------------------------------------------------------------------------- |
| Action state | send; stop                                                     | Selects the name, Button variant, icon role, disabled rule, and state action.          | Every render.                             | Composer `isStopShown`, otherwise send.                     | `component:ChatSendButton`          | Stable    | Values outside the boolean prop type are unsupported.                                       |
| Availability | enabled; disabled                                              | Prevents send activation when content is not ready. Stop intentionally ignores it.     | Disabled applies only to send.            | Explicit `isDisabled`, otherwise inverse composer canSend.  | component and ChatComposer context  | Stable    | Values outside the boolean prop type are unsupported.                                       |
| Action       | state callback; composer fallback; composed generic click      | Runs the state action and then an accepted consumer click handler.                     | Enabled send and stop activation.         | `onSend` or submit current value; `onStop` or context stop. | component, context, and caller      | Stable    | With no state callback or matching context action, only a supplied generic click can run.   |
| Send icon    | explicit content; shared fallback                              | Selects artwork for the send state.                                                    | Send state.                               | `sendIcon`, then shared `arrowUp`.                          | component and caller                | Stable    | Unsupported React content follows the shared Button rendering boundary.                     |
| Stop icon    | explicit content; shared fallback                              | Selects artwork for the stop state.                                                    | Stop state.                               | `stopIcon`, then shared `stop`.                             | component and caller                | Stable    | Unsupported React content follows the shared Button rendering boundary.                     |
| Size         | `sm`; `md`                                                     | Selects the delegated Button size while preserving circular treatment.                 | Both states.                              | `md`.                                                       | `component:ChatSendButton`          | Stable    | Values outside the public union are rejected by TypeScript.                                 |
| Root surface | ref; supported Button DOM/data/ARIA/events; style/class/xstyle | Extends and styles the rendered Button without replacing component-owned action logic. | Every render.                             | Omitted.                                                    | `architecture:public-component-api` | Stable    | Unsupported BaseProps omissions remain unsupported; owned semantics win accidental clashes. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                         | Basis                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| FR1 | The send state MUST render a primary icon-only Button named by the send translation, and it MUST be disabled when explicit or context-derived readiness is false.                                                 | Current implementation, docs, tests, `spec:AST-020`, and shared Button behavior          |
| FR2 | The stop state MUST render a secondary icon-only Button named by the stop translation, remain enabled regardless of send readiness, and invoke explicit or context stop behavior.                                 | Current implementation, docs, and tests                                                  |
| FR3 | Send icon resolution prefers `sendIcon` and otherwise resolves the shared `arrowUp`. Implementation gap: the component-icon slot stage `spec:AST-032` FR2–FR3 require is not offered (Current-state impact).      | Current implementation, docs, tests, and current owner requirement in `spec:AST-032`     |
| FR4 | Stop icon resolution prefers `stopIcon` and otherwise resolves the shared `stop` icon.                                                                                                                            | Current implementation, docs, and tests                                                  |
| FR5 | Explicit state, disabled, callback, icon, and size props MUST win over their context or component fallback. A generic accepted click handler MUST compose after the selected state action rather than replace it. | Current source and tests; `architecture:public-component-api` INV5–INV7                  |
| FR6 | Supported Button DOM, data, ARIA, className, style, xstyle, and ref inputs MUST reach or compose on the rendered Button while component-owned label, state, and activation behavior remain intact.                | Current implementation plus `architecture:public-component-api/INV5-INV8`                |
| FR7 | The component MUST paint through the shared Button on the co-located `chat-send-button` target and preserve its circular component treatment.                                                                     | Current implementation, Chat consumer docs, and `architecture:component-theming-surface` |

### Allowed variation

- **AV1 — Context or standalone composition.** A builder may rely on ChatComposer
  context or provide all state, action, and disabled values explicitly.
- **AV2 — Artwork.** Explicit send and stop content and shared fallback artwork may
  vary within the icon resolution FR3 and FR4 state.
- **AV3 — Consumer styling.** Supported styling inputs may extend the Button while
  component-owned state and activation behavior remain.

### Representative states

| State                  | Required invariant                                                                  | Allowed variation                               |
| ---------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------- |
| Send, disabled         | Primary translated send action is unavailable and does not run callbacks.           | Icon source, size, theme, and consumer styling. |
| Send, enabled          | Primary translated send action runs explicit or context submission.                 | Icon source, size, theme, and consumer styling. |
| Stop                   | Secondary translated stop action remains enabled and runs explicit or context stop. | Icon source, size, theme, and consumer styling. |
| Explicit override      | Explicit state, callback, icon, disabled value, and size win their fallback seams.  | Context may still supply unspecified values.    |
| Composed generic click | State action and accepted generic click both run without one replacing the other.   | Either handler may be absent.                   |

### Transformation and precedence order

- **ORD1 — Resolve state.** Explicit `isStopShown` wins, then composer context,
  then the send state.
- **ORD2 — Resolve action.** Explicit state callback wins its composer fallback.
  The selected state action runs before the accepted generic click handler because
  this component does not promise consumer cancellation of its state action.
- **ORD3 — Resolve availability.** Stop remains enabled. Send uses explicit
  `isDisabled`, then inverse composer readiness, then disabled outside context.
- **ORD4 — Resolve artwork.** In send, explicit `sendIcon` wins, then shared
  `arrowUp`; in stop, explicit `stopIcon` wins, then shared `stop`. The
  component-icon slot stage `spec:AST-032` FR2 requires is not offered yet
  (FR3).
- **ORD5 — Compose root.** Apply component-owned Button semantics and the
  `chat-send-button` target while preserving supported consumer root inputs.

### Performance and resources

- **PR1 — Render-only projection.** The component adds no Effect, observer,
  listener, timer, state mirror, or owned async lifecycle.

## Accessibility contract

- **AR1 — Native action semantics.** The delegated Button MUST own native button
  activation, keyboard behavior, focus indication, and disabled semantics.
- **AR2 — State-appropriate name.** The icon-only control MUST expose the current
  translated send or stop label independently of icon artwork.
- **AR3 — Disabled send behavior.** A disabled send action MUST not invoke either
  the state action or a consumer click handler.
- **AR4 — Modality parity.** Pointer and keyboard activation MUST traverse the same
  state-action and composed-event path.

## Design relationships

| Anatomy or state | Design requirement                                                | Representation authority                                     | Hierarchy role           | Component contract |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------ | ------------------ |
| Action button    | Circular compact Button carrying the current send or stop action. | Current source and consumer docs; exact tuning stays in code | Primary/secondary action | FR1, FR2, FR7      |
| Send artwork     | Upward send glyph unless explicit content wins (FR3's gap).       | Current source and docs; `spec:AST-032` FR2–FR3              | Action cue               | FR3                |
| Stop artwork     | Shared stop glyph unless explicit content wins.                   | Current source and consumer docs                             | Action cue               | FR4                |

This record selects no new dimensions, variants, icon artwork, color roles, or
visual prominence. No anatomy-theming map is recorded yet; the block is
optional during migration, so the map is deferred.

The Chat family consumer doc catalogs `chat-send-button`. Button owns the
underlying painting and interaction-state styling; the component target is
co-located on that painting element.

## Family and system relationships

- ChatComposer owns value, readiness, submission, stop lifecycle, and placement.
- Button owns shared activation, focus, disabled semantics, hit area, and paint.
- `architecture:public-component-api` owns BaseProps reachability, style/ref
  composition, and deliberate event composition.
- `architecture:icon-resolution-and-component-slots` owns the shared slot model;
  `spec:AST-032` FR2–FR3 put a component-slot stage in send resolution, which is
  not shipped (Current-state impact).
- `architecture:component-theming-surface` owns the qualification and placement
  of the co-located `chat-send-button` target.
- `architecture:interaction-modality` and `spec:AST-020` own pointer, keyboard,
  focus, and accessibility parity inherited through Button.
- `architecture:component-test-sufficiency` owns public-seam regression coverage.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract                  | Verification                                                                                                         | Representative states                                                                                                    | Mutation or failure expectation                                                                                                                  | Audit section                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| FR1, FR2, AR1-AR4         | `ChatSendButton.test.tsx`, `ChatSendButton.a11y.chromium.spec.ts`, and `ChatComposer.test.tsx`                       | Enabled/disabled send, stop with and without handler, context stop, keyboard/pointer, light/dark interaction states      | Label, disabled, native activation, state routing, or interaction paint drift fails focused or exact-head browser evidence.                      | `audit:ChatSendButton/accessibility` |
| FR3                       | `ChatSendButton.test.tsx`                                                                                            | Explicit and shared-fallback send icon                                                                                   | Losing explicit-first precedence or the `arrowUp` fallback fails focused tests; the `spec:AST-032` slot stage is not tested here.                | `audit:ChatSendButton/theming`       |
| FR4                       | `ChatSendButton.test.tsx`                                                                                            | Explicit and fallback stop icon                                                                                          | Losing explicit precedence or registry resolution fails focused assertions.                                                                      | `audit:ChatSendButton/behavior`      |
| FR5, FR6                  | `ChatSendButton.test.tsx` callback composition, ordering, size, root passthrough, disabled-click, and keyboard tests | Send, stop, `sm`/`md`, ref/class/data/ARIA, Enter/Space                                                                  | Consumer events replacing state actions, cancellation reordering, lost root inputs, or modality drift fails focused tests.                       | `audit:ChatSendButton/api`           |
| FR7                       | `themingTargets.test.ts` and `ChatSendButton.a11y.chromium.spec.ts`                                                  | Send and stop themes                                                                                                     | Target removal, movement off paint, or undocumented target drift fails tests or browser evidence.                                                | `audit:ChatSendButton/theming`       |
| RTL relation              | RTL shared-fixture route plus refreshed verified-N/A source receipts for ChatSendButton and ChatComposer             | Send and stop                                                                                                            | Directional artwork, physical positioning, or transform invalidates the checked-in receipts.                                                     | `audit:ChatSendButton/i18n-rtl`      |
| Browser matrix            | `ChatSendButton.a11y.chromium.spec.ts` browser states                                                                | Light/dark send and stop rest/hover/focus/press, disabled rest/hover, `sm`/`md`, 320px coarse pointer, D7 contrast pairs | A stale build, decoy selector, missing state, changed disabled paint, absent interaction pixels, failed contrast, or geometry miss fails closed. | `audit:ChatSendButton/visual`        |
| Documentation and surface | Consumer docs, export checks, Storybook, and `check:knowledge`                                                       | Props, public subpath, states, contract                                                                                  | Missing or stale docs, exports, relationships, or required structure fails validation.                                                           | `audit:ChatSendButton/docs`          |

Read from source, with no focused test yet:

- FR5: explicit props winning over ChatComposer context.
- FR6: `style` and `xstyle` reaching the root.

## Decision log

No component-local decision is recorded.

## Open questions

- **Cross-reference: stop without handler.** `component:ChatComposer/OQ4` owns
  the unresolved policy for a visible stop action without an explicit or context
  `onStop`. This record covers today's enabled no-op branch without
  duplicating that question.

## Content boundary

This file does not duplicate consumer examples, audit scores, screenshots,
eligibility data, or shared Button and icon-system rules. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatSystemMessage.spec.md -->


# ChatSystemMessage component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatSystemMessage` with required `children`, `variant` (`default`, `divider`; default `default`), optional `icon`, `ref`, `xstyle`, `className`, `style`, and root DOM props.      |
| Behavior                | `default` renders a centered row of optional icon content and the children, wrapping long text. `divider` renders the children as a labelled horizontal Divider and ignores `icon`. |
| End-user impact         | Readers can tell system notices apart from sender messages and see labelled date or section breaks; a notice added to a chat log is announced once, by the log.                     |
| Builder impact          | None.                                                                                                                                                                               |
| Compatibility/readiness | Records shipped behavior; no public change. No implementation gap; one owner question stays open.                                                                                   |
| Review checks           | Reject a live role on the row, a lost separator or its name, dropped root inputs, or a change that settles the divider-icon question without its owner.                             |
| Governing rules         | `spec:AST-086` FR4; `component:Divider`; `architecture:public-component-api`; `architecture:component-theming-surface`; `architecture:theme-tokens`.                                |

This table is a review projection; the body below is authoritative.

## Intent

ChatSystemMessage presents short non-sender content in a chat transcript, such
as "conversation started" or a date break. It keeps system notices apart from
sender messages and hands labelled separators to Divider. Consumer usage lives
in `ChatSystemMessage.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component owns no state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The root row, its `chat-system-message` target, and choosing between the
  centered row and the Divider composition (FR1, FR2, FR5).
- Wrapping long default-variant content and keeping icon content from
  shrinking (FR1).
- Root ref, DOM props, and styling (FR4).

**Does not own / non-goals**

- Announcing the notice — a chat log announces content added inside it
  (`spec:AST-086` FR4).
- The separator's rule, label placement, role, name, and label partitions —
  owned by `component:Divider`.
- Sender identity, transcript order, and scrolling.
- The meaning of caller content and icon artwork.

## Public concepts

| Concept      | Closed values or states | Meaning                                                   | Availability by variant/orientation/state          | Default   | Owner                         | Stability | Invalid-value behavior           |
| ------------ | ----------------------- | --------------------------------------------------------- | -------------------------------------------------- | --------- | ----------------------------- | --------- | -------------------------------- |
| Presentation | `default`, `divider`    | A centered notice row or a labelled horizontal separator. | Every render.                                      | `default` | `component:ChatSystemMessage` | Stable    | TypeScript rejects other values. |
| Icon         | omitted; a React node   | Optional artwork before the notice.                       | Rendered by `default`; ignored by `divider` (OQ1). | omitted   | `component:ChatSystemMessage` | Stable    | Not applicable.                  |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                   | Basis                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| FR1 | `default` renders a centered row with `icon`, when given, before the children; the children wrap within the available inline space, the icon does not shrink, and no divider rule is drawn. | Current source and tests |
| FR2 | `divider` renders the children as the label of a horizontal `component:Divider` inside the root, so the separator is named by its label; `icon` is not rendered (OQ1).                      | Current source and tests |
| FR3 | The root carries no live role of its own in either variant; a chat log announces a notice added inside it (`spec:AST-086` FR4).                                                             | `spec:AST-086`; tests    |
| FR4 | `ref`, DOM, data, and ARIA props, including a caller `role`, `className`, `style`, and `xstyle` reach the root in both variants.                                                            | Current source and tests |
| FR5 | The root carries the `chat-system-message` target and reflects `variant`.                                                                                                                   | Current source and tests |

### Allowed variation

- **AV1 — Content.** Text and other React content vary; Divider owns how empty
  and numeric labels render in the `divider` variant.
- **AV2 — Theme.** Semantic color, spacing, and typography tokens resolve per
  theme.

### Representative states

| State                 | Required invariant                            | Allowed variation |
| --------------------- | --------------------------------------------- | ----------------- |
| Default               | Centered notice; no rule; no live role.       | Content.          |
| Default with icon     | Icon before the content.                      | Artwork.          |
| Default, long content | Content wraps with no horizontal overflow.    | Locale.           |
| Divider               | A separator named by its label; no live role. | Label.            |
| Divider with icon     | The icon is not rendered (OQ1).               | —                 |

### Transformation and precedence order

- **ORD1 — Variant.** `divider` selects the Divider composition; otherwise the
  centered row renders.

### Performance and resources

- **PR1 — Render only.** The component adds no state, Effect, observer,
  listener, or timer.

## Accessibility contract

- **AR1 — No live role.** The notice is ordinary transcript content; the
  enclosing log announces it (FR3).
- **AR2 — Separator.** The `divider` variant exposes a separator named by its
  label through Divider (FR2).
- **AR3 — Noninteractive.** The component adds no focus target, keyboard
  command, or pointer action.

## Design relationships

| Anatomy or state | Design requirement                               | Representation authority | Hierarchy role | Component contract |
| ---------------- | ------------------------------------------------ | ------------------------ | -------------- | ------------------ |
| System message   | A centered, concise non-sender row.              | Current source and docs  | Supporting     | FR1, FR5           |
| Icon             | Optional artwork before the notice.              | Current source and docs  | Supporting     | FR1                |
| Divider          | A labelled separator for date or section breaks. | `component:Divider`      | Supporting     | FR2                |

No anatomy-theming map is recorded yet; the block is optional during
migration, so the map is deferred.

## Family and system relationships

- `component:Divider` owns the separator's structure, role, name, paint, and
  label partitions.
- `spec:AST-086` FR4 assigns announcement of content added inside a live
  container to that container.
- `architecture:public-component-api` owns root passthrough and styling
  composition; `architecture:theme-tokens` owns the token vocabulary.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract | Verification                                                                                                                                                                      | Representative states                       | Mutation or failure expectation                          | Audit section                           |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| FR1      | `ChatSystemMessage.test.tsx` children and icon tests                                                                                                                              | default; default with icon                  | Missing content or icon fails.                           | `audit:ChatSystemMessage/behavior`      |
| FR2, AR2 | `ChatSystemMessage.test.tsx` divider, separator-name, divider-icon, and numeric-zero label tests; `ChatSystemMessage.a11y.chromium.spec.ts` state matrix (horizontal orientation) | divider; divider with icon                  | A missing separator, wrong name, or rendered icon fails. | `audit:ChatSystemMessage/accessibility` |
| FR3, AR1 | `ChatSystemMessage.test.tsx` no-live-role tests                                                                                                                                   | both variants                               | A live role on the root fails.                           | `audit:ChatSystemMessage/accessibility` |
| FR4      | `ChatSystemMessage.test.tsx` "preserves the complete root passthrough seam" for each variant                                                                                      | ref, data, ARIA, role, class, style, xstyle | A dropped input fails.                                   | `audit:ChatSystemMessage/public-api`    |
| FR5      | `ChatSystemMessage.test.tsx` "preserves the complete root passthrough seam" for each variant                                                                                      | both variants                               | A missing reflected variant fails.                       | `audit:ChatSystemMessage/theming`       |
| FR1      | `ChatSystemMessage.a11y.chromium.spec.ts` 320px coarse-pointer reflow test                                                                                                        | long content at 320 CSS px                  | Horizontal overflow fails.                               | `audit:ChatSystemMessage/responsive`    |

Read from source, with no focused test yet:

- FR1: centering, no divider rule in the default row, the icon rendering
  before the content, and the icon not shrinking.
- FR5: the `chat-system-message` target on the root.
- PR1, AR3: no state, Effect, or interaction of the component's own.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — What should `icon` do with `variant="divider"`?** (`human-api`)
  Today it is accepted and not rendered. Rendering it with the label, a
  breaking type restriction under `architecture:public-component-api` INV9, or
  keeping the no-op with documentation and a development warning each change
  the public contract.

## Content boundary

This file does not duplicate consumer prop tables or examples, or Divider's
rules. It links to their owners.

---

<!-- source: docs/specs/components/Chat/ChatTokenizedText.spec.md -->


# ChatTokenizedText component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatTokenizedText` with required string `children`, optional `tokens` (the `ChatComposerToken` shapes), `ref`, `xstyle`, `className`, `style`, and root span props; target `chat-tokenized-text`. |
| Behavior                | Unmatched text is preserved. Non-empty token values match literally from left to right. Structured tokens delegate to Badge and custom tokens to callers.                                          |
| End-user impact         | Readers see mentions and other tokens in a sent message as the same chips they saw in the composer, in place, with the rest of the text unchanged.                                                 |
| Builder impact          | None.                                                                                                                                                                                              |
| Compatibility/readiness | Records shipped behavior; no public change. One owner question stays open; evidence is pending for the claims listed as read from source.                                                          |
| Review checks           | Reject zero-width matching, lost unmatched text, execution of custom renderers without a match, dropped root inputs, or claims about caller-owned content.                                         |
| Governing rules         | `architecture:public-component-api/INV1, INV5–INV6, INV8–INV9`; `architecture:component-test-sufficiency/INV1–INV7`; ECMAScript RegExp progress semantics.                                         |

This table is a review projection; the body below is authoritative.

## Intent

ChatTokenizedText projects serialized token values embedded in a plain chat message
into inline structured Badge content or caller-rendered content while preserving the
surrounding text.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: not applicable; the component owns no state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **A shorter token can split a longer one.** When one token's value is a
  prefix of another's and is listed first, the shorter value wins: with tokens
  `@u1` then `@u12`, the text `@u12` renders the `@u1` chip followed by a
  stray `2`. When two tokens share a value, the later definition renders
  (OQ1).

## Ownership boundary

**Owns**

- Literal matching of serialized token values against the supplied message text.
- Preserving unmatched text and source order.
- Choosing the existing structured Badge or custom-render branch for each match.
- The root span, its `chat-tokenized-text` target, accepted BaseProps composition, and ref.

**Does not own / non-goals**

- Token value grammar, identity, validation, or product semantics.
- Badge color, iconography, sizing, or accessibility semantics.
- Semantics and interaction inside caller-provided custom token content.
- Composer insertion, serialization, deletion, selection, or token-element alignment.

## Public concepts

| Concept      | Closed values or states                         | Meaning                                                                   | Availability by variant/orientation/state | Default  | Owner                               | Stability | Invalid-value behavior               |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------- | -------- | ----------------------------------- | --------- | ------------------------------------ |
| Message text | any string                                      | Plain text whose literal token values may be projected inline.            | Every render                              | required | `component:ChatTokenizedText`       | Stable    | Empty text renders an empty span.    |
| Token set    | omitted; empty; non-empty                       | Candidate serialized values and their structured or custom presentations. | Every render                              | omitted  | caller and component                | Stable    | Empty token values are ignored.      |
| Token form   | structured Badge config; custom render function | Selects delegated Badge content or caller-rendered content.               | Matching non-empty values                 | none     | caller and delegated component      | Stable    | Type-invalid forms are rejected.     |
| Root surface | ref; supported DOM/data/ARIA/class/style/xstyle | Extends the inline root without replacing its owned target.               | Every render                              | omitted  | `architecture:public-component-api` | Stable    | Unsupported inputs stay unsupported. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                          | Basis                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| FR1 | The component MUST preserve unmatched text exactly and replace each matched non-empty serialized value at its original reading-order position. How overlapping or duplicate values resolve is OQ1. | Current source, tests, and docs                     |
| FR2 | Empty token values MUST be ignored so the renderer always makes progress and never enters a zero-width global-match loop.                                                                          | Current source and tests                            |
| FR3 | Structured matches MUST delegate label, variant, and icon rendering to Badge; custom matches MUST invoke the caller renderer only for an actual match.                                             | Current source, tests, and docs                     |
| FR4 | Supported ref, DOM/data/ARIA, className, style, and xstyle inputs MUST reach or compose on the root span while the `chat-tokenized-text` target remains intact.                                    | `architecture:public-component-api/INV5–INV6, INV8` |
| FR5 | The component MUST remain render-only, with no state, Effect, listener, observer, timer, or owned asynchronous resource.                                                                           | Current source                                      |

### Allowed variation

- **AV1 — Caller tokens.** Labels, variants, icons, custom content, and serialized values remain caller supplied.
- **AV2 — Caller styling.** Supported root styling inputs may extend the component without replacing its public target.
- **AV3 — Unmatched input.** Text with no matching non-empty value remains unchanged.

### Representative states

| State                | Required invariant                                                      | Allowed variation                     |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| Plain text           | Exact text remains visible.                                             | Any string content.                   |
| Structured match     | Matching text is replaced by delegated Badge content.                   | Label, variant, and icon.             |
| Custom match         | Matching text is replaced by caller-rendered content.                   | Any caller-owned React node.          |
| Repeated match       | Every occurrence is replaced in reading order.                          | Number and position of occurrences.   |
| Empty token value    | The value is ignored and rendering terminates with text preserved.      | Presence beside valid tokens.         |
| Narrow / RTL context | Inline content remains readable and follows surrounding text direction. | Theme, direction, and message length. |

### Transformation and precedence order

- **ORD1 — Normalize candidates.** Remove empty serialized values while preserving caller order.
- **ORD2 — Match literally.** Escape values for RegExp syntax and scan the message from left to right.
- **ORD3 — Render.** Preserve unmatched slices and delegate each matched token to Badge or the caller renderer.
- **ORD4 — Compose root.** Apply the component target and styles, then combine accepted consumer styling and root props.

### Performance and resources

- **PR1 — Finite progress.** Every successful match consumes at least one UTF-16 code unit; empty values cannot enter the matcher.
- **PR2 — Render-only projection.** Matching allocates one candidate list, lookup map, and result list per render and owns no persistent resource.

## Accessibility contract

- **AR1 — Reading order.** Unmatched text and token content remain in source reading order inside one inline text wrapper.
- **AR2 — Delegated content.** Structured token semantics remain owned by Badge; custom token semantics remain caller owned.
- **AR3 — Noninteractive root.** The component introduces no role, focus target, keyboard command, pointer action, or live-region behavior.

## Design relationships

| Anatomy or state | Design requirement                           | Representation authority         | Hierarchy role | Component contract |
| ---------------- | -------------------------------------------- | -------------------------------- | -------------- | ------------------ |
| Tokenized text   | Inline root preserves surrounding text flow. | Current source and released docs | supporting     | FR1, FR5           |
| Rendered token   | Delegates paint to Badge or caller content.  | `component:Badge` or caller      | supporting     | FR4, AR2           |

No component-local design decision is recorded.

### Theme ownership

The Chat family document owns the shared anatomy and target inventory inherited by
this subcomponent. The existing `chat-tokenized-text` target remains on the inline
root. Structured token paint delegates to Badge, while custom rendered token content
remains caller owned. No anatomy-theming map is recorded yet; the block is
optional during migration, so the map is deferred.

## Family and system relationships

- `component:Badge` owns structured token paint, variants, iconography, and label semantics.
- `component:ChatComposerInput` owns token insertion, serialization, deletion, and composer selection behavior.
- `architecture:public-component-api` owns released exports, BaseProps reachability, styling composition, and refs.
- `architecture:component-theming-surface` owns the target/anatomy mapping.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract     | Verification                                                                                                                             | Representative states                      | Mutation or failure expectation                                  | Audit section                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------ |
| FR1–FR3, PR1 | `ChatTokenizedText.test.tsx` plain, single, multiple, repeated, special-character, surrounding-text, empty-value, and custom-match tests | plain, structured, custom, repeated, empty | Lost text, zero-width nontermination, or the wrong branch fails. | `audit:ChatTokenizedText/behavior`   |
| FR4          | `ChatTokenizedText.test.tsx` ref and rest-prop tests                                                                                     | plain and tokenized roots                  | A dropped ref or prop fails.                                     | `audit:ChatTokenizedText/public-api` |
| FR1–FR4      | `ChatTokenizedText.a11y.chromium.spec.ts` rendered states                                                                                | plain, structured, custom                  | A missing or duplicated `chat-tokenized-text` target fails.      | `audit:ChatTokenizedText/theming`    |
| RTL relation | `apps/storybook/rtl-audit/verified-not-applicable.json`                                                                                  | all stories                                | —                                                                | `audit:ChatTokenizedText/i18n-rtl`   |

Read from source, with no focused test yet:

- ORD2: values containing RegExp metacharacters matching literally.
- FR3: `variant` and `icon` reaching the Badge.
- FR4: `className`, `style`, and `xstyle` composition.
- FR5, AR3: no state, Effect, or interaction of the component's own.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — How should overlapping or duplicate token values resolve?**
  (`human-api`) Today the first-listed value wins at a position, so a shorter
  prefix splits a longer value, and the later of two identical values renders.
  Whether matching should prefer the longest value, and how duplicates resolve,
  changes what readers see.

## Content boundary

This file does not duplicate consumer examples, Badge policy, token grammar, or composer editing behavior.

---

<!-- source: docs/specs/components/Chat/ChatToolCalls.spec.md -->


# ChatToolCalls component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `ChatToolCalls` with required `calls` (each with `name`, optional `status`, `target`, `node`, `duration`, `additions`, `deletions`, `stats`, `errorMessage`, `resultDetail`, `data`, and `key`), optional `label`, `isExpanded`, `defaultIsExpanded`, `onExpandedChange`, and root div props and ref. |
| Behavior                | No calls render nothing; one call renders directly; multiple calls expose a disclosure whose collapsed surface shows the latest call and whose expanded surface shows every call.                                                                                                                     |
| End-user impact         | Readers see what tools an assistant ran and whether each is pending, running, done, or failed; a group of calls collapses to its latest call and keeps hidden rows out of keyboard and screen-reader navigation.                                                                                      |
| Builder impact          | None.                                                                                                                                                                                                                                                                                                 |
| Compatibility/readiness | Records shipped behavior; no public change. One implementation gap, listed under Current-state impact; two owner questions stay open.                                                                                                                                                                 |
| Review checks           | Reject ignored labels, focusable descendants inside a collapsed group, lost keyboard activation, unreadable supporting text, dropped root inputs, or changed call ordering/defaults.                                                                                                                  |
| Governing rules         | `architecture:public-component-api/INV5–INV6, INV8–INV9`; `architecture:interaction-modality`; `spec:AST-009/FR7`; WCAG 2.2 SC 1.4.3 and 2.4.7.                                                                                                                                                       |

This table is a review projection; the body below is authoritative.

## Intent

ChatToolCalls presents tool or function invocations inside an assistant message,
including execution status, optional metadata, and inspectable result details.

## Compatibility and migration

- Released default preserved: `yes`; omitted status means complete and groups
  start collapsed unless `defaultIsExpanded` is true
- Compatibility class: records shipped behavior; no public change
- Controlled/uncontrolled behavior: `isExpanded` remains authoritative when supplied; otherwise local state starts from `defaultIsExpanded ?? false`.
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Current-state impact

- **Signed statistics can miss text contrast.** The success and error
  foreground tokens used for signed `+N` and `-N` statistics do not reach
  4.5:1 on every shipped light and dark surface; WCAG 2.2 SC 1.4.3 requires
  that contrast for text (FR5, OQ2).

## Ownership boundary

**Owns**

- Projection of ordered call data into single-call or grouped presentation.
- Group and per-call disclosures, including keyboard operation and focus treatment.
- Status, metadata, duration, statistics, and result-detail placement.
- The root div, `chat-tool-calls` target, supported BaseProps composition, and ref.

**Does not own / non-goals**

- Tool execution, streaming transport, result parsing, or error recovery.
- Semantics and interaction inside caller-provided `stats` or `resultDetail` content.
- Badge, Icon, Spinner, or CodeBlock internals.
- Product policy for which tool calls may be shown.

## Public concepts

| Concept       | Closed values or states                               | Meaning                                                      | Availability        | Default   | Owner                               | Stability | Invalid-value behavior               |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------------ | ------------------- | --------- | ----------------------------------- | --------- | ------------------------------------ |
| Call list     | empty; single; multiple                               | Selects absent, direct-row, or grouped presentation.         | Every render        | required  | `component:ChatToolCalls`           | Stable    | Empty renders nothing.               |
| Status        | pending; running; complete; error                     | Selects the visible and accessible execution state.          | Every call          | complete  | `component:ChatToolCalls`           | Stable    | Type-invalid values reject.          |
| Group label   | omitted; supplied string                              | Names an expanded group; omission uses the translated count. | Multiple calls      | omitted   | caller and component                | Stable    | Supplied strings render verbatim.    |
| Group state   | controlled; uncontrolled collapsed; uncontrolled open | Controls whether grouped rows are exposed.                   | Multiple calls      | collapsed | caller or component                 | Stable    | Conflicting control is avoided.      |
| Result detail | omitted; caller React node                            | Adds an independently operable per-call disclosure.          | Any call            | omitted   | caller and component                | Stable    | Omitted content adds no control.     |
| Root surface  | ref; supported DOM/data/ARIA/class/style/xstyle       | Extends the root without replacing its owned target.         | Non-empty call list | omitted   | `architecture:public-component-api` | Stable    | Unsupported inputs stay unsupported. |

## Behavioral and layout contract

| ID  | Invariant                                                                                                                                                                                                                                                                        | Basis                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| FR1 | An empty call list MUST render no root; one call MUST render directly; multiple calls MUST render one group disclosure and preserve caller order in its full list.                                                                                                               | Current source, tests, and docs                        |
| FR2 | A supplied `label` MUST replace the translated count on the expanded group surface; omission MUST retain the translated count fallback.                                                                                                                                          | Current source, tests, and docs                        |
| FR3 | A collapsed group MUST keep its descendant call disclosures out of keyboard and accessibility navigation; expansion MUST restore them.                                                                                                                                           | Current source and tests                               |
| FR4 | Every component-owned disclosure MUST activate with Enter, Space, and pointer input, expose expansion state, and draw the shared keyboard focus ring.                                                                                                                            | `architecture:interaction-modality`; WCAG 2.2 SC 2.4.7 |
| FR5 | Neutral supporting labels, targets, durations, and custom statistics MUST use the readable secondary foreground; signed addition and deletion counts use the success and error text colors. Implementation gap: those colors can miss text contrast (Current-state impact; OQ2). | WCAG 2.2 SC 1.4.3 and current token architecture       |
| FR6 | Supported root ref, DOM/data/ARIA, className, style, and xstyle inputs MUST reach or compose on the root while the public target remains intact.                                                                                                                                 | `architecture:public-component-api/INV5–INV6, INV8`    |

### Allowed variation

- **AV1 — Call content.** Tool names, targets, node names, durations, statistics, error messages, and result details remain caller supplied.
- **AV2 — Group control.** Callers may control expansion or supply only its initial uncontrolled value.
- **AV3 — Styling.** Supported root styling inputs may extend the component without replacing its public target.

### Representative states

| State                | Required invariant                                                                                      | Allowed variation                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Empty                | No root is rendered.                                                                                    | Empty array identity may vary.                                                      |
| Single               | One row appears without group chrome.                                                                   | Metadata and result detail may be absent.                                           |
| Multiple, collapsed  | Latest call and count appear; full rows are inert.                                                      | Call count and latest status may vary.                                              |
| Multiple, expanded   | Every call appears in source order; supplied label or translated count names the group.                 | Label text and row metadata may vary.                                               |
| Detail closed/open   | The row exposes its state and conditionally mounts the caller-owned detail.                             | Any caller React node.                                                              |
| Statuses             | All statuses expose translated accessible text; complete and error also retain distinct semantic marks. | Theme may change semantic artwork; pending and running share a spinner pending OQ1. |
| Narrow / RTL context | Rows truncate without horizontal overflow and follow logical inline direction.                          | Content length, theme, and direction.                                               |

### Transformation and precedence order

- **ORD1 — Choose presentation.** Empty, single, and grouped branches are selected from list length.
- **ORD2 — Resolve state.** Controlled expansion wins; otherwise local state starts from the initial default.
- **ORD3 — Resolve label.** A supplied group label wins; otherwise use the translated count.
- **ORD4 — Compose rows.** Preserve call order, render status and metadata, then add caller-owned detail disclosure where present.
- **ORD5 — Compose root.** Apply the component target and styles, then combine supported consumer inputs.

### Performance and resources

- **PR1 — Local state only.** The component owns disclosure state and no Effect, listener, observer, timer, or external resource.
- **PR2 — Linear projection.** Group rendering traverses the supplied call list once and does not mutate caller data.

## Accessibility contract

- **AR1 — Disclosure operation.** Group and detail disclosures expose `aria-expanded`, operate with pointer, Enter, and Space, and use the shared visible focus ring.
- **AR2 — Collapsed ownership.** Collapsed group content is inert; hidden detail content is unmounted.
- **AR3 — Status meaning.** Every status exposes translated visually hidden text. Complete and error also use distinct semantic marks; pending and running share the same subtle spinner (OQ1). Error messages are exposed to assistive technology and, on call rows, echoed in the status icon's hover tooltip.
- **AR4 — Static evidence.** Focus appearance, keyboard behavior, inertness, and DOM relationships use unit and Storybook play-function evidence under `spec:AST-009/FR7`; this record makes no announcement claim.

## Design relationships

| Anatomy or state | Design requirement                                                                             | Representation authority          | Hierarchy role | Component contract |
| ---------------- | ---------------------------------------------------------------------------------------------- | --------------------------------- | -------------- | ------------------ |
| Call row         | Compact inline status and metadata remain legible.                                             | Current source and WCAG contrast  | supporting     | FR5, AR3           |
| Disclosure       | Keyboard focus remains visible without changing layout.                                        | Current interaction architecture  | supporting     | FR4, AR1           |
| Status           | Translated hidden text preserves accessible meaning; complete and error retain semantic marks. | Current source and objective a11y | supporting     | FR5, AR3           |

No component-local design decision is recorded.

### Theme ownership

The existing `chat-tool-calls` target remains on the root. Badge, Icon, and Spinner
own their nested targets and paint. No anatomy-theming map is recorded yet; the
block is optional during migration, so the map is deferred.

## Family and system relationships

- `architecture:public-component-api` owns released exports, accepted inputs, styling composition, and refs.
- `architecture:component-theming-surface` owns the target and delegated anatomy contract.
- `architecture:interaction-modality` owns shared keyboard focus treatment.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence.
- `spec:AST-009` assigns these static semantics, keyboard, focus, and contrast claims to lower evidence layers rather than real AT.
- `spec:AST-029` owns the audit evidence inventory this record's verification
  map follows.

## Verification map

| Contract     | Verification                                                                                                                                   | Representative states                      | Mutation or failure expectation                                            | Audit section                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------- |
| FR1          | `ChatToolCalls.test.tsx` empty, single, collapsed default, toggle, and "includes the latest status in a collapsed group accessible name" tests | empty; single; grouped                     | A rendered empty root, group chrome on one call, or a wrong surface fails. | `audit:ChatToolCalls/behavior`      |
| FR2          | `ChatToolCalls.test.tsx` "renders the public custom group label when expanded"                                                                 | supplied label                             | An ignored label fails.                                                    | `audit:ChatToolCalls/behavior`      |
| FR3, AR2     | `ChatToolCalls.test.tsx` "removes collapsed call rows from keyboard and accessibility navigation"                                              | collapsed; expanded                        | An operable collapsed row fails.                                           | `audit:ChatToolCalls/accessibility` |
| FR4, AR1     | `ChatToolCalls.test.tsx` focus-ring, disclosure-semantics, and `aria-controls` tests                                                           | group header; detail row                   | A missing ring, expansion state, or controls reference fails.              | `audit:ChatToolCalls/accessibility` |
| AR3          | `ChatToolCalls.test.tsx` status-mark, status-name, and error-message tests                                                                     | each status; error with and without detail | A missing status text, mark, or error text fails.                          | `audit:ChatToolCalls/accessibility` |
| FR6          | `ChatToolCalls.test.tsx` "forwards the root ref and supported DOM props"                                                                       | single root                                | A dropped ref or prop fails.                                               | `audit:ChatToolCalls/public-api`    |
| FR4, AR4     | `ChatToolCalls.stories.tsx` `FocusedGroupedDetail` and `Narrow` play functions                                                                 | focused grouped detail; 320 CSS px         | A thinner or detached focus ring, or horizontal overflow, fails.           | `audit:ChatToolCalls/accessibility` |
| RTL relation | `apps/storybook/rtl-audit/verified-not-applicable.json`                                                                                        | all stories                                | —                                                                          | `audit:ChatToolCalls/i18n-rtl`      |

Read from source, with no focused test yet:

- FR1: caller order in the expanded list.
- FR2: the translated-count fallback when `label` is omitted.
- FR4: Enter and Space activation.
- FR5: the secondary foreground on supporting text.
- FR6: `xstyle` composition.
- PR1–PR2: no Effect or external resource, and no mutation of caller data.

## Decision log

No component-local decision is recorded.

## Open questions

- **OQ1 — Pending/running visual distinction.** Pending and running render the same subtle spinner and differ only in translated accessible text. Which approved visible treatment should distinguish them without inventing component-local status policy?
- **OQ2 — Semantic statistics contrast.** The released success/error foreground tokens for signed `+N`/`-N` statistics do not reach 4.5:1 in every shipped light/dark surface. Which system-level semantic text token should replace them while preserving addition/deletion meaning? The five affected axe baselines remain until that owner decision lands.

## Content boundary

This file does not duplicate consumer examples, tool execution policy, or delegated component contracts.
