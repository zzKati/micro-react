import { createElement, render } from "./react-dom"

const app = document.querySelector<HTMLDivElement>("#app")!

const element = createElement(
  "div",
  null,
  createElement("h1", null, "hello"),
  createElement("a", { href: "www.baidu.com" }, "go to baidu")
)

render(element, app)
