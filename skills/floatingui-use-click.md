# useClick

Opens or closes the floating element when clicking the reference element.

```js
import {useClick} from '@floating-ui/react';
```

## Usage

This Hook returns event handler props.

To use it, pass it the `context` object returned from `useFloating()` or [`useFloatingRootContext`](https://floating-ui.com/docs/useInteractions#external-reference), and then feed its result into the `useInteractions()` array. The returned prop getters are then spread onto the elements for rendering.

```js {9-13} /context/
function App() {
  const [isOpen, setIsOpen] = useState(false);

  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([
    click,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        Reference element
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          Floating element
        </div>
      )}
    </>
  );
}
```

## Props

```ts
interface UseClickProps {
  enabled?: boolean;
  event?: 'click' | 'mousedown';
  toggle?: boolean;
  ignoreMouse?: boolean;
  keyboardHandlers?: boolean;
  stickIfOpen?: boolean;
}
```

### `enabled`

default: `true`

Conditionally enable/disable the Hook.

```js
useClick(context, {
  enabled: false,
});
```

### `event`

default: `'click'`

The type of event to use to determine a "click" with mouse input. Keyboard clicks work as normal.

```js
useClick(context, {
  event: 'mousedown',
});
```

### `toggle`

default: `true`

Whether to toggle the open state with repeated clicks.

```js
useClick(context, {
  toggle: false,
});
```

### `ignoreMouse`

default: `false`

Whether to ignore the logic for mouse input (for example, if `useHover()` is also being used).

```js
useClick(context, {
  ignoreMouse: true,
});
```

### `keyboardHandlers`

default: `true`

Whether to add keyboard handlers (`Enter` and `Space` key functionality) for non-button elements (to open/close the floating element via keyboard "click").

```js
useClick(context, {
  keyboardHandlers: false,
});
```

### `stickIfOpen`

default: `true`

If already open from another event such as the `useHover()` Hook, determines whether to keep the floating element open when clicking the reference element for the first time.

```js
useClick(context, {
  stickIfOpen: false,
});
```
