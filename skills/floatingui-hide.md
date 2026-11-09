# hide

A data provider that allows you to hide the floating element in applicable situations.

```js
import {hide} from '@floating-ui/core';
```

```js
import {hide} from '@floating-ui/dom';
```

```js
import {hide} from '@floating-ui/react';
```

```js
import {hide} from '@floating-ui/react-dom';
```

```js
import {hide} from '@floating-ui/vue';
```

```js
import {hide} from '@floating-ui/react-native';
```

This is useful for situations where you want to hide the floating element because it appears detached from the reference element (or attached to nothing).

In the above example, the floating element turns partially transparent once it has `escaped` the reference element's clipping context. Once the reference element is hidden, it hides itself.

## Usage

Apply a hidden visibility style to the floating element based on the data in `middlewareData.hide`:

```js
computePosition(referenceEl, floatingEl, {
  middleware: [hide()],
}).then(({middlewareData}) => {
  if (middlewareData.hide) {
    Object.assign(floatingEl.style, {
      visibility: middlewareData.hide.referenceHidden
        ? 'hidden'
        : 'visible',
    });
  }
});
```

```js /middlewareData/
const {refs, floatingStyles, middlewareData} = useFloating({
  middleware: [hide()],
});

return (
  <div
    ref={refs.setFloating}
    style={{
      ...floatingStyles,
      visibility: middlewareData.hide?.referenceHidden
        ? 'hidden'
        : 'visible',
    }}
  />
);
```

```vue /middlewareData/
<script setup>
const reference = ref(null);
const floating = ref(null);
const {floatingStyles, middlewareData} = useFloating(
  reference,
  floating,
  {
    middleware: [hide()],
  },
);
</script>

<template>
  <div ref="reference"></div>
  <div
    ref="floating"
    :style="{
      ...floatingStyles,
      visibility: middlewareData.hide?.referenceHidden
        ? 'hidden'
        : 'visible',
    }"
  ></div>
</template>
```

## Order

`hide()` should generally be placed at the end of your middleware array.

## Options

These are the options you can pass to `hide()`.

```ts
interface HideOptions extends DetectOverflowOptions {
  strategy?: 'referenceHidden' | 'escaped';
}
```

### `strategy`

default: `'referenceHidden'`

The strategy used to determine when to hide the floating element.

```js
hide({
  strategy: 'escaped', // 'referenceHidden' by default
});
```

If you'd like to use multiple strategies, call `hide()` multiple times in your middleware array with different options.

### ...detectOverflowOptions

All of [`detectOverflow`](https://floating-ui.com/docs/detectOverflow#options)'s options can be passed. For instance:

```js
hide({
  padding: 5, // 0 by default
});
```

### Deriving options from state

You can derive the options from the [middleware lifecycle state](https://floating-ui.com/docs/middleware#middlewarestate):

```js
hide((state) => ({
  padding: state.rects.reference.width,
}));
```

## Data

```ts
interface Data {
  referenceHidden?: boolean;
  referenceHiddenOffsets?: SideObject;
  escaped?: boolean;
  escapedOffsets?: SideObject;
}
```

Depending on the strategy used, these options may exist in the data object.

### `referenceHidden`

Determines whether the reference element is fully clipped, and is therefore hidden from view.

Note that “hidden” means clipping, `visibility` and `opacity` styles are not considered.

### `referenceHiddenOffsets`

A side object containing overflow offsets.

### `escaped`

Determines whether the floating element has "escaped" the reference's clipping context and appears fully detached from it.

### `escapedOffsets`

A side object containing overflow offsets.
