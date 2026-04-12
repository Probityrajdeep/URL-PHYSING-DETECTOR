from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS

from analyzer import analyze_url

app = Flask(__name__)
# Allow browser requests from the Vite dev server or any deployed frontend
CORS(app, resources={r"/*": {"origins": "*"}})


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    """
    JSON body: { "url": "<string>" }
    JSON response: { "prediction", "confidence", "reasons" }
    """
    data = request.get_json(silent=True) or {}
    url = data.get("url")

    if url is None:
        return (
            jsonify(
                {
                    "error": "Missing required field: url",
                    "prediction": None,
                    "confidence": None,
                    "reasons": [],
                }
            ),
            400,
        )

    if not isinstance(url, str):
        return (
            jsonify(
                {
                    "error": "Field 'url' must be a string",
                    "prediction": None,
                    "confidence": None,
                    "reasons": [],
                }
            ),
            400,
        )

    result = analyze_url(url)

    payload = {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "reasons": result["reasons"],
        # Optional extras for UIs (not required by the core contract)
        "score": result.get("score"),
        "normalized_url": result.get("normalized_url") or None,
    }

    return jsonify(payload)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
