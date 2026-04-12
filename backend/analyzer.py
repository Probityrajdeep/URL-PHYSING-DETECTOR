"""URL feature extraction and rule-based prediction for POST /predict."""

from __future__ import annotations

import re
from typing import Any

# IPv4 in URL or host-like context
_IPV4_RE = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
)


def normalize_input(raw: str) -> str:
    trimmed = (raw or "").strip()
    if not trimmed:
        return ""
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", trimmed):
        return f"https://{trimmed}"
    return trimmed


def extract_features(url: str) -> dict[str, Any]:
    """Extract the four required features from the raw URL string."""
    s = (url or "").strip()
    return {
        "url_length": len(s),
        "dot_count": s.count("."),
        "has_at": "@" in s,
        "has_ip": bool(_IPV4_RE.search(s)),
    }


def _risk_score(features: dict[str, Any]) -> int:
    """Map features to a 0–100 risk score (higher = more dangerous)."""
    score = 0
    length = features["url_length"]
    dots = features["dot_count"]

    if features["has_at"]:
        score += 45
    if features["has_ip"]:
        score += 45

    if length > 120:
        score += 18
    elif length > 85:
        score += 12
    elif length > 55:
        score += 6

    if dots > 8:
        score += 20
    elif dots > 5:
        score += 12
    elif dots > 3:
        score += 6

    return min(100, score)


def _confidence_from_score(score: int) -> float:
    """Higher when score is far from the middle (clear Safe vs clear Phishing)."""
    return round(min(0.99, max(0.5, 0.55 + abs(score - 50) / 130)), 2)


def _build_reasons(features: dict[str, Any], score: int) -> list[str]:
    length = features["url_length"]
    dots = features["dot_count"]
    has_at = features["has_at"]
    has_ip = features["has_ip"]

    reasons: list[str] = [
        f"URL length: {length} characters."
        + (
            " Very long URLs can hide malicious segments."
            if length > 85
            else (" Moderate length." if length > 45 else "")
        ),
        f"Number of dots: {dots}."
        + (
            " Many dots often indicate nested subdomains or look-alike hosts."
            if dots > 5
            else (" Several dot separators." if dots > 3 else "")
        ),
    ]

    if has_at:
        reasons.append(
            "'@' symbol is present. Attackers use this to mask the real host the browser connects to."
        )
    else:
        reasons.append("No '@' symbol detected (typical for standard links).")

    if has_ip:
        reasons.append(
            "IP address pattern detected (IPv4). Phishing links often use raw IPs instead of domain names."
        )
    else:
        reasons.append("No IPv4 address pattern detected in the URL string.")

    reasons.append(f"Aggregate risk score from these features: {score}/100.")

    return [r.strip() for r in reasons if r.strip()]


def analyze_url(raw_input: str) -> dict[str, Any]:
    """
    Analyze URL using only: length, dot count, '@', IP presence.
    Returns prediction, confidence, reasons, plus score/normalized_url for clients.
    """
    input_s = (raw_input or "").strip()

    if not input_s:
        return {
            "prediction": "Suspicious",
            "confidence": 0.0,
            "reasons": [
                "URL is empty.",
                "URL length: 0 characters.",
                "No features could be extracted.",
            ],
            "score": 0,
            "normalized_url": "",
            "features": {"url_length": 0, "dot_count": 0, "has_at": False, "has_ip": False},
        }

    features = extract_features(input_s)
    score = _risk_score(features)

    if score >= 65:
        prediction = "Phishing"
    elif score >= 28:
        prediction = "Suspicious"
    else:
        prediction = "Safe"

    confidence = _confidence_from_score(score)
    reasons = _build_reasons(features, score)

    normalized = normalize_input(input_s)

    return {
        "prediction": prediction,
        "confidence": confidence,
        "reasons": reasons,
        "score": score,
        "normalized_url": normalized,
        "features": features,
    }
