/**
 * Client-side explainability: highlight URL regions that drive heuristic risk
 * (aligned with backend: @, IPv4, length, dot count in host).
 */

const IPV4_RE =
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;

const TOOLTIPS = {
  ipv4:
    "IPv4 in the link: phishing often uses raw IPs to skip domain reputation and confuse users who only glance at the start of the URL.",
  userinfo:
    "The part before '@' is treated as a username by the browser, not the site name. Victims may read 'paypal.com' here while the real host is after '@'—a classic obfuscation trick.",
  manyDots:
    "Unusually many labels in the hostname (extra dots) often appear in look-alike, parked, or chained redirect domains.",
  longUrl:
    "This URL is long. Attackers pad paths and query strings so dangerous segments sit far to the right, off-screen in the address bar.",
};

function paintRange(levels, tips, start, end, level, tip) {
  const lo = Math.max(0, start);
  const hi = Math.min(levels.length, end);
  for (let i = lo; i < hi; i++) {
    if (level > levels[i]) {
      levels[i] = level;
      tips[i] = tip;
    }
  }
}

function coalesceSegments(str, levels, tips) {
  const n = str.length;
  if (n === 0) return [];
  const out = [];
  let i = 0;
  while (i < n) {
    const lv = levels[i];
    const tip = tips[i];
    let j = i + 1;
    while (j < n && levels[j] === lv && tips[j] === tip) j++;
    out.push({
      text: str.slice(i, j),
      level: lv,
      tooltip: tip || undefined,
    });
    i = j;
  }
  return out;
}

/**
 * @param {string} url
 * @param {string} prediction
 * @param {number} [score]
 */
export function buildUrlExplainability(url, prediction, score) {
  const str = (url || "").trim();
  const pred = (prediction || "").toLowerCase();

  const whyTitle =
    pred === "phishing"
      ? "Why this URL is flagged as phishing"
      : pred === "suspicious"
        ? "Why this URL looks suspicious"
        : "Why this URL looks safer (heuristic view)";

  if (!str) {
    return {
      whyTitle,
      whySummary: "No URL was provided, so nothing can be highlighted.",
      segments: [],
      factors: [],
    };
  }

  const n = str.length;
  const levels = new Array(n).fill(0);
  const tips = new Array(n).fill(null);

  const factors = [];

  // IPv4
  IPV4_RE.lastIndex = 0;
  let m;
  while ((m = IPV4_RE.exec(str)) !== null) {
    paintRange(levels, tips, m.index, m.index + m[0].length, 3, TOOLTIPS.ipv4);
    factors.push("Contains an IPv4-style address.");
  }

  // userinfo@host (scheme://user@host)
  const protoMatch = str.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)\/\/([^/?#]*)/);
  if (protoMatch) {
    const authStart = protoMatch.index + protoMatch[1].length + 2;
    const authority = protoMatch[2];
    const at = authority.indexOf("@");
    if (at !== -1) {
      paintRange(levels, tips, authStart, authStart + at + 1, 3, TOOLTIPS.userinfo);
      factors.push("Uses '@' in the authority (possible credential-style obfuscation).");

      const afterAt = authority.slice(at + 1);
      const host = afterAt.split(":")[0];
      if (host && host.split(".").filter(Boolean).length > 4) {
        const hostStart = str.indexOf(host, authStart + at + 1);
        if (hostStart >= 0) {
          paintRange(levels, tips, hostStart, hostStart + host.length, 2, TOOLTIPS.manyDots);
          factors.push("Hostname has many dot-separated labels.");
        }
      }
    }
  }

  // No @: still flag hostname with many dots via URL parser
  if (protoMatch && protoMatch[2].indexOf("@") === -1) {
    try {
      const u = new URL(str);
      const h = u.hostname;
      if (h && h.split(".").filter(Boolean).length > 4) {
        const hs = str.indexOf(h);
        if (hs >= 0) {
          paintRange(levels, tips, hs, hs + h.length, 2, TOOLTIPS.manyDots);
          factors.push("Hostname has many dot-separated labels.");
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Long URL tail
  if (str.length > 85) {
    const tailStart = Math.min(55, Math.floor(str.length * 0.35));
    paintRange(levels, tips, tailStart, str.length, 2, TOOLTIPS.longUrl);
    factors.push("URL is very long.");
  } else if (str.length > 55) {
    factors.push("URL length is elevated.");
  }

  const dotCount = (str.match(/\./g) || []).length;
  if (dotCount > 5 && factors.every((f) => !f.includes("dot-separated"))) {
    factors.push(`High dot count (${dotCount}) across the string.`);
  }

  const uniqueFactors = [...new Set(factors)];
  let whySummary;
  if (pred === "safe" && uniqueFactors.length === 0) {
    whySummary =
      "No strong structural red flags were found in this scan: no credential-style '@' pattern, no IPv4 literal, and length/dot signals were mild. This does not guarantee safety—always verify the real domain and context.";
  } else if (uniqueFactors.length === 0) {
    whySummary =
      "The model still raised concern from its aggregate score. Review the analysis log and hover highlights below for anything that was flagged in the raw string.";
  } else {
    whySummary = uniqueFactors.join(" ");
  }

  const segments = coalesceSegments(str, levels, tips);

  return { whyTitle, whySummary, segments, factors: uniqueFactors };
}

export function segmentClassName(level) {
  const focus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 focus-visible:ring-offset-1 focus-visible:ring-offset-black/80";
  if (level >= 3) {
    return `cursor-help rounded-sm bg-red-500/35 px-0.5 text-red-100 underline decoration-red-400/60 decoration-dotted underline-offset-2 [box-shadow:0_0_12px_rgba(248,113,113,0.25)] ${focus}`;
  }
  if (level >= 2) {
    return `cursor-help rounded-sm bg-amber-500/25 px-0.5 text-amber-100 underline decoration-amber-400/50 decoration-dotted underline-offset-2 [box-shadow:0_0_10px_rgba(251,191,36,0.15)] ${focus}`;
  }
  return "text-slate-300";
}
