const { useEffect, useMemo, useRef, useState } = React;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeInput(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  // Allow users to paste without scheme; assume https.
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function safeUrlParse(raw) {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function isLikelyIpHost(hostname) {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return true;
  // IPv6 (very permissive; URL.hostname strips brackets)
  if (/^[0-9a-fA-F:]+$/.test(hostname) && hostname.includes(":")) return true;
  return false;
}

function looksLikePunycode(hostname) {
  return hostname.includes("xn--");
}

function countSubdomains(hostname) {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return 0;
  return parts.length - 2;
}

function extractBaseDomain(hostname) {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

function hasMixedScriptChars(s) {
  // Fast heuristic: presence of both basic Latin letters and non-ASCII.
  const hasAsciiLetters = /[A-Za-z]/.test(s);
  const hasNonAscii = /[^\x00-\x7F]/.test(s);
  return hasAsciiLetters && hasNonAscii;
}

function analyzeUrl(rawInput) {
  const input = (rawInput || "").trim();
  const normalized = normalizeInput(input);
  const u = safeUrlParse(normalized);

  if (!input) {
    return {
      ok: false,
      normalized,
      verdict: "—",
      score: 0,
      reasons: [{ code: "EMPTY", weight: 0, message: "Paste a URL to scan." }],
    };
  }

  if (!u) {
    return {
      ok: false,
      normalized,
      verdict: "Invalid URL",
      score: 100,
      reasons: [
        {
          code: "INVALID",
          weight: 100,
          message:
            "This doesn't look like a valid URL. Include a domain (e.g. example.com) and avoid spaces.",
        },
      ],
    };
  }

  const hostname = (u.hostname || "").toLowerCase();
  const full = u.href;
  const pathAndQuery = `${u.pathname || ""}${u.search || ""}${u.hash || ""}`;

  const reasons = [];

  function add(code, weight, message) {
    reasons.push({ code, weight, message });
  }

  // High signal red flags
  if (full.includes("@")) add("AT_SIGN", 22, "Contains '@' which is often used to confuse users about the real host.");
  if (hostname.includes("--")) add("DOUBLE_HYPHEN", 10, "Has double hyphens in hostname (often seen in lookalikes).");
  if (looksLikePunycode(hostname)) add("PUNYCODE", 18, "Uses punycode (xn--) which can hide lookalike Unicode domains.");
  if (hasMixedScriptChars(u.hostname)) add("MIXED_SCRIPT", 16, "Hostname contains mixed character sets (possible homograph).");
  if (isLikelyIpHost(hostname)) add("IP_HOST", 25, "Uses an IP address as the host (common in phishing links).");

  // Protocol / transport
  if (u.protocol !== "https:") add("NOT_HTTPS", 10, `Uses ${u.protocol.replace(":", "").toUpperCase()} instead of HTTPS.`);

  // Length & structure heuristics
  if (full.length >= 120) add("VERY_LONG", 12, "Very long URL (more room to hide deceptive parts).");
  else if (full.length >= 80) add("LONG", 7, "Long URL (can be used to obscure the real destination).");

  const subCount = countSubdomains(hostname);
  if (subCount >= 3) add("MANY_SUBDOMAINS", 14, `Has many subdomains (${subCount}).`);
  else if (subCount === 2) add("MULTI_SUBDOMAIN", 7, "Has multiple subdomains.");

  if ((u.search || "").length >= 80) add("LONG_QUERY", 8, "Long query string (common with tracking or obfuscation).");
  if (pathAndQuery.includes("//")) add("DOUBLE_SLASH", 6, "Contains '//' in path/query, sometimes used for confusion.");

  // Brand bait / urgent keywords (light weight)
  const baitWords = [
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "password",
    "billing",
    "invoice",
    "support",
    "confirm",
    "wallet",
    "bank",
    "payment",
    "signin",
    "webscr",
    "security",
  ];
  const lowerFull = full.toLowerCase();
  const baitHits = baitWords.filter((w) => lowerFull.includes(w));
  if (baitHits.length >= 3) add("BAIT_WORDS", 10, `Contains multiple high-pressure keywords: ${baitHits.slice(0, 5).join(", ")}.`);
  else if (baitHits.length === 2) add("BAIT_WORDS", 6, `Contains keywords often used in phishing: ${baitHits.join(", ")}.`);
  else if (baitHits.length === 1) add("BAIT_WORDS", 3, `Contains keyword often used in phishing: ${baitHits[0]}.`);

  // Suspicious TLDs (very light — false positives possible)
  const suspiciousTlds = new Set(["zip", "mov", "top", "xyz", "click", "cam", "country", "stream", "gq", "tk"]);
  const tld = hostname.split(".").filter(Boolean).slice(-1)[0] || "";
  if (tld && suspiciousTlds.has(tld)) add("SUSP_TLD", 8, `Top-level domain ".${tld}" is commonly abused in spam/phishing.`);

  // "Base domain mismatch" hint: too many dots or unusual base
  const base = extractBaseDomain(hostname);
  if (base && base.length >= 20) add("WEIRD_BASE", 6, "Base domain is unusually long (possible random lookalike).");

  // Aggregate score
  const rawScore = reasons.reduce((sum, r) => sum + r.weight, 0);
  const score = clamp(rawScore, 0, 100);

  let verdict;
  if (score >= 70) verdict = "High Risk";
  else if (score >= 40) verdict = "Suspicious";
  else verdict = "Likely Safe";

  // Sort reasons by weight desc for readability
  reasons.sort((a, b) => b.weight - a.weight);

  // Ensure at least one positive explanation
  if (reasons.length === 0) {
    reasons.push({ code: "NO_FLAGS", weight: 0, message: "No common phishing patterns detected by these heuristics." });
  }

  return {
    ok: true,
    normalized: u.href,
    verdict,
    score,
    hostname,
    reasons,
  };
}

function colorForScore(score) {
  if (score >= 70) return "bad";
  if (score >= 40) return "warn";
  return "good";
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState];
}

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(analyzeUrl(""));
  const [history, setHistory] = useLocalStorageState("urlSpamDetector.history", []);
  const inputRef = useRef(null);

  const examples = useMemo(
    () => [
      "https://example.com/login",
      "http://192.168.1.10/secure/update",
      "paypal.com.verify-account.security-alert.xyz/login",
      "https://xn--pple-43d.com/security",
    ],
    []
  );

  function runScan(value) {
    const res = analyzeUrl(value);
    setResult(res);
    if (res.ok) {
      const item = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        at: new Date().toISOString(),
        input: value.trim(),
        normalized: res.normalized,
        verdict: res.verdict,
        score: res.score,
      };
      setHistory((prev) => [item, ...(prev || [])].slice(0, 12));
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    runScan(input);
  }

  function useExample(x) {
    setInput(x);
    runScan(x);
    inputRef.current?.focus?.();
  }

  function clearHistory() {
    setHistory([]);
  }

  const verdictClass = colorForScore(result.score);
  const barWidth = `${clamp(result.score, 0, 100)}%`;

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">URL Spam / Phishing Detector</h1>
          <p className="subtitle">
            Paste a link and get an <span className="mono">explainable</span> risk score based on common phishing patterns
            (client-side heuristics). For production, connect this UI to your ML/model API.
          </p>
        </div>
        <div className="pill">
          <strong>MODE</strong>
          <span>Client-side scan</span>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">Scan a URL</h2>
          </div>
          <div className="cardBody">
            <form onSubmit={onSubmit}>
              <div className="inputRow">
                <input
                  ref={inputRef}
                  className="urlInput"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste a URL (e.g. https://example.com)"
                  autoComplete="off"
                  spellCheck={false}
                  inputMode="url"
                />
                <button className="btn" type="submit" disabled={!input.trim()}>
                  Scan URL
                </button>
                <button className="btn btnSecondary" type="button" onClick={() => (setInput(""), setResult(analyzeUrl("")))}>
                  Reset
                </button>
              </div>

              <div className="helperRow" role="list" aria-label="Examples">
                {examples.map((x) => (
                  <button key={x} type="button" className="chip" onClick={() => useExample(x)}>
                    Try: <span className="mono">{x}</span>
                  </button>
                ))}
              </div>
            </form>

            <div style={{ marginTop: 14 }}>
              <div className="verdict">
                <div className="verdictLeft">
                  <div className="verdictLabel">Verdict</div>
                  <div className="verdictValue" style={{ color: verdictClass === "bad" ? "var(--bad)" : verdictClass === "warn" ? "var(--warn)" : "var(--good)" }}>
                    {result.verdict}
                  </div>
                </div>
                <div className="score">SCORE: {result.score}/100</div>
              </div>
              <div className="bar" aria-label="Risk score bar">
                <div style={{ width: barWidth }} />
              </div>

              <ul className="reasonList">
                {result.reasons.map((r, idx) => (
                  <li className="reason" key={`${r.code}-${idx}`}>
                    <div className="tag">{r.code}</div>
                    <div className="reasonText">
                      {r.message}
                      {typeof r.weight === "number" && r.weight > 0 ? (
                        <>
                          {" "}
                          <span className="muted">(+{r.weight})</span>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="smallMuted">
                Tip: if you paste <span className="mono">google.com</span> without a scheme, it will be treated as{" "}
                <span className="mono">https://google.com</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <div className="row">
              <h2 className="cardTitle">Recent scans</h2>
              <button className="btn btnSecondary" type="button" onClick={clearHistory} disabled={!history?.length}>
                Clear
              </button>
            </div>
          </div>
          <div className="cardBody">
            <div className="history">
              {!history?.length ? (
                <div className="smallMuted">No scans yet. Run a scan to see it here.</div>
              ) : (
                history.map((h) => (
                  <div className="historyItem" key={h.id}>
                    <div className="historyTop">
                      <div className="historyUrl" title={h.normalized}>
                        {h.normalized}
                      </div>
                      <div className="historyMeta">
                        <span className={`badge ${colorForScore(h.score)}`}>{h.score}/100</span>
                      </div>
                    </div>
                    <div className="row">
                      <span className="smallMuted" style={{ margin: 0 }}>
                        {h.verdict} · {new Date(h.at).toLocaleString()}
                      </span>
                      <button className="btn btnSecondary" type="button" onClick={() => useExample(h.input)}>
                        Re-scan
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="footer">
              Want ML-based detection? Tell me what you have (Python model, Node API, Flask/FastAPI, etc.) and I’ll connect
              this UI to an endpoint like <span className="mono">POST /scan</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

