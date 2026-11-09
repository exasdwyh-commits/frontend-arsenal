# Inner

Positions the floating element such that an inner element inside of it is anchored to the reference element, while handling scroll and overflow behavior.

The most common use case for this is a macOS-style select menu, where the selected item pops up directly over the target button.

## Usage

There are two modules: `inner()` and `useInnerOffset()`.

- <WordHighlight id="a" children="inner" /> is a middleware that positions
the floating element such that an inner element inside of it is anchored to the reference element.

- <WordHighlight id='b' children="useInnerOffset" /> is an interaction Hook that offsets the
anchoring upon a `wheel` event. This allows the floating element's height to expand, revealing more list items. This is not strictly required but is necessary to match the UX of the macOS-style select menu.

```js /inner/1-2#a /useInnerOffset/1-2#b
import {inner, useInnerOffset} from '@floating-ui/react';

// Inside your component
const {context} = useFloating({
  middleware: [inner()],
});

const innerOffset = useInnerOffset(context);

const {getReferenceProps, getFloatingProps} = useInteractions([
  innerOffset,
]);
```

## Examples

- [Basic inner anchoring](https://codesandbox.io/s/lively-thunder-qh6gri?file=/src/App.tsx)
- [Inner anchoring and offset](https://codesandbox.io/s/modest-gianmarco-jx9fri?file=/src/App.tsx)
- [Inner anchoring with fallback](https://codesandbox.io/s/suspicious-einstein-4ec3n9?file=/src/App.tsx)

## inner Props

```js
interface InnerProps extends DetectOverflowOptions {
  listRef: React.MutableRefObject<Array<HTMLElement | null>>;
  index: number;
  offset?: number;
  overflowRef?: React.MutableRefObject<SideObject | null>;
  scrollRef?: React.MutableRefObject<HTMLElement | null>;
  referenceOverflowThreshold?: number;
  minItemsVisible?: number;
  onFallbackChange?(fallback: boolean): void;
}
```

### `listRef`

default: `[]`

An ref containing an array of list items inside the floating element.

```js
const listRef = useRef([]);

inner({
  listRef,
});
```

### `index`

default: `0`

The index of the list item that should be anchored to the reference element.

```js
const [index, setIndex] = useState(0);

inner({
  index,
});
```

### `overflowRef`

default: `undefined`

A ref containing a `SideObject`. This is used to determine the overflow of the floating element and is required when using the `useInnerOffset()` interaction Hook.

```js
const overflowRef = useRef({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

inner({
  overflowRef,
});
```

### `scrollRef`

default: `undefined`

An optional ref containing an `HTMLElement`. This may be used as the scrolling container instead of the floating element — for instance, to position inner elements as direct children without being interfered by scrolling layout.

### `referenceOverflowThreshold`

default: `0`

This determines the distance in pixels of the reference element from the edges of the boundary. If the reference element is too close to the edges of its clipping boundary, `onFallbackChange` will be invoked to use fallback positioning.

```js
inner({
  referenceOverflowThreshold: 20,
});
```

### `minItemsVisible`

default: `4`

Specifies the minimum number of items that should be visible before fallback positioning is used. `onFallbackChange` will be invoked if there are less than the number specified visible.

```js
inner({
  minItemsVisible: 10,
});
```

### `offset`

default: `0`

Determines the offset of the anchoring.

```js
inner({
  offset: 10,
});
```

### `onFallbackChange`

default: no-op

A callback that is invoked with a boolean when positioning should enter fallback mode. You should fallback to middleware that create standard anchor positioning when `true`.

```js
const [fallback, setFallback] = useState(false);

inner({
  onFallbackChange: setFallback,
});
```

## `useInnerOffset` Props

```js
interface UseInnerOffsetProps {
  enabled?: boolean;
  overflowRef: React.MutableRefObject<SideObject | null>;
  onChange(
    offset: number | ((offset: number) => number)
  ): void;
  scrollRef?: React.MutableRefObject<HTMLElement | null>;
}
```

### `enabled`

default: `true`

Conditionally enable/disable the Hook.

```js
useInnerOffset(context, {
  enabled: false,
});
```

### `overflowRef`

default: `undefined`

A ref containing a `SideObject`. This is used to determine the overflow of the floating element.

```js
const overflowRef = useRef({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

useInnerOffset(context, {
  overflowRef,
});
```

### `onChange`

default: no-op

A callback that is invoked with a new offset upon the `wheel` event to offset the anchoring, and thus expand the floating element's height.

```js
const [offset, setOffset] = useState(0);

const {context} = useFloating({
  middleware: [
    inner({
      // ...
      offset,
    }),
  ],
});

// ...
useInnerOffset(context, {
  onChange: setOffset,
});
```

### `scrollRef`

default: `undefined`

An optional ref containing an `HTMLElement`. This may be used as the scrolling container instead of the floating element — for instance, to position inner elements as direct children without being interfered by scrolling layout.
