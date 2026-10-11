// Small DOM fixture for executing these static-page controllers in Node.
// It models nodes and capture/bubble events, not layout or native keyboard UI;
// responsive rendering and native disclosure acceptance remain browser checks.
export class StaticNode {
  constructor(tag = "#text", text = "") {
    this.tagName = tag.toLowerCase();
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.style = {};
    this._text = text;
  }
  get firstChild() { return this.children[0] || null; }
  get className() { return this.getAttribute("class") || ""; }
  set className(value) { this.setAttribute("class", value); }
  get id() { return this.getAttribute("id") || ""; }
  set id(value) { this.setAttribute("id", value); }
  get value() {
    if (this._value !== undefined) return this._value;
    if (this.tagName === "select") return (this.children.find(n => n.selected) || this.children[0])?.value || "";
    return this.getAttribute("value") || "";
  }
  set value(value) { this._value = value; }
  get hidden() { return this.hasAttribute("hidden"); }
  set hidden(value) { value ? this.setAttribute("hidden", "") : this.attributes.delete("hidden"); }
  get open() { return this.hasAttribute("open"); }
  set open(value) { value ? this.setAttribute("open", "") : this.attributes.delete("open"); }
  get textContent() { return this._text + this.children.map(n => n.textContent).join(""); }
  set textContent(value) {
    this.children.forEach(n => { n.parentNode = null; });
    this.children = [];
    this._text = String(value);
  }
  get classList() {
    return { toggle: (name, force) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      const add = force === undefined ? !classes.has(name) : force;
      add ? classes.add(name) : classes.delete(name);
      this.className = [...classes].join(" ");
    } };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  append(...nodes) { nodes.forEach(n => this.appendChild(typeof n === "string" ? new StaticNode("#text", n) : n)); }
  appendChild(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
    this.children.push(node);
    node.parentNode = this;
    return node;
  }
  removeChild(node) {
    this.children.splice(this.children.indexOf(node), 1);
    node.parentNode = null;
    return node;
  }
  contains(node) { return this === node || this.children.some(n => n.contains(node)); }
  matches(selector) {
    return selector.split(",").some(part => {
      part = part.trim();
      if (part.includes(" ")) {
        const pieces = part.split(/\s+/);
        if (!this.matches(pieces.pop())) return false;
        let parent = this.parentNode;
        while (pieces.length && parent) {
          if (parent.matches(pieces.at(-1))) pieces.pop();
          parent = parent.parentNode;
        }
        return pieces.length === 0;
      }
      const tag = part.match(/^[\w-]+/);
      if (tag && this.tagName !== tag[0]) return false;
      const id = part.match(/#([\w-]+)/);
      if (id && this.id !== id[1]) return false;
      for (const match of part.matchAll(/\.([\w-]+)/g)) {
        if (!this.className.split(/\s+/).includes(match[1])) return false;
      }
      for (const match of part.matchAll(/\[([\w-]+)(?:=["']([^"']*)["'])?\]/g)) {
        if (!this.hasAttribute(match[1])) return false;
        if (match[2] !== undefined && this.getAttribute(match[1]) !== match[2]) return false;
      }
      return this.tagName !== "#text";
    });
  }
  querySelectorAll(selector) {
    return this.children.flatMap(n => [ ...(n.matches(selector) ? [n] : []), ...n.querySelectorAll(selector) ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentNode?.closest(selector) || null; }
  addEventListener(type, callback, options) {
    const capture = options === true || options?.capture === true;
    this.listeners.set(type, [...(this.listeners.get(type) || []), { callback, capture }]);
  }
  dispatchEvent(event) {
    event.target = this;
    const path = [];
    for (let n = this; n; n = n.parentNode) path.push(n);
    for (const n of [...path].reverse()) {
      for (const item of n.listeners.get(event.type) || []) if (item.capture) item.callback(event);
    }
    for (const n of path) {
      for (const item of n.listeners.get(event.type) || []) if (!item.capture) item.callback(event);
    }
    return true;
  }
  select() { this.selectionMade = true; }
}

function decode(text) {
  const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0", rsquo: "’", lsquo: "‘", mdash: "—", ndash: "–", middot: "·" };
  return text.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (match, name) => name[0] === "#"
    ? String.fromCodePoint(name[1] === "x" ? parseInt(name.slice(2), 16) : Number(name.slice(1))) : entities[name] ?? match);
}

export function parseStaticPage(html) {
  const document = new StaticNode("document");
  const stack = [document];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  html = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const token of html.match(/<[^>]+>|[^<]+/g) || []) {
    if (/^<!/.test(token)) continue;
    if (/^<\//.test(token)) { stack.pop(); continue; }
    if (token[0] !== "<") { stack.at(-1).appendChild(new StaticNode("#text", decode(token))); continue; }
    const tag = token.match(/^<([\w-]+)/)?.[1].toLowerCase();
    if (!tag) continue;
    const node = new StaticNode(tag);
    const attrs = token.slice(tag.length + 1).replace(/\/?>(.*)$/, "");
    for (const match of attrs.matchAll(/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      node.setAttribute(match[1], decode(match[2] ?? match[3] ?? match[4] ?? ""));
    }
    stack.at(-1).appendChild(node);
    if (!voidTags.has(tag) && !/\/>$/.test(token)) stack.push(node);
  }
  document.readyState = "complete";
  document.body = document.querySelector("body");
  document.createElement = tag => new StaticNode(tag);
  document.createTextNode = text => new StaticNode("#text", text);
  return document;
}
