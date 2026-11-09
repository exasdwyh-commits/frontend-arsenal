# arrow

Provides positioning data for an arrow element (triangle or caret) inside the floating element, such that it appears to be pointing toward the center of the reference element.

```js
import {arrow} from '@floating-ui/core';
```

```js
import {arrow} from '@floating-ui/dom';
```

```js
import {arrow} from '@floating-ui/react';
```

```js
import {arrow} from '@floating-ui/react-dom';
```

```js
import {arrow} from '@floating-ui/vue';
```

```js
import {arrow} from '@floating-ui/react-native';
```

This is useful to add an additional visual cue to the floating element about which element it is referring to.

The [`FloatingArrow`](https://floating-ui.com/docs/FloatingArrow) component renders out a customizable arrow element and applies the positioning styles for you.

## Usage

The layout box of the arrow element should be a square with equal width and height. Inner or pseudo-elements may have a different aspect ratio.

Given an arrow element inside your floating element:

```html
<div>
  Floating element
  <div id="arrow"></div>
</div>
```

```css
#arrow {
  position: absolute;
}
```

Pass the <WordHighlight id='a'>element</WordHighlight> to the `arrow()` middleware and assign the dynamic styles using the coordinates data available in `middlewareData.arrow`:

```js /arrowEl/#a
const arrowEl = document.querySelector('#arrow');

computePosition(referenceEl, floatingEl, {
  middleware: [arrow({element: arrowEl})],
}).then(({middlewareData}) => {
  if (middlewareData.arrow) {
    const {x, y} = middlewareData.arrow;

    Object.assign(arrowEl.style, {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
    });
  }
});
```

```js /middlewareData.arrow/ /arrowRef/#a
const arrowRef = useRef(null);

const {refs, floatingStyles, middlewareData} = useFloating({
  middleware: [
    arrow({
      element: arrowRef,
    }),
  ],
});

return (
  <div ref={refs.setFloating} style={floatingStyles}>
    <div
      ref={arrowRef}
      style={{
        position: 'absolute',
        left: middlewareData.arrow?.x,
        top: middlewareData.arrow?.y,
      }}
    />
  </div>
);
```

```vue {24-34} /middlewareData.arrow/ /floatingArrow/#a
<script setup>
import {arrow, useFloating} from '@floating-ui/vue';
import {ref} from 'vue';

const reference = ref(null);
const floating = ref(null);
const floatingArrow = ref(null);

const {floatingStyles, middlewareData} = useFloating(
  reference,
  floating,
  {
    middleware: [arrow({element: floatingArrow})],
  },
);
</script>

<template>
  <span ref="reference">Reference</span>
  <div ref="floating" :style="floatingStyles">
    Floating
    <div
      ref="floatingArrow"
      :style="{
        position: 'absolute',
        left:
          middlewareData.arrow?.x != null
            ? `${middlewareData.arrow.x}px`
            : '',
        top:
          middlewareData.arrow?.y != null
            ? `${middlewareData.arrow.y}px`
            : '',
      }"
    ></div>
  </div>
</template>
```

Unlike the floating element, which has both coordinates defined at all times, the arrow only has one defined. Due to this, either `x` or `y` will be `undefined`, depending on the side of placement.

The above code uses `!=` to check for `null` and `undefined` **simultaneously**. Don't remove `!= null`, because either value can be falsy (`0`), causing a bug!

This middleware is designed only to position the arrow on one axis (`x` for `'top'` or `'bottom'` placements). The other axis is considered "static", which means it does not need to be positioned dynamically.

You may however want to position **both** axes statically in the following scenario:

- The reference element is either wider or taller than the
floating element;
- The floating element is using an edge alignment
(`-start` or `-end` placement).

## Visualization

To help you understand how this middleware works, here is a [visualization tutorial on CodeSandbox](https://codesandbox.io/s/mystifying-kare-ee3hmh?file=/src/index.js).

## Order

`arrow()` should generally be placed toward the end of your middleware array, after `shift()` or `autoPlacement()` (if used).

## Placement

To know which side the floating element is actually placed at for the static axis offset of the arrow, the placement is returned:

```js
computePosition(referenceEl, floatingEl, {
  placement: 'top',
  middleware: [flip(), arrow({element: arrowEl})],
}).then((data) => {
  // The final placement can be 'bottom' or 'top'
  const placement = data.placement;
});
```

```js
// The final placement can be 'bottom' or 'top'
const {placement} = useFloating({
  placement: 'top',
  middleware: [flip(), arrow({element: arrowRef})],
});
```

```js
// The final placement can be 'bottom' or 'top'
const {placement} = useFloating(reference, floating, {
  placement: 'top',
  middleware: [flip(), arrow({element: arrowRef})],
});
```

## Options

These are the options you can pass to `arrow()`.

```ts
interface ArrowOptions {
  element: Element;
  padding?: Padding;
}
```

```ts
interface ArrowOptions {
  element:
    | Element
    | null
    | React.MutableRefObject<Element | null>;
  padding?: Padding;
}
```

```ts
interface ArrowOptions {
  element: MaybeReadonlyRef<MaybeElement<Element>>;
  padding?: Padding;
}
```

### `element`

default: `undefined`

This is the arrow element to be positioned, which must be a child of the floating element.

```js
arrow({
  element: document.querySelector('#arrow'),
});
```

This can either be a reactive element:

```js
const [arrowEl, setArrowEl] = useState(null);
```

```js
arrow({
  element: arrowEl,
});
```

```js
return (
  <div ref={refs.setFloating}>
    <div ref={setArrowEl} />
  </div>
);
```

Or a non-reactive ref:

```js
const arrowRef = useRef(null);
```

```js
arrow({
  element: arrowRef,
});
```

```js
return (
  <div ref={refs.setFloating}>
    <div ref={arrowRef} />
  </div>
);
```

```vue /floatingArrow/
<script setup>
const reference = ref(null);
const floating = ref(null);
const floatingArrow = ref(null);

const {floatingStyles} = useFloating(reference, floating, {
  mdidleware: [arrow({element: floatingArrow})],
});
</script>

<template>
  <div ref="floating" :style="floatingStyles">
    <div ref="floatingArrow"></div>
  </div>
</template>
```

### `padding`

default: `0`

This describes the padding between the arrow and the edges of the floating element. If your floating element has `border-radius`, this will prevent it from overflowing the corners.

```js
arrow({
  padding: 5, // stop 5px from the edges of the floating element
});
```

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
arrow((state) => ({
  padding: state.rects.reference.width,
}));
```

## Data

The following data is available in `middlewareData.arrow`:

```ts
interface Data {
  x?: number;
  y?: number;
  centerOffset: number;
}
```

### `x`

This property exists if the arrow should be offset on the x-axis.

### `y`

This property exists if the arrow should be offset on the y-axis.

### `centerOffset`

This property describes where the arrow actually is relative to where it could be if it were allowed to overflow the floating element in order to stay centered to the reference element.

This enables two useful things:

- You can hide the arrow if it can't stay centered to the
reference, i.e. `centerOffset !== 0`.
- You can interpolate the shape of the arrow (e.g. skew it) so it
stays centered as best as possible.
