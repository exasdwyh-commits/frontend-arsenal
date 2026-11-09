# useFloating

The main Hook of the library that acts as a controller for all other Hooks and components.

```js
import {useFloating} from '@floating-ui/react';
```

```js
import {useFloating} from '@floating-ui/react-dom';
```

## Usage

Call the Hook inside a component.

```js
function App() {
  const {refs, floatingStyles} = useFloating();
  return (
    <>
      <div ref={refs.setReference} />
      <div ref={refs.setFloating} style={floatingStyles} />
    </>
  );
}
```

## Options

The Hook accepts an object of options to configure its behavior.

```js
useFloating({
  // options
});
```

```ts
interface UseFloatingOptions {
  placement?: Placement;
  strategy?: 'fixed' | 'absolute';
  transform?: boolean;
  middleware?: Array<Middleware | undefined | null | false>;
  open?: boolean;
  onOpenChange?(
    open: boolean,
    event?: Event,
    reason?: OpenChangeReason,
  ): void;
  elements?: {
    reference?: ReferenceElement | null;
    floating?: FloatingElement | null;
  };
  whileElementsMounted?(
    reference: ReferenceElement,
    floating: FloatingElement,
    update: () => void,
  ): () => void;
  nodeId?: string;
}
```

```ts
interface UseFloatingOptions {
  placement?: Placement;
  strategy?: 'fixed' | 'absolute';
  transform?: boolean;
  middleware?: Array<Middleware | undefined | null | false>;
  open?: boolean;
  elements?: {
    reference?: ReferenceElement | null;
    floating?: FloatingElement | null;
  };
  whileElementsMounted?(
    reference: ReferenceElement,
    floating: FloatingElement,
    update: () => void,
  ): () => void;
}
```

### `placement`

default: `'bottom'`

The placement of the floating element relative to the reference element.

```js
useFloating({
  placement: 'left',
});
```

12 strings are available:

```ts
type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';
```

The `-start` and `-end` alignments are [logical](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) and will adapt to the writing direction (e.g. RTL) as expected.

You aren't limited to just these 12 placements though. [`offset`](https://floating-ui.com/docs/offset#creating-custom-placements) allows you to create _any_ placement.

### `strategy`

default: `'absolute'`

This is the type of CSS position property to use. Two strings are available:

```ts
type Strategy = 'absolute' | 'fixed';
```

```js
useFloating({
  strategy: 'fixed',
});
```

These strategies are differentiated as follows:

