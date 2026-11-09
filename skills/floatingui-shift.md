# shift

Shifts the floating element to keep it in view.

```js
import {shift} from '@floating-ui/core';
```

```js
import {shift} from '@floating-ui/dom';
```

```js
import {shift} from '@floating-ui/react';
```

```js
import {shift} from '@floating-ui/react-dom';
```

```js
import {shift} from '@floating-ui/vue';
```

```js
import {shift} from '@floating-ui/react-native';
```

This prevents the floating element from overflowing along its axis of alignment, thereby preserving the side it's placed on.

## Usage

```js
computePosition(referenceEl, floatingEl, {
  middleware: [shift()],
});
```

```js
useFloating({
  middleware: [shift()],
});
```

```js
useFloating(reference, floating, {
  middleware: [shift()],
});
```

## Options

These are the options you can pass to `shift()`.

```ts
interface ShiftOptions extends DetectOverflowOptions {
  mainAxis?: boolean;
  crossAxis?: boolean;
  limiter?: {
    fn: (state: MiddlewareState) => Coords;
    options?: any;
  };
}
```

### `mainAxis`

default: `true`

This is the main axis in which shifting is applied.

- `x`-axis for `'top'` and `'bottom'` placements
- `y`-axis for `'left'` and `'right'` placements

```js
shift({
  mainAxis: false,
});
```

### `crossAxis`

default: `false`

This is the cross axis in which shifting is applied, the opposite axis of `mainAxis`.

Enabling this can lead to the floating element **overlapping** the reference element, which may not be desired and is often replaced by the `flip()` middleware.

```js
shift({
  crossAxis: true,
});
```

### `limiter`

default: no-op

This accepts a function that **limits** the shifting done, in order to prevent detachment or "overly-eager" behavior. The behavior is to stop shifting once the opposite edges of the elements are aligned.

```js
import {shift, limitShift} from '@floating-ui/core';
```

```js
import {shift, limitShift} from '@floating-ui/dom';
```

```js
import {shift, limitShift} from '@floating-ui/react';
```

```js
import {shift, limitShift} from '@floating-ui/react-dom';
```

```js
import {shift, limitShift} from '@floating-ui/react-native';
```

```js
import {shift, limitShift} from '@floating-ui/vue';
```

```js
shift({
  limiter: limitShift(),
});
```

This function itself takes options.

#### limitShift.mainAxis

default: `true`

Whether to apply limiting on the main axis.

```js
shift({
  limiter: limitShift({
    mainAxis: false,
  }),
});
```

#### limitShift.crossAxis

default: `true`

Whether to apply limiting on the cross axis.

```js
shift({
  limiter: limitShift({
    crossAxis: false,
  }),
});
```

#### limitShift.offset

default: `0`

This will offset when the limiting starts. A positive number will start limiting earlier, while negative later.

```js
shift({
  limiter: limitShift({
    // Start limiting 5px earlier
    offset: 5,
  }),
});
```

This can also take a function, which provides the `Rect`s of each element to read their dimensions:

```js
shift({
  limiter: limitShift({
    // Start limiting by the reference's width earlier
    offset: ({rects, placement}) => rects.reference.width,
  }),
});
```

You may also pass an object to configure both axes:

```js
shift({
  limiter: limitShift({
    // object
    offset: {
      mainAxis: 10,
      crossAxis: 5,
    },
    // or a function which returns one
    offset: ({rects, placement}) => ({
      mainAxis: rects.reference.height,
      crossAxis: rects.floating.width,
    }),
  }),
});
```

### ...detectOverflowOptions

All of [`detectOverflow`](https://floating-ui.com/docs/detectOverflow#options)'s options can be passed. For instance:

```js
shift({
  padding: 5, // 0 by default
});
```

If you find the padding does not get applied on the right side, see [Handling large content](https://floating-ui.com/docs/misc#handling-large-content).

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
shift((state) => ({
  padding: state.rects.reference.width,
}));
```

## Data

The following data is available in `middlewareData.shift`:

```js
interface Data {
  x: number;
  y: number;
}
```

`x` and `y` represent how much the floating element has been shifted along that axis. The values are offsets, and therefore can be negative.
