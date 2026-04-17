import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAuth } from "../context/AuthContext.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

const SIDEBAR_LINKS = ["Overview", "Scan History", "Threat Intelligence", "Settings"];

const GLOBAL_THREATS = [
  { city: "London", top: "30%", left: "48%" },
  { city: "Mumbai", top: "46%", left: "67%" },
  { city: "Sao Paulo", top: "67%", left: "34%" },
  { city: "New York", top: "38%", left: "24%" },
  { city: "Singapore", top: "56%", left: "77%" },
];

const FORENSIC_DATA = [
  { label: "Domain Age", value: "2 days" },
  { label: "SSL", value: "Missing" },
  { label: "Entropy", value: "High" },
  { label: "Redirect Chains", value: "4 detected" },
  { label: "Subdomain Spoofing", value: "Likely" },
];

function toStatus(prediction = "") {
  const p = String(prediction).toLowerCase();
  if (p.includes("safe")) return { label: "SAFE", dot: "🟢", classes: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" };
  if (p.includes("sus")) return { label: "SUSPICIOUS", dot: "🟡", classes: "bg-amber-500/20 text-amber-200 border-amber-400/30" };
  return { label: "MALICIOUS", dot: "🔴", classes: "bg-red-500/20 text-red-200 border-red-400/35" };
}

function calcSecurityScore(scanHistory) {
  if (!scanHistory.length) return 100;
  const risky = scanHistory.filter((s) => {
    const p = String(s.prediction || "").toLowerCase();
    return p.includes("phish") || p.includes("mal") || p.includes("sus");
  }).length;
  const score = Math.max(10, Math.round(((scanHistory.length - risky) / scanHistory.length) * 100));
  return score;
}

function buildLast7DaysSeries(scanHistory) {
  const now = new Date();
  const days = [...Array(7)].map((_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - idx));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const labels = days.map((d) => d.toLocaleDateString(undefined, { weekday: "short" }));
  const counts = days.map((d) => {
    const start = d.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return scanHistory.filter((item) => {
      const at = item?.at ? new Date(item.at).getTime() : NaN;
      return !Number.isNaN(at) && at >= start && at < end;
    }).length;
  });

  return { labels, counts };
}

function CircularGauge({ score }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} stroke="rgba(148,163,184,0.22)" strokeWidth="10" fill="none" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#socGauge)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="socGauge" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-2xl font-bold text-white">{score}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">/100</p>
      </div>
    </div>
  );
}

