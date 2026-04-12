import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { predictUrl, formatAxiosError } from "./api.js";
import { buildUrlExplainability, segmentClassName } from "./urlExplainability.js";

const EXAMPLES = [
  "https://example.com/login",
  "http://192.168.1.10/secure/update",
  "https://paypal.com.verify-account.security-alert.xyz/login",
  "https://xn--pple-43d.com/security",
];

function prng(i, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function CyberParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        left: `${prng(i, 1) * 100}%`,
        top: `${prng(i, 2) * 100}%`,
        size: 1 + prng(i, 3) * 2.5,
        duration: 14 + prng(i, 4) * 32,
        delay: prng(i, 5) * 10,
        drift: (prng(i, 6) - 0.5) * 50,
        violet: prng(i, 7) > 0.78,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={
            p.violet
              ? "absolute rounded-full bg-violet-400/35 shadow-[0_0_10px_rgba(167,139,250,0.65)]"
              : "absolute rounded-full bg-cyan-400/45 shadow-[0_0_8px_rgba(34,211,238,0.75)]"
          }
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0.12, 0.5, 0.12],
            y: [0, -24, 0],
            x: [0, p.drift * 0.25, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function TypingText({ text, className, speed = 20, startDelay = 120, showCursor = true }) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    if (!text) return undefined;

    let cancelled = false;
    let i = 0;
    let timeoutId;

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setDisplay(text.slice(0, i));
      if (i < text.length) {
        timeoutId = window.setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };

    const startId = window.setTimeout(tick, startDelay);
    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      window.clearTimeout(timeoutId);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {display}
      {showCursor && !done && text ? (
        <span className="ml-0.5 inline-block animate-pulse font-light text-cyan-400" aria-hidden>
          ▍
        </span>
      ) : null}
    </span>
  );
}

function verdictEmoji(prediction) {
  const p = (prediction || "").toLowerCase();
  if (p === "phishing") return "❌";
  if (p === "suspicious") return "⚠️";
  return "🔒";
}

function reasonEmoji(reason) {
  const r = (reason || "").toLowerCase();
  if (r.includes("empty") || r.includes("invalid")) return "❌";
  if (r.includes("no ") && (r.includes("detected") || r.includes("symbol")))
    return r.includes("@") ? "⚠️" : "🔒";
  if (r.includes("'@'") || r.includes("ip address") || r.includes("attackers")) return "❌";
  if (r.includes("risk") || r.includes("many") || r.includes("long") || r.includes("elevated")) return "⚠️";
  if (r.includes("aggregate") || r.includes("score")) return "⚠️";
  return "🔒";
}

function predictionTheme(prediction) {
  const p = (prediction || "").toLowerCase();
  if (p === "phishing") {
    return {
      label: "PHISHING",
      subtitle: "Threat level: critical",
      barFrom: "from-red-600",
      barVia: "via-red-500",
      barTo: "to-orange-500",
      text: "text-red-400",
      textGlow: "drop-shadow-[0_0_14px_rgba(248,113,113,0.65)]",
      border: "border-red-500/50",
      glow: "shadow-[0_0_60px_rgba(239,68,68,0.25),inset_0_0_40px_rgba(239,68,68,0.06)]",
      ring: "ring-red-500/35",
      panel: "bg-red-950/30",
      meterGlow: "shadow-[0_0_24px_rgba(239,68,68,0.45)]",
      neonRgb: "239,68,68",
    };
  }
  if (p === "suspicious") {
    return {
      label: "SUSPICIOUS",
      subtitle: "Threat level: elevated",
      barFrom: "from-amber-600",
      barVia: "via-yellow-500",
      barTo: "to-amber-400",
      text: "text-amber-300",
      textGlow: "drop-shadow-[0_0_14px_rgba(251,191,36,0.55)]",
      border: "border-amber-500/50",
      glow: "shadow-[0_0_50px_rgba(245,158,11,0.2),inset_0_0_36px_rgba(245,158,11,0.05)]",
      ring: "ring-amber-500/30",
      panel: "bg-amber-950/25",
      meterGlow: "shadow-[0_0_22px_rgba(245,158,11,0.4)]",
      neonRgb: "245,158,11",
    };
  }
  return {
    label: "SAFE",
    subtitle: "No critical flags",
    barFrom: "from-emerald-600",
    barVia: "via-emerald-500",
    barTo: "to-teal-400",
    text: "text-emerald-400",
    textGlow: "drop-shadow-[0_0_14px_rgba(52,211,153,0.55)]",
    border: "border-emerald-500/45",
    glow: "shadow-[0_0_50px_rgba(16,185,129,0.18),inset_0_0_36px_rgba(16,185,129,0.05)]",
    ring: "ring-emerald-500/30",
    panel: "bg-emerald-950/25",
    meterGlow: "shadow-[0_0_22px_rgba(52,211,153,0.4)]",
    neonRgb: "52,211,153",
  };
}

