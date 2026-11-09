# FloatingOverlay

Provides base styling for a fixed overlay element.

```js
import {FloatingOverlay} from '@floating-ui/react';
```

This is useful to dim content or block pointer events behind a floating element, in addition to locking the body scroll.

## Usage

It renders a `<div>` with base styling.

```js
function App() {
  return (
    <>
      <FloatingOverlay />
      <div>Floating element</div>
    </>
  );
}
```

## Props

```ts
interface FloatingOverlayProps {
  lockScroll?: boolean;
}
```

### `lockScroll`

Whether the `<body>` is prevented from scrolling while the overlay is rendered. Uses a robust technique that works on iOS and handles horizontal scrolling.

```js
<FloatingOverlay lockScroll>
  {/* floating element */}
</FloatingOverlay>
```

If you need a more advanced solution, [`react-remove-scroll`](https://www.npmjs.com/package/react-remove-scroll) is a great option.

## Troubleshooting

### Sibling Overlay

When using anchor positioning and the overlay in scrollable contexts, prefer making the overlay a sibling of the floating element rather than a parent container.

This will ensure the floating element does not get contained by the overlay, allowing it to be positioned out of its bounds, preventing scroll issues. It also allows the overlay to be independently animated.

```js
<>
  <FloatingOverlay />
  <div ref={refs.setFloating} />
</>
```
