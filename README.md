# 🫀 LifePulse
### Built for Snap Spectacles | Learn AR with SPECS (Devpost & Snap Inc.)

> **"When seconds count and hands are occupied: Saving lives through real-time spatial CPR guidance and AED deployment on Snap Spectacles."**

---

## 🏆 Project Highlights
* **Project Name:** LifePulse
* **Submission Deadline:** November 9, 2026 (5:00 PM ET)
* **Target Category:** Grand Prize Winner ($2,500 Prize Pool)
* **The Mission:** LifePulse turns anyone wearing Snap Spectacles into an immediate life-saver during acute collapse and cardiac arrest, providing hands-free, spatially-anchored CPR cadence and AED guidance.
* **Core Technological Modalities:** 
  1. **Shares View:** Identifies victim orientation and anatomical sternum position.
  2. **Draws in World:** Projects an 18 cm glowing target ring on the chest + holographic AED pads.
  3. **Leaves Body Free:** Rescuer performs 100% two-handed CPR chest compressions without touching a screen.
* **Verification:** 100% automated test pass rate across 6 LEAF test scenarios in Lens Studio Interactive Preview.

---

## 📂 Repository File Structure

```
lifepulse/
├── README.md                          # Project documentation & runbook
├── devpost/
│   └── design-brief.md                # Official Devpost Learn Design Brief (Approved)
├── scripts/
│   ├── LifePulseController.ts         # Core SIK controller & state machine (TypeScript)
│   └── LEAF_Tests.ts                  # Automated LEAF scenario verification suite
└── pitch/
    ├── DEMO_VIDEO_SCRIPT.md           # 2-minute shot-by-shot preview recording script
    ├── DEVPOST_SUBMISSION.md          # Complete Devpost form writeup & pitch
    └── JUDGES_QA_DEFENSE.md           # Rubric alignment & pre-empted judge Q&A
```

---

## 🚀 Quick Start & Build Instructions

### Step 1: Open or Create SPECS Project in Lens Studio
1. Launch **Lens Studio 5.2x+**.
2. Select **SPECS** > **Base Template**.
3. Choose **File > Save As** and save into your project folder.

### Step 2: Ensure CLAD and Lens Studio MCP are Active
1. In your coding agent (Claude Code, Cursor, or Codex), ensure the `lens-studio` MCP server is connected.
2. Verify CLAD plugin (`specs-experience-builder`, `verify-preview`) is loaded.
3. Keep `devpost/design-brief.md` in the `devpost/` directory.

### Step 3: Run the Automated LEAF Test Suite
In Lens Studio Interactive Preview:
1. Attach `LifePulseController.ts` and `LEAF_Tests.ts` to the scene script runner.
2. In the Interactive Preview console, run:
   ```typescript
   new LifePulseLEAFTestSuite(controller).runAllTests();
   ```
3. All 6 Done Criteria will execute and log:
   ```
   [LEAF TEST SUMMARY] Passed: 6 / 6 | Failed: 0
   ```

### Step 4: Record Demo Video in Preview
1. Switch to **Interactive Preview** in Lens Studio.
2. Follow the 1-minute 55-second narrative script in `pitch/DEMO_VIDEO_SCRIPT.md`:
   - Use **W/A/S/D** to move toward the patient mannequin.
   - Use **Q** to descend to kneeling height and **E** to rise.
   - Click the SIK interactables to trigger CPR cadence, compression count, rescue breath transition, and AED placement.
3. Export recording at 1080p 60fps and upload as an unlisted or public video to YouTube.

### Step 5: Submit to Devpost
1. Navigate to [learn-specs.devpost.com](https://learn-specs.devpost.com/).
2. Click **Enter a Submission**.
3. Copy the pre-formatted text from `pitch/DEVPOST_SUBMISSION.md` into the submission fields.
4. Paste your GitHub repository link and YouTube demo video link before **November 9, 2026, at 5:00 PM ET**.

---

## 📄 License
This project is open-source under the MIT License for the Devpost Learn community.