function riskFillPercent(prediction, score) {
  if (typeof score === "number" && !Number.isNaN(score)) {
    return Math.min(100, Math.max(0, score));
  }
  const p = (prediction || "").toLowerCase();
  if (p === "phishing") return 88;
  if (p === "suspicious") return 52;
  return 18;
}

function CyberSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status" aria-live="polite">
      <div className="relative h-14 w-14">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-500/25 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-violet-500/90 shadow-[0_0_16px_rgba(167,139,250,0.4)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full bg-cyan-400/15 blur-md"
          animate={{ opacity: [0.4, 0.95, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="font-mono text-xs tracking-[0.25em] text-cyan-300 [text-shadow:0_0_12px_rgba(34,211,238,0.5)]">
        <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.2, repeat: Infinity }}>
          ANALYZING_TARGET
        </motion.span>
      </div>
      <span className="sr-only">Scanning URL</span>
    </div>
  );
}

function RiskProgressBar({ prediction, score }) {
  const pct = riskFillPercent(prediction, score);
  const theme = predictionTheme(prediction);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">Threat index</p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular-nums text-slate-200 [text-shadow:0_0_12px_rgba(255,255,255,0.15)]">
            {pct}
            <span className="text-sm text-slate-500">/100</span>
          </p>
        </div>
        <span
          className="rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-slate-400"
          style={{
            borderColor: `rgba(${theme.neonRgb},0.35)`,
            boxShadow: `0 0 12px rgba(${theme.neonRgb},0.15)`,
          }}
        >
          Live assessment
        </span>
      </div>

      <div
        className="relative h-5 overflow-hidden rounded-md border bg-black/60"
        style={{
          borderColor: `rgba(${theme.neonRgb},0.25)`,
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.5), 0 0 24px rgba(${theme.neonRgb},0.12)`,
        }}
      >
        <div className="absolute inset-0 flex opacity-90">
          <div className="h-full w-1/3 border-r border-white/5 bg-emerald-500/12" />
          <div className="h-full w-1/3 border-r border-white/5 bg-amber-500/12" />
          <div className="h-full w-1/3 bg-red-500/12" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <div className="absolute left-[33.33%] top-0 h-full w-px bg-white/12" />
          <div className="absolute left-[66.66%] top-0 h-full w-px bg-white/12" />
        </div>

        <motion.div
          className="relative z-[1] h-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.85 }}
        >
          <div
            className={`h-full w-full bg-gradient-to-r ${theme.barFrom} ${theme.barVia} ${theme.barTo} ${theme.meterGlow}`}
          />
          <div className="risk-bar-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-50" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute top-0 z-[2] h-full w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          initial={{ left: 0 }}
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 95, damping: 20 }}
          style={{ marginLeft: -1 }}
        />
      </div>

      <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider">
        <span className="text-emerald-400/95 [text-shadow:0_0_8px_rgba(52,211,153,0.4)]">🔒 Safe</span>
        <span className="text-amber-400/95 [text-shadow:0_0_8px_rgba(251,191,36,0.35)]">⚠️ Suspicious</span>
        <span className="text-red-400/95 [text-shadow:0_0_8px_rgba(248,113,113,0.4)]">❌ Phishing</span>
      </div>
    </div>
  );
}

function ExplainableUrlBlock({ url, prediction, score }) {
  const { whyTitle, whySummary, segments } = useMemo(
    () => buildUrlExplainability(url, prediction, score),
    [url, prediction, score]
  );

  if (!url?.trim()) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="space-y-3 rounded-lg border border-cyan-500/20 bg-black/35 p-4 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base" aria-hidden>
          {(prediction || "").toLowerCase() === "phishing" ? "❌" : (prediction || "").toLowerCase() === "suspicious" ? "⚠️" : "🔒"}
        </span>
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/95 [text-shadow:0_0_12px_rgba(34,211,238,0.35)]">
          {whyTitle}
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">{whySummary}</p>
      <div
        className="group/url rounded-md border border-white/10 bg-black/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed break-all [word-break:break-all]"
        role="region"
        aria-label="URL with explainability highlights"
      >
        {segments.map((s, i) => (
          <span
            key={i}
            title={s.tooltip ?? undefined}
            tabIndex={s.tooltip ? 0 : undefined}
            className={segmentClassName(s.level)}
          >
            {s.text}
          </span>
        ))}
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-500">
        <span>
          <span className="text-red-400" aria-hidden>
            ❌
          </span>{" "}
          Critical pattern
        </span>
        <span>
          <span className="text-amber-400" aria-hidden>
            ⚠️
          </span>{" "}
          Elevated risk
        </span>
        <span>
          <span className="text-slate-500" aria-hidden>
            🔒
          </span>{" "}
          Hover / focus for tooltips
        </span>
      </p>
    </motion.div>
  );
}

function RippleScanButton({ disabled, loading, type = "submit" }) {
  const [ripples, setRipples] = useState([]);

  const addRipple = useCallback(
    (e) => {
      if (disabled) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = `${Date.now()}-${Math.random()}`;
      setRipples((prev) => [...prev, { id, x, y }]);
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    },
    [disabled]
  );

  const showPulse = !disabled && !loading;

  return (
    <div className={`relative inline-block rounded-lg ${showPulse ? "scan-btn-pulse-glow" : ""}`}>
      {showPulse && (
        <motion.span
          className="pointer-events-none absolute -inset-[3px] rounded-xl opacity-60"
          style={{
            background: "linear-gradient(90deg, rgba(34,211,238,0.35), rgba(139,92,246,0.35), rgba(34,211,238,0.35))",
            filter: "blur(8px)",
          }}
          animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
      <motion.button
        type={type}
        disabled={disabled}
        onPointerDown={addRipple}
        whileHover={disabled ? {} : { scale: 1.02 }}
        whileTap={disabled ? {} : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 isolate overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-[length:200%_100%] px-8 py-3.5 font-mono text-sm font-bold uppercase tracking-wider text-white [text-shadow:0_0_12px_rgba(255,255,255,0.35)] shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-[background-position] duration-500 hover:bg-right disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        <span className="relative z-10">{loading ? "Scanning…" : "Scan"}</span>
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              className="pointer-events-none absolute rounded-full bg-white/40"
              style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
              initial={{ scale: 0, opacity: 0.55 }}
              animate={{ scale: 24, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

const titleWords = ["Phishing", "URL", "Detector"];

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const scanGeneration = useRef(0);
  const canSubmit = input.trim().length > 0 && !loading;

  const onScan = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setError("");
      setResult(null);
      if (!input.trim()) {
        setError("Enter a URL to scan.");
        return;
      }
      const gen = ++scanGeneration.current;
      setLoading(true);
      try {
        const data = await predictUrl(input.trim());
        if (gen !== scanGeneration.current) return;
        setResult(data);
      } catch (err) {
        if (gen !== scanGeneration.current) return;
        setError(formatAxiosError(err));
      } finally {
        if (gen === scanGeneration.current) setLoading(false);
      }
    },
    [input]
  );

  const accent = useMemo(() => {
    if (!result?.prediction) {
      return { ring: "ring-cyan-500/20", border: "border-cyan-500/15" };
    }
    const t = predictionTheme(result.prediction);
    return { ring: t.ring, border: t.border };
  }, [result?.prediction]);

  const pageVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08, delayChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 sm:py-14"
      initial="hidden"
      animate="show"
      variants={pageVariants}
    >
      <div className="cyber-grid pointer-events-none absolute inset-0 z-0 opacity-100" aria-hidden />
      <div className="cyber-scanline pointer-events-none fixed inset-0 z-0" aria-hidden />
      <CyberParticleField />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 z-0 h-[420px] w-[min(90vw,720px)] -translate-x-1/2 rounded-full bg-blue-600/14 blur-[100px]"
        animate={{ opacity: [0.5, 0.88, 0.5], scale: [1, 1.03, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-80 w-80 rounded-full bg-violet-600/18 blur-[90px]"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center">
        <motion.div
          variants={itemVariants}
          className="mb-6 flex w-full max-w-xl items-center justify-between rounded-lg border border-cyan-500/15 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md sm:text-[11px]"
        >
          <span className="flex items-center gap-2 text-cyan-400/95 [text-shadow:0_0_10px_rgba(34,211,238,0.45)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            </span>
            Sec-ops
          </span>
          <span className="hidden text-slate-600 sm:inline">url.threat.analyzer</span>
          <span className="text-violet-400/90 [text-shadow:0_0_10px_rgba(167,139,250,0.35)]">v1.0</span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`neon-border-glass w-full max-w-xl rounded-2xl border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-px shadow-2xl shadow-black/60 backdrop-blur-2xl ${accent.ring} ring-1 transition-[box-shadow] duration-500`}
        >
          <div className="rounded-[15px] bg-black/35 px-5 py-8 sm:px-8 sm:py-10">
            <div className="mb-8 text-center">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/95 [text-shadow:0_0_14px_rgba(34,211,238,0.45)]"
              >
                Threat intelligence
              </motion.p>
              <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                {titleWords.map((word, i) => (
                  <motion.span
                    key={word}
                    initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.28 + i * 0.12,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="text-neon-heading bg-gradient-to-r from-white via-blue-100 to-violet-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-4 h-px max-w-[220px] origin-center bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              />
            </div>

            <form onSubmit={onScan} className="space-y-5" aria-busy={loading}>
              <div>
                <label htmlFor="url" className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Target URL
                </label>
                <input
                  id="url"
                  name="url"
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError("");
                  }}
                  placeholder="https://example.com"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                  className="neon-input-focus w-full rounded-lg border border-white/12 bg-black/45 px-4 py-3.5 font-mono text-sm text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-400/55 focus:bg-black/60 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                <RippleScanButton disabled={!canSubmit} loading={loading} />
                <p className="text-center font-mono text-[10px] text-slate-600 sm:text-left">
                  POST /predict · SOC pipeline
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
                <span className="w-full font-mono text-[9px] uppercase tracking-widest text-slate-600">Quick test</span>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setInput(ex);
                      setError("");
                      setResult(null);
                    }}
                    className="rounded border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-left font-mono text-[10px] text-cyan-300/85 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  >
                    {ex.length > 36 ? `${ex.slice(0, 36)}…` : ex}
                  </button>
                ))}
              </div>
            </form>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <CyberSpinner />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/50 bg-red-950/35 px-4 py-3 font-mono text-xs text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    ❌
                  </span>
                  <p className="min-w-0 flex-1 leading-relaxed">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="shrink-0 rounded border border-red-500/35 px-2 py-1 text-[10px] uppercase tracking-wider text-red-200 transition hover:bg-red-500/20"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && !loading && (
                <motion.div
                  key={`${result.prediction}-${result.score ?? 0}-${(result.reasons || []).length}`}
                  initial={{ opacity: 0, y: 32, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                  className={`mt-8 space-y-5 rounded-xl border-2 ${predictionTheme(result.prediction).border} ${predictionTheme(result.prediction).panel} ${predictionTheme(result.prediction).glow} p-5 backdrop-blur-sm`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Verdict</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="select-none text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] sm:text-4xl" aria-hidden>
                          {verdictEmoji(result.prediction)}
                        </span>
                        <p
                          className={`font-mono text-2xl font-bold tracking-wide sm:text-3xl ${predictionTheme(result.prediction).text} ${predictionTheme(result.prediction).textGlow}`}
                        >
                          <TypingText
                            key={predictionTheme(result.prediction).label}
                            text={predictionTheme(result.prediction).label}
                            speed={16}
                            startDelay={80}
                          />
                        </p>
                      </div>
                      <p className="mt-2 font-mono text-[11px] text-slate-400">
                        <TypingText
                          key={`${result.prediction}-sub-${predictionTheme(result.prediction).subtitle}`}
                          text={predictionTheme(result.prediction).subtitle}
                          speed={14}
                          startDelay={400}
                          showCursor={false}
                        />
                      </p>
                    </div>
                    <div
                      className="rounded-lg border border-white/15 bg-black/40 px-5 py-3 text-right shadow-[0_0_20px_rgba(0,0,0,0.4)]"
                      style={{
                        boxShadow: `0 0 24px rgba(${predictionTheme(result.prediction).neonRgb},0.12), inset 0 1px 0 rgba(255,255,255,0.04)`,
                      }}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Confidence</p>
                      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white [text-shadow:0_0_16px_rgba(255,255,255,0.2)]">
                        {typeof result.confidence === "number" ? `${Math.round(result.confidence * 100)}%` : "—"}
                      </p>
                      <p className="mt-1 font-mono text-[9px] text-slate-600">Model output</p>
                    </div>
                  </div>

                  <RiskProgressBar prediction={result.prediction} score={result.score} />

                  <ExplainableUrlBlock
                    url={result.normalized_url || input.trim()}
                    prediction={result.prediction}
                    score={result.score}
                  />

                  <div>
                    <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      <span aria-hidden>⚠️</span>
                      Analysis log
                    </p>
                    <ul className="space-y-2">
                      {(result.reasons || []).map((reason, i) => (
                        <motion.li
                          key={`${i}-${reason.slice(0, 32)}`}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                          className="flex items-start gap-3 rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5 text-sm text-slate-300 shadow-[0_0_16px_rgba(0,0,0,0.25)]"
                        >
                          <span className="mt-0.5 text-base leading-none" aria-hidden title="Severity hint">
                            {reasonEmoji(reason)}
                          </span>
                          <TypingText
                            text={reason}
                            speed={reason.length > 90 ? 2 : 6}
                            startDelay={180 + i * 120}
                            className="leading-snug"
                            showCursor={false}
                          />
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-8 text-center font-mono text-[10px] text-slate-600">
          Local: Vite proxies <span className="text-slate-500">/api</span> → Flask :5000
        </motion.p>
      </div>
    </motion.div>
  );
}
