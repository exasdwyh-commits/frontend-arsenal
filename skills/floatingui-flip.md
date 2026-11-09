# flip

Changes the placement of the floating element to keep it in view.

```js
import {flip} from '@floating-ui/core';
```

```js
import {flip} from '@floating-ui/dom';
```

```js
import {flip} from '@floating-ui/react';
```

```js
import {flip} from '@floating-ui/react-dom';
```

```js
import {flip} from '@floating-ui/vue';
```

```js
import {flip} from '@floating-ui/react-native';
```

This prevents the floating element from overflowing along its side axis by flipping it to the opposite side by default.

## Usage

```js
computePosition(referenceEl, floatingEl, {
  middleware: [flip()],
});
```

```js
useFloating({
  middleware: [flip()],
});
```

```js
useFloating(reference, floating, {
  middleware: [flip()],
});
```

This is an alternative to `autoPlacement()`, so only one of either can be used. See [how they differ here](https://floating-ui.com/docs/flip#conflict-with-autoplacement).

## Options

These are the options you can pass to `flip()`.

```ts
interface FlipOptions extends DetectOverflowOptions {
  mainAxis?: boolean;
  crossAxis?: boolean | 'alignment';
  fallbackAxisSideDirection?: 'none' | 'start' | 'end';
  flipAlignment?: boolean;
  fallbackPlacements?: Array<Placement>;
  fallbackStrategy?: 'bestFit' | 'initialPlacement';
}
```

### `mainAxis`

default: `true`

This is the main axis in which overflow is checked to perform a flip. By disabling this, it will ignore overflow.

- `y`-axis for `'top'` and `'bottom'` placements
- `x`-axis for `'left'` and `'right'` placements

```js
flip({
  mainAxis: false,
});
```

### `crossAxis`

default: `true`

This is the cross axis in which overflow is checked to perform a flip, the axis perpendicular to `mainAxis`. By disabling this, it will ignore overflow.

```js
flip({
  crossAxis: false,
});
```

### `fallbackAxisSideDirection`

default: `'none'`

Whether to allow fallback to the opposite axis if no placements along the preferred placement axis fit, and if so, which side direction along that axis to choose. If necessary, it will fallback to the other direction.

- `'none'` signals that no fallback to the opposite axis
should take place.
- `'start'` represents `'top'` or `'left'`.
- `'end'` represents `'bottom'` or `'right'`.

In RTL writing direction, the x-axis directions are reversed.

For instance, by default, if the initial `placement` is set to `'right'`, then the placements to try (in order) are:

`['right', 'left']`

On a narrow viewport, it's possible or even likely that _neither_ of these will fit.

By specifying a string other than `'none'`, you allow placements along the perpendicular axis of the initial placement to be tried. The direction determines which side of placement is tried first:

```js
flip({
  fallbackAxisSideDirection: 'start',
});
```

The above results in: `['right', 'left', 'top', 'bottom']`.

```js
flip({
  fallbackAxisSideDirection: 'end',
});
```

The above results in: `['right', 'left', 'bottom', 'top']`.

As an example, if you'd like a tooltip that has a placement of `'right'` to be placed on top on mobile (assuming it doesn't fit), then you'd use `'start'`. For an interactive popover, you likely want to use `'end'` so it's placed on the bottom, closer to the user's fingers.

In each of the following demos, the `placement` is `'right'`.

Check [combining with `shift`](https://floating-ui.com/docs/flip#combining-with-shift) when using this option.

### `flipAlignment`

default: `true`

When an alignment is specified, e.g. `'top-start'` instead of just `'top'`, this will flip to `'top-end'` if `start` doesn't fit.

```js
flip({
  flipAlignment: false,
});
```

When using this with the `shift()` middleware, ensure `flip()` is placed **before** `shift()` in your middleware array. This ensures the `flipAlignment` logic can act before `shift()`'s does.

### `fallbackPlacements`

default: `[oppositePlacement]`

This describes an **explicit** array of placements to try if the initial `placement` doesn't fit on the axes in which overflow is checked.

```js
flip({
  fallbackPlacements: ['right', 'bottom'],
});
```

In the above example, if `placement` is set to `'top'`, then the placements to try (in order) are:

`['top', 'right', 'bottom']`

The options `flipAlignment` and `fallbackAxisSideDirection` no longer have an effect if this option is explicitly specified, as they are only shortcuts to create a computed list of fallback placements. To ensure your explicit list is preferred, they will be ignored.

Check [combining with `shift`](https://floating-ui.com/docs/flip#combining-with-shift) when using this option.

### `fallbackStrategy`

default: `'bestFit'`

When no placements fit, then you'll want to decide what happens. `'bestFit'` will use the placement which fits best on the checked axes. `'initialPlacement'` will use the initial `placement` specified.

```js
flip({
  fallbackStrategy: 'initialPlacement',
});
```

### ...detectOverflowOptions

All of [`detectOverflow`](https://floating-ui.com/docs/detectOverflow#options)'s options can be passed. For instance:

```js
flip({
  padding: 5, // 0 by default
});
```

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
flip((state) => ({
  padding: state.rects.reference.width,
}));
```

## Final placement

The placement returned from the function is always the final one, not necessarily the one you passed in as the "preferred" one.

```js
computePosition(referenceEl, floatingEl, {
  placement: 'bottom',
  middleware: [flip()],
}).then(({placement}) => {
  console.log(placement); // 'top' or 'bottom'
});
```

```js
// placement can be 'top' or 'bottom'
const {placement} = useFloating({
  placement: 'bottom',
  middleware: [flip()],
});
```

```js
// placement can be 'top' or 'bottom'
const {placement} = useFloating(reference, floating, {
  placement: 'bottom',
  middleware: [flip()],
});
```

## Combining with `shift()`

When using `flip()` with `shift()` together, the recommended configuration is as follows:

```js
const middleware = [offset(5)];
const flipMiddleware = flip({
  // Ensure we flip to the perpendicular axis if it doesn't fit
  // on narrow viewports.
  crossAxis: 'alignment',
  fallbackAxisSideDirection: 'end', // or 'start'
});
const shiftMiddleware = shift();

// Prioritize flip over shift for edge-aligned placements only.
if (placement.includes('-')) {
  middleware.push(flipMiddleware, shiftMiddleware);
} else {
  middleware.push(shiftMiddleware, flipMiddleware);
}
```

This results in the most expected positioning when using both middleware regardless of the placement used.

## Conflict with `autoPlacement()`

`flip()` and `autoPlacement()` cannot be used together inside the same middleware array; make sure you choose only one of them to use.

The reason is they both try to perform work on the placement but with opposing strategies. Therefore, they will continually try to change the result or work of the other one, leading to a reset loop.

- `flip()` uses a fallback "no space" strategy. Ensures the
preferred placement is kept unless there is no space left.
- `autoPlacement()` uses a primary "most space" strategy.
Always chooses the placement with the most space available.
