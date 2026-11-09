# useRole

Adds base screen reader props to the reference and floating elements for a given `role`.

```js
import {useRole} from '@floating-ui/react';
```

This is useful to automatically apply ARIA props to the reference and floating elements to ensure they're accessible to assistive technology, including item elements if narrowly specified.

## Usage

This Hook returns ARIA attribute props.

To use it, pass it the `context` object returned from `useFloating()` or [`useFloatingRootContext`](https://floating-ui.com/docs/useInteractions#external-reference), and then feed its result into the `useInteractions()` array. The returned prop getters are then spread onto the elements for rendering.

```js {4-8} /context/
function App() {
  const {refs, floatingStyles, context} = useFloating();

  const role = useRole(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([
    role,
  ]);

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
        Floating element
      </div>
    </>
  );
}
```

## Props

```ts
interface UseRoleProps {
  enabled?: boolean;
  role?:
    // Native ARIA roles
    | 'dialog'
    | 'tooltip'
    | 'menu'
    | 'listbox'
    | 'grid'
    | 'tree'
    // Custom component roles
    | 'alertdialog'
    | 'label';
    | 'select'
    | 'combobox'
}
```

### `enabled`

default: `true`

Conditionally enable/disable the Hook.

```js
useRole(context, {
  enabled: false,
});
```

### `role`

default: `'dialog'`

The role of the floating element.

```js
useRole(context, {
  role: 'tooltip',
});
```

### Component roles

These are custom roles that are used for floating elements that more narrowly specify the type of element being rendered. This enables a more complete set of accessible props for items inside the floating element.

#### `label`

This role should be used for floating elements that act as a label for a reference element with no text/label (e.g. an icon button).

#### `alertdialog`

This role should be used when the floating element has arbitrary tabbable content that requires user action and can't be dismissed.

---

For the following two roles, the `getItemProps` prop getter should be called with `active` and `selected` boolean props when spread.

```js
const {getItemProps} = useInteractions([]);

// A given item being rendered in the list
<div
  {...getItemProps({
    active: boolean, // activeIndex === itemIndex
    selected: boolean, // selectedIndex === itemIndex
  })}
/>;
```

These props are derived from the `activeIndex` and `selectedIndex` states for the [`useListNavigation`](https://floating-ui.com/docs/useListNavigation) and [`useTypeahead`](https://floating-ui.com/docs/useTypeahead) Hooks.

#### `select`

This role should be used when the floating element contains a list of items that can be selected. Items receive ARIA props automatically.

#### `combobox`

This role should be used when the floating element contains a list of items that can be selected, and also has an input for filtering the list. Items receive ARIA props automatically.

---

### Native roles

These roles are native ARIA roles that are used for floating elements that are more generic in nature, directly accepted by the `aria-haspopup` attribute. Items inside the floating elements do not receive any roles and must be explicitly/manually specified.

#### `tooltip`

This role should be used for floating elements that add a description to the reference element they are attached to. The reference element should have its own label/text.

#### `dialog`

This is the default role, and should be used when the floating element has arbitrary tabbable content (e.g. a popover or modal dialog).

#### `menu`

This role should be used when the floating element contains a list of items that perform an action, similar to an OS menu (e.g. File > ). Items do not receive props and must be manually specified.

Explicitly specify item roles for children: a `role` of `'menuitem'`, `'menuitemcheckbox'`, or `'menuitemradio'`.

#### `listbox`

This role should be used when the floating element contains a list of items that can be selected. Items do not receive props and must be manually specified.

Explicitly specify item roles for children: a `role` of `'option'` with an `aria-selected` attribute.

If the options are inside a group, then wrapped inside a `'group'` role that is `aria-labelledby` the group heading.

For the native roles listed above, only the reference and floating element receive ARIA props -- you'll need to provide roles for the items inside the floating element manually if required, since these roles allow for a wide variety of item types.

It's recommended that you read [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/) to ensure your item elements have semantic roles and attributes, especially if you're deviating from the simple nature of the default roles and adding complex logic.
