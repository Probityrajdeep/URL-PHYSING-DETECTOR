import requests
import time

API_KEY = "38378d3b074d02562e22c5abc117356c42c4986c96a50f412b687cd2ce858fbe"

# URL you want to test
url = "http://125.41.228.146:57103/i"

# Step 1: Submit URL
submit_url = "https://www.virustotal.com/api/v3/urls"

headers = {
    "x-apikey": API_KEY
}

data = {
    "url": url
}

response = requests.post(submit_url, headers=headers, data=data)

if response.status_code != 200:
    print("Error submitting URL:", response.text)
    exit()

# Get analysis ID
analysis_id = response.json()["data"]["id"]
print("Submitted! Analysis ID:", analysis_id)

# Step 2: Wait a bit (VirusTotal needs time)
time.sleep(10)

# Step 3: Get result
report_url = f"https://www.virustotal.com/api/v3/analyses/{analysis_id}"

report = requests.get(report_url, headers=headers)

if report.status_code != 200:
    print("Error fetching report:", report.text)
    exit()

result = report.json()

# Extract useful info
stats = result["data"]["attributes"]["stats"]

print("\n🔍 Scan Results:")
print("Malicious:", stats.get("malicious", 0))
print("Suspicious:", stats.get("suspicious", 0))
print("Harmless:", stats.get("harmless", 0))
print("Undetected:", stats.get("undetected", 0))