/**
 * LifePulseController.ts
 * 
 * Core state machine and spatial orchestration for LifePulse AR.
 * Designed for Snap Spectacles via Lens Studio 5.2x+ and Spectacles Interaction Kit (SIK).
 * 
 * Manages:
 * 1. Emergency workflow states: ASSESSMENT -> COMPRESSIONS -> BREATHS -> AED_DEPLOYMENT -> COMPLETE
 * 2. 110 BPM visual & acoustic CPR metronome pulse
 * 3. 30:2 CPR compression counting & automatic phase transitions
 * 4. Additive glowing sternum target ring & AED pad placement guidance
 * 5. Stand-in SIK interactables for seamless Interactive Preview demonstrations
 */

@component
export class LifePulseController extends BaseScriptComponent {

    // ==========================================
    // INSPECTOR INPUTS & SCENE REFERENCES
    // ==========================================

    @input
    @hint("Virtual patient mannequin root object placed in room")
    patientRoot: SceneObject;

    @input
    @hint("Sternum compression target ring (sits on patient chest)")
    compressionTarget: SceneObject;

    @input
    @hint("Compression status and counter text component (3D Text)")
    counterText: Text3D;

    @input
    @hint("Emergency Phase / Instructional HUD text component (3D Text)")
    statusHUDText: Text3D;

    @input
    @hint("Rescue breath countdown card object (floats near patient mouth)")
    breathPromptCard: SceneObject;

    @input
    @hint("AED electrode pad guide root object (showing collarbone & rib targets)")
    aedPadGuideRoot: SceneObject;

    @input
    @hint("Auditory metronome click/tone component (110 BPM)")
    metronomeAudio: AudioComponent;

    @input
    @hint("State chime / confirmation audio component")
    chimeAudio: AudioComponent;

    // SIK Interactable Buttons (stand-ins for preview)
    @input
    @hint("SIK Button: Start CPR / Confirm 911")
    btnStartCPR: SceneObject;

    @input
    @hint("SIK Button: Simulate Single Chest Compression")
    btnSimulateCompression: SceneObject;

    @input
    @hint("SIK Button: Deploy Defibrillator / AED")
    btnDeployAED: SceneObject;

    @input
    @hint("SIK Button: Reset Scenario")
    btnReset: SceneObject;

    // ==========================================
    // INTERNAL STATE VARIABLES
    // ==========================================

    public currentState: "ASSESSMENT" | "COMPRESSIONS" | "BREATHS" | "AED_DEPLOYMENT" = "ASSESSMENT";
    public compressionCount: number = 0;
    public readonly TARGET_COMPRESSIONS: number = 30;
    public currentCycle: number = 1;

    // 110 BPM Metronome Timing (60 / 110 = ~0.5454 seconds per beat)
    private readonly BEAT_INTERVAL: number = 60 / 110;
    private beatTimer: number = 0;
    private ringBaseScale: vec3 = new vec3(1.0, 1.0, 1.0);
    private isPulsing: boolean = false;

    // Rescue Breath Countdown
    private breathTimer: number = 0;
    private readonly BREATH_DURATION: number = 4.0; // 4 seconds for 2 breaths

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    /**
     * Initializes scene states, hide unneeded elements, and binds SIK click handlers.
     */
    private init() {
        print("[LifePulseAR] Initializing LifePulse Emergency Spatial Companion...");

        // Cache initial scale of the sternum target ring
        if (this.compressionTarget) {
            this.ringBaseScale = this.compressionTarget.getTransform().getLocalScale();
        }

        // Setup SIK interactable callbacks (mouse click in preview / pinch on Spectacles)
        this.bindSIKButton(this.btnStartCPR, () => this.startCPR());
        this.bindSIKButton(this.btnSimulateCompression, () => this.registerCompression());
        this.bindSIKButton(this.btnDeployAED, () => this.transitionToAED());
        this.bindSIKButton(this.btnReset, () => this.resetScenario());

        // Start in Assessment mode
        this.setAssessmentState();
    }

