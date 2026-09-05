import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const routePath = "blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html";
const page = await readFile(new URL(routePath, root), "utf8");
const controller = await readFile(new URL("scripts/friend-borrow-post-copy.js", root), "utf8");
const copyScript = await readFile(new URL("scripts/friend-borrow-money-answer.js", root), "utf8");
const analytics = await readFile(new URL("scripts/analytics.js", root), "utf8");
const styles = await readFile(new URL("styles/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward.css", root), "utf8");
const APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=d845bed2-b88d-47a2-854a-9aa0c35eb049&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";

function promptMarkup() {
  const match = page.match(/<aside\b(?=[^>]*data-friend-borrow-post-copy)[\s\S]*?<\/aside>/i);
  assert.ok(match, "post-copy prompt is authored as one aside");
  return match[0];
}

async function walkIndexFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      files.push(...await walkIndexFiles(fullPath));
    } else if (entry.isFile() && entry.name === "index.html") {
      files.push(fullPath);
    }
  }

  return files;
}

test("borrowing guide has one initially hidden post-copy prompt with approved actions", () => {
  const prompt = promptMarkup();
  const appStoreIndex = prompt.indexOf("friend_borrow_post_copy_app_store_cta");
  const solutionIndex = prompt.indexOf("friend_borrow_post_copy_solution_cta");

  assert.equal((page.match(/data-friend-borrow-post-copy(?=[\s=>])/g) ?? []).length, 1);
  assert.match(prompt, /\bhidden\b/);
  assert.match(prompt, /aria-labelledby="friend-borrow-post-copy-title"/);
  assert.match(prompt, /data-friend-borrow-post-copy-eyebrow>Reply copied<\/p>/);
  assert.match(prompt, /Keep the amount and repayment date together/);
  assert.match(prompt, /Use You Owe Me to record what you borrowed, when you agreed to repay it, and each payment you make\./);
  assert.ok(prompt.includes(APP_STORE_URL));
  assert.match(prompt, /data-source-cluster="temporary-support"/);
  assert.match(prompt, /aria-label="Download You Owe Me on the App Store for keeping a friend loan and repayment updates clear"/);
  assert.match(prompt, /<img[\s\S]*?alt="Download You Owe Me on the App Store"/);
  assert.ok(appStoreIndex >= 0 && appStoreIndex < solutionIndex, "App Store action precedes solution link");
  assert.match(prompt, /href="\/solutions\/temporary-financial-support-tracker\/"/);
  assert.match(prompt, /Free download &middot; In-app purchases available/);
  assert.match(prompt, />See how loan tracking works<\/a>/);
});

test("only the three high-intent copy controls are eligible", () => {
  const eligible = [...page.matchAll(/<button\b[^>]*data-friend-borrow-post-copy-eligible[^>]*>/g)]
    .map((match) => match[0].match(/data-copy-(?:template|text-target)="([^"]+)"/)?.[1])
    .sort();

  assert.deepEqual(eligible, ["friend-borrow-example-record", "need-more-time-update", "reply-after-yes"]);
  for (const id of [
    "short-ask",
    "clear-ask-with-repayment-plan",
    "cannot-promise-exact-date",
    "cover-something-temporarily",
    "slightly-more-personal",
    "respectful-reply-if-no",
  ]) {
    assert.doesNotMatch(page, new RegExp(`data-copy-template="${id}"[^>]*data-friend-borrow-post-copy-eligible`));
  }
  assert.equal((page.match(/data-app-language-support-anchor/g) ?? []).length, 1);
});

