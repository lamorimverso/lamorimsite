# Restore original complete sprite style for combat

User correction: use the whole illustrated character from the original source of the head, redraw full animation frames like Flávio. The assembled head-plus-vector-body appearance is explicitly rejected.

- [x] Generate and inspect full-body illustrated combat keyframes directly from the original source atlases, preserving chibi head/body ratio, faces, clothes and shoes; no platform, weapon, glow or scenery baked into sprites.
- [x] Store original PNG outputs and source metadata; build optimized WebP atlases with explicit crops, planted-foot pivots and release points.
- [x] Load combat sheets as essential artwork and render one entire sprite per character/frame. Select ready/wind-up/release/recovery from actual combat phase and progression.
- [x] Keep platform/effects separate and use full-sprite anchor points for physical launch. Existing run sprites remain complete originals.
- [x] Remove the rejected vector-body composition from successful combat rendering, including the hero firing and special actors as appropriate.
- [x] Verify all frame bounds, whole-image source crops, timing, direction, reduced motion, release position and cancellation. Inspect the actual game and animated cast gallery.
- [ ] Publish after CI and compare served hashes.

Review: native render/pixel checks and manual source review complete. Independent review was attempted; the reviewer could not run due to its usage limit.

Additional user request: soldiers change with each place/country. Added five route uniforms, four full running frames each, pinned at spawn and retained across scene transitions.

Preserve:19 detailed weapon types, balanced archive audio, AI/classes,20 encounters,22km opening,10second jacaré, controls/modes and final ballot. This changes the source artwork and animation selection, not game difficulty or routes.
