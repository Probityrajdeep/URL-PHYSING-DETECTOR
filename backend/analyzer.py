"""URL feature extraction and rule-based prediction for POST /predict."""

from __future__ import annotations

import re
from typing import Any

# IPv4 in URL or host-like context
_IPV4_RE = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
)

# Suspicious path/host keywords often used in phishing lures
_SUSPICIOUS_PATTERNS = [
    r"verify-?account",
    r"secure-?login",
    r"account-?(?:locked|suspended|limited)",
    r"update-?payment",
    r"confirm-?identity",
    r"wallet-?connect",
    r"sign-?in-?required",
    r"paypa[l1]",
    r"amaz[o0]n",
    r"app1e",
    r"micros[o0]ft",
    r"bit\.ly|tinyurl|goo\.gl|t\.co",
    r"customer-?support-?\d+",
]
_SUSPICIOUS_RE = re.compile("|".join(f"(?:{p})" for p in _SUSPICIOUS_PATTERNS), re.IGNORECASE)

# Non-alphanumeric characters in URL (excluding common URL punctuation)
_SPECIAL_CHAR_RE = re.compile(r"[^a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]")


def normalize_input(raw: str) -> str:
    trimmed = (raw or "").strip()
    if not trimmed:
        return ""
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", trimmed):
        return f"https://{trimmed}"
    return trimmed


def extract_features(url: str) -> dict[str, Any]:
    """Extract rule-based features from the raw URL string."""
    s = (url or "").strip()
    special_matches = _SPECIAL_CHAR_RE.findall(s)
    suspicious_hits = len(_SUSPICIOUS_RE.findall(s))
    return {
        "url_length": len(s),
        "dot_count": s.count("."),
        "has_at": "@" in s,
        "has_ip": bool(_IPV4_RE.search(s)),
        "special_char_count": len(special_matches),
        "suspicious_pattern_hits": suspicious_hits,
    }


def _risk_score(features: dict[str, Any]) -> int:
    """Map features to a 0–100 risk score (higher = more dangerous)."""
    score = 0
    length = features["url_length"]
    dots = features["dot_count"]
    special_n = features.get("special_char_count", 0)
    sus_hits = features.get("suspicious_pattern_hits", 0)

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

    if special_n > 12:
        score += 16
    elif special_n > 6:
        score += 10
    elif special_n > 2:
        score += 4

    score += min(40, sus_hits * 18)

    return min(100, score)


def _confidence_from_score(score: int) -> float:
    """Higher when score is far from the middle (clear Safe vs clear Phishing)."""
    return round(min(0.99, max(0.5, 0.55 + abs(score - 50) / 130)), 2)


def _build_reasons(features: dict[str, Any], score: int) -> list[str]:
    length = features["url_length"]
    dots = features["dot_count"]
    has_at = features["has_at"]
    has_ip = features["has_ip"]
    special_n = features.get("special_char_count", 0)
    sus_hits = features.get("suspicious_pattern_hits", 0)

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

    reasons.append(
        f"Special / unusual characters: {special_n}."
        + (
            " High counts may indicate encoding tricks or homoglyphs."
            if special_n > 6
            else (" A few unusual symbols detected." if special_n > 2 else " Within a typical range.")
        )
    )

    reasons.append(
        f"Suspicious keyword patterns matched: {sus_hits}."
        + (
            " Common phishing lures (e.g. verify-account, brand typos, shorteners)."
            if sus_hits > 0
            else " No known lure keywords detected in the raw string."
        )
    )

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
    Analyze URL with rule-based features: length, dots, '@', IP, special chars, lure patterns.
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
            "features": {
                "url_length": 0,
                "dot_count": 0,
                "has_at": False,
                "has_ip": False,
                "special_char_count": 0,
                "suspicious_pattern_hits": 0,
            },
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
