import { LogsIntegration } from "../../models/logs_integration.js";
import { stateTypes } from "../../shared/stateTypes.js";
import { syncTypes } from "../../shared/syncTypes.js";
import { getDateTimeNow } from "../utils/dateTime.js";

export const getLastSync = async (syncType, table) => {
  let logsIntegration = new LogsIntegration();
  const lastSync = await logsIntegration.findLastSync(syncType, table);

  const logId = await logsIntegration.createSync(
    table,
    syncType,
    stateTypes.inProgress
  );
  if (!lastSync && syncType == syncTypes.created) {
    await logsIntegration.createSync(
      table,
      syncTypes.updated,
      stateTypes.success
    );
  }
  logsIntegration = null;
  return { lastSync, logId };
};

export const updateLog = async (logId, stateType) => {
  let logsIntegration = new LogsIntegration();
  logsIntegration.updateSync(logId, stateType);
  logsIntegration = null;
};
