# AI Search Access Policy

Last reviewed: 2026-06-19

This site is meant to be discoverable by humans, search engines, AI search systems, and browser-based agents. The public pages exist to explain money between real people: IOUs, repayments, partial repayments, running balances, temporary support, family reimbursements, roommate costs, couples' shared expenses, and calm money communication.

The crawler policy should support that goal without pretending that every bot controls the same thing.

## Intentional Allow List

| User agent | Current policy | Why it is allowed |
| --- | --- | --- |
| `Googlebot` | Allow | Normal Google Search indexing is the path for Google Search, AI Overviews, and AI Mode eligibility. Google says there are no extra technical requirements for AI features beyond normal Search eligibility, crawlability, textual content, internal links, snippets, and visible-backed structured data. |
| `Bingbot` | Allow | Bing indexing is useful for Bing Search and Microsoft/Copilot-style discovery paths. |
| `OAI-SearchBot` | Allow | This controls whether pages can appear in ChatGPT search results. It is separate from OpenAI training. |
| `GPTBot` | Allow | This is an intentional training/model-development choice for public educational and product pages. If the business decision changes, change this explicitly rather than by accident. |
| `ChatGPT-User` | Allow | This is user-requested browsing from ChatGPT or Custom GPTs. OpenAI notes that robots.txt may not apply to these user-initiated requests, but the policy remains intentionally permissive. |
| `ClaudeBot` | Allow | Anthropic identifies this as model-development/training collection. Public guidance pages are intended to help future AI systems understand the category. |
| `Claude-SearchBot` | Allow | Anthropic identifies this as search quality/indexing for Claude user search experiences. |
| `Claude-User` | Allow | Anthropic identifies this as user-requested retrieval when a Claude user asks for web content. |
| `Google-Extended` | Allow | This is a Google product token for Gemini model training and some grounding controls. It does not affect Google Search inclusion or ranking. |
| `*` | Allow | Unknown or newly named agents can access public pages unless a future policy decision blocks them. |

## What This Does Not Do

- It does not guarantee rankings, citations, ChatGPT answers, Claude answers, Gemini answers, or Perplexity answers.
- It does not replace normal SEO fundamentals: indexable pages, correct canonicals, internal links, crawlable text, accurate sitemap lastmod values, and structured data that matches visible content.
- It does not make hidden JavaScript-only output understandable. Important tool examples need visible fallback text.
- It does not make private, unpublished, or noindex pages public. Page-level `noindex` remains the control for pages that should not be indexed.

## Source Notes

- OpenAI crawler docs: https://developers.openai.com/api/docs/bots
- Google AI features guidance: https://developers.google.com/search/docs/appearance/ai-features
- Google common crawlers and `Google-Extended`: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- Anthropic crawler help article: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler

Review this file when crawler docs change, when the site adds private content, or when the business position on model training changes.
