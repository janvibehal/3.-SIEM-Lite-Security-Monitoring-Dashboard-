import json
from collections import defaultdict

def detect_lateral_movement():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    user_ips = defaultdict(set)

    for log in logs:
        if log.get("event_type") == "network_access":
            user = log.get("user")
            ip = log.get("ip")

            user_ips[user].add(ip)

    for user, ips in user_ips.items():
        if len(ips) > 2:
            print("\n🚨 ALERT: Possible Lateral Movement")
            print(f"User: {user}")
            print(f"Systems Accessed: {len(ips)}")