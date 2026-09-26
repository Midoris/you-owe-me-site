import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const routePath = "blog/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward/index.html";
const [page, analytics, sitemap, storyStyles, storyScript] = await Promise.all([
  readFile(new URL(routePath, root), "utf8"),
  readFile(new URL("scripts/analytics.js", root), "utf8"),
  readFile(new URL("sitemap.xml", root), "utf8"),
  readFile(new URL("styles/money-story.css", root), "utf8"),
  readFile(new URL("assets/js/money-story.mjs", root), "utf8"),
]);

const DESCRIPTION = "Copy respectful text messages to ask a friend for a loan. Include the amount, repayment timing and an easy way to say no—even when your plans are uncertain.";
const MESSAGES = {
  "short-ask": "Hi [name], could I borrow [amount] for [reason]? I can pay you back on [date]. It’s completely okay if you can’t.",
  "clear-ask-with-repayment-plan": "Hi [name], could you lend me [amount] for [reason]? I can repay [payment amount] on [date] and the rest on [date]. Please only say yes if that works for you.",
  "cannot-promise-exact-date": "Hi [name], could you lend me [amount] for [reason]? I can’t promise a repayment date yet, but I can update you by [date]. I understand if you’d rather not.",
};

function decodeHtml(value) {
  return value.replaceAll("&rsquo;", "’").replaceAll("&mdash;", "—").replaceAll("&amp;", "&");
}

function cardMarkup(id) {
  const match = page.match(new RegExp(`<article class="template-card"[^>]*data-template-id="${id}"[\\s\\S]*?<\\/article>`));
  assert.ok(match, `missing ${id} card`);
  return match[0];
}

