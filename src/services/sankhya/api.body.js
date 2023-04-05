import { syncTypes } from "../../shared/syncTypes.js";

const getDataFim = (lastSync) => {
  const newDate = new Date(lastSync);
  let data_fim = new Date(newDate.setDate(newDate.getDate() + 1));
  const currentDate = new Date();
  if (data_fim >= currentDate) data_fim = currentDate;
  return data_fim;
};

export const requestBodyDrivers = (syncType, lastSync, dWhere = null) => {
  let where;
  if (dWhere) {
    where = `AND CGC_CPF = '${dWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);

    where = lastSync
      ? syncType == syncTypes.created
        ? `AND DTCAD >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DTCAD <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
        : `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
      : ` `;
  }

  return {
    requestBody: {
      // sql: `SELECT * FROM AD_VWTBCFLEXMOT WHERE CGC_CPF = '51038080134'`,
      sql: `SELECT * FROM AD_VWTBCFLEXMOT WHERE CGC_CPF IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyOwners = (syncType, lastSync, pWhere = null) => {
  let where;
  if (pWhere) {
    where = `AND CGC_CPF = '${pWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);
    where = lastSync
      ? syncType == syncTypes.created
        ? `AND DTCAD >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DTCAD <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
        : `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
      : ` `;
  }

  return {
    requestBody: {
      sql: `SELECT * FROM AD_VWTBCFLEXPROP WHERE CGC_CPF IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyVehicles = (syncType, lastSync, vWhere = null) => {
  let where;

  if (vWhere) {
    where = `AND PLACACAVALO = '${vWhere}'`;
  } else {
    let data_fim = getDataFim(lastSync);
    where = lastSync
      ? syncType == syncTypes.created
        ? `AND DHINC >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DHINC <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
        : `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
      : ` `;
  }
  return {
    requestBody: {
      sql: `SELECT * FROM AD_VWTBCFLEXVEI WHERE PLACACAVALO IS NOT NULL ${where}`,
    },
  };
};
export const requestBodyTravels = (syncType, lastSync, pWhere = null) => {
  let data_fim = getDataFim(lastSync);
  const where = lastSync
    ? syncType == syncTypes.created
      ? `AND DTEMISSAO >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DTEMISSAO <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
      : `AND DATAFLEX >= TO_DATE('${lastSync.toLocaleDateString()}', 'dd/mm/yyyy') AND DATAFLEX <= TO_DATE('${data_fim.toLocaleDateString()}', 'dd/mm/yyyy')`
    : ` `;

  return {
    requestBody: {
      // sql: `SELECT * FROM AD_VWTBCFLEXCTE WHERE MOTCPF = '51038080134' order by DTEMISSAO desc`,
      sql: `SELECT * FROM AD_VWTBCFLEXCTE WHERE DATAFLEX is not null and DTEMISSAO is not null and NUVIAGEM > 0 ${where}`,
    },
  };
};
