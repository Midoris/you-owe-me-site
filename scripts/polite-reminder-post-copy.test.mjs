import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const rootPath = fileURLToPath(root);
const routePath = "blog/how-to-remind-someone-they-owe-you-money-politely/index.html";
const page = await readFile(new URL(routePath, root), "utf8");
const controller = await readFile(new URL("scripts/polite-reminder-post-copy.js", root), "utf8");
const sharedCopyScript = await readFile(new URL("scripts/repayment-reminder-text-examples.js", root), "utf8");
const analytics = await readFile(new URL("scripts/analytics.js", root), "utf8");
const styles = await readFile(new URL("styles/polite-money-reminder-answer.css", root), "utf8");

const TARGET_PAGE = "blog_how_to_remind_someone_they_owe_you_money_politely";
const APP_STORE_URL = "https://apps.apple.com/us/app/loan-tracker-you-owe-me/id1147058670?ppid=0ad25f49-9026-4d8b-99ea-9581a98702db&amp;pt=117888502&amp;ct=website_cta&amp;mt=8";
const ELIGIBLE_TEMPLATE_IDS = [
  "friendly-reminder",
  "polite-clear-reminder",
  "after-promised-date",
  "partial-repayment-reminder",
  "firmer-polite-reminder",
  "polite-reminder-template",
].sort();

