import json

def detect_suspicious_process():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    suspicious_processes = [
        "mimikatz.exe",
        "powershell.exe"
    ]

    for log in logs:
        if log.get("event_type") == "process_start":
            process = log.get("process")

            if process in suspicious_processes:
                print("\n🚨 ALERT: Suspicious Process Detected")
                print(f"Process: {process}")