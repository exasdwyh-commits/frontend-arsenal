# useTypeahead

Provides a matching callback that can be used to focus an item as the user types, used in tandem with `useListNavigation()`.

```js
import {useTypeahead} from '@floating-ui/react';
```

This is useful for creating a menu with typeahead support, where the user can type to focus an item and then immediately select it, especially if it contains a large number of items.

See [`FloatingList`](https://floating-ui.com/docs/FloatingList) for creating composable children API components.

This Hook should not be used for typeable `<input />` elements. It is intended to be used on menu buttons for a dropdown menu or select menu, rather than a combobox that is searchable.

## Usage

This Hook returns event handler props.

To use it, pass it the `context` object returned from `useFloating()` or [`useFloatingRootContext`](https://floating-ui.com/docs/useInteractions#external-reference), and then feed its result into the `useInteractions()` array. The returned prop getters are then spread onto the elements for rendering.

`useListNavigation()` is responsible for synchronizing the index for focus.

```js /context/
function App() {
  const [activeIndex, setActiveIndex] = useState(null);

  const {refs, floatingStyles, context} = useFloating({
    open: true,
  });

  const items = ['one', 'two', 'three'];

  const listRef = useRef(items);

  const typeahead = useTypeahead(context, {
    listRef,
    activeIndex,
    onMatch: setActiveIndex,
  });

  const {getReferenceProps, getFloatingProps, getItemProps} =
    useInteractions([typeahead]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        Reference element
      </div>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        {items.map((item, index) => (
          <div
            key={item}
            // Make these elements focusable using a roving tabIndex.
            tabIndex={activeIndex === index ? 0 : -1}
            {...getItemProps()}
          >
            {item}
          </div>
        ))}
      </div>
    </>
  );
}
```

## Props

```ts
interface UseTypeaheadProps {
  listRef: React.MutableRefObject<Array<string | null>>;
  activeIndex: number | null;
  onMatch?(index: number): void;
  enabled?: boolean;
  resetMs?: number;
  ignoreKeys?: Array<string>;
  selectedIndex?: number | null;
  onTypingChange?(isTyping: boolean): void;
  findMatch?:
    | null
    | ((
        list: Array<string | null>,
        typedString: string,
      ) => string | null | undefined);
}
```

### `listRef`

default: empty list

A ref which contains an array of strings whose indices match the HTML elements of the list.

```js
const listRef = useRef(['one', 'two', 'three']);

useTypeahead(context, {
  listRef,
});
```

You can derive these strings when assigning the node if the strings are not available up front:

```js
// Array<HTMLElement | null> for `useListNavigation`
const listItemsRef = useRef([]);
// Array<string | null> for `useTypeahead`
const listContentRef = useRef([]);
```

```js
<li
  ref={(node) => {
    listItemsRef.current[index] = node;
    listContentRef.current[index] = node?.textContent ?? null;
  }}
/>
```

Disabled items can be represented by `null` values in the array at the relevant index, and will be skipped.

### `activeIndex`

default: `null`

The currently active index. This specifies where the typeahead starts.

```js
const [activeIndex, setActiveIndex] = useState(null);

useTypeahead(context, {
  activeIndex,
});
```

### `onMatch`

default: no-op

Callback invoked with the matching index if found as the user types.

```js
const [isOpen, setIsOpen] = useState(false);
const [activeIndex, setActiveIndex] = useState(null);
const [selectedIndex, setSelectedIndex] = useState(null);

useTypeahead(context, {
  onMatch: isOpen ? setActiveIndex : setSelectedIndex,
});
```

### `enabled`

default: `true`

Conditionally enable/disable the Hook.

```js
useTypeahead(context, {
  enabled: false,
});
```

### `findMatch`

default: lowercase finder

If you'd like to implement custom finding logic (for example [fuzzy search](https://fusejs.io/)), you can use this callback.

```js
useTypeahead(context, {
  findMatch: (list, typedString) =>
    list.find(
      (itemString) =>
        itemString?.toLowerCase().indexOf(typedString) === 0,
    ),
});
```

### `resetMs`

default: `750`

Debounce timeout which will reset the transient string as the user types.

```js
useTypeahead(context, {
  resetMs: 500,
});
```

### `ignoreKeys`

default: `[]`

Optional keys to ignore.

```js
useTypeahead(context, {
  ignoreKeys: ['I', 'G', 'N', 'O', 'R', 'E'],
});
```

### `selectedIndex`

default: `null`

The currently selected index, if available.

```js
const [selectedIndex, setSelectedIndex] = useState(null);

useTypeahead(context, {
  selectedIndex,
});
```

### `onTypingChange`

default: no-op

Callback invoked with the typing state as the user types.

```js
useTypeahead(context, {
  onTypingChange(isTyping) {
    // ...
  },
});
```
