# Boss hierarchy, Paraguay, and voice variety implementation plan

Goal: ordered combat difficulty, exclusive character powers in every attack path, Paraguay/Santiago Peña between Argentina and Florida, and more attributed real voice clips without repetitive playback.

User has requested direct execution throughout this conversation. Continue the established native implementation/review/test/publication workflow without another design approval round.

Decisions: keep the existing Canvas/ES modules and full illustrated sprites. Six 7km locations (Brasília, Rio, Argentina, Paraguay, Florida, White House), 24 encounters, four ascending ranks per location. Fixed character hierarchy: patrol PF/army; leaders Janones/Joice/Soraya/Boulos; commanders Haddad/Simone/Dino; governors Xandão/Lula/Dilma/Santiago/Bossonari/final ghost. These are fictional GAME combat ranks. Character profiles own their class, powers, patterns and cues. Stage difficulty scales these profiles but never transfers another character's weapon.

- [x] Add failing tests for six-stage route, stable character ranks, exclusive weapon ownership, all vertical/rehearsal/endless emission paths, and 24-stage completion.
- [x] Centralize route identities; add Paraguay palette/landmark, HUD/progress, ally eligibility by identity, regional soldier art and Santiago full-body keyframes.
- [x] Implement fixed boss profiles and 24 ordered encounters, conservative difficulty ramp and readable unique patterns. Remove generic falling-case substitution and cross-character defaults. Render/label/sound every new projectile.
- [x] Add short complete excerpts from already identified archive sources with source hashes, offsets and normalized levels. Use actor-specific shuffle bags that exhaust alternatives before repetition, and contextual mid-fight lines with safe gaps; retain no-overlap, mute, cancellation and authentic attribution.
- [x] Verify model/sprite bounds, hit origins, transition continuity, six regional uniforms, all ranks and power owners, mobile/desktop and complete campaigns. Run relevant targeted tests, full suite, resource/build checks and native pixel QA.
- [ ] Review, publish through PR/CI, verify deployed file hashes, and report usable game/preview links.

Constraints: preserve 22km first boss, 10second jacaré, controls, final ballot and distinct real-speaker identities. New recordings must come from identified actual sources; no invented impersonation or cloned speech. Sources may be excerpted only at complete utterance boundaries, with context retained in credits. Existing source PNGs remain untouched.

Additional user requests implemented: eight movement Foley events with three variants, physical damage feedback, proactive attacks from all 24 bosses, and continued distance escalation beyond the old risk cap of 10. Independent review found cross-channel Joice repetition and an incorrect HUD denominator; a shared selector and regression test fixed both, and the follow-up review passed.

Validation: 523/523 root tests, 27/27 native Canvas tests, 20/20 complete campaigns with all 24 encounters, and 2,000 legal evasive sequences passed. Three additional browser flows verified Santiago's two phases and autonomous damage, keyboard/touch Foley, and audible decoding of all 17 MP3s. The sound demo passed mobile smoke testing (8 movement buttons, 17 voice buttons, no overflow or JavaScript errors). Captures of nine encounters at mobile/desktop sizes reported no errors; Paraguay soldiers and Santiago were visually inspected. Sprite build checks, asset version checks, and git diff checks passed.
