const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const question = "Is You Owe Me available on Android?";

const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");

function decodeHtml(value) {
  return String(value)
    .replaceAll("&rsquo;", "’")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeText(value) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonLdBlocks(html) {
  return Array.from(
    html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    (match) => JSON.parse(match[1]),
  );
}

function findJsonLdNode(blocks, type) {
  for (const block of blocks) {
    const nodes = Array.isArray(block?.["@graph"]) ? block["@graph"] : [block];
    const match = nodes.find((node) => {
      const types = Array.isArray(node?.["@type"]) ? node["@type"] : [node?.["@type"]];
      return types.includes(type);
    });
    if (match) return match;
  }
  return null;
}

function availabilitySection(html) {
  const match = html.match(
    /<(article|details)\b[^>]*\bid=["']platform-availability["'][^>]*>([\s\S]*?)<\/\1>/i,
  );
  assert.ok(match, "platform availability section should have a stable fragment");
  return match[0];
}

test("homepage and money-owed solution state Android availability consistently", () => {
  for (const relativePath of ["index.html", "solutions/app-to-track-money-owed/index.html"]) {
    const html = read(relativePath);
    const section = availabilitySection(html);
    const text = normalizeText(section);

    assert.ok(text.includes(question), `${relativePath} should contain the exact question`);
    assert.match(text, /\bThere is no Android app\b/i);
    assert.match(text, /\bavailable for iPhone only\b/i);
    assert.match(text, /\bread-only Live Link\b/i);
    assert.match(text, /\bBalance Sync is not available to an Android participant\b/i);
    assert.match(section, /href=["']\/tools\/["']/i);
    assert.match(section, /href=["']\/features\/#live-link["']/i);
    assert.match(section, /href=["']\/features\/#balance-sync["']/i);
  }
});

test("solution FAQPage schema agrees with the visible availability answer", () => {
  const html = read("solutions/app-to-track-money-owed/index.html");
  const faqPage = findJsonLdNode(jsonLdBlocks(html), "FAQPage");
  assert.ok(faqPage, "solution should retain FAQPage JSON-LD");

  const schemaQuestion = faqPage.mainEntity.find((entity) => entity.name === question);
  assert.ok(schemaQuestion, "FAQPage should contain the Android question");

  const visibleAnswer = availabilitySection(html).match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  assert.ok(visibleAnswer, "visible Android FAQ should contain an answer");
  assert.equal(
    normalizeText(schemaQuestion.acceptedAnswer.text),
    normalizeText(visibleAnswer),
    "schema and visible Android answers should match",
  );
});

test("homepage SoftwareApplication remains iOS-only structured data", () => {
  const softwareApplication = findJsonLdNode(jsonLdBlocks(read("index.html")), "SoftwareApplication");
  assert.ok(softwareApplication, "homepage should retain SoftwareApplication JSON-LD");
  assert.equal(softwareApplication.operatingSystem, "iOS");
});

test("llms.txt communicates iPhone-only availability and Android browser limits", () => {
  const llms = read("llms.txt");
  assert.match(llms, /\bavailable for iPhone only\b/i);
  assert.match(llms, /\bthere is no Android app\b/i);
  assert.match(llms, /\bbrowser tools work independently on Android\b/i);
  assert.match(llms, /\bAndroid user can view a read-only Live Link created by an iPhone app user\b/i);
});

test("no Android launch surface or roadmap claim was introduced", () => {
  const changedSurface = [
    read("index.html"),
    read("solutions/app-to-track-money-owed/index.html"),
    read("content/content-registry.mjs"),
    read("llms.txt"),
  ].join("\n");

  assert.doesNotMatch(changedSurface, /play\.google\.com|Google Play|Android download badge|Android waitlist/i);
  assert.doesNotMatch(changedSurface, /Android\s+(?:is\s+)?coming soon|coming soon\s+(?:to|on|for)\s+Android/i);
  assert.doesNotMatch(changedSurface, /(?:href|url)\s*[:=]\s*["']\/android\/["']/i);
  assert.ok(!fs.existsSync(path.join(rootDir, "android", "index.html")), "no /android/ route should exist");
});
