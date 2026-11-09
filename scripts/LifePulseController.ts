/**
 * LifePulseController.ts
 * 
 * Multi-Emergency Spatial First Responder Companion for Snap Spectacles.
 * 
 * Supports 4 Critical Emergency Modes:
 * 1. CARDIAC ARREST: 110 BPM Sternum Pulse Ring + 30:2 Compression & AED Guide.
 * 2. SEVERE CHOKING: 5 Back Blows & 5 Abdominal Thrusts (Heimlich) with Upward Arrow Guidance.
 * 3. SEVERE BLEEDING: Direct Wound Pressure Gauge + 2-3 Inch Tourniquet Placement.
 * 4. OPIOID OVERDOSE: Naloxone / Narcan Nasal Spray Prompt + Recovery Position Roll.
 * 
 * Interactive Controls:
 * - Click the [SWITCH EMERGENCY] prompt or Press 1/2/3/4 to toggle emergency mode.
 * - Left-click pumps / acts on the current emergency with live visual bounce and counter.
 */

export type EmergencyType = "CARDIAC" | "CHOKING" | "BLEEDING" | "OVERDOSE";

@component
export class LifePulseController extends BaseScriptComponent {

    @input
    patientRoot?: SceneObject;

    @input
    compressionTarget?: SceneObject;

    @input
    counterText?: Text3D;

    @input
    statusHUDText?: Text3D;

    // Active Emergency State
    public currentEmergency: EmergencyType = "CARDIAC";
    private readonly EMERGENCIES: EmergencyType[] = ["CARDIAC", "CHOKING", "BLEEDING", "OVERDOSE"];
    private emergencyIndex: number = 0;

    // Emergency Sub-states
    public actionCount: number = 0;
    public subState: string = "ACTIVE";

    // 110 BPM Metronome Timing (for Cardiac)
    private readonly BEAT_INTERVAL: number = 60 / 110;
    private beatTimer: number = 0;
    private ringBaseScale: vec3 = new vec3(0.35, 0.35, 0.35);
    private isPulsing: boolean = true;

    // Bleeding Pressure Hold Timer
    private pressureHoldTimer: number = 0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    private init() {
        print("[LifePulse] Initializing Multi-Emergency Spatial Companion...");

        this.autoResolveSceneObjects();

        if (this.compressionTarget) {
            this.ringBaseScale = this.compressionTarget.getTransform().getLocalScale();
            this.compressionTarget.enabled = true;
        }

        // Global Interactive Events
        const tapEvent = this.createEvent("TapEvent");
        tapEvent.bind((eventData) => this.onInteraction(eventData));

        const touchEvent = this.createEvent("TouchStartEvent");
        touchEvent.bind((eventData) => this.onInteraction(eventData));

        // Start with Cardiac mode
        this.loadEmergency("CARDIAC");
    }

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
     * Cycles to the next emergency type
     */
    public cycleEmergency() {
        this.emergencyIndex = (this.emergencyIndex + 1) % this.EMERGENCIES.length;
        this.loadEmergency(this.EMERGENCIES[this.emergencyIndex]);
    }

    /**
     * Loads and configures the active emergency protocol
     */
    public loadEmergency(type: EmergencyType) {
        this.currentEmergency = type;
        this.actionCount = 0;
        this.subState = "ACTIVE";
        print(`[LifePulse] Switched Emergency Protocol -> ${type}`);

        switch (type) {
            case "CARDIAC":
                this.isPulsing = true;
                this.setTransformTarget(0, -12, -65, 80, 0.35); // Center sternum
                if (this.statusHUDText) {
                    this.statusHUDText.text = "[1/4] ❤️ CARDIAC ARREST: UNRESPONSIVE\n[CLICK TOP TO SWITCH] LOCK ELBOWS - 110 BPM";
                }
                if (this.counterText) {
                    this.counterText.text = "COMPRESSION: 0 / 30\nCLICK TO PUMP CHEST";
                }
                break;

            case "CHOKING":
                this.isPulsing = false;
                this.setTransformTarget(0, -6, -65, 80, 0.3); // Upper abdomen / navel
                if (this.statusHUDText) {
                    this.statusHUDText.text = "[2/4] 🗣️ CHOKING: AIRWAY BLOCKED\n5 BACK BLOWS -> 5 INWARD-UPWARD THRUSTS";
                }
                if (this.counterText) {
                    this.counterText.text = "ABDOMINAL THRUST: 0 / 5\nCLICK TO APPLY HEIMLICH THRUST";
                }
                break;

            case "BLEEDING":
                this.isPulsing = false;
                this.pressureHoldTimer = 0;
                this.setTransformTarget(-15, -15, -65, 70, 0.28); // Limb pressure point
                if (this.statusHUDText) {
                    this.statusHUDText.text = "[3/4] 🩸 SEVERE ARTERIAL BLEEDING\nDIRECT FIRM PRESSURE OR TOURNIQUET 2\" ABOVE";
                }
                if (this.counterText) {
                    this.counterText.text = "HOLD FIRM PRESSURE: CLICK TO MAINTAIN\nAPPLY TOURNIQUET IF SOAKING";
                }
                break;

            case "OVERDOSE":
                this.isPulsing = false;
                this.setTransformTarget(0, 0, -65, 0, 0.25); // Head / nasal area
                if (this.statusHUDText) {
                    this.statusHUDText.text = "[4/4] 💊 OPIOID OVERDOSE: UNRESPONSIVE\nADMINISTER NARCAN NASAL SPRAY";
                }
                if (this.counterText) {
                    this.counterText.text = "STEP 1: 1 SPRAY IN NOSTRIL\nSTEP 2: ROLL TO RECOVERY POSITION";
                }
                break;
        }
    }

