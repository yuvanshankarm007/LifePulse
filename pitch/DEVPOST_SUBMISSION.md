# Devpost Submission Form Content: LifePulse

**Project Title:** LifePulse — Hands-Free Emergency Spatial Coach  
**Tagline:** When seconds count and hands are occupied: Real-time spatial CPR cadence and AED guidance for Snap Spectacles.  
**Track:** Learn AR with SPECS (Devpost & Snap Inc.)  
**Project Repository:** (Public GitHub repository containing `.esproj`, `/scripts`, and `/devpost`)  
**Demo Video URL:** (YouTube link to 2-minute preview demo)  

---

## 💡 Inspiration
Over 350,000 out-of-hospital cardiac arrests occur every year, and survival drops by 10% for every minute without cardiopulmonary resuscitation (CPR). Yet, over 70% of bystanders hesitate to act, fear making a mistake, or fail to sustain the required 100–120 compressions-per-minute tempo.

When an acute emergency strikes, **smartphones are fundamentally inadequate**:
1. You need **both hands** interlocked with locked elbows to exert 50 kg of chest compression force.
2. Looking down at a flat glass screen breaks visual vigilance over the victim's airway, chest rise, and vital signs.
3. Fumbling with phone locks, dials, wet gloves, or biometric sensors under acute panic wastes precious seconds.

Snap Spectacles offer a revolutionary alternative: a head-worn spatial computer that **shares your view**, **draws directly in the physical world**, and **leaves your body and hands 100% free**. 

We built **LifePulse** to transform anyone wearing Spectacles into an empowered, fearless first responder who can act decisively and save a life.

---

## ⚡ What it Does
**LifePulse** is a clinical-first emergency coaching system built natively for Snap Spectacles. It guides bystanders step-by-step through high-quality CPR and automated external defibrillator (AED) deployment:

* **Spatial Anatomical Anchoring:** Rather than floating an annoying 2D HUD website in front of your face, LifePulse anchors a glowing 18 cm target ring directly onto the lower half of the victim's sternum.
* **110 BPM Rhythmic Cadence Metronome:** Synchronizes visual radial pulses and spatial audio ticks at precisely 110 beats per minute (the American Heart Association sweet spot between 100–120 BPM).
* **30:2 Cycle Automation:** Dynamically tracks chest compressions (1 to 30) with real-time feedback (`OPTIMAL CADENCE`), then automatically transitions into the rescue breath phase.
* **Selective Disclosure:** When 30 compressions are reached, the chest ring dims and guidance instantly migrates to the victim's airway with an audible cue and a 4-second breath countdown, keeping the user's field of view clean and focused.
* **Holographic AED Defibrillator Placement:** When an AED arrives, high-contrast cyan holographic guides highlight the exact anatomical placement for electrode pads on the right collarbone and left lateral ribcage.
* **Comfort & Additive Optics:** Engineered within the 37° x 32° narrow FOV and additive display constraints of Spectacles. All critical elements use high-contrast cyan, amber, and white shaders (avoiding invisible blacks) and are elevated 15 cm above the torso at a comfortable 30° downward gaze angle.

---

## 🛠️ How We Built It
We followed the official Devpost Learn agentic pipeline from start to finish:
1. **Interactive Planning with Devpost Learn Skill Pack:** We used the `plan-lens` agent skill to conduct a rigorous design interview, stress-testing our emergency use case against the three core AR modalities and Lens Studio preview limits. This produced our official specification in `devpost/design-brief.md`.
2. **Autonomous Lens Construction via CLAD & Lens Studio MCP:** Snap’s Closed-Loop Agentic Development (CLAD) agents and Lens Studio MCP built the project hierarchy, 3D anatomical placement, and additive shaders inside Lens Studio.
3. **Spectacles Interaction Kit (SIK):** Built with SIK interactables, enabling seamless mouse pinch-and-drag testing in Interactive Preview and native hand pinching on Spectacles Gen 5 hardware.
4. **Automated LEAF Testing:** Implemented an automated test harness (`scripts/LEAF_Tests.ts`) verifying all 6 Done Criteria across state transitions, audio triggers, counter thresholds, and additive color compliance.

---

## 🧗 Challenges We Overcame
* **Designing for Narrow Field of View (37° x 32°):** In an emergency, a rescuer cannot be turning their head searching for UI. We grouped all critical elements (compression target, count, cadence status) within a compact 28 cm radial zone on the patient's chest.
* **Ergonomics of Looking at the Floor:** CPR happens on the ground. A steep 60° neck angle causes rapid fatigue. We angled the floating HUD upward by 20° and raised it 15 cm above the torso, allowing rescuers to maintain a relaxed 30° downward eye-line.
* **Hardware-Free Simulation:** Because judges and developers review projects in Lens Studio preview, we created intuitive SIK button stand-ins for patient assessment and compression simulation, allowing judges to test the complete medical cycle with a standard mouse.

---

## 🏆 Accomplishments that We're Proud of
* **True Synthesis of the 3 Modalities:** LifePulse doesn't just show a notification; it perceives what the rescuer sees, draws anatomical targets in physical 3D space, and leaves both hands completely unencumbered.
* **100% LEAF Test Pass Rate:** Every single Done Criterion in `devpost/design-brief.md` has an automated test that passes in preview simulation.
* **High-Impact Real-World Value:** Moving AR away from temporary gimmicks toward permanent, life-saving human utility.

---

## 🧠 What We Learned
* **Selective Disclosure is Critical in AR:** Showing too much information during a panic situation induces cognitive overload. Showing only the immediate next physical action (compressions $\rightarrow$ breaths $\rightarrow$ pads) dramatically improves focus.
* **Additive Display Discipline:** Black is transparent on waveguide displays. Designing for Spectacles requires thoughtful color palettes (cyan, gold, bright white) with luminous edge highlights.

---

## 🚀 What's Next for LifePulse AR
* **Real-Time Computer Vision Recoil Detection:** Utilizing SnapML on Spectacles Gen 5 dual-cameras to track hand displacement and sound audio alerts if compressions are too shallow (<5 cm) or if complete chest recoil isn't achieved.
* **Connected Lenses for Multi-Rescuer Handoff:** Allowing two Spectacles wearers to seamlessly swap roles without interrupting CPR cadence when the primary rescuer fatigues.
* **Automated 911 Telemetry Streaming:** Transmitting live situational telemetry and victim status directly to arriving paramedic headsets.
