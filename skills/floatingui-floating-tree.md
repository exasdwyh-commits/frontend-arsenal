# FloatingTree

Provides context for nested floating elements when they are not children of each other on the DOM.

This is not necessary in all cases, except when there must be explicit communication between parent and child floating elements. It is necessary for:

- The `bubbles` option in the `useDismiss()` Hook
- [Nested virtual list navigation](https://floating-ui.com/docs/useListNavigation#virtualitemref)
- Nested floating elements that each open on hover
- Custom communication between parent and child floating elements

## Usage

The following creates an infinitely nestable `<Popover>` component. Usage of this component must be wrapped in a single `<FloatingTree>` provider:

```js
import {
  FloatingTree,
  FloatingNode,
  useFloatingNodeId,
} from '@floating-ui/react';

function Popover({children, content}) {
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe this component to the <FloatingTree> wrapper:
  const nodeId = useFloatingNodeId();

  // Pass the subscribed `nodeId` to `useFloating`:
  const {refs, floatingStyles} = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  // Wrap the rendered floating element in a `<FloatingNode>`,
  // passing in the subscribed `nodeId`:
  return (
    <>
      {cloneElement(children, {ref: refs.setReference})}
      <FloatingNode id={nodeId}>
        {isOpen && (
          <FloatingPortal>
            <div ref={refs.setFloating}>{content}</div>
          </FloatingPortal>
        )}
      </FloatingNode>
    </>
  );
}

function App() {
  return (
    <FloatingTree>
      <Popover
        content={
          <Popover content="Nested content">
            <button>Nested reference</button>
          </Popover>
        }
      >
        <button>Root reference</button>
      </Popover>
    </FloatingTree>
  );
}
```

## Hooks

- `useFloatingNodeId()` subscribes the component to the tree
context. Call this only once as it has side effects.
- `useFloatingParentNodeId()` returns the parent
`FloatingNode` id, if it exists. This will be `null` for roots (not nested).
- `useFloatingTree()` for accessing the tree object, which
includes an event emitter to communicate across the tree components (`events`).

```js
interface FloatingTreeType {
  nodesRef: React.MutableRefObject<Array<FloatingNodeType>>;
  events: FloatingEvents;
  addNode(node: FloatingNodeType): void;
  removeNode(node: FloatingNodeType): void;
}
```

## Custom parent

By default, the parent node is the closest `<FloatingNode />`, but you can specify a custom parent node by passing in the `parentId` to `useFloatingNodeId()`:

```js
const nodeId = useFloatingNodeId(parentId);
```

This is useful if you want to mark a sibling floating element in the React tree as the child of another sibling.

## `<FloatingTree>` wrapper

You can use the following technique to avoid having the consumer specify the `<FloatingTree>` wrapper:

```js
function PopoverComponent() {
  // Main logic as seen earlier
}

// This is the component the consumer uses
export function Popover(props) {
  const parentId = useFloatingParentNodeId();

  // This is a root, so we wrap it with the tree
  if (parentId === null) {
    return (
      <FloatingTree>
        <PopoverComponent {...props} />
      </FloatingTree>
    );
  }

  return <PopoverComponent {...props} />;
}
```

## Troubleshooting

Ensure that the component that you're calling `useFloatingNodeId()` is a _child_ of the `<FloatingTree>` wrapper. If it is not, then it will not be able to find the tree context.
