# Virtual Elements

Position a floating element relative to a custom reference area, useful for context menus, range selections, following the cursor, and more.

## Usage

The most basic virtual element is a plain object that has a `getBoundingClientRect` method, which mimics a real element's one:

```js
// A virtual element that is 20 x 20 px starting from (0, 0)
const virtualEl = {
  getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 20,
      right: 20,
      width: 20,
      height: 20,
    };
  },
};
```

```js
computePosition(virtualEl, floatingEl);
```

```js
useFloating({
  elements: {
    reference: virtualEl,
  },
});
```

```js
const reference = ref(virtualEl);
const floating = ref(null);
useFloating(reference, floating);
```

The `refs.setPositionReference()` method can be used to set the virtual element. This is separate from the DOM reference that receives events.

A point reference, such as a mouse event, is one such use case:

```js
function onClick({clientX, clientY}) {
  const virtualEl = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      };
    },
  };

  computePosition(virtualEl, floatingEl).then(({x, y}) => {
    // Position the floating element relative to the click
  });
}

document.addEventListener('click', onClick);
```

```js
const {refs} = useFloating();

return (
  <div
    onClick={({clientX, clientY}) => {
      refs.setPositionReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            top: clientY,
            left: clientX,
            right: clientX,
            bottom: clientY,
          };
        },
      });
    }}
  />
);
```

```js
const [virtualEl, setVirtualEl] = useState(null);

useFloating({
  elements: {
    reference: virtualEl,
  },
});

return (
  <div
    onClick={({clientX, clientY}) => {
      setVirtualEl({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            top: clientY,
            left: clientX,
            right: clientX,
            bottom: clientY,
          };
        },
      });
    }}
  />
);
```

```vue
<script setup>
import {ref} from 'vue';
import {useFloating} from '@floating-ui/vue';

const reference = ref(null);
const floating = ref(null);
const {floatingStyles} = useFloating(reference, floating);

function handleClick({clientX, clientY}) {
  reference.value = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: clientX,
        y: clientY,
        top: clientY,
        left: clientX,
        right: clientX,
        bottom: clientY,
      };
    },
  };
}
</script>

<template>
  <button @click="handleClick">Button</button>
  <div ref="floating" :style="floatingStyles" v-if="reference">
    Tooltip
  </div>
</template>
```

## `contextElement`

This property is useful if your `getBoundingClientRect` method is derived from a real element, to ensure clipping and position update detection works as expected.

```js
const virtualEl = {
  getBoundingClientRect() {
    return {
      // ...
    };
  },
  contextElement: document.querySelector('#context'),
};
```

## `getClientRects`

This property is useful when using range selections and the [`inline`](https://floating-ui.com/docs/inline) middleware.

```js
const virtualEl = {
  getBoundingClientRect: () => range.getBoundingClientRect(),
  getClientRects: () => range.getClientRects(),
};
```
