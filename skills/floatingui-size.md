# size

Provides data to change the size of a floating element.

```js
import {size} from '@floating-ui/core';
```

```js
import {size} from '@floating-ui/dom';
```

```js
import {size} from '@floating-ui/react';
```

```js
import {size} from '@floating-ui/react-dom';
```

```js
import {size} from '@floating-ui/vue';
```

```js
import {size} from '@floating-ui/react-native';
```

This is useful to ensure the floating element isn't too big to fit in the viewport (or more specifically, its clipping context), especially when a maximum size isn't specified. It also allows matching the width/height of the reference element.

## Usage

If your floating element's content cannot be resized such as in the example, you can make the floating element scrollable with `overflow: scroll` (or `auto`). Ensure your CSS is using `box-sizing: border-box`!

```js
computePosition(referenceEl, floatingEl, {
  middleware: [
    size({
      apply({availableWidth, availableHeight, elements}) {
        // Change styles
      },
    }),
  ],
});
```

```js
computePosition(referenceEl, floatingEl, {
  middleware: [
    size({
      apply({availableWidth, availableHeight, elements}) {
        // Change styles, e.g.
        Object.assign(elements.floating.style, {
          maxWidth: `${Math.max(0, availableWidth)}px`,
          maxHeight: `${Math.max(0, availableHeight)}px`,
        });
      },
    }),
  ],
});
```

```js
useFloating(reference, floating, {
  middleware: [
    size({
      apply({availableWidth, availableHeight, elements}) {
        // Change styles, e.g.
        Object.assign(elements.floating.style, {
          maxWidth: `${Math.max(0, availableWidth)}px`,
          maxHeight: `${Math.max(0, availableHeight)}px`,
        });
      },
    }),
  ],
});
```

```js
useFloating({
  middleware: [
    size({
      apply({availableHeight, elements}) {
        const value = `${Math.max(0, availableHeight)}px`;

        // 1. Assign directly:
        elements.floating.style.maxHeight = value;
        // 2. Or, use a CSS variable:
        elements.floating.style.setProperty(
          '--available-height',
          value,
        );
      },
    }),
  ],
});
```

## Options

These are the options you can pass to `size()`.

```ts
interface SizeOptions extends DetectOverflowOptions {
  apply?: (
    state: MiddlewareState & {
      availableWidth: number;
      availableHeight: number;
    },
  ) => void;
}
```

### `apply`

default: `undefined`

Unlike other middleware, in which you assign styles after `computePosition()` has done its work, `size()` has its own `apply` function to do the work during the lifecycle:

```js
size({
  apply({availableWidth, availableHeight, ...state}) {
    // Style mutations here
  },
});
```

#### `availableWidth`

Represents how wide the floating element can be before it will overflow its clipping context. You'll generally set this as the `maxWidth` CSS property.

#### `availableHeight`

Represents how tall the floating element can be before it will overflow its clipping context. You'll generally set this as the `maxHeight` CSS property.

Both properties can be negative. When applying max styles, you should clamp them above `0`.

#### ...middlewareState

See [MiddlewareState](https://floating-ui.com/docs/middleware#middlewarestate).

Many useful properties are also accessible via this callback, such as `rects` and `elements`.

### ...detectOverflowOptions

All of [`detectOverflow`](https://floating-ui.com/docs/detectOverflow#options)'s options can be passed. For instance:

```js
size({padding: 5}); // 0 by default
```

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
size((state) => ({
  padding: state.rects.reference.width,
}));
```

## Using with `flip()`

Using `size()` together with `flip()` enables some useful behavior. The floating element can be resized, thus allowing it to prefer its initial placement as much as possible, until it reaches a minimum size, at which point it will flip.

If you're using the `padding` option in either middleware, ensure they share the **same value**.

### `bestFit`

The `'bestFit'` fallback strategy in the `flip()` middleware is the default, which ensures the best fitting placement is used. In this scenario, place `size()` **after** `flip()`:

```js
const middleware = [
  flip(),
  size({
    apply({availableWidth, availableHeight}) {
      // ...
    },
  }),
];
```

This strategy ensures the floating element stays in view at all times at the most optimal size.

### `initialPlacement`

If instead, you want the initial placement to take precedence, and are setting a minimum acceptable size, place `size()` **before** `flip()`:

```js
const middleware = [
  size({
    apply({availableHeight, elements}) {
      Object.assign(elements.floating.style, {
        // Minimum acceptable height is 50px.
        // `flip` will then take over.
        maxHeight: `${Math.max(50, availableHeight)}px`,
      });
    },
  }),
  flip({
    fallbackStrategy: 'initialPlacement',
  }),
];
```

## Match reference width

A common feature of select dropdowns is that the dropdown matches the width of the reference regardless of its contents. You can also use `size()` for this, as the `Rect`s get passed in:

```js
size({
  apply({rects, elements}) {
    Object.assign(elements.floating.style, {
      minWidth: `${rects.reference.width}px`,
    });
  },
});
```

## Troubleshooting

### `maxHeight` style left on floating element

Leaving the `maxHeight` style on the floating element that's kept mounted in the DOM when closed can cause issues in certain situations where it can and should expand more.

By removing the style inside the `apply` function when the `scrollHeight` is less than the `availableHeight`, you can prevent this:

```js
elements.floating.style.maxHeight =
  availableHeight >= elements.floating.scrollHeight
    ? ''
    : `${availableHeight}px`;
```
