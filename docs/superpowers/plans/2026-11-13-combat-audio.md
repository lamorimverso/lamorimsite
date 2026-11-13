# Animated combat and cast audio implementation plan

Goal: finish the recovered requests for animated weapon bodies, reactive boss attacks, and balanced actor audio.
Architecture: keep the existing Canvas renderer, pure boss planner and Web Audio/identified recording system. Preserve existing campaign progression and legal dodge windows.
Spec: recovered conversation “Correções da mecânica do jacaré”, final two requests.

Global constraints: 20 encounters; first boss at 22 km; jacaré lasts 10 seconds; História/Infinito and configurable controls remain; no fabricated speech or voice cloning.
Review focus: resize, reduced motion, cancellation after mute, no unavoidable attacks, no unlabelled replacement of voices by SFX.

## Task 1 — Internal projectile motion
- [x] Add a failing geometry test excluding rotation, transforms and decorative effects for every weapon family.
- [x] Implement internal deformation/articulation in runner-art.mjs, centered on existing physics; retain stable reduced motion.
- [x] Verify geometry and existing animation/casting suites.

## Task 2 — Adaptive boss planning
- [x] Add failing tests proving player position/action changes a committed attack, no mid-flight homing, bounded streaks and reproducibility.
- [x] Add pure planArenaAttack(boss, player, rng) in runner-bosses.mjs; choose at charge start, preserve plan through launch, and communicate actual action.
- [x] Verify all 20 encounters, dodge timing and campaign pilot.

## Task 3 — Cast audio and mix
- [x] Test every actor has a distinct nonverbal audio identity and actor/ally events reach the audio system; recordings stay truthful and independent.
- [x] Integrate short verified archive clips from official sources where recoverable, source metadata and subtitles; add balanced sound identities for the whole cast.
- [x] Test mute/focus/lifetime, priorities, anti-repetition and peak levels; normalize recordings.

## Release
- [x] Update resource hashes, run complete suite and browser captures on mobile/desktop, inspect actual frames.
- [x] Commit and publish through the existing GitHub flow; compare served files and document remaining voice-source limits precisely.

Validation:480/480 tests,20/20 legal campaigns. Independent review found counterattack travel-time mismatch; fixed with a failing-then-passing real-shot test. Falling weapon rendering corrected similarly. Captures:390px/1440px, four classes and final boss, no page errors.12 archive files decode; maximum measured sample peak0.653. Full voice coverage remains explicitly incomplete;32 nonverbal banks are not32 voices.
