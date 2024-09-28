export function render(element: virtualDom, container: HTMLElement) {}

export function createElement(
  type: elementType,
  props?: Object | null,
  ...children: childrenType
): virtualDom {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        typeof child === "object" ? child : createTextElement(child)
      }),
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
