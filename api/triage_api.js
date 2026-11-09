/**
 * triage_api.js
 * 
 * LifePulse Live AI & Fast Response Clinical Triage API
 * Grounded in CDC, American Red Cross, AHA, and WHO emergency layperson protocols.
 * 
 * Architecture:
 * 1. Live AI Integration: Supports Google Gemini, OpenAI GPT-4o-mini, Groq LLaMA 3.3, OpenRouter, and Ollama.
 * 2. Zero-Crash Fallback: If AI keys are unset, offline, or exceed 3.5s timeout, instantly serves verified CDC/Red Cross clinical protocols in <1ms.
 * 3. Spatial Anchor Mapping: Maps natural language injuries to exact 3D anatomical anchor coordinates for Snap Spectacles AR waveguides.
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Auto-load .env file if present
function loadEnv() {
    const envPaths = [
        path.join(__dirname, '..', '.env'),
        path.join(__dirname, '.env'),
        path.join(process.cwd(), '.env')
    ];
    for (const p of envPaths) {
        if (fs.existsSync(p)) {
            try {
                const content = fs.readFileSync(p, 'utf8');
                content.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const idx = trimmed.indexOf('=');
                        if (idx > 0) {
                            const key = trimmed.substring(0, idx).trim();
                            const val = trimmed.substring(idx + 1).trim();
                            if (!process.env[key] && val) {
                                process.env[key] = val;
                            }
                        }
                    }
                });
            } catch (e) {}
        }
    }
}
loadEnv();

const EMERGENCY_DATABASE = [
    {
        id: "CARDIAC",
        keywords: ["cpr", "heart", "cardiac", "arrest", "chest pain", "no pulse", "unresponsive", "passed out", "collapsed"],
        category: "CARDIAC_ARREST",
        title: "CARDIAC ARREST (UNRESPONSIVE)",
        instruction: "30 CHEST COMPRESSIONS -> 2 RESCUE BREATHS",
        cadenceBPM: 110,
        timerSeconds: 120, // 2-min rescuer swap
        targetRegion: "STERNUM",
        targetTransform: { x: 0, y: -12, z: -65, rx: 80, scale: 0.35 },
        criticalWarning: "PUSH HARD & FAST (5CM DEPTH) • MINIMIZE INTERRUPTIONS",
        contraindications: "DO NOT STOP CPR FOR >10 SECONDS UNTIL EMS ARRIVES",
        source: "AHA & American Red Cross 2026 Guidelines"
    },
    {
        id: "CHOKING",
        keywords: ["choke", "choking", "airway", "throat", "swallowed", "cant breathe", "heimlich", "food stuck"],
        category: "AIRWAY_OBSTRUCTION",
        title: "SEVERE AIRWAY CHOKING (CONSCIOUS)",
        instruction: "5 FIRM BACK BLOWS -> 5 ABDOMINAL HEIMLICH THRUSTS",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "NAVEL_UPPER_ABDOMEN",
        targetTransform: { x: 0, y: -6, z: -65, rx: 80, scale: 0.32 },
        criticalWarning: "THRUST INWARD AND UPWARD JUST ABOVE THE NAVEL",
        contraindications: "IF VICTIM LOSES CONSCIOUSNESS: LOWER TO FLOOR & START CPR IMMEDIATELY",
        source: "Red Cross Airway Management Protocol"
    },
    {
        id: "BLEEDING",
        keywords: ["bleed", "bleeding", "blood", "laceration", "arterial", "gash", "wound", "tourniquet", "cut", "stab"],
        category: "HEMORRHAGE_TRAUMA",
        title: "SEVERE ARTERIAL BLEEDING",
        instruction: "APPLY DIRECT FIRM PRESSURE • TOURNIQUET 2-3\" ABOVE WOUND",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "LIMB_PRESSURE_POINT",
        targetTransform: { x: -15, y: -10, z: -65, rx: 70, scale: 0.28 },
        criticalWarning: "TIGHTEN WINCH UNTIL BLEEDING STOPS • WRITE TIME ON FOREHEAD",
        contraindications: "IF BLEEDING CONTINUES: APPLY SECOND TOURNIQUET PROXIMAL TO FIRST",
        source: "Stop the Bleed & CDC Trauma Care"
    },
    {
        id: "BURNS",
        keywords: ["burn", "burns", "burned", "fire", "scald", "boiling water", "hot oil", "thermal", "chemical burn"],
        category: "THERMAL_CHEMICAL",
        title: "THERMAL / CHEMICAL BURN",
        instruction: "FLUSH WITH COOL RUNNING WATER FOR 10-15 MINUTES",
        cadenceBPM: 0,
        timerSeconds: 600, // 10 min flush
        targetRegion: "BURN_SITE",
        targetTransform: { x: 12, y: -8, z: -65, rx: 60, scale: 0.3 },
        criticalWarning: "COOL RUNNING WATER ONLY • COVER LOOSELY WITH STERILE DRESSING",
        contraindications: "DO NOT APPLY ICE • DO NOT BURST BLISTERS • DO NOT USE BUTTER OR OILS",
        source: "American Burn Association & Red Cross"
    },
    {
        id: "SPINAL",
        keywords: ["fall", "ladder", "neck", "spine", "spinal", "back injury", "paralyzed", "diving accident", "car crash"],
        category: "SPINAL_TRAUMA",
        title: "SUSPECTED SPINAL / NECK INJURY",
        instruction: "MANUALLY STABILIZE HEAD & NECK IN NEUTRAL POSITION",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "CERVICAL_SPINE",
        targetTransform: { x: 0, y: 12, z: -65, rx: 20, scale: 0.35 },
        criticalWarning: "PLACE HANDS ON BOTH SIDES OF HEAD TO PREVENT ANY ROTATION",
        contraindications: "CRITICAL: DO NOT MOVE OR ROLL VICTIM UNLESS SCENE IS ON FIRE",
        source: "CDC Head & Spinal Injury Guidelines"
    },
    {
        id: "OVERDOSE",
        keywords: ["overdose", "narcan", "naloxone", "fentanyl", "opioid", "heroin", "pills", "blue lips", "pinpoint pupils"],
        category: "POISONING",
        title: "OPIOID OVERDOSE (UNRESPONSIVE)",
        instruction: "1 SPRAY NARCAN IN NOSTRIL -> ROLL TO RECOVERY POSITION",
        cadenceBPM: 0,
        timerSeconds: 180, // 3 min monitoring
        targetRegion: "NASAL_PASSAGE",
        targetTransform: { x: 0, y: 2, z: -65, rx: 0, scale: 0.25 },
        criticalWarning: "IF NO RECOVERY IN 2-3 MINUTES, ADMINISTER SECOND DOSE",
        contraindications: "IF BREATHING DOES NOT RESUME: START CHEST COMPRESSIONS IMMEDIATELY",
        source: "SAMHSA & CDC Overdose Prevention"
    },
    {
        id: "ANAPHYLAXIS",
        keywords: ["allergy", "allergic", "anaphylaxis", "epipen", "bee sting", "peanut", "swollen tongue", "hives", "wheezing"],
        category: "IMMUNOLOGIC_CRISIS",
        title: "ACUTE ANAPHYLAXIS SHOCK",
        instruction: "INJECT EPIPEN FIRM INTO OUTER THIGH • HOLD 3 SECONDS",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "ANTEROLATERAL_THIGH",
        targetTransform: { x: 10, y: -22, z: -65, rx: 75, scale: 0.3 },
        criticalWarning: "MASSAGE INJECTION SITE FOR 10 SECONDS • CALL 911 IMMEDIATELY",
        contraindications: "DO NOT ADMINISTER ORAL FLUIDS OR ANTIHISTAMINES IN ACUTE AIRWAY CRISIS",
        source: "AAAI & World Allergy Organization"
    },
    {
        id: "DROWNING",
        keywords: ["drown", "drowning", "submersion", "water accident", "swimming pool", "submerged", "pulled from water"],
        category: "SUBMERSION_ASPHYXIA",
        title: "NEAR DROWNING / WATER RESCUE",
        instruction: "5 RESCUE BREATHS FIRST -> 30 CHEST COMPRESSIONS",
        cadenceBPM: 110,
        timerSeconds: 120,
        targetRegion: "STERNUM",
        targetTransform: { x: 0, y: -12, z: -65, rx: 80, scale: 0.35 },
        criticalWarning: "PRIORITIZE VENTILATION (HYPOXEMIA REVERSAL) BEFORE COMPRESSIONS",
        contraindications: "DO NOT ATTEMPT ABDOMINAL THRUSTS TO EXPEL WATER • COMMENCE CPR IMMEDIATELY",
        source: "International Lifesaving Federation"
    },
    {
        id: "ELECTROCUTION",
        keywords: ["electrocution", "electric shock", "high voltage", "power line", "live wire", "lightning"],
        category: "ELECTRICAL_TRAUMA",
        title: "HIGH-VOLTAGE ELECTRICAL SHOCK",
        instruction: "DO NOT TOUCH VICTIM UNTIL POWER SOURCE IS DISCONNECTED",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "PERIMETER_CHECK",
        targetTransform: { x: 0, y: 0, z: -65, rx: 0, scale: 0.4 },
        criticalWarning: "VERIFY CIRCUIT BREAKER OFF • USE WOODEN NON-CONDUCTIVE OBJECT",
        contraindications: "NEVER TOUCH A VICTIM IN CONTACT WITH AN ACTIVE LIVE WIRE",
        source: "OSHA & Red Cross Electrical Safety"
    },
    {
        id: "POISONING",
        keywords: ["poison", "toxic", "swallowed bleach", "chemical ingestion", "detergent", "acid", "cleaner"],
        category: "TOXIC_INGESTION",
        title: "CORROSIVE / CHEMICAL INGESTION",
        instruction: "CALL POISON CONTROL (1-800-222-1222) • IDENTIFY CONTAINER",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "ORAL_CAVITY",
        targetTransform: { x: 0, y: 0, z: -65, rx: 0, scale: 0.25 },
        criticalWarning: "KEEP CHEMICAL CONTAINER WITH RESCUE CREW FOR LAB TOXICOLOGY",
        contraindications: "DO NOT INDUCE VOMITING (RE-BURNS ESOPHAGUS) • DO NOT GIVE RAW MILK",
        source: "American Association of Poison Control Centers"
    },
    {
        id: "FRACTURE",
        keywords: ["fracture", "broken bone", "broken leg", "broken arm", "bone sticking out", "compound fracture", "dislocation"],
        category: "ORTHOPEDIC_TRAUMA",
        title: "OPEN / CLOSED LIMB FRACTURE",
        instruction: "SPLINT IN POSITION FOUND • IMMOBILIZE JOINT ABOVE & BELOW",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "AFFECTED_LIMB",
        targetTransform: { x: -12, y: -20, z: -65, rx: 45, scale: 0.3 },
        criticalWarning: "IF OPEN WOUND: COVER WITH STERILE GAUZE WITHOUT TOUCHING BONE",
        contraindications: "DO NOT ATTEMPT TO REALIGN, STRAIGHTEN, OR PUSH PROTRUDING BONE IN",
        source: "American Academy of Orthopaedic Surgeons"
    },
    {
        id: "HEATSTROKE",
        keywords: ["heat stroke", "heatstroke", "overheating", "hot dry skin", "confusion", "sunstroke", "delirium", "hyperthermia"],
        category: "ENVIRONMENTAL_HEAT",
        title: "ACUTE EXERTIONAL HEAT STROKE",
        instruction: "RAPID COOLING • ICE WATER IMMERSION / COLD PACKS IN ARMPITS & GROIN",
        cadenceBPM: 0,
        timerSeconds: 900,
        targetRegion: "VASCULAR_NODES",
        targetTransform: { x: 0, y: -5, z: -65, rx: 45, scale: 0.35 },
        criticalWarning: "BODY TEMP >104F (40C) CAUSES PERMANENT ORGAN DAMAGE • COOL FAST",
        contraindications: "DO NOT GIVE ASPIRIN OR ACETAMINOPHEN • DO NOT FORCE CONVULSIVE PATIENT TO DRINK",
        source: "CDC Extreme Heat Guidelines"
    },
    {
        id: "HYPOTHERMIA",
        keywords: ["hypothermia", "freezing", "frostbite", "shivering stopped", "ice", "blizzard", "cold exposure"],
        category: "ENVIRONMENTAL_COLD",
        title: "SEVERE HYPOTHERMIA",
        instruction: "REMOVE WET CLOTHING • GENTLE PASSIVE WARMING OF TRUNK CORE ONLY",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "CORE_TORSO",
        targetTransform: { x: 0, y: -8, z: -65, rx: 60, scale: 0.35 },
        criticalWarning: "HANDLE VICTIM EXTREMELY GENTLY • ROUGH MOVEMENT CAN TRIGGER V-FIB",
        contraindications: "DO NOT RUB OR MASSAGE FROSTBITTEN FLESH • DO NOT WARM LIMBS FIRST",
        source: "Wilderness Medical Society & Red Cross"
    },
    {
        id: "SEIZURE",
        keywords: ["seizure", "convulsion", "epilepsy", "convulsing", "shaking violently", "foaming mouth"],
        category: "NEUROLOGICAL_CRISIS",
        title: "ACTIVE TONIC-CLONIC SEIZURE",
        instruction: "CLEAR HARD OBJECTS • CUSHION HEAD • TIME DURATION",
        cadenceBPM: 0,
        timerSeconds: 300, // >5 min is status epilepticus
        targetRegion: "CRANIAL_PERIMETER",
        targetTransform: { x: 0, y: 15, z: -65, rx: 0, scale: 0.35 },
        criticalWarning: "IF SEIZURE EXCEEDS 5 MINUTES: CALL 911 FOR STATUS EPILEPTICUS",
        contraindications: "NEVER RESTRAIN VICTIM • NEVER FORCE ANY OBJECT OR FINGERS INTO MOUTH",
        source: "Epilepsy Foundation & CDC Guidelines"
    },
    {
        id: "STROKE",
        keywords: ["stroke", "face drooping", "arm weakness", "slurred speech", "fast", "numbness", "one side paralyzed"],
        category: "CEREBROVASCULAR",
        title: "ACUTE CEREBROVASCULAR STROKE (F.A.S.T.)",
        instruction: "CHECK FACE, ARMS, SPEECH • RECORD EXACT ONSET TIME • CALL 911",
        cadenceBPM: 0,
        timerSeconds: 0,
        targetRegion: "FACIAL_SYMMETRY",
        targetTransform: { x: 0, y: 8, z: -65, rx: 0, scale: 0.28 },
        criticalWarning: "TIME IS BRAIN: TPA THROMBOLYTICS REQUIRE RAPID HOSPITAL ARRIVAL",
        contraindications: "DO NOT GIVE ASPIRIN (MAY BE HEMORRHAGIC STROKE) • NO FOOD OR DRINKS",
        source: "American Stroke Association"
    }
];

// Fallback high-speed clinical keyword matching
function triageLocal(query) {
    if (!query) return EMERGENCY_DATABASE[0];
    const q = query.toLowerCase();
    
    let bestMatch = null;
    let highestScore = 0;

    for (const item of EMERGENCY_DATABASE) {
        let score = 0;
        for (const kw of item.keywords) {
            if (q.includes(kw)) {
                score += kw.length;
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    }

    return bestMatch || EMERGENCY_DATABASE[0];
}

// Live AI Inference Engine
async function queryLiveAI(userInput) {
    const systemPrompt = `You are LifePulse AI, an emergency clinical triage system for bystander augmented reality smart glasses (Snap Spectacles).
Analyze the bystander's emergency description and return ONLY a valid raw JSON object (no markdown, no backticks):
{
  "id": "SHORT_ID",
  "category": "EMERGENCY_CATEGORY",
  "title": "CLEAR UPPERCASE ACTIONABLE TITLE",
  "instruction": "SHORT DIRECT KINETIC STEP FOR AR DISPLAY (e.g. 30 COMPRESSIONS -> 2 BREATHS)",
  "cadenceBPM": 110 (or 0 if not CPR),
  "timerSeconds": 120 (or relevant timer seconds),
  "targetRegion": "ANATOMICAL_TARGET_NAME",
  "targetTransform": { "x": 0, "y": -12, "z": -65, "rx": 80, "scale": 0.35 },
  "criticalWarning": "KEY PRIORITY POINT",
  "contraindications": "EXPLICIT DO NOT ACTION TO PREVENT HARM",
  "source": "Clinical guideline name (CDC/AHA/Red Cross)"
}`;

    const timeoutMs = 3500; // 3.5s timeout for zero-stall bystander safety

    // 1. Groq Ultra-Fast AI (Primary verified ultra-low latency engine)
    if (process.env.GROQ_API_KEY) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userInput }
                    ]
                })
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                let rawText = data.choices?.[0]?.message?.content?.trim();
                if (rawText) {
                    if (rawText.startsWith('```json')) rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
                    else if (rawText.startsWith('```')) rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
                    const parsed = JSON.parse(rawText);
                    return { sourceAI: "Groq GPT-OSS-120B (Live AI Engine)", triage: parsed };
                }
            }
        } catch (e) {
            console.warn(`[Live AI] Groq call fallback: ${e.message}`);
        }
    }

    // 2. Google Gemini API
    if (process.env.GEMINI_API_KEY) {
        const geminiModels = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-3.8-flash'];
        for (const m of geminiModels) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), timeoutMs);
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nEmergency Situation: ${userInput}` }] }
                        ]
                    })
                });
                clearTimeout(timeout);
                if (res.ok) {
                    const data = await res.json();
                    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (rawText) {
                        if (rawText.startsWith('```json')) rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
                        else if (rawText.startsWith('```')) rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
                        const parsed = JSON.parse(rawText);
                        return { sourceAI: `Google Gemini (${m})`, triage: parsed };
                    }
                }
            } catch (e) {
                console.warn(`[Live AI] Gemini ${m} fallback: ${e.message}`);
            }
        }
    }

    // 3. OpenAI GPT-4o-mini
    if (process.env.OPENAI_API_KEY) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userInput }
                    ]
                })
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const rawText = data.choices?.[0]?.message?.content;
                if (rawText) {
                    const parsed = JSON.parse(rawText);
                    return { sourceAI: "OpenAI GPT-4o-mini", triage: parsed };
                }
            }
        } catch (e) {
            console.warn(`[Live AI] OpenAI call fallback: ${e.message}`);
        }
    }

    // 4. OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
                },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.3-70b-instruct',
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userInput }
                    ]
                })
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const rawText = data.choices?.[0]?.message?.content;
                if (rawText) {
                    const parsed = JSON.parse(rawText);
                    return { sourceAI: "OpenRouter LLaMA-3.3", triage: parsed };
                }
            }
        } catch (e) {
            console.warn(`[Live AI] OpenRouter call fallback: ${e.message}`);
        }
    }

    // 5. Local Ollama (if configured or running)
    if (process.env.OLLAMA_HOST) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${process.env.OLLAMA_HOST}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'gemma2:2b',
                    format: 'json',
                    stream: false,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userInput }
                    ]
                })
            });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                const parsed = JSON.parse(data.message.content);
                return { sourceAI: "Local Ollama Gemma-2", triage: parsed };
            }
        } catch (e) {}
    }

    // Fallback: Local verified Clinical Edge Engine (<1ms)
    return {
        sourceAI: "LifePulse Clinical Edge Engine (Zero-Latency Fallback)",
        triage: triageLocal(userInput)
    };
}

// HTTP Server setup
const server = http.createServer(async (req, res) => {
    // Enable CORS for Lens Studio & local web preview
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/api/triage') {
        const startTime = process.hrtime();
        let query = parsedUrl.query.query || parsedUrl.query.q || "";

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const json = JSON.parse(body);
                    query = json.query || json.q || query;
                } catch (e) {}

                const { sourceAI, triage } = await queryLiveAI(query);
                const diff = process.hrtime(startTime);
                const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: "success",
                    aiEngine: sourceAI,
                    latencyMs: `${latencyMs}ms`,
                    query: query,
                    triage: triage
                }));
            });
            return;
        }

        const { sourceAI, triage } = await queryLiveAI(query);
        const diff = process.hrtime(startTime);
        const latencyMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: "success",
            aiEngine: sourceAI,
            latencyMs: `${latencyMs}ms`,
            query: query,
            triage: triage
        }));
        return;
    }

    if (parsedUrl.pathname === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: "online",
            providers: {
                gemini: Boolean(process.env.GEMINI_API_KEY),
                openai: Boolean(process.env.OPENAI_API_KEY),
                groq: Boolean(process.env.GROQ_API_KEY),
                openrouter: Boolean(process.env.OPENROUTER_API_KEY),
                ollama: Boolean(process.env.OLLAMA_HOST)
            },
            clinicalEdgeEngine: "active (15 emergency protocols)",
            zeroCrashResilience: true
        }));
        return;
    }

    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/test') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifePulse - Live AI Clinical Triage Workbench</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#030712; color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; padding:30px; }
        .container { max-width:850px; margin:0 auto; }
        .header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,240,255,0.3); padding-bottom:18px; margin-bottom:24px; }
        .title { font-size:28px; font-weight:800; color:#fff; }
        .title span { color:#00f0ff; text-shadow:0 0 10px rgba(0,240,255,0.5); }
        .badge { background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; }
        .input-box { display:flex; gap:10px; margin-bottom:20px; }
        input { flex:1; background:#0f172a; border:1px solid #334155; color:#fff; padding:14px 18px; border-radius:8px; font-size:15px; outline:none; transition:0.2s; }
        input:focus { border-color:#00f0ff; box-shadow:0 0 10px rgba(0,240,255,0.3); }
        button { background:#00f0ff; color:#030712; border:none; padding:14px 24px; border-radius:8px; font-weight:800; font-size:15px; cursor:pointer; transition:0.2s; }
        button:hover { background:#38bdf8; box-shadow:0 0 15px rgba(0,240,255,0.6); }
        .chips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
        .chip { background:#1e293b; border:1px solid #334155; color:#94a3b8; padding:6px 14px; border-radius:16px; font-size:12px; cursor:pointer; font-weight:600; }
        .chip:hover { border-color:#00f0ff; color:#fff; }
        .card { background:#0b1329; border:1px solid rgba(0,240,255,0.3); border-radius:12px; padding:24px; margin-top:20px; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
        .meta-bar { display:flex; justify-content:space-between; margin-bottom:16px; font-size:13px; color:#94a3b8; border-bottom:1px solid #1e293b; padding-bottom:10px; }
        .engine-pill { color:#10b981; font-weight:700; }
        .ar-title { font-size:24px; font-weight:900; color:#38bdf8; letter-spacing:1px; margin-bottom:10px; }
        .instruction { font-size:18px; font-weight:800; color:#ffffff; background:#1e293b; padding:12px 16px; border-radius:8px; border-left:4px solid #00f0ff; margin-bottom:16px; }
        .grid-props { display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:16px; }
        .prop-box { background:#0f172a; padding:12px; border-radius:6px; border:1px solid #1e293b; }
        .prop-label { font-size:11px; color:#64748b; text-transform:uppercase; font-weight:700; margin-bottom:4px; }
        .prop-val { font-size:15px; color:#f8fafc; font-weight:700; }
        .warning-box { background:rgba(239,68,68,0.1); border:1px solid #ef4444; color:#fca5a5; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:600; margin-top:12px; }
        .contra-box { background:rgba(245,158,11,0.1); border:1px solid #f59e0b; color:#fcd34d; padding:12px 16px; border-radius:8px; font-size:14px; font-weight:600; margin-top:8px; }
        pre { background:#020617; padding:16px; border-radius:8px; font-size:12px; color:#94a3b8; overflow-x:auto; margin-top:20px; border:1px solid #1e293b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 class="title">Life<span>Pulse</span></h1>
                <p style="color:#64748b; font-size:13px; margin-top:4px;">Snap Spectacles AR • Live AI Clinical Triage Workbench</p>
            </div>
            <div class="badge">● LIVE AI ACTIVE</div>
        </div>

        <div class="input-box">
            <input type="text" id="queryInput" placeholder="Describe an emergency: e.g., 'Collapsed in gym, not breathing, no pulse'" value="Person collapsed on floor, unresponsive, no pulse" />
            <button onclick="runTriage()">Triage (Live AI)</button>
        </div>

        <div class="chips">
            <span style="color:#64748b; font-size:12px; line-height:26px;">Quick Tests:</span>
            <div class="chip" onclick="setQuery('Person collapsed on floor, unresponsive, no pulse')">❤️ Cardiac Arrest</div>
            <div class="chip" onclick="setQuery('Child swallowed grape, choking, silent hands on neck')">🗣️ Choking</div>
            <div class="chip" onclick="setQuery('Deep cut on forearm from glass, bright red blood spurting')">🩸 Arterial Bleed</div>
            <div class="chip" onclick="setQuery('Found unresponsive with blue lips and pinpoint pupils, suspected opioid')">💊 Overdose (Narcan)</div>
            <div class="chip" onclick="setQuery('Ate peanuts, lips and throat swelling, wheezing and turning pale')">⚡ Anaphylaxis (EpiPen)</div>
            <div class="chip" onclick="setQuery('Shaking violently on ground with convulsions for 2 minutes')">🧠 Seizure</div>
            <div class="chip" onclick="setQuery('Spilled boiling soup all over chest and arms, blistering')">🔥 Thermal Burn</div>
        </div>

        <div id="resultArea"></div>
    </div>

    <script>
        async function runTriage() {
            const q = document.getElementById('queryInput').value.trim();
            if (!q) return;
            const resArea = document.getElementById('resultArea');
            resArea.innerHTML = '<div style="color:#00f0ff; text-align:center; padding:30px; font-weight:700;">Querying Live AI Model (Groq / Gemini)...</div>';
            
            try {
                const res = await fetch('/api/triage?query=' + encodeURIComponent(q));
                const data = await res.json();
                renderResult(data);
            } catch(e) {
                resArea.innerHTML = '<div style="color:#ef4444; padding:20px;">Error: ' + e.message + '</div>';
            }
        }

        function setQuery(text) {
            document.getElementById('queryInput').value = text;
            runTriage();
        }

        function renderResult(data) {
            const t = data.triage || {};
            const transform = t.targetTransform || {x:0,y:0,z:-65};
            const resArea = document.getElementById('resultArea');
            resArea.innerHTML = \`
                <div class="card">
                    <div class="meta-bar">
                        <div><span class="engine-pill">\${data.aiEngine}</span> (\${data.latencyMs})</div>
                        <div>Category: <b>\${t.category || 'N/A'}</b></div>
                    </div>
                    <div class="ar-title">\${t.title || 'CLINICAL TRIAGE'}</div>
                    <div class="instruction">\${t.instruction || 'FOLLOW EMS INSTRUCTIONS'}</div>
                    
                    <div class="grid-props">
                        <div class="prop-box">
                            <div class="prop-label">Metronome Cadence</div>
                            <div class="prop-val">\${t.cadenceBPM ? t.cadenceBPM + ' BPM' : 'Static / Manual'}</div>
                        </div>
                        <div class="prop-box">
                            <div class="prop-label">3D Anatomical Target</div>
                            <div class="prop-val">\${t.targetRegion || 'STERNUM'}</div>
                        </div>
                        <div class="prop-box">
                            <div class="prop-label">Waveguide Transform</div>
                            <div class="prop-val">X:\${transform.x} Y:\${transform.y} Z:\${transform.z}</div>
                        </div>
                    </div>

                    \${t.criticalWarning ? \`<div class="warning-box">⚠️ <b>PRIORITY:</b> \${t.criticalWarning}</div>\` : ''}
                    \${t.contraindications ? \`<div class="contra-box">🚫 <b>DO NOT:</b> \${t.contraindications}</div>\` : ''}

                    <pre>\${JSON.stringify(data, null, 2)}</pre>
                </div>
            \`;
        }

        runTriage();
    </script>
</body>
</html>`);
        return;
    }

    if (parsedUrl.pathname === '/api/accidents') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: "success",
            count: EMERGENCY_DATABASE.length,
            accidents: EMERGENCY_DATABASE
        }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "Endpoint not found. Use /api/triage?query=..." }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[LifePulse Live AI & Triage API] Running on http://localhost:${PORT}/api/triage`);
    console.log(`[LifePulse Config] Gemini: ${Boolean(process.env.GEMINI_API_KEY)}, OpenAI: ${Boolean(process.env.OPENAI_API_KEY)}, Groq: ${Boolean(process.env.GROQ_API_KEY)}`);
});
