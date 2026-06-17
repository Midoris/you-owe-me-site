# Best Next Step System

The Best Next Step module is a registry-powered routing component for helping readers choose the next action for a specific money-between-people situation. It is not a generic related-links block.

## How It Works

1. Add or update the page entry in `content/content-registry.mjs`.
2. Make sure the entry has `pageType`, `cluster`, `parent`, related pages/tools/solutions, and `appStoreCpp`.
3. Add `bestNextSteps` only when the page needs custom wording or card order.
4. Add a marker block in the page HTML where the static module should render:

```html
<!-- best-next-step:start -->
<!-- best-next-step:end -->
```

5. Run:

```sh
node scripts/build-best-next-steps.mjs
node scripts/validate-content-registry.js
node scripts/audit-content-routing.mjs
```

The build script writes crawlable static HTML between the markers. Edit the registry, not the generated HTML.

`audit-content-routing.mjs` compares live route files, registry entries, hub links, rendered Best Next Step output, sitemap URLs, and App Store CPP routing metadata. It fails only on hard routing problems such as broken internal links, missing strategic BNS output, missing registry coverage, and invalid App Store URLs; strategic gaps such as planned CPPs or optional BNS opportunities stay as warnings.

## When Defaults Are Enough

Use cluster defaults when the page follows a common pattern for its topic. Examples:

- `money-owed`: calculate the balance, write a reminder, track the ongoing balance.
- `temporary-support`: create a support record, plan repayment, send an update.
- `roommates`: calculate the monthly settle-up, confirm repayment, track household balances.
- `family`: use a reimbursement template, track parent expenses, calculate a running balance.

Use page-type defaults only as a conservative fallback. Strategic pages should usually have page-specific text.

## When To Customize

Add page-specific `bestNextSteps` when the page has a clear intent or tone that defaults would flatten.

Guide page example:

```js
bestNextSteps: {
  enabled: true,
  variant: "guide",
  placement: "after-direct-answer",
  template: "custom",
  heading: "Best next step for your reminder",
  intro: "Choose based on what is unclear: the amount, the wording, the repayment status, or the ongoing balance.",
  steps: [
    {
      label: "Amount unclear",
      title: "Calculate the amount first",
      description: "Use this if the money came from a shared bill and you are not sure what they owe.",
      href: "/tools/split-expense-calculator/",
      type: "tool",
      intent: "clarify_amount",
      priority: 1,
      analyticsId: "polite_reminder_amount",
    },
  ],
}
```

Calculator page example:

```js
bestNextSteps: {
  enabled: true,
  variant: "tool",
  placement: "after-tool-result",
  heading: "After you calculate, choose the next step",
  steps: [
    {
      label: "Confirm",
      title: "Create a repayment receipt",
      description: "Use this after someone pays their part and you want a clear confirmation.",
      href: "/tools/repayment-receipt-generator/",
      type: "tool",
      intent: "confirm_payment",
      priority: 1,
    },
  ],
}
```

Solution page example:

```js
bestNextSteps: {
  enabled: true,
  variant: "solution",
  placement: "after-hero",
  steps: [
    {
      label: "Use app",
      title: "Track shared expenses in You Owe Me",
      description: "Use this if shared costs repeat and you need a clear history.",
      href: "app-store:self",
      type: "app",
      intent: "download_app",
      priority: 4,
    },
  ],
}
```

Hub page example:

```js
bestNextSteps: {
  enabled: true,
  variant: "hub",
  placement: "after-router",
  heading: "Choose your starting point",
  steps: [
    {
      label: "Write",
      title: "Create a repayment message",
      description: "Use this when the amount is clear but the wording is awkward.",
      href: "#messages",
      type: "anchor",
      intent: "write_message",
      priority: 1,
    },
  ],
}
```

## Choosing The First Card

Make the first card the lowest-friction useful action. It should not automatically be the app. For boundary-setting pages, the first card should often be an on-page script or boundary section. For calculators, the first card should usually be the immediate action after the result: message, receipt, repayment plan, or ongoing tracking.

## App Store Links

Use `href: "app-store:self"` when the card should use the page entry's `appStoreCpp`. Use `href: "app-store:family-reimbursements"` only when you need an explicit CPP override. If the CPP mapping is null, the renderer falls back to the general App Store URL and validation warns.

Do not add App Store badges inside the module. App cards are text cards so they do not duplicate hero or final CTA badges.

## Disabling

Use `enabled: false` only when the module would be misleading, such as legal/support pages or pages that already have a complete situation router. Always include `skipReason`.