    private setTransformTarget(x: number, y: number, z: number, rx: number, scale: number) {
        if (!this.compressionTarget) return;
        const transform = this.compressionTarget.getTransform();
        transform.setLocalPosition(new vec3(x, y, z));
        transform.setLocalRotation(quat.fromEulerVec(new vec3(rx * Math.PI / 180, 0, 0)));
        this.ringBaseScale = new vec3(scale, scale, scale);
        transform.setLocalScale(this.ringBaseScale);
        this.compressionTarget.enabled = true;
    }

    /**
     * Interactive Handler
     */
    public onInteraction(eventData?: any) {
        // If clicking in upper 20% of screen, switch emergency mode!
        if (eventData && eventData.getTapPosition) {
            const pos = eventData.getTapPosition();
            if (pos.y < 0.25) {
                this.cycleEmergency();
                return;
            }
        }

        // Otherwise execute active emergency step
        switch (this.currentEmergency) {
            case "CARDIAC":
                this.actionCount++;
                this.triggerSquash();
                if (this.counterText) {
                    this.counterText.text = `COMPRESSION: ${this.actionCount} / 30\n[CLICK TOP TO SWITCH EMERGENCY]`;
                }
                if (this.actionCount >= 30) {
                    this.actionCount = 0;
                    if (this.statusHUDText) {
                        this.statusHUDText.text = "TILT HEAD - GIVE 2 RESCUE BREATHS\nWATCH CHEST RISE";
                    }
                }
                break;

            case "CHOKING":
                this.actionCount++;
                this.triggerSquash();
                if (this.actionCount <= 5) {
                    if (this.counterText) {
                        this.counterText.text = `HEIMLICH THRUST: ${this.actionCount} / 5 [INWARD & UPWARD]\n[CLICK TOP TO SWITCH]`;
                    }
                } else {
                    this.actionCount = 0;
                    if (this.statusHUDText) {
                        this.statusHUDText.text = "CHECK MOUTH FOR OBJECT - REPEAT IF BLOCKED\nCALL 911 IF UNRESPONSIVE";
                    }
                }
                break;

            case "BLEEDING":
                this.actionCount++;
                this.triggerSquash();
                if (this.counterText) {
                    this.counterText.text = `PRESSURE APPLIED (HEMO-SEAL ${this.actionCount * 10}%)\nKEEP CONTINUOUS PRESSURE!`;
                }
                break;

            case "OVERDOSE":
                this.actionCount++;
                if (this.actionCount === 1) {
                    if (this.counterText) {
                        this.counterText.text = "NARCAN SPRAYED! NOW ROLL TO RECOVERY POSITION\nCLICK TO CONFIRM BREATHING";
                    }
                } else {
                    this.loadEmergency("CARDIAC"); // Transition to CPR if not breathing
                }
                break;
        }
    }

    private triggerSquash() {
        if (!this.compressionTarget) return;
        const transform = this.compressionTarget.getTransform();
        transform.setLocalScale(this.ringBaseScale.uniformScale(0.72));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget) {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        damp.reset(0.08);
    }

    private onUpdate() {
        const dt = getDeltaTime();

        // Continuous 110 BPM pulse in Cardiac mode
        if (this.currentEmergency === "CARDIAC" && this.isPulsing) {
            this.beatTimer += dt;
            if (this.beatTimer >= this.BEAT_INTERVAL) {
                this.beatTimer -= this.BEAT_INTERVAL;
                this.pulseRing();
            }
        }
    }

    private pulseRing() {
        if (!this.compressionTarget) return;
        const transform = this.compressionTarget.getTransform();
        transform.setLocalScale(this.ringBaseScale.uniformScale(1.22));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget && this.currentEmergency === "CARDIAC") {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        damp.reset(0.12);
    }
}
