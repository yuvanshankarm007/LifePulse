---
status: approved
---

# Design brief: LifePulse — Hands-Free Multi-Emergency Spatial First Responder

<!-- Generated for Learn AR with SPECS (Devpost & Snap Inc.) -->

## The one spatial moment
A bystander rushes to an emergency scene. Through Snap Spectacles, LifePulse immediately identifies the critical scenario and projects real-time spatial anatomical guides directly onto the victim: 
- For **Cardiac Arrest**: an 18 cm sternum target pulsing at 110 BPM with a 30:2 compression counter and holographic AED pad placement.
- For **Severe Choking**: navel-level abdominal thrust guidance with upward directional arrows and 5:5 back blow tracking.
- For **Severe Bleeding**: an arterial pressure point clamp and a 2–3 inch tourniquet placement line.
- For **Opioid Overdose**: Narcan nasal spray administration prompts and a recovery position roll guide.
All guidance is hands-free, keeping the rescuer's eyes on the victim and hands actively performing life-saving interventions.

## Why it belongs on glasses
- **Uses:** Shares your view, Draws in the world, Leaves your body free.
- **Why it's better than the phone or laptop version:**
  - **Both hands are physically occupied:** CPR compressions require 50 kg of two-handed force. Heimlich thrusts require interlocking fists around the abdomen. Hemorrhage control requires two hands applying bodyweight pressure or tightening a tourniquet windlass. You cannot hold a smartphone while saving a life.
  - **Eyes cannot leave the patient:** Looking down at a phone screen breaks visual vigilance over airway obstruction, chest rise, and facial responsiveness. Spectacles overlay guidance directly in the forward field of view.
  - **Zero-touch contamination:** In emergencies involving blood, vomit, or environmental grime, touching smartphone touchscreens is hazardous and slow. Spectacles provide completely hands-free visual and acoustic pacing.
  - **Spatial precision:** Unlike generic 2D tutorial videos, LifePulse anchors the exact anatomical placement (sternum, navel, limb wound, nostril) directly onto physical 3D anatomy.

## Product or overlay
- **Type:** Overlay (responds to and anchors onto the victim's physical body and surrounding emergency space).
- **What the real version would sense:**
  - Victim position, orientation, and joint tracking (supine on floor or upright for choking).
  - Chest recoil, compression depth, and cadence via front-facing depth sensors.
  - Medical kits (AED pads, tourniquet, Narcan nasal spray).
- **Stand-in for the preview:**
  - A 3D human mannequin model placed in the room.
  - Interactive Preview click/tap gestures simulating chest compressions, Heimlich thrusts, and wound pressure.
  - Interactive top-header mode selector cycling between the 4 emergency protocols.

## Where things live
- **Where the user is looking during the main task:** Looking downwards at roughly a 30°–45° tilt toward the victim at a distance of 0.8m to 1.2m.
- **Status HUD (Instruction Card):**
  - Position: Floating 14 cm above the torso (`{ x: 0, y: 14, z: -70 }`).
  - Size: 30 cm wide x 12 cm tall.
  - Color: High-contrast cyan and amber additive text (`EMERGENCY: [TYPE] - INSTRUCTION`).
- **Counter & Cadence Display:**
  - Position: Floating directly below the status HUD (`{ x: 0, y: 4, z: -70 }`).
  - Size: 25 cm wide x 10 cm tall.
  - Contents: Real-time action counter (`COMPRESSION: X / 30`, `HEIMLICH THRUST: X / 5`, `HEMO-SEAL PRESSURE`).
- **Anatomical Target Ring:**
  - Position: Dynamically moves based on emergency type:
    * Cardiac: Center sternum (`{ x: 0, y: -12, z: -65 }`), pulsing at 110 BPM.
    * Choking: Upper abdomen / navel (`{ x: 0, y: -6, z: -65 }`).
    * Bleeding: Limb pressure point (`{ x: -15, y: -15, z: -65 }`).
    * Overdose: Head / nasal area (`{ x: 0, y: 0, z: -65 }`).

## Hands and input
- **Primary Input Mode:** 100% hands-free passive audio/visual guidance during active compressions/thrusts.
- **Preview Stand-in Inputs (driven by mouse in preview / pinch on hardware):**
  - **Click Top Header:** Toggles emergency mode (`CARDIAC` $\rightarrow$ `CHOKING` $\rightarrow$ `BLEEDING` $\rightarrow$ `OVERDOSE`).
  - **Click Target / Center:** Pumps chest, applies thrust, or holds pressure with real-time elastic recoil animation.

## When things show
- **Selective Disclosure:** Only elements relevant to the active emergency are displayed.
  - Cardiac: 110 BPM pulse ring + 30:2 counter. Dims during rescue breaths.
  - Choking: Upward thrust arrows + 5:5 counter. Hides cardiac metronome.
  - Bleeding: Pressure seal gauge + tourniquet line. Hides breath prompts.
  - Overdose: Narcan nasal indicator $\rightarrow$ Recovery position roll prompt.

## Done criteria
Each criterion is fully verifiable within Lens Studio Interactive Preview:
1. **Scene Initialization:** On launch, the 3D patient mannequin, Status HUD, Counter Display, and Target Ring are properly anchored within the 37° FOV.
2. **Emergency Mode Cycling:** Clicking the top header area successfully cycles through all 4 emergency protocols (`CARDIAC`, `CHOKING`, `BLEEDING`, `OVERDOSE`), updating the HUD and relocating the target ring.
3. **110 BPM Cardiac Metronome:** In Cardiac mode, the sternum target ring pulses continuously at 110 BPM (~0.545s intervals).
4. **Interactive Action Feedback:** Clicking in the preview registers an action: increments counter and triggers an elastic squash-and-recoil bounce on the target ring.
5. **Cycle Threshold Transitions:** Reaching 30 compressions in Cardiac mode triggers rescue breaths; reaching 5 thrusts in Choking mode prompts airway clearance.
6. **Additive Shader Legibility:** All text and UI elements use high-contrast cyan, white, and amber additive colors, maintaining clarity without dark/black-dependent styling.

## Out of scope
- Live computer vision biometric vital sign diagnosis.
- Two-way dispatch video streaming with 911 dispatchers.
- Cloud multiplayer synchronization between multiple Spectacles users.

## Risks and open questions
- **FOV Bounds (Addressed):** All UI elements are contained within a tight 30 cm radius directly in the rescuer's downward gaze, preventing edge clipping on the 37° x 32° waveguide display.
- **Viewing Angle Comfort (Addressed):** The HUD floats 14 cm above the torso at a 20° upward tilt, allowing rescuers to maintain a comfortable 30° natural neck angle rather than a steep 60° bend.

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
6. **Fix with design notes, not code.** Tell your agent what to change in design terms.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
