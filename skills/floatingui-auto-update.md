# autoUpdate

Automatically updates the position of the floating element when necessary to ensure it stays anchored.

This is a DOM API and is therefore not available for `@floating-ui/core`. If you are not using that package, change your package with the red package switcher at the top of the page.

This is a DOM API and is therefore not available for `@floating-ui/react-native`. If you are not using that package, change your package with the red package switcher at the top of the page.

```js
import {autoUpdate} from '@floating-ui/dom';
```

```js
import {autoUpdate} from '@floating-ui/react';
```

```js
import {autoUpdate} from '@floating-ui/react-dom';
```

```js
import {autoUpdate} from '@floating-ui/vue';
```

To ensure the floating element remains anchored to its reference element, such as when scrolling and resizing the screen, its position needs to be continually updated when necessary.

To solve this, `autoUpdate()` adds listeners that will automatically call an update function which invokes `computePosition()` when necessary. Updates typically take only ~1ms.

## Usage

It's important that this function is only called/set-up when the floating element is open on the screen, and cleaned up when it's removed. Otherwise, it can cause severe performance degradation, especially with many floating elements being created.

If you're conditionally rendering the floating element (recommended), use the `whileElementsMounted` option:

```js
useFloating({
  whileElementsMounted: autoUpdate,
});
```

`whileElementsMounted` automatically handles calling and cleaning up `autoUpdate` based on the presence of the reference and floating element.

Alternatively, if you've hidden the floating element with CSS (based on an `isOpen` state), use an Effect to handle it instead:

```js
const [isOpen, setIsOpen] = useState(false);
const {update, refs, elements} = useFloating();

useEffect(() => {
  if (isOpen && elements.reference && elements.floating) {
    const cleanup = autoUpdate(
      elements.reference,
      elements.floating,
      update,
    );
    return cleanup;
  }
}, [isOpen, elements, update]);

return (
  <div
    ref={refs.setFloating}
    style={{display: isOpen ? 'block' : 'none'}}
  />
);
```

### Conditional rendering

If you're conditionally rendering the floating element with `v-if` (recommended), use the `whileElementsMounted` option:

```js
useFloating(reference, floating, {
  whileElementsMounted: autoUpdate,
});
```

`whileElementsMounted` automatically handles calling and cleaning up `autoUpdate` based on the presence of the reference and floating element.

### CSS

Alternatively, if you've hidden the floating element with CSS such as `v-show` using an open state, manually handle invocation and clean up. The composable returns an update method and `autoUpdate` a cleanup function:

```js
const {update} = useFloating(reference, floating);
```

You can watch the open state and handle the lifecycle:

```js
const cleanup = autoUpdate(
  reference.value,
  floating.value,
  update,
);
```

Call `autoUpdate()` **only** when the floating element is open or mounted:

```js
// This function will get called repeatedly.
function updatePosition() {
  computePosition(referenceEl, floatingEl).then(({x, y}) => {
    // ...
  });
}

// Mount the floating element to the DOM, such as on hover
// or click.
document.body.append(floatingEl);
// Start auto updates.
const cleanup = autoUpdate(
  referenceEl,
  floatingEl,
  updatePosition,
);
```

Then, when the user unhovers or clicks away, unmount the floating element and ensure you call the **cleanup** function to stop the auto updates:

```js
// Remove the floating element from the DOM, such as on blur
// or outside click.
floatingEl.remove();
// Stop auto updates.
cleanup();
```

## Options

These are the options you can pass as a fourth argument to `autoUpdate()`.

```ts
interface AutoUpdateOptions {
  ancestorScroll?: boolean;
  ancestorResize?: boolean;
  elementResize?: boolean;
  layoutShift?: boolean;
  animationFrame?: boolean;
}
```

### `ancestorScroll`

default: `true`

Whether to update the position when an overflow ancestor is scrolled.

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  ancestorScroll: false,
});
```

```js
useFloating({
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      ancestorScroll: false,
    });
    return cleanup;
  },
});
```

```js
useFloating(reference, floating, {
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      ancestorScroll: false,
    });
    return cleanup;
  },
});
```

### `ancestorResize`

default: `true`

Whether to update the position when an overflow ancestor is resized. This uses the `resize` event.

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  ancestorResize: false,
});
```

```js
useFloating({
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      ancestorResize: false,
    });
    return cleanup;
  },
});
```

```js
useFloating(reference, floating, {
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      ancestorResize: false,
    });
    return cleanup;
  },
});
```

### `elementResize`

default: `true`

Whether to update the position when either the reference or floating elements resized. This uses a `ResizeObserver`.

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  elementResize: false,
});
```

```js
useFloating({
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      elementResize: false,
    });
    return cleanup;
  },
});
```

```js
useFloating(reference, floating, {
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      elementResize: false,
    });
    return cleanup;
  },
});
```

To support old browsers, polyfill `ResizeObserver`, or update manually when the elements resize.

### `layoutShift`

default: `true`

Whether to update the position of the floating element if the reference element moved on the screen as the result of layout shift.

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  layoutShift: false,
});
```

```js
useFloating({
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      layoutShift: false,
    });
    return cleanup;
  },
});
```

```js
useFloating(reference, floating, {
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      layoutShift: false,
    });
    return cleanup;
  },
});
```

To support old browsers, polyfill `IntersectionObserver`, or update manually when the reference element moves.

### `animationFrame`

default: `false`

Whether to update the position of the floating element on every animation frame if required. While optimized for performance, it should be used sparingly in the following cases:

- The reference element is animating on the screen with
`transform`s.
- Ensure a nested floating element is anchored when it's outside
of ancestor floating elements' scrolling contexts.

```js
const cleanup = autoUpdate(referenceEl, floatingEl, update, {
  animationFrame: true,
});
```

```js
useFloating({
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      animationFrame: true,
    });
    return cleanup;
  },
});
```

```js
useFloating(reference, floating, {
  whileElementsMounted(referenceEl, floatingEl, update) {
    const cleanup = autoUpdate(referenceEl, floatingEl, update, {
      animationFrame: true,
    });
    return cleanup;
  },
});
```
