import { AlertTriangle, Copy, KeyRound, RotateCw, ShieldAlert, UserCog } from "lucide-react";

function Card({ title, icon: Icon, children, danger = false }) {
  const cardClass = danger
    ? "bg-slate-900/50 backdrop-blur-md border border-red-900/50 rounded-xl"
    : "bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl";

  return (
    <section className={cardClass}>
      <div className={`flex items-center gap-2 border-b px-4 py-3 ${danger ? "border-red-900/45" : "border-slate-700/50"}`}>
        <Icon className={`h-4 w-4 ${danger ? "text-red-300" : "text-cyan-300"}`} />
        <h3 className={`text-xs font-semibold uppercase tracking-[0.18em] ${danger ? "text-red-200" : "text-cyan-200"}`}>{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, type = "text", defaultValue, placeholder }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700/70 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
      />
    </label>
  );
}

function Toggle({ label, description, defaultChecked = false }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-700/50 bg-slate-950/45 px-3 py-3">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-11 rounded-full bg-slate-700 transition-colors peer-checked:bg-cyan-500/70" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function SettingsTab() {
  return (
    <div className="space-y-4">
      <Card title="Profile Configuration" icon={UserCog}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Name" defaultValue="Rohit Sharma" />
          <Field label="Email" type="email" defaultValue="rohit@phishguard.ai" />
        </div>

        <div className="mt-4 space-y-3 rounded-lg border border-slate-700/50 bg-slate-950/45 p-3">
          <p className="text-xs uppercase tracking-wider text-slate-400">Change Password</p>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Current Password" type="password" placeholder="••••••••" />
            <Field label="New Password" type="password" placeholder="••••••••" />
            <Field label="Confirm Password" type="password" placeholder="••••••••" />
          </div>
        </div>
      </Card>

      <div id="api-access">
        <Card title="API Access" icon={KeyRound}>
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs uppercase tracking-wider text-slate-400">Primary API Key</span>
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value="pk_live_7a1f8d4c9b2e13fxxxxx"
                    className="w-full rounded-lg border border-slate-700/70 bg-slate-950/70 px-3 py-2.5 pr-16 text-sm text-slate-200 blur-[1px]"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                    Hidden
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-500/35 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/25"
                >
                  <RotateCw className="h-4 w-4" />
                  Generate New Key
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600/70 bg-slate-800/65 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
            </label>
            <p className="text-xs text-slate-400">
              Use this key to connect custom scanners, automation jobs, and SIEM pipelines.
            </p>
          </div>
        </Card>
      </div>

      <Card title="Alert Preferences" icon={ShieldAlert}>
        <div className="space-y-3">
          <Toggle
            label="Email me on High-Risk Detections"
            description="Instant notification when scans are marked malicious or critical."
            defaultChecked
          />
          <Toggle
            label="Weekly Scan Summary"
            description="Receive a consolidated report of scan volume and threat trends every Friday."
          />
        </div>
      </Card>

      <Card title="Danger Zone" icon={AlertTriangle} danger>
        <div className="space-y-3">
          <p className="text-sm text-red-200/90">Destructive actions are permanent and cannot be undone.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="rounded-lg border border-red-700/60 bg-red-950/45 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:border-red-500/70 hover:bg-red-600/25"
            >
              Clear All Scan History
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-700/70 bg-red-950/55 px-4 py-2.5 text-sm font-medium text-red-100 transition hover:border-red-400/80 hover:bg-red-600/35"
            >
              Delete Account
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
