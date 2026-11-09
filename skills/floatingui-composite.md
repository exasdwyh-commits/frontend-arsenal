# Composite

Creates a single tab stop whose items are navigated by arrow keys, which provides list navigation outside of floating element contexts.

```js
import {Composite, CompositeItem} from '@floating-ui/react';
```

This is useful to enable navigation of a list of items that aren't part of a floating element. A menubar is an example of a composite, with each reference element being an item.

## Usage

```js
<Composite>
  <CompositeItem>Item 1</CompositeItem>
  <CompositeItem>Item 2</CompositeItem>
  <CompositeItem>Item 3</CompositeItem>
</Composite>
```

The `render` prop can be used to customize the rendering of the composite components. Both `Composite` and `CompositeItem` accept a JSX element:

```js
<CompositeItem render={<select />}>
  <option />
  <option />
</CompositeItem>
```

When rendering custom components, they must be **open for extension**. This means they must [forward the ref to the underlying DOM node](https://react.dev/reference/react/forwardRef), and they must spread all props passed into the component onto the node.

Or a function that returns an element to customize how the HTML props are spread/passed:

```js
<CompositeItem
  render={(htmlProps) => (
    <select {...htmlProps}>
      <option />
      <option />
    </select>
  )}
/>
```

## Props

```js
interface CompositeProps {
  render?: RenderProp;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  rtl?: boolean;
  cols?: number;
  disabledIndices?: number[];
  activeIndex?: number;
  onNavigate?(index: number): void;
  itemSizes?: Dimensions[];
  dense?: boolean;
}
```

### `render`

default: `<div />`

Determines the element to render.

```js
<Composite render={<button />} />
```

### `orientation`

default: `'both'`

Determines the orientation of the composite.

```js
<Composite orientation="horizontal" />
```

### `loop`

default: `true`

Determines whether the composite should loop around when navigating past the first or last item.

```js
<Composite loop={false} />
```

### `rtl`

default: `false`

Whether the direction of the composite's navigation is in RTL layout.

```js
<Composite rtl={true} />
```

### `cols`

default: `1`

Determines the number of columns there are in the composite (i.e. it's a grid).

```js
<Composite cols={3} />
```

### `disabledIndices`

Determines which items are disabled. The `disabled` or `aria-disabled` attributes are used by default.

```js
<Composite disabledIndices={[1]} />
```

### `activeIndex`

default: `undefined`

Determines which item is active. Used to externally control the active item.

```js
const [activeIndex, setActiveIndex] = useState(0);
return <Composite activeIndex={activeIndex} />;
```

### `onNavigate`

default: `undefined`

Called when the user navigates to a new item. Used to externally control the active item.

```js
const [activeIndex, setActiveIndex] = useState(0);
return <Composite onNavigate={setActiveIndex} />;
```

### `itemSizes`

default: `undefined`

Only for grid navigation, an array of `Dimensions` objects, which specify the width (number of columns) and height (number of rows) of each item, so the navigation algorithm can take the variable sizes into account. If not specified, every item will be treated as if it has a size of 1 row and 1 column.

```js
<Composite
  itemSizes={[
    {width: 2, height: 2},
    {width: 1, height: 3},
  ]}
/>
```

### `dense`

default: `false`

Only for grid navigation, determines if the grid positioning algorithm should follow CSS Grid's `auto-flow` `dense` algorithm.

```js
<Composite dense />
```
