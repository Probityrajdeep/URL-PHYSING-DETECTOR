import { useState } from "react";
import { CheckCircle2, ShieldAlert, ShieldCheck, Zap } from "lucide-react";

const initialThreatAlerts = [
  {
    id: "thr-1",
    severity: "CRITICAL",
    title: "Credential Harvesting Campaign via Fake Banking Portals",
    industry: "Financial Services",
    time: "3 mins ago",
  },
  {
    id: "thr-2",
    severity: "HIGH",
    title: "Typosquatted SaaS Login Domains Targeting Enterprise Accounts",
    industry: "Technology",
    time: "9 mins ago",
  },
  {
    id: "thr-3",
    severity: "MEDIUM",
    title: "Spoofed Shipping Notifications Distributing Malicious Redirects",
    industry: "Logistics",
    time: "14 mins ago",
  },
  {
    id: "thr-4",
    severity: "CRITICAL",
    title: "QR-Based Phishing Wave Impersonating Government Tax Portals",
    industry: "Public Sector",
    time: "21 mins ago",
  },
  {
    id: "thr-5",
    severity: "HIGH",
    title: "Compromised OAuth Consent Screens for Data Exfiltration",
    industry: "Healthcare",
    time: "28 mins ago",
  },
];

function severityBadge(severity) {
  if (severity === "CRITICAL") {
    return "border-red-500/40 bg-red-950/80 text-red-300";
  }
  if (severity === "HIGH") {
    return "border-orange-500/40 bg-orange-950/70 text-orange-300";
  }
  return "border-amber-500/35 bg-amber-950/65 text-amber-300";
}

function Card({ title, children }) {
  return (
    <section className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl">
      <div className="border-b border-slate-700/50 px-4 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function ThreatIntelligenceTab() {
  const [alerts] = useState(initialThreatAlerts);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card title="LIVE GLOBAL THREAT FEED">
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/35 bg-red-950/55 px-2.5 py-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-300">Live</span>
          </div>
          <ShieldAlert className="h-4 w-4 text-red-300" />
        </div>

        <div className="divide-y divide-slate-700/40">
          {alerts.map((alert) => (
            <article key={alert.id} className="py-3 first:pt-0 last:pb-0">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={`rounded-md border px-2 py-1 text-[10px] font-bold tracking-wider ${severityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-xs text-slate-400">{alert.time}</span>
              </div>
              <p className="text-sm font-medium text-slate-100">{alert.title}</p>
              <p className="mt-1 text-xs text-slate-400">Targeted Industry: {alert.industry}</p>
            </article>
          ))}
        </div>
      </Card>

      <div className="space-y-4 xl:col-span-1">
        <Card title="HEURISTICS ENGINE">
          <div className="space-y-3">
            {["Domain Age Analysis", "Typosquatting Detection", "SSL Certificate Verification"].map((rule) => (
              <div
                key={rule}
                className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-950/45 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-cyan-300" />
                  <span className="text-sm text-slate-200">{rule}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Online
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="INTEGRATION STATUS">
          <div className="space-y-3">
            {["Google Safe Browsing", "VirusTotal"].map((service) => (
              <div
                key={service}
                className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-950/45 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <span className="text-sm text-slate-200">{service}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
