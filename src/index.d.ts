type elementType = keyof HTMLElementTagNameMap
type childrenType = (virtualDom | string)[]

interface virtualDom {
  type: elementType
  props: Object | {}
}

interface textDom {
  type: "TEXT_ELEMENT"
  props: Object
}