    /**
     * Helper to wire SIK Interactables safely across versions
     */
    private bindSIKButton(buttonObject: SceneObject, callback: () => void) {
        if (!buttonObject) return;

        // Try getting SIK Interactable component
        const interactable = (buttonObject as any).getComponent("SIK:Interactable") ||
                             (buttonObject as any).getComponent("Interactable");

        if (interactable && interactable.onTriggerEnd) {
            interactable.onTriggerEnd.add(callback);
        } else {
            // Fallback to standard touch/click event for editor preview resilience
            const touchComponent = buttonObject.createComponent("Component.TouchComponent");
            if (touchComponent) {
                const tapEvent = this.createEvent("TapEvent");
                tapEvent.bind(callback);
            }
        }
    }

    /**
     * Phase 1: Assessment State
     */
    public setAssessmentState() {
        this.currentState = "ASSESSMENT";
        this.compressionCount = 0;
        this.currentCycle = 1;

        if (this.statusHUDText) {
            this.statusHUDText.text = "EMERGENCY: UNRESPONSIVE PATIENT\nCHECK BREATHING - CALL 911";
        }
        if (this.counterText) {
            this.counterText.text = "PINCH 'START CPR' TO BEGIN";
        }

        // Selective disclosure: Hide active CPR & AED guides until needed
        if (this.compressionTarget) this.compressionTarget.enabled = false;
        if (this.breathPromptCard) this.breathPromptCard.enabled = false;
        if (this.aedPadGuideRoot) this.aedPadGuideRoot.enabled = false;

        // Button visibility
        if (this.btnStartCPR) this.btnStartCPR.enabled = true;
        if (this.btnSimulateCompression) this.btnSimulateCompression.enabled = false;
        if (this.btnDeployAED) this.btnDeployAED.enabled = true;

        print("[LifePulseAR] State -> ASSESSMENT");
    }

    /**
     * Phase 2: Active CPR Chest Compressions (110 BPM Metronome)
     */
    public startCPR() {
        this.currentState = "COMPRESSIONS";
        this.compressionCount = 0;
        this.beatTimer = 0;
        this.isPulsing = true;

        if (this.statusHUDText) {
            this.statusHUDText.text = `CYCLE ${this.currentCycle}: CHEST COMPRESSIONS\nLOCK ELBOWS - PUSH HARD & FAST`;
        }
        this.updateCounterDisplay();

        if (this.compressionTarget) this.compressionTarget.enabled = true;
        if (this.breathPromptCard) this.breathPromptCard.enabled = false;
        if (this.aedPadGuideRoot) this.aedPadGuideRoot.enabled = false;

        if (this.btnStartCPR) this.btnStartCPR.enabled = false;
        if (this.btnSimulateCompression) this.btnSimulateCompression.enabled = true;

        this.playChime();
        print("[LifePulseAR] State -> COMPRESSIONS (110 BPM)");
    }

    /**
     * Registers a single chest compression, updating counter and checking cycle thresholds.
     */
    public registerCompression() {
        if (this.currentState !== "COMPRESSIONS") return;

        this.compressionCount++;
        this.triggerVisualCompressionBounce();
        this.updateCounterDisplay();

        print(`[LifePulseAR] Compression registered: ${this.compressionCount}/${this.TARGET_COMPRESSIONS}`);

        if (this.compressionCount >= this.TARGET_COMPRESSIONS) {
            this.transitionToBreaths();
        }
    }

    private updateCounterDisplay() {
        if (this.counterText) {
            this.counterText.text = `${this.compressionCount} / ${this.TARGET_COMPRESSIONS}\n110 BPM [OPTIMAL]`;
        }
    }

    /**
     * Phase 3: Rescue Breaths Transition
     */
    private transitionToBreaths() {
        this.currentState = "BREATHS";
        this.isPulsing = false;
        this.breathTimer = this.BREATH_DURATION;

        if (this.statusHUDText) {
            this.statusHUDText.text = "TILT HEAD - LIFT CHIN\nGIVE 2 RESCUE BREATHS";
        }
        if (this.counterText) {
            this.counterText.text = "WATCH CHEST RISE";
        }

        // Show breath guidance card over mouth; dim chest target
        if (this.compressionTarget) this.compressionTarget.enabled = false;
        if (this.breathPromptCard) this.breathPromptCard.enabled = true;
        if (this.btnSimulateCompression) this.btnSimulateCompression.enabled = false;

        this.playChime();
        print("[LifePulseAR] State -> RESCUE BREATHS (4s Countdown)");
    }

