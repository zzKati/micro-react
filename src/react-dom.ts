export function render(element: virtualDom | textDom, container: HTMLElement) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type)

  const isProerty = (key: string) => key !== "children"

  Object.keys(element.props)
    .filter(isProerty)
    // @ts-ignore
    .forEach(name => (dom[name] = element.props[name]))

  element.props.children.forEach(child => {
    // textNode 的 children 为空，进不来这个循环 直接断言
    render(child, dom as HTMLElement)
  })

  container.appendChild(dom)
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
