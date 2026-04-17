import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function colorForScore(score) {
  if (score >= 70) return "red";
  if (score >= 40) return "orange";
  return "green";
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState({
    verdict: "—",
    score: 0,
    reasons: [{ message: "Paste a URL to scan." }]
  });
  const [history, setHistory] = useLocalStorageState("url.history", []);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const examples = useMemo(() => [
    "https://example.com/login",
    "http://192.168.1.10/secure/update",
    "paypal.com.verify-account.security-alert.xyz/login",
    "https://xn--pple-43d.com/security",
  ], []);

  // 🔥 BACKEND CALL
  function runScan(value) {
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: value })
    })
    .then(async res => {
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log(data);

      const formatted = {
        verdict: data.prediction,
        score: Math.round(data.confidence * 100),
        reasons: data.reasons.length
          ? data.reasons.map(r => ({ message: r }))
          : [{ message: "No suspicious patterns found." }]
      };

      setResult(formatted);

      const item = {
        id: Date.now(),
        at: new Date().toISOString(),
        input: value,
        verdict: data.prediction,
        score: Math.round(data.confidence * 100),
      };

      setHistory(prev => [item, ...prev].slice(0, 10));
    })
    .catch(err => {
      console.error(err);
      setResult({
        verdict: "Error",
        score: 0,
        reasons: [{ message: err.message || "Backend not reachable" }]
      });
    })
    .finally(() => {
      setLoading(false);
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    runScan(input);
  }

  function useExample(x) {
    setInput(x);
    runScan(x);
    inputRef.current?.focus();
  }

  function clearHistory() {
    setHistory([]);
  }

  const barWidth = `${clamp(result.score, 0, 100)}%`;
  const color = colorForScore(result.score);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🔐 Phishing URL Detector</h1>

      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter URL"
          style={{ width: "300px", padding: "8px" }}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          {loading ? "Scanning..." : "Scan"}
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <h2 style={{ color }}>{result.verdict}</h2>
        <p>Score: {result.score}/100</p>

        <div style={{ width: "100%", height: "10px", background: "#ccc" }}>
          <div style={{
            width: barWidth,
            height: "100%",
            background: color
          }} />
        </div>

        <ul>
          {result.reasons.map((r, i) => (
            <li key={i}>{r.message}</li>
          ))}
        </ul>
      </div>

      <h3>Recent Scans</h3>
      <button onClick={clearHistory}>Clear</button>

      {history.map(h => (
        <div key={h.id}>
          <p>{h.input}</p>
          <p>{h.verdict} ({h.score})</p>
        </div>
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);