    /**
     * Phase 4: AED Deployment & Pad Placement Guide
     */
    public transitionToAED() {
        this.currentState = "AED_DEPLOYMENT";
        this.isPulsing = false;

        if (this.statusHUDText) {
            this.statusHUDText.text = "AED ARRIVED - APPLY PADS TO BARE CHEST\nFOLLOW HOLOGRAPHIC TARGETS";
        }
        if (this.counterText) {
            this.counterText.text = "PAD 1: UPPER RIGHT CHEST\nPAD 2: LOWER LEFT RIBS";
        }

        // Show holographic pad positions on mannequin torso
        if (this.compressionTarget) this.compressionTarget.enabled = false;
        if (this.breathPromptCard) this.breathPromptCard.enabled = false;
        if (this.aedPadGuideRoot) this.aedPadGuideRoot.enabled = true;

        if (this.btnStartCPR) this.btnStartCPR.enabled = true; // allow resuming CPR
        if (this.btnSimulateCompression) this.btnSimulateCompression.enabled = false;

        this.playChime();
        print("[LifePulseAR] State -> AED DEPLOYMENT");
    }

    /**
     * Reset the scenario to initial state
     */
    public resetScenario() {
        this.setAssessmentState();
        this.playChime();
    }

    /**
     * Per-frame update loop driving 110 BPM metronome and timers
     */
    private onUpdate() {
        const dt = getDeltaTime();

        // 1. Metronome pulsing during COMPRESSIONS
        if (this.currentState === "COMPRESSIONS" && this.isPulsing) {
            this.beatTimer += dt;
            if (this.beatTimer >= this.BEAT_INTERVAL) {
                this.beatTimer -= this.BEAT_INTERVAL;
                this.playMetronomeTick();
                this.pulseRingAnimation();
            }
        }

        // 2. Breath timer countdown during BREATHS
        if (this.currentState === "BREATHS") {
            this.breathTimer -= dt;
            if (this.counterText) {
                const remaining = Math.max(0, Math.ceil(this.breathTimer));
                this.counterText.text = `RESUME COMPRESSIONS IN: ${remaining}s`;
            }

            if (this.breathTimer <= 0) {
                // Advance cycle and resume compressions
                this.currentCycle++;
                this.startCPR();
            }
        }
    }

    /**
     * Spatial pulse animation for the sternum target ring
     */
    private pulseRingAnimation() {
        if (!this.compressionTarget) return;

        const transform = this.compressionTarget.getTransform();
        const pulseScale = this.ringBaseScale.uniformScale(1.18);
        transform.setLocalScale(pulseScale);

        // Quick dampening back to base scale
        const dampEvent = this.createEvent("DelayedCallbackEvent");
        dampEvent.bind(() => {
            if (this.compressionTarget) {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        dampEvent.reset(0.12);
    }

    /**
     * Visual feedback on compression registered
     */
    private triggerVisualCompressionBounce() {
        if (!this.compressionTarget) return;

        const transform = this.compressionTarget.getTransform();
        const compressedScale = this.ringBaseScale.uniformScale(0.85);
        transform.setLocalScale(compressedScale);

        const restoreEvent = this.createEvent("DelayedCallbackEvent");
        restoreEvent.bind(() => {
            if (this.compressionTarget) {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        restoreEvent.reset(0.08);
    }

    private playMetronomeTick() {
        if (this.metronomeAudio && this.metronomeAudio.play) {
            this.metronomeAudio.play(1);
        }
    }

    private playChime() {
        if (this.chimeAudio && this.chimeAudio.play) {
            this.chimeAudio.play(1);
        }
    }
}
