/**
 * LifePulseController.ts
 * 
 * Fully Interactive Emergency Spatial Coach for Snap Spectacles & Lens Studio Preview.
 * 
 * Features:
 * 1. Auto-resolves StatusHUD, CounterDisplay, CompressionTargetRing, and Mannequin dynamically.
 * 2. Continuous 110 BPM rhythmic pulsing ring animation (never stationary).
 * 3. Reactive mouse/touch input: Left-clicking anywhere in Interactive Preview triggers
 *    compressions, updates the counter in real time, and triggers elastic recoil bounce!
 * 4. Automatic 30:2 CPR cycle transitions: 30 compressions -> 4s rescue breath countdown -> AED guides.
 */

@component
export class LifePulseController extends BaseScriptComponent {

    @input
    patientRoot: SceneObject;

    @input
    compressionTarget: SceneObject;

    @input
    counterText: Text3D;

    @input
    statusHUDText: Text3D;

    @input
    btnStartCPR: SceneObject;

    @input
    btnSimulateCompression: SceneObject;

    public currentState: "COMPRESSIONS" | "BREATHS" | "AED" = "COMPRESSIONS";
    public compressionCount: number = 0;
    public readonly TARGET_COMPRESSIONS: number = 30;
    public currentCycle: number = 1;

    // 110 BPM Metronome Timing (60 / 110 = ~0.545s)
    private readonly BEAT_INTERVAL: number = 60 / 110;
    private beatTimer: number = 0;
    private ringBaseScale: vec3 = new vec3(0.35, 0.35, 0.35);
    private isPulsing: boolean = true;

    // Breath Timer
    private breathTimer: number = 0;
    private readonly BREATH_DURATION: number = 4.0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    private init() {
        print("[LifePulse] Initializing Interactive Emergency Spatial Companion...");

        // 1. Auto-find scene references if not assigned in Inspector
        this.autoResolveSceneObjects();

        // 2. Cache base scale
        if (this.compressionTarget) {
            this.ringBaseScale = this.compressionTarget.getTransform().getLocalScale();
            this.compressionTarget.enabled = true;
        }

        // 3. Bind Global Mouse Click / Touch in Interactive Preview
        const tapEvent = this.createEvent("TapEvent");
        tapEvent.bind(() => this.onUserInteraction());

        const touchEvent = this.createEvent("TouchStartEvent");
        touchEvent.bind(() => this.onUserInteraction());

        // 4. Start in active CPR mode so it is immediately alive and pulsing
        this.startCPRMode();
    }

    /**
     * Automatically discovers scene objects by name if Inspector slots are empty.
     */
    private autoResolveSceneObjects() {
        if (!this.compressionTarget) {
            this.compressionTarget = this.findSceneObjectByName("CompressionTargetRing");
        }
        if (!this.patientRoot) {
            this.patientRoot = this.findSceneObjectByName("PatientMannequin");
        }
        if (!this.statusHUDText) {
            const hudObj = this.findSceneObjectByName("StatusHUD");
            if (hudObj) {
                this.statusHUDText = hudObj.getComponent("Component.Text3D") as any;
            }
        }
        if (!this.counterText) {
            const counterObj = this.findSceneObjectByName("CounterDisplay");
            if (counterObj) {
                this.counterText = counterObj.getComponent("Component.Text3D") as any;
            }
        }
    }

    private findSceneObjectByName(name: string): SceneObject | null {
        const rootCount = global.scene.getRootObjectsCount();
        for (let i = 0; i < rootCount; i++) {
            const root = global.scene.getRootObject(i);
            if (root.name === name) return root;
            const child = this.searchChild(root, name);
            if (child) return child;
        }
        return null;
    }

    private searchChild(parent: SceneObject, name: string): SceneObject | null {
        const childCount = parent.getChildrenCount();
        for (let i = 0; i < childCount; i++) {
            const child = parent.getChild(i);
            if (child.name === name) return child;
            const nested = this.searchChild(child, name);
            if (nested) return nested;
        }
        return null;
    }

