import json

def detect_privilege_escalation():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    for log in logs:
        if log.get("event_type") == "privilege_escalation":
            print("\n🚨 ALERT: Privilege Escalation Detected")
            print(f"User: {log.get('user')}")