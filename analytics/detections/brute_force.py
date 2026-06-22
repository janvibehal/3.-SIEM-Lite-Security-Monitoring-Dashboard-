import json
from collections import defaultdict

def detect_brute_force():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    failed_attempts = defaultdict(int)

    for log in logs:
        if log.get("event_type") == "login_failed":
            ip = log.get("ip")
            failed_attempts[ip] += 1

    for ip, count in failed_attempts.items():
        if count > 5:
            print("\n🚨 ALERT: Possible Brute Force Attack")
            print(f"IP Address: {ip}")
            print(f"Failed Attempts: {count}")