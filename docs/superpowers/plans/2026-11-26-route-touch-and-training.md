# Route touch and direct boss training implementation plan

> For agentic workers: use superpowers:executing-plans for the touch fix and superpowers:subagent-driven-development for the isolated training implementation.

**Goal:** Deliver the approved integration, make weapons usable by touch during the route, and offer direct practice for every Story encounter.

**Architecture:** Preserve the current ES module game and input sources. Extend the existing practice encounter mechanism instead of creating another campaign or save format.

**Tech stack:** JavaScript modules, Canvas, Node tests, Playwright, GitHub Pages.

**Spec:** Issue #84; docs/superpowers/specs/2026-11-15-in-game-hud-design.md; user approval to publish after passing tests on 26 November 2026.

## Global constraints

- Scope is Corre, Flávio! and its tests only. Preserve existing campaign, Battle, assets, saves and configured controls.
- Route ammunition remains six; allies replenish three. Automatic reload remains restricted to released fire in boss combat.
- Preserve swipe plus second-finger jump, crouch plus jump, boss second-finger firing, and pointer cleanup. No extra mobile overlay controls.
- The existing authorization covers integration and publication after tests. Routine implementation choices do not require another approval.

## Review focus

- Stationary primary touch plus second finger shoots; releasing the first finger does not accidentally jump.
- Directional or crouching primary touch plus second finger still jumps.
- Fire release, pointer cancellation, settings, focus loss and boss exit cannot leave a held shot.
- Practice cannot update the campaign record, progress or ballot; normal start still starts a clean campaign.
- Every mandatory and optional encounter starts in its correct arena with its normal combat or traversal rules.

### Task 1: Route touch firing

- [ ] Add browser regressions in tests/mobile-runner-controls.test.cjs for Story and Endless; verify failed shot acquisition before changing production code.
- [ ] In tanahoraflavio/runner.mjs identify the primary stationary pointer, accept a secondary shot and consume the primary tap while retaining subsequent swipes. Preserve the existing boss/route cleanup and mobile layout.
- [ ] Update gesture instructions in runner.mjs and index.html. Regenerate runtime asset versions.
- [ ] Run mobile and existing combined-gesture/browser regressions, ammunition tests and complete CI; review and integrate PR #96 at its exact tested head.

### Task 2: Direct practice

- [ ] Add engine tests proving direct entry for mandatory and optional encounters, valid IDs, normal rules, victory termination and independence from campaign state.
- [ ] Extend the existing encounter lookup and run-state practice initialization using existing boss definitions. Keep stats, damage, ammunition and story progression unchanged outside practice.
- [ ] Extend the existing practice UI to list mandatory and optional encounters and label training clearly; restarting a practice repeats that encounter.
- [ ] Add browser checks for selection, restart, return to campaign and record isolation in desktop/mobile. Regenerate versions and synchronize existing identity imports.
- [ ] Run relevant tests and full CI; review, merge and verify the published exact commit. Update #84 only for completed milestones.

## Execution notes

- 26 November: PR #96 at 87f6da5 has passing full CI. Independent engine review found no additional blocking regression. Route touch firing is absent despite the core accepting route attacks.
- Implementation ruling: keep route touch gestures and consume the supporting tap after shooting, instead of adding a visible mobile fire button or altering scarce ammunition.
