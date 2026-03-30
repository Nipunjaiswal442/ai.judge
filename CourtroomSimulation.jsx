import React, { useMemo, useReducer, useRef, useState } from "react";

const DISCLAIMER =
  "⚠️ AI SIMULATION — NOT LEGAL ADVICE. Educational use only. Use fictional scenarios and consult a qualified advocate for real matters.";
const PRIVACY_NOTICE =
  "🔒 Privacy: Session data stays in memory only and is sent only to your selected provider.";

const PHASES = [
  "CASE_FILED",
  "CHARGES_FRAMED",
  "PROSECUTION_OPENING",
  "PROSECUTION_EVIDENCE",
  "PROSECUTION_WITNESS_EXAM",
  "DEFENCE_CROSS_EXAM_OF_PW",
  "DEFENCE_OPENING",
  "DEFENCE_EVIDENCE",
  "DEFENCE_WITNESS_EXAM",
  "PROSECUTION_CROSS_EXAM_OF_DW",
  "COMPLAINANT_EXAM",
  "DEFENDANT_EXAM",
  "PROSECUTION_CLOSING",
  "DEFENCE_CLOSING",
  "JUDGE_QUESTIONS",
  "JUDGE_DELIBERATION",
  "VERDICT_DELIVERED",
  "SENTENCING",
];

const AGENTS = {
  prosecution: { label: "Prosecution", accent: "text-red-400", emoji: "⚔️" },
  defence: { label: "Defence", accent: "text-sky-400", emoji: "🛡️" },
  judge: { label: "Judge", accent: "text-amber-300", emoji: "⚖️" },
};

const MAX_WITNESSES = 10;
const MAX_QA_ROUNDS = 20;

const LLM_CONFIG = {
  providers: {
    anthropic: {
      endpoint: "https://api.anthropic.com/v1/messages",
      model: "claude-sonnet-4-20250514",
      maxTokens: 4096,
    },
    gemini: {
      endpoint:
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      model: "gemini-2.0-flash",
      maxTokens: 4096,
    },
  },
};

const SYSTEM_PROMPTS = {
  prosecution: `You are the Public Prosecutor in an Indian courtroom simulation. Maintain decorum and cite BNS/BNSS/BSA + Constitution. Never fabricate facts.`,
  defence: `You are Defence Counsel in an Indian courtroom simulation. Protect Articles 20,21,22 and challenge admissibility/reliability. Never fabricate facts.`,
  judge: `You are Presiding Judge in an Indian courtroom simulation. Be neutral, rule on objections with legal basis, and issue structured judgment.`,
};

const initialState = {
  phaseIndex: 0,
  transcript: [],
  logs: [],
  inputs: {
    fir: {
      caseType: "Criminal",
      firNumber: "",
      court: "Sessions Court",
      complainantName: "",
      accusedName: "",
      incidentDate: "",
      incidentLocation: "",
      description: "",
      sectionsInvoked: "",
      evidenceSummary: "",
      ioNotes: "",
      arrestDetails: "",
    },
    witnesses: [],
    complainantQA: [],
    defendantQA: [],
  },
  moderationWarnings: [],
  agentProviders: {
    prosecution: "anthropic",
    defence: "anthropic",
    judge: "anthropic",
  },
  providerKeys: {
    anthropic: "",
    gemini: "",
  },
  failedCalls: 0,
  circuitOpen: false,
};

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripPromptInjection(text = "") {
  return text.replace(
    /(ignore\s+previous\s+instructions|you\s+are\s+now|system\s*prompt|base64|developer\s*message)/gi,
    "[redacted]",
  );
}

function sanitizeUserInput(text = "") {
  return escapeHtml(stripPromptInjection(String(text)));
}

