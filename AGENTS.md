# You Owe Me Site Agent Notes

Before creating or polishing any modern content page, read `docs/page-design-contract.md`.

For a new page or a page-specific stylesheet, run:

```sh
node scripts/audit-page-design.mjs /page-route/
```

The audit is intentionally scoped to the page being worked on so legacy pages do not block unrelated work. Treat failures as design-system drift unless the page has a deliberate, documented exception.
