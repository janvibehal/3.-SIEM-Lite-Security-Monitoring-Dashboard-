import json
from collections import defaultdict

def detect_port_scan():
    with open("logs.json", "r") as file:
        logs = json.load(file)

    scanned_ports = defaultdict(set)

    for log in logs:
        if log.get("event_type") == "port_scan":
            ip = log.get("ip")
            port = log.get("port")

            scanned_ports[ip].add(port)

    for ip, ports in scanned_ports.items():
        if len(ports) >= 3:
            print("\n🚨 ALERT: Possible Port Scan Attack")
            print(f"IP Address: {ip}")
            print(f"Ports Scanned: {len(ports)}")