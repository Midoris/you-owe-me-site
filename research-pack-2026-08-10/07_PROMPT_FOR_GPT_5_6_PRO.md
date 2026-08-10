# Prompt for GPT-5.6 Sol Pro

Use GPT-5.6 Sol Pro / Pro reasoning for this task. Attach all seven companion files from this folder, then paste the prompt below.

---

You are conducting a high-stakes organic-discovery and authority strategy for **You Owe Me**, an iPhone app and website about money between real people: IOUs, shared expenses, personal loans, repayments, changing balances, reminders, receipts, and relationship-safe communication.

## Objective

Determine the deepest evidence-supported reasons the strongest existing pages attract Google Search visibility and clicks. Then identify the largest set of **genuinely strong, non-duplicative new pages** that are likely to earn useful attention, teach people that You Owe Me solves their problem, and strengthen the product’s authority in both conventional search and AI-generated answers.

Do not explain success by saying that a page is a guide, calculator, tool, commercial page, or other format. The site contains many pages of each type. Page type is only a delivery mechanism. Investigate the underlying mechanism: the problem as users mentally frame it, exact language, urgency, emotional stakes, lifecycle stage, query breadth, answer shape, title/snippet match, functional completeness, product fit, internal authority, page maturity, competition, and any other factor supported by evidence.

## Inputs

Read every attached file in this order:

1. `00_README.md`
2. `01_GSC_AND_SITE_EVIDENCE.xlsx` — inspect all sheets, not only the dashboard
3. `02_WINNER_PAGE_DOSSIERS.md`
4. `03_WINNER_PAGE_TEXT_CORPUS.md`
5. `04_PRODUCT_AND_SITE_CONTEXT.md`
6. `05_REDDIT_USER_LANGUAGE_RESEARCH.md`
7. `06_OVERLAP_GUARDRAILS_AND_INVENTORY.md`

Also open and inspect the live pages linked in the files when web access is available, especially the homepage, Features, Reviews, Quick Start, Splitwise Alternative, Spreadsheet vs App, Best Way to Track IOUs, and the 13 cohort pages. Treat the supplied local-source metadata as authoritative for title, meta description, H1/H2, schema, internal-link counts, registry fields, and analytics markers at the snapshot date.

Conduct fresh external research where it changes a decision. Inspect current Google results/search features, competing pages/products, Reddit discussions, and AI-answer/citation patterns for the strongest candidate topics. Cite sources for externally researched claims. Do not use search-volume estimates unless sourced and labeled. Do not mistake Reddit frequency for search volume.

## Required analytical method

### 1. Validate and classify the evidence

- Explain Search Console privacy/aggregation limits and how they affect conclusions.
- Create a multidimensional definition of success: clicks, demand/impressions, ranking strength, CTR relative to intent/position, query breadth/concentration, momentum, product relevance, and—where data is absent—unknown business conversion.
- Classify every cohort page as one or more of: established acquisition winner, demand validator, high-efficiency page, emerging winner, entity/brand page, or misleading/ambiguous visibility.
- Do not claim causation from correlation.

### 2. Find mechanisms below page type

For each cohort page, analyze:

- the exact problem wording and how closely it matches users’ own language;
- whether the user searches for a category, an action, an emotional situation, a specific outcome, or a story-like problem;
- lifecycle stage and immediacy;
- audience specificity versus broad applicability;
- whether the page transforms an uncomfortable impulse into a safer action;
- whether the answer is usable immediately and what the user leaves with;
- query breadth versus dependence on a few terms;
- semantic ambiguity or off-intent impressions;
- title, meta description, H1, opening, headings, examples, FAQ, schema, interactive behavior, and internal-link support;
- differentiation from similar pages of the same format that receive less attention;
- page age/momentum and whether success is mature or still volatile.

Use counterfactual comparison. For every proposed success mechanism, identify similar existing pages that should also succeed if that mechanism were sufficient. If they do not, refine or reject the mechanism.

Produce a ranked mechanism table with: hypothesis, supporting pages, counterexamples, evidence, alternative explanations, confidence, and how reusable it is.

### 3. Reconstruct the product/problem universe

From the product pages, reviews, comparisons, registry, queries, and Reddit research, map:

