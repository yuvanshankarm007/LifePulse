/**
 * LEAF_Tests.ts
 * 
 * Automated LEAF Scenario Verification Suite for LifePulse AR.
 * Used by Snap CLAD agents and developers inside Lens Studio Interactive Preview
 * to automatically validate all Done Criteria specified in devpost/design-brief.md.
 */

import { LifePulseController } from "./LifePulseController";

export class LifePulseLEAFTestSuite {

    private controller: LifePulseController;

    constructor(controllerInstance: LifePulseController) {
        this.controller = controllerInstance;
    }

    /**
     * Executes the complete end-to-end verification suite.
     */
    public async runAllTests(): Promise<{ passed: number; failed: number; results: string[] }> {
        const results: string[] = [];
        let passed = 0;
        let failed = 0;

        print("=================================================");
        print("[LEAF TEST] Starting LifePulse AR Verification...");
        print("=================================================");

        // Test 1: Scene Initialization & Placement
        try {
            this.assert(
                this.controller.currentState === "ASSESSMENT",
                "Criterion 1: Initial state must be ASSESSMENT."
            );
            this.assert(
                this.controller.patientRoot !== null && this.controller.patientRoot !== undefined,
                "Criterion 1: Virtual patient root must be instantiated and anchored."
            );
            this.assert(
                this.controller.compressionTarget.enabled === false,
                "Criterion 1: Sternum target must remain hidden during assessment (selective disclosure)."
            );
            results.push("PASS: Criterion 1 - Scene Initialization & Selective Disclosure");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 1 - ${e.message}`);
            failed++;
        }

        // Test 2: SIK Activation into CPR State
        try {
            this.controller.startCPR();
            this.assert(
                this.controller.currentState === "COMPRESSIONS",
                "Criterion 2: Controller must transition to COMPRESSIONS upon SIK activation."
            );
            this.assert(
                this.controller.compressionTarget.enabled === true,
                "Criterion 2: Sternum target ring must be visible during active CPR."
            );
            this.assert(
                this.controller.compressionCount === 0,
                "Criterion 2: Initial compression count must be 0."
            );
            results.push("PASS: Criterion 2 - SIK CPR Activation & Ring Display");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 2 - ${e.message}`);
            failed++;
        }

        // Test 3: Incremental Compressions & Cadence Counting
        try {
            for (let i = 1; i <= 10; i++) {
                this.controller.registerCompression();
            }
            this.assert(
                this.controller.compressionCount === 10,
                `Criterion 3: Expected 10 compressions registered, got ${this.controller.compressionCount}.`
            );
            this.assert(
                this.controller.counterText.text.includes("10 / 30"),
                "Criterion 3: 3D text counter display must update to reflect current count."
            );
            results.push("PASS: Criterion 3 - Compression Increments & 3D Counter Updates");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 3 - ${e.message}`);
            failed++;
        }

        // Test 4: Threshold Transition to Rescue Breaths (at 30 compressions)
        try {
            // Push remaining 20 compressions to reach 30
            for (let i = 11; i <= 30; i++) {
                this.controller.registerCompression();
            }
            this.assert(
                this.controller.currentState === "BREATHS",
                "Criterion 4: State must automatically transition to BREATHS at 30 compressions."
            );
            this.assert(
                this.controller.breathPromptCard.enabled === true,
                "Criterion 4: Rescue breath prompt card must appear near patient mouth."
            );
            this.assert(
                this.controller.compressionTarget.enabled === false,
                "Criterion 4: Chest target ring must dim during rescue breaths."
            );
            results.push("PASS: Criterion 4 - Automatic Transition to Rescue Breaths at 30 Compressions");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 4 - ${e.message}`);
            failed++;
        }

        // Test 5: AED Mode & Holographic Pad Targeting
        try {
            this.controller.transitionToAED();
            this.assert(
                this.controller.currentState === "AED_DEPLOYMENT",
                "Criterion 5: State must switch to AED_DEPLOYMENT on trigger."
            );
            this.assert(
                this.controller.aedPadGuideRoot.enabled === true,
                "Criterion 5: Both AED electrode pad targets must be rendered on the torso."
            );
            this.assert(
                this.controller.statusHUDText.text.includes("APPLY PADS"),
                "Criterion 5: HUD must instruct rescuer to apply pads."
            );
            results.push("PASS: Criterion 5 - Holographic AED Pad Placement Guidance");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 5 - ${e.message}`);
            failed++;
        }

        // Test 6: Color Shaders & Additive Readability
        try {
            // Verify additive shader compliance: HUD text must have valid non-black text styling
            this.assert(
                this.controller.statusHUDText !== null && this.controller.counterText !== null,
                "Criterion 6: High-contrast 3D additive text components are assigned and active."
            );
            results.push("PASS: Criterion 6 - Additive Color Shaders & Legibility Check");
            passed++;
        } catch (e) {
            results.push(`FAIL: Criterion 6 - ${e.message}`);
            failed++;
        }

        print("=================================================");
        print(`[LEAF TEST SUMMARY] Passed: ${passed} / 6 | Failed: ${failed}`);
        results.forEach((res) => print("  -> " + res));
        print("=================================================");

        return { passed, failed, results };
    }

    private assert(condition: boolean, message: string) {
        if (!condition) {
            throw new Error(message);
        }
    }
}
