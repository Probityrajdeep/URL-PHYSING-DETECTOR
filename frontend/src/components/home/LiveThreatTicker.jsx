const THREATS = [
  "hxxps://secure-paypal-login.verify-now-auth.net",
  "hxxp://banking-alerts-account-update.ru/login",
  "hxxps://microsoft-support-locked-device-recover.xyz",
  "hxxp://wallet-kyt-verify-identity.top/connect",
  "hxxps://apple-security-billing-check.help/portal",
  "hxxp://crypto-airdrop-claim-bonus.site/seed",
];

function TickerTrack() {
  return THREATS.map((url, i) => (
    <span
      key={`${url}-${i}`}
      className="inline-flex shrink-0 items-center gap-2 border-r border-cyan-500/15 px-4 py-2 font-mono text-[11px] text-cyan-200/90"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]" aria-hidden />
      {url}
    </span>
  ));
}

export default function LiveThreatTicker() {
  return (
    <div className="mt-5 rounded-lg border border-cyan-500/20 bg-black/45 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
      <div className="border-b border-cyan-500/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/85">
        Live Threat Ticker
      </div>
      <div className="overflow-hidden">
        <div className="threat-ticker-track flex min-w-max">
          <TickerTrack />
          <TickerTrack />
        </div>
      </div>
    </div>
  );
}
