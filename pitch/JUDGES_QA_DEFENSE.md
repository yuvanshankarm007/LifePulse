# LifePulse AR — Judge Q&A Defense & Scoring Rubric Alignment

**Event:** Learn AR with SPECS (Devpost & Snap Inc.)  
**Judging Period:** November 10 – November 17, 2026  

---

## 📊 Alignment with Official Judging Rubrics

### 1. Spatial Design & Utility (Weight: High)
* **Official Standard:** Does the project solve a real physical-world problem? Does it combine all 3 modalities (*Shares View*, *Draws in World*, *Leaves Body Free*) rather than acting like a floating 2D phone screen?
* **How LifePulse AR Scores 10/10:**
  - **Why not a phone?** The rescuer's hands are physically locked together applying 50 kg of force at 110 BPM. Touching a phone is physically impossible.
  - **Why not a laptop/screen?** The rescuer's eyes must monitor chest rise, airway obstruction, and patient consciousness. Looking away causes loss of clinical situational awareness.
  - **Modality Synthesis:** 
    1. *Shares View:* Aligns with patient torso position.
    2. *Draws in World:* Anchors real-scale 18 cm target ring directly onto the physical sternum.
    3. *Leaves Body Free:* Rescuer moves, kneels, pumps, and breathes with zero handheld hardware.

---

### 2. Technical Implementation & Agentic Workflow (Weight: High)
* **Official Standard:** Effective use of Lens Studio, CLAD agents, Lens Studio MCP, and compliance with the `devpost/design-brief.md` specification.
* **How LifePulse AR Scores 10/10:**
  - Strict compliance with `devpost/design-brief.md` using the exact Devpost Learn template.
  - Clean modular TypeScript architecture (`LifePulseController.ts`) integrating with Spectacles Interaction Kit (SIK).
  - 100% automated test coverage with LEAF (`scripts/LEAF_Tests.ts`) verifying all 6 Done Criteria in preview simulation.
  - No unsupported preview dependencies (e.g., custom two-hand joint tracking or cloud servers).

---

### 3. User Experience & Ergonomic Polish (Weight: Medium)
* **Official Standard:** Intuitive interaction, comfortable FOV placement, additive color readability, and selective disclosure.
* **How LifePulse AR Scores 10/10:**
  - **Selective Disclosure:** When doing compressions, breath prompts and AED pads hide. When doing breaths, chest targets dim. Cognitive load is reduced to zero.
  - **Ergonomics:** Floor tasks usually cause neck strain; LifePulse floats the HUD 15 cm above the torso and tilts it up 20°, keeping the neck at a gentle, sustainable 30° angle.
  - **Additive Color Palette:** Pure black UI is strictly avoided; high-luminance cyan, amber, and crisp white ensure visibility against any floor or carpet background.
  - **FOV Boundaries:** All elements fit within the 37° x 32° narrow waveguide frame.

---

### 4. Demonstration Clarity (Weight: Medium)
* **Official Standard:** Compelling narrative, clear presentation of the user problem, and smooth execution in the preview simulator.
* **How LifePulse AR Scores 10/10:**
  - Under 2-minute video script with immediate emotional hook in the first 5 seconds.
  - Clear demonstration of all state transitions: Assessment $\rightarrow$ Compressions $\rightarrow$ Breaths $\rightarrow$ AED.

---

## 🎯 Pre-Empted Judge Questions & Defenses

### Q1: *"In the real world, how would the glasses know the exact location of the patient's sternum?"*
> **Defense:**  
> *"On Spectacles Gen 5, SnapML body tracking and surface meshes provide real-time spatial positioning of human joints (shoulders, neck, hips). For the hackathon preview on a laptop, we implemented an anatomical stand-in: a 3D patient model placed in the room, where the target ring is pre-anchored to the sternum. In production, Snap's depth camera localizes the sternum between the mid-clavicular lines."*

### Q2: *"Won't looking down at a patient on the floor cause neck strain or display clipping on Spectacles?"*
> **Defense:**  
> *"That was one of our primary design challenges during the planning interview. Rather than placing UI flat on the floor (which requires a steep 60° head bend), we elevated the primary HUD card 15 cm above the patient's chest and tilted it upward by 20°. This places the UI at a comfortable 30° natural downward eye gaze, comfortably within the 1-meter focal plane of Spectacles."*

### Q3: *"Why did you use SIK pinch buttons if the rescuer's hands are busy doing CPR?"*
> **Defense:**  
> *"In the real-world deployment on Spectacles hardware, LifePulse operates hands-free via audio cadence and automatic timers. However, under the hackathon's Preview Limits guidelines, every project must be demoable by judges and developers in Lens Studio Interactive Preview on a standard laptop. We provided prominent SIK interactables as preview stand-ins so anyone with a mouse can click to trigger compressions, test cycle counts, and verify the LEAF scenarios."*

### Q4: *"Why do you dim the compression ring during rescue breaths?"*
> **Defense:**  
> *"Rule #2 of Snap AR Design: 'Every glance has to earn its place.' When performing rescue breaths, the rescuer must focus on head tilt, chin lift, and watching the chest rise. Keeping a pulsing ring on the chest would create visual distraction. By dimming the ring and surfacing the breath countdown over the head, we follow strict selective disclosure."*
