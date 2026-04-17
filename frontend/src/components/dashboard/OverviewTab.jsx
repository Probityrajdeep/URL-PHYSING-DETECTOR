import { motion } from "framer-motion";
import { CheckCircle2, Radar, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const mockRecentScans = [
  { id: "scan-1", url: "https://secure-paypal-verify-auth.xyz/signin", status: "Malicious", time: "2 mins ago" },
  { id: "scan-2", url: "https://accounts.google.com", status: "Safe", time: "7 mins ago" },
  { id: "scan-3", url: "https://dropbox-shared-files-login.io/view", status: "Suspicious", time: "11 mins ago" },
  { id: "scan-4", url: "https://banking-update-security-check.net", status: "Malicious", time: "19 mins ago" },
  { id: "scan-5", url: "https://github.com/chiranjit/url-physing-detector", status: "Safe", time: "24 mins ago" },
];

const threatDistribution = [
  { name: "Safe", value: 92, color: "#22c55e" },
  { name: "Suspicious", value: 38, color: "#facc15" },
  { name: "Malicious", value: 12, color: "#ef4444" },
];

const metrics = { totalScans: 142, threatsBlocked: 12, safeLinks: 92, securityHealth: 92 };

function statusBadge(status) {
  if (status === "Safe") return "border-emerald-500/30 bg-emerald-500/15 text-emerald-300";
  if (status === "Suspicious") return "border-amber-500/30 bg-amber-500/15 text-amber-200";
  return "border-red-500/30 bg-red-500/15 text-red-300";
}

function SecurityRing({ value }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(100,116,139,0.35)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm font-semibold text-cyan-200">{pct}%</div>
    </div>
  );
}

export default function OverviewTab() {
  const cardClass = "bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl";

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${cardClass} p-4`}
      >
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Paste a URL to scan instantly..."
              className="w-full rounded-lg border border-slate-700/70 bg-slate-950/80 py-2.5 pl-9 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
            />
          </div>
          <button
            type="button"
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/25 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)]"
          >
            Quick Scan
          </button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className={`${cardClass} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total Scans</p>
            <Radar className="h-4 w-4 text-sky-300" />
          </div>
          <p className="text-3xl font-bold text-sky-200">{metrics.totalScans}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Threats Blocked</p>
            <ShieldAlert className="h-4 w-4 text-red-300" />
          </div>
          <p className="text-3xl font-bold text-red-300">{metrics.threatsBlocked}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Safe Links</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="text-3xl font-bold text-emerald-300">{metrics.safeLinks}</p>
        </div>
        <div className={`${cardClass} flex items-center justify-between p-4`}>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Security Health</p>
            <p className="mt-1 text-sm text-slate-300">Safe/Malicious Ratio</p>
          </div>
          <SecurityRing value={metrics.securityHealth} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid gap-4 xl:grid-cols-3"
      >
        <div className={`${cardClass} overflow-hidden xl:col-span-2`}>
          <div className="border-b border-slate-700/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-100">Recent Scans</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {mockRecentScans.map((row) => (
                  <tr key={row.id} className="border-t border-slate-700/40">
                    <td className="max-w-[360px] truncate px-4 py-3">{row.url}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`${cardClass} p-4`}>
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Threat Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={threatDistribution} innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" stroke="rgba(15,23,42,0.9)">
                  {threatDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    background: "rgba(15,23,42,0.92)",
                    border: "1px solid rgba(100,116,139,0.45)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {threatDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-950/50 p-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            Live split from latest threat telemetry
          </div>
        </div>
      </motion.section>
    </div>
  );
}
