# Clean running HUD

User asks for a cleaner, smoother HUD and specifically no life bar during ordinary running, only boss fights. Preserve the published ammunition and cumulative shield economy, native select/Q, shield/E and safe screen corners.

Use two small aligned controls during the route: power icon with ammunition count, and shield icon with stock/fragment progress. Hide the hero life/portrait panel and the vertical ammo gauge outside boss encounters. Restore life and vertical combat gauges during a boss, with lighter frames and fewer labels. Smooth only meter fills and color feedback; avoid moving pointer targets or adding continuous decorative effects. Keep reduced-motion handling.

- [x] Browser regression: route hides life, compact controls remain inside track, boss shows real life, returning to route hides life again without changing supplies; capture mobile and landscape.
- [x] Implement presentation state in runner-combat-hud, add column classes and replace current HUD CSS with consistent compact controls and smooth fills.
- [ ] Verify narrow left-boundary clearance, ammo/select/shield keyboard and touch, reduced motion and full CI. Publish via existing authorized PR/Pages/hash workflow.

## Added user requirement: full controls and controller support

The user specifically asks the gear to show all abilities (e.g. forward D), allow changing every command, and support game controllers. Implement eight rows: back, forward, jump, crouch, fire, next power, shield, start/retry. Replace the duplicate fire-only preset UI with the full binding table; preserve old saved fire settings through normalization.

Keyboard defaults remain A/←, D/→, W/↑/Space, S/↓, J/Z, Q, E, Enter. Controller defaults use left stick/directional movement, A/× jump, B/○ or down crouch, X/□ or RT fire, Y/△ or RB next power, LB shield, Start begin/retry. Any row can capture a new keyboard key or controller button/axis. Reject conflicts clearly, allow Escape/cancel, restore defaults and persist locally. Pause simulation while settings are open, release held sources when editing, require neutral controller inputs after focus/menu/reset, and resume safely after browser history restoration. Final ballot supports controller direction selection, A activation, B correction and Start confirmation.

Files: new `runner-control-map.mjs` (validated bindings), `runner-gamepad.mjs` (device transitions, no scheduler), `runner-control-settings.mjs` and `control-settings.css` (capture table); integrate into runner and gear HTML. HUD remains presentation-only; ammunition/shield economy is preserved.

Tests: pure model/driver defaults, migration, conflicts, malformed data, dead zones, disconnection and reentrancy; real browser remap persistence and input suppression; API-driven controller move/jump/fire/remap, start and ballot, pagehide/pageshow recovery; clean route vs boss HUD, touch/native select, narrow and expanded layouts. Root performs integration and full suite; independent review before publication.

Review fix: settings' focusable scroll region exposed gameplay keyboard actions despite suspended simulation. Reproduced by firing J and activating E inside it, then fixed by gating keyboard, pointer, fire, movement, shield and power selection while gear is open and disabling track controls until close. New browser regression covers unchanged ammo/reserves/time/position and re-enabling on close. Updated stale help for the full controls table and24 encounters. No further material review findings.

Final local verification:25 focused model/handler tests passed; controller map/driver/input focused suite passed;6 integration cases for saved bindings, controller remapping, gear and cache passed;4 cases for menu suppression and actions passed;5 final route/boss HUD, initial instructions and landscape-gear cases passed.20/20 full legal campaigns completed. The broad local suite ran614 cases and found one obsolete initial-help assertion targeting the removed fixed-key paragraph; it now checks actual keyboard rows and passed its targeted follow-up. CI must verify the exact final tree before merge. Independent review's material menu-input finding is fixed with a failing-then-passing browser regression; no outstanding material findings.
