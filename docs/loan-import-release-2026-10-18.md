# EXP-011 website review refinement — production verification

The accepted website change is live at [You Owe Me](https://you-owe-me.com/) and the [loan import intake](https://you-owe-me.com/tools/personal-loan-payment-tracker/#import-loan-history).

Application commit: `c4bf0704cb1eb223d1be726c4cde95aaf137eca0`. Accepted 35-file patch SHA256: `29aaa899269c10c95d6f93e0c5b7ddf0284348cdf33cf19f016facd4349f0acf`. The commit contains that exact patch. Later release evidence is a separate documentation-only commit and does not change the application.

The Pages deployment job completed at **2026-10-18 11:42:49 UTC**. Its explicit successful deployment status was recorded at **11:42:50 UTC / 18:42:50 Asia/Bangkok**. Public byte verification completed at **11:43:06 UTC / 18:43:06 Bangkok**. These times establish the release independently of commit/push/build completion.

[Pages run 39124273825](https://github.com/Midoris/you-owe-me-site/actions/runs/39124273825) succeeded for the exact application SHA. [Deploy job 117666109261](https://github.com/Midoris/you-owe-me-site/actions/runs/39124273825/job/117666109261) succeeded, and deployment `7154058457` reported `success` with environment URL `https://you-owe-me.com/`. Raw run, job, deployment and status receipts are committed under `docs/verification/loan-import-release-2026-10-18/`.

HTTPS Git publication initially failed because no usable HTTPS keychain credential was available. The existing SSH identity authenticated successfully as the repository owner, and `git push git@github.com:Midoris/you-owe-me-site.git master` published the reviewed commit. The configured HTTPS remote was retained. No token, key, credential, new account setup or access grant was needed or exposed. No automatic approval review rejection occurred.

## Public resources

`public-byte-parity.json` records **29 successful byte-for-byte matches** against `git show c4bf0704cb1eb223d1be726c4cde95aaf137eca0:<path>`, including response sizes, SHA256 hashes and response metadata. Requests used the actual public URLs with cache revalidation. No production analytics was involved in these reads.

Coverage includes all ten affected HTML routes listed in the [review contract](loan-import-review-2026-10-18.md), versioned and unversioned URLs of the six changed runtime files, unchanged importer/UI/config/image/error dependencies, QR vendor script, and the local analytics dependencies. All affected pages serve the `20261018-review1` resource graph. This validates actual deployed source bytes, not only HTTP status or a successful build.

## Public browser smoke and analytics exclusion

CUA opened the real public direct intake, entered a blank manual review, activated the correction message and verified focus on the missing Person field. The review showed one Continue control and correctly hid the unavailable history-only option. Desktop 1440×1000 and mobile 390×844 views had no horizontal overflow. The public homepage offer opened one importer and restored the same blank review. No console warning/error was observed on the direct intake. Screenshots and public-mobile metrics are committed with the receipts.

No actual name, amount, source document or other customer data was entered. No Continue activation, explicit discard, interpretation request, transfer creation, App Store opening, QR scan or native operation was performed during public smoke. New diagnostic event paths were not activated. The broader synthetic paths, QR/fallback and long-history/mobile behavior were verified locally before acceptance; see the review contract and its 193 passing full-suite / 45 focused tests.

The public smoke may contribute existing QA events. Exclude the conservative **2026-10-18 11:43:00–11:46:59 UTC / 18:43:00–18:46:59 Bangkok** window on `/tools/personal-loan-payment-tracker/` and `/` when interpreting very small release-window counts. Implementation QA performed one manual-entry activation (`uomi_web_loan_input_manual`) and one homepage offer activation (`uomi_web_loan_offer_chosen`). The coordinator independently repeated the public direct-intake check around 11:44–11:46 UTC, contributing one more reported manual-entry activation and confirming the pinned graph and correction focus. The broader exclusion window covers both checks; `coordinator-live-web-review.png` preserves that independent screenshot. Offer exposure (`uomi_web_loan_offer_viewed`), ordinary page-visited and CTA-view events may also have been generated. These are known UI actions/possible dispatches; GA delivery was not separately queried or claimed.

Viewport overrides are desktop in-app-browser checks, not physical iPhone/Safari, touch, software-keyboard or committed native-import tests. This release refines the website portion of EXP-011 and does not fix or instrument native save behavior. The website's existing transfer-prepared event remains distinct from a committed native import. No analytics parameter names or GA custom definitions were added.

## Rollback and scope

Rollback target before this application change: `1a2ca53c5ba9cf830311f40d9cf1ac880e1030b0`. Roll back through a reviewed `git revert c4bf0704cb1eb223d1be726c4cde95aaf137eca0` on `master`, publish through the same SSH/Pages workflow, and verify the revert SHA's deployment status and public bytes. Preserve later unrelated work; do not reset the branch. This release has no backend migration or schema change to undo.

The pre-existing untracked `audits/` directory was excluded from both application and evidence commits. No native repository, backend, quotas, pricing, financial arithmetic, storage/transport schema or other page content was changed.
