# autoPlacement

Chooses the placement that has the most space available automatically.

```js
import {autoPlacement} from '@floating-ui/core';
```

```js
import {autoPlacement} from '@floating-ui/dom';
```

```js
import {autoPlacement} from '@floating-ui/react';
```

```js
import {autoPlacement} from '@floating-ui/react-dom';
```

```js
import {autoPlacement} from '@floating-ui/vue';
```

```js
import {autoPlacement} from '@floating-ui/react-native';
```

This is useful when you don't know which placement will be best for the floating element, or don't want to have to explicitly specify it.

## Usage

```js
computePosition(referenceEl, floatingEl, {
  middleware: [autoPlacement()],
});
```

```js
useFloating({
  middleware: [autoPlacement()],
});
```

```js
useFloating(reference, floating, {
  middleware: [autoPlacement()],
});
```

This is an alternative to `flip()`, so only one of either can be used. See [how they differ here](https://floating-ui.com/docs/autoPlacement#conflict-with-flip).

## Options

These are the options you can pass to `autoPlacement()`.

```ts
interface AutoPlacementOptions extends DetectOverflowOptions {
  crossAxis?: boolean;
  alignment?: Alignment | null;
  autoAlignment?: boolean;
  allowedPlacements?: Array<Placement>;
}
```

### `crossAxis`

default: `false`

Determines whether a "most space" strategy is also used for the cross axis (which runs along the alignment of the floating element). May be desirable when the `allowedPlacements` are all on the same axis.

```js
autoPlacement({
  crossAxis: true,
});
```

### `alignment`

default: `undefined`

Without options, `autoPlacement()` will choose any of the `Side` placements which fit best, i.e. `'top'`, `'right'`, `'bottom'`, or `'left'`.

By specifying an alignment, it will choose those aligned placements.

```js
autoPlacement({
  // top-start, right-start, bottom-start, left-start
  alignment: 'start',
});
```

### `autoAlignment`

default: `true`

When `alignment` is specified, this describes whether to automatically choose placements with the opposite alignment if they fit better.

```js
autoPlacement({
  alignment: 'start',
  // Won't also choose 'end' alignments if those fit better
  autoAlignment: false,
});
```

### `allowedPlacements`

default: computed subset of `allPlacements`

Describes the placements which are allowed to be chosen.

```js
autoPlacement({
  // 'right' and 'left' won't be chosen
  allowedPlacements: ['top', 'bottom'],
});
```

```js
autoPlacement({
  // Only choose these placements
  allowedPlacements: ['top-start', 'bottom-end'],
});
```

### ...detectOverflowOptions

All of [`detectOverflow`](https://floating-ui.com/docs/detectOverflow#options)'s options can be passed. For instance:

```js
autoPlacement({
  padding: 5, // 0 by default
});
```

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
autoPlacement((state) => ({
  padding: state.rects.reference.width,
}));
```

## Final placement

The placement returned is always the final one.

```js
computePosition(referenceEl, floatingEl, {
  middleware: [autoPlacement()],
}).then(({placement}) => {
  console.log(placement); // any side
});
```

```js
// placement can be any side
const {placement} = useFloating({
  middleware: [autoPlacement()],
});
```

```js
// placement can be any side
const {placement} = useFloating(reference, floating, {
  middleware: [autoPlacement()],
});
```

## Conflict with `flip()`

`flip()` and `autoPlacement()` cannot be used together inside the same middleware array; make sure you choose only one of them to use.

The reason is they both try to perform work on the placement but with opposing strategies. Therefore, they will continually try to change the result or work of the other one, leading to a reset loop.

- `flip()` uses a fallback "no space" strategy. Ensures the
preferred placement is kept unless there is no space left.
- `autoPlacement()` uses a primary "most space" strategy.
Always chooses the placement with the most space available.
