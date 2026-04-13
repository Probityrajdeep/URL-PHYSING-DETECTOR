import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { predictionTheme, verdictEmoji } from "../lib/scanDisplay.js";

/** Authenticated scan history (persisted per account in localStorage). */
export default function Dashboard() {
  const { user, scanHistory } = useAuth();

  return (
    <motion.div
      className="mx-auto max-w-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Scan history</h1>
        <p className="mt-2 text-sm text-slate-400">
          Signed in as <span className="text-cyan-300/90">{user?.email}</span>. Results from your recent URL checks.
        </p>
      </div>

      {scanHistory.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-10 text-center text-slate-400 backdrop-blur-md">
          <p className="text-lg text-slate-300">No scans yet</p>
          <p className="mt-2 text-sm">Run a scan from the home page—each result will appear here.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {scanHistory.map((row, i) => {
            const theme = predictionTheme(row.prediction);
            const confPct =
              typeof row.confidence === "number" && !Number.isNaN(row.confidence)
                ? `${Math.round(row.confidence * 100)}%`
                : "—";
            return (
              <motion.li
                key={row.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={{ y: -2 }}
                className={`rounded-xl border-2 ${theme.border} ${theme.panel} p-4 shadow-lg backdrop-blur-sm ${theme.glow}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl" aria-hidden>
                    {verdictEmoji(row.prediction)}
                  </span>
                  <span className={`rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] uppercase ${theme.text}`}>
                    {row.prediction}
                  </span>
                </div>
                <p className="mt-3 break-all font-mono text-xs text-slate-300" title={row.url}>
                  {row.url}
                </p>
                <p className="mt-3 font-mono text-[11px] text-slate-500">
                  Confidence: <span className="text-slate-200">{confPct}</span>
                </p>
                <p className="mt-1 font-mono text-[10px] text-slate-600">
                  {row.at ? new Date(row.at).toLocaleString() : ""}
                </p>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}