function promptMarkup() {
  const match = page.match(/<aside\b(?=[^>]*data-post-copy-app-prompt)[\s\S]*?<\/aside>/);
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

test("the old bridge is replaced by one initially hidden post-copy prompt with exact copy", () => {
  const prompt = promptMarkup();

  assert.doesNotMatch(page, /polite-reminder-product-bridge/);
  assert.equal((page.match(/data-post-copy-app-prompt/g) || []).length, 1);
  assert.match(prompt, /data-post-copy-app-prompt[\s\S]*\bhidden\b/);
  assert.match(prompt, /aria-labelledby="polite-reminder-post-copy-title"/);
  assert.match(prompt, />Reminder copied</);
  assert.match(prompt, />Keep track until you&rsquo;re paid back<\/h3>/);
  assert.match(prompt, /Record each repayment in You Owe Me and see what&rsquo;s left\. When you need another reminder, start with the current balance\./);
  assert.match(styles, /polite-reminder-post-copy\[hidden\]\s*\{\s*display:\s*none/);
});

test("the post-copy prompt retains attributed App Store and secondary solution actions in order", () => {
  const prompt = promptMarkup();
  const appStoreIndex = prompt.indexOf("polite_reminder_post_copy_app_store_cta");
  const solutionIndex = prompt.indexOf("polite_reminder_post_copy_solution_cta");

  assert.ok(prompt.includes(APP_STORE_URL));
  assert.match(prompt, /data-source-cluster="money-owed"/);
  assert.match(prompt, /aria-label="Download You Owe Me on the App Store for ongoing balances and repayment reminders"/);
  assert.match(prompt, /<img[^>]+alt="Download You Owe Me on the App Store"/);
  assert.ok(appStoreIndex >= 0 && appStoreIndex < solutionIndex, "App Store action precedes the solution link");
  assert.match(prompt, /href="\/solutions\/app-to-track-money-owed\/"/);
  assert.match(prompt, /data-track-event="site_link_click"/);
  assert.match(prompt, />See how the balance tracker works<\/a>/);
  assert.match(prompt, /Free download &middot; In-app purchases available/);
  assert.doesNotMatch(prompt, /lt-primaryCta/);
});

test("the page uses explicit eligibility and preserves one language-support anchor", () => {
  const eligibleIds = [...page.matchAll(/<(?:article|div)\b[^>]*data-template-id="([^"]+)"[^>]*data-post-copy-app-eligible[^>]*>/g)]
    .map((match) => match[1])
    .sort();

  assert.equal((page.match(/data-app-language-support-anchor/g) || []).length, 1);
  assert.match(promptMarkup(), /data-app-language-support-anchor\s+hidden/);
  assert.match(page, new RegExp(`<article class="post featured" data-copy-page="${TARGET_PAGE}">`));
  assert.deepEqual(eligibleIds, ELIGIBLE_TEMPLATE_IDS);
  assert.doesNotMatch(page, /data-template-id="promised-help-check-in"[^>]*data-post-copy-app-eligible/);
  assert.doesNotMatch(page, /data-template-id="promised-gift-timing"[^>]*data-post-copy-app-eligible/);
});

test("the page-only controller is loaded after the shared copy script and is not loaded elsewhere", async () => {
  const sharedScriptIndex = page.indexOf('/scripts/repayment-reminder-text-examples.js');
  const controllerIndex = page.indexOf('/scripts/polite-reminder-post-copy.js?v=polite-reminder-post-copy-1');

  assert.ok(sharedScriptIndex >= 0 && controllerIndex > sharedScriptIndex);
  assert.ok(controllerIndex < page.indexOf('/scripts/analytics.js'));

  const indexFiles = await walkIndexFiles(rootPath);
  const controllerFiles = [];
  for (const file of indexFiles) {
    const html = await readFile(file, "utf8");
    if (html.includes("/scripts/polite-reminder-post-copy.js")) {
      controllerFiles.push(path.relative(rootPath, file).split(path.sep).join("/"));
    }
  }

  assert.deepEqual(controllerFiles, [routePath]);
});

test("the controller consumes only successful copy events and moves the existing prompt safely", () => {
  assert.match(controller, /document\.querySelector\("\[data-post-copy-app-prompt\]"\)/);
  assert.match(controller, /if \(!postCopyPrompt\) return;/);
  assert.match(controller, /window\.addEventListener\("youoweme:tool-template-copy", handleSuccessfulCopy\)/);
  assert.match(controller, new RegExp(`var targetPage = ${JSON.stringify(TARGET_PAGE)}`));
  assert.match(controller, /detail\.page !== targetPage/);
  assert.match(controller, /card\.hasAttribute\("data-post-copy-app-eligible"\)/);
  assert.match(controller, /postCopyPrompt\.hidden = true;/);
  assert.match(controller, /button\.insertAdjacentElement\("afterend", postCopyPrompt\)/);
  assert.match(controller, /postCopyPrompt\.hidden = false;/);
  assert.doesNotMatch(controller, /cloneNode|innerHTML|insertAdjacentHTML|navigator\.clipboard|copyText\(|addEventListener\("click"/);
});

test("existing analytics and copy contracts remain intact", () => {
  assert.match(sharedCopyScript, /copyText\(textToCopy\)\.then\(function \(\) \{[\s\S]*trackTemplateCopy\(card\);/);
  assert.match(sharedCopyScript, /\.catch\(function \(\) \{[\s\S]*Copy did not work/);
  assert.match(analytics, /const TOOL_TEMPLATE_COPY_EVENT = "youoweme:tool-template-copy"/);
  assert.match(analytics, /const APP_STORE_CTA_VIEWED_EVENT = "uomi_web_app_store_cta_viewed"/);
  assert.match(analytics, /const APP_STORE_OPENED_EVENT = "uomi_web_app_store_opened"/);
  assert.doesNotMatch(analytics, /post_copy_prompt_revealed/);
  assert.match(page, /data-track-location="polite_reminder_answer_app_store_cta"/);
  assert.match(page, /<!-- best-next-step:start -->/);
});

test("search-facing article metadata remains stable", () => {
  assert.match(page, /<link rel="canonical" href="https:\/\/you-owe-me\.com\/blog\/how-to-remind-someone-they-owe-you-money-politely\/" \/>/);
  assert.match(page, /name="description"[\s\S]*Copy polite reminder texts for a friend, relative, roommate, or partner who owes you money/);
  assert.match(page, /"dateModified": "2026-09-05"/);
  assert.match(page, /article:modified_time" content="2026-09-05T00:00:00\+07:00"/);
  assert.match(page, /Updated <time datetime="2026-09-05">September 5, 2026<\/time>/);
  assert.match(page, /href="\/styles\/polite-money-reminder-answer\.css\?v=conversion-polish-20260905-3"/);
});
