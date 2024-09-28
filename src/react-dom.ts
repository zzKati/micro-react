let nextUnitOfWork: fiber | null = null
let wipRoot: fiber | null = null
let currentRoot: fiber | null = null
let deletions: fiber[] = []

function wookLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(wookLoop)
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot!)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber: fiber) {
  if (!fiber) return
  const parentDom = fiber?.parent?.dom
  if (parentDom && fiber.effectTag === "DELETION") {
    parentDom.removeChild(fiber.dom!)
  } else if (parentDom && fiber.effectTag === "PLACEMENT") {
    parentDom.appendChild(fiber.dom!)
  } else if (parentDom && fiber.effectTag === "UPDATE") {
    updateDom(fiber.dom!, fiber.props, fiber.alternate!.props)
  }

  if (fiber.child) {
    commitWork(fiber.child)
  }
  if (fiber.sibling) {
    commitWork(fiber.sibling)
  }
}

const isEvent = (key: string) => key.startsWith("on")
const isProerty = (key: string) => key !== "children" && !isEvent(key)

function updateDom(
  dom: HTMLElement,
  prevProps: virtualDomProps,
  nextProps: virtualDomProps
) {
  // 删除用不到的props
  Object.keys(prevProps)
    .filter(isProerty)
    .filter(prevprop => !(prevprop in nextProps))
    // @ts-ignore
    .forEach(name => (dom[name] = ""))

  // 添加新增的
  Object.keys(nextProps)
    .filter(isProerty)
    .filter(nextprop => !(nextprop in prevProps))
    // @ts-ignore
    .forEach(name => (dom[name] = nextProps[name]))

  // 移除事件监听
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      prevprop =>
        // @ts-ignore
        !(prevprop in nextProps) || prevProps[prevprop] !== nextProps[prevprop]
    )
    .forEach(name => {
      const eventName = name.toLowerCase().substring(2)
      // @ts-ignore
      dom.removeEventListener(eventName, prevProps[name])
    })

  // 新增事件监听
  Object.keys(nextProps)
    .filter(isEvent)
    // @ts-ignore
    .filter(nextprop => prevProps[nextprop] !== nextProps[nextprop])
    .forEach(name => {
      const eventName = name.toLowerCase().substring(2)
      // @ts-ignore
      dom.addEventListener(eventName, nextProps[name])
    })
}

requestIdleCallback(wookLoop)

function performUnitOfWork(fiber: fiber): fiber | null {
  if (!fiber.dom) {
    // 为当前fiber创建dom
    fiber.dom = createDom(fiber)
  }

  // 为 children创建fiber
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent!
  }

  return null
}

function reconcileChildren(wipFiber: fiber, elements: virtualChildren) {
  let index = 0
  let oldFiber = wipFiber.alternate?.child
  let prevSibling: fiber | null = null
  while (index < elements.length || oldFiber) {
    // 进行对比
    const element = elements[index]
    let newFiber: fiber | null = null
    const sameType = element && oldFiber && element.type === oldFiber.type

    if (sameType) {
      // 复用
      newFiber = {
        type: oldFiber!.type,
        dom: oldFiber!.dom,
        props: element.props,
        effectTag: "UPDATE",
        alternate: oldFiber!,
        parent: wipFiber,
      }
    } else {
      if (element) {
        // 新增的
        newFiber = {
          type: element.type,
          dom: null,
          props: element.props,
          alternate: null,
          effectTag: "PLACEMENT",
          parent: wipFiber,
        }
      } else if (oldFiber) {
        // 删除的
        oldFiber.effectTag = "DELETION"
        deletions.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber!
    } else {
      prevSibling!.sibling = newFiber!
    }

    index++
    prevSibling = newFiber
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
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
  deletions = []
  nextUnitOfWork = wipRoot
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
