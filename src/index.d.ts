type elementType = keyof HTMLElementTagNameMap
type childrenType = (virtualDom | string)[]
type props = {
  [key in Exclude<keyof HTMLElement, "children">]?: HTMLElement[key]
}

interface virtualDom {
  type: elementType
  props: {
    children: (virtualDom | textDom)[]
  } & props
}

interface textDom {
  type: "TEXT_ELEMENT"
  props: {
    nodeValue: string
    children: []
  }
}
