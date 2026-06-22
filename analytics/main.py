import schedule
import time

from detections.brute_force import detect_brute_force
from detections.port_scan import detect_port_scan
from detections.privilege_escalation import detect_privilege_escalation
from detections.suspicious_login import detect_suspicious_login
from detections.lateral_movement import detect_lateral_movement
from detections.suspicious_process import detect_suspicious_process
from ml.isolation_forest import run_ml_detection


def run_all_detections():
    print("\n===== Running Detection Engine =====")

    detect_brute_force()
    detect_port_scan()
    detect_privilege_escalation()
    detect_suspicious_login()
    detect_lateral_movement()
    detect_suspicious_process()
    run_ml_detection()

    print("===== Detection Cycle Complete =====")


#schedule.every(60).seconds.do(run_all_detections)

print("SIEM Analytics Engine Started...")

run_all_detections()

#while True:
#   schedule.run_pending()
#   time.sleep(1)