- product capabilities and strongest differentiators;
- audiences and relationships;
- money-event lifecycle stages;
- recurring breakdowns in notes, spreadsheets, payment-app histories, and group-splitting tools;
- the natural phrases people use before they know an app/category name;
- problems the product solves well but the website does not yet express in users’ language;
- topics where You Owe Me can contribute original, experience-grounded information rather than generic SEO text.

Separate “people ask this” from “You Owe Me is a credible solution.” Both are required for a strong product-discovery page.

### 4. Discover candidate pages

Generate candidates from multiple evidence paths:

- adjacent intents and modifiers found in winning query sets;
- Reddit story language and repeated workarounds;
- product features or workflows without a search-language bridge;
- competitor limitations and category confusion;
- lifecycle gaps before, during, and after money changes hands;
- high-impression ambiguous areas that can be separated into clearer intents;
- pages likely to be useful citations for AI systems because they contain a clear definition, decision framework, worked example, original tool, checklist, comparison, or structured evidence.

Do not produce a fixed quota. Include as many ideas as survive the evidence threshold and no more. Weak ideas are a failure, even if the list becomes shorter.

### 5. Enforce originality and anti-cannibalization

Apply every rule in `06_OVERLAP_GUARDRAILS_AND_INVENTORY.md`.

For each candidate:

- identify the three closest existing URLs;
- compare user job, query family, lifecycle stage, promised output, and recommended next action;
- state whether the candidate should be a new URL, an expansion to an existing page, a tool inside an existing page, or rejected;
- reject shallow audience substitutions and title variants;
- explain why the new page gives Google and an AI answer system a distinct reason to retrieve it.

### 6. Score conservatively

Score each surviving candidate from 0–100 using an explicit rubric:

- 20: direct demand/language evidence;
- 15: adjacency to a proven winner mechanism;
- 15: product-solution fit;
- 15: distinctness / low cannibalization risk;
- 10: ability to provide a uniquely useful answer or interaction;
- 10: authority and internal-link compounding value;
- 10: likelihood of useful Google and AI discovery;
- 5: reasonable implementation effort.

Apply penalties for ambiguous intent, weak evidence, SERPs dominated by incompatible intent, thin product relevance, legal/financial-risk exposure, novelty without demand, and overlap.

Only recommend **new URLs scoring at least 72/100** with medium-high or high confidence. Put lower-scoring ideas in a short rejected/hold section with the reason. Do not inflate scores to meet a quota.

## Required deliverable

Return one self-contained strategy document with these sections:

1. Executive conclusion: the deepest repeatable success mechanisms, not page-type labels.
2. Evidence and limitations.
3. Cohort classification table for all 13 pages.
4. Ranked causal-hypothesis/mechanism table with counterfactual tests.
5. User-language and mental-model map.
6. Product capability → problem language → existing coverage → gap map.
7. Recommended new pages, ranked by confidence-adjusted score.
8. Existing-page expansions that are better than creating new URLs.
9. Rejected/hold ideas and why they are weak, duplicative, premature, or off-product.
10. Authority architecture: how the recommended pages should connect to existing winners, hubs, comparisons, tools, product pages, and one another.
11. Sequenced publishing roadmap: first 5, next group, and evidence-dependent later group.
12. Measurement plan for Search Console, on-page engagement, App Store opens/CPPs, and AI citations/referrals.

For every recommended new page include:

- priority and score with component breakdown;
- confidence and evidence strength;
- working title, H1, and proposed slug;
- the user’s problem in their own likely words;
- primary and secondary query families (not invented volume);
- exact supporting evidence from Search Console, Reddit, product pages, competitors, or SERP research;
- lifecycle stage, audience, and intended outcome;
- why the existing site does not already satisfy it;
- three closest existing URLs and explicit overlap analysis;
- proposed page type only after the problem is established;
- unique information gain / what this page contributes that generic competitors do not;
- recommended content structure, examples, interaction/tool requirements, FAQ, and structured data where justified;
- how it naturally demonstrates or routes to You Owe Me without turning the answer into an advertisement;
- internal links in and out;
- AI-answer usefulness/citability design;
- risks, disconfirming evidence, and what would change the recommendation;
- success metrics and a 28/90-day validation plan.

Be skeptical, evidence-led, and explicit about uncertainty. Prefer a smaller set of defensible opportunities over a large set of plausible-sounding titles. If the evidence does not justify enough strong new URLs, say so and recommend the highest-value existing-page expansions or additional data collection instead.
