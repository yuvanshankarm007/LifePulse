---
status: approved
---

# Design brief: LifePulse

<!-- Generated for Learn AR with SPECS (Devpost & Snap Inc.) -->

## The one spatial moment
A bystander or caregiver rushes to assist a collapsed individual. Through Snap Spectacles, LifePulse activates: a glowing 3D compression target and cadence ring project directly onto the victim's chest, flashing at exactly 110 BPM with synchronized spatial audio cues, while a floating counter tallies "30 compressions, then 2 rescue breaths" — keeping the rescuer's eyes locked on the patient and both hands locked in CPR compressions without ever touching a screen.

## Why it belongs on glasses
- **Uses:** Shares your view, Draws in the world, Leaves your body free.
- **Why it's better than the phone or laptop version:**
  - **Both hands are physically occupied:** High-quality CPR requires interlocking both hands, locking elbows, and exerting 50–60 kg of upper body force at 100–120 compressions per minute. You cannot hold, swipe, or unlock a smartphone while performing chest compressions.
  - **Eyes cannot leave the patient:** Looking down at a phone screen breaks visual monitoring of the victim’s chest rise, airway, and facial response. Glasses overlay critical guidance directly in the rescuer's forward gaze.
  - **Zero-touch contamination:** In medical emergencies involving fluids or outdoor grime, touching personal mobile screens is hazardous and awkward. Glasses provide completely hands-free visual and audio guidance.
  - **Spatial precision:** Unlike a 2D instructional video, LifePulse AR anchors the exact anatomical placement (center of the chest on the lower half of the sternum) and illustrates AED pad placement directly over physical anatomy.

