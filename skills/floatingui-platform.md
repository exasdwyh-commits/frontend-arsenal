import {Canvas} from '../../lib/components/Canvas';

# Platform

Use Floating UI's positioning logic on any platform that can execute JavaScript.

Floating UI's core is essentially a bunch of mathematical calculations performed on rectangles. These calculations are pure and agnostic, allowing Floating UI to work on any platform that can execute JavaScript.

To make it work with a given platform, methods are used to allow it to hook into measurement APIs, for instance, to measure the bounding box of a given element.

Possible platforms other than the DOM include React Native, Canvas/WebGL, etc.

This is Floating UI running in a pure `<canvas />` element!

Check it out on [CodeSandbox](https://codesandbox.io/s/floating-ui-canvas-platform-w7pfx3?file=/src/index.js).

## Custom platform object

If you're building a platform from scratch, e.g. your own tiny custom DOM platform, you'll be using the `@floating-ui/core` package — see [Methods](https://floating-ui.com/docs/platform#methods).

If you're extending or customizing the existing DOM methods, and are using `@floating-ui/dom`, this is accessible via the `platform` import:

```js
import {platform} from '@floating-ui/dom';

computePosition(referenceEl, floatingEl, {
  platform: {
    ...platform,
    // Overwrite the methods above with your own.
  },
});
```

## Shadow DOM fix

The spec says to hide the actual CSS `offsetParent` inside shadow DOM hierarchies, notable when using web components. This causes the position to be wrong when a positioned parent has a shadowed child floating element.

Since Chrome 109, the `offsetParent` property now matches the spec, as well as Safari and Firefox for quite some time, which causes the positioning issue.

In many cases, using the `'fixed'` strategy instead of `'absolute'` will fix this positioning issue, but in case it does not, you can add the following "ponyfill":

```bash
npm i composed-offset-position
```

```js
import {platform} from '@floating-ui/dom';
import {offsetParent} from 'composed-offset-position';

computePosition(referenceEl, floatingEl, {
  platform: {
    ...platform,
    getOffsetParent: (element) =>
      platform.getOffsetParent(element, offsetParent),
  },
});
```

There is no method that works with closed shadow roots, only open ones. [You'll need to manually return the element in `getOffsetParent`](https://github.com/floating-ui/floating-ui/issues/2955#issuecomment-2251022042) for closed shadow roots.

## Concepts

The library works largely with a `Rect`:

```js
interface Rect {
  width: number;
  height: number;
  x: number;
  y: number;
}
```

This data can come from anywhere, and the library will perform the right computations. `x` and `y` represent the coordinates of the element relative to another one.

```js
import {computePosition} from '@floating-ui/core';

computePosition(referenceElement, floatingElement, {
  platform: {
    // ...
  },
});
```

## Methods

A `platform` is a plain object consisting of 3 required and 7 optional methods. These methods allow the platform to interface with Floating UI's logic.

Each of these methods can be either async or sync. This enables support of platforms whose measurement APIs are async, like React Native.

## Required methods

### `getElementRects`

Takes in the elements and the positioning `strategy` and returns the element `Rect` objects.

```js
function getElementRects({reference, floating, strategy}) {
  return {
    reference: {width: 0, height: 0, x: 0, y: 0},
    floating: {width: 0, height: 0, x: 0, y: 0},
  };
}
```

#### `reference`

The `x` and `y` values of a reference `Rect` should be its coordinates relative to the floating element's `offsetParent` element if required rather than the viewport.

#### `floating`

Both `x` and `y` are not relevant initially, so you can set these both of these to `0`.

### `getDimensions`

Returns the dimensions of an element.

```js
function getDimensions(element) {
  return {width: 0, height: 0};
}
```

### `getClippingRect`

Returns the `Rect` (**relative to the viewport**) whose outside bounds will clip the given element. For instance, the viewport itself.

```js
function getClippingRect({element, boundary, rootBoundary}) {
  return {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };
}
```

## Optional methods

Depending on the platform you're working with, these may or may not be necessary.

### `convertOffsetParentRelativeRectToViewportRelativeRect`

This function will take a `Rect` that is relative to a given `offsetParent` element and convert its `x` and `y` values such that it is instead relative to the viewport.

```js
function convertOffsetParentRelativeRectToViewportRelativeRect({
  rect,
  offsetParent,
  strategy,
}) {
  return rect;
}
```

### `getOffsetParent`

Returns the `offsetParent` of a given element. The following four properties are what is accessed on an `offsetParent`.

```js
function getOffsetParent(element, polyfill) {
  return {
    clientWidth: 0,
    clientHeight: 0,
    clientLeft: 0,
    clientTop: 0,
  };
}
```

The `polyfill` parameter exists only for `@floating-ui/dom` and is optional to fix the [Shadow DOM bug](https://floating-ui.com/docs/platform#shadow-dom-fix).

### `getDocumentElement`

Returns the document element.

```js
function getDocumentElement(element) {
  return {};
}
```

### `getClientRects`

Returns an array of `ClientRect`s.

```js
function getClientRects(element) {
  return [];
}
```

### `isElement`

Determines if the current value is an element.

```js
function isElement(value) {
  return true;
}
```

### `isRTL`

Determines if an element is in RTL layout.

```js
function isRTL(element) {
  return false;
}
```

### `getScale`

Determines the scale of an element.

```js
function getScale(element) {
  return {x: 1, y: 1};
}
```

### `detectOverflow`

Determines how much the floating element is overflowing its clipping container.

If defined, Floating UI's middleware will call this method rather than [`detectOverflow`](https://floating-ui.com/docs/detectOverflow)

```js
function detectOverflow(state, options) {
  return {
    top: 10,
    right: 0,
    bottom: 0,
    left: 0,
  };
}
```

## Usage

All these methods are passed to `platform`:

```js
import {computePosition} from '@floating-ui/core';

computePosition(referenceEl, floatingEl, {
  platform: {
    // Required
    getElementRects,
    getDimensions,
    getClippingRect,

    // Optional
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getOffsetParent,
    getDocumentElement,
    getClientRects,
    isElement,
    isRTL,
    getScale,
    detectOverflow,
  },
});
```
