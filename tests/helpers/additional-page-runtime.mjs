import vm from "node:vm";
import { parseStaticPage } from "./static-dom.mjs";

// Adapter around the existing static DOM: adds the APIs used by these page
// controllers, including parsing their generated rows. No layout/browser model.
export function pageRuntime(html, options = {}) {
  const document = parseStaticPage(html);
  const copied = [], events = [], scrolls = [], selections = [], timers = [];
  const listeners = new Map();
  const decorate = node => {
    if (node.__runtimeDecorated) return;
    node.__runtimeDecorated = true;
    const matches = node.matches.bind(node);
    node.matches = selector => selector.split(",").some(part => {
      const substring = part.trim().match(/^\[([\w-]+)\*=['"]([^'"]+)['"]\]$/);
      if (substring) return (node.getAttribute(substring[1]) || "").includes(substring[2]);
      const checked = part.includes(":checked");
      return (!checked || node.checked) && matches(part.replace(":checked", ""));
    });
    Object.defineProperty(node, "checked", { get: () => node._checked ?? node.hasAttribute("checked"), set: value => { node._checked = value; } });
    Object.defineProperty(node, "dataset", { get: () => Object.fromEntries(
      [...node.attributes].filter(([key]) => key.startsWith("data-")).map(([key, value]) =>
        [key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase()), value]),
    ) });
    Object.defineProperty(node, "innerHTML", { get: () => node._html || "", set: value => {
      node._html = value;
      const parsed = parseStaticPage(`<div>${value}</div>`).querySelector("div");
      node.textContent = "";
      for (const child of [...parsed.children]) node.appendChild(child);
      node.querySelectorAll("*").forEach(decorate);
      if (node.tagName === "select") delete node._value;
    } });
    node.insertAdjacentElement = (position, moved) => {
      if (position !== "afterend") throw Error("Unsupported insertion in fixture");
      if (moved.parentNode) moved.parentNode.removeChild(moved);
      const parent = node.parentNode;
      parent.children.splice(parent.children.indexOf(node) + 1, 0, moved);
      moved.parentNode = parent;
    };
    node.focus = () => { document.activeElement = node; };
    node.scrollIntoView = (...args) => scrolls.push({ node, args });
    node.setSelectionRange = (start, end) => { node.selectionRange = [start, end]; };
    node.removeAttribute = name => node.attributes.delete(name);
    node.replaceChildren = (...children) => { node.textContent = ""; node.append(...children); };
    const classList = node.classList;
    Object.defineProperty(node, "classList", { value: { ...classList,
      add: name => classList.toggle(name, true), remove: name => classList.toggle(name, false),
    } });
  };
  [document, ...document.querySelectorAll("*")].forEach(decorate);
  const createElement = document.createElement;
  document.createElement = tag => { const node = createElement(tag); decorate(node); return node; };
  document.getElementById = id => document.querySelector(`#${id}`);
  document.createRange = () => ({ selectNodeContents(node) { selections.push(node); } });
  document.execCommand = () => {
    if (options.fallbackFails) return false;
    copied.push(document.querySelector("textarea").value);
    return true;
  };
  const navigator = { clipboard: { async writeText(text) {
    if (options.clipboardFails) throw Error("Clipboard denied");
    copied.push(text);
  } } };
  const window = {
    navigator, isSecureContext: true,
    setTimeout(callback) { timers.push(callback); }, clearTimeout() {},
    getSelection: () => ({ removeAllRanges() {}, addRange() {} }),
    addEventListener(type, callback) { listeners.set(type, [...(listeners.get(type) || []), callback]); },
    dispatchEvent(event) {
      events.push(JSON.parse(JSON.stringify(event)));
      (listeners.get(event.type) || []).forEach(callback => callback(event));
    },
  };
  const context = vm.createContext({ document, window, navigator,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    fetch() { throw Error("This task must not fetch"); },
    location: { assign() { throw Error("Copy must not navigate"); } },
  });
  const query = selector => { const node = document.querySelector(selector); if (!node) throw Error(`Missing ${selector}`); return node; };
  return { document, window, context, copied, events, scrolls, selections, timers, listeners,
    query, run: script => vm.runInContext(script, context),
    emit: detail => window.dispatchEvent({ type: "youoweme:friend-borrow-money-copy", detail }),
    click: async selector => {
      query(selector).dispatchEvent({ type: "click", preventDefault() {} });
      for (let i = 0; i < 10; i++) await Promise.resolve();
    },
    edit(selector, value, type = "input") { const node = query(selector); node.value = value; node.dispatchEvent({ type, preventDefault() {} }); },
  };
}
