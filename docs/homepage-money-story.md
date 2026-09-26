# Homepage money story

The approved Quiet Focus story sits after the homepage hero. It replaces the small loan-repaid-in-part example; the hero is focused on the download action, with real app screenshots retained in the feature section. The original released version ended at Paid in full with no extra promotional outro. The September 26 uncommitted preview adds a restrained eighth chapter after that payoff.

`styles/money-story.css` scopes the presentation to `#money-story`. The deliberate design exception is a centered, lighter-weight system-font display inside this self-contained narrative; surrounding site typography remains unchanged. The white introduction and pale stage use the site’s ink and lime palette.

`assets/js/money-story.mjs` exports `initMoneyStory(root, data)` and uses `money-story-data.mjs` for seven narrative chapters plus a final app invitation. Other stories reuse the renderer with their own chapter data and matching static fallback. Reminder and statement chapters do not alter the balance. The final amount animates to zero, then disappears in favor of Paid in full; the invitation follows as a separate chapter. Reverse navigation cancels pending animation. Reduced motion snaps to each result.

Without JavaScript, the eight-step ordered list and its App Store action remain usable. Chapter buttons and a Skip story link provide alternatives to scrolling. No wheel or touch events are intercepted. The homepage shell changes overflow from scroll-container clipping to visible ancestors plus body clipping so sticky positioning works on mobile. The stage leaves 52px for the mobile menu.

The eighth chapter keeps the same scroll interval as the previous seven. Its copy and action sit directly on the pale stage, with no enclosing card. The official App Store badge appears on mobile; eligible desktops use the existing QR handoff behavior and image. Existing analytics events use separate homepage-story CTA locations. No new event schema or experiment is introduced by this preview.

## Homepage cleanup (local, September 26)

The sequence is hero → story → existing-loan import → review teaser → concise product definition → three situation paths. The two former how-it-works summaries are removed. The definition keeps the language-availability line and an official App Store badge for visitors who have just seen the story. Offline use remains explained in the FAQ; privacy remains linked in the footer.

The hero’s screenshot and competing situation/import text links are removed. The existing desktop QR handoff moves into the second hero column, keeping its destination, eligibility and tracking. Mobile keeps the primary App Store action. Real app screenshots remain in three feature cards: Loan Records, Repayment Plans and Live Link. A four-item summary replaces the long feature inventory and points to Features and Quick Start. Reviews, the ten-year story, further situations, resources, FAQ and closing download action remain.

`styles/landing-cleanup.css` contains scoped layout adjustments; generated situation markup remains intact and its registry placement is now `after-definition`. No event schema is changed.

## Final refinement and release authorization

On September 26 the owner authorized commit and production deployment after final verification. Hero reassurance copy is removed, the review teaser is a prominent testimonial card, and the video heading uses the full available column instead of a 15-character measure. The import guide and website-to-iPhone explanation are retained. Story subtitles explicitly center their last line to override the legacy paragraph rule.

Publish through the existing master-branch GitHub Pages workflow. Verify the released HTML, styles and story modules match the committed files and inspect desktop and iPhone layouts after publication.
