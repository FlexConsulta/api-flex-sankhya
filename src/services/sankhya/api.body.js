import { syncTypes } from "../../shared/syncTypes.js";

export const requestBodyDrivers = (syncType, lastSync) => {
  const where = lastSync
    ? syncType == syncTypes.created
      ? `AND DTCAD >= TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
      : `AND DATAFLEX >= TO_DATE('${lastSync}', 'dd/mm/yyyy HH24:MI:SS')`
    : ` `;

  return {
    requestBody: {
      sql: `SELECT NOMEPARC, CGC_CPF, CNH, STATUS, DTCAD, DATAFLEX FROM AD_VWTBCFLEXMOT WHERE CGC_CPF IS NOT NULL ${where}`,
    },
  };
};
