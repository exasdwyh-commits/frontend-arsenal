# useFocus

Opens the floating element while the reference element has focus, like CSS `:focus`.

```js
import {useFocus} from '@floating-ui/react';
```

To manage focus within the floating element itself, use [`FloatingFocusManager`](https://floating-ui.com/docs/FloatingFocusManager).

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

  const focus = useFocus(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([
    focus,
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
interface UseFocusProps {
  enabled?: boolean;
  visibleOnly?: boolean;
}
```

### `enabled`

default: `true`

Conditionally enable/disable the Hook.

```js
useFocus(context, {
  enabled: false,
});
```

### `visibleOnly`

default: `true`

Whether the open state only changes if the `focus` event is considered visible (`:focus-visible` CSS selector).

```js
useFocus(context, {
  visibleOnly: false,
});
```
