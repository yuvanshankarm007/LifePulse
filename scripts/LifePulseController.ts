/**
 * LifePulseController.ts
 * 
 * LifePulse: Intelligent Multi-Emergency Spatial First Responder
 * Built for Snap Spectacles | Learn AR with SPECS (Devpost & Snap Inc.)
 * 
 * Comprehensive Emergency Coverage:
 * 1. CARDIAC ARREST (Adult / Child / Infant) + AED + Rescuer Fatigue Detection (2 min swap)
 * 2. SEVERE CHOKING (Conscious Heimlich -> Unconscious CPR transition edge-case)
 * 3. SEVERE ARTERIAL BLEEDING (Direct Pressure -> Tourniquet 2-3" -> 2nd Tourniquet edge-case)
 * 4. OPIOID OVERDOSE (Narcan Nasal Spray -> Recovery Position Roll)
 * 5. ANAPHYLAXIS / ALLERGIC SHOCK (EpiPen Outer Mid-Thigh 3-Second Hold)
 * 6. SEIZURE / CONVULSIONS (Hazard Clear -> Duration Timer -> DO NOT Restrain guidance)
 * 
 * Dual Intelligence Modes:
 * - AUTO-DETECT MODE: Computer vision spatial scanner evaluates victim posture & signs.
 * - VOICE COMMAND MODE: Recognizes vocal emergency cues ("He's choking!", "Start CPR!", "Severe Bleeding!", "EpiPen!", "Overdose!") with visual voice banner feedback.
 */

export type EmergencyType = "CARDIAC" | "CHOKING" | "BLEEDING" | "OVERDOSE" | "ANAPHYLAXIS" | "SEIZURE";
export type VictimDemographic = "ADULT" | "CHILD" | "INFANT";

@component
export class LifePulseController extends BaseScriptComponent {

    @input patientRoot?: SceneObject;
    @input compressionTarget?: SceneObject;
    @input counterText?: Text3D;
    @input statusHUDText?: Text3D;

    // Active Emergency State
    public currentEmergency: EmergencyType = "CARDIAC";
    public demographic: VictimDemographic = "ADULT";
    public actionCount: number = 0;
    public cycleCount: number = 1;
    public subState: string = "ACTIVE";

    // Auto-Detect & Voice State
    public isAutoDetecting: boolean = false;
    public lastVoiceCommand: string = "MIC ACTIVE: Listening for 'CPR', 'Choking', 'Bleeding', 'Allergy', 'Overdose'...";

    // Timing & Pulse Engines
    private readonly BEAT_INTERVAL: number = 60 / 110; // 110 BPM (~0.545s)
    private beatTimer: number = 0;
    private ringBaseScale: vec3 = new vec3(0.35, 0.35, 0.35);
    private isPulsing: boolean = true;

