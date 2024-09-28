type elementType = keyof HTMLElementTagNameMap
type childrenType = (virtualDom | string)[]
type virtualChildren = (virtualDom | textDom)[]
type props = {
  [key in Exclude<
    keyof HTMLElement & HTMLLinkElement,
    "children"
  >]?: HTMLElement[key]
}

type virtualDomProps = {
  children: virtualChildren
} & props

interface virtualDom {
  type: elementType
  props: virtualDomProps
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
  props: virtualDomProps
  child?: fiber
  sibling?: fiber
  alternate: fiber | null
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION"
}
