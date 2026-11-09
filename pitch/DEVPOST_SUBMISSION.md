# Devpost Submission Form Content: LifePulse

**Project Title:** LifePulse  
**Tagline:** When seconds count and hands are occupied: Hands-free multi-emergency spatial first responder for Snap Spectacles.  
**Track:** Learn AR with SPECS (Devpost & Snap Inc.)  
**Project Repository:** (Public GitHub repository containing `.esproj`, `/scripts`, and `/devpost`)  
**Demo Video URL:** (YouTube link to 2-minute preview demo)  

---

## 💡 Inspiration
Every year, millions of preventable deaths occur because bystanders freeze during acute emergencies:
* Over **350,000 out-of-hospital cardiac arrests** happen annually, with survival dropping by 10% for every minute without CPR.
* **Choking** is the fourth leading cause of unintentional injury death, requiring immediate alternating back blows and Heimlich thrusts.
* **Severe arterial bleeding** can cause fatal hemorrhagic shock in under 3 minutes before an ambulance arrives.
* **Opioid overdoses** can be completely reversed within seconds if Naloxone (Narcan) is administered and the victim is rolled into a clear recovery position.

Yet over 70% of bystanders hesitate to intervene due to panic, fear of doing it wrong, or inability to recall training under acute stress.

When a life-threatening crisis strikes, **smartphones are fundamentally useless**:
1. **Both hands are 100% occupied:** CPR requires 50 kg of two-handed force. Heimlich thrusts require wrapping both arms around the victim. Hemorrhage control requires two hands applying bodyweight pressure. You cannot hold or swipe a smartphone while performing physical resuscitation.
2. **Eyes cannot leave the victim:** Looking down at a phone screen breaks visual vigilance over airway obstruction, chest rise, and facial responsiveness.
3. **Biohazard & contamination:** Touching personal devices with wet, contaminated, or bloody gloves is dangerous and slow.

Snap Spectacles offer the ultimate medical computing form factor: an optical spatial computer that **shares your view**, **draws directly in the physical world**, and **leaves your body and hands completely free**. 

We built **LifePulse** to transform anyone wearing Snap Spectacles into an empowered, calm, and fearless first responder.

---

## ⚡ What it Does
**LifePulse** is a clinical-first, multi-emergency spatial companion built natively for Snap Spectacles. It provides interactive, step-by-step spatial coaching for the four most common acute bystander emergencies:

### 1. ❤️ Cardiac Arrest Mode (CPR & AED)
* **110 BPM Rhythmic Spatial Metronome:** Anchors an 18 cm glowing target ring directly onto the lower sternum, pulsing at precisely 110 beats per minute (the AHA gold standard).
* **30:2 Cycle Automation:** Dynamically tallies compressions (1 to 30) with real-time feedback and elastic squash-and-recoil visual animation.
* **Selective Disclosure Breath Guidance:** At 30 compressions, the chest target dims and guidance instantly migrates to the victim's airway with a 4-second breath timer (`WATCH CHEST RISE`).
* **Holographic AED Pad Placement:** Highlights exact anatomical targets on the right collarbone and left lateral ribcage.

### 2. 🗣️ Severe Choking Mode (Heimlich & Back Blows)
* Relocates the spatial target to the **upper abdomen (just above the navel)**.
* Directs the 5-and-5 protocol: **5 firm back blows between shoulder blades $\rightarrow$ 5 quick inward-and-upward abdominal thrusts** with an interactive thrust counter.

### 3. 🩸 Severe Bleeding Mode (Arterial Hemorrhage Control)
* Relocates the spatial guide to the **limb wound site**.
* Provides a continuous **direct pressure seal gauge** (`HEMO-SEAL PRESSURE 10%... 100%`) and highlights the exact placement line for a **tourniquet (2–3 inches above the wound)**.

### 4. 💊 Opioid Overdose Mode (Narcan & Recovery Position)
* Directs nasal spray administration (**1 spray in nostril**).
* Spatially guides rolling the unconscious patient into the **safe recovery position** (lateral recumbent) to maintain a clear airway and prevent aspiration.

### 🕹️ Seamless Interactive Bystander Controls
* **Header Mode Switcher:** Bystanders can toggle between emergency protocols in seconds.
* **Interactive Preview Simulation:** Fully testable on laptops without physical hardware using WASD locomotion and click-to-pump interactions.

---

## 🛠️ How We Built It
We followed the official Devpost Learn agentic pipeline from concept to verified execution:
1. **Interactive Planning with Devpost Learn Skill Pack:** We used the `plan-lens` agent skill to stress-test our multi-emergency concept against the three core spatial modalities, preview constraints, and ergonomic comfort rules. This generated our approved specification in `devpost/design-brief.md`.
2. **Autonomous Lens Construction with CLAD & Lens Studio MCP:** Snap’s Closed-Loop Agentic Development (CLAD) agents and Lens Studio MCP built the project hierarchy, 3D anatomical placement, and additive shaders inside Lens Studio.
3. **Spectacles Interaction Kit (SIK):** Built with SIK interactables, enabling mouse pinch-and-drag testing in Interactive Preview and native hand pinching on Spectacles Gen 5 hardware.
4. **Automated LEAF Testing:** Implemented an automated test harness (`scripts/LEAF_Tests.ts`) verifying state transitions, 110 BPM metronome pulses, counter increments, and additive color compliance.

---

## 🧗 Challenges We Overcame
* **Ergonomics of Downward Gaze:** Resuscitation occurs on the ground. A steep 60° head bend causes severe neck fatigue. We elevated the floating HUD 14 cm above the patient at a 20° upward tilt, allowing rescuers to maintain a comfortable 30° natural downward eye line.
* **Narrow FOV Management (37° x 32°):** In an emergency, a rescuer cannot search around for UI. All critical indicators (target ring, counter, status card) are clustered within a compact 30 cm radius directly in the rescuer's central vision.
* **Additive Color Disciplines:** Waveguide displays render black as transparent. We designed high-contrast cyan, amber, and crisp white luminous shaders that remain razor-sharp against any carpet or floor background.

---

## 🏆 Accomplishments that We're Proud of
* **True Synthesis of the 3 Modalities:** LifePulse perceives the victim's anatomy, draws real-scale targets in 3D physical space, and leaves the rescuer's hands completely unencumbered.
* **4-in-1 Comprehensive Emergency Suite:** Expanding beyond single-scenario demos into a complete first responder toolkit (Cardiac, Choking, Bleeding, Overdose).
* **100% Simulator-Verified:** Completely interactive and testable in Lens Studio Interactive Preview on a standard laptop.

---

## 🧠 What We Learned
* **Selective Disclosure Saves Lives:** Showing too much information during a panic situation induces cognitive overload. Showing only the immediate next physical action dramatically improves rescuer confidence and execution speed.
* **Event-Driven AR Architecture:** Constant video streaming drains smart glasses batteries in minutes. Event-driven emergency activation preserves battery and maximizes responsiveness.

---

## 🚀 What's Next for LifePulse
* **Real-Time Computer Vision Recoil Detection:** Utilizing SnapML on Spectacles Gen 5 dual-cameras to track compression depth (>5 cm) and sound alerts if compressions are too shallow.
* **Multi-Rescuer Handoff via Connected Lenses:** Allowing two Spectacles wearers to seamlessly swap roles without interrupting CPR cadence when the primary rescuer fatigues.
* **Automated 911 Telemetry Streaming:** Transmitting live victim status and compression count directly to arriving paramedic headsets.