## Product or overlay
- **Type:** Overlay (responds to and anchors onto the victim's physical body and surrounding emergency space).
- **What the real version would sense:**
  - Real-world victim orientation (laying supine on the floor).
  - Chest recoil and compression cadence via front-facing camera depth and accelerometer/IMU sync.
  - AED unit packaging and electrode pad placement.
- **Stand-in for the preview:**
  - A realistic 3D human mannequin model placed supine on the floor 1.2 meters in front of the camera.
  - An interactive "Emergency Scenario Trigger" panel to start/pause the cardiac arrest simulation.
  - Interactive SIK buttons: "Inspect Patient", "Simulate 30 Compressions", "Deploy AED", and "Check Recoil/Cadence".

## Where things live
- **Where the user is looking during the main task:** Looking downwards at roughly a 35°–45° tilt toward the floor, focused on the victim's chest at a distance of 0.8m to 1.1m.
- **Chest Compression Target & Pulse Ring:**
  - Anchored directly onto the lower half of the victim's sternum (between the nipples).
  - Height: Sitting flush on the torso surface (~25 cm above floor level).
  - Distance: ~0.9 meters from rescuer eye level.
  - Size: 18 cm diameter concentric pulse target with glowing green/cyan additive shaders.
- **Heads-Up Emergency Status HUD (Selective Mini-Card):**
  - Position: Floating 15 cm above the victim's chest, angled 20° up toward the rescuer's eye line.
  - Distance: ~0.95 meters.
  - Size: 24 cm wide x 14 cm tall.
  - Contents: Current Phase ("CPR CYCLE 1: COMPRESSIONS"), Live Counter ("24 / 30"), Cadence Indicator ("110 BPM — PERFECT CADENCE").
- **AED Electrode Pad Holographic Guides:**
  - Pad 1 (Right upper chest below collarbone): Glowing blue outline (12 cm x 10 cm).
  - Pad 2 (Left lower ribs, mid-axillary line below armpit): Glowing blue outline (12 cm x 10 cm).
  - Anchors: Attached directly to the virtual torso mesh.
- **Emergency Action Navigation Controls:**
  - Position: Arm's length (~70 cm), floating slightly to the right of the workspace (+35 cm X offset, -15 cm Y offset relative to center).
  - Size: Big, high-contrast SIK pinch targets (12 cm x 6 cm each) that highlight on gaze/aim.

## Hands and input
- **Primary Input Mode:** Hands-free passive audio/visual guidance during active compressions.
- **Secondary / Fallback SIK Inputs (driven by mouse in preview, pinch on hardware):**
  - **"Pinch to Confirm Responsiveness / Call 911"**: Large 12 cm button floating near the patient's head.
  - **"Pinch to Start CPR Cadence"**: Center action button, initiates the 110 BPM metronome and ring animations.
  - **"Pinch to Advance Cycle / AED Ready"**: Advances to the defibrillation guide.
- **All SIK Interactables:**
  - Utilize Spectacles Interaction Kit (SIK) Interactable with generous visual hover states (border glow + 1.1x scale pulse).
  - Equipped with spatial click sounds on trigger.
- **Voice Fallback:**
  - Voice command: "Start CPR" / "AED Ready" paired 1:1 with corresponding large visible SIK pinch buttons.

## When things show
- **Phase 1: Assessment (0s – 10s):**
  - Shows: "Check Responsiveness & Breathing" card + 911 Emergency confirmation button over patient head.
  - Hides: All CPR rings and AED guides to keep FOV uncluttered.
- **Phase 2: Active CPR Compressions (Cycle of 30:2):**
  - Shows: Sternum pulse ring (pulsing at 110 BPM), compression counter (0 to 30), and spatial metronome chime.
  - Hides: Assessment card.
- **Phase 3: Rescue Breaths (after 30 compressions):**
  - Shows: "Open Airway & Give 2 Breaths" prompt over victim's mouth with a 4-second countdown progress bar.
  - Hides: Sternum compression ring temporarily to reduce visual noise.
- **Phase 4: AED Pad Placement:**
  - Shows: Glowing holographic pad targets on the torso + directional spatial chime pointing to the virtual AED unit.
  - Hides: Compression counter.
- **Audio Cue for Out-of-View Elements:**
  - If the rescuer turns their head away from the patient, a subtle directional arrow at the edge of the display plus a spatial audio beacon guides their gaze back to the patient's sternum.

## Done criteria
Each criterion is fully verifiable within Lens Studio Interactive Preview:
1. **Scene Initialization & Mannequin Placement:** On Lens launch, a 3D supine patient mannequin is anchored on the floor 1.0 m in front of the camera, and an initial "Assess Patient / Call 911" card is visible within the 37° FOV without head turning.
2. **Interactive SIK Activation:** Clicking the "Start CPR" button with the mouse (simulated pinch) activates the CPR state: the sternum target ring glows and pulses at 110 BPM, accompanied by an audible metronome beat.
3. **Compression Cycle Counting:** Clicking the "Simulate Compression" button increments the on-screen compression counter from 1 to 30.
4. **Automatic Phase Transition to Breaths:** Upon reaching compression count 30, the sternum ring dims, and the "Give 2 Rescue Breaths" prompt immediately appears over the victim's head with a 4-second breath timer.
5. **AED Pad Holographic Guidance:** Pinching/clicking the "Deploy AED" button hides the breath card and renders both electrode pad target zones (Right Collarbone & Left Ribcage) in high-contrast cyan on the mannequin's chest with pulsating border animations.
6. **Additive Color & Readability:** All text and UI elements use high-contrast cyan, white, and amber additive-safe colors (no pure black/dark-dependent text) and remain sharp and legible from the standing/kneeling viewing distance (0.8m – 1.2m).

## Out of scope
- Real-time video-based computer vision analysis of physical human skin or blood flow.
- Two-way live dispatch video streaming with 911 operators.
- Persistent spatial anchor cloud sync between multiple Spectacles users.
- Custom wrist or finger pose recognition outside standard SIK pinch mechanics.

## Risks and open questions
- **Viewing Angle Comfort (Addressed):** Looking downward at a patient on the floor for extended periods can cause neck strain. *Mitigation:* The HUD is angled upwards by 20° and floats 15 cm above the torso, allowing the rescuer to keep their head at a comfortable 30° natural downward tilt rather than a steep 60° bend.
- **Field of View Bounds (Addressed):** The Spectacles FOV is 37° x 32°. All critical indicators (target ring, count, and status) are bundled within a tight 28 cm radial footprint on the patient's torso, ensuring zero visual clipping during CPR.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