test("page-only controller consumes successful copy events and moves the existing prompt safely", async () => {
  assert.match(controller, /document\.querySelector\("\[data-friend-borrow-post-copy\]"\)/);
  assert.match(controller, /document\.querySelectorAll\("\[data-friend-borrow-post-copy-eligible\]"\)/);
  assert.match(controller, /window\.addEventListener\("youoweme:friend-borrow-money-copy", handleSuccessfulCopy\)/);
  assert.match(controller, /detail\.copy_type === "template"[\s\S]*?data-copy-template/);
  assert.match(controller, /detail\.copy_type === "record"[\s\S]*?data-copy-text-target/);
  assert.match(controller, /var copyVariants = \{/);
  assert.match(controller, /"template:reply-after-yes"/);
  assert.match(controller, /"record:friend-borrow-example-record"/);
  assert.match(controller, /"template:need-more-time-update"/);
  assert.match(controller, /if \(!button \|\| !variant\) \{[\s\S]*?prompt\.hidden = true;/);
  assert.match(controller, /button\.closest\("\.template-card, \.friend-borrow-card"\)/);
  assert.match(controller, /card\.insertAdjacentElement\("afterend", prompt\)/);
  assert.match(controller, /button\.insertAdjacentElement\("afterend", prompt\)/);
  assert.match(controller, /prompt\.hidden = false;/);
  assert.doesNotMatch(controller, /innerHTML|insertAdjacentHTML|cloneNode|navigator\.clipboard|scrollIntoView|CustomEvent|firebase|addEventListener\("click"/i);

  const copyScriptIndex = page.indexOf('/scripts/friend-borrow-money-answer.js?v=friend-borrow-money-1');
  const controllerIndex = page.indexOf('/scripts/friend-borrow-post-copy.js?v=conversion-polish-20260905-3');
  assert.ok(copyScriptIndex >= 0 && controllerIndex > copyScriptIndex);
  assert.ok(controllerIndex < page.indexOf('/scripts/analytics.js'));

  const controllerFiles = [];
  for (const file of await walkIndexFiles(rootPath)) {
    if ((await readFile(file, "utf8")).includes("/scripts/friend-borrow-post-copy.js")) {
      controllerFiles.push(path.relative(rootPath, file).split(path.sep).join("/"));
    }
  }
  assert.deepEqual(controllerFiles, [routePath]);
});

test("borrower prompt uses the approved variant only after a matching successful copy", () => {
  const prompt = { hidden: true };
  const eyebrow = { textContent: "" };
  const heading = { textContent: "" };
  const message = { textContent: "" };
  const cards = [];

  function button(copyType, id) {
    const card = {
      insertions: [],
      insertAdjacentElement(position, node) {
        this.insertions.push({ position, node });
      }
    };
    cards.push(card);
    return {
      getAttribute(name) {
        if (name === "data-copy-template" && copyType === "template") return id;
        if (name === "data-copy-text-target" && copyType === "record") return id;
        return null;
      },
      closest() {
        return card;
      },
      insertAdjacentElement() {
        throw new Error("card fallback should not be used in this fixture");
      }
    };
  }

  const buttons = [
    button("template", "reply-after-yes"),
    button("record", "friend-borrow-example-record"),
    button("template", "need-more-time-update"),
  ];
  let handler;
  const document = {
    readyState: "complete",
    querySelector(selector) {
      if (selector === "[data-friend-borrow-post-copy]") return prompt;
      if (selector === "[data-friend-borrow-post-copy-eyebrow]") return eyebrow;
      if (selector === "#friend-borrow-post-copy-title") return heading;
      if (selector === ".friend-borrow-post-copy__message") return message;
      return null;
    },
    querySelectorAll(selector) {
      return selector === "[data-friend-borrow-post-copy-eligible]" ? buttons : [];
    },
    addEventListener() {}
  };
  const window = {
    addEventListener(name, listener) {
      if (name === "youoweme:friend-borrow-money-copy") handler = listener;
    }
  };
  vm.runInNewContext(controller, { document, window });
  assert.equal(typeof handler, "function");

  function emit(copy_type, id) {
    handler({ detail: { copy_type, id } });
  }

  emit("template", "reply-after-yes");
  assert.equal(eyebrow.textContent, "Reply copied");
  assert.equal(heading.textContent, "Keep the amount and repayment date together");
  assert.equal(message.textContent, "Use You Owe Me to record what you borrowed, when you agreed to repay it, and each payment you make.");
  assert.equal(prompt.hidden, false);
  assert.equal(cards[0].insertions.length, 1);

  emit("record", "friend-borrow-example-record");
  assert.equal(eyebrow.textContent, "Record copied");
  assert.equal(heading.textContent, "Keep this record up to date as you repay");
  assert.equal(message.textContent, "Record each payment in You Owe Me and see what’s left, without rewriting your notes.");
  assert.equal(cards[1].insertions[0].node, prompt, "the same prompt moves for each eligible event");

  emit("template", "need-more-time-update");
  assert.equal(eyebrow.textContent, "Update copied");
  assert.equal(heading.textContent, "Keep the revised plan clear");
  assert.equal(message.textContent, "Record what you’ve repaid, what’s left, and the next agreed date in You Owe Me.");

  emit("template", "promised-gift-timing");
  assert.equal(prompt.hidden, true, "an ineligible successful copy hides stale prompt content");
  emit("record", "reply-after-yes");
  assert.equal(prompt.hidden, true, "a wrong event type cannot select a variant");
  emit("template", "reply-after-yes");
  assert.equal(prompt.hidden, false);
  assert.equal(cards.flatMap((card) => card.insertions).filter(({ node }) => node === prompt).length, 4, "one existing prompt is moved without cloning");
});

test("existing copy, analytics, metadata, and responsive contracts remain intact", () => {
  assert.match(copyScript, /trackCopy\(type, id\);/);
  assert.match(copyScript, /\.catch\(function \(\) \{[\s\S]*?Copy did not work/);
  assert.doesNotMatch(analytics, /friend_borrow_post_copy|friend-borrow-post-copy/);
  assert.match(styles, /body\.friend-borrow-money-page \.friend-borrow-post-copy\[hidden\]\s*\{\s*display:\s*none !important;/);
  assert.match(styles, /body\.friend-borrow-money-page \.friend-borrow-template-grid > \.friend-borrow-post-copy\s*\{[\s\S]*?grid-column:\s*1 \/ -1/);
  assert.match(styles, /body\.friend-borrow-money-page \.friend-borrow-post-copy\s*\{[\s\S]*?width:\s*100%[\s\S]*?max-width:\s*100%[\s\S]*?border-radius:\s*20px/);
  assert.match(styles, /friend-borrow-post-copy__actions\s*\{[\s\S]*?flex-direction:\s*column/);
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/blog\/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward\/" \/>/);
  assert.match(page, /"datePublished": "2026-07-08"/);
  assert.match(page, /"dateModified": "2026-09-05"/);
  assert.match(page, /Updated <time datetime="2026-09-05">September 5, 2026<\/time>/);
  assert.match(page, /href="\/styles\/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward\.css\?v=conversion-polish-20260905-3"/);
});
