# inline

Improves positioning for inline reference elements that span over multiple lines.

```js
import {inline} from '@floating-ui/core';
```

```js
import {inline} from '@floating-ui/dom';
```

```js
import {inline} from '@floating-ui/react';
```

```js
import {inline} from '@floating-ui/react-dom';
```

```js
import {inline} from '@floating-ui/vue';
```

```js
import {inline} from '@floating-ui/react-native';
```

This is useful for reference elements such as hyperlinks or range selections, as the default positioning using `getBoundingClientRect()` may appear "detached" when measuring over the bounding box.

In the following examples, the `placement` is `'top'`.

Without `inline()`:

With `inline()`:

## Usage

```js
computePosition(referenceEl, floatingEl, {
  middleware: [inline()],
});
```

```js
useFloating({
  middleware: [inline()],
});
```

```js
useFloating(reference, floating, {
  middleware: [inline()],
});
```

### Choosing a rect

By default, `inline()` infers which of the `ClientRect`s to choose based on the `placement`. However, you may want a different rect to be chosen.

For instance, if the user hovered over the last client rect, you likely want the floating element to be placed there. This logic is only applied when the reference element's rects are disjoined.

```js
function onMouseEnter({clientX: x, clientY: y}) {
  computePosition(referenceEl, floatingEl, {
    middleware: [inline({x, y})],
  }).then(({x, y}) => {
    // ...
  });
}

referenceEl.addEventListener('mouseenter', onMouseEnter);
```

## Order

`inline()` should generally be placed toward the beginning of your middleware array, before `flip()` (if used).

## Options

These are the options you can pass to `inline()`.

```ts
interface InlineOptions {
  x?: number;
  y?: number;
  padding?: number | SideObject;
}
```

### `x`

default: `undefined`

This is the viewport-relative (client) x-axis coordinate which can be passed in to choose a rect.

### `y`

default: `undefined`

This is the viewport-relative (client) y-axis coordinate which can be passed in to choose a rect.

### `padding`

default: `2`

This describes the padding around a disjoined rect when choosing it.

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
inline((state) => ({
  padding: state.rects.reference.width,
}));
```
