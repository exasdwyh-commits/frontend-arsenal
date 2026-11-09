# FloatingList

Provides the ability to create composable children APIs for list components

```js
import {FloatingList, useListItem} from '@floating-ui/react';
```

This is useful to prevent the need to keep track of a list item's index for [`useListNavigation`](https://floating-ui.com/docs/useListNavigation) or [`useTypeahead`](https://floating-ui.com/docs/useTypeahead).

Manually specifying an index poses problems when wrapper tags surround list items, such as with grouping.

An example of a composable children API looks like the following, where `<Select>` does not receive an array prop but rather children:

```js
<Select>
  <OptionGroup label="Fruits">
    <Option>Apple</Option>
    <Option>Strawberry</Option>
    <Option>Banana</Option>
  </OptionGroup>
  <OptionGroup label="Vegetables">
    <Option>Carrot</Option>
    <Option>Green Peas</Option>
    <Option>Cauliflower</Option>
  </OptionGroup>
</Select>
```

## Examples

- [Select with Composable Children](https://codesandbox.io/s/floating-ui-react-select-with-composable-children-qsuw76?file=/src/App.tsx)

## Usage

### `FloatingList`

This component is a context provider that receives two props:

- <WordHighlight id="a">elementsRef</WordHighlight> — `useListNavigation()`'s `listRef` prop (array of elements).
- <WordHighlight id="b">labelsRef</WordHighlight> — `useTypeahead()`'s `listRef` prop (array of strings; **optional**).

```js /elementsRef/1,2,4#a /labelsRef/1,2,4#b
const elementsRef = useRef([]);
const labelsRef = useRef([]);

const listNav = useListNavigation(context, {
  listRef: elementsRef,
});
const typeahead = useTypeahead(context, {
  listRef: labelsRef,
});

return (
  <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
    {/* floating element with list item children */}
  </FloatingList>
);
```

### `useListItem()`

This Hook is used to register a list item and its index (DOM position) in the `FloatingList`. It returns two properties:

```js {3} /ref/1,3#a /index/#b
function Option() {
  const {activeIndex} = useSelectContext();
  const {ref, index} = useListItem();

  const isActive = activeIndex === index;

  return <div ref={ref} tabIndex={isActive ? 0 : -1} />;
}
```
```js /label/
function Option({label}) {
  const {activeIndex} = useSelectContext();
  const {ref, index} = useListItem({
    label,
  });

  // ...
}
```
