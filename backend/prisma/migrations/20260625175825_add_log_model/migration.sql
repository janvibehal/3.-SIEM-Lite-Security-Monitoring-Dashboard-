-- CreateIndex
CREATE INDEX "Log_deviceId_idx" ON "Log"("deviceId");

-- CreateIndex
CREATE INDEX "Log_severity_idx" ON "Log"("severity");

-- CreateIndex
CREATE INDEX "Log_source_idx" ON "Log"("source");

-- CreateIndex
CREATE INDEX "Log_eventTimestamp_idx" ON "Log"("eventTimestamp");
