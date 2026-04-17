from __future__ import annotations
import os
import re
from urllib.parse import urlparse

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Allow all origins (for development & hackathon)
CORS(app)


# =========================
# 🧠 URL ANALYSIS FUNCTION
# =========================
def analyze_url(url: str):
    reasons = []
    score = 0

    # Normalize URL
    if not url.startswith("http"):
        url = "http://" + url

    parsed = urlparse(url)
    domain = parsed.netloc

    # Rule 1: Long URL
    if len(url) > 75:
        reasons.append("URL is too long (suspicious)")
        score += 1

    # Rule 2: Too many dots
    if domain.count(".") > 3:
        reasons.append("Too many subdomains")
        score += 1

    # Rule 3: Contains @
    if "@" in url:
        reasons.append("Contains '@' symbol (possible phishing)")
        score += 2

    # Rule 4: Contains IP address
    if re.match(r"\d+\.\d+\.\d+\.\d+", domain):
        reasons.append("Uses IP address instead of domain")
        score += 2

    # Rule 5: Suspicious keywords
    suspicious_words = ["login", "verify", "secure", "update", "bank"]
    if any(word in url.lower() for word in suspicious_words):
        reasons.append("Contains suspicious keywords")
        score += 1

    # =========================
    # FINAL DECISION
    # =========================
    if score >= 4:
        prediction = "Phishing"
        confidence = 90
    elif score >= 2:
        prediction = "Suspicious"
        confidence = 65
    else:
        prediction = "Safe"
        confidence = 90

    return {
        "prediction": prediction,
        "confidence": confidence,
        "reasons": reasons,
        "score": score,
        "normalized_url": url,
    }


# =========================
# ROUTES
# =========================

@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}
    url = data.get("url")

    if not url:
        return jsonify({
            "error": "Missing URL",
            "prediction": None,
            "confidence": None,
            "reasons": []
        }), 400

    result = analyze_url(url)

    return jsonify(result)


# =========================
# RUN SERVER (RENDER FIX)
# =========================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)