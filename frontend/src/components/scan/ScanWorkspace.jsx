import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { predictUrl, formatAxiosError } from "../../api.js";
import { predictionTheme, reasonEmoji, verdictEmoji } from "../../lib/scanDisplay.js";
import { ExplainableUrlBlock, RippleScanButton, RiskProgressBar, SCAN_EXAMPLES, TypingText } from "./ScanParts.jsx";

const TERMINAL_LINES = [
  "Extracting domain payload...",
  "Verifying SSL certificate chain...",
  "Running heuristic AI analysis...",
  "Calculating final risk score...",
];

/**
 * URL scan form + animated result card. Calls Flask POST /predict via Vite proxy.
 * @param {{ interceptScan?: () => boolean | Promise<boolean>, onScanSuccess?: (data: object, url: string) => void }} props
 */
export default function ScanWorkspace({ interceptScan, onScanSuccess }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [terminalLineCount, setTerminalLineCount] = useState(0);
  const [terminalDone, setTerminalDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const scanGeneration = useRef(0);
  const canSubmit = input.trim().length > 0 && !loading;

  useEffect(() => {
    if (!loading) return undefined;
    setTerminalLineCount(0);
    setTerminalDone(false);
    let step = 0;
    const intervalId = window.setInterval(() => {
      step += 1;
      setTerminalLineCount(step);
      if (step >= TERMINAL_LINES.length) {
        window.clearInterval(intervalId);
        setTerminalDone(true);
      }
    }, 600);
    return () => window.clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    if (!loading || !apiDone || !terminalDone) return;
    if (pendingResult) setResult(pendingResult);
    setLoading(false);
    setApiDone(false);
    setTerminalDone(false);
    setPendingResult(null);
  }, [apiDone, loading, pendingResult, terminalDone]);

  const onScan = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setError("");
      setResult(null);
      if (!input.trim()) {
        setError("Enter a URL to scan.");
        return;
      }
      if (interceptScan) {
        const ok = await interceptScan();
        if (!ok) return;
      }
      const gen = ++scanGeneration.current;
      setLoading(true);
      setApiDone(false);
      setPendingResult(null);
      try {
        const trimmed = input.trim();
        const data = await predictUrl(trimmed);
        if (gen !== scanGeneration.current) return;
        setPendingResult(data);
        setApiDone(true);
        onScanSuccess?.(data, trimmed);
      } catch (err) {
        if (gen !== scanGeneration.current) return;
        setError(formatAxiosError(err));
        setLoading(false);
        setApiDone(false);
        setPendingResult(null);
      }
    },
    [input, interceptScan, onScanSuccess]
  );

  const accent = useMemo(() => {
    if (!result?.prediction) {
      return { ring: "ring-cyan-500/20", border: "border-cyan-500/15" };
    }
    const t = predictionTheme(result.prediction);
    return { ring: t.ring, border: t.border };
  }, [result?.prediction]);

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div variants={itemVariants} className="w-full max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex w-full items-center justify-between rounded-lg border border-cyan-500/15 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md sm:text-[11px]"
      >
        <span className="flex items-center gap-2 text-cyan-400/95 [text-shadow:0_0_10px_rgba(34,211,238,0.45)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          </span>
          Live engine
        </span>
        <span className="hidden text-slate-600 sm:inline">POST /predict</span>
        <span className="text-violet-400/90 [text-shadow:0_0_10px_rgba(167,139,250,0.35)]">Flask</span>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className={`neon-border-glass w-full rounded-2xl border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-px shadow-2xl shadow-black/60 backdrop-blur-2xl ${accent.ring} ring-1 transition-[box-shadow] duration-500`}
      >
        <div className="rounded-[15px] bg-black/35 px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 text-center">
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/95 [text-shadow:0_0_14px_rgba(34,211,238,0.45)]"
            >
              Threat intelligence
            </motion.p>
            <h2 className="text-neon-heading bg-gradient-to-r from-white via-blue-100 to-violet-300 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
              Scan a URL
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-4 h-px max-w-[220px] origin-center bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />
          </div>

          <form onSubmit={onScan} className="space-y-5" aria-busy={loading}>
            <AnimatePresence mode="wait" initial={false}>
              {!loading ? (
                <motion.div
                  key="scan-input-ui"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
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
                      className="neon-input-focus w-full rounded-lg border border-white/12 bg-black/45 px-4 py-3.5 font-mono text-sm text-slate-100 outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-cyan-400/60 focus:bg-black/60 focus:ring-0 active:border-violet-400/50 active:shadow-[0_0_24px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <RippleScanButton disabled={!canSubmit} loading={loading} label="Scan Now" />
                    <p className="text-center font-mono text-[10px] text-slate-600 sm:text-left">Rule-based · explainable</p>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
                    <span className="w-full font-mono text-[9px] uppercase tracking-widest text-slate-600">Quick test</span>
                    {SCAN_EXAMPLES.map((ex) => (
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
                </motion.div>
              ) : (
                <motion.div
                  key="terminal-loading-ui"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg border border-emerald-400/30 bg-black/85 p-4 font-mono text-xs text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.14)]"
                  role="status"
                  aria-live="polite"
                >
                  <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-emerald-400/75">Terminal Process</p>
                  <div className="space-y-2">
                    {TERMINAL_LINES.slice(0, terminalLineCount).map((line) => (
                      <p key={line} className="leading-relaxed [text-shadow:0_0_10px_rgba(52,211,153,0.28)]">
                        {`> ${line}`}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

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
                  {"\u274C"}
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
                      <span
                        className="select-none text-3xl drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] sm:text-4xl"
                        aria-hidden
                      >
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
                      {typeof result.confidence === "number" ? `${Math.round(result.confidence)}%` : "—"}
                    </p>
                    <p className="mt-1 font-mono text-[9px] text-slate-600">Heuristic output</p>
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
                    <span aria-hidden>{"\u26A0\uFE0F"}</span>
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

      <p className="mt-6 text-center font-mono text-[10px] text-slate-600">
        Dev: Vite proxies <span className="text-slate-500">/api</span> to Flask :5000
      </p>
    </motion.div>
  );
}
