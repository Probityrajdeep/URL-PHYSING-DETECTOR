import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { buildUrlExplainability, segmentClassName } from "../../urlExplainability.js";
import { predictionTheme, reasonEmoji, riskFillPercent, verdictEmoji } from "../../lib/scanDisplay.js";

export function TypingText({ text, className, speed = 20, startDelay = 120, showCursor = true }) {
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
          {"\u258D"}
        </span>
      ) : null}
    </span>
  );
}

export function CyberSpinner() {
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

export function RiskProgressBar({ prediction, score }) {
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
        <span className="text-emerald-400/95 [text-shadow:0_0_8px_rgba(52,211,153,0.4)]">{"\u2705"} Safe</span>
        <span className="text-amber-400/95 [text-shadow:0_0_8px_rgba(251,191,36,0.35)]">{"\u26A0\uFE0F"} Suspicious</span>
        <span className="text-red-400/95 [text-shadow:0_0_8px_rgba(248,113,113,0.4)]">{"\u274C"} Phishing</span>
      </div>
    </div>
  );
}

export function ExplainableUrlBlock({ url, prediction, score }) {
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
          {verdictEmoji(prediction)}
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
            {"\u274C"}
          </span>{" "}
          Critical pattern
        </span>
        <span>
          <span className="text-amber-400" aria-hidden>
            {"\u26A0\uFE0F"}
          </span>{" "}
          Elevated risk
        </span>
        <span>
          <span className="text-slate-500" aria-hidden>
            {"\u2705"}
          </span>{" "}
          Hover / focus for tooltips
        </span>
      </p>
    </motion.div>
  );
}

export function RippleScanButton({ disabled, loading, type = "submit", label = "Scan Now" }) {
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
        <span className="relative z-10">{loading ? "Scanning…" : label}</span>
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

export const SCAN_EXAMPLES = [
  "https://example.com/login",
  "http://192.168.1.10/secure/update",
  "https://paypal.com.verify-account.security-alert.xyz/login",
  "https://xn--pple-43d.com/security",
];