/** Authenticated scan history (persisted per account in localStorage). */
export default function Dashboard() {
  const { user, scanHistory } = useAuth();
  const [activeNav, setActiveNav] = useState("Overview");
  const [inspectedRow, setInspectedRow] = useState(null);
  const totalScans = scanHistory.length;
  const threatsBlocked = scanHistory.filter((row) => {
    const p = String(row.prediction || "").toLowerCase();
    return p.includes("phish") || p.includes("mal");
  }).length;
  const securityScore = calcSecurityScore(scanHistory);
  const { labels, counts } = useMemo(() => buildLast7DaysSeries(scanHistory), [scanHistory]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Scans",
        data: counts,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.2)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "rgba(2,6,23,0.95)", borderColor: "rgba(148,163,184,0.2)", borderWidth: 1 },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(148,163,184,0.08)" } },
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", precision: 0 },
        grid: { color: "rgba(148,163,184,0.08)" },
      },
    },
  };

  return (
    <motion.div
      className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#020617] p-4 sm:p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(147,51,234,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_45%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/85">SOC Console</p>
          <p className="mt-2 text-sm text-slate-400">{user?.email}</p>
          <nav className="mt-5 space-y-2">
            {SIDEBAR_LINKS.map((link) => (
              <motion.button
                key={link}
                type="button"
                onClick={() => setActiveNav(link)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-lg border px-3 py-2 text-left font-mono text-xs uppercase tracking-wider transition ${
                  activeNav === link
                    ? "border-cyan-400/45 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 bg-black/25 text-slate-300 hover:border-cyan-500/35"
                }`}
              >
                {link}
              </motion.button>
            ))}
          </nav>
        </aside>

        <main className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Total URLs Scanned</p>
              <motion.p
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="mt-3 font-mono text-3xl font-bold text-cyan-300"
              >
                {totalScans}
              </motion.p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-300/20 bg-red-500/[0.07] p-5 shadow-[0_0_25px_rgba(248,113,113,0.2)] backdrop-blur-xl"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-200/80">Threats Blocked</p>
              <p className="mt-3 font-mono text-3xl font-bold text-red-300">{threatsBlocked}</p>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:col-span-2 xl:col-span-1"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Security Score</p>
              <div className="mt-2 flex items-center justify-center">
                <CircularGauge score={securityScore} />
              </div>
            </motion.article>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-200">Scan History</h2>
              <p className="text-xs text-slate-400">Glassmorphism forensic table</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="px-3 py-2">URL</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Confidence</th>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scanHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                        No scans yet. Run a scan from Home to populate this SOC table.
                      </td>
                    </tr>
                  ) : (
                    scanHistory.map((row) => {
                      const status = toStatus(row.prediction);
                      const confPct =
                        typeof row.confidence === "number" && !Number.isNaN(row.confidence)
                          ? `${Math.round(row.confidence * 100)}%`
                          : "-";
                      return (
                        <tr key={row.id} className="border-b border-white/5">
                          <td className="max-w-[270px] px-3 py-3 font-mono text-xs text-slate-300">
                            <span className="line-clamp-2 break-all">{row.url}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${status.classes}`}>
                              <span>{status.dot}</span>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs">{confPct}</td>
                          <td className="px-3 py-3 text-xs text-slate-400">
                            {row.at ? new Date(row.at).toLocaleString() : "-"}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setInspectedRow(row)}
                              className="rounded-md border border-cyan-400/30 bg-cyan-500/12 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-cyan-200"
                            >
                              Inspect
                            </motion.button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-200">Recent Global Threats</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Threat Map</span>
              </div>
              <div className="relative h-60 overflow-hidden rounded-xl border border-white/10 bg-[#030712]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_75%_70%,rgba(168,85,247,0.12),transparent_40%)]" />
                <div className="absolute inset-0 opacity-20 [background:linear-gradient(rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.22)_1px,transparent_1px)] [background-size:40px_40px]" />
                <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 800 360" fill="none">
                  <path d="M97 133l48-40 75 4 56-24 88 15 88-17 54 21 63 5 45 36-40 18-66 2-47 19-70-3-65 12-64-19-51 11-57-20-57-20z" stroke="#38bdf8" strokeWidth="1.2" />
                  <path d="M159 215l64 18 77-10 48 19 66-5 51 10 67-8 63 7 28 26-84 14-61-10-74 10-78-15-56 13-53-11-42-23z" stroke="#a78bfa" strokeWidth="1.2" />
                </svg>
                {GLOBAL_THREATS.map((point) => (
                  <div key={point.city} className="absolute" style={{ top: point.top, left: point.left }}>
                    <motion.span
                      className="absolute -left-2 -top-2 h-6 w-6 rounded-full border border-red-400/40"
                      animate={{ scale: [1, 2, 2.5], opacity: [0.55, 0.2, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <span className="relative block h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.85)]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-200">7-Day Activity</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">User Stats</span>
              </div>
              <div className="h-60">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {inspectedRow ? (
          <>
            <motion.button
              type="button"
              aria-label="Close forensic drawer"
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedRow(null)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-[#050b1d]/95 p-5 backdrop-blur-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 290, damping: 30 }}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-200">Forensic Breakdown</h4>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInspectedRow(null)}
                  className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-300"
                >
                  Close
                </motion.button>
              </div>
              <p className="mt-4 break-all rounded-lg border border-white/10 bg-black/25 p-3 font-mono text-xs text-slate-300">
                {inspectedRow.url}
              </p>
              <div className="mt-4 space-y-2">
                {FORENSIC_DATA.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="font-mono text-xs text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
      {scanHistory.length === 0 ? (
        <div className="relative mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-400">
          Populate the SOC experience by running scans from the home page.
        </div>
      ) : null}
    </motion.div>
  );
}