function moderateInput(text = "") {
  const t = text.toLowerCase();
  if (/(hate\s*speech|kill them all|ethnic cleansing)/i.test(t)) {
    return { blocked: true, warning: "Rejected for disallowed hateful content." };
  }
  if (/(suicide|self-harm|minor)/i.test(t)) {
    return { blocked: false, warning: "Flag: sensitive content detected." };
  }
  return { blocked: false, warning: "" };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIR_FIELD":
      return {
        ...state,
        inputs: {
          ...state.inputs,
          fir: { ...state.inputs.fir, [action.field]: action.value },
        },
      };
    case "ADD_WITNESS":
      return {
        ...state,
        inputs: { ...state.inputs, witnesses: [...state.inputs.witnesses, action.witness] },
      };
    case "ADD_QA":
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.target]: [...state.inputs[action.target], action.qa],
        },
      };
    case "SET_PROVIDER":
      return {
        ...state,
        agentProviders: { ...state.agentProviders, [action.agent]: action.provider },
      };
    case "SET_KEY":
      return {
        ...state,
        providerKeys: { ...state.providerKeys, [action.provider]: action.key },
      };
    case "ADD_TRANSCRIPT":
      return { ...state, transcript: [...state.transcript, action.entry] };
    case "NEXT_PHASE": {
      const phaseIndex = Math.min(state.phaseIndex + 1, PHASES.length - 1);
      const phase = PHASES[phaseIndex];
      return {
        ...state,
        phaseIndex,
        logs: [...state.logs, { ts: new Date().toISOString(), event: `Phase -> ${phase}` }],
      };
    }
    case "SET_PHASE":
      return { ...state, phaseIndex: action.index };
    case "ADD_WARNING":
      return { ...state, moderationWarnings: [...state.moderationWarnings, action.message] };
    case "CALL_FAILED": {
      const failedCalls = state.failedCalls + 1;
      return { ...state, failedCalls, circuitOpen: failedCalls > 5 };
    }
    case "CALL_OK":
      return { ...state, failedCalls: 0, circuitOpen: false };
    default:
      return state;
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callProvider({ provider, apiKey, role, phase, transcript, caseData }) {
  const providerCfg = LLM_CONFIG.providers[provider];
  if (!apiKey) throw new Error(`${provider} key missing`);

  const prompt = `${SYSTEM_PROMPTS[role]}\nCurrent phase: ${phase}\nCase: ${JSON.stringify(caseData)}\nTranscript: ${JSON.stringify(transcript.slice(-8))}`;

  if (provider === "anthropic") {
    const res = await fetch(providerCfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: providerCfg.model,
        max_tokens: providerCfg.maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const content = data?.content?.[0]?.text || "No response.";
    return { role, content, citations: extractCitations(content), phase };
  }

  const url = `${providerCfg.endpoint}?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: providerCfg.maxTokens },
    }),
  });
  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  return { role, content, citations: extractCitations(content), phase };
}

function extractCitations(text) {
  return [...new Set((text.match(/\[(Section|Article)[^\]]+\]/g) || []).slice(0, 8))];
}

class PanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <div className="text-red-300">Panel unavailable.</div>;
    return this.props.children;
  }
}

export default function CourtroomSimulation() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [witnessDraft, setWitnessDraft] = useState({
    name: "",
    type: "Prosecution Witness",
    relationship: "Eyewitness",
    statement: "",
    crossAvailable: "Yes",
  });
  const [busy, setBusy] = useState({ prosecution: false, defence: false, judge: false });
  const transcriptRef = useRef(null);

  const currentPhase = PHASES[state.phaseIndex];

  const strategySummary = useMemo(() => {
    const last = [...state.transcript].reverse();
    return {
      prosecution: last.find((x) => x.role === "prosecution")?.content?.slice(0, 100) || "Awaiting filing.",
      defence: last.find((x) => x.role === "defence")?.content?.slice(0, 100) || "Awaiting filing.",
      judge: last.find((x) => x.role === "judge")?.content?.slice(0, 100) || "Court not in session.",
    };
  }, [state.transcript]);

  const citedSections = useMemo(() => {
    const map = { prosecution: new Set(), defence: new Set(), judge: new Set() };
    state.transcript.forEach((t) => t.citations?.forEach((c) => map[t.role]?.add(c)));
    return {
      prosecution: [...map.prosecution],
      defence: [...map.defence],
      judge: [...map.judge],
    };
  }, [state.transcript]);

  async function invokeAgent(role) {
    if (state.circuitOpen) {
      dispatch({ type: "ADD_WARNING", message: "Circuit breaker open after repeated failures." });
      return;
    }
    setBusy((b) => ({ ...b, [role]: true }));
    const primary = state.agentProviders[role];
    const fallback = primary === "anthropic" ? "gemini" : "anthropic";

    try {
      const response = await retryWithBackoff(async () =>
        callProvider({
          provider: primary,
          apiKey: state.providerKeys[primary],
          role,
          phase: currentPhase,
          transcript: state.transcript,
          caseData: state.inputs,
        }),
      );
      dispatch({ type: "CALL_OK" });
      dispatch({ type: "ADD_TRANSCRIPT", entry: { ...response, ts: new Date().toISOString() } });
    } catch (err) {
      try {
        const response = await retryWithBackoff(async () =>
          callProvider({
            provider: fallback,
            apiKey: state.providerKeys[fallback],
            role,
            phase: currentPhase,
            transcript: state.transcript,
            caseData: state.inputs,
          }),
        );
        dispatch({ type: "ADD_WARNING", message: `${role} retried with ${fallback}.` });
        dispatch({ type: "CALL_OK" });
        dispatch({ type: "ADD_TRANSCRIPT", entry: { ...response, ts: new Date().toISOString() } });
      } catch (e2) {
        dispatch({ type: "CALL_FAILED" });
        dispatch({ type: "ADD_WARNING", message: `${role} failed: ${err.message}` });
      }
    } finally {
      setBusy((b) => ({ ...b, [role]: false }));
      setTimeout(() => transcriptRef.current?.scrollTo({ top: 999999, behavior: "smooth" }), 20);
    }
  }

  async function retryWithBackoff(fn, attempts = 3) {
    let i = 0;
    let lastErr;
    while (i < attempts) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        await sleep(250 * 2 ** i);
        i += 1;
      }
    }
    throw lastErr;
  }

  function onAddWitness() {
    if (state.inputs.witnesses.length >= MAX_WITNESSES) {
      dispatch({ type: "ADD_WARNING", message: "Witness limit reached (10)." });
      return;
    }
    const packed = Object.fromEntries(Object.entries(witnessDraft).map(([k, v]) => [k, sanitizeUserInput(v)]));
    const mod = moderateInput(packed.statement);
    if (mod.blocked) return dispatch({ type: "ADD_WARNING", message: mod.warning });
    if (mod.warning) dispatch({ type: "ADD_WARNING", message: mod.warning });
    dispatch({ type: "ADD_WITNESS", witness: packed });
    setWitnessDraft({ name: "", type: "Prosecution Witness", relationship: "Eyewitness", statement: "", crossAvailable: "Yes" });
  }

  function onAddQA(target) {
    if (state.inputs[target].length >= MAX_QA_ROUNDS) {
      dispatch({ type: "ADD_WARNING", message: `Q&A limit reached (${MAX_QA_ROUNDS}).` });
      return;
    }
    const q = sanitizeUserInput(question);
    const a = sanitizeUserInput(answer);
    const mod = moderateInput(`${q} ${a}`);
    if (mod.blocked) return dispatch({ type: "ADD_WARNING", message: mod.warning });
    if (mod.warning) dispatch({ type: "ADD_WARNING", message: mod.warning });
    dispatch({ type: "ADD_QA", target, qa: { q, a } });
    setQuestion("");
    setAnswer("");
  }

  function onSubmitFir() {
    const fields = Object.entries(state.inputs.fir).reduce((acc, [k, v]) => ({ ...acc, [k]: sanitizeUserInput(v) }), {});
    const mod = moderateInput(JSON.stringify(fields));
    if (mod.blocked) return dispatch({ type: "ADD_WARNING", message: mod.warning });
    if (mod.warning) dispatch({ type: "ADD_WARNING", message: mod.warning });
    Object.entries(fields).forEach(([field, value]) => dispatch({ type: "SET_FIR_FIELD", field, value }));
    dispatch({
      type: "ADD_TRANSCRIPT",
      entry: { role: "judge", content: "Case filing accepted for simulation. Charges to be framed.", citations: ["[Article 21, Constitution of India]"], phase: currentPhase, ts: new Date().toISOString() },
    });
    dispatch({ type: "NEXT_PHASE" });
  }

  function downloadTranscript() {
    const text = [
      "AI Judicial Simulation Transcript",
      `Generated: ${new Date().toISOString()}`,
      ...state.logs.map((l) => `[LOG ${l.ts}] ${l.event}`),
      ...state.transcript.map((t) => `[${t.ts}] (${t.phase}) ${t.role.toUpperCase()}: ${t.content}\nCitations: ${(t.citations || []).join(", ")}`),
    ].join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trial-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-[#f5f0e1] p-4">
      <header className="rounded-xl border border-amber-600/30 bg-black/30 p-4 mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-wide">🏛️ AI Judicial Simulation System</h1>
          <p className="text-xs opacity-90">{DISCLAIMER}</p>
          <p className="text-xs opacity-80">{PRIVACY_NOTICE}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700" onClick={() => setSettingsOpen(true)}>⚙️ Settings</button>
          <button className="px-3 py-2 rounded bg-amber-700 hover:bg-amber-600" onClick={downloadTranscript}>📄 Download Transcript</button>
        </div>
      </header>

      <div className="mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {PHASES.map((p, idx) => (
            <button
              key={p}
              onClick={() => idx <= state.phaseIndex && dispatch({ type: "SET_PHASE", index: idx })}
              className={`px-2 py-1 text-xs rounded border ${idx === state.phaseIndex ? "bg-amber-500/30 border-amber-300" : "bg-black/20 border-zinc-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {["prosecution", "judge", "defence"].map((role, index) => (
          <PanelErrorBoundary key={role}>
            <aside className={`${index === 1 ? "lg:col-span-2" : "lg:col-span-1"} rounded-xl border border-white/10 bg-black/30 p-3`}>
              {index === 1 ? (
                <>
                  <h2 className="text-lg font-semibold mb-2">Courtroom Theater — {currentPhase}</h2>
                  <div ref={transcriptRef} className="h-96 overflow-y-auto space-y-2 pr-1">
                    {state.transcript.map((t, i) => (
                      <div key={`${t.ts}-${i}`} className="rounded p-2 bg-white/5 border border-white/10">
                        <div className={`text-sm font-semibold ${AGENTS[t.role]?.accent}`}>{AGENTS[t.role]?.emoji} {AGENTS[t.role]?.label}</div>
                        <div className="text-sm whitespace-pre-wrap">{t.content}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(t.citations || []).map((c) => <span key={c} className="text-xs px-2 py-0.5 rounded bg-amber-900/50">{c}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className={`font-semibold ${AGENTS[role].accent}`}>{AGENTS[role].emoji} {AGENTS[role].label}</h3>
                  <p className="text-xs mt-2">Strategy: {strategySummary[role]}</p>
                  <div className="mt-2 h-2 bg-zinc-700 rounded overflow-hidden" aria-label={`${role} confidence`}>
                    <div className={`h-full ${role === "prosecution" ? "bg-red-500" : "bg-sky-500"}`} style={{ width: `${Math.min(90, citedSections[role].length * 12 + 10)}%` }} />
                  </div>
                  <div className="mt-2 text-xs">Citations: {citedSections[role].slice(0, 6).join(", ") || "None"}</div>
                  <button onClick={() => invokeAgent(role)} className="mt-3 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sm" disabled={busy[role]}>
                    {busy[role] ? "Thinking…" : `Call ${AGENTS[role].label}`}
                  </button>
                </>
              )}
            </aside>
          </PanelErrorBoundary>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
        <h2 className="font-semibold mb-2">Input Zone</h2>
        {currentPhase === "CASE_FILED" && (
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {Object.keys(state.inputs.fir).map((k) => (
              <label key={k} className="flex flex-col gap-1">
                <span className="text-xs opacity-80">{k}</span>
                <input className="bg-zinc-900 rounded px-2 py-1" value={state.inputs.fir[k]} onChange={(e) => dispatch({ type: "SET_FIR_FIELD", field: k, value: e.target.value })} maxLength={k === "description" ? 500 : 300} />
              </label>
            ))}
            <button onClick={onSubmitFir} className="col-span-full px-3 py-2 rounded bg-amber-700 hover:bg-amber-600">Submit FIR</button>
          </div>
        )}

        {currentPhase === "PROSECUTION_WITNESS_EXAM" && (
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {Object.keys(witnessDraft).map((k) => (
              <label key={k} className="flex flex-col gap-1">
                <span className="text-xs opacity-80">{k}</span>
                <input className="bg-zinc-900 rounded px-2 py-1" value={witnessDraft[k]} onChange={(e) => setWitnessDraft((w) => ({ ...w, [k]: e.target.value }))} />
              </label>
            ))}
            <button onClick={onAddWitness} className="col-span-full px-3 py-2 rounded bg-red-800 hover:bg-red-700">Add Witness ({state.inputs.witnesses.length}/{MAX_WITNESSES})</button>
          </div>
        )}

        {(currentPhase === "COMPLAINANT_EXAM" || currentPhase === "DEFENDANT_EXAM") && (
          <div className="space-y-2 text-sm">
            {currentPhase === "DEFENDANT_EXAM" && (
              <div className="rounded border border-amber-400/50 bg-amber-900/20 p-2 text-xs">
                Article 20(3): You have the right to remain silent. No adverse inference shall be drawn from silence.
              </div>
            )}
            <input value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-zinc-900 rounded px-2 py-1" placeholder="Question" />
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full bg-zinc-900 rounded px-2 py-1" placeholder="Answer" />
            <button onClick={() => onAddQA(currentPhase === "COMPLAINANT_EXAM" ? "complainantQA" : "defendantQA")} className="px-3 py-2 rounded bg-sky-800 hover:bg-sky-700">
              Add Q&A
            </button>
          </div>
        )}

        {!["CASE_FILED", "PROSECUTION_WITNESS_EXAM", "COMPLAINANT_EXAM", "DEFENDANT_EXAM"].includes(currentPhase) && (
          <p className="text-sm opacity-80">This phase is read-only. Use agent controls to proceed and record arguments.</p>
        )}
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1.5 rounded bg-zinc-800" onClick={() => dispatch({ type: "NEXT_PHASE" })}>Next Phase</button>
        </div>
      </section>

      {state.moderationWarnings.length > 0 && (
        <section className="mt-4 rounded border border-amber-400/40 bg-amber-800/20 p-2 text-xs space-y-1">
          {state.moderationWarnings.slice(-4).map((w, i) => (
            <div key={`${w}-${i}`}>• {w}</div>
          ))}
        </section>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 bg-black/70 grid place-items-center p-4">
          <div className="w-full max-w-2xl rounded-xl border border-white/20 bg-[#1f1f2f] p-4">
            <h3 className="text-lg font-semibold mb-3">Provider Settings</h3>
            {["prosecution", "defence", "judge"].map((agent) => (
              <div key={agent} className="grid grid-cols-3 items-center gap-2 mb-2">
                <label className="capitalize text-sm">{agent}</label>
                <select value={state.agentProviders[agent]} onChange={(e) => dispatch({ type: "SET_PROVIDER", agent, provider: e.target.value })} className="bg-zinc-900 rounded px-2 py-1 text-sm">
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Gemini</option>
                </select>
                <span className="text-xs opacity-70">{LLM_CONFIG.providers[state.agentProviders[agent]].model}</span>
              </div>
            ))}
            {["anthropic", "gemini"].map((p) => (
              <label key={p} className="flex flex-col gap-1 mt-2 text-sm">
                <span>{p} API key (session memory only)</span>
                <input type="password" value={state.providerKeys[p]} onChange={(e) => dispatch({ type: "SET_KEY", provider: p, key: e.target.value })} className="bg-zinc-900 rounded px-2 py-1" />
              </label>
            ))}
            <div className="mt-4 flex justify-end">
              <button className="px-3 py-1.5 rounded bg-amber-700" onClick={() => setSettingsOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
