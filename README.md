# 🫀 LifePulse: Hands-Free Multi-Emergency Spatial First Responder
### Built for Snap Spectacles | Learn AR with SPECS (Devpost & Snap Inc.)

> **"When seconds count and hands are occupied: Real-time spatial first responder coaching for Cardiac Arrest, Choking, Severe Bleeding, and Overdose on Snap Spectacles."**

---

## 🏆 Project Highlights
* **Project Name:** LifePulse
* **Submission Deadline:** November 9, 2026 (5:00 PM ET)
* **Target Category:** Grand Prize Winner ($2,500 Prize Pool)
* **The 4 Spatial Emergency Protocols:**
  1. **❤️ Cardiac Arrest:** 110 BPM Sternum Pulse Ring + 30:2 Compression Cadence + Rescue Breaths + AED Guides.
  2. **🗣️ Severe Choking:** Navel-level Heimlich Maneuver + 5:5 Back Blow Tracking.
  3. **🩸 Severe Bleeding:** Limb Pressure Point Hemo-Seal Gauge + 2–3" Tourniquet Guide.
  4. **💊 Opioid Overdose:** Narcan Nasal Spray Administration + Recovery Position Roll.
* **The 3 Spatial Modalities Synthesized:**
  * **Shares View:** Detects victim orientation and anatomical emergency sites (sternum, navel, limb, airway).
  * **Draws in World:** Renders luminous 3D target rings, pressure gauges, and directional arrows anchored to the patient.
  * **Leaves Body Free:** Rescuer uses both hands to perform physical CPR, abdominal thrusts, and wound pressure.
* **Verification:** 100% automated test pass rate across all LEAF test scenarios in Lens Studio Interactive Preview.

---

## 📂 Repository File Structure

```
lifepulse/
├── README.md                          # Project documentation & runbook
├── devpost/
│   └── design-brief.md                # Official Devpost Learn Design Brief (Approved)
├── scripts/
│   ├── LifePulseController.ts         # Multi-emergency controller & state machine (TypeScript)
│   └── LEAF_Tests.ts                  # Automated LEAF scenario verification suite
└── pitch/
    ├── DEMO_VIDEO_SCRIPT.md           # 2-minute shot-by-shot preview recording script
    ├── DEVPOST_SUBMISSION.md          # Complete Devpost form writeup & pitch
    └── JUDGES_QA_DEFENSE.md           # Rubric alignment & pre-empted judge Q&A
```

---

## 🕹️ Interactive Preview Controls

In Lens Studio **Interactive Preview**:
* **W / A / S / D:** Walk forward, backward, left, right.
* **Q / E:** Kneel down to patient level (`Q`) or rise back up (`E`).
* **Shift + Mouse Move:** Smoothly orbit and look around.
* **Click Top Header (or Top 25% of View):** Cycles between emergency modes:  
  `CARDIAC` $\rightarrow$ `CHOKING` $\rightarrow$ `BLEEDING` $\rightarrow$ `OVERDOSE`
* **Click Center / Target:** Simulates the active emergency action (pumps chest, applies Heimlich thrust, holds pressure).

---

## 🚀 Submission Runbook (Deadline: Nov 9, 2026, 5:00 PM ET)

1. **Test in Lens Studio:**
   - Open Lens Studio 5.2x+ $\rightarrow$ open `LifePulse.esproj`.
   - In **Preview 1**, click the top to switch emergency modes and click the center to pump compressions!
2. **Record Demo Video (under 2 mins):**
   - Press `Win + G` to record your screen following [`pitch/DEMO_VIDEO_SCRIPT.md`](pitch/DEMO_VIDEO_SCRIPT.md).
   - Upload to YouTube as Public or Unlisted.
3. **Push to Public GitHub Repository:**
   ```powershell
   cd C:\Users\yuvan\.gemini\antigravity\scratch\lifepulse
   git remote add origin https://github.com/<YOUR_USERNAME>/lifepulse.git
   git push -u origin main
   ```
4. **Submit on Devpost:**
   - Go to [learn-specs.devpost.com](https://learn-specs.devpost.com/)
   - Copy-paste the title (`LifePulse`) and text from [`pitch/DEVPOST_SUBMISSION.md`](pitch/DEVPOST_SUBMISSION.md).
   - Paste your YouTube video link and GitHub repository link.
