# detectOverflow

Detects when the floating or reference element is overflowing a clipping container or custom boundary.

```js
import {detectOverflow} from '@floating-ui/core';
```

```js
import {detectOverflow} from '@floating-ui/dom';
```

```js
import {detectOverflow} from '@floating-ui/react';
```

```js
import {detectOverflow} from '@floating-ui/react-dom';
```

```js
import {detectOverflow} from '@floating-ui/vue';
```

```js
import {detectOverflow} from '@floating-ui/react-native';
```

A clipping container (or boundary) is one that causes child elements inside it to be clipped if they overflow it. Visibility optimizer middleware use this function for **collision detection**, making it useful for your own custom middleware that do the same.

## Usage

Inside your custom middleware, make your `fn` `async` and `await` it, passing in the middleware `state`:

```js
const middleware = {
  name: 'middleware',
  async fn(state) {
    const overflow = await detectOverflow(state);
    return {};
  },
};
```

The returned value, `overflow`, is a `SideObject` containing side properties with numbers representing offsets.

- A positive number means the element is overflowing the clipping
boundary by that number of pixels.
- A negative number means the element has that number of pixels
left before it will overflow the clipping boundary.
- `0` means the side lies flush with the clipping boundary.

## Options

`detectOverflow()` takes options as a second argument.

```js
await detectOverflow(state, {
  // options
});
```

```ts
interface DetectOverflowOptions {
  boundary: Boundary;
  rootBoundary: RootBoundary;
  elementContext: ElementContext;
  altBoundary: boolean;
  padding: Padding;
}
```

### `boundary`

```ts
type Boundary =
  | 'clippingAncestors'
  | Element
  | Array<Element>
  | Rect;
```

This describes the clipping element(s) or area that overflow will be checked relative to. The default is `'clippingAncestors'`, which are the overflow ancestors which will cause the element to be clipped.

```js
await detectOverflow(state, {
  boundary: document.querySelector('#container'),
});
```

### `rootBoundary`

```ts
type RootBoundary = 'viewport' | 'layoutViewport' | 'document' | Rect;
```

This describes the root boundary that the element will be checked for overflow relative to. The default is `'viewport'`, which is the area of the page the user can see on the screen. This is the [Visual Viewport](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API) which correctly handles pinch-zooming and mobile viewports when the keyboard is open.

`'layoutViewport'` is the [Layout Viewport](https://developer.mozilla.org/en-US/docs/Glossary/Layout_viewport), which remains stable while pinch-zooming or when the mobile keyboard is open. This is useful when the floating element should stay anchored in place rather than shift around as the visual viewport changes, such as for context menus.

`'document'` is the entire page outside the viewport.

```js
await detectOverflow(state, {
  rootBoundary: 'document', // 'viewport' by default
});
```

You may also pass a `Rect` object to define a custom boundary area (relative to the viewport).

```js
await detectOverflow(state, {
  rootBoundary: {
    x: 0,
    y: 0,
    width: 250,
    height: 250,
  },
});
```

### `padding`

```ts
type Padding =
  | number
  | Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
    }>;
```

This describes the virtual padding around the boundary to check for overflow.

```js
await detectOverflow(state, {
  // 5px on all sides
  padding: 5,
  // Unspecified sides are 0
  padding: {
    top: 5,
    left: 20,
  },
});
```

### `elementContext`

```ts
type ElementContext = 'reference' | 'floating';
```

By default, the floating element is the one being checked for overflow.

But you can also change the context to `'reference'` to instead check its overflow relative to its clipping boundary.

```js
await detectOverflow(state, {
  elementContext: 'reference', // 'floating' by default
});
```

### `altBoundary`

This is a boolean value which determines whether to check the alternate `elementContext`'s boundary.

For instance, if the `elementContext` is `'floating'`, and you enable this option, then the boundary in which overflow is checked for is the `'reference'`'s boundary. This only applies if you are using the default `'clippingAncestors'` string as the `boundary`.

```js
await detectOverflow(state, {
  altBoundary: true, // false by default
});
```
