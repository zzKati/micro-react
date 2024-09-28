let nextUnitOfWork: fiber | null = null

function wookLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (!shouldYield && nextUnitOfWork) {
    performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(wookLoop)
}

requestIdleCallback(wookLoop)

function performUnitOfWork(fiber: fiber): fiber {
  if (!fiber.dom) {
    // 为当前fiber创建dom
    fiber.dom = createDom(fiber)
  }
  if (fiber.parent) {
    // 将 dom 将入到 parent中
    fiber.parent.dom!.appendChild(fiber.dom!)
  }

  // 为 children创建fiber
  const elements = fiber.props.children
  let index = 0
  let prevSilibing: fiber | null = null
  while (index < elements.length) {
    const element = elements[index]

    const newFiber: fiber = {
      type: element.type,
      props: element.props,
      dom: null,
      parent: fiber,
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSilibing!.sibling = newFiber
    }

    prevSilibing = newFiber
    index++
  }

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = fiber.parent!
  }
}

function createDom(element: fiber): HTMLElement {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)

  const isProerty = (key: string) => key !== "children"

  Object.keys(element.props)
    .filter(isProerty)
    // @ts-ignore
    .forEach(name => (dom[name] = element.props[name]))

  return dom
}

export function render(element: virtualDom | textDom, container: HTMLElement) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

export function createElement(
  type: elementType,
  props?: props | null,
  ...children: childrenType
): virtualDom {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  }
}

function createTextElement(text: string): textDom {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  }
}
