import json
from collections import defaultdict

def detect_suspicious_login():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    user_locations = defaultdict(set)

    for log in logs:
        if log.get("event_type") == "login_success":
            user = log.get("user")
            location = log.get("location")

            user_locations[user].add(location)

    for user, locations in user_locations.items():
        if len(locations) > 1:
            print("\n🚨 ALERT: Suspicious Login")
            print(f"User: {user}")
            print(f"Locations: {', '.join(locations)}")