- `'absolute'` — the floating element is positioned relative
to its nearest positioned ancestor. With most layouts, this usually requires the browser to do the least work when updating the position.
- `'fixed'` — the floating element is positioned relative to
its nearest containing block (usually the viewport). This is useful when the reference element is also fixed to reduce jumpiness with positioning while scrolling. It will in many cases also ["break" the floating element out of a clipping ancestor](https://floating-ui.com/docs/misc#clipping).

### `transform`

default: `true`

Whether to use CSS transforms to position the floating element instead of layout (`top` and `left` CSS properties).

```js
useFloating({
  transform: false,
});
```

CSS transforms are more performant, but can cause conflicts with transform animations. In that case, you can make the positioned floating element a wrapper to avoid the conflict:

```js
<div ref={refs.setFloating} style={floatingStyles}>
  <div style={transitionStyles}>Content</div>
</div>
```

When using layout instead of transforms, ensure that the floating element has a fixed width or sets a `width: max-content` to prevent it from resizing.

### `middleware`

default: `[]`

An array of middleware objects that change the positioning of the floating element.

```js
useFloating({
  middleware: [
    // ...
  ],
});
```

When you want granular control over how the floating element is positioned, middleware are used. They read the current coordinates, optionally alter them, and/or provide data for rendering. They compose and work together to produce the final coordinates which are in the `floatingStyles` object.

The following are included in the package:

#### Placement modifiers

These middleware alter the base placement coordinates.

- [`offset`](https://floating-ui.com/docs/offset) modifies the placement to add distance
or margin between the reference and floating elements.

- [`inline`](https://floating-ui.com/docs/inline) positions the floating element
relative to individual client rects rather than the bounding box for better precision.

#### Visibility optimizers

These middleware alter the coordinates to ensure the floating element stays on screen optimally.

- [`shift`](https://floating-ui.com/docs/shift) prevents the floating element from
overflowing a clipping container by shifting it to stay in view.

- [`flip`](https://floating-ui.com/docs/flip) prevents the floating element from
overflowing a clipping container by flipping it to the opposite placement to stay in view.

- [`autoPlacement`](https://floating-ui.com/docs/autoPlacement) automatically chooses a
placement for you using a "most space" strategy.

- [`size`](https://floating-ui.com/docs/size) resizes the floating element, for example
so it will not overflow a clipping container, or to match the width of the reference element.

#### Data providers

These middleware only provide data and do not alter the coordinates.

- [`arrow`](https://floating-ui.com/docs/arrow) provides data to position an inner
element of the floating element such that it is centered to its reference element.

- [`hide`](https://floating-ui.com/docs/hide) provides data to hide the floating element
in applicable situations when it no longer appears attached to its reference element due to different clipping contexts.

#### Option reactivity

When using React state and middleware, stateful values inside _functions_ aren't fresh or reactive.

```js
const [value, setValue] = useState(0);

offset(value); // reactive and fresh
offset(() => value); // NOT reactive or fresh
```

Specifying the dependencies as a second argument of any middleware function will keep it reactive:

```js
offset(() => value, [value]);
```

This goes for any function option, including `size()`'s `apply` function.

### `elements`

default: `undefined`

An object of elements passed to the Hook, which is useful for externally passing them, as an alternative to the `refs` object setters.

The elements must be held in state (not plain refs) to ensure that they are reactive.

```js
const [reference, setReference] = useState(null);

const {refs} = useFloating({
  elements: {
    reference,
  },
});

return (
  <>
    <div ref={setReference} />
    <div ref={refs.setFloating} />
  </>
);
```

You can also do the inverse of the above, or pass both externally.

To spread `getReferenceProps()` onto an "external" reference element, visit [External reference](https://floating-ui.com/docs/useInteractions#external-reference).

### `whileElementsMounted`

default: `undefined`

A function that is called when the reference and floating elements are mounted, and returns a cleanup function called when they are unmounted.

```js
useFloating({
  whileElementsMounted: (reference, floating, update) => {
    // ...
    return () => {
      // ...
    };
  },
});
```

This allows you to pass [`autoUpdate`](https://floating-ui.com/docs/autoUpdate) whose signature matches the option, to ensure the floating element remains anchored to the reference element:

```js
import {autoUpdate} from '@floating-ui/react';

useFloating({
  whileElementsMounted: autoUpdate,
});
```

Only use this option if your floating element is _conditionally rendered_, not hidden with CSS. Use an Effect to call and clean up `autoUpdate` in the latter scenario.

### `open`

default: `false`

Whether the floating element is open or not, which allows you to determine if the floating element has been positioned yet.

```js
const [isOpen, setIsOpen] = useState(false);

const {isPositioned} = useFloating({
  open: isOpen,
});

// Once `isOpen` flips to `true`, `isPositioned` will switch to `true`
// asynchronously. We can use an Effect to determine when it has
// been positioned.
useEffect(() => {
  if (isPositioned) {
    // ...
  }
}, [isPositioned]);
```

### `onOpenChange`

default: `undefined`

A function that is called when the `open` state should change. By default, passing the setter of the `open` state will be sufficient:

```js
const [isOpen, setIsOpen] = useState(false);

useFloating({
  open: isOpen,
  onOpenChange: setIsOpen,
});
```

Since it's an event callback function, it allows you to conditionally react to the state changing, plus determine the <WordHighlight id="a" children="event" /> and <WordHighlight id="b" children="reason" /> that caused the change.

```js /event/#a /reason/#b
useFloating({
  open: isOpen,
  onOpenChange(isOpen, event, reason) {
    setIsOpen(isOpen);
    event && console.log(event); // e.g. MouseEvent
    reason && console.log(reason); // e.g. 'hover'
  },
});
```

Most open change events have a reason and event attached, but not all.

```ts
type OpenChangeReason =
  | 'outside-press'
  | 'escape-key'
  | 'ancestor-scroll'
  | 'reference-press'
  | 'click'
  | 'hover'
  | 'focus'
  | 'list-navigation'
  | 'safe-polygon';
```

### `nodeId`

default: `undefined`

A unique node ID for the floating element when using a [`FloatingTree`](https://floating-ui.com/docs/FloatingTree).

## Return value

The Hook returns the following type:

```ts
interface UseFloatingReturn {
  context: FloatingContext;
  placement: Placement;
  strategy: Strategy;
  x: number;
  y: number;
  middlewareData: MiddlewareData;
  isPositioned: boolean;
  update(): void;
  floatingStyles: React.CSSProperties;
  refs: {
    reference: React.MutableRefObject<ReferenceElement | null>;
    floating: React.MutableRefObject<HTMLElement | null>;
    domReference: React.MutableRefObject<Element | null>;
    setReference(node: RT | null): void;
    setFloating(node: HTMLElement | null): void;
    setPositionReference(node: ReferenceElement): void;
  };
  elements: {
    reference: RT | null;
    floating: HTMLElement | null;
  };
}
```

### `context`

This object contains the context data provided to relevant Hooks and components.

```js
const {context} = useFloating();
```

Alternatively, [`useFloatingRootContext`](https://floating-ui.com/docs/useInteractions#external-reference) enables you to use interaction hooks in a component higher in the React tree than the one `useFloating()` is called in.

### `placement`

The **final** placement of the floating element relative to the reference element. Unlike the one passed in the options, this one can be mutated by middleware like `flip()`. This is necessary to determine the actual side of the floating element for styling.

```js
const {placement} = useFloating();
```

### `strategy`

The positioning strategy of the floating element.

```js
const {strategy} = useFloating();
```

### `x`

The final x-coordinate of the floating element. This can be used as an alternative to `floatingStyles` to manually position the floating element with custom CSS.

```js
const {x} = useFloating();
```

### `y`

The final y-coordinate of the floating element. This can be used as an alternative to `floatingStyles` to manually position the floating element with custom CSS.

```js
const {y} = useFloating();
```

### `middlewareData`

The data provided by any middleware used.

```js
const {middlewareData} = useFloating();
```

### `isPositioned`

Whether the floating element has been positioned yet when used inside an Effect (not during render). Requires the `open` option to be passed.

```js
const {isPositioned} = useFloating();
```

### `update`

A function that updates the floating element's position manually.

```js
const {update} = useFloating();
```

### `floatingStyles`

The styles that should be applied to the floating element.

```js
const {floatingStyles} = useFloating();
```

### `refs`

The refs that should be applied to the reference and floating elements.

```js
const {refs} = useFloating();
```

#### `reference`

A ref for the reference element. You can access this inside an event handler or in an Effect.

```js
const {refs} = useFloating();
useEffect(() => {
  console.log(refs.reference.current);
}, [refs]);
```

#### `floating`

A ref for the floating element. You can access this inside an event handler.

For usage in Effects, prefer using `elements.floating`, since it's not guaranteed the floating element will be available on the first pass.

```js
const {refs} = useFloating();
// Inside an event handler:
console.log(refs.floating.current);
```

#### `domReference`

A ref for the DOM reference element (if available). You can access this inside an event handler or in an Effect.

```js
const {refs} = useFloating();
useEffect(() => {
  console.log(refs.domReference.current);
}, [refs]);
```

This differs from `reference` in that it is guaranteed to be a DOM reference, while the former can be a [virtual element](https://floating-ui.com/docs/virtual-elements).

#### `setReference`

A function that sets the reference element.

```js
const {refs} = useFloating();
return <div ref={refs.setReference} />;
```

#### `setFloating`

A function that sets the floating element.

```js
const {refs} = useFloating();
return <div ref={refs.setFloating} />;
```

#### `setPositionReference`

A function that sets the positioning reference element, to separate it from the events reference. This can be either a real or [virtual](https://floating-ui.com/docs/virtual-elements) element.

```js
const {refs} = useFloating();
return <div ref={refs.setPositionReference} />;
```

### `elements`

The elements as set by the refs, useful for access during rendering or when needing to reactively check if the element exists.

```js
const {elements} = useFloating();
```

#### `reference`

The reference element. May be virtual.

```js
const {elements} = useFloating();
console.log(elements.reference);
```

#### `floating`

The floating element. Enables you to reactively check if the floating element exists inside Effects, notable when using `<FloatingPortal>`, as it won't be available on the first pass.

```js
const {elements} = useFloating();
React.useEffect(() => {
  if (!elements.floating) return;
  // ...
}, [elements.floating]);
```

#### `domReference`

The DOM reference element.

```js
const {elements} = useFloating();
console.log(elements.domReference);
```
