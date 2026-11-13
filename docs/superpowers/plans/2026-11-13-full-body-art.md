# Complete character bodies and readable weapons

Goal: replace head-on-generic-stick-body presentation with complete illustrated articulated bodies and complete scalable weapon artwork.
Source: user screenshots and request to improve bodies, arms and projectiles at both small and large sizes.
Approach: preserve original atlas identities and existing run cycles; replace thin line limbs and flat interchangeable coats with closed illustrated anatomy, clothing silhouettes, shading and joint motion. Share the body renderer with the hero's shooting pose and special ground runners. Give weapon families explicit visual profiles, internal parts and size-aware detailing.

- [x] Reproduce head-only/generic-body presentation in body-only tests and capture before views.
- [x] Add runner-body-art.mjs with distinct wardrobe/anatomy profiles and filled articulated limbs, hands, trousers and shoes; integrate bosses, hero firing and special runners.
- [x] Redraw weapon family bodies with complete silhouettes, material shading and independently moving components; preserve collision centers, cues and timing.
- [x] Verify body/weapon regions independently of heads/particles at small, normal and enlarged scales; visually inspect pose sheets for the full cast and every weapon family.
- [x] Run focused and full browser suites, independent code review and existing campaign pilot.
- [x] Publish through the existing repository flow and verify served hashes.

Keep:20 encounters, classes/AI, source voices, controls, modes, first boss22km, jacaré10seconds, final ballot. No new gameplay or difficulty mechanics in this art correction.

Verification:504 complete-suite tests passed;46 native art tests passed;20/20 legal campaigns. Latest facial-detail polish also passed focused native46 and browser3 checks. Review corrected the old scale(1,height/44) expectation, with real gameplay size/bounds tests. Publication evidence will be recorded in the PR.
