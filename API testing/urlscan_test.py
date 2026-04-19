import requests
import time

API_KEY = "019da533-fa3a-71a9-b1a8-5e3b6095721b"
url_to_scan = "https://dodi-repacks.site/"

submit_url = "https://urlscan.io/api/v1/scan/"

headers = {
    "API-Key": API_KEY,
    "Content-Type": "application/json"
}

data = {
    "url": url_to_scan,
    "visibility": "public"
}

print("Submitting scan...")
response = requests.post(submit_url, headers=headers, json=data)

if response.status_code != 200:
    print("❌ Error submitting scan:", response.text)
    exit()

result = response.json()
scan_uuid = result["uuid"]

print("✅ Scan submitted!")
print("UUID:", scan_uuid)

# 🔥 LOOP UNTIL READY
result_url = f"https://urlscan.io/api/v1/result/{scan_uuid}/"

print("\n⏳ Waiting for scan to complete...")

while True:
    report = requests.get(result_url)

    if report.status_code == 200:
        break
    elif report.status_code == 404:
        print("Still processing... waiting 5 sec")
        time.sleep(5)
    else:
        print("❌ Unexpected error:", report.text)
        exit()

data = report.json()

# 📊 RESULT
page = data.get("page", {})
verdicts = data.get("verdicts", {}).get("overall", {})

print("\n📊 SCAN RESULT")
print("URL:", page.get("url"))
print("Domain:", page.get("domain"))
print("IP:", page.get("ip"))

print("\n⚠️ Threat Info:")
print("Malicious:", verdicts.get("malicious"))
print("Score:", verdicts.get("score"))

# 🧠 Prediction
if verdicts.get("malicious"):
    prediction = "Phishing"
elif verdicts.get("score", 0) > 50:
    prediction = "Suspicious"
else:
    prediction = "Safe"

print("\n🧠 Final Prediction:", prediction)

print("\n🔗 Full Report:")
print(f"https://urlscan.io/result/{scan_uuid}/")