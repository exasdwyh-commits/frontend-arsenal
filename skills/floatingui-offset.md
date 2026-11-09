# offset

Translates the floating element along the specified axes.

```js
import {offset} from '@floating-ui/core';
```

```js
import {offset} from '@floating-ui/dom';
```

```js
import {offset} from '@floating-ui/react';
```

```js
import {offset} from '@floating-ui/react-dom';
```

```js
import {offset} from '@floating-ui/vue';
```

```js
import {offset} from '@floating-ui/react-native';
```

This lets you add distance (margin or spacing) between the reference and floating element, slightly alter the placement, or even create [custom placements](https://floating-ui.com/docs/offset#creating-custom-placements).

0px 10px

## Usage

```js
computePosition(referenceEl, floatingEl, {
  middleware: [offset(10)],
});
```

```js
useFloating({
  middleware: [offset(10)],
});
```

```js
useFloating(reference, floating, {
  middleware: [offset(10)],
});
```

The value(s) passed are [logical](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties), meaning their effect on the physical result is dependent on the placement, writing direction (e.g. RTL), or alignment.

## Order

`offset()` should generally be placed at the beginning of your middleware array.

## Options

These are the options you can pass to `offset()`.

```ts
type Options =
  | number
  | {
      mainAxis?: number;
      crossAxis?: number;
      alignmentAxis?: number | null;
    };
```

A number represents the distance (gutter or margin) between the floating element and the reference element. This is shorthand for `mainAxis`.

```js
offset(10);
```

An object can also be passed, which enables you to individually configure each axis.

### `mainAxis`

default: `0`

The axis that runs along the side of the floating element. Represents the distance (gutter or margin) between the floating element and the reference element.

```js
offset({
  mainAxis: 10,
});
```

Here's how it looks on the four sides:

top bottom left right

### `crossAxis`

default: `0`

The axis that runs along the alignment of the floating element. Represents the skidding between the floating element and the reference element.

```js
offset({
  crossAxis: 20,
});
```

Here's how it looks on the four sides:

top bottom left right

### `alignmentAxis`

default: `null`

The same axis as `crossAxis` but applies only to aligned placements and inverts the `end` alignment. When set to a number, it overrides the `crossAxis` value.

A positive number will move the floating element in the direction of the opposite edge to the one that is aligned, while a negative number the reverse.

```js
offset({
  alignmentAxis: 20,
});
```

Here's how it differentiates from `crossAxis`:

top-start <br />{' '} top-end <br />{' '} top-start <br />{' '} top-end <br />{' '}

## Creating custom placements

While you can only choose 12 different placements as part of the core library, you can use the `offset()` middleware to create **any** placement you want.

For example, although the library doesn't provide a placement for centering on both axes, offset enables this via the function option by allowing you to read the rects:

```js
computePosition(referenceEl, floatingEl, {
  middleware: [
    // Assumes placement is 'bottom' (the default)
    offset(({rects}) => {
      return (
        -rects.reference.height / 2 - rects.floating.height / 2
      );
    }),
  ],
});
```

```js
useFloating({
  middleware: [
    // Assumes placement is 'bottom' (the default)
    offset(({rects}) => {
      return (
        -rects.reference.height / 2 - rects.floating.height / 2
      );
    }),
  ],
});
```

```js
useFloating(reference, floating, {
  middleware: [
    // Assumes placement is 'bottom' (the default)
    offset(({rects}) => {
      return (
        -rects.reference.height / 2 - rects.floating.height / 2
      );
    }),
  ],
});
```

-rects.reference.height / 2 - rects.floating.height / 2, }, ]}
    >
10px

In this case, the function option starts from the default bottom placement, then using that starting point, returns an offset to center the floating element on both axes.

A diagonal placement is also possible:

```js
computePosition(referenceEl, floatingEl, {
  placement: 'top-start',
  middleware: [
    offset(({rects}) => ({
      alignmentAxis: -rects.floating.width,
    })),
  ],
});
```

```js
useFloating({
  placement: 'top-start',
  middleware: [
    offset(({rects}) => ({
      alignmentAxis: -rects.floating.width,
    })),
  ],
});
```

```js
useFloating(reference, floating, {
  placement: 'top-start',
  middleware: [
    offset(({rects}) => ({
      alignmentAxis: -rects.floating.width,
    })),
  ],
});
```

This time, `'top-start'` was used as the starting point.

So, it's straightforward to allow this:

```js
computePosition(referenceEl, floatingEl, {
  placement: 'center',
});
```

With a wrapper, like this:

```js
import {computePosition as base, offset} from '@floating-ui/dom';

const centerOffset = offset(({rects}) => {
  return -rects.reference.height / 2 - rects.floating.height / 2;
});

export function computePosition(
  referenceEl,
  floatingEl,
  options,
) {
  const isCentered = options.placement === 'center';
  const placement = isCentered ? 'bottom' : options.placement;
  const middleware = [
    isCentered && centerOffset,
    ...(options.middleware || []),
  ];

  return base(referenceEl, floatingEl, {
    ...options,
    placement,
    middleware,
  });
}
```

What about centering on the screen? You don't need Floating UI to do that 😀 — pure CSS works fine. You only need Floating UI if you want to center over a particular element, not the whole screen.
