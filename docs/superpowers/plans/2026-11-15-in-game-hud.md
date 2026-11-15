# In-game vertical HUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace external power/ally rows with corner meters and controls inside the playable viewport, following the supplied Mega Man reference.
**Architecture:** Accessible DOM overlay anchored to the existing game viewport; reuse real run state, existing select/shield handlers, sprite portraits and projectile art. A later explicit user request adds scarce ammunition and cumulative earned shields as described in the spec.
**Tech Stack:** Static HTML/CSS, JavaScript modules, Canvas sprites, Node test and Playwright.
**Spec:** docs/superpowers/specs/2026-11-15-in-game-hud-design.md

## Global Constraints
- Preserve Q/E and touch selection, actual life/cooldown/shield values, 24 encounters and all existing combat behavior.
- Remove visible rows below the track. All meters and controls fit inside 320/390/1440 screens and 844×390 expanded landscape.
- Use original game art and accessible progressbars; route ammo6, boss capacity12, no firing for1s before1ammo/.45s battle-only reload. Helpers give3ammo+1part;6parts create cumulative reserves; no free shield protection.

## Review Focus
- Native select remains usable on touch without triggering jump/fire.
- Keyboard focus, restart, blur and hidden state do not leave held inputs.
- Portraits/icons avoid the player, firing control and boss silhouette on narrow screens.
- Correct percentage for finite Infinito progress vs actual boss HP.
- Short landscape, enlarged text and award notices do not spill out of the track.

### Task 1: Integrate the vertical HUD and controls
**Files:** Modify `tanahoraflavio/index.html`, `game.css`, `runner.mjs`, `tests/ux-site.test.cjs`.
**Interfaces:** Consume existing `run.player`, `heroPowerFor(run)`, `run.reserveShields`, `run.allyShieldProgress`, `run.boss`, select and reserve-shield IDs. Produce accessible vertical meters and existing controls inside `.game-viewport`.
- [ ] Write browser assertions for corner placement, real health/ammo/shield values, no below-track rows and pointer/keyboard controls. Update prior outside-HUD requirement to the user's new inside-HUD requirement.
- [ ] Run focused tests; expect failure on placement and missing meters.
- [ ] Move existing controls and boss HUD inside viewport; style compact segmented meters; bind real values and reused art. Preserve existing keyboard/select handlers and unobstructed track gestures.
- [ ] Run focused real browser tests; inspect captures at mobile, desktop and expanded landscape. Expect all pass and no JavaScript errors.
- [ ] Run full project suite, resource version check and diff check. Obtain whole-branch review, then publish using the already authorized PR/CI/Pages/hash workflow.

### Task 2: User-requested ammunition and shield economy
**Files:** Create `runner-supplies.mjs`, `tests/ammo-supplies.test.mjs`; modify `runner-core.mjs`, `runner-allies.mjs`, `runner-combat-hud.mjs`, input feedback/help, affected behavioral tests and legal campaign pilot.
**Interfaces:** `ammoCapacityFor(run)`, `advanceAmmo(run,dt)`, `addAmmo(run,amount=3)`, `addShieldPart(run)`; run.ammo starts6, ammoIdleFor/ammoReloadFor start0. No refills on power switch. Reserve protection still uses existing activateReserveShield.
- [x] Model RED: six route shots/no idle refill, fan costs1, helper refill3 bounded, boss held-empty blocks reload until release,12capacity, cumulative6parts and no pickup protection.
- [x] Implement and GREEN: 5 new economy tests;61 relevant regressions; seven UI tests with real keyboard input, helper collection, ×2 reserves and left-boundary clearance.
- [x] Fix cache stamp using RED→GREEN from both bare URL and old ui query.
- [ ] Full root suite and20 legal campaigns under reload management, fresh review of additional behavior, resource checks, PR/CI/Pages and served hashes.

Execution notes: initial review found the shield row obscured Flávio on a normal move-left. Reproduced with a browser test; moved it to an upper third column and shortened the corner meters, then both320/390 tests passed. Weapon descriptions were added to hover titles as well as accessible descriptions. Prior full HUD-only run found the old cache-stamp issue and an extracted-handler test lacking the new HUD dependency; these were corrected before the complete economy run.

Final review: both material UX findings were reproduced RED→GREEN: left shield obscuring the grounded hero, and the long empty-clip fire label growing over the hero. Shield moved above the body; fire label shortened and footprint fixed. Reviewer exercised native pointer release/reload, caps and cumulative reserves without finding inventory/input defects. The spec was updated for the user's added scope before final commit.

Validation before CI: 61/61 relevant model regressions,14/14 targeted UI tests,7/7 ammo/clearance UI cases,4/4 final compact-button/clearance cases and20/20 legal campaigns passed. Full local run found two issues in existing tests: old shield display name and a resize observer starting its clock only after the viewport change, losing 90–175ms of already visible reaction time. The corrected resize test tracks first visibility in either viewport AND asserts contact ETA is preserved across resize;3/3 follow-up cases passed. Exact final full suite will run in CI before merge.
