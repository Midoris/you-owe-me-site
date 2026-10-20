// Refresh crawlable counterpart annotations and links from reviewed locale routes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spanishPages, localeOrigin, spanishShared } from "../content/site-locales.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fileFor = route => path.join(root, route, "index.html");
const completed = spanishPages.filter(page => page.complete);
const esc = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

for (const page of completed) {
  for (const [lang, route] of [["en", page.en], ["es", page.es]]) {
    const file = fileFor(route);
    if (!fs.existsSync(file)) throw new Error(`Reviewed counterpart missing: ${route}`);
    let html = fs.readFileSync(file, "utf8");
    html = html.replace(/\s*<!-- locale-alternates:start -->[\s\S]*?<!-- locale-alternates:end -->/g, "");
    const alternates = `\n    <!-- locale-alternates:start -->\n${[["en", page.en], ["es", page.es], ["x-default", page.en]].map(([code, url]) => `    <link rel="alternate" hreflang="${code}" href="${localeOrigin}${url}" />`).join("\n")}\n    <!-- locale-alternates:end -->`;
    html = html.replace(/<link rel="canonical"[^>]*>/, match => match + alternates);
    html = html.replace(/\s*<!-- locale-switch:start -->[\s\S]*?<!-- locale-switch:end -->/g, "");
    const switcher = `\n        <!-- locale-switch:start -->\n        <li class="site-language-switch" aria-label="${lang === "es" ? spanishShared.languageLabel : "Page language"}"><a href="${page.en}" lang="en" hreflang="en"${lang === "en" ? ' aria-current="page"' : ""}>English</a><span aria-hidden="true"> · </span><a href="${page.es}" lang="es" hreflang="es"${lang === "es" ? ' aria-current="page"' : ""}>Español</a></li>\n        <!-- locale-switch:end -->`;
    html = html.replace(/(<div id="copyright">\s*<ul>)/, "$1" + switcher);
    if (lang === "es") {
      for (const target of completed) {
        const href = target.en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        html = html.replace(new RegExp(`(<a\\b[^>]*href=")${href}(#[^"]*)?("[^>]*>)([\\s\\S]*?)(<\\/a>)`, "g"), (original, start, hash, end, label, close) => /\blang="en"/.test(start + end) ? original : `${start}${target.es}${hash || ""}${end}${label.replace(/\s*\(en ingl[eé]s\)/g, "")}${close}`);
      }
      const nav = completed.map(target => `<a href="${target.es}"${target.es === route ? ' aria-current="page"' : ""}>${esc(target.title)}</a>`).join("\n              ");
      html = html.replace(/\s*<!-- spanish-section:start -->[\s\S]*?<!-- spanish-section:end -->/g, "");
      html = html.replace(/(<article\b[^>]*>)/, `$1\n          <!-- spanish-section:start -->\n          <nav class="site-spanish-section" aria-label="Páginas en español">${nav}</nav>\n          <!-- spanish-section:end -->`);
    }
    fs.writeFileSync(file, html);
  }
}
const discoveryFile = path.join(root, "llms.txt");
let discovery = fs.readFileSync(discoveryFile, "utf8").replace(/\n<!-- spanish-pages:start -->[\s\S]*?<!-- spanish-pages:end -->\n?/g, "\n");
if (completed.length) {
  discovery = discovery.trimEnd() + `\n\n<!-- spanish-pages:start -->\n## Páginas en español\n\nContenido público en español. Cada página conserva su propia URL canónica; los recursos todavía disponibles solo en inglés se indican en sus enlaces.\n\n${completed.map(page => `- [${page.title}](${localeOrigin}${page.es})`).join("\n")}\n<!-- spanish-pages:end -->\n`;
}
fs.writeFileSync(discoveryFile, discovery);
console.log(`Updated ${completed.length} reviewed language pairs.`);
