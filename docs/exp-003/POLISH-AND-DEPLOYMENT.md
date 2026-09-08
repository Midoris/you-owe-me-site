# EXP-003 conversion polish and deployment — September 8, 2026

The owner authorized this follow-up and safe website/backend deployment. The result offer remains `enabled: false`; publishing this source does not activate the App Clip journey. There is no Remote Config dependency.

Final offer:

- **Keep track until everyone has paid**
- “Record repayments and see what’s still owed. Your split is already filled in.”
- **Track repayments**
- “Free in the App Clip. No account needed.”
- “Your names and amounts are sent securely to create a private, 24-hour transfer link.”

The supported Clip task is free. The copy does not promise unlimited full-app use or free capabilities beyond existing limits. The ordinary App Store fallback now says “Free to download”; the redundant in-app-purchase mention beside that CTA is removed. App Store purchase disclosures and actual purchase flows are unchanged. Optional-upload consent remains visible; copy/share remain alongside the offer. The private continuation instructs the user to review names, currency and balances before Start tracking.

Computer Use checked the actual UI at 390×844 with task-local iPhone/activation overrides, real names and a 90 split; the tighter offer and Copy fit cleanly. `node --test tests/tool-transfer.test.cjs`: eight passed, zero failed/skipped. Scoped page design audit: zero hard errors. Private-route design exception remains documented. Production activation stays off until native/distribution acceptance.

The private Firebase Hosting site is created and its local target mapping is committed in `.firebaserc`. Always pass the alternate config when binding the target:

```sh
firebase target:apply hosting tool-continuation you-owe-me-tool-continuation --config firebase.exp003.json --project you-owe-me-app
firebase deploy --config firebase.exp003.json --only hosting:tool-continuation --project you-owe-me-app
```

The new backend/named database are deployed and live synthetic checks passed; all 47 existing functions have unchanged metadata. TTL is ACTIVE and scheduled cleanup was exercised. A Logging exclusion protects private-site bearer request URLs. The registered custom domain still requires CNAME `continue.you-owe-me.com` → `you-owe-me-tool-continuation.web.app` and subsequent certificate verification. Apple provisioning, physical invocation/replacement and signed release acceptance remain. Full-app imports into cloud-backed profiles remain explicitly unsupported in v1.

The public GitHub Pages release commit, actual verification time and remaining owner steps are recorded in the Business EXP-003 follow-up report. Neither this copy change nor local tests establish an acquisition or revenue improvement.
