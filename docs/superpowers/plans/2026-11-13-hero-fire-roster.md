# Hero Fire and Complete Roster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Visible shooting body animation and no invisible ground characters.
**Architecture:** Keep existing atlases; add a focused articulated renderer and shared shooting geometry. Route exceptional ground actors through their own art.
**Tech Stack:** JavaScript ES modules, Canvas, Node tests, Playwright CI.
**Spec:** docs/superpowers/specs/2026-11-13-hero-fire-roster-design.md

## Global Constraints
Preserve collision heights, controls, damage, firing cadence, sounds and campaign milestones. Preserve original faces and normal running frames.

## Review Focus
- Shooting while moving backward faces the shot.
- Jumping and sliding shots share physical muzzle coordinates.
- Reduced motion retains meaningful action states.
- Ground-only exceptional identities paint real bodies.
- Atlas loading and retries still work without added assets.

## Tasks
- [x] Add failing real Canvas tests for all ground actors and hero firing states; run and confirm missing poses/bodies.
- [x] Add pure hero release/recoil/recovery geometry and localized articulated art; integrate character draw and visual duration without changing cooldown.
- [x] Route Exército/Bossonari/Fantasma ground art correctly; test full roster and original faces.
- [ ] Run local full suite, campaign pilot, desktop/mobile CI; inspect captures and obtain code review.
- [ ] Publish tested source and verify deployed files.

Local validation: 334/334 tests, including native Canvas checks of 32 characters/forms and 20 boss encounters; 20/20 complete story campaigns. Independent code review found no important defect. Browser CI and release pending.
