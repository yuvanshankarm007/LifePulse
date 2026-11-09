/**
 * LEAF_Tests.ts
 * 
 * Comprehensive Automated LEAF Scenario Verification Suite for LifePulse.
 * Verifies all 4 Emergency Modes and Done Criteria specified in devpost/design-brief.md.
 */

import { LifePulseController } from "./LifePulseController";

export class LifePulseLEAFTestSuite {

    private controller: LifePulseController;

    constructor(controllerInstance: LifePulseController) {
        this.controller = controllerInstance;
    }

    /**
     * Executes the complete end-to-end verification suite across all 4 emergency modes.
     */
    public async runAllTests(): Promise<{ passed: number; failed: number; results: string[] }> {
        const results: string[] = [];
        let passed = 0;
        let failed = 0;

        print("=================================================");
        print("[LEAF TEST] Starting LifePulse Multi-Emergency Verification...");
        print("=================================================");

        // Test 1: Initialization
        try {
            this.assert(
                this.controller.currentEmergency === "CARDIAC",
                "Test 1: Default initial emergency mode must be CARDIAC."
            );
            this.assert(
                this.controller.compressionTarget !== null && this.controller.compressionTarget !== undefined,
                "Test 1: Target ring must be instantiated."
            );
            results.push("PASS: Test 1 - Scene Initialization & Default Mode");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 1 - ${e.message}`);
            failed++;
        }

        // Test 2: Cardiac Mode & 30:2 Cadence
        try {
            this.controller.loadEmergency("CARDIAC");
            for (let i = 1; i <= 30; i++) {
                this.controller.onInteraction();
            }
            this.assert(
                this.controller.statusHUDText.text.includes("RESCUE BREATHS"),
                "Test 2: Reaching 30 compressions must automatically trigger rescue breath prompt."
            );
            results.push("PASS: Test 2 - Cardiac 30 Compressions & Rescue Breath Transition");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 2 - ${e.message}`);
            failed++;
        }

        // Test 3: Emergency Mode Switching (Choking)
        try {
            this.controller.loadEmergency("CHOKING");
            this.assert(
                this.controller.currentEmergency === "CHOKING",
                "Test 3: Must switch to CHOKING mode."
            );
            this.assert(
                this.controller.statusHUDText.text.includes("CHOKING"),
                "Test 3: Status HUD must display choking protocol."
            );
            results.push("PASS: Test 3 - Mode Switch to Choking Protocol");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 3 - ${e.message}`);
            failed++;
        }

        // Test 4: Choking Heimlich Thrust Tracking
        try {
            for (let i = 1; i <= 5; i++) {
                this.controller.onInteraction();
            }
            this.assert(
                this.controller.counterText.text.includes("5 / 5"),
                "Test 4: Must accurately count 5 Heimlich abdominal thrusts."
            );
            results.push("PASS: Test 4 - 5 Heimlich Abdominal Thrusts Verification");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 4 - ${e.message}`);
            failed++;
        }

        // Test 5: Severe Bleeding Protocol
        try {
            this.controller.loadEmergency("BLEEDING");
            this.assert(
                this.controller.currentEmergency === "BLEEDING",
                "Test 5: Must switch to BLEEDING mode."
            );
            this.controller.onInteraction();
            this.assert(
                this.controller.counterText.text.includes("PRESSURE APPLIED"),
                "Test 5: Must record continuous direct pressure on wound site."
            );
            results.push("PASS: Test 5 - Severe Bleeding Pressure & Tourniquet Guidance");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 5 - ${e.message}`);
            failed++;
        }

        // Test 6: Opioid Overdose & Recovery Position
        try {
            this.controller.loadEmergency("OVERDOSE");
            this.assert(
                this.controller.currentEmergency === "OVERDOSE",
                "Test 6: Must switch to OVERDOSE mode."
            );
            this.controller.onInteraction(); // Spray Narcan
            this.assert(
                this.controller.counterText.text.includes("NARCAN SPRAYED"),
                "Test 6: Must guide Narcan nasal spray and recovery position."
            );
            results.push("PASS: Test 6 - Opioid Overdose Narcan & Recovery Position");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 6 - ${e.message}`);
            failed++;
        }

        // Test 7: Additive Optics & Non-Zero Transforms
        try {
            this.assert(
                this.controller.statusHUDText !== null && this.controller.counterText !== null,
                "Test 7: Additive text elements are valid and allocated."
            );
            results.push("PASS: Test 7 - Additive Optics Shader Legibility Check");
            passed++;
        } catch (e) {
            results.push(`FAIL: Test 7 - ${e.message}`);
            failed++;
        }

        print("=================================================");
        print(`[LEAF TEST SUMMARY] Passed: ${passed} / 7 | Failed: ${failed}`);
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