test("EXP-008 keeps search identity and synchronizes exact descriptions and modification dates", async () => {
  assert.match(page, /<title>How to Ask to Borrow Money From a Friend \| Text Examples \| You Owe Me<\/title>/);
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/blog\/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward\/" \/>/);
  assert.equal((page.match(new RegExp(DESCRIPTION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length, 4);
  assert.match(page, /article:modified_time" content="2026-09-14T00:00:00\+07:00"/);
  assert.match(page, /"datePublished": "2026-07-08"/);
  assert.match(page, /"dateModified": "2026-09-14"/);
  assert.match(page, /Updated <time datetime="2026-09-14">September 14, 2026<\/time>/);
  assert.match(sitemap, /<loc>https:\/\/you-owe-me\.com\/blog\/how-to-ask-to-borrow-money-from-a-friend-without-making-it-awkward\/<\/loc>\s*<lastmod>2026-09-14<\/lastmod>/);
  const { contentRegistry } = await import("../content/content-registry.mjs");
  const homeDate = contentRegistry.find(entry => entry.url === "/").updated;
  assert.ok(sitemap.includes(`<loc>https://you-owe-me.com/</loc>\n    <lastmod>${homeDate}</lastmod>`));
});

test("EXP-008 puts all seven examples directly after the shortened hero and preserves the later guidance", () => {
  const heroEnd = page.indexOf("</section>", page.indexOf('class="lt-toolsHero friend-borrow-hero"'));
  const examples = page.indexOf('id="copyable-text-examples"');
  const callout = page.indexOf('id="borrow-or-repayment-title"');
  const story = page.indexOf('<!-- money-story:start -->');
  const before = page.indexOf('id="before-you-ask-title"');
  const how = page.indexOf('id="how-to-ask-title"');
  const remaining = page.indexOf('id="kind-of-help-title"');
  const examplesMarkup = page.match(/<section class="lt-toolsSection" id="copyable-text-examples"[\s\S]*?<\/section>/)?.[0] || "";

  assert.ok(heroEnd < examples && examples < story && story < callout && callout < before && before < how && how < remaining);
  assert.equal((examplesMarkup.match(/data-template-id=/g) ?? []).length, 7);
  assert.equal((page.match(/id="copyable-text-examples"/g) ?? []).length, 1);
  assert.match(page, /<h1>How to Ask to Borrow Money From a Friend<\/h1>/);
  assert.match(page, /<p class="lt-heroBody">Ask for a specific amount, explain what it is for, and give an honest repayment date—or a date to check in\. Make it easy for your friend to say no\.<\/p>/);
  assert.match(page, /<p class="lt-heroSupport">Copy a message below, then replace the amount, reason and dates with your own\. These examples work in a text or WhatsApp message\.<\/p>/);
  assert.match(page, /<span aria-current="page">Borrowing money from a friend<\/span>/);
  assert.match(page, />Choose a text message<\/a>/);
  assert.doesNotMatch(page.slice(page.indexOf('class="friend-borrow-hero"'), heroEnd), /friend-borrow-keypoints/);
  assert.match(page, /Text Messages to Ask a Friend for a Loan/);
  assert.match(page, /Only promise a repayment date you can reasonably meet; if you are unsure, use the check-in example\./);
});

test("borrower story closes with a responsive iPhone download handoff", () => {
  const storyStart = page.indexOf('<!-- money-story:start -->');
  const storyEnd = page.indexOf('<!-- money-story:end -->', storyStart);
  const story = page.slice(storyStart, storyEnd);

  assert.equal((page.match(/<!-- money-story:start -->/g) ?? []).length, 1);
  assert.equal((page.match(/data-money-story="borrower"/g) ?? []).length, 1);
  const stageStart = story.indexOf('class="money-story__stage"');
  const stageEnd = story.indexOf('<nav class="money-story__steps"', stageStart);
  const ctaStart = story.indexOf('data-story-cta');

  assert.ok(stageStart >= 0 && ctaStart > stageStart && ctaStart < stageEnd, "the app handoff should be an eighth slide inside the sticky stage");
  assert.match(story, /aria-label="Repaying Maya, in eight moments"/);
  assert.equal((story.match(/<li(?:\s|>)/g) ?? []).length, 8);
  assert.match(story, /data-story-cta hidden inert aria-hidden="true"/);
  assert.match(story, /Stay on top of what you owe\./);
  assert.doesNotMatch(story, /money-story__outro/);
  assert.match(story, /id="friend-borrow-story-primary-download"[\s\S]*?data-iphone-handoff-replaceable/);
  assert.match(story, /data-cta-location="friend_borrow_story_iphone_handoff"/);
  assert.match(story, /data-iphone-handoff-replaces="friend-borrow-story-primary-download"/);
  assert.match(story, /src="\/images\/shared\/iphone-handoff\/repayment-plan\.png" width="472" height="472"/);
  assert.match(page, /href="\/styles\/iphone-handoff\.css\?v=iphone-handoff-phase-d-20260914-1"/);
  assert.match(page, /src="\/scripts\/iphone-handoff\.mjs\?v=iphone-handoff-phase-d-20260914-1"/);
  assert.match(storyStyles, /@media\(min-width:701px\) and \(max-height:500px\) and \(orientation:landscape\)/);
  assert.match(storyStyles, /@media\(max-width:700px\) and \(max-height:500px\) and \(orientation:landscape\)/);
  assert.match(storyStyles, /#money-story \.money-story__canvas\{top:86px;bottom:50px;/);
  assert.match(storyStyles, /#money-story\.is-compact-height \.money-story__canvas\{top:86px;bottom:50px;width:calc\(100% - 30px\)\}/);
  assert.match(storyStyles, /#money-story\.money-story--borrower \.money-story__track\{height:626svh\}/);
  assert.match(storyScript, /cta\.hidden = !isCta;/);
  assert.match(storyScript, /cta\.toggleAttribute\('inert', !isCta\);/);
});

test("EXP-008 keeps the exact changed messages in both rendered and copy attributes", () => {
  for (const [id, expected] of Object.entries(MESSAGES)) {
    const card = cardMarkup(id);
    const attribute = card.match(/data-template="([^"]+)"/);
    const visible = card.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/);
    assert.equal(decodeHtml(attribute?.[1] ?? ""), expected, `${id} data-template`);
    assert.equal(decodeHtml(visible?.[1] ?? ""), expected, `${id} visible copy`);
  }
  assert.match(cardMarkup("cover-something-temporarily"), /Would you be okay covering this for me for now\?/);
  assert.match(cardMarkup("respectful-reply-if-no"), /Thanks for being honest/);
  assert.match(cardMarkup("reply-after-yes"), /Thank you - I really appreciate it/);
});

test("EXP-008 connects one friend-copy event to the existing sanitized analytics handler", () => {
  assert.match(analytics, /const FRIEND_BORROW_MONEY_COPY_EVENT = "youoweme:friend-borrow-money-copy";/);
  assert.equal((analytics.match(/window\.addEventListener\(FRIEND_BORROW_MONEY_COPY_EVENT, onTemporaryHelpCopy\);/g) ?? []).length, 1);
  assert.match(analytics, /window\.addEventListener\(TEMPORARY_HELP_COPY_EVENT, onTemporaryHelpCopy\);/);
  assert.match(analytics, /copyType === "record"\s*\? "temporary_help_support_record_copy"\s*:\s*"temporary_help_template_copy"/);
  assert.match(analytics, /copy_type: copyType \|\| "template"[\s\S]*template_id: sanitizeText\(detail\.id, 120\)/);
  assert.doesNotMatch(analytics, /uomi_web_friend[_-]borrow/i);
});

test("EXP-008 sends friend template and record copies through the existing two event paths once", () => {
  const handlerSource = analytics.match(/function onTemporaryHelpCopy\(event\) \{[\s\S]*?\n\}\n\nfunction onPaymentPlanToolEvent/);
  assert.ok(handlerSource, "the existing temporary-help copy handler is available");

  const captured = [];
  const context = {
    Object,
    getSaleParams() {
      return { sale_active: 0 };
    },
    sanitizeText(value) {
      return typeof value === "string" ? value : "";
    },
    trackEvent(name, params) {
      captured.push({ name, params });
      return Promise.resolve();
    },
  };
  vm.runInNewContext(`${handlerSource[0].replace(/\nfunction onPaymentPlanToolEvent$/, "")}; globalThis.copyHandler = onTemporaryHelpCopy;`, context);

  context.copyHandler({ detail: { copy_type: "template", id: "short-ask", text: "must not be forwarded" } });
  context.copyHandler({ detail: { copy_type: "record", id: "friend-borrow-example-record", amount: "must not be forwarded" } });
  context.copyHandler({ detail: { copy_type: "template", id: "simple-family-money-ask" } });

  assert.deepEqual(JSON.parse(JSON.stringify(captured)), [
    { name: "temporary_help_template_copy", params: { sale_active: 0, copy_type: "template", template_id: "short-ask" } },
    { name: "temporary_help_support_record_copy", params: { sale_active: 0, copy_type: "record", template_id: "friend-borrow-example-record" } },
    { name: "temporary_help_template_copy", params: { sale_active: 0, copy_type: "template", template_id: "simple-family-money-ask" } },
  ]);
});
