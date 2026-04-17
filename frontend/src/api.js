import axios from "axios";

/**
 * Base URL for the Flask API.
 * - Dev: Vite proxies `/api` → `http://127.0.0.1:5000`, so requests hit `/api/predict` → Flask `/predict`.
 * - Prod: set `VITE_API_URL` (e.g. `https://api.example.com`) — no trailing slash.
 */
function apiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw && String(raw).trim()) {
    return String(raw).replace(/\/$/, "");
  }
  return "https://url-physing-detector.onrender.com";;
}

const client = axios.create({
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
  validateStatus: (status) => status < 500,
});

/**
 * Normalize and validate Flask `POST /predict` JSON body.
 * @param {unknown} data
 */
function normalizePredictResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Empty or invalid JSON from server.");
  }
  const prediction = data.prediction;
  if (typeof prediction !== "string" || !prediction.trim()) {
    throw new Error("Server response missing a valid prediction.");
  }
  let reasons = data.reasons;
  if (!Array.isArray(reasons)) {
    reasons = [];
  }
  reasons = reasons.map((r) => (typeof r === "string" ? r : String(r ?? ""))).filter(Boolean);

  return {
    prediction: prediction.trim(),
    confidence: typeof data.confidence === "number" && !Number.isNaN(data.confidence) ? data.confidence : null,
    reasons,
    score: typeof data.score === "number" && !Number.isNaN(data.score) ? data.score : undefined,
    normalized_url:
      typeof data.normalized_url === "string" && data.normalized_url.trim() ? data.normalized_url.trim() : undefined,
  };
}

/**
 * Calls Flask `POST /predict` with `{ url }`.
 * @param {string} url
 * @returns {Promise<{ prediction: string, confidence: number | null, reasons: string[], score?: number, normalized_url?: string }>}
 */
export async function predictUrl(url) {
  const { data, status } = await client.post(`${apiBase()}/predict`, { url });

  if (status === 400 || status === 422) {
    const msg =
      (data && typeof data === "object" && typeof data.error === "string" && data.error.trim()) ||
      "Invalid request.";
    const err = new Error(msg);
    err.status = status;
    err.payload = data;
    throw err;
  }

  if (status !== 200) {
    const err = new Error(`Server returned ${status}.`);
    err.status = status;
    err.payload = data;
    throw err;
  }

  return normalizePredictResponse(data);
}

/**
 * User-facing message for failed scans (network, timeout, 4xx/5xx).
 * @param {unknown} err
 */
export function formatAxiosError(err) {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : "Something went wrong.";
  }

  if (err.code === "ECONNABORTED") {
    return "Request timed out. Is the Flask API running on port 5000?";
  }

  if (err.code === "ERR_NETWORK" || !err.response) {
    return "Cannot reach the API. Run the backend (`python app.py` in /backend) and use Vite dev server so /api proxies to it.";
  }

  const status = err.response.status;
  const data = err.response.data;

  if (data && typeof data === "object") {
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error.trim();
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
  }

  if (status >= 500) {
    return "Server error. Check Flask logs and try again.";
  }

  return `Request failed (${status}).`;
}