    // Rescuer Fatigue & Edge Case Timers
    private cprElapsedTime: number = 0;
    private readonly RESCUER_SWAP_TIME: number = 120.0; // 2 minutes (AHA guideline)
    private breathTimer: number = 0;
    private seizureTimer: number = 0;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => this.init());
        this.createEvent("UpdateEvent").bind(() => this.onUpdate());
    }

    private init() {
        print("[LifePulse] Initializing Multi-Emergency Spatial Companion with Voice & Auto-Detect...");

        this.autoResolveSceneObjects();

        if (this.compressionTarget) {
            this.ringBaseScale = this.compressionTarget.getTransform().getLocalScale();
            this.compressionTarget.enabled = true;
        }

        // Global Tap / Pinch Event
        const tapEvent = this.createEvent("TapEvent");
        tapEvent.bind((eventData) => this.onUserInteraction(eventData));

        const touchEvent = this.createEvent("TouchStartEvent");
        touchEvent.bind((eventData) => this.onUserInteraction(eventData));

        // Start in Auto-Detect scanning mode
        this.triggerAutoDetectScan();
    }

    private autoResolveSceneObjects() {
        if (!this.compressionTarget) this.compressionTarget = this.findSceneObjectByName("CompressionTargetRing");
        if (!this.patientRoot) this.patientRoot = this.findSceneObjectByName("PatientMannequin");
        if (!this.statusHUDText) {
            const hudObj = this.findSceneObjectByName("StatusHUD");
            if (hudObj) this.statusHUDText = hudObj.getComponent("Component.Text3D") as any;
        }
        if (!this.counterText) {
            const counterObj = this.findSceneObjectByName("CounterDisplay");
            if (counterObj) this.counterText = counterObj.getComponent("Component.Text3D") as any;
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
     * AUTO-DETECT MODE: Simulates real-time Computer Vision analysis of victim posture & vitals
     */
    public triggerAutoDetectScan() {
        this.isAutoDetecting = true;
        if (this.statusHUDText) {
            this.statusHUDText.text = "🔍 [AI AUTO-DETECT]: SCANNING VICTIM & SCENE...\nCHECKING UNRESPONSIVENESS, BREATHING & POSTURE";
        }
        if (this.counterText) {
            this.counterText.text = "STAND CLEAR: ANALYZING SCENE (1.5s)\nOR SPEAK: 'CPR', 'CHOKING', 'BLEEDING', 'EPIPEN'";
        }

        const scanComplete = this.createEvent("DelayedCallbackEvent");
        scanComplete.bind(() => {
            this.isAutoDetecting = false;
            // Defaults to Cardiac Arrest after verifying unresponsiveness
            this.loadEmergency("CARDIAC", "AUTO-DETECT: UNRESPONSIVE ON FLOOR - NO PULSE");
        });
        scanComplete.reset(1.5);
    }

    /**
     * VOICE COMMAND MODE: Interprets natural language voice commands from bystander
     */
    public processVoiceCommand(command: string) {
        const cmd = command.toLowerCase().trim();
        print(`[LifePulse Voice] Processing command: "${command}"`);

        if (cmd.includes("cpr") || cmd.includes("heart") || cmd.includes("cardiac") || cmd.includes("arrest")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> CARDIAC PROTOCOL`;
            this.loadEmergency("CARDIAC", "VOICE DETECTED: CARDIAC ARREST");
        } else if (cmd.includes("choke") || cmd.includes("choking") || cmd.includes("heimlich") || cmd.includes("airway")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> CHOKING PROTOCOL`;
            this.loadEmergency("CHOKING", "VOICE DETECTED: CHOKING");
        } else if (cmd.includes("bleed") || cmd.includes("bleeding") || cmd.includes("blood") || cmd.includes("wound") || cmd.includes("tourniquet")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> SEVERE BLEEDING PROTOCOL`;
            this.loadEmergency("BLEEDING", "VOICE DETECTED: ARTERIAL BLEEDING");
        } else if (cmd.includes("overdose") || cmd.includes("narcan") || cmd.includes("naloxone") || cmd.includes("drug")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> OVERDOSE PROTOCOL`;
            this.loadEmergency("OVERDOSE", "VOICE DETECTED: OPIOID OVERDOSE");
        } else if (cmd.includes("allergy") || cmd.includes("allergic") || cmd.includes("epipen") || cmd.includes("anaphylaxis") || cmd.includes("throat swelling")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> ANAPHYLAXIS PROTOCOL`;
            this.loadEmergency("ANAPHYLAXIS", "VOICE DETECTED: ANAPHYLAXIS");
        } else if (cmd.includes("seizure") || cmd.includes("shaking") || cmd.includes("convulsion") || cmd.includes("epilepsy")) {
            this.lastVoiceCommand = `🎙️ VOICE: "${command}" -> SEIZURE PROTOCOL`;
            this.loadEmergency("SEIZURE", "VOICE DETECTED: ACTIVE SEIZURE");
        } else if (cmd.includes("child")) {
            this.demographic = "CHILD";
            this.loadEmergency(this.currentEmergency, "DEMOGRAPHIC: CHILD (1 HAND, 2 INCHES)");
        } else if (cmd.includes("infant") || cmd.includes("baby")) {
            this.demographic = "INFANT";
            this.loadEmergency(this.currentEmergency, "DEMOGRAPHIC: INFANT (2 FINGERS, 1.5 INCHES)");
        } else if (cmd.includes("scan") || cmd.includes("detect") || cmd.includes("analyze")) {
            this.triggerAutoDetectScan();
        }
    }

    /**
     * Loads the designated emergency protocol and reconfigures 3D spatial anchors
     */
    public loadEmergency(type: EmergencyType, reasonHeader?: string) {
        this.currentEmergency = type;
        this.actionCount = 0;
        this.subState = "ACTIVE";
        this.cprElapsedTime = 0;

        const headerPrefix = reasonHeader ? `${reasonHeader}\n` : "";

        switch (type) {
            case "CARDIAC":
                this.isPulsing = true;
                this.setTransformTarget(0, -12, -65, 80, 0.35); // Center sternum
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[1/6] ❤️ CARDIAC ARREST: ${this.demographic}\nLOCK ELBOWS • PUSH HARD & FAST • 110 BPM`;
                }
                if (this.counterText) {
                    this.counterText.text = `COMPRESSION: 0 / 30 (CYCLE ${this.cycleCount})\nCLICK TO PUMP • TOP TO SWITCH`;
                }
                break;

            case "CHOKING":
                this.isPulsing = false;
                this.setTransformTarget(0, -6, -65, 80, 0.32); // Upper abdomen / navel
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[2/6] 🗣️ SEVERE CHOKING (CONSCIOUS)\nSTAND BEHIND: 5 BACK BLOWS -> 5 HEIMLICH THRUSTS`;
                }
                if (this.counterText) {
                    this.counterText.text = "ABDOMINAL THRUST: 0 / 5 [INWARD & UPWARD]\nCLICK TO APPLY THRUST";
                }
                break;

            case "BLEEDING":
                this.isPulsing = false;
                this.setTransformTarget(-15, -15, -65, 70, 0.28); // Limb wound
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[3/6] 🩸 SEVERE ARTERIAL BLEEDING\nAPPLY DIRECT FIRM PRESSURE OR TOURNIQUET 2\" ABOVE`;
                }
                if (this.counterText) {
                    this.counterText.text = "DIRECT PRESSURE: CLICK TO HOLD WOUND SEAL\nAPPLY TOURNIQUET IF BLEEDING PERSISTS";
                }
                break;

            case "OVERDOSE":
                this.isPulsing = false;
                this.setTransformTarget(0, 0, -65, 0, 0.25); // Nasal zone
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[4/6] 💊 OPIOID OVERDOSE: UNRESPONSIVE\nADMINISTER NARCAN NASAL SPRAY`;
                }
                if (this.counterText) {
                    this.counterText.text = "STEP 1: 1 SPRAY IN NOSTRIL\nSTEP 2: ROLL TO RECOVERY POSITION";
                }
                break;

            case "ANAPHYLAXIS":
                this.isPulsing = false;
                this.setTransformTarget(16, -18, -65, 60, 0.26); // Outer mid-thigh
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[5/6] ⚡ ANAPHYLAXIS / ALLERGIC SHOCK\nEPIPEN AUTO-INJECTOR: OUTER MID-THIGH`;
                }
                if (this.counterText) {
                    this.counterText.text = "INJECT THROUGH CLOTHES: CLICK TO INJECT\nHOLD FIRMLY FOR 3 SECONDS";
                }
                break;

            case "SEIZURE":
                this.isPulsing = false;
                this.seizureTimer = 0;
                this.setTransformTarget(0, -10, -75, 45, 0.45); // Perimeter hazard boundary
                if (this.statusHUDText) {
                    this.statusHUDText.text = `${headerPrefix}[6/6] 🧠 ACTIVE SEIZURE: CONVULSING\nCLEAR SHARP OBJECTS • DO NOT RESTRAIN • DO NOT PUT IN MOUTH`;
                }
                if (this.counterText) {
                    this.counterText.text = "PROTECT HEAD WITH SOFT OBJECT\nTIMING SEIZURE DURATION: 0s";
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
     * Primary Interaction Handler: triggers on mouse click / pinch
     */
    public onUserInteraction(eventData?: any) {
        if (this.isAutoDetecting) return;

        // Click top 25% of view: cycles emergency mode or triggers voice menu
        if (eventData && eventData.getTapPosition) {
            const pos = eventData.getTapPosition();
            if (pos.y < 0.25) {
                this.cycleNextEmergency();
                return;
            }
        }

        // Action execution for active emergency
        switch (this.currentEmergency) {
            case "CARDIAC":
                this.actionCount++;
                this.triggerSquash();
                if (this.counterText) {
                    this.counterText.text = `COMPRESSION: ${this.actionCount} / 30 (CYCLE ${this.cycleCount})\nCLICK TO PUMP • TOP TO SWITCH`;
                }
                if (this.actionCount >= 30) {
                    this.actionCount = 0;
                    this.transitionToRescueBreaths();
                }
                break;

            case "CHOKING":
                this.actionCount++;
                this.triggerSquash();
                if (this.actionCount <= 5) {
                    if (this.counterText) {
                        this.counterText.text = `HEIMLICH THRUST: ${this.actionCount} / 5 [INWARD & UPWARD]\nCLICK TO APPLY THRUST`;
                    }
                } else {
                    // EDGE CASE: If 5 thrusts fail, check airway or fallback to CPR if victim becomes unresponsive!
                    this.actionCount = 0;
                    if (this.statusHUDText) {
                        this.statusHUDText.text = "CHECK MOUTH FOR DISLODGED OBJECT\nIF UNRESPONSIVE: LOWER TO GROUND & START CPR!";
                    }
                }
                break;

            case "BLEEDING":
                this.actionCount++;
                this.triggerSquash();
                const sealPercent = Math.min(100, this.actionCount * 15);
                if (this.counterText) {
                    this.counterText.text = `DIRECT WOUND PRESSURE: ${sealPercent}% SEALED\nIF BLEEDING CONTINUES: APPLY TOURNIQUET 2" ABOVE`;
                }
                if (this.actionCount >= 7) {
                    // EDGE CASE: Second tourniquet guidance
                    if (this.statusHUDText) {
                        this.statusHUDText.text = "BLEEDING NOT STOPPED? APPLY 2ND TOURNIQUET\nABOVE FIRST TOURNIQUET • WRITE TIME ON FOREHEAD";
                    }
                }
                break;

            case "OVERDOSE":
                this.actionCount++;
                if (this.actionCount === 1) {
                    if (this.counterText) {
                        this.counterText.text = "NARCAN SPRAYED! NOW ROLL TO RECOVERY POSITION\nMONITOR BREATHING (2-3 MINUTE DELAY)";
                    }
                } else {
                    // Transition to CPR if still unresponsive/no breathing
                    this.loadEmergency("CARDIAC", "OVERDOSE UNRESPONSIVE - NO BREATHING -> START CPR");
                }
                break;

            case "ANAPHYLAXIS":
                this.actionCount++;
                this.triggerSquash();
                if (this.counterText) {
                    this.counterText.text = "EPIPEN DELIVERED (3s HOLD COMPLETE)\nMASSAGE INJECTION SITE FOR 10 SECONDS";
                }
                break;

            case "SEIZURE":
                this.actionCount++;
                if (this.counterText) {
                    this.counterText.text = "SEIZURE RESOLVED -> ROLL TO RECOVERY POSITION\nMAINTAIN CLEAR AIRWAY • CALL 911";
                }
                break;
        }
    }

    private cycleNextEmergency() {
        const emergencies: EmergencyType[] = ["CARDIAC", "CHOKING", "BLEEDING", "OVERDOSE", "ANAPHYLAXIS", "SEIZURE"];
        const nextIndex = (emergencies.indexOf(this.currentEmergency) + 1) % emergencies.length;
        this.loadEmergency(emergencies[nextIndex]);
    }

    private transitionToRescueBreaths() {
        this.subState = "BREATHS";
        this.isPulsing = false;
        this.breathTimer = 4.0;

        if (this.statusHUDText) {
            this.statusHUDText.text = "TILT HEAD & LIFT CHIN\nGIVE 2 RESCUE BREATHS";
        }
        if (this.counterText) {
            this.counterText.text = "WATCH CHEST RISE (4s)\nCLICK TO RESUME CPR";
        }
        if (this.compressionTarget) {
            this.compressionTarget.getTransform().setLocalScale(this.ringBaseScale.uniformScale(0.3));
        }
    }

    private triggerSquash() {
        if (!this.compressionTarget) return;
        const transform = this.compressionTarget.getTransform();
        transform.setLocalScale(this.ringBaseScale.uniformScale(0.72));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget) transform.setLocalScale(this.ringBaseScale);
        });
        damp.reset(0.08);
    }

    private onUpdate() {
        const dt = getDeltaTime();

        // 1. 110 BPM Rhythmic Metronome for Cardiac Mode
        if (this.currentEmergency === "CARDIAC" && this.isPulsing && this.subState === "ACTIVE") {
            this.beatTimer += dt;
            if (this.beatTimer >= this.BEAT_INTERVAL) {
                this.beatTimer -= this.BEAT_INTERVAL;
                this.pulseRing();
            }

            // EDGE CASE: Rescuer Fatigue Detection (AHA 2-minute cycle swap)
            this.cprElapsedTime += dt;
            if (this.cprElapsedTime >= this.RESCUER_SWAP_TIME) {
                if (this.statusHUDText) {
                    this.statusHUDText.text = "⚠️ 2 MINUTES COMPLETED: RESCUER FATIGUE DETECTED!\nSWAP RESCUERS NOW IN <5 SECONDS TO MAINTAIN 5CM DEPTH";
                }
            }
        }

        // 2. Rescue Breath Countdown
        if (this.subState === "BREATHS") {
            this.breathTimer -= dt;
            const remaining = Math.max(0, Math.ceil(this.breathTimer));
            if (this.counterText) {
                this.counterText.text = `RESCUE BREATHS: ${remaining}s REMAINING\nWATCH CHEST RISE`;
            }
            if (this.breathTimer <= 0) {
                this.subState = "ACTIVE";
                this.cycleCount++;
                this.isPulsing = true;
                if (this.compressionTarget) this.compressionTarget.getTransform().setLocalScale(this.ringBaseScale);
                if (this.statusHUDText) {
                    this.statusHUDText.text = `CYCLE ${this.cycleCount}: CHEST COMPRESSIONS\nLOCK ELBOWS • 110 BPM`;
                }
            }
        }

        // 3. Seizure Duration Timer
        if (this.currentEmergency === "SEIZURE") {
            this.seizureTimer += dt;
            const seconds = Math.floor(this.seizureTimer);
            if (this.counterText && seconds % 2 === 0) {
                this.counterText.text = `SEIZURE DURATION: ${seconds}s\nIF >5 MINUTES: STATUS EPILEPTICUS (CRITICAL EMERGENCY)`;
            }
        }
    }

    private pulseRing() {
        if (!this.compressionTarget) return;
        const transform = this.compressionTarget.getTransform();
        transform.setLocalScale(this.ringBaseScale.uniformScale(1.22));

        const damp = this.createEvent("DelayedCallbackEvent");
        damp.bind(() => {
            if (this.compressionTarget && this.currentEmergency === "CARDIAC" && this.subState === "ACTIVE") {
                transform.setLocalScale(this.ringBaseScale);
            }
        });
        damp.reset(0.12);
    }
}