    /**
     * Primary Interaction Handler: triggers when clicking anywhere in Preview!
     */
    public onUserInteraction() {
        print("[LifePulse] User clicked / pinched!");

        if (this.currentState === "COMPRESSIONS") {
            this.registerCompression();
        } else if (this.currentState === "BREATHS") {
            // Click during breaths advances early or switches to AED
            this.transitionToAED();
        } else if (this.currentState === "AED") {
            // Click in AED resumes CPR
            this.startCPRMode();
        }
    }

    private startCPRMode() {
        this.currentState = "COMPRESSIONS";
        this.compressionCount = 0;
        this.isPulsing = true;

        if (this.statusHUDText) {
            this.statusHUDText.text = `EMERGENCY CPR ACTIVE (CYCLE ${this.currentCycle})\n110 BPM RHYTHM`;
        }
        this.updateCounterDisplay();

        if (this.compressionTarget) {
            this.compressionTarget.enabled = true;
        }
    }

    public registerCompression() {
        this.compressionCount++;
        this.triggerCompressionBounce();
        this.updateCounterDisplay();

        print(`[LifePulse] Compression: ${this.compressionCount}/${this.TARGET_COMPRESSIONS}`);

        if (this.compressionCount >= this.TARGET_COMPRESSIONS) {
            this.transitionToBreaths();
        }
    }

    private updateCounterDisplay() {
        if (this.counterText) {
            this.counterText.text = `COMPRESSION: ${this.compressionCount} / ${this.TARGET_COMPRESSIONS}\nCLICK TO PUMP CHEST`;
        }
    }

    private triggerCompressionBounce() {
        if (!this.compressionTarget) return;

        const transform = this.compressionTarget.getTransform();
        // Compressive squash
        transform.setLocalScale(this.ringBaseScale.uniformScale(0.75));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget) {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        damp.reset(0.08);
    }

    private transitionToBreaths() {
        this.currentState = "BREATHS";
        this.isPulsing = false;
        this.breathTimer = this.BREATH_DURATION;

        if (this.statusHUDText) {
            this.statusHUDText.text = "TILT HEAD & LIFT CHIN\nGIVE 2 RESCUE BREATHS";
        }
        if (this.counterText) {
            this.counterText.text = "WATCH CHEST RISE (4s)";
        }

        // Dim chest target ring during rescue breaths (Selective Disclosure)
        if (this.compressionTarget) {
            this.compressionTarget.getTransform().setLocalScale(this.ringBaseScale.uniformScale(0.4));
        }
    }

    private transitionToAED() {
        this.currentState = "AED";
        this.isPulsing = false;

        if (this.statusHUDText) {
            this.statusHUDText.text = "AED DEFIBRILLATOR READY\nAPPLY PADS TO BARE CHEST";
        }
        if (this.counterText) {
            this.counterText.text = "PAD 1: UPPER RIGHT | PAD 2: LOWER RIBS\nCLICK TO RESUME CPR";
        }

        if (this.compressionTarget) {
            this.compressionTarget.enabled = true;
            this.compressionTarget.getTransform().setLocalScale(this.ringBaseScale);
        }
    }

    private onUpdate() {
        const dt = getDeltaTime();

        // 1. 110 BPM Rhythmic Pulse (Runs continuously)
        if (this.currentState === "COMPRESSIONS" && this.isPulsing) {
            this.beatTimer += dt;
            if (this.beatTimer >= this.BEAT_INTERVAL) {
                this.beatTimer -= this.BEAT_INTERVAL;
                this.pulseRingAnimation();
            }
        }

        // 2. Rescue Breath Countdown
        if (this.currentState === "BREATHS") {
            this.breathTimer -= dt;
            const remaining = Math.max(0, Math.ceil(this.breathTimer));
            if (this.counterText) {
                this.counterText.text = `GIVE 2 RESCUE BREATHS: ${remaining}s\nWATCH CHEST RISE`;
            }

            if (this.breathTimer <= 0) {
                this.currentCycle++;
                this.startCPRMode();
            }
        }
    }

    private pulseRingAnimation() {
        if (!this.compressionTarget) return;

        const transform = this.compressionTarget.getTransform();
        // Pulse expand by 25%
        transform.setLocalScale(this.ringBaseScale.uniformScale(1.25));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget && this.currentState === "COMPRESSIONS") {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        damp.reset(0.14);
    }
}
