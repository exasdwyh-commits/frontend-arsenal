import {ReactSelect} from '../../lib/components/PackageSelect';

# React

A React toolkit to position floating elements and optionally create interactions for them.

```bash
npm install @floating-ui/react
```

If you only need positioning without interactions, use the following for a smaller bundle size:

```bash
npm install @floating-ui/react-dom
```

Choose the package you installed for better docs:

The goal of this package is to provide primitives — features common to all types of floating elements — to create components for tooltips, popovers, dropdown menus, hover cards, modal dialogs, select menus, comboboxes, and more.

Instead of providing any pre-built components, it gives you the tools to create them more easily. This is ideal if you want lots of control, but does require more work to get started. The full guides in [React Examples](https://floating-ui.com/docs/react-examples) contain some copy-pasteable examples to get you started more quickly.

## Usage

Floating UI's usage can be broken down into two disparate parts:

- [Positioning](https://floating-ui.com/docs/react#positioning) (available for both
`@floating-ui/react` and `@floating-ui/react-dom`).
- [Interactions](https://floating-ui.com/docs/react#interactions) (available for only
`@floating-ui/react`).

## Positioning

`useFloating()` is the main Hook of each package.

```js
import {useFloating} from '@floating-ui/react';
```

```js
import {useFloating} from '@floating-ui/react-dom';
```

At its most basic, the Hook returns a `refs` object and a `floatingStyles` object:

```js
function App() {
  const {refs, floatingStyles} = useFloating();
  return (
    <>
      <button ref={refs.setReference}>Button</button>
      <div ref={refs.setFloating} style={floatingStyles}>
        Tooltip
      </div>
    </>
  );
}
```

This will position the floating `Tooltip` element at the **bottom center** of the `Button` element by default.

- `refs.setReference` sets the reference (or anchor) element
that is being referred to for positioning.
- `refs.setFloating` sets the floating element that is being
positioned relative to the reference element.
- `floatingStyles` is an object of positioning styles to
apply to the floating element's `style` prop.

The refs are callback refs (functions) to make them **reactive** — this ensures changes to the reference or floating elements, such as with conditional rendering, are handled correctly by updating the position.

## Anchoring

To ensure the floating element remains anchored to the reference element, such as when scrolling or resizing, pass [`autoUpdate`](https://floating-ui.com/docs/autoUpdate) to the `whileElementsMounted` option:

```js
import {useFloating, autoUpdate} from '@floating-ui/react';
```

```js
import {useFloating, autoUpdate} from '@floating-ui/react-dom';
```

```js
const {refs, floatingStyles} = useFloating({
  whileElementsMounted: autoUpdate,
});
```

Only use this option if your floating element is _conditionally rendered_, not hidden with CSS. Use an Effect to call and clean up `autoUpdate` in the latter scenario.

## API docs

Visit the full [`useFloating` API docs](https://floating-ui.com/docs/useFloating) for detailed information about customizing the positioning of floating elements.

- [Externally pass elements](https://floating-ui.com/docs/useFloating#elements)
- [Options](https://floating-ui.com/docs/useFloating#options)
- [Return value](https://floating-ui.com/docs/useFloating#return-value)

## Testing

When testing your components, ensure you flush microtasks immediately after the floating element renders. This will avoid the `act` warning.

```js
import {act} from '@testing-library/react';

test('something', async () => {
  render(<Tooltip open />);
  await act(async () => {}); // Flush microtasks.
  // Position state is ready by this line.
});
```

You may use this a lot, so you can create a custom function:

```js
const waitForPosition = () => act(async () => {});

test('something', async () => {
  render(<Tooltip open />);
  await waitForPosition();
  expect(screen.queryByRole('tooltip')).toBeInTheDocument();
});
```

## Narrow reference type

Due to [virtual elements](https://floating-ui.com/docs/virtual-elements), you may need to narrow the type when performing DOM operations on the ref:

```ts
const {refs} = useFloating<HTMLButtonElement>();
// refs.domReference.current is now of type HTMLButtonElement
```

The position reference [can be separated](https://floating-ui.com/docs/react#changing-the-positioning-reference-while-retaining-events) from the DOM (events) reference.

```js
const {refs} = useFloating<HTMLButtonElement>();
// refs.reference.current is now of type HTMLButtonElement
```

## Interactions

To add interactions, such as the ability to only show a floating element while hovering over its reference element, the Hook must first accept the following two options:

- `open` — a
```js /isOpen/#a /setIsOpen/#b
import {useFloating} from '@floating-ui/react';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const {refs, floatingStyles} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  return (
    <>
      <button ref={refs.setReference}>Button</button>
      {isOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          Tooltip
        </div>
      )}
    </>
  );
}
```
```js /context/
import {
  useFloating,
  useInteractions,
  useHover,
  useFocus,
} from '@floating-ui/react';

// Inside your component
const {refs, context} = useFloating({
  open: isOpen,
  onOpenChange: setIsOpen,
});

const hover = useHover(context);
const focus = useFocus(context);

const {getReferenceProps, getFloatingProps} = useInteractions([
  hover,
  focus,
]);
```
```js
<>
  <button ref={refs.setReference} {...getReferenceProps()}>
    My button
  </button>
  <div
    ref={refs.setFloating}
    style={floatingStyles}
    {...getFloatingProps()}
  >
    My tooltip
  </div>
</>
```

The pattern above assumes the reference element is not "external" to the floating element's component. To spread the reference element props onto an external component, visit [External reference](https://floating-ui.com/docs/useInteractions#external-reference).

## Open event callback

The `onOpenChange` event callback is invoked with an optionally-defined <WordHighlight id='a'>event object</WordHighlight> and <WordHighlight id="b">reason string</WordHighlight> as the second and third parameter:

```js /event/1#a /reason/1#b
useFloating({
  onOpenChange(isOpen, event, reason) {
    setIsOpen(isOpen);
    event && console.log(event);
    reason && console.log(reason);
  },
});
```

Note that `onOpenChange` is _not_ called if you manually changed the open state via the `setIsOpen()` setter. You can derive the event yourself in this case anyway.

## Changing the positioning reference while retaining events

- `refs.setReference` element is **both** the events and
position reference by default.
- `refs.setPositionReference` allows you to separate the
position to another element (either real or virtual).

```js /refs.setPositionReference/
const {refs} = useFloating();

return (
  <>
    <button ref={refs.setReference} {...getReferenceProps()}>
      Event reference
    </button>
    <button ref={refs.setPositionReference}>
      Position reference
    </button>
  </>
);
```

[View on CodeSandbox](https://codesandbox.io/s/xenodochial-butterfly-1xtup0?file=/src/App.tsx)

## Multiple floating elements on a single reference element

```js
import {useMergeRefs} from '@floating-ui/react';
```

Refs can be merged with the [`useMergeRefs`](https://floating-ui.com/docs/react-utils#usemergerefs) hook, and props can be merged by calling one of the getters inside of the other:

```js
const {refs: tooltipRefs} = useFloating();
const {refs: menuRefs} = useFloating();

const {getReferenceProps: getTooltipReferenceProps} =
  useInteractions([]);
const {getReferenceProps: getMenuReferenceProps} =
  useInteractions([]);

const ref = useMergeRefs([
  tooltipRefs.setReference,
  menuRefs.setReference,
]);
const props = getTooltipReferenceProps(getMenuReferenceProps());

return (
  <button ref={ref} {...props}>
    Common reference
  </button>
);
```

[View on CodeSandbox](https://codesandbox.io/s/trusting-mendeleev-49qn11?file=/src/App.tsx)

## Disabled elements

Disabled elements don't fire events, so tooltips attached to disabled buttons don't show. Avoid using the `disabled` prop, and make the button visually disabled instead. This ensures you won't need any wrapper tags and makes the tooltip accessible to all users.

[View on CodeSandbox](https://codesandbox.io/s/focused-feistel-0q6v43?file=/src/App.tsx)
