type elementType = keyof HTMLElementTagNameMap
type childrenType = (virtualDom | string)[]
type virtualChildren = (virtualDom | textDom)[]
type props = {
  [key in Exclude<keyof HTMLElement, "children">]?: HTMLElement[key]
}

interface virtualDom {
  type: elementType
  props: {
    children: virtualChildren
  } & props
}

interface textDom {
  type: "TEXT_ELEMENT"
  props: {
    nodeValue: string
    children: []
  }
}

interface fiber {
  dom: HTMLElement | null
  parent?: fiber
  type?: elementType | TEXT_ELEMENT
  props: {
    children: virtualChildren
  }
  child?: fiber
  sibling?: fiber
}
