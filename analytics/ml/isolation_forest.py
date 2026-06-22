import numpy as np
from sklearn.ensemble import IsolationForest

def run_ml_detection():

    data = np.array([
        [10],
        [12],
        [11],
        [13],
        [15],
        [200]
    ])

    model = IsolationForest(
        contamination=0.1,
        random_state=42
    )

    predictions = model.fit_predict(data)

    anomalies = data[predictions == -1]

    print("\n===== ML Detection =====")

    if len(anomalies) > 0:
        print("🚨 Anomaly Detected")
        print("Anomalous Values:", anomalies.flatten())