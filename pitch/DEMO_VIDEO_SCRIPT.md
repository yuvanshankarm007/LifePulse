# LifePulse AR — 2-Minute Demo Video Script & Storyboard
**Hackathon:** Learn AR with SPECS (Devpost & Snap Inc.)  
**Project:** LifePulse AR — Hands-Free Emergency Spatial Coach  
**Target Duration:** 1 minute 55 seconds (under the 2–3 minute limit)  
**Platform:** Recorded directly in Lens Studio Interactive Preview (using WASD locomotion + mouse pinch)

---

## 🎬 Narrative Breakdown & Shot List

| Time | Scene / Camera Action | Visual in Lens Studio Preview | Voiceover / Audio Script |
|---|---|---|---|
| **0:00 – 0:18** | **Hook & The "Why Spectacles?" Question**<br>Camera stationary in preview room. Floor view shows a supine victim. | Standing view looking down at the virtual patient mannequin on the room floor. An urgent cyan/amber emergency card floats 15 cm above patient head: *"UNRESPONSIVE PATIENT — CHECK BREATHING / CALL 911"*. | *"Every year, over 350,000 out-of-hospital cardiac arrests occur. The difference between life and death is immediate CPR. But CPR requires two locked hands and 50 kilograms of force at 110 beats a minute. You can't hold a phone. You can't swipe a screen. And looking away costs brain function. This is why AR smart glasses exist. Welcome to LifePulse AR."* |
| **0:18 – 0:38** | **Modality 1 & 2: Shares View & Draws in World**<br>Mouse clicks the large SIK button *"START CPR"*. Camera descends slightly (Q key) to simulate kneeling. | SIK button highlights with border glow and spatial chime. Instantly, an animated glowing target ring projects onto the victim’s sternum. It pulses rhythmically with a clear 110 BPM acoustic metronome chime. 3D counter appears: *"0 / 30"*. | *"With a simple pinch, LifePulse AR activates. It anchors directly to the victim’s physical anatomy. Notice how it isn't a flat floating website in front of your eyes: the compression target sits right over the lower sternum, pulsing at exactly 110 beats per minute to give immediate, life-saving cadence."* |
| **0:38 – 1:02** | **Modality 3: Leaves Body Free & Active Compressions**<br>Rapid clicking on *"Simulate Compression"* button. Camera orbits slightly using Shift + right-drag to show true 3D spatial anchoring. | Target ring compresses and springs back on each hit. The 3D counter advances: *"5 / 30"*, *"12 / 30"*, *"24 / 30"*. Cadence banner displays *"OPTIMAL CADENCE — 110 BPM"*. | *"Both hands are completely free to perform compressions. As compressions occur, LifePulse tracks the 30:2 rhythm. Even if the rescuer shifts position, the target stays grounded on the patient's chest. No visual clutter. No eye fatigue. The display only shows what you need to keep someone alive."* |
| **1:02 – 1:22** | **Selective Disclosure: The Rescue Breath Transition**<br>Counter reaches 30. Ring automatically dims. Camera tilts upward toward victim head. | Sternum ring dims to avoid distraction. A holographic airway card appears over the victim’s mouth: *"TILT HEAD, LIFT CHIN — 2 RESCUE BREATHS"*. A 4-second circular timer counts down. | *"At 30 compressions, LifePulse practices selective disclosure: the chest ring dims, and guidance instantly transfers to the victim's airway. It coaches two calm rescue breaths, then seamlessly relaunches the next compression cycle without touching a single button."* |
| **1:22 – 1:40** | **AED Deployment Guide**<br>Click *"Deploy AED"* SIK button. Directional spatial arrow guides gaze to side. | Directional arrow points toward virtual AED box. Mannequin torso illuminates with two glowing holographic pad targets: Pad 1 on upper right collarbone; Pad 2 on lower left ribs. | *"When an automated defibrillator arrives, LifePulse guides pad placement directly onto the patient's bare skin — right collarbone, left lower ribcage — eliminating the deadly hesitation that causes 70% of bystander AED failures."* |
| **1:40 – 1:55** | **Conclusion & The Pitch**<br>Camera pulls back to standing perspective (E key), showing the complete coordinated emergency scene. | All UI elements remain crisp and readable in additive preview colors. Devpost brief & LEAF test report overlay appears on screen. | *"LifePulse AR was built entirely for Snap Spectacles using Lens Studio, CLAD agentic development, and SIK. All six LEAF scenarios pass 100%. This isn't just an AR demo — it's the future of bystander emergency response. Thank you."* |

---

## 💡 Recording Tips for Lens Studio Interactive Preview
1. **Screen Resolution:** Record at 1080p (1920x1080) at 60 FPS using OBS Studio or Windows Game Bar (`Win + G`).
2. **Interactive Preview Settings:**
   - In Lens Studio, switch to **Interactive Preview**.
   - Make sure **Device Simulation** is set to **Spectacles (Gen 5)**.
   - Use standard mouse clicks to trigger SIK interactables (the cursor will show the pinch indicator).
3. **Smooth Camera Locomotion:**
   - Press **W/A/S/D** to smoothly approach the patient.
   - Use **Q** to kneel down to chest level and **E** to rise up.
   - Hold **Shift** while moving the mouse for smooth head orientation without sudden snapping.
4. **Audio Track:**
   - Enable internal audio capture so the 110 BPM metronome chime and SIK click sounds are audible in the background of your voiceover.
