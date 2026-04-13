/** Shared verdict styling and icons for scan results (used by scan UI). */

export function verdictEmoji(prediction) {
  const p = (prediction || "").toLowerCase();
  if (p === "phishing") return "\u274C";
  if (p === "suspicious") return "\u26A0\uFE0F";
  return "\u2705";
}

export function reasonEmoji(reason) {
  const r = (reason || "").toLowerCase();
  if (r.includes("empty") || r.includes("invalid")) return "\u274C";
  if (r.includes("no ") && (r.includes("detected") || r.includes("symbol")))
    return r.includes("@") ? "\u26A0\uFE0F" : "\u2705";
  if (r.includes("'@'") || r.includes("ip address") || r.includes("attackers")) return "\u274C";
  if (r.includes("risk") || r.includes("many") || r.includes("long") || r.includes("elevated")) return "\u26A0\uFE0F";
  if (r.includes("aggregate") || r.includes("score")) return "\u26A0\uFE0F";
  return "\u2705";
}

export function predictionTheme(prediction) {
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

export function riskFillPercent(prediction, score) {
  if (typeof score === "number" && !Number.isNaN(score)) {
    return Math.min(100, Math.max(0, score));
  }
  const p = (prediction || "").toLowerCase();
  if (p === "phishing") return 88;
  if (p === "suspicious") return 52;
  return 18;